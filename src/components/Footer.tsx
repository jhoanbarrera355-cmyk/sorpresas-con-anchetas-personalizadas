import React from 'react';
import { MessageCircle, MapPin, Mail, Phone, CreditCard, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface FooterProps {
  onOpenPolicy: (type: 'faq' | 'envios' | 'pagos' | 'privacidad') => void;
  onOpenAuth: () => void;
  onNavigateToBuilder: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onOpenAuth, onNavigateToBuilder }) => {
  const { settings } = useCart();
  const whatsappNumber = settings?.whatsappNumber || '573143133440';

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xl font-bold text-white tracking-wider uppercase"
                    style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                  >
                    ANCHETAS <span className="text-amber-400">PERSONALIZABLES</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black text-amber-400 font-serif font-black text-[10px] tracking-wider border border-amber-400/40">
                    AP
                  </span>
                </div>
                <span className="text-xs text-amber-300 font-medium italic mt-0.5">
                  “Detalles con amor, regalos que llegan al corazón.”
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Elegancia, calidad y amor familiar. Con nuestros colores negro y dorado transmitimos distinción, acompañados de anchetas llenas de dulces, productos salados y ositos de peluche para celebrar momentos inolvidables.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hola%20Anchetas%20Personalizables,%20quisiera%20informaci%C3%B3n%20sobre%20anchetas`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Atención WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explorar</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={onNavigateToBuilder} className="hover:text-rose-400 transition-colors text-left">
                  Arma tu ancheta personalizada
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('envios')} className="hover:text-rose-400 transition-colors text-left">
                  Tiempos y cobertura de entrega
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('pagos')} className="hover:text-rose-400 transition-colors text-left">
                  Pagos con Bancolombia y Nequi
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('faq')} className="hover:text-rose-400 transition-colors text-left">
                  Preguntas frecuentes (FAQ)
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-rose-400 transition-colors text-left">
                  Acceso clientes y administración
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods in Colombia */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Métodos de Pago en Colombia</h4>
            <p className="text-xs text-stone-400">
              Aceptamos pagos directos y seguros para verificar tu pedido de inmediato:
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-800/80 border border-stone-700/60">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-semibold text-white">Bancolombia</span>
                <span className="text-stone-400">· Transferencia o QR</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-800/80 border border-stone-700/60">
                <div className="w-2 h-2 rounded-full bg-fuchsia-400"></div>
                <span className="font-semibold text-white">Nequi</span>
                <span className="text-stone-400">· Envío inmediato</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-800/80 border border-stone-700/60">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-300">Pago Contra Entrega disponible</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Contacto & Taller</h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Cra 32 # 19A - 20'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Línea / WhatsApp: {whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{settings?.email || 'jhoanbarrera355@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2.5 pt-2 text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Compras respaldadas con verificación real</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Anchetas Personalizables · Todos los derechos reservados. Hecho con <Heart className="w-3 h-3 inline text-rose-500 mx-0.5 fill-rose-500" /> en Colombia.</p>
          <div className="flex items-center gap-5">
            <button onClick={() => onOpenPolicy('privacidad')} className="hover:text-stone-300 transition-colors">
              Política de Privacidad
            </button>
            <span>·</span>
            <button onClick={() => onOpenPolicy('envios')} className="hover:text-stone-300 transition-colors">
              Políticas de Entrega
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
