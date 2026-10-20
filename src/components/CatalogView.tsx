import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, ShoppingBag, Gift, Sparkles, AlertCircle } from 'lucide-react';
import { Product, formatCOP } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface CatalogViewProps {
  products: Product[];
  onGoToBuilderWithItem?: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ products, onGoToBuilderWithItem }) => {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<'todos' | 'dulces' | 'salados' | 'otros'>('todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Derive subcategories for active category
  const subcategories = useMemo(() => {
    let prods = products;
    if (activeCategory !== 'todos') {
      prods = prods.filter(p => p.category === activeCategory);
    }
    const set = new Set<string>();
    prods.forEach(p => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return ['todas', ...Array.from(set)];
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'todos' || p.category === activeCategory;
      const matchSub = selectedSubcategory === 'todas' || p.subcategory === selectedSubcategory;
      const matchQuery =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSub && matchQuery;
    });
  }, [products, activeCategory, selectedSubcategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: `cart-single-${Date.now()}-${product.id}`,
      name: product.name,
      isCustomAncheta: false,
      unitPrice: product.price,
      quantity: 1,
      totalPrice: product.price,
      imageUrl: product.imageUrl
    });

    setAddedItemNotification(`¡"${product.name}" agregado al carrito!`);
    setTimeout(() => setAddedItemNotification(null), 3000);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Toast feedback */}
      {addedItemNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm animate-fade-in border border-stone-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{addedItemNotification}</span>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200">
        <div>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Catálogo de Productos y Detalles
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Explora chocolates finos, pasabocas salados colombianos, peluches y accesorios para regalar.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar chocolates, papas, peluches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="pt-6 pb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setActiveCategory('todos');
            setSelectedSubcategory('todas');
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeCategory === 'todos'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Todos los Productos ({products.length})
        </button>
        <button
          onClick={() => {
            setActiveCategory('dulces');
            setSelectedSubcategory('todas');
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeCategory === 'dulces'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
          }`}
        >
          Dulces y Golosinas 🍫
        </button>
        <button
          onClick={() => {
            setActiveCategory('salados');
            setSelectedSubcategory('todas');
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeCategory === 'salados'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Productos Salados 🥔
        </button>
        <button
          onClick={() => {
            setActiveCategory('otros');
            setSelectedSubcategory('todas');
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeCategory === 'otros'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
          }`}
        >
          Peluches, Globos & Detalles 🧸
        </button>
      </div>

      {/* Subcategory interactive chips */}
      {subcategories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 text-xs">
          <span className="text-stone-400 font-medium whitespace-nowrap">Filtrar por:</span>
          {subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1 rounded-lg border whitespace-nowrap capitalize transition-colors ${
                selectedSubcategory === sub
                  ? 'bg-stone-800 text-white border-stone-800 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50 rounded-2xl border border-stone-200 mt-6">
          <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No encontramos productos con esos filtros</h3>
          <p className="text-stone-500 text-xs mt-1">Prueba con otra palabra clave o selecciona otra categoría.</p>
          <button
            onClick={() => {
              setActiveCategory('todos');
              setSelectedSubcategory('todas');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedProductDetails(product)}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                
                {/* Stock or Category pill */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-stone-800 rounded-md shadow-sm">
                    {product.subcategory}
                  </span>
                </div>

                {!product.available || product.stock <= 0 ? (
                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xs">
                    Agotado Temporalmente
                  </div>
                ) : null}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setSelectedProductDetails(product)}
                    className="font-bold text-stone-900 text-sm hover:text-rose-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">Precio COP</span>
                      <span className="text-base font-extrabold text-stone-900 font-mono tabular-nums">
                        {formatCOP(product.price)}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-500">
                      Disp: <strong className="text-stone-700">{product.stock} un.</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button
                      disabled={!product.available || product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Al Carrito</span>
                    </button>

                    <button
                      disabled={!product.available || product.stock <= 0}
                      onClick={() => {
                        if (onGoToBuilderWithItem) {
                          onGoToBuilderWithItem(product);
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Para Ancheta</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="relative aspect-video bg-stone-100">
              <img
                src={selectedProductDetails.imageUrl}
                alt={selectedProductDetails.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold">
                <span>{selectedProductDetails.category.toUpperCase()}</span>
                <span>·</span>
                <span>{selectedProductDetails.subcategory}</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mt-1">{selectedProductDetails.name}</h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{selectedProductDetails.description}</p>
              
              <div className="mt-4 p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500">Precio individual:</span>
                  <p className="text-lg font-extrabold text-stone-900 font-mono">
                    {formatCOP(selectedProductDetails.price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500">Stock disponible:</span>
                  <p className="text-sm font-bold text-stone-800">{selectedProductDetails.stock} unidades</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  disabled={!selectedProductDetails.available || selectedProductDetails.stock <= 0}
                  onClick={() => {
                    handleAddToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
                <button
                  onClick={() => {
                    if (onGoToBuilderWithItem) {
                      onGoToBuilderWithItem(selectedProductDetails);
                    }
                    setSelectedProductDetails(null);
                  }}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Armar en Ancheta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
