"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Package, ChevronRight, Loader2, CreditCard, Ban } from "lucide-react";
import { fetchDeliveryPersonDetails, fetchDeliveryPersonHistory } from "../../../actions";

interface DeliveryPerson {
  id: number;
  name: string;
  phone: string;
  employeeId: string;
  user: {
    email: string;
    active: boolean;
  };
}

interface DeliveryRecord {
  id: number;
  customerId: number;
  deliveryDate: string;
  status: string;
  notes?: string;
}

export default function DeliveryPersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dpId = Number(params.id);
  
  const [person, setPerson] = useState<DeliveryPerson | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [personData, historyData] = await Promise.all([
        fetchDeliveryPersonDetails(dpId),
        fetchDeliveryPersonHistory(dpId)
      ]);
      setPerson(personData);
      setDeliveries(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError("Failed to load delivery personnel profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dpId) {
      loadData();
    }
  }, [dpId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">{error || "Personnel not found."}</p>
        <button onClick={() => router.back()} className="text-black hover:underline font-medium">Go back</button>
      </div>
    );
  }

  const isActive = person.user?.active;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span className="hover:text-gray-900 cursor-pointer" onClick={() => router.push('/staff/admin/delivery')}>Delivery Fleet</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900">Profile</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900 flex items-center gap-3">
            {person.name}
            <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
              isActive 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}>
              {isActive ? "Active" : "Disabled"}
            </span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="lg:col-span-1 border border-[#EFEFEF] bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-fit">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Contact & Details</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Employee ID</p>
                <p className="text-sm font-medium text-gray-900 truncate">{person.employeeId || `DP-${person.id}`}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium text-gray-900 truncate">{person.user?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{person.phone || "—"}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Deliveries Table */}
        <div className="lg:col-span-2 border border-[#EFEFEF] bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-5 border-b border-[#EFEFEF] flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Delivery History</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              {deliveries.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Customer Ref</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF]">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <Package className="h-6 w-6 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                      <p>No deliveries recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  deliveries.map((record) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-[#FBFBFD] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{new Date(record.deliveryDate).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Record #{record.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {record.customerId ? `CID-${record.customerId}` : "Direct"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                          record.status === 'DELIVERED' 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                            : record.status === 'PENDING'
                            ? "bg-amber-50 text-amber-600 border-amber-100/50"
                            : record.status === 'FAILED'
                            ? "bg-rose-50 text-rose-600 border-rose-100/50"
                            : "bg-gray-50 text-gray-500 border-gray-200/50"
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs truncate max-w-[150px]" title={record.notes}>
                        {record.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
