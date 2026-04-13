'use client';

import React, { useState, useEffect } from 'react';
import AddressModal from './AddressModal';
import { useRouter } from 'next/navigation';
import { deleteAddressAction } from '@/app/actions/address';

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
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const router = useRouter();

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const res = await deleteAddressAction(id.toString());
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete address');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('onboarding') === 'true') {
        setShowModal(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

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
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(addr)} className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-slate-50 w-full">
           <button 
             onClick={() => {
               setEditingAddress(null);
               setShowModal(true);
             }}
             className="text-sm font-medium text-slate-900 hover:text-black transition-colors flex items-center gap-2"
           >
             <span className="text-lg leading-none">+</span> Add New Address
           </button>
        </div>
      </div>

      {showModal && (
        <AddressModal 
          existingAddress={editingAddress}
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }} 
          onSuccess={() => {
            setShowModal(false);
            setEditingAddress(null);
            router.refresh();
          }} 
        />
      )}
    </>
  );
}
