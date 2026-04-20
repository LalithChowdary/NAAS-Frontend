'use client';

import { useState } from 'react';
import { updateProfileAction, deactivateAccountAction } from '../actions/profile';
import { useRouter } from 'next/navigation';

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function ProfileCardClient({ profile, fallbackEmail }: { profile: Profile | null, fallbackEmail?: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await updateProfileAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setIsEditing(false);
      setLoading(false);
    }
  };

  const handleDisableAccount = async () => {
    setDisabling(true);
    const res = await deactivateAccountAction();
    if (res?.error) {
      setError(res.error);
      setDisabling(false);
      setShowDisableConfirm(false);
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start h-full">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Account Details</h3>
        <p className="text-sm text-slate-900 font-medium mb-1">{profile?.name || fallbackEmail || 'Loading...'}</p>
        <p className="text-sm text-slate-500 font-light mb-auto">
          {profile?.phone || 'No phone number added'}
        </p>
        
        <div className="mt-6 pt-6 border-t border-slate-50 w-full flex items-center justify-between">
           <button 
             onClick={() => setIsEditing(true)}
             className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
           >
             Edit Profile details
           </button>
           <button
             onClick={() => setShowDisableConfirm(true)}
             className="text-sm font-medium text-rose-400 hover:text-rose-600 transition-colors"
           >
             Disable Account
           </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative">
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
              Edit Profile
            </h3>
            <p className="text-slate-500 font-light text-sm mb-8 leading-relaxed">
              Update your personal contact information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium mb-6">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9999999999"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
                />
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-6 py-3 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-full text-sm font-medium bg-slate-900 text-white hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">Disable Account?</h3>
            <p className="text-slate-500 font-light text-sm mb-8 leading-relaxed">
              Your account will be deactivated and you'll be logged out immediately. Contact support to re-enable it.
            </p>
            {error && <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDisableConfirm(false)}
                disabled={disabling}
                className="px-6 py-3 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableAccount}
                disabled={disabling}
                className="px-8 py-3 rounded-full text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {disabling ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-rose-300 border-t-white animate-spin"></div> Disabling...</>
                ) : 'Yes, Disable My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
