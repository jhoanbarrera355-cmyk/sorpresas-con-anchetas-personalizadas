/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { Hero } from './components/Hero.tsx';
import { CatalogView } from './components/CatalogView.tsx';
import { AnchetaBuilder } from './components/AnchetaBuilder.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { OrderTracker } from './components/OrderTracker.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PolicyModal } from './components/PolicyModals.tsx';
import { Product, Order, formatCOP } from './types.ts';
import {
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Heart,
  Truck,
  CheckCircle,
  MessageCircle,
  Package
} from 'lucide-react';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const { isCheckoutOpen, setIsCheckoutOpen, addItem, settings } = useCart();

  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Cross-component state
  const [initialBuilderProduct, setInitialBuilderProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<'faq' | 'envios' | 'pagos' | 'privacidad' | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  // Fetch initial catalog
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const list = await res.json();
          setProducts(list);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const handleGoToBuilderWithProduct = (product: Product) => {
    setInitialBuilderProduct(product);
    setActiveTab('personalizar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderConfirmed = (order: Order) => {
    setConfirmedOrder(order);
    setTrackingNumber(order.orderNumber);
  };

  const handleTrackFromConfirmation = (orderNum: string) => {
    setTrackingNumber(orderNum);
    setActiveTab('rastreo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = settings?.whatsappNumber || '573143133440';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 selection:bg-rose-100 selection:text-rose-900">
      
      {/* Top Banner with discount promotion */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-rose-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            ¡Celebra con nosotros! Usa el cupón <strong className="font-mono text-amber-300">BIENVENIDO10</strong> para 10% de descuento en tu primera ancheta.
          </span>
        </div>
      </div>

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB 1: INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <Hero
              onGoToBuilder={() => {
                setActiveTab('personalizar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToCatalog={() => {
                setActiveTab('catalogo');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onTrackOrder={() => {
                setActiveTab('rastreo');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Curated Pre-Designed Anchetas Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-stone-200">
                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                    Selección Especial
                  </span>
                  <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
                    Anchetas Favoritas Listas para Enviar
                  </h2>
                  <p className="text-stone-500 text-xs sm:text-sm mt-1">
                    Diseños populares creados por nuestros artesanos, listos para ordenar o personalizar.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('personalizar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline shrink-0"
                >
                  <span>Crear la mía desde cero</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Showcase Grid of 3 Curated Models */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                
                {/* Ancheta 1: Dulce Tentación */}
                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src="/src/assets/images/ancheta_dulce_premium_1792454119872.jpg"
                      alt="Ancheta Dulce Tentación"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-rose-700 shadow-sm">
                      Solo Dulces
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-stone-400 text-[11px] ml-1">(48 reseñas)</span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base">
                        Ancheta Dulce Tentación & Peluche
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Bombones belgas, brownies melcochudos, chocolatina gigante, gomitas ácidas y tierno peluche teddy en canasta tejida.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium">Precio Final COP</span>
                        <span className="text-lg font-black text-stone-900 font-mono">
                          {formatCOP(115000)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: `curated-dulce-${Date.now()}`,
                            name: 'Ancheta Dulce Tentación & Peluche',
                            isCustomAncheta: false,
                            unitPrice: 115000,
                            quantity: 1,
                            totalPrice: 115000,
                            imageUrl: '/src/assets/images/ancheta_dulce_premium_1792454119872.jpg'
                          });
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Comprar Ya
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ancheta 2: Gran Fiesta Mixta Gourmet */}
                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src="/src/assets/images/ancheta_mixta_especial_1792454120666.jpg"
                      alt="Ancheta Mixta Gourmet"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-800 shadow-sm">
                      Mixta: Dulce & Salado
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-stone-400 text-[11px] ml-1">(62 reseñas)</span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base">
                        Ancheta Gran Fiesta Mixta Gourmet
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Mezcla prémium de frutos secos, papas artesanales en caldero, chocolate fino al 70% cacao, galletas saladas y caja de madera.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium">Precio Final COP</span>
                        <span className="text-lg font-black text-stone-900 font-mono">
                          {formatCOP(138000)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: `curated-mixta-${Date.now()}`,
                            name: 'Ancheta Gran Fiesta Mixta Gourmet',
                            isCustomAncheta: false,
                            unitPrice: 138000,
                            quantity: 1,
                            totalPrice: 138000,
                            imageUrl: '/src/assets/images/ancheta_mixta_especial_1792454120666.jpg'
                          });
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Comprar Ya
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ancheta 3: Cumpleaños Mágica */}
                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src="/src/assets/images/ancheta_cumpleanos_celebracion_1792454120240.jpg"
                      alt="Ancheta Cumpleaños Mágica"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-indigo-700 shadow-sm">
                      Globo + Luces LED
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-stone-400 text-[11px] ml-1">(39 reseñas)</span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base">
                        Ancheta Mágica Cumpleaños & Globos
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Caja de lujo con ventana, cupcakes decorados, Ferrero Rocher x8, globo metalizado con helio, luces LED y tarjeta con dedicatoria.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium">Precio Final COP</span>
                        <span className="text-lg font-black text-stone-900 font-mono">
                          {formatCOP(155000)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: `curated-cumple-${Date.now()}`,
                            name: 'Ancheta Mágica Cumpleaños & Globos',
                            isCustomAncheta: false,
                            unitPrice: 155000,
                            quantity: 1,
                            totalPrice: 155000,
                            imageUrl: '/src/assets/images/ancheta_cumpleanos_celebracion_1792454120240.jpg'
                          });
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Comprar Ya
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-stone-100/70 py-16 border-y border-stone-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    ¿Cómo Funciona Anchetas Personalizables (AP)?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Hacer feliz a alguien especial en Colombia nunca fue tan fácil y seguro
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black text-lg">
                      1
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">Escoge el Empaque</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Madera artesanal, canasta de mimbre o cajas rígidas de lujo según el tamaño deseado.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-black text-lg">
                      2
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">Elige los Sabores</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Combina chocolates, brownies, gomitas, papas crujientes y frutos secos a tu antojo.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-black text-lg">
                      3
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">Escribe tu Dedicatoria</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Personaliza el mensaje para la tarjeta y añade peluches, globos o luces brillantes.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-lg">
                      4
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">Paga con Bancolombia / Nequi</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Realiza tu transferencia segura y te enviamos la ancheta puntual a la puerta de su casa.
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setActiveTab('personalizar');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-600/25 transition-all inline-flex items-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Empezar a Armar mi Ancheta</span>
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: CATÁLOGO */}
        {activeTab === 'catalogo' && (
          <CatalogView
            products={products}
            onGoToBuilderWithItem={handleGoToBuilderWithProduct}
          />
        )}

        {/* TAB 3: ARMA TU ANCHETA */}
        {activeTab === 'personalizar' && (
          <AnchetaBuilder
            products={products}
            initialProductToAdd={initialBuilderProduct}
            onAnchetaAddedToCart={() => {
              setInitialBuilderProduct(null);
            }}
          />
        )}

        {/* TAB 4: RASTREAR PEDIDO */}
        {activeTab === 'rastreo' && (
          <OrderTracker
            initialOrderNumber={trackingNumber}
            onGoToCatalog={() => setActiveTab('catalogo')}
          />
        )}

        {/* TAB 5: PANEL ADMIN (Protected) */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="py-20 max-w-md mx-auto px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Acceso Administrativo Protegido</h2>
              <p className="text-xs text-stone-500">
                Se requiere iniciar sesión con credenciales de administrador para gestionar productos, pedidos, enlaces de pago e inventario.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                Iniciar Sesión como Administrador
              </button>
            </div>
          )
        )}
      </main>

      {/* Cart Drawer Slide-over */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreCatalog={() => setActiveTab('catalogo')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderConfirmed}
      />

      {/* Post-Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleTrackFromConfirmation}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (activeTab === 'admin') {
            // refreshed
          }
        }}
      />

      {/* Policy and Info Modals */}
      <PolicyModal
        type={policyModalType}
        onClose={() => setPolicyModalType(null)}
      />

      {/* Footer */}
      <Footer
        onOpenPolicy={setPolicyModalType}
        onOpenAuth={() => setAuthModalOpen(true)}
        onNavigateToBuilder={() => {
          setActiveTab('personalizar');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
