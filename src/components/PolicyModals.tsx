import React from 'react';
import { X, HelpCircle, Truck, CreditCard, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  type: 'faq' | 'envios' | 'pagos' | 'privacidad' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            {type === 'faq' && <HelpCircle className="w-5 h-5 text-rose-600" />}
            {type === 'envios' && <Truck className="w-5 h-5 text-amber-600" />}
            {type === 'pagos' && <CreditCard className="w-5 h-5 text-emerald-600" />}
            {type === 'privacidad' && <ShieldCheck className="w-5 h-5 text-indigo-600" />}
            <h3 className="text-lg font-bold text-stone-900">
              {type === 'faq' && 'Preguntas Frecuentes (FAQ)'}
              {type === 'envios' && 'Políticas de Entrega y Envíos'}
              {type === 'pagos' && 'Instrucciones de Pagos en Colombia'}
              {type === 'privacidad' && 'Términos de Compra y Privacidad'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on type */}
        <div className="space-y-4 text-xs text-stone-600 leading-relaxed">
          {type === 'faq' && (
            <>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">¿Con cuánta anticipación debo hacer mi pedido?</h4>
                <p>Recomendamos solicitar tu ancheta con al menos 24 horas de anticipación. Para entregas el mismo día, comunícate a nuestra línea de WhatsApp para verificar disponibilidad inmediata de taller.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">¿Puedo cambiar algún producto de la ancheta?</h4>
                <p>¡Por supuesto! En la sección "Arma tu Ancheta" puedes agregar, quitar o cambiar la cantidad de cada producto con cálculo en tiempo real.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">¿La tarjeta con dedicatoria tiene costo adicional?</h4>
                <p>No, todas nuestras anchetas personalizadas incluyen tarjeta caligrafiada o impresa con el mensaje y nombres que nos proporciones sin costo adicional.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">¿Hacen anchetas para empresas o pedidos al por mayor?</h4>
                <p>Sí, contamos con precios corporativos y empaques con el logo de tu compañía. Usa el botón "Cotizar ancheta corporativa" en el configurador o escríbenos a WhatsApp.</p>
              </div>
            </>
          )}

          {type === 'envios' && (
            <>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Cobertura y Ciudades</h4>
                <p>Realizamos entregas directas y programadas en Bogotá D.C., Medellín, Cali, Barranquilla, Bucaramanga y municipios aledaños. Para otras regiones de Colombia enviamos mediante transportadora nacional.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Horarios de Entrega</h4>
                <p>Las entregas se realizan de lunes a sábado entre las 8:00 a.m. y las 6:30 p.m., y domingos y festivos previa coordinación.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Protocolo si el destinatario no se encuentra</h4>
                <p>El mensajero se comunicará al número suministrado. En caso de conjuntos cerrados con portería, el paquete puede ser entregado a la vigilancia previa autorización del cliente.</p>
              </div>
            </>
          )}

          {type === 'pagos' && (
            <>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Pagos vía Bancolombia</h4>
                <p>Puedes pagar mediante transferencia directa a nuestra cuenta de ahorros o a través del botón oficial de Bancolombia. Guarda el número de comprobante o pantallazo para registrarlo en el sistema o enviarlo por WhatsApp.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Pagos vía Nequi</h4>
                <p>Envía dinero a nuestro número Nequi oficial registrado en la pantalla de pago. La confirmación es instantánea tras validar el número de referencia.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Pago Contra Entrega</h4>
                <p>Habilitado para zonas urbanas de cobertura directa. Se solicita un anticipo de $15.000 COP para apartado de ancheta y el excedente se liquida al recibir el regalo.</p>
              </div>
            </>
          )}

          {type === 'privacidad' && (
            <>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Tratamiento de Datos Personales (Ley 1581 de 2012)</h4>
                <p>Sorpresas con S garantiza que tus datos personales (nombre, teléfono, dirección y dedicatorias) serán tratados con estricta confidencialidad exclusivamente para coordinar el armado y entrega de tu pedido.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">Garantía de Satisfacción</h4>
                <p>Todos nuestros productos comestibles cuentan con registro sanitario y fechas de vencimiento vigentes. Si alguna ancheta sufre algún percance durante el transporte, la reponemos de inmediato.</p>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
