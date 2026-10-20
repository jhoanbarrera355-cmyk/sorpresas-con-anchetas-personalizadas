import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatCOP, Order } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, subtotal, shippingFee, discountAmount, total, appliedCoupon, settings, clearCart } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Bogotá D.C.');
  const [neighborhood, setNeighborhood] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [cardMessage, setCardMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bancolombia' | 'nequi' | 'transferencia' | 'contra_entrega'>('bancolombia');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Por favor completa todos los campos de contacto y dirección de entrega.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Tu carrito está vacío. Agrega productos o una ancheta antes de continuar.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: deliveryAddress.trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        recipientName: recipientName.trim() || customerName.trim(),
        deliveryDate,
        cardMessage: cardMessage.trim(),
        specialInstructions: specialInstructions.trim(),
        items,
        couponCode: appliedCoupon?.code,
        paymentMethod
      };

      const token = localStorage.getItem('anchetas_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Ocurrió un error al registrar el pedido.');
        setLoading(false);
        return;
      }

      clearCart();
      onClose();
      onOrderSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-scale-in">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Finalizar Pedido de Regalo</h2>
            <p className="text-xs text-stone-500">Completa los datos de entrega y selecciona tu método de pago</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-8">
          
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer & Delivery Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600" />
              <span>1. Datos de Contacto y Entrega</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tu Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carolina Gómez"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 315 777 8899"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="carolina@ejemplo.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nombre de quien Recibe el Regalo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Morales (Hermano)"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dirección Exacta de Entrega *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carrera 7 # 120-15 Apto 402, Torre B"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Bogotá D.C., Medellín, Cali..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Barrio o Sector *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Usaquén, Laureles, El Peñón..."
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Fecha Deseada de Entrega *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Instrucciones Especiales / Conjunto</label>
                <input
                  type="text"
                  placeholder="Ej: Dejar en portería con Don Pedro"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dedicatoria para la Tarjeta de Regalo</label>
                <textarea
                  rows={2}
                  placeholder="Escribe el mensaje cariñoso que imprimiremos en la tarjeta de felicitación..."
                  value={cardMessage}
                  onChange={e => setCardMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Methods in Colombia */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>2. Métodos de Pago Oficiales en Colombia</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Bancolombia */}
              <div
                onClick={() => setPaymentMethod('bancolombia')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'bancolombia'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="font-bold text-xs text-stone-900">Bancolombia</span>
                  </div>
                  {paymentMethod === 'bancolombia' && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Transferencia a Cuenta de {settings?.bancolombiaAccountType || 'Ahorros'} o enlace directo.
                </p>
              </div>

              {/* Nequi */}
              <div
                onClick={() => setPaymentMethod('nequi')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'nequi'
                    ? 'border-fuchsia-600 bg-fuchsia-50/40 ring-2 ring-fuchsia-600/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-fuchsia-600"></div>
                    <span className="font-bold text-xs text-stone-900">Nequi</span>
                  </div>
                  {paymentMethod === 'nequi' && (
                    <span className="text-[10px] bg-fuchsia-200 text-fuchsia-900 font-bold px-2 py-0.5 rounded-full">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Envío inmediato a celular Nequi {settings?.nequiNumber || '3123456789'}.
                </p>
              </div>

              {/* Transferencia Bancaria */}
              <div
                onClick={() => setPaymentMethod('transferencia')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-stone-900">Transferencia / Daviplata / PSE</span>
                  </div>
                  {paymentMethod === 'transferencia' && (
                    <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Pago mediante transferencia interbancaria o Daviplata.
                </p>
              </div>

              {/* Pago Contra Entrega */}
              {settings?.enableCashOnDelivery && (
                <div
                  onClick={() => setPaymentMethod('contra_entrega')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'contra_entrega'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-stone-900">Pago Contra Entrega</span>
                    </div>
                    {paymentMethod === 'contra_entrega' && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Cancela en efectivo o datáfono al recibir (perímetro urbano).
                  </p>
                </div>
              )}

            </div>

            {/* Payment Details Drawer based on selected method */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-3">
              {paymentMethod === 'bancolombia' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Datos Oficiales Bancolombia:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.bancolombiaAccount || '245-891023-45', 'Bancolombia')}
                      className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAccount === 'Bancolombia' ? '¡Copiado!' : 'Copiar Cuenta'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                    <p>Cuenta: <strong>{settings?.bancolombiaAccount || '245-891023-45'}</strong> ({settings?.bancolombiaAccountType || 'Ahorros'})</p>
                    <p>Titular: <strong>{settings?.bancolombiaHolder || 'Anchetas Personalizables (Jhoan Barrera)'}</strong></p>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    {settings?.bancolombiaInstructions || 'Realiza la transferencia desde tu App Bancolombia o Sucursal Virtual.'}
                  </p>
                  {settings?.bancolombiaLink && (
                    <div className="pt-1">
                      <a
                        href={settings.bancolombiaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Portal de Pagos Bancolombia</span>
                      </a>
                    </div>
                  )}
                </>
              )}

              {paymentMethod === 'nequi' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">Datos Oficiales Nequi:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings?.nequiNumber || '3143133440', 'Nequi')}
                      className="text-fuchsia-800 hover:text-fuchsia-950 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedAccount === 'Nequi' ? '¡Copiado!' : 'Copiar Celular'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                    <p>Número Nequi: <strong>{settings?.nequiNumber || '3143133440'}</strong></p>
                    <p>Titular: <strong>{settings?.nequiHolder || 'Anchetas Personalizables (Jhoan Barrera)'}</strong></p>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    {settings?.nequiInstructions || 'Envía dinero desde tu app Nequi. Tu pedido quedará en estado pendiente de verificación hasta confirmar el comprobante.'}
                  </p>
                  {settings?.nequiLink && (
                    <div className="pt-1">
                      <a
                        href={settings.nequiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Enlace Oficial Nequi</span>
                      </a>
                    </div>
                  )}
                </>
              )}

              {paymentMethod === 'transferencia' && (
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  Te enviaremos los datos de transferencia para Daviplata u otros bancos por WhatsApp al confirmar este pedido.
                </p>
              )}

              {paymentMethod === 'contra_entrega' && (
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  {settings?.cashOnDeliveryInstructions || 'Pagarás el valor de la ancheta al momento de la entrega en efectivo o tarjeta.'}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Summary & Order Confirmation Button */}
          <div className="p-4 bg-stone-100/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Subtotal Ancheta(s):</span>
              <span className="font-mono font-semibold">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Costo de Envío:</span>
              <span className="font-mono font-semibold">{formatCOP(shippingFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                <span>Descuento por Cupón:</span>
                <span className="font-mono">-{formatCOP(discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex items-baseline justify-between text-stone-900">
              <span className="font-bold text-sm">Total Definitivo:</span>
              <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                {formatCOP(total)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Generando Pedido...' : 'Confirmar Pedido Ahora'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
