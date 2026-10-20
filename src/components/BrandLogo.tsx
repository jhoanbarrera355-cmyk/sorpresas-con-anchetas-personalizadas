import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  // If 'full' emblem badge is requested, render the complete emblem card with the AP initials, basket, teddy bear, and the golden 'ANCHETAS PERSONALIZABLES' text below
  if (size === 'full') {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-black p-4 border border-amber-400/40 shadow-2xl flex flex-col items-center justify-between group max-w-xs ${className}`}
        style={{
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(217, 119, 6, 0.3)'
        }}
      >
        {/* Upper illustration containing: large golden AP, teddy bear in basket, sweets, big golden bow, and floating gold hearts */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-black">
          <img
            src="/src/assets/images/logo_anchetas_personalizables_ap_1792456217307.jpg"
            alt="Emblema AP Anchetas Personalizables"
            className="w-full h-[135%] object-cover object-top -translate-y-2 pointer-events-none"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette gradient fading seamlessly into black */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Elegant, clear, sharp replacement text: ANCHETAS PERSONALIZABLES */}
        <div className="w-full text-center pt-3 pb-1 border-t border-amber-500/30">
          <h3
            className="font-serif font-black tracking-widest uppercase text-sm sm:text-base"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 35%, #d97706 75%, #92400e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 8px rgba(217, 119, 6, 0.35)'
            }}
          >
            ANCHETAS PERSONALIZABLES
          </h3>
          <p className="text-[10px] text-amber-300/80 tracking-wider uppercase font-semibold mt-0.5">
            Detalles con Amor
          </p>
        </div>
      </div>
    );
  }

  // Dimension classes for standard compact badges
  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
    full: ''
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Black & Gold AP Emblem Icon */}
      <div
        className={`relative shrink-0 overflow-hidden bg-black border border-amber-400/50 shadow-md group-hover:scale-105 transition-all duration-300 flex items-center justify-center ${sizeClasses[size]}`}
        style={{
          boxShadow: '0 4px 14px -1px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(245, 158, 11, 0.35)'
        }}
      >
        {/* Cropped top area highlighting the big golden AP monogram and festive basket details */}
        <img
          src="/src/assets/images/logo_anchetas_personalizables_ap_1792456217307.jpg"
          alt="Logo AP"
          className="w-[125%] h-[125%] max-w-none object-cover object-top -translate-y-1"
          loading="eager"
          referrerPolicy="no-referrer"
        />

        {/* Refined subtle golden rim */}
        <div className="absolute inset-0 rounded-[inherit] border border-amber-300/30 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="font-serif font-black tracking-wider text-base sm:text-lg leading-none uppercase text-stone-900"
              style={{ fontFamily: "'Cinzel', 'Outfit', Georgia, serif" }}
            >
              ANCHETAS PERSONALIZABLES
            </span>
            <span className="px-1.5 py-0.5 rounded bg-black text-amber-400 font-serif font-black text-[10px] tracking-wider border border-amber-400/40">
              AP
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium italic mt-1 leading-tight">
            “Detalles con amor, regalos que llegan al corazón.”
          </span>
        </div>
      )}
    </div>
  );
};
