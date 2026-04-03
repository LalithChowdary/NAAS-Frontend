"use client";

import { useEffect, useState } from "react";
import { fetchTodayDeliveries, dpLogout } from "./actions";
import { Loader2, UserCircle, MapPin, Package, LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeliveryItem {
  subscriptionId: number;
  customerId: number;
  customerName: string;
  address: string;
  publicationName: string;
  deliveryStatus: string;
  assignedTo: string;
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
        setDeliveries(Array.isArray(data) ? data : []);
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

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-20">
      
      <DeliveryHeader title={`Today's Deliveries — ${todayStr}`} />

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        
        {/* Stats Row */}
        {!loading && !error && deliveries.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-[#EFEFEF] flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                 <Package className="h-5 w-5" strokeWidth={1.5} />
               </div>
               <div>
                 <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Assigned</p>
                 <p className="text-xl font-medium text-gray-900 leading-none mt-1">{deliveries.length}</p>
               </div>
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
                  className="bg-white border border-[#EFEFEF] rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 leading-tight">
                        {delivery.customerName || `Customer #${delivery.customerId}`}
                      </h3>
                      <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" strokeWidth={1.5} />
                        <span className="leading-snug">{delivery.address || "No address provided"}</span>
                      </div>
                    </div>
                    {/* Placeholder for status checkbox in future */}
                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 flex-shrink-0"></div>
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
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
