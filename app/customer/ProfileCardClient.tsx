'use client';

import { useState } from 'react';
import { updateProfileAction } from '../actions/profile';

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  area?: string;
};

export default function ProfileCardClient({ profile, fallbackEmail }: { profile: Profile | null, fallbackEmail?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    pincode: profile?.pincode || '',
    area: profile?.area || '',
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

  return (
    <>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Account Details</h3>
        <p className="text-sm text-slate-900 font-medium mb-1">{profile?.email || fallbackEmail || 'Loading...'}</p>
        <p className="text-sm text-slate-500 font-light mb-auto">
          {profile?.address ? `${profile.address}, ${profile.city}` : 'No address on file'}
        </p>
        
        <div className="mt-6 pt-6 border-t border-slate-50 w-full">
           <button 
             onClick={() => setIsEditing(true)}
             className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
           >
             Edit Profile details
           </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
              Edit Profile
            </h3>
            <p className="text-slate-500 font-light text-sm mb-8 leading-relaxed">
              Update your personal and delivery information.
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

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Flat No, Building, Street"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Area
                  </label>
                  <input 
                    type="text" 
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Downtown"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    City
                  </label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Metropolis"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all font-medium placeholder-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Pincode
                </label>
                <input 
                  type="text" 
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
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
    </>
  );
}
