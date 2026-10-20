import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Save,
  RefreshCw,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Product, Order, OrderStatus, BusinessSettings, Coupon, formatCOP } from '../types.ts';

export const AdminPanel: React.FC = () => {
  const { token, user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'resumen' | 'pedidos' | 'productos' | 'pagos_negocio' | 'promociones' | 'clientes'>('resumen');

  // Metrics & Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Filter & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');

  // Modals
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  // Status updating in order modal
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('pendiente_confirmacion');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pendiente' | 'verificando' | 'aprobado' | 'rechazado'>('pendiente');

  // Product Form State
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    category: 'dulces' as 'dulces' | 'salados' | 'otros',
    subcategory: 'Chocolates',
    price: 15000,
    stock: 20,
    available: true,
    imageUrl: '',
    featured: false
  });

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    value: 10,
    minOrder: 50000,
    description: ''
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<BusinessSettings | null>(null);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setLowStockProducts(data.lowStockProducts);
          setRecentOrders(data.recentOrders);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      }
    }
    loadDashboard();
  }, [token, refreshTrigger]);

  // Load Orders
  useEffect(() => {
    async function loadOrders() {
      if (!token || (activeTab !== 'pedidos' && activeTab !== 'resumen')) return;
      try {
        const queryParams = new URLSearchParams();
        if (orderStatusFilter !== 'all') queryParams.append('status', orderStatusFilter);
        if (orderSearch) queryParams.append('search', orderSearch);

        const res = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setOrders(list);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadOrders();
  }, [token, activeTab, orderStatusFilter, orderSearch, refreshTrigger]);

  // Load Products
  useEffect(() => {
    async function loadProducts() {
      if (!token) return;
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const list = await res.json();
          setProducts(list);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProducts();
  }, [token, refreshTrigger]);

  // Load Settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const s = await res.json();
          setSettings(s);
          setSettingsForm(s);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, [refreshTrigger]);

  // Load Coupons
  useEffect(() => {
    async function loadCoupons() {
      if (!token || activeTab !== 'promociones') return;
      try {
        const res = await fetch('/api/admin/coupons', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCoupons(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCoupons();
  }, [token, activeTab, refreshTrigger]);

  // Load Customers
  useEffect(() => {
    async function loadCustomers() {
      if (!token || activeTab !== 'clientes') return;
      try {
        const res = await fetch('/api/admin/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCustomers();
  }, [token, activeTab, refreshTrigger]);

  // --- ORDER STATUS UPDATE ---
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderDetails || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newOrderStatus,
          note: adminNoteInput,
          paymentStatus: newPaymentStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedOrderDetails(updated);
        setAdminNoteInput('');
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE PRODUCT (CREATE / EDIT) ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(prodForm)
      });

      if (res.ok) {
        setProductModalOpen(false);
        setEditingProduct(null);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token || !confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- SAVE SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settingsForm) return;
    setLoading(true);
    setSettingsSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSettingsSuccessMsg('¡Configuración guardada exitosamente!');
        setTimeout(() => setSettingsSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE COUPON ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(couponForm)
      });
      if (res.ok) {
        setCouponModalOpen(false);
        setCouponForm({ code: '', discountType: 'percent', value: 10, minOrder: 50000, description: '' });
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!token || !confirm(`¿Eliminar cupón ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>Panel de Control Administrativo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Gestión Integral · Anchetas Personalizables
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Bienvenido, <strong className="text-stone-800">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'resumen' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Resumen General</span>
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pedidos' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Gestión de Pedidos ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('productos')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'productos' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Productos e Inventario ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pagos_negocio')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pagos_negocio' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Bancolombia, Nequi & Ajustes</span>
        </button>
        <button
          onClick={() => setActiveTab('promociones')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'promociones' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promociones & Cupones</span>
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'clientes' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes Registrados</span>
        </button>
      </div>

      {/* TAB 1: RESUMEN GENERAL (DASHBOARD) */}
      {activeTab === 'resumen' && metrics && (
        <div className="space-y-8 animate-fade-in">
          
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 font-semibold block">Ventas Totales Recaudadas</span>
              <p className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                {formatCOP(metrics.totalSales)}
              </p>
              <span className="text-[11px] text-stone-400 block">{metrics.totalOrders} pedidos procesados</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 font-semibold block">Pendientes de Confirmar / Pago</span>
              <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                {metrics.pendingOrders}
              </p>
              <span className="text-[11px] text-amber-700 block">Requieren revisión de comprobante</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 font-semibold block">En Preparación (Taller)</span>
              <p className="text-2xl font-black text-indigo-600 font-mono tracking-tight">
                {metrics.inPreparation}
              </p>
              <span className="text-[11px] text-stone-400 block">Armando anchetas y detalles</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <span className="text-xs text-stone-500 font-semibold block">Entregados Satisfactoriamente</span>
              <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                {metrics.delivered}
              </p>
              <span className="text-[11px] text-emerald-700 block">¡Sonrisas entregadas!</span>
            </div>

          </div>

          {/* Low Stock Alerts & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Low stock table */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Alertas de Inventario Bajo (&le; 10 unidades)</span>
                </h3>
                <button
                  onClick={() => setActiveTab('productos')}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Ver inventario completo
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  Todos los productos cuentan con existencias óptimas.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl text-xs">
                      <div>
                        <p className="font-semibold text-stone-800">{p.name}</p>
                        <span className="text-[10px] text-stone-400 capitalize">{p.category}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold font-mono">
                        {p.stock} un.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm">Últimos Pedidos Registrados</h3>
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Gestionar todos
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {recentOrders.map(ord => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderDetails(ord);
                      setNewOrderStatus(ord.orderStatus);
                      setNewPaymentStatus(ord.paymentStatus);
                    }}
                    className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-stone-900">{ord.orderNumber}</span>
                      <p className="text-stone-500 text-[11px]">{ord.customerName} &rarr; {ord.recipientName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-stone-900 block">{formatCOP(ord.total)}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-stone-100 text-stone-700">
                        {ord.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: GESTIÓN DE PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por #pedido, cliente o teléfono..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-500 font-medium">Estado:</span>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente_confirmacion">Pendiente confirmación</option>
                <option value="pendiente_pago">Pendiente de pago</option>
                <option value="pago_recibido">Pago recibido</option>
                <option value="en_preparacion">En preparación</option>
                <option value="listo_entrega">Listo para entregar</option>
                <option value="en_camino">En camino</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Pedido #</th>
                    <th className="py-3.5 px-4">Cliente / Contacto</th>
                    <th className="py-3.5 px-4">Destinatario & Fecha</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Método / Pago</th>
                    <th className="py-3.5 px-4">Estado Pedido</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        No se encontraron pedidos con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-800">{order.customerName}</p>
                          <p className="text-stone-400 text-[11px]">{order.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-800">{order.recipientName}</p>
                          <p className="text-stone-400 text-[11px]">Entrega: {order.deliveryDate}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                          {formatCOP(order.total)}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold uppercase text-stone-700 text-[11px]">{order.paymentMethod}</p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              order.paymentStatus === 'aprobado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.paymentStatus === 'verificando'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                              order.orderStatus === 'entregado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'cancelado'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrderDetails(order);
                              setNewOrderStatus(order.orderStatus);
                              setNewPaymentStatus(order.paymentStatus);
                            }}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs transition-colors"
                          >
                            Ver / Gestionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PRODUCTOS & INVENTARIO */}
      {activeTab === 'productos' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar producto o subcategoría..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium"
              >
                <option value="all">Todas las Categorías</option>
                <option value="dulces">Dulces y Golosinas</option>
                <option value="salados">Productos Salados</option>
                <option value="otros">Otros (Peluches, globos, cajas)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProdForm({
                  name: '',
                  description: '',
                  category: 'dulces',
                  subcategory: 'Chocolates',
                  price: 15000,
                  stock: 25,
                  available: true,
                  imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
                  featured: false
                });
                setProductModalOpen(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Producto</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Foto</th>
                    <th className="py-3 px-4">Producto & Descripción</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio COP</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products
                    .filter(p => {
                      const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                      const matchS =
                        !productSearch ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.subcategory.toLowerCase().includes(productSearch.toLowerCase());
                      return matchCat && matchS;
                    })
                    .map(product => (
                      <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="py-2.5 px-4 max-w-xs">
                          <p className="font-bold text-stone-900 line-clamp-1">{product.name}</p>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{product.description}</p>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-semibold text-stone-800 capitalize">{product.category}</span>
                          <span className="text-[10px] text-stone-400 block">{product.subcategory}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-stone-900">
                          {formatCOP(product.price)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              product.stock <= 10
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {product.stock} un.
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              product.available && product.stock > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {product.available && product.stock > 0 ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProdForm({
                                name: product.name,
                                description: product.description,
                                category: product.category,
                                subcategory: product.subcategory,
                                price: product.price,
                                stock: product.stock,
                                available: product.available,
                                imageUrl: product.imageUrl,
                                featured: Boolean(product.featured)
                              });
                              setProductModalOpen(true);
                            }}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: BANCOLOMBIA, NEQUI & CONFIGURACIÓN */}
      {activeTab === 'pagos_negocio' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in max-w-4xl">
          
          {settingsSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{settingsSuccessMsg}</span>
            </div>
          )}

          {/* Bancolombia Settings */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Configuración de Enlace & Cuenta Bancolombia</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Número de Cuenta</label>
                <input
                  type="text"
                  value={settingsForm.bancolombiaAccount}
                  onChange={e => setSettingsForm({ ...settingsForm, bancolombiaAccount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tipo de Cuenta</label>
                <input
                  type="text"
                  value={settingsForm.bancolombiaAccountType}
                  onChange={e => setSettingsForm({ ...settingsForm, bancolombiaAccountType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Titular de la Cuenta / NIT</label>
                <input
                  type="text"
                  value={settingsForm.bancolombiaHolder}
                  onChange={e => setSettingsForm({ ...settingsForm, bancolombiaHolder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-semibold text-stone-700 mb-1">
                  Enlace Oficial de Pago Bancolombia (Wompi, Botón Bancolombia o Portal)
                </label>
                <input
                  type="url"
                  placeholder="https://transacciones.bancolombia.com/pagos"
                  value={settingsForm.bancolombiaLink}
                  onChange={e => setSettingsForm({ ...settingsForm, bancolombiaLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-semibold text-stone-700 mb-1">Instrucciones de Pago al Cliente</label>
                <textarea
                  rows={2}
                  value={settingsForm.bancolombiaInstructions}
                  onChange={e => setSettingsForm({ ...settingsForm, bancolombiaInstructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Nequi Settings */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-fuchsia-600"></span>
              <span>Configuración de Enlace & Celular Nequi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Número de Celular Nequi</label>
                <input
                  type="text"
                  value={settingsForm.nequiNumber}
                  onChange={e => setSettingsForm({ ...settingsForm, nequiNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Titular Nequi</label>
                <input
                  type="text"
                  value={settingsForm.nequiHolder}
                  onChange={e => setSettingsForm({ ...settingsForm, nequiHolder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Enlace Oficial Nequi (Recargas / Pagos)</label>
                <input
                  type="url"
                  placeholder="https://recarga.nequi.com.co"
                  value={settingsForm.nequiLink}
                  onChange={e => setSettingsForm({ ...settingsForm, nequiLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Instrucciones Nequi para el Cliente</label>
                <textarea
                  rows={2}
                  value={settingsForm.nequiInstructions}
                  onChange={e => setSettingsForm({ ...settingsForm, nequiInstructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Shipping & Business General Settings */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-rose-600" />
              <span>Configuración de Envíos, WhatsApp y Negocio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tarifa de Envío Estándar (COP)</label>
                <input
                  type="number"
                  value={settingsForm.deliveryFeeDefault}
                  onChange={e => setSettingsForm({ ...settingsForm, deliveryFeeDefault: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tiempo de Preparación (Horas)</label>
                <input
                  type="number"
                  value={settingsForm.preparationTimeHours}
                  onChange={e => setSettingsForm({ ...settingsForm, preparationTimeHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Número WhatsApp del Negocio</label>
                <input
                  type="text"
                  placeholder="573123456789"
                  value={settingsForm.whatsappNumber}
                  onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-stone-50"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableCOD"
                  checked={settingsForm.enableCashOnDelivery}
                  onChange={e => setSettingsForm({ ...settingsForm, enableCashOnDelivery: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="enableCOD" className="font-semibold text-stone-800">
                  Habilitar opción de Pago Contra Entrega para clientes
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración General</span>
            </button>
          </div>

        </form>
      )}

      {/* TAB 5: PROMOCIONES & CUPONES */}
      {activeTab === 'promociones' && (
        <div className="space-y-6 animate-fade-in max-w-4xl">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Cupones de Descuento Vigentes</h3>
              <p className="text-xs text-stone-500">Crea códigos para temporadas de Amor y Amistad, Navidad o Bienvenida.</p>
            </div>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Cupón</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Descuento</th>
                  <th className="py-3 px-4">Pedido Mínimo</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map(cp => (
                  <tr key={cp.code} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 text-sm">{cp.code}</td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {cp.discountType === 'percent' ? `${cp.value}% de Descuento` : formatCOP(cp.value)}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">{formatCOP(cp.minOrder)}</td>
                    <td className="py-3 px-4 text-stone-500">{cp.description}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(cp.code)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 6: CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="space-y-6 animate-fade-in max-w-5xl">
          <h3 className="text-base font-bold text-stone-900">Directorio de Clientes Registrados</h3>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Teléfono (WhatsApp)</th>
                  <th className="py-3 px-4">Ciudad / Dirección</th>
                  <th className="py-3 px-4">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-bold text-stone-900">{c.name}</td>
                    <td className="py-3 px-4 text-stone-600">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-stone-800">{c.phone}</td>
                    <td className="py-3 px-4 text-stone-600">{c.address ? `${c.address}, ${c.city}` : c.city || 'Bogotá'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'}`}>
                        {c.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & STATUS UPDATE MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-scale-in">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Detalle del Pedido</span>
                <h3 className="text-xl font-bold font-mono text-stone-900">{selectedOrderDetails.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Recipient & Customer */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-stone-50 rounded-2xl">
              <div>
                <span className="text-stone-400 font-medium block">Cliente Solicitante:</span>
                <p className="font-bold text-stone-800">{selectedOrderDetails.customerName}</p>
                <p className="text-stone-600">{selectedOrderDetails.customerPhone}</p>
                <p className="text-stone-600">{selectedOrderDetails.customerEmail}</p>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Destinatario & Entrega:</span>
                <p className="font-bold text-rose-700">{selectedOrderDetails.recipientName}</p>
                <p className="text-stone-600">{selectedOrderDetails.deliveryAddress}, {selectedOrderDetails.neighborhood}</p>
                <p className="text-stone-600">{selectedOrderDetails.city} · <strong>Fecha: {selectedOrderDetails.deliveryDate}</strong></p>
              </div>
              {selectedOrderDetails.cardMessage && (
                <div className="col-span-2 pt-2 border-t border-stone-200">
                  <span className="text-stone-400 font-medium block">Dedicatoria para la tarjeta:</span>
                  <p className="italic text-stone-700 mt-0.5">"{selectedOrderDetails.cardMessage}"</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-stone-900 block">Productos en el pedido:</span>
              <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 max-h-48 overflow-y-auto">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-stone-200/60">
                    <div>
                      <p className="font-semibold text-stone-800">{it.quantity}x {it.name}</p>
                      {it.isCustomAncheta && it.selectedProducts && (
                        <p className="text-[10px] text-stone-500">
                          {it.selectedProducts.map(p => `${p.quantity}x ${p.productName}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-stone-900">{formatCOP(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 text-stone-900 font-bold text-sm">
                <span>Total Facturado:</span>
                <span className="font-mono text-rose-600">{formatCOP(selectedOrderDetails.total)}</span>
              </div>
            </div>

            {/* Change Status & Admin Note */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-xs">
              <span className="font-bold text-amber-950 block">Actualizar Estado del Pedido & Pago:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Nuevo Estado del Pedido:</label>
                  <select
                    value={newOrderStatus}
                    onChange={e => setNewOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="pendiente_confirmacion">1. Pendiente de confirmación</option>
                    <option value="pendiente_pago">2. Pendiente de pago</option>
                    <option value="pago_recibido">3. Pago recibido</option>
                    <option value="en_preparacion">4. En preparación</option>
                    <option value="listo_entrega">5. Listo para entregar</option>
                    <option value="en_camino">6. En camino</option>
                    <option value="entregado">7. Entregado</option>
                    <option value="cancelado">8. Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Estado del Pago:</label>
                  <select
                    value={newPaymentStatus}
                    onChange={e => setNewPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="verificando">Verificando comprobante</option>
                    <option value="aprobado">Aprobado / Pagado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">Nota del Administrador (se guarda en historial):</label>
                  <input
                    type="text"
                    placeholder="Ej: Pago Bancolombia verificado. Ancheta lista en empaque con moño dorado."
                    value={adminNoteInput}
                    onChange={e => setAdminNoteInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleUpdateOrderStatus}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Guardando...' : 'Aplicar Cambio de Estado'}</span>
                </button>
              </div>
            </div>

            {/* Status History */}
            <div className="space-y-1.5 text-[11px] pt-2 border-t border-stone-200">
              <span className="font-bold text-stone-500 uppercase tracking-wider block">Historial de Cambios:</span>
              {selectedOrderDetails.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-stone-100 text-stone-600">
                  <span>
                    <strong>{h.status.replace('_', ' ')}</strong>: {h.note}
                  </span>
                  <span className="text-stone-400 font-mono">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({h.updatedBy})
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* PRODUCT CREATE / EDIT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">
                {editingProduct ? 'Editar Producto del Catálogo' : 'Registrar Nuevo Producto'}
              </h3>
              <button type="button" onClick={() => setProductModalOpen(false)} className="text-stone-400 text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bombones de Chocolate y Caramelo"
                  value={prodForm.name}
                  onChange={e => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Breve detalle de los ingredientes o presentación..."
                  value={prodForm.description}
                  onChange={e => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoría Principal *</label>
                  <select
                    value={prodForm.category}
                    onChange={e => setProdForm({ ...prodForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  >
                    <option value="dulces">Dulces y Golosinas</option>
                    <option value="salados">Productos Salados</option>
                    <option value="otros">Otros (Peluches, globos, cajas)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subcategoría *</label>
                  <input
                    type="text"
                    required
                    placeholder="Chocolates, Gomitas, Maní..."
                    value={prodForm.subcategory}
                    onChange={e => setProdForm({ ...prodForm, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Precio en COP *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={prodForm.price}
                    onChange={e => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Disponible *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodForm.stock}
                    onChange={e => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL de Imagen del Producto</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={prodForm.imageUrl}
                  onChange={e => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.available}
                    onChange={e => setProdForm({ ...prodForm, available: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span className="font-semibold text-stone-800">Disponible para la venta</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.featured}
                    onChange={e => setProdForm({ ...prodForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span className="font-semibold text-stone-800">Destacado en vitrina</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NEW COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-in text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900">Crear Nuevo Cupón</h3>
              <button type="button" onClick={() => setCouponModalOpen(false)} className="text-stone-400">
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Código Promocional</label>
              <input
                type="text"
                required
                placeholder="AMOR2026"
                value={couponForm.code}
                onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tipo de Descuento</label>
              <select
                value={couponForm.discountType}
                onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo en COP ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Valor del Descuento ({couponForm.discountType === 'percent' ? '%' : 'COP'})
              </label>
              <input
                type="number"
                required
                value={couponForm.value}
                onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Pedido Mínimo (COP)</label>
              <input
                type="number"
                value={couponForm.minOrder}
                onChange={e => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Descripción Breve</label>
              <input
                type="text"
                placeholder="Ej: Descuento para día de la madre"
                value={couponForm.description}
                onChange={e => setCouponForm({ ...couponForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="px-3 py-1.5 text-stone-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 text-white font-bold rounded-xl"
              >
                Crear Cupón
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
