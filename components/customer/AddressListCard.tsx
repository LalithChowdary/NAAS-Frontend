'use client';

import React, { useState } from 'react';
import AddressModal from './AddressModal';
import { useRouter } from 'next/navigation';

export type Address = {
  id: number;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  house?: string;
  area?: string;
  landmark?: string;
};

export default function AddressListCard({ addresses }: { addresses: Address[] }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start h-full">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Saved Addresses</h3>
        
        {addresses.length === 0 ? (
          <p className="text-sm text-slate-500 font-light mb-auto w-full text-center py-4 bg-slate-50 rounded-xl">
            No saved addresses yet
          </p>
        ) : (
          <div className="w-full space-y-3 mb-auto">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between group hover:border-slate-200 transition-colors">
                <div>
                  <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">{addr.label}</p>
                  <p className="text-xs text-slate-500 max-w-[200px] truncate">{addr.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-slate-50 w-full">
           <button 
             onClick={() => setShowModal(true)}
             className="text-sm font-medium text-slate-900 hover:text-black transition-colors flex items-center gap-2"
           >
             <span className="text-lg leading-none">+</span> Add New Address
           </button>
        </div>
      </div>

      {showModal && (
        <AddressModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            router.refresh();
          }} 
        />
      )}
    </>
  );
}
