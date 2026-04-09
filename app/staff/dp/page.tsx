"use client";

import { useEffect, useState } from "react";
import { fetchTodayDeliveries, dpLogout, updateDeliveryStatusAction } from "./actions";
import { Loader2, UserCircle, MapPin, Package, LogOut, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeliveryItem {
  subscriptionId: number;
  customerId: number;
  customerName: string;
  address: string;
  publicationName: string;
  deliveryStatus: string;
  assignedTo: string;
  routeSequence?: number;
  hubName?: string;
  hubLat?: number;
  hubLng?: number;
  latitude?: number;
  longitude?: number;
}

import DeliveryHeader from "./components/DeliveryHeader";

export default function DeliveryDashboard() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        setLoading(true);
        const data = await fetchTodayDeliveries();
        let deliveriesArr = Array.isArray(data) ? data : [];
        deliveriesArr.sort((a, b) => (a.routeSequence || 0) - (b.routeSequence || 0));
        setDeliveries(deliveriesArr);
      } catch (err: any) {
        setError("Failed to load today's deliveries.");
      } finally {
        setLoading(false);
      }
    };
    loadDeliveries();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const generateGoogleMapsUrl = () => {
    const stops = deliveries.filter((d) => d.latitude && d.longitude);
    if (!deliveries || deliveries.length === 0 || stops.length === 0) return "#";
    
    const originLat = deliveries[0].hubLat;
    const originLng = deliveries[0].hubLng;
    if (!originLat || !originLng) return "#";

    const waypoints = stops.slice(0, stops.length - 1).map(d => `${d.latitude},${d.longitude}`).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}`;
    url += `&destination=${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;
    if (waypoints.length > 0) {
      url += `&waypoints=${waypoints}`;
    }
    return url;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusUpdate = async (subscriptionId: number, status: string) => {
    try {
      await updateDeliveryStatusAction(subscriptionId.toString(), status);
      // Optimistically update local UI state immediately 
      setDeliveries((prev) => 
        prev.map(d => d.subscriptionId === subscriptionId ? { ...d, deliveryStatus: status } : d)
      );
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-20 print:bg-white print:pb-0">
      
      <DeliveryHeader title={`Today's Deliveries — ${todayStr}`} />

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        
        {/* Stats Row */}
        {!loading && !error && deliveries.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-[#EFEFEF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] print:border-black print:shadow-none">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center print:border print:border-black">
                 <Package className="h-6 w-6" strokeWidth={1.5} />
               </div>
               <div>
                 <p className="text-xs text-gray-400 tracking-wider font-bold">STARTING HUB</p>
                 <p className="text-lg font-medium tracking-tight text-gray-900 mt-0.5">
                   {deliveries[0]?.hubName || "Standard Collection"}
                 </p>
               </div>
             </div>

             <div className="flex h-full gap-2 items-center print:hidden">
                <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-full flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                  Print Schedule
                </button>
                <a href={generateGoogleMapsUrl()} target="_blank" rel="noreferrer" className="px-5 py-2 text-sm font-medium text-white border border-transparent bg-black hover:bg-gray-800 rounded-full flex items-center gap-2 transition-colors shadow-sm">
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                  View Route on Maps
                </a>
             </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm border border-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="h-8 w-8 animate-spin mb-4" strokeWidth={1.5} />
             <p className="text-sm">Loading today's route...</p>
          </div>
        ) : !loading && deliveries.length === 0 ? (
          <div className="bg-white border text-center border-[#EFEFEF] rounded-3xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Package className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No deliveries today</h3>
             <p className="text-sm text-gray-400 mt-2 max-w-xs">You have no assigned deliveries for {todayStr}. Take a break!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {deliveries.map((delivery, index) => {
              // publicationName could be comma separated
              const pubs = delivery.publicationName 
                ? delivery.publicationName.split(',').map(p => p.trim()).filter(Boolean)
                : [];
              
              return (
                <div 
                  key={`${delivery.subscriptionId}-${index}`} 
                  className="bg-white border flex flex-col sm:flex-row gap-4 border-[#EFEFEF] rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] print:border-b print:rounded-none print:shadow-none"
                >
                  <div className="flex sm:flex-col items-center sm:w-16 flex-shrink-0 pt-1">
                     <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold print:border print:border-black">
                       {delivery.routeSequence || index + 1}
                     </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 leading-tight">
                          {delivery.customerName || `Customer #${delivery.customerId}`}
                        </h3>
                        <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-500 max-w-lg">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" strokeWidth={1.5} />
                          <span className="leading-snug">{delivery.address || "No address provided"}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center flex-shrink-0 print:hidden">
                        {delivery.deliveryStatus === 'PENDING' ? (
                          <>
                            <button onClick={() => handleStatusUpdate(delivery.subscriptionId, 'DELIVERED')} className="p-1.5 rounded-full hover:bg-green-50 text-gray-300 hover:text-green-600 transition-colors" title="Mark Delivered">
                              <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
                            </button>
                            <button onClick={() => handleStatusUpdate(delivery.subscriptionId, 'CANCELLED')} className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Mark Not Delivered">
                              <XCircle className="w-7 h-7" strokeWidth={1.5} />
                            </button>
                          </>
                        ) : delivery.deliveryStatus === 'DELIVERED' ? (
                           <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                             <CheckCircle2 className="w-4 h-4" /> Delivered
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                             <XCircle className="w-4 h-4" /> Failed
                           </span>
                        )}
                      </div>
                    </div>

                  <div className="bg-[#FBFBFD] rounded-2xl p-4 border border-[#EFEFEF]">
                     <div className="flex items-center gap-1.5 mb-2.5 px-0.5">
                       <FileText className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publications</span>
                     </div>
                     
                      <div className="space-y-1.5">
                        {pubs.length > 0 ? (
                          pubs.map((pub, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900 font-medium">{pub}</span>
                              <span className="text-gray-400">x1</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">No publications listed</p>
                        )}
                      </div>
                   </div>
                 </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
