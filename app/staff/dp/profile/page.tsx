"use client";

// Replaced large block with inline states and Modal UI
import { useEffect, useState } from "react";
import { fetchDpProfile, dpLogout, updateDpProfile, fetchDpHistory } from "../actions";
import DeliveryHeader from "../components/DeliveryHeader";
import { Loader2, ArrowRight, User, MapPin, Mail, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface DeliveryPersonProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  payoutDetails: string;
}

export default function DeliveryProfilePage() {
  const [profile, setProfile] = useState<DeliveryPersonProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [data, historyData] = await Promise.all([
          fetchDpProfile(),
          fetchDpHistory().catch(() => [])
        ]);
        setProfile(data);
        setHistory(historyData);
        setEditForm({ name: data.name, phone: data.phone || "" });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      const updated = await updateDpProfile({ name: editForm.name, phone: editForm.phone });
      setProfile(updated);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const currentMonthHistory = history.filter((d: any) => {
    if (d.status !== 'DELIVERED') return false;
    const dDate = new Date(d.deliveryDate);
    const now = new Date();
    return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
  });
  const monthEarnings = currentMonthHistory.reduce((sum: number, d: any) => sum + (d.payout || 0), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-20">
      
      <DeliveryHeader title="Profile & Dashboard" />

      <main className="w-full px-6 lg:px-12 py-10 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
             <Loader2 className="h-8 w-8 animate-spin mb-4" strokeWidth={1.5} />
             <p className="text-sm">Loading your dashboard...</p>
          </div>
        ) : error || !profile ? (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm border border-rose-100 max-w-3xl mx-auto">
            {error || "Profile not found"}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto relative z-0">
            
            {/* Top Section */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
                Welcome back, {profile.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-slate-500">
                Manage your deliveries, track earnings, and update your profile.
              </p>
            </div>

            {/* Cards Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               
               {/* Left Column */}
               <div className="space-y-6">
                 
                 {/* 1. Payout Card */}
                 <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] group hover:shadow-[0_4px_32px_rgb(0,0,0,0.04)] transition-shadow">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">This Month Earnings</h2>
                    <div className="flex flex-col gap-2">
                       <span className="text-5xl font-medium tracking-tighter text-slate-900">₹{monthEarnings}</span>
                       <span className="text-sm text-slate-500 flex items-center gap-2">
                         Calculated from completed deliveries
                         <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                       </span>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex gap-6">
                         <div>
                           <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Deliveries</p>
                           <p className="text-sm font-medium text-slate-900">{currentMonthHistory.length} Total</p>
                         </div>
                         <div>
                           <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Commission</p>
                           <p className="text-sm font-medium text-slate-900">2.5% of value</p>
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* 3. Profile Details Card */}
                 <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] relative">
                    <div className="flex items-start justify-between mb-8">
                       <div className="flex items-center gap-3">
                         <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Profile Details</h2>
                         <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold tracking-widest uppercase">
                           Active
                         </span>
                       </div>
                       <button 
                         onClick={() => {
                           setEditForm({ name: profile.name, phone: profile.phone || "" });
                           setIsEditModalOpen(true);
                         }}
                         className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white active:scale-95 z-10"
                       >
                         Edit
                       </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 relative z-10">
                          <User className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div className="relative z-10">
                          <p className="text-xs text-slate-500 mb-0.5">Full Legal Name</p>
                          <p className="text-sm font-medium text-slate-900">{profile.name}</p>
                          <p className="text-xs text-slate-400 mt-1">ID: {profile.employeeId || `DP-${profile.id}`}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 relative z-10">
                          <Mail className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div className="relative z-10">
                          <p className="text-xs text-slate-500 mb-0.5">Contact Information</p>
                          <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                          <p className="text-xs text-slate-500 mt-1">{profile.phone || "No phone added"}</p>
                        </div>
                      </div>
                    </div>
                 </div>

               </div>

               {/* Right Column */}
               <div className="space-y-6 md:mt-[4rem]">
                 
                 {/* 2. Recent Activity Card */}
                 <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)] min-h-[300px] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
                      <Link href="/staff/dp/history" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group">
                        See full delivery history <ArrowRight className="h-3 w-3 opacity-70 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                      </Link>
                    </div>
                    
                    {history.length > 0 ? (
                      <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar max-h-[250px]">
                        {history.slice(0, 5).map((delivery: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{delivery.customerName || "Customer"}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">{delivery.customerAddress}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(delivery.deliveryDate).toLocaleDateString()} • {delivery.publications}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                delivery.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 
                                delivery.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {delivery.status}
                              </span>
                              <span className="text-slate-600 font-semibold text-xs mt-1">
                                +₹{delivery.payout?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-10 relative z-10">
                         <FileText className="h-8 w-8 text-slate-300 mb-4" strokeWidth={1} />
                         <p className="text-sm font-medium text-slate-900">No recent deliveries</p>
                         <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Historical delivery records will appear here as you complete your daily routes.</p>
                      </div>
                    )}

                    {/* Faint background decoration */}
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>
                 </div>

                 <Link 
                   href="/staff/dp/payout"
                   className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-black transition-colors active:scale-[0.98] relative z-10"
                 >
                   <div>
                     <p className="font-medium">View Full Earnings Report</p>
                     <p className="text-xs text-slate-400 mt-1 opacity-80">Detailed history & tax documents</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                     <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                   </div>
                 </Link>

               </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && profile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-base font-semibold text-slate-900">Edit Profile Details</h3>
               <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <span className="sr-only">Close</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
               {saveError && (
                 <div className="mb-6 p-3 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100">
                   {saveError}
                 </div>
               )}

               <div className="space-y-5">
                 <div>
                   <label htmlFor="name" className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Full Legal Name</label>
                   <input
                     type="text"
                     id="name"
                     value={editForm.name}
                     onChange={e => setEditForm({...editForm, name: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                     required
                   />
                 </div>

                 <div>
                   <label htmlFor="phone" className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Phone Number</label>
                   <input
                     type="tel"
                     id="phone"
                     pattern="[0-9]{10}"
                     title="Please enter a valid 10 digit phone number"
                     value={editForm.phone}
                     onChange={e => setEditForm({...editForm, phone: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Employee ID</label>
                   <input
                     title="Core identifiers cannot be modified via user platform."
                     type="text"
                     value={`ID: ${profile.employeeId || 'System'}`}
                     disabled
                     className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                   />
                 </div>
               </div>

               <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
