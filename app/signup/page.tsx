'use client';

import { useActionState, useState } from 'react';
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

// Indian mobile phone regex
const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, { error: null });
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (value: string) => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!INDIAN_PHONE_RE.test(value)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
      
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">Join us</h1>
          <p className="text-sm font-light text-slate-500">Sign up to manage your daily subscriptions easily.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5" onSubmit={(e) => {
          // Run phone validation before submit; if invalid, prevent
          if (!validatePhone(phone)) {
            e.preventDefault();
          }
        }}>
          
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
            <label className="text-xs font-medium pl-1" htmlFor="password">Password</label>
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

          {/* Phone — required, Indian format */}
          <div className="flex flex-col gap-1.5 text-slate-500 transition-colors" style={{ color: phoneError ? '#ef4444' : undefined }}>
            <label className="text-xs font-medium pl-1" htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(Indian mobile)</span>
            </label>
            <input 
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) validatePhone(e.target.value);
              }}
              onBlur={(e) => validatePhone(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:bg-white focus:ring-4 transition-all text-sm text-slate-900 ${
                phoneError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-100/50 focus:border-slate-300 focus:ring-slate-100'
              }`}
              placeholder="9876543210"
            />
            {phoneError && (
              <p className="text-xs text-red-500 pl-1 mt-0.5">{phoneError}</p>
            )}
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
