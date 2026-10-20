import React, { useState, useEffect } from 'react';
import {
  Search,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Gift,
  CreditCard,
  MessageCircle,
  Send,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import { Order, OrderStatus, formatCOP } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface OrderTrackerProps {
  initialOrderNumber?: string;
  onGoToCatalog: () => void;
}

const ORDER_STATUS_STEPS: Array<{
  key: OrderStatus;
  label: string;
  description: string;
}> = [
  { key: 'pendiente_confirmacion', label: '1. Pendiente Confirmación', description: 'Pedido recibido en el sistema' },
  { key: 'pendiente_pago', label: '2. Pendiente de Pago', description: 'Esperando soporte o verificación' },
  { key: 'pago_recibido', label: '3. Pago Recibido', description: 'Fondos verificados exitosamente' },
  { key: 'en_preparacion', label: '4. En Preparación', description: 'Armando la ancheta y moño en taller' },
  { key: 'listo_entrega', label: '5. Listo para Entregar', description: 'Empacado y listo para despacho' },
  { key: 'en_camino', label: '6. En Camino', description: 'Mensajero en ruta a la dirección' },
  { key: 'entregado', label: '7. Entregado', description: '¡Regalo entregado con una sonrisa!' }
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialOrderNumber, onGoToCatalog }) => {
  const { user, token } = useAuth();
  const { settings } = useCart();
  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer's order list if logged in
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);

  // Payment proof submission
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState<string | null>(null);

  // Load customer orders if logged in
  useEffect(() => {
    async function fetchMyOrders() {
      if (!user || !token) return;
      setLoadingMyOrders(true);
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setMyOrders(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMyOrders(false);
      }
    }
    fetchMyOrders();
  }, [user, token]);

  const searchOrder = async (numberToSearch: string) => {
    if (!numberToSearch.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setProofSuccess(null);

    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(numberToSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'No se encontró el pedido.');
        setCurrentOrder(null);
      } else {
        setCurrentOrder(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchInput(initialOrderNumber);
      searchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(searchInput);
  };

  const handleSendPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !paymentRefInput.trim()) return;
    setSubmittingProof(true);
    setProofSuccess(null);

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: paymentRefInput.trim(),
          notes: paymentNotesInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentOrder(data);
        setProofSuccess('¡Comprobante enviado a revisión! El equipo administrativo lo verificará en breve.');
        setPaymentRefInput('');
        setPaymentNotesInput('');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingProof(false);
    }
  };

  // Determine active step index
  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelado') return -1;
    return ORDER_STATUS_STEPS.findIndex(s => s.key === status);
  };

  const activeStepIdx = currentOrder ? getStepIndex(currentOrder.orderStatus) : 0;
  const whatsappNumber = settings?.whatsappNumber || '573143133440';

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Rastreo de Pedidos en Vivo
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm">
          Ingresa el número de tu pedido (Ej: <span className="font-mono text-stone-700 font-semibold">ANC-2026-1001</span>) para consultar el estado de preparación y despacho.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-4 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Número de pedido (ANC-...)"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Rastrear'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl max-w-md mx-auto text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tracked Order Details */}
      {currentOrder && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-fade-in space-y-8 p-6 sm:p-8">
          
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <span className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
                Estado del Pedido
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-mono">
                {currentOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Creado el {new Date(currentOrder.createdAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  currentOrder.orderStatus === 'entregado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentOrder.orderStatus === 'cancelado'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {currentOrder.orderStatus.replace('_', ' ')}
              </span>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Hola,%20quisiera%20consultar%20el%20estado%20de%20mi%20pedido%20${currentOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Consultar por WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Timeline of 8 States */}
          {currentOrder.orderStatus === 'cancelado' ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs">
              <h4 className="font-bold text-sm">Este pedido fue Cancelado</h4>
              <p className="text-[11px] mt-1">
                Comunícate a nuestra línea de WhatsApp si requieres soporte o una nueva solicitud.
              </p>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                Línea de Tiempo del Pedido
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {ORDER_STATUS_STEPS.map((step, idx) => {
                  const isPassed = activeStepIdx >= idx;
                  const isCurrent = activeStepIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                          : isPassed
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-stone-200 bg-stone-50/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-400">Paso {idx + 1}</span>
                        {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-rose-700' : 'text-stone-800'}`}>
                          {step.label.split('. ')[1]}
                        </p>
                        <p className="text-[10px] text-stone-500 mt-1 leading-snug">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Proof Form if pending */}
          {(currentOrder.orderStatus === 'pendiente_pago' || currentOrder.orderStatus === 'pendiente_confirmacion') && (
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>¿Ya transferiste por Bancolombia o Nequi? Registra tu comprobante</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Ingresa el número de comprobante o referencia de tu transacción para que podamos validarlo en el sistema:
              </p>

              {proofSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs rounded-lg font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{proofSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendPaymentProof} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Ej: Referencia BCOL-892147 / Pantallazo Nequi"
                  value={paymentRefInput}
                  onChange={e => setPaymentRefInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingProof ? 'Enviando...' : 'Registrar Comprobante'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Order Details & Items Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200 text-xs">
            
            {/* Delivery Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Información de Entrega
              </h4>
              <div className="p-4 bg-stone-50 rounded-2xl space-y-2 text-stone-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900">{currentOrder.recipientName}</p>
                    <p>{currentOrder.deliveryAddress}, {currentOrder.neighborhood}</p>
                    <p>{currentOrder.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200/60">
                  <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Fecha de entrega: <strong>{currentOrder.deliveryDate}</strong></span>
                </div>
                {currentOrder.cardMessage && (
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block font-semibold">Dedicatoria en la tarjeta:</span>
                    <p className="italic text-stone-700 mt-0.5 leading-relaxed">"{currentOrder.cardMessage}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary & Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Productos y Valores
              </h4>
              <div className="p-4 bg-stone-50 rounded-2xl space-y-2">
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-stone-200/60">
                      <span className="text-stone-800">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono font-semibold text-stone-900">
                        {formatCOP(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200/80 space-y-1 text-stone-500">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-stone-800">{formatCOP(currentOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span className="font-mono text-stone-800">{formatCOP(currentOrder.shippingCost)}</span>
                  </div>
                  {currentOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Descuento:</span>
                      <span className="font-mono">-{formatCOP(currentOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-stone-200 text-stone-900 font-bold text-sm">
                    <span>Total Pagado / A Pagar:</span>
                    <span className="font-mono text-rose-600 text-base">{formatCOP(currentOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Customer's Historical Orders if logged in */}
      {user && (
        <div className="pt-8 border-t border-stone-200 space-y-4">
          <h3 className="text-xl font-bold text-stone-900">Historial de Mis Pedidos</h3>
          {loadingMyOrders ? (
            <p className="text-xs text-stone-400">Cargando tus pedidos...</p>
          ) : myOrders.length === 0 ? (
            <div className="p-6 bg-stone-50 rounded-2xl border text-center text-xs text-stone-500">
              Aún no tienes pedidos registrados con esta cuenta.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOrders.map(ord => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setCurrentOrder(ord);
                    setSearchInput(ord.orderNumber);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-rose-400 hover:shadow-md cursor-pointer transition-all space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-stone-900">{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold capitalize text-[10px]">
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-stone-500">Para: <strong className="text-stone-800">{ord.recipientName}</strong></p>
                  <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                    <span className="text-stone-400">{ord.deliveryDate}</span>
                    <span className="font-mono font-bold text-rose-600">{formatCOP(ord.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
