"use client";

import { useActionState } from "react";
import { dpSignup } from "../actions";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const initialState = {
  error: null as string | null,
  success: false
};

export default function DeliverySignupPage() {
  const [state, formAction, isPending] = useActionState(dpSignup as any, initialState);
  
  if (state.success) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl z-0"></div>
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-10 relative z-10 text-center animate-in fade-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
           </div>
           <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Application Submitted!</h2>
           <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
             Our administration team is currently reviewing your account request. You will be able to log in once your profile is approved.
           </p>
           <Link 
             href="/staff/dp/login"
             className="inline-flex w-full items-center justify-center px-6 py-3.5 bg-slate-900 text-white font-medium rounded-full hover:bg-black transition-colors"
           >
             Return to login
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-100/50 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
           <h1 className="text-3xl font-bold tracking-tighter text-slate-900">NAAS.</h1>
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Apply as a Delivery Partner
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Join our delivery network today
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
        <div className="bg-white py-10 px-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 sm:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <form action={formAction} className="space-y-6">
            
            {state.error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-100 flex items-start gap-3">
                <div className="mt-0.5">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                {state.error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10 digit phone number"
                className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Preferred Zone (Area)</label>
              <input
                name="assignedArea"
                type="text"
                required
                className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm"
                placeholder="e.g. North District"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="block w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.99]"
            >
              {isPending ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" strokeWidth={2} />
              ) : null}
              {isPending ? 'Submitting Application...' : 'Apply Now'}
            </button>
            
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
             <Link href="/staff/dp/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group">
                <ArrowLeft className="h-4 w-4 mr-1.5 opacity-50 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
                Back to Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
