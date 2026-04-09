'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, DeliveryFrequency, CartItem } from '@/components/cart/CartProvider';
import Link from 'next/link';
import { createSubscriptionAction } from '@/app/actions/subscription';
import { getAddressesAction } from '@/app/actions/address';
import AddressModal from '@/components/customer/AddressModal';

const WEEK_DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CartPage() {
  const { items, subscriptionSettings, removeFromCart, updateQuantity, updateSubscriptionSettings, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    async function loadAddresses() {
      const res = await getAddressesAction();
      if (res.data) {
        setAddresses(res.data);
        if (res.data.length > 0) {
          setSelectedAddressId(res.data[0].id);
        }
      }
    }
    loadAddresses();
  }, []);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!selectedAddressId) {
      setError('Please select a delivery address');
      setIsSubmitting(false);
      return;
    }

    const newspapers = items.filter(i => i.type === 'NEWSPAPER');
    const magazines = items.filter(i => i.type === 'MAGAZINE');

    const mappedItems: { publicationId: number; frequency?: string; customDeliveryDays?: string }[] = [];

    // Map newspapers with the global cart frequency settings
    newspapers.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        let mappedDays = undefined;
        if (subscriptionSettings.frequency === 'custom' && subscriptionSettings.customDays.length > 0) {
            mappedDays = subscriptionSettings.customDays.join(','); // e.g. "Monday,Wednesday"
        }
        
        mappedItems.push({
          publicationId: item.id,
          frequency: subscriptionSettings.frequency.toUpperCase().replace(/-/g, '_'), 
          customDeliveryDays: mappedDays
        });
      }
    });

    // Map magazines with NO frequency since they run on fixed schedules
    magazines.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        mappedItems.push({
          publicationId: item.id
        });
      }
    });

    const payload = {
      items: mappedItems,
      startDate: subscriptionSettings.startDate,
      addressId: selectedAddressId
    };

    const result = await createSubscriptionAction(payload as any);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      clearCart();
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/customer');
      }, 3000);
    }
  };

  const getNewspaperMultiplier = () => {
    switch (subscriptionSettings.frequency) {
      case 'daily': return 30; // approx 30 days/month
      case 'alternate': return 15; // 15 days/month
      case 'every-3-days': return 10; // 10 days/month
      case 'weekly': return 4; // 4 weeks/month
      case 'monthly': return 1; // 1 delivery/month
      case 'custom': return subscriptionSettings.customDays.length * 4; // weeks x days per week
      default: return 30;
    }
  };

  const getItemMonthlyPrice = (item: CartItem) => {
    const isNewspaper = item.type?.toLowerCase() !== 'magazine';
    const multiplier = isNewspaper ? getNewspaperMultiplier() : 1; // You can adjust magazine multiplier if they have fixed frequency
    return item.price * multiplier;
  };

  const total = items.reduce((sum, item) => sum + (getItemMonthlyPrice(item) * item.quantity), 0);

  const magazines = items.filter(item => item.type?.toLowerCase() === 'magazine');
  const newspapers = items.filter(item => item.type?.toLowerCase() !== 'magazine');

  const renderCartItem = (item: CartItem) => {
    const adjustedPrice = getItemMonthlyPrice(item);
    const isNewspaper = item.type?.toLowerCase() !== 'magazine';
    const hasDiscount = isNewspaper && adjustedPrice < item.price;
    
    return (
      <div key={item.id} className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100/50 transition-all">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-medium text-slate-900">{item.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                {item.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-900 font-medium">₹{adjustedPrice.toFixed(2)} <span className="text-slate-500 font-light">/ {item.type === 'NEWSPAPER' ? 'paper' : 'magazine'}</span></p>
              {hasDiscount && (
                <p className="text-xs text-slate-400 line-through">₹{item.price.toFixed(2)}</p>
              )}
            </div>
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-full px-1 border border-slate-100">
            <button 
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
            >
              -
            </button>
            <span className="w-4 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all"
            >
              +
            </button>
          </div>

          <div className="text-right w-20">
            <span className="font-semibold text-slate-900">₹{(adjustedPrice * item.quantity).toFixed(2)}</span>
          </div>

          <button 
            onClick={() => removeFromCart(item.id)}
            className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all ml-2"
            aria-label="Remove item"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-10 px-6">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 border border-emerald-100">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-[wiggle_0.5s_ease-in-out]">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">Subscription Confirmed</h2>
        <p className="text-slate-500 font-light text-center max-w-sm mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700">
          Your order has been successfully placed. We are preparing your dashboard...
        </p>
        <div className="flex items-center gap-3 text-xs font-medium text-emerald-600 tracking-widest uppercase animate-in fade-in duration-1000">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          Routing
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full max-w-4xl mx-auto px-6 py-24 flex flex-col">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Your Cart</h1>
      <p className="text-slate-500 font-light mb-12">Review your selections before subscribing.</p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] bg-slate-50 border border-slate-100">
          <svg className="w-12 h-12 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-medium text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 font-light mb-8">Looks like you haven't added any publications yet.</p>
          <Link 
            href="/#publications" 
            className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-black transition-all active:scale-[0.98] shadow-sm"
          >
            Browse Publications
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 flex flex-col gap-10">
            
            {/* Newspapers Section */}
            {newspapers.length > 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-medium text-slate-900">Newspapers</h3>
                  <p className="text-sm text-slate-500 font-light mt-1">Daily delivery available. Set your preferences below.</p>
                </div>
                <div className="flex flex-col gap-4">
                  {newspapers.map(renderCartItem)}
                </div>

                {/* Global Subscription Settings (Only really applies to newspapers) */}
                <div className="flex flex-col gap-6 p-8 rounded-2xl border border-slate-100 bg-slate-50/50 mt-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
                  <h3 className="text-sm font-medium text-slate-900 uppercase tracking-widest">Newspaper Delivery Preferences</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                    <div className="flex flex-col gap-2 flex-1">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Delivery Frequency</label>
                      <select 
                        value={subscriptionSettings.frequency}
                        onChange={(e) => updateSubscriptionSettings({ frequency: e.target.value as DeliveryFrequency })}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100/50"
                      >
                        <option value="daily">Daily</option>
                        <option value="alternate">Alternate Days</option>
                        <option value="every-3-days">Every 3 Days</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom Days</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Start Date</label>
                      <input 
                        type="date"
                        value={subscriptionSettings.startDate}
                        onChange={(e) => updateSubscriptionSettings({ startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]} // Can't start in the past
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100/50"
                      />
                    </div>
                  </div>

                  {/* Custom Days Selector (Only visible if frequency === 'custom') */}
                  {subscriptionSettings.frequency === 'custom' && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 block">Select Delivery Days</label>
                      <div className="flex flex-wrap gap-2">
                        {WEEK_DAYS.map((day, idx) => {
                          const fullDay = FULL_DAYS[idx];
                          const isSelected = subscriptionSettings.customDays.includes(fullDay);
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                const newDays = isSelected 
                                  ? subscriptionSettings.customDays.filter(d => d !== fullDay)
                                  : [...subscriptionSettings.customDays, fullDay];
                                updateSubscriptionSettings({ customDays: newDays });
                              }}
                              className={`w-12 h-12 rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                  ? 'bg-slate-900 text-white shadow-md' 
                                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Magazines Section */}
            {magazines.length > 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-medium text-slate-900">Magazines</h3>
                  <p className="text-sm text-slate-500 font-light mt-1">Delivered on the publisher's fixed schedule (e.g. Monthly / Weekly).</p>
                </div>
                <div className="flex flex-col gap-4">
                  {magazines.map(renderCartItem)}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Breakdown */}
          <div className="w-full lg:w-80 flex flex-col p-8 rounded-[2rem] bg-slate-50 border border-slate-100 h-fit">
            <h3 className="text-lg font-medium text-slate-900 mb-6">Summary</h3>
            
            <div className="flex justify-between items-center mb-4 text-sm font-light text-slate-500">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-sm font-light text-slate-500">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
            
            <div className="mb-6 pt-6 border-t border-slate-200/60">
              <label className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-3 block">
                Delivery Address
              </label>
              {addresses.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-100 p-3 rounded-xl mb-3">
                  No saved addresses found.
                </div>
              ) : (
                <select
                  value={selectedAddressId || ''}
                  onChange={e => setSelectedAddressId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100/50 mb-3"
                >
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label} - {addr.address.substring(0, 30)}{addr.address.length > 30 ? '...' : ''}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                + Add New Address
              </button>
            </div>
            
            <div className="border-t border-slate-200/60 pt-6 mb-8 flex justify-between items-center">
              <span className="font-medium text-slate-900">Total Monthly</span>
              <span className="text-xl font-semibold text-slate-900">₹{total.toFixed(2)}</span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              className={`w-full py-4 text-white rounded-full text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-slate-800 opacity-75 cursor-wait' : 'bg-slate-900 hover:bg-black active:scale-[0.98] shadow-slate-900/10'
              }`}
              onClick={handleCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </>
              ) : 'Confirm Subscription'}
            </button>
          </div>
        </div>
      )}

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onSuccess={async () => {
            setShowAddressModal(false);
            const res = await getAddressesAction();
            if (res.data) {
              setAddresses(res.data);
              if (res.data.length > 0 && !selectedAddressId) {
                setSelectedAddressId(res.data[0].id);
              }
            }
          }}
        />
      )}
    </div>
  );
}
