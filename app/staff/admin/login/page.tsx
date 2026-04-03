"use client";

import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200 ease-in-out group ${
        pending ? "bg-gray-800 opacity-70 cursor-not-allowed" : "bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
      }`}
    >
      {pending ? "Signing in..." : "Sign in"}
      {!pending && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />}
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useActionState(adminLogin, { error: null });

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-black selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-light tracking-tight text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-3 text-center text-sm text-gray-500">
          Sign in to manage the newspaper agency
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] sm:rounded-[2rem] sm:px-12 border border-gray-100">
          <form className="space-y-6" action={formAction}>
            
            {state?.error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl text-center border border-rose-100">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-all duration-200 outline-none hover:border-gray-300"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-all duration-200 outline-none hover:border-gray-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
