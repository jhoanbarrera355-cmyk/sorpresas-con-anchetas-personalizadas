import React from 'react';
import { ShoppingBag, User as UserIcon, ShieldAlert, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark with prestige AS Monogram Logo */}
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <BrandLogo size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg sm:text-xl font-bold tracking-wider text-stone-900 leading-none uppercase"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                >
                  ANCHETAS <span className="text-rose-600">PERSONALIZABLES</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-black text-amber-400 font-serif font-black text-[10px] tracking-wider border border-amber-400/40">
                  AP
                </span>
              </div>
              <span className="text-[11px] font-medium text-stone-500 italic mt-1 leading-tight">
                “Detalles con amor, regalos que llegan al corazón.”
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 Navigation Links (Single-line, clean typography) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'inicio' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'catalogo' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('personalizar')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'personalizar' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent'
              }`}
            >
              Arma tu Ancheta
            </button>
            <button
              onClick={() => setActiveTab('rastreo')}
              className={`hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'rastreo' ? 'border-rose-600 text-rose-600 font-semibold' : 'border-transparent'
              }`}
            >
              Rastrear Pedido
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'admin' ? 'border-amber-600 text-amber-700 font-semibold' : 'border-transparent text-amber-700'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions (Cart + Account) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User Session Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(isAdmin ? 'admin' : 'mis-pedidos')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                  <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-stone-500 hover:text-stone-800 underline px-1"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
              >
                <UserIcon className="w-4 h-4 text-stone-500" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center text-[11px] font-bold bg-rose-600 text-white rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-stone-100 text-xs font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('inicio')}
            className={activeTab === 'inicio' ? 'text-rose-600 font-bold' : ''}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={activeTab === 'catalogo' ? 'text-rose-600 font-bold' : ''}
          >
            Catálogo
          </button>
          <button
            onClick={() => setActiveTab('personalizar')}
            className={activeTab === 'personalizar' ? 'text-rose-600 font-bold' : ''}
          >
            Armar
          </button>
          <button
            onClick={() => setActiveTab('rastreo')}
            className={activeTab === 'rastreo' ? 'text-rose-600 font-bold' : ''}
          >
            Rastrear
          </button>
          {isAdmin ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={activeTab === 'admin' ? 'text-amber-700 font-bold' : 'text-amber-700'}
            >
              Admin
            </button>
          ) : (
            <button onClick={onOpenAuth} className="text-stone-500">
              {user ? 'Cuenta' : 'Ingresar'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
