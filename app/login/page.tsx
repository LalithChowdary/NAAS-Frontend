'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '../actions/auth';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      data-testid="login-submit"
      className={`w-full py-3.5 px-4 bg-slate-900 text-white rounded-full text-sm font-medium tracking-wide transition-all ${
        pending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-black active:scale-[0.98]'
      }`}
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { error: null });

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
      
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Welcome back</h1>
          <p className="text-sm font-light text-slate-500">Enter your credentials to access your account.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          
          {state?.error && (
            <div data-testid="login-error-msg" className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5 focus-within:text-slate-900 text-slate-500 transition-colors">
            <label className="text-xs font-medium pl-1" htmlFor="email">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              autoComplete="email"
              required
              data-testid="login-email"
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
              autoComplete="current-password"
              required
              data-testid="login-password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100/50 rounded-2xl outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-sm text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <div className="mt-2">
            <SubmitButton />
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 font-light mt-8">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-slate-900 hover:underline transition-all">
            Create one
          </Link>
        </p>
      </div>

    </div>
  );
}
