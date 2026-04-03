"use client";

import { useActionState } from 'react';
import { dpLogin } from '../actions';
import { Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const initialState = {
  error: '',
};

export default function DeliveryLogin() {
  const [state, formAction, isPending] = useActionState(dpLogin, initialState);

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-medium tracking-tight text-gray-900">
          Delivery Personnel 
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to view today's assignments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-[#EFEFEF]">
          <form className="space-y-6" action={formAction}>
            {state?.error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm transition-shadow outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm transition-shadow outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
             <Link href="/staff/dp/signup" className="text-sm font-medium text-slate-900 hover:opacity-70 transition-opacity">
               Apply as a Delivery Partner
             </Link>
             <Link href="/login" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
               Not a delivery person? Go to Customer Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
