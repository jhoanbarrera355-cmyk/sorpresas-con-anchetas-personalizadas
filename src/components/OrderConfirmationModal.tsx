import React, { useState } from 'react';
import {
  CheckCircle,
  Copy,
  MessageCircle,
  PackageCheck,
  Calendar,
  MapPin,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { Order, formatCOP } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder
}) => {
  const { settings } = useCart();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const businessName = settings?.businessName || 'Anchetas Personalizables';
  const whatsappNumber = settings?.whatsappNumber || '573143133440';

  const orderSummaryText = `¡Hola ${businessName}! Acabo de realizar el pedido ${order.orderNumber} en su tienda web.
Cliente: ${order.customerName}
Destinatario: ${order.recipientName}
Dirección: ${order.deliveryAddress}, ${order.city}
Fecha de entrega: ${order.deliveryDate}
Total: ${formatCOP(order.total)}
Método de Pago: ${order.paymentMethod.toUpperCase()}
Por favor indíquenme para confirmar el pago y la preparación. ¡Muchas gracias!`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(orderSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderSummaryText)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-scale-in space-y-6">
        
        {/* Top Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            ¡Pedido Registrado con Éxito!
          </h2>
          <p className="text-xs text-stone-500">
            Hemos recibido los detalles de tu ancheta y ya está en nuestro sistema.
          </p>
        </div>

        {/* Highlighted Order Code Banner */}
        <div className="p-4 rounded-2xl bg-stone-900 text-white text-center space-y-1">
          <span className="text-[11px] text-stone-400 uppercase tracking-widest font-semibold block">
            Número Único de Pedido
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider block">
            {order.orderNumber}
          </span>
          <span className="text-[11px] text-stone-300 block">
            Guarda este número para consultar el estado en cualquier momento
          </span>
        </div>

        {/* Order Quick Summary */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-500">Destinatario:</span>
            <span className="font-bold text-stone-800">{order.recipientName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-500">Fecha de Entrega:</span>
            <span className="font-bold text-stone-800">{order.deliveryDate}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-500">Dirección:</span>
            <span className="font-semibold text-stone-800">{order.deliveryAddress}, {order.city}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-stone-200/60">
            <span className="text-stone-500">Método de Pago:</span>
            <span className="font-bold text-stone-800 uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm font-bold text-stone-900">
            <span>Total a Pagar:</span>
            <span className="text-rose-600 font-mono">{formatCOP(order.total)}</span>
          </div>
        </div>

        {/* Payment reminder callout */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <p className="font-bold">Estado actual: Pendiente de Confirmación / Pago</p>
          <p className="text-[11px] leading-relaxed">
            Si realizaste transferencia por Bancolombia o Nequi, por favor envíanos el comprobante por WhatsApp para iniciar la preparación de tu ancheta de inmediato.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          
          {/* WhatsApp Direct Action */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Comprobante por WhatsApp</span>
          </a>

          {/* Copy Order Summary Button */}
          <button
            onClick={handleCopySummary}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Resumen Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span>Copiar Resumen del Pedido</span>
              </>
            )}
          </button>

          {/* Track order CTA */}
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-xs font-semibold underline flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-4 h-4 text-rose-600" />
            <span>Ver Seguimiento en Tiempo Real del Pedido</span>
          </button>

        </div>

      </div>
    </div>
  );
};
