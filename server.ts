import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { db, hashPassword, verifyPassword, Product, Order, OrderStatus } from './server/db.ts';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'customer';
    email: string;
    name: string;
  };
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Auth Middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const session = db.getSession(token);
  if (session) {
    const user = db.findUserById(session.userId);
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      };
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado. Por favor inicia sesión.' });
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
}

app.use(authMiddleware);

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, address, city } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser = db.createUser({
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    email: email.toLowerCase().trim(),
    phone,
    passwordHash: hash,
    salt,
    role: 'customer',
    address: address || '',
    city: city || 'Bogotá',
    createdAt: new Date().toISOString()
  });

  const token = db.createSession(newUser.id, newUser.role);
  return res.json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address,
      city: newUser.city
    },
    token
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa correo y contraseña.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  const token = db.createSession(user.id, user.role);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      city: user.city
    },
    token
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address,
    city: user.city
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  return res.json({ success: true });
});

app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, address, city } = req.body;
  const updated = db.updateUser(req.user!.id, {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city })
  });
  if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });
  return res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    address: updated.address,
    city: updated.city
  });
});

// --- PRODUCTS ENDPOINTS ---
app.get('/api/products', (_req: Request, res: Response) => {
  const products = db.getProducts();
  return res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.json(product);
});

// --- SETTINGS ENDPOINTS ---
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.json(settings);
});

// --- COUPON VALIDATION ---
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Código requerido.' });

  const coupon = db.findCoupon(code);
  if (!coupon) {
    return res.status(404).json({ error: 'Cupón no válido o expirado.' });
  }

  const sub = Number(subtotal) || 0;
  if (sub < coupon.minOrder) {
    return res.status(400).json({
      error: `Este cupón requiere un pedido mínimo de $${coupon.minOrder.toLocaleString('es-CO')} COP.`
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round((sub * coupon.value) / 100);
  } else {
    discountAmount = coupon.value;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discountAmount,
    description: coupon.description
  });
});

// --- ANCHETA CALCULATOR ---
const PACKAGING_BASE_PRICES: Record<string, number> = {
  pequeña: 18000,
  mediana: 26000,
  grande: 36000
};

app.post('/api/anchetas/calculate', (req: Request, res: Response) => {
  const { size, selectedItems } = req.body;
  const basePrice = PACKAGING_BASE_PRICES[size] || 25000;
  
  let productsTotal = 0;
  const validatedItems: any[] = [];

  if (Array.isArray(selectedItems)) {
    for (const item of selectedItems) {
      const prod = db.getProductById(item.productId);
      if (prod && prod.available) {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        productsTotal += prod.price * qty;
        validatedItems.push({
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.price,
          quantity: qty,
          category: prod.category
        });
      }
    }
  }

  const subtotal = basePrice + productsTotal;
  return res.json({
    basePrice,
    productsTotal,
    subtotal,
    validatedItems
  });
});

// --- ORDERS ENDPOINTS ---
app.post('/api/orders', (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      city,
      neighborhood,
      recipientName,
      deliveryDate,
      cardMessage,
      specialInstructions,
      items,
      couponCode,
      paymentMethod
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para generar el pedido.' });
    }

    // Re-validate and compute items pricing securely server-side
    let calculatedSubtotal = 0;
    const validatedOrderItems = items.map((item: any, idx: number) => {
      let itemPrice = 0;
      if (item.isCustomAncheta && Array.isArray(item.selectedProducts)) {
        const base = PACKAGING_BASE_PRICES[item.size] || 25000;
        let sum = base;
        const validSelections = item.selectedProducts.map((sel: any) => {
          const dbProd = db.getProductById(sel.productId);
          const unitPrice = dbProd ? dbProd.price : (Number(sel.unitPrice) || 0);
          const qty = Math.max(1, Number(sel.quantity) || 1);
          sum += unitPrice * qty;
          return {
            productId: sel.productId,
            productName: dbProd ? dbProd.name : sel.productName,
            unitPrice,
            quantity: qty,
            category: dbProd ? dbProd.category : (sel.category || 'otros')
          };
        });
        itemPrice = sum;
        return {
          id: `item-${Date.now()}-${idx}`,
          name: item.name || `Ancheta Personalizada (${item.size || 'Mediana'})`,
          isCustomAncheta: true,
          size: item.size || 'mediana',
          anchetaType: item.anchetaType || 'tradicional',
          packaging: item.packaging || 'Caja de madera artesanal',
          occasion: item.occasion || 'Cumpleaños',
          recipientName: item.recipientName || recipientName,
          cardMessage: item.cardMessage || cardMessage,
          selectedProducts: validSelections,
          unitPrice: itemPrice,
          quantity: Math.max(1, Number(item.quantity) || 1),
          totalPrice: itemPrice * Math.max(1, Number(item.quantity) || 1),
          imageUrl: item.imageUrl || '/src/assets/images/ancheta_dulce_premium_1792454119872.jpg'
        };
      } else {
        // Pre-designed item
        const dbProd = item.productId ? db.getProductById(item.productId) : null;
        itemPrice = dbProd ? dbProd.price : (Number(item.unitPrice) || 50000);
        const qty = Math.max(1, Number(item.quantity) || 1);
        return {
          id: `item-${Date.now()}-${idx}`,
          name: item.name,
          isCustomAncheta: false,
          unitPrice: itemPrice,
          quantity: qty,
          totalPrice: itemPrice * qty,
          imageUrl: item.imageUrl || (dbProd ? dbProd.imageUrl : '')
        };
      }
    });

    for (const vItem of validatedOrderItems) {
      calculatedSubtotal += vItem.totalPrice;
    }

    // Coupon discount calculation
    let calculatedDiscount = 0;
    if (couponCode) {
      const coupon = db.findCoupon(couponCode);
      if (coupon && calculatedSubtotal >= coupon.minOrder) {
        if (coupon.discountType === 'percent') {
          calculatedDiscount = Math.round((calculatedSubtotal * coupon.value) / 100);
        } else {
          calculatedDiscount = coupon.value;
        }
      }
    }

    const settings = db.getSettings();
    const shippingCost = settings.deliveryFeeDefault || 12000;
    const finalTotal = Math.max(0, calculatedSubtotal + shippingCost - calculatedDiscount);

    // Generate unique order number (e.g. ANC-2026-4891)
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ANC-2026-${randomSeq}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderNumber,
      customerId: req.user ? req.user.id : undefined,
      customerName,
      customerPhone,
      customerEmail: customerEmail || (req.user ? req.user.email : ''),
      deliveryAddress,
      city: city || 'Bogotá',
      neighborhood: neighborhood || '',
      recipientName: recipientName || customerName,
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      cardMessage: cardMessage || '',
      specialInstructions: specialInstructions || '',
      items: validatedOrderItems,
      subtotal: calculatedSubtotal,
      shippingCost,
      discount: calculatedDiscount,
      couponCode: calculatedDiscount > 0 ? couponCode : undefined,
      total: finalTotal,
      paymentMethod: paymentMethod || 'bancolombia',
      paymentStatus: 'pendiente',
      orderStatus: 'pendiente_confirmacion',
      statusHistory: [
        {
          status: 'pendiente_confirmacion',
          note: 'Pedido recibido a través de la tienda web',
          timestamp: new Date().toISOString(),
          updatedBy: 'Cliente'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = db.createOrder(newOrder);
    return res.status(201).json(saved);
  } catch (err: any) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Error interno al procesar el pedido.' });
  }
});

// Order Tracking by OrderNumber (Public)
app.get('/api/orders/track/:orderNumber', (req: Request, res: Response) => {
  const orderNumber = req.params.orderNumber.trim();
  const order = db.getOrderById(orderNumber);
  if (!order) {
    return res.status(404).json({ error: `No se encontró ningún pedido con el número ${orderNumber}. Verifica y vuelve a intentar.` });
  }
  return res.json(order);
});

// Customer's Orders (Protected)
app.get('/api/orders/my-orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrdersByCustomerId(req.user!.id);
  return res.json(orders);
});

// Submit payment proof
app.post('/api/orders/:id/payment-proof', (req: Request, res: Response) => {
  const { reference, notes } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const updatedHistory = [
    ...order.statusHistory,
    {
      status: 'pendiente_pago' as OrderStatus,
      note: `Comprobante de pago enviado: Referencia #${reference || 'Sin ref'}. ${notes || ''}`.trim(),
      timestamp: new Date().toISOString(),
      updatedBy: 'Cliente'
    }
  ];

  const updated = db.updateOrder(order.id, {
    paymentReference: reference,
    paymentStatus: 'verificando',
    statusHistory: updatedHistory
  });

  return res.json(updated);
});

// --- ADMIN ROUTES ---
app.get('/api/admin/dashboard', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers();

  const totalSales = orders
    .filter(o => o.orderStatus !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingConfirmation = orders.filter(o => o.orderStatus === 'pendiente_confirmacion').length;
  const pendingPayment = orders.filter(o => o.orderStatus === 'pendiente_pago').length;
  const inPreparation = orders.filter(o => o.orderStatus === 'en_preparacion').length;
  const outForDelivery = orders.filter(o => o.orderStatus === 'en_camino').length;
  const delivered = orders.filter(o => o.orderStatus === 'entregado').length;
  const canceled = orders.filter(o => o.orderStatus === 'cancelado').length;

  const lowStock = products.filter(p => p.stock <= 10);

  return res.json({
    metrics: {
      totalSales,
      totalOrders: orders.length,
      pendingOrders: pendingConfirmation + pendingPayment,
      inPreparation,
      outForDelivery,
      delivered,
      canceled,
      totalProducts: products.length,
      totalCustomers: users.filter(u => u.role === 'customer').length
    },
    lowStockProducts: lowStock,
    recentOrders: orders.slice(0, 8)
  });
});

app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let orders = db.getOrders();

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter(o => o.orderStatus === status);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    orders = orders.filter(
      o =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.recipientName.toLowerCase().includes(s) ||
        o.customerPhone.includes(s)
    );
  }

  return res.json(orders);
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, note, paymentStatus } = req.body;
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const validStatuses: OrderStatus[] = [
    'pendiente_confirmacion',
    'pendiente_pago',
    'pago_recibido',
    'en_preparacion',
    'listo_entrega',
    'en_camino',
    'entregado',
    'cancelado'
  ];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado de pedido no válido.' });
  }

  const updatedHistory = [...order.statusHistory];
  if (status && status !== order.orderStatus) {
    updatedHistory.push({
      status: status as OrderStatus,
      note: note || `Estado actualizado a ${status}`,
      timestamp: new Date().toISOString(),
      updatedBy: req.user!.name
    });
  }

  const updated = db.updateOrder(order.id, {
    ...(status && { orderStatus: status }),
    ...(paymentStatus && { paymentStatus }),
    statusHistory: updatedHistory
  });

  return res.json(updated);
});

// Products Admin CRUD
app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, subcategory, price, stock, available, imageUrl, featured } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios.' });
  }

  const newProd: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    description: description || '',
    category,
    subcategory: subcategory || 'Varios',
    price: Number(price),
    stock: Number(stock) || 0,
    available: available !== undefined ? Boolean(available) : true,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    featured: Boolean(featured)
  };

  const created = db.createProduct(newProd);
  return res.status(201).json(created);
});

app.put('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, subcategory, price, stock, available, imageUrl, featured } = req.body;
  const updated = db.updateProduct(req.params.id, {
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(category && { category }),
    ...(subcategory && { subcategory }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(available !== undefined && { available: Boolean(available) }),
    ...(imageUrl && { imageUrl }),
    ...(featured !== undefined && { featured: Boolean(featured) })
  });

  if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.json(updated);
});

app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.json({ success: true });
});

// Settings Admin
app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// Customers Admin
app.get('/api/admin/customers', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    address: u.address,
    city: u.city,
    createdAt: u.createdAt
  }));
  return res.json(users);
});

// Coupons Admin
app.get('/api/admin/coupons', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  return res.json(db.getCoupons());
});

app.post('/api/admin/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, value, minOrder, active, description } = req.body;
  if (!code || !value) return res.status(400).json({ error: 'Código y valor son requeridos.' });

  const coupon = db.createCoupon({
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percent',
    value: Number(value),
    minOrder: Number(minOrder) || 0,
    active: active !== undefined ? Boolean(active) : true,
    description: description || ''
  });
  return res.status(201).json(coupon);
});

app.delete('/api/admin/coupons/:code', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteCoupon(req.params.code);
  return res.json({ success });
});

// --- VITE DEV & STATIC PRODUCTION SERVING ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
