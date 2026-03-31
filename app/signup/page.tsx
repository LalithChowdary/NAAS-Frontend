'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signup } from '../actions/auth';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full py-3.5 px-4 bg-slate-900 text-white rounded-full text-sm font-medium tracking-wide transition-all ${
        pending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black active:scale-[0.98]'
      }`}
    >
      {pending ? 'Creating Account...' : 'Create Account'}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, { error: null });

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
      
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Join us</h1>
          <p className="text-sm font-light text-slate-500">Sign up to manage your daily subscriptions easily.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5 focus-within:text-slate-900 text-slate-500 transition-colors">
            <label className="text-xs font-medium pl-1" htmlFor="name">Full Name</label>
            <input 
              id="name"
              name="name"
              type="text" 
              autoComplete="name"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100/50 rounded-2xl outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-sm text-slate-900"
              placeholder="Jony Ive"
            />
          </div>

          <div className="flex flex-col gap-1.5 focus-within:text-slate-900 text-slate-500 transition-colors">
            <label className="text-xs font-medium pl-1" htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100/50 rounded-2xl outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-sm text-slate-900"
              placeholder="name@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 focus-within:text-slate-900 text-slate-500 transition-colors">
            <label className="text-xs font-medium pl-1 flex justify-between" htmlFor="password">
              <span>Password</span>
            </label>
            <input 
              id="password"
              name="password"
              type="password" 
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100/50 rounded-2xl outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-sm text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 font-light mt-8">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-slate-900 hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>

    </div>
  );
}
