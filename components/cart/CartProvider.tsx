'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type DeliveryFrequency = 'daily' | 'alternate' | 'every-3-days' | 'weekly' | 'monthly' | 'custom';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: string;
  frequency?: string;
}

export interface SubscriptionSettings {
  frequency: DeliveryFrequency;
  customDays: string[];
  startDate: string;
}

interface CartContextType {
  items: CartItem[];
  subscriptionSettings: SubscriptionSettings;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateSubscriptionSettings: (settings: Partial<SubscriptionSettings>) => void;
  clearCart: () => void;
  cartCount: number;
  jiggle: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [jiggle, setJiggle] = useState(false);

  // Initialize from exact backend restriction baseline
  const getInitialSettings = () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() + 8);
    const defaultDate = defaultStart.toISOString().split('T')[0];
    
    return {
      frequency: 'daily' as DeliveryFrequency,
      customDays: [],
      startDate: defaultDate,
    };
  };

  const [subscriptionSettings, setSubscriptionSettings] = useState<SubscriptionSettings>(getInitialSettings);

  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage immediately on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('naas_cart_items');
      const storedSettings = localStorage.getItem('naas_cart_settings');
      
      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedSettings) setSubscriptionSettings(JSON.parse(storedSettings));
    } catch (error) {
      console.warn('Failed to load cart from local storage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to local storage whenever items or settings change (only after initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('naas_cart_items', JSON.stringify(items));
      localStorage.setItem('naas_cart_settings', JSON.stringify(subscriptionSettings));
    }
  }, [items, subscriptionSettings, isInitialized]);

  const addToCart = useCallback((baseItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === baseItem.id);
      if (existing) {
        return prev.map((i) => 
          i.id === baseItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...baseItem, quantity: 1 }];
    });
    
    // Trigger jiggle animation
    setJiggle(true);
    setTimeout(() => setJiggle(false), 300);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems((prev) => prev.map((i) => 
      i.id === id ? { ...i, quantity } : i
    ));
  }, []);

  const updateSubscriptionSettings = useCallback((settings: Partial<SubscriptionSettings>) => {
    setSubscriptionSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSubscriptionSettings(getInitialSettings());
    localStorage.removeItem('naas_cart_items');
    localStorage.removeItem('naas_cart_settings');
  }, []);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, subscriptionSettings, addToCart, removeFromCart, updateQuantity, updateSubscriptionSettings, clearCart, cartCount, jiggle }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
