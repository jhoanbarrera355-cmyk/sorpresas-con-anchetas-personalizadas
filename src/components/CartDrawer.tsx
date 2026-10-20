import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, AlertCircle, Plus, Minus, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatCOP } from '../types.ts';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout, onExploreCatalog }) => {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    discountAmount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    const res = await applyCoupon(couponInput);
    setLoadingCoupon(false);
    if (res.success) {
      setCouponSuccess(res.message || 'Cupón aplicado');
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Error al validar cupón');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-stone-900">Tu Carrito de Regalos</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-800 text-base">Tu carrito está vacío</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Añade una ancheta personalizada con dulces o explora nuestro catálogo para comenzar.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onExploreCatalog();
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Ver Catálogo
                  </button>
                </div>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3"
                >
                  <div className="flex gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.isCustomAncheta && (
                        <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5">
                          <p>
                            Empaque: <span className="font-medium text-stone-700">{item.packaging}</span>
                          </p>
                          {item.recipientName && (
                            <p>
                              Para: <span className="font-medium text-stone-700">{item.recipientName}</span>
                            </p>
                          )}
                          {item.selectedProducts && item.selectedProducts.length > 0 && (
                            <details className="mt-1 text-[10px] text-stone-500 cursor-pointer">
                              <summary className="hover:text-rose-600 font-medium">
                                Ver {item.selectedProducts.length} productos incluidos
                              </summary>
                              <ul className="pl-2 pt-1 space-y-0.5 list-disc list-inside">
                                {item.selectedProducts.map((p, idx) => (
                                  <li key={idx}>
                                    {p.quantity}x {p.productName}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/60">
                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-xs text-stone-900">
                          {formatCOP(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-white space-y-4">
              
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Cupón <strong>{appliedCoupon.code}</strong> (-{formatCOP(appliedCoupon.discountAmount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código de cupón (Ej: BIENVENIDO10)"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      disabled={loadingCoupon}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {loadingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1">{couponSuccess}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-stone-100">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal productos:</span>
                  <span className="font-mono text-stone-900">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Envío a domicilio:</span>
                  <span className="font-mono text-stone-900">{formatCOP(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento aplicado:</span>
                    <span className="font-mono">-{formatCOP(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 pt-2 border-t border-stone-200 text-base font-bold">
                  <span>Total a Pagar:</span>
                  <span className="font-mono text-rose-600 font-black">{formatCOP(total)}</span>
                </div>
              </div>

              {/* Proceed to checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Continuar al Proceso de Compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
