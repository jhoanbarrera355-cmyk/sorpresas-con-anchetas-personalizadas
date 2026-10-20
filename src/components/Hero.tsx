import React from 'react';
import { Sparkles, Gift, ArrowRight, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onGoToBuilder: () => void;
  onGoToCatalog: () => void;
  onTrackOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGoToBuilder, onGoToCatalog, onTrackOrder }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-stone-50 to-white pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Split: Copy Left, High-Res Showcase Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Copy & Direct CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 text-amber-300 text-xs font-semibold tracking-wide border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Anchetas Personalizables (AP) · Marca Oficial</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.12] text-balance">
              “Detalles con amor, regalos que llegan al corazón.”
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              Crea tu ancheta con dulces, chocolates selectos, pasabocas salados, ositos de peluche con moño dorado y tarjetas emotivas. Diseñada para celebrar la unión familiar y momentos especiales en toda Colombia.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onGoToBuilder}
                className="flex items-center justify-center gap-3 px-7 py-3.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-lg shadow-rose-600/25 transition-all"
              >
                <Gift className="w-4 h-4" />
                <span>Arma tu Ancheta Aquí</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onGoToCatalog}
                className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors shadow-sm"
              >
                <span>Explorar Catálogo</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-200/80 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Entregas a domicilio programadas</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pagos Bancolombia & Nequi</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Tarjetas y dedicatorias incluidas</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-400/20 via-rose-400/20 to-orange-300/20 rounded-3xl blur-2xl -z-10"></div>

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200/60 bg-white aspect-[4/3] lg:aspect-[16/11]">
                <img
                  src="/src/assets/images/hero_anchetas_colombia_1792454120218.jpg"
                  alt="Ancheta gourmet de regalo colombiana con dulces y pasabocas"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />

                {/* Floating Official AP Brand Seal */}
                <div className="absolute top-3.5 right-3.5 hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-amber-400/50 shadow-xl">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-black shrink-0 border border-amber-400/40">
                    <img
                      src="/src/assets/images/logo_anchetas_personalizables_ap_1792456217307.jpg"
                      alt="AP Emblem"
                      className="w-[125%] h-[125%] object-cover object-top -translate-y-0.5"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span
                      className="text-[10px] font-serif font-black tracking-wider text-amber-300 uppercase leading-tight"
                      style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                    >
                      ANCHETAS PERSONALIZABLES
                    </span>
                    <span className="text-[9px] text-stone-400 leading-none mt-0.5">Sello Oficial AP</span>
                  </div>
                </div>
                
                {/* Floating highlight tag */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-stone-900/85 backdrop-blur-md rounded-xl text-white text-xs border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-300">Ancheta Sorpresa Especial</p>
                    <p className="text-stone-300 text-[11px]">Desde $45.000 COP · Totalmente personalizable</p>
                  </div>
                  <button
                    onClick={onGoToBuilder}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg font-bold text-[11px] text-white transition-colors shrink-0"
                  >
                    Crear Ahora
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
