import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderItem, BusinessSettings } from '../types.ts';

interface CartContextType {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountAmount: number; description: string } | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  settings: BusinessSettings | null;
  refreshSettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem('anchetas_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('anchetas_cart', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = settings?.deliveryFeeDefault || 12000;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal + (items.length > 0 ? shippingFee : 0) - discountAmount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (item: OrderItem) => {
    setItems(prev => {
      // If it's standard product, stack quantity
      if (!item.isCustomAncheta) {
        const existingIdx = prev.findIndex(i => !i.isCustomAncheta && i.name === item.name);
        if (existingIdx !== -1) {
          const updated = [...prev];
          const newQty = updated[existingIdx].quantity + item.quantity;
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: newQty,
            totalPrice: updated[existingIdx].unitPrice * newQty
          };
          return updated;
        }
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.id === itemId) {
          return {
            ...i,
            quantity,
            totalPrice: i.unitPrice * quantity
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('anchetas_cart');
  };

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return { success: false, message: 'Ingresa un código' };
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Cupón inválido' };
      }
      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        description: data.description
      });
      return { success: true, message: `¡Cupón aplicado! -$${data.discountAmount.toLocaleString('es-CO')} COP` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al validar cupón' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shippingFee,
        discountAmount,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        settings,
        refreshSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
