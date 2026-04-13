"use client";

import { useEffect, useState } from "react";
import { fetchPendingDeliveryRequests, approveDeliveryPerson, rejectDeliveryPerson } from "../../../actions";
import { Loader2, CheckCircle, XCircle, MapPin, Mail, Phone, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PendingRequestsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingDeliveryRequests();
      setPending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await approveDeliveryPerson(id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await rejectDeliveryPerson(id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" strokeWidth={1.5} />
        <p className="text-sm font-medium text-slate-500">Loading pending applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/staff/admin/delivery" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2 group">
             <ArrowLeft className="h-4 w-4 mr-1.5 opacity-50 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
             Back to Fleet
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tight text-gray-900">Pending Requests</h1>
            {pending.length > 0 && <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium">{pending.length} New</span>}
          </div>
          <p className="text-sm text-gray-500 mt-1">Review and approve applications for new delivery personnel.</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFEFEF] p-16 text-center flex flex-col items-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <Users className="h-10 w-10 text-slate-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-[280px]">When drivers submit an application, they will appear here for your review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl border border-[#EFEFEF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative overflow-hidden">
               
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{req.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {req.user?.email || "No email"}</p>
                  </div>
               </div>

               <div className="space-y-2 mb-8">
                 <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100">
                   <Phone className="w-4 h-4 text-gray-400 shrink-0" /> {req.phone}
                 </div>
               </div>

               <div className="flex gap-3">
                  <button 
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoading === req.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
                    Approve
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
