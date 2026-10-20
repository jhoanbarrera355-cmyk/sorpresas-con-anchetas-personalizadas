import React, { useState, useMemo } from 'react';
import {
  Gift,
  Plus,
  Minus,
  Trash2,
  Check,
  Heart,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Send
} from 'lucide-react';
import { Product, formatCOP, AnchetaItemSelection, OrderItem } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface AnchetaBuilderProps {
  products: Product[];
  initialProductToAdd?: Product | null;
  onAnchetaAddedToCart: () => void;
}

interface SelectedItemState {
  productId: string;
  quantity: number;
}

const PACKAGING_OPTIONS = [
  {
    id: 'caja-madera',
    name: 'Caja de Madera Rústica Artesanal',
    description: 'Madera de pino con acabado rústico vintage y lazo de yute o satín.',
    price: 25000,
    imageUrl: '/src/assets/images/ancheta_mixta_especial_1792454120666.jpg'
  },
  {
    id: 'canasta-mimbre',
    name: 'Canasta Tradicional de Mimbre Tejida',
    description: 'Tejido a mano por artesanos colombianos con forro de tela suave.',
    price: 28000,
    imageUrl: '/src/assets/images/ancheta_dulce_premium_1792454119872.jpg'
  },
  {
    id: 'caja-lujo',
    name: 'Caja Rígida de Lujo con Tapa & Moño',
    description: 'Cartón rígido prémium con ventana o acabado mate y cinta dorada.',
    price: 32000,
    imageUrl: '/src/assets/images/ancheta_cumpleanos_celebracion_1792454120240.jpg'
  },
  {
    id: 'guacal-decorativo',
    name: 'Guacal Festivo con Letrero Temático',
    description: 'Guacal de madera ligero ideal para pasabocas, dulces y globos.',
    price: 22000,
    imageUrl: '/src/assets/images/hero_anchetas_colombia_1792454120218.jpg'
  }
];

const OCCASIONS = [
  'Cumpleaños',
  'Aniversario',
  'Amor y Amistad',
  'Grado o Logro',
  'Día de la Madre',
  'Día del Padre',
  'Navidad / Fin de Año',
  'Agradecimiento',
  'Condolencias',
  'Sorpresa sin motivo'
];

export const AnchetaBuilder: React.FC<AnchetaBuilderProps> = ({
  products,
  initialProductToAdd,
  onAnchetaAddedToCart
}) => {
  const { addItem, settings } = useCart();

  // Builder States
  const [size, setSize] = useState<'pequeña' | 'mediana' | 'grande'>('mediana');
  const [anchetaType, setAnchetaType] = useState<'tradicional' | 'dulces' | 'mixta'>('mixta');
  const [selectedPackaging, setSelectedPackaging] = useState<string>('caja-madera');
  const [selectedItems, setSelectedItems] = useState<SelectedItemState[]>(() => {
    if (initialProductToAdd) {
      return [{ productId: initialProductToAdd.id, quantity: 1 }];
    }
    return [
      { productId: 'prod-001', quantity: 2 },
      { productId: 'prod-005', quantity: 2 },
      { productId: 'prod-061', quantity: 1 },
      { productId: 'prod-091', quantity: 1 }
    ];
  });

  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('Cumpleaños');
  const [cardMessage, setCardMessage] = useState<string>('');
  const [specialQuoteModalOpen, setSpecialQuoteModalOpen] = useState<boolean>(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  // Filter tabs inside builder product picker
  const [pickerCategory, setPickerCategory] = useState<'todos' | 'dulces' | 'salados' | 'otros'>('todos');

  // Size constraints and base adjustments
  const sizeConfig = {
    pequeña: { label: 'Pequeña', capacity: 'Hasta 6 productos', baseMultiplier: 0.8 },
    mediana: { label: 'Mediana', capacity: 'Hasta 12 productos', baseMultiplier: 1.0 },
    grande: { label: 'Grande', capacity: 'Hasta 20 productos', baseMultiplier: 1.3 }
  };

  // Base price for packaging
  const currentPackaging = PACKAGING_OPTIONS.find(p => p.id === selectedPackaging) || PACKAGING_OPTIONS[0];
  const packagingPrice = Math.round(currentPackaging.price * sizeConfig[size].baseMultiplier);

  // Available products for current anchetaType
  const filteredAvailableProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.available) return false;
      if (anchetaType === 'dulces' && p.category === 'salados') return false;
      if (pickerCategory !== 'todos' && p.category !== pickerCategory) return false;
      return true;
    });
  }, [products, anchetaType, pickerCategory]);

  // Compute selected items with product details
  const detailedSelectedItems = useMemo(() => {
    return selectedItems
      .map(item => {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) return null;
        return {
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.price,
          quantity: item.quantity,
          category: prod.category,
          imageUrl: prod.imageUrl,
          subtotal: prod.price * item.quantity
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      productName: string;
      unitPrice: number;
      quantity: number;
      category: string;
      imageUrl: string;
      subtotal: number;
    }>;
  }, [selectedItems, products]);

  // Breakdown of costs
  const productsTotal = detailedSelectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItemsCount = detailedSelectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const anchetaTotal = packagingPrice + productsTotal;
  const estimatedShipping = settings?.deliveryFeeDefault || 12000;

  // Handler for adding/incrementing item
  const handleAddItem = (productId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  // Handler for decrementing item
  const handleDecrementItem = (productId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prev.filter(i => i.productId !== productId);
    });
  };

  // Handler for removing item entirely
  const handleRemoveItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Add customized ancheta to Cart
  const handleAddAnchetaToCart = () => {
    if (detailedSelectedItems.length === 0) {
      alert('Por favor selecciona al menos un producto para incluir en tu ancheta.');
      return;
    }

    const selectionsForCart: AnchetaItemSelection[] = detailedSelectedItems.map(d => ({
      productId: d.productId,
      productName: d.productName,
      unitPrice: d.unitPrice,
      quantity: d.quantity,
      category: d.category
    }));

    const newAnchetaItem: OrderItem = {
      id: `custom-ancheta-${Date.now()}`,
      name: `Ancheta Personalizada (${sizeConfig[size].label} · ${anchetaType})`,
      isCustomAncheta: true,
      size,
      anchetaType,
      packaging: currentPackaging.name,
      occasion,
      recipientName: recipientName.trim() || 'Para alguien especial',
      cardMessage: cardMessage.trim() || '¡Muchas felicidades en este día tan especial!',
      selectedProducts: selectionsForCart,
      unitPrice: anchetaTotal,
      quantity: 1,
      totalPrice: anchetaTotal,
      imageUrl: currentPackaging.imageUrl
    };

    addItem(newAnchetaItem);
    onAnchetaAddedToCart();
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Title & Introduction */}
      <div className="pb-8 border-b border-stone-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configurador en Tiempo Real</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Arma tu Ancheta Personalizada
        </h2>
        <p className="text-stone-600 text-sm mt-1 max-w-2xl leading-relaxed">
          Diseña paso a paso un detalle único. Escoge el tamaño, el empaque artesanal, tus dulces y snacks preferidos, accesorios como peluches o globos y tu dedicatoria especial.
        </p>
      </div>

      {/* Main Grid: Steps on Left, Live Sticky Calculation Widget on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        
        {/* Left Column: Configuration Controls (Steps 1 to 5) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* STEP 1: Tamaño & Estilo */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Selecciona Tamaño y Estilo</h3>
                <p className="text-xs text-stone-500">Define las dimensiones y el tipo de contenido principal</p>
              </div>
            </div>

            {/* Size selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Tamaño de la Ancheta:</label>
              <div className="grid grid-cols-3 gap-3">
                {(['pequeña', 'mediana', 'grande'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      size === s
                        ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <p className="font-bold text-sm text-stone-900 capitalize">{sizeConfig[s].label}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{sizeConfig[s].capacity}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">Estilo de Contenido:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAnchetaType('mixta')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    anchetaType === 'mixta'
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-sm text-stone-900">Mixta (Recomendada)</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Dulces finos y snacks salados colombianos</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAnchetaType('dulces')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    anchetaType === 'dulces'
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-sm text-stone-900">Solo Dulces & Golosinas</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Chocolates, brownies, galletas y gomitas</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAnchetaType('tradicional')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    anchetaType === 'tradicional'
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-sm text-stone-900">Tradicional Colombiana</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Frutos secos, café, snacks y golosinas típicas</p>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: Tipo de Empaque */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Tipo de Caja, Canasta o Empaque</h3>
                <p className="text-xs text-stone-500">Incluye papel tisú decorativo, viruta protectora y moño de satín</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {PACKAGING_OPTIONS.map(pack => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackaging(pack.id)}
                  className={`cursor-pointer rounded-xl border p-4 flex gap-4 transition-all ${
                    selectedPackaging === pack.id
                      ? 'border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <img
                    src={pack.imageUrl}
                    alt={pack.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-900">{pack.name}</h4>
                      {selectedPackaging === pack.id && (
                        <Check className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug">{pack.description}</p>
                    <p className="text-xs font-extrabold text-stone-900 mt-2 font-mono">
                      {formatCOP(Math.round(pack.price * sizeConfig[size].baseMultiplier))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Selección de Productos */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Elige los Productos para tu Ancheta</h3>
                  <p className="text-xs text-stone-500">
                    Agrega los dulces, chocolates, pasabocas salados o peluches que quieras
                  </p>
                </div>
              </div>

              {/* Sub-filter inside builder */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs self-start">
                <button
                  type="button"
                  onClick={() => setPickerCategory('todos')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pickerCategory === 'todos' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setPickerCategory('dulces')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pickerCategory === 'dulces' ? 'bg-white text-rose-700 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Dulces
                </button>
                {anchetaType !== 'dulces' && (
                  <button
                    type="button"
                    onClick={() => setPickerCategory('salados')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      pickerCategory === 'salados' ? 'bg-white text-amber-700 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Salados
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPickerCategory('otros')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pickerCategory === 'otros' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Detalles
                </button>
              </div>
            </div>

            {/* Product selection list / grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 pt-2">
              {filteredAvailableProducts.map(product => {
                const currentSelected = selectedItems.find(i => i.productId === product.id);
                const quantity = currentSelected ? currentSelected.quantity : 0;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      quantity > 0
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-stone-900 truncate">{product.name}</p>
                        <p className="text-[11px] text-stone-500 font-mono">{formatCOP(product.price)}</p>
                      </div>
                    </div>

                    {/* Stepper or Add button */}
                    {quantity > 0 ? (
                      <div className="flex items-center gap-1.5 shrink-0 bg-white border border-rose-300 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => handleDecrementItem(product.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                          aria-label="Disminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-rose-700 font-mono">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddItem(product.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-rose-600 hover:bg-rose-50"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddItem(product.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-600 hover:text-white text-stone-700 text-xs font-semibold transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Dedicatoria, Ocasión y Destinatario */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Dedicatoria y Datos del Destinatario</h3>
                <p className="text-xs text-stone-500">Tu mensaje irá impreso en una hermosa tarjeta decorativa</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre de la persona que recibe: *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laura Castro"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Motivo u ocasión especial:
                </label>
                <select
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                >
                  {OCCASIONS.map(occ => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mensaje personalizado para la tarjeta de regalo:
                </label>
                <textarea
                  rows={3}
                  placeholder="Escribe aquí tu dedicatoria especial: '¡Feliz cumpleaños! Que la vida te sonría siempre y disfrutes cada uno de estos chocolates...'"
                  value={cardMessage}
                  onChange={e => setCardMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  De parte de (Remitente / Tu nombre):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Camilo y familia"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Live Calculation & Breakdown Widget */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-2xl border border-stone-200 shadow-lg p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-lg">Resumen en Vivo</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                {totalItemsCount} items
              </span>
            </div>

            {/* Ancheta metadata recap */}
            <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Tamaño:</span>
                <span className="font-semibold text-stone-900 capitalize">{sizeConfig[size].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Empaque:</span>
                <span className="font-semibold text-stone-900 truncate max-w-[170px]">{currentPackaging.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ocasión:</span>
                <span className="font-semibold text-rose-600">{occasion}</span>
              </div>
              {recipientName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Para:</span>
                  <span className="font-semibold text-stone-900">{recipientName}</span>
                </div>
              )}
            </div>

            {/* Selected items quick review */}
            <div>
              <p className="text-xs font-semibold text-stone-700 mb-2">Productos en tu ancheta:</p>
              {detailedSelectedItems.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-2">Aún no has agregado productos a tu ancheta.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detailedSelectedItems.map(item => (
                    <div key={item.productId} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-stone-400 text-[11px]">{item.quantity}x</span>
                        <span className="text-stone-800 truncate">{item.productName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-mono font-semibold text-stone-900">{formatCOP(item.subtotal)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown in COP */}
            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Empaque y presentación:</span>
                <span className="font-mono font-medium">{formatCOP(packagingPrice)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Suma de productos ({totalItemsCount}):</span>
                <span className="font-mono font-medium">{formatCOP(productsTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Envío estimado (a domicilio):</span>
                <span className="font-mono font-medium">{formatCOP(estimatedShipping)}</span>
              </div>
              
              <div className="pt-2 border-t border-stone-200 flex items-baseline justify-between text-stone-900">
                <div>
                  <span className="font-bold text-sm block">Total Ancheta</span>
                  <span className="text-[10px] text-stone-400">IVA incluido · COP</span>
                </div>
                <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                  {formatCOP(anchetaTotal)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAddAnchetaToCart}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar Ancheta al Carrito</span>
              </button>

              <button
                type="button"
                onClick={() => setSpecialQuoteModalOpen(true)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cotizar ancheta corporativa o especial</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Special Quote Modal */}
      {specialQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-stone-900">Solicitud de Cotización Especial</h3>
            <p className="text-xs text-stone-500 mt-1">
              ¿Requieres varias anchetas para tu empresa, evento corporativo o una personalización extraordinaria? Envíanos tu solicitud y te responderemos por WhatsApp en minutos.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tu Nombre:</label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  defaultValue={senderName}
                  id="quote-name"
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp / Teléfono:</label>
                <input
                  type="tel"
                  placeholder="312 345 6789"
                  id="quote-phone"
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Cantidad aproximada:</label>
                <input
                  type="number"
                  placeholder="Ej: 5, 10, 50 anchetas"
                  defaultValue="1"
                  id="quote-qty"
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Detalles o presupuesto:</label>
                <textarea
                  rows={3}
                  placeholder="Cuéntanos la ocasión, preferencias de chocolates, vinos o presupuesto deseado..."
                  id="quote-details"
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>
            </div>

            {quoteSuccessMsg && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{quoteSuccessMsg}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSpecialQuoteModalOpen(false);
                  setQuoteSuccessMsg(null);
                }}
                className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const phoneInput = (document.getElementById('quote-phone') as HTMLInputElement)?.value;
                  const nameInput = (document.getElementById('quote-name') as HTMLInputElement)?.value;
                  const qtyInput = (document.getElementById('quote-qty') as HTMLInputElement)?.value;
                  const detailsInput = (document.getElementById('quote-details') as HTMLTextAreaElement)?.value;
                  
                  const whatsapp = settings?.whatsappNumber || '573143133440';
                  const bName = settings?.businessName || 'Anchetas Personalizables';
                  const text = `Hola ${bName}! Quisiera una cotización especial para ${qtyInput} anchetas. Nombre: ${nameInput}, Tel: ${phoneInput}. Detalles: ${detailsInput}. Resumen preliminar: ${currentPackaging.name} (${size}) con ${totalItemsCount} productos.`;
                  
                  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
                  setQuoteSuccessMsg('¡Solicitud enviada a WhatsApp exitosamente!');
                  setTimeout(() => {
                    setSpecialQuoteModalOpen(false);
                    setQuoteSuccessMsg(null);
                  }, 2000);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
