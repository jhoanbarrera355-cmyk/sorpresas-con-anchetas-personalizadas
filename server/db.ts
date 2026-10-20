import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ALL_PRODUCTS } from './productsData.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'customer';
  address?: string;
  city?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'dulces' | 'salados' | 'otros';
  subcategory: string;
  price: number; // In COP
  stock: number;
  available: boolean;
  imageUrl: string;
  featured?: boolean;
}

export interface AnchetaItemSelection {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  category: string;
}

export interface OrderItem {
  id: string;
  name: string;
  isCustomAncheta: boolean;
  size?: 'pequeña' | 'mediana' | 'grande';
  anchetaType?: 'tradicional' | 'dulces' | 'mixta';
  packaging?: string;
  occasion?: string;
  recipientName?: string;
  cardMessage?: string;
  selectedProducts?: AnchetaItemSelection[];
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export type OrderStatus =
  | 'pendiente_confirmacion'
  | 'pendiente_pago'
  | 'pago_recibido'
  | 'en_preparacion'
  | 'listo_entrega'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ANC-2026-1042"
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  neighborhood: string;
  recipientName: string;
  deliveryDate: string;
  cardMessage: string;
  specialInstructions: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'bancolombia' | 'nequi' | 'transferencia' | 'contra_entrega';
  paymentStatus: 'pendiente' | 'verificando' | 'aprobado' | 'rechazado';
  paymentReference?: string;
  orderStatus: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    note: string;
    timestamp: string;
    updatedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  value: number; // e.g. 10 for 10% or 15000 for 15.000 COP
  minOrder: number;
  active: boolean;
  description: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  email: string;
  address: string;
  deliveryFeeDefault: number;
  preparationTimeHours: number;
  bancolombiaAccount: string;
  bancolombiaAccountType: string;
  bancolombiaHolder: string;
  bancolombiaLink: string;
  bancolombiaInstructions: string;
  nequiNumber: string;
  nequiHolder: string;
  nequiLink: string;
  nequiInstructions: string;
  enableCashOnDelivery: boolean;
  cashOnDeliveryInstructions: string;
}

export interface Session {
  token: string;
  userId: string;
  role: 'admin' | 'customer';
  expiresAt: number;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: BusinessSettings;
  sessions: Record<string, Session>;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Password hashing utility with salt using Node crypto
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
}

// Initial Seed Data
const initialAdmin1 = hashPassword('Admin123*');
const initialAdmin2 = hashPassword('Ancheta2026*');

const defaultProducts: Product[] = ALL_PRODUCTS;

const defaultSettings: BusinessSettings = {
  businessName: 'Anchetas Personalizables (AP)',
  tagline: 'Detalles con amor, regalos que llegan al corazón.',
  whatsappNumber: '573143133440',
  email: 'jhoanbarrera355@gmail.com',
  address: 'Cra 32 # 19A - 20',
  deliveryFeeDefault: 12000,
  preparationTimeHours: 4,
  bancolombiaAccount: '245-891023-45',
  bancolombiaAccountType: 'Ahorros',
  bancolombiaHolder: 'Anchetas Personalizables (Jhoan Barrera)',
  bancolombiaLink: 'https://transacciones.bancolombia.com/pagos',
  bancolombiaInstructions: 'Transfiere a nuestra Cuenta de Ahorros Bancolombia Nº 245-891023-45 a nombre de Anchetas Personalizables. Adjunta o envía el comprobante por WhatsApp al 3143133440.',
  nequiNumber: '3143133440',
  nequiHolder: 'Anchetas Personalizables (Jhoan Barrera)',
  nequiLink: 'https://recarga.nequi.com.co',
  nequiInstructions: 'Envía desde tu app Nequi al 3143133440. En el concepto indica tu nombre y número de pedido. Envíanos el pantallazo al WhatsApp 3143133440 para despacho inmediato.',
  enableCashOnDelivery: true,
  cashOnDeliveryInstructions: 'Disponible únicamente para entregas en el perímetro urbano de Bogotá y Medellín. Se requiere un anticipo de $15.000 para apartado de ancheta.'
};

const defaultCoupons: Coupon[] = [
  {
    code: 'BIENVENIDO10',
    discountType: 'percent',
    value: 10,
    minOrder: 50000,
    active: true,
    description: '10% de descuento en tu primera compra (mínimo $50.000 COP)'
  },
  {
    code: 'AMORCON-S',
    discountType: 'fixed',
    value: 15000,
    minOrder: 90000,
    active: true,
    description: '$15.000 COP de regalo en pedidos superiores a $90.000 COP'
  },
  {
    code: 'FIESTA20',
    discountType: 'percent',
    value: 20,
    minOrder: 150000,
    active: true,
    description: '20% de descuento especial en anchetas familiares o corporativas'
  }
];

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [
      {
        id: 'usr-admin-1',
        name: 'Administrador Sorpresas con S',
        email: 'admin@sorpresascons.com',
        phone: '3123456789',
        passwordHash: initialAdmin1.hash,
        salt: initialAdmin1.salt,
        role: 'admin',
        city: 'Bogotá',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-admin-2',
        name: 'Jhoan Barrera (Admin)',
        email: 'jhoanbarrera355@gmail.com',
        phone: '3109876543',
        passwordHash: initialAdmin2.hash,
        salt: initialAdmin2.salt,
        role: 'admin',
        city: 'Bogotá',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-demo-client',
        name: 'Carolina Gómez',
        email: 'carolina@ejemplo.com',
        phone: '3157778899',
        passwordHash: initialAdmin1.hash,
        salt: initialAdmin1.salt,
        role: 'customer',
        address: 'Carrera 7 # 120-15 Apto 402',
        city: 'Bogotá',
        createdAt: new Date().toISOString()
      }
    ],
    products: defaultProducts,
    orders: [
      {
        id: 'ord-seed-01',
        orderNumber: 'ANC-2026-1001',
        customerId: 'usr-demo-client',
        customerName: 'Carolina Gómez',
        customerPhone: '3157778899',
        customerEmail: 'carolina@ejemplo.com',
        deliveryAddress: 'Carrera 7 # 120-15 Apto 402',
        city: 'Bogotá',
        neighborhood: 'Usaquén',
        recipientName: 'Carlos Morales',
        deliveryDate: '2026-10-22',
        cardMessage: '¡Feliz cumpleaños hermanito! Que este nuevo año esté lleno de éxitos, viajes y mucho chocolate.',
        specialInstructions: 'Timbrar en el 402. Si no responde, dejar con el vigilante Don Pedro.',
        items: [
          {
            id: 'item-1001-1',
            name: 'Ancheta Dulce Tentación con Peluche',
            isCustomAncheta: true,
            size: 'mediana',
            anchetaType: 'dulces',
            packaging: 'Caja de madera rústica',
            occasion: 'cumpleaños',
            recipientName: 'Carlos Morales',
            cardMessage: '¡Feliz cumpleaños hermanito! Que este nuevo año esté lleno de éxitos...',
            selectedProducts: [
              { productId: 'prod-dulce-01', productName: 'Caja de Bombones de Chocolate Belga', unitPrice: 24000, quantity: 1, category: 'dulces' },
              { productId: 'prod-dulce-02', productName: 'Chocolatina Jet Gigante', unitPrice: 14500, quantity: 2, category: 'dulces' },
              { productId: 'prod-dulce-07', productName: 'Brownie Melcochudo', unitPrice: 9500, quantity: 2, category: 'dulces' },
              { productId: 'prod-acc-01', productName: 'Peluche Oso Teddy Tierno Suave', unitPrice: 32000, quantity: 1, category: 'otros' },
              { productId: 'prod-acc-02', productName: 'Globo Metalizado con Helio', unitPrice: 15000, quantity: 1, category: 'otros' }
            ],
            unitPrice: 129500,
            quantity: 1,
            totalPrice: 129500
          }
        ],
        subtotal: 129500,
        shippingCost: 12000,
        discount: 10000,
        couponCode: 'BIENVENIDO10',
        total: 131500,
        paymentMethod: 'bancolombia',
        paymentStatus: 'aprobado',
        paymentReference: 'BCOL-89214710',
        orderStatus: 'en_preparacion',
        statusHistory: [
          { status: 'pendiente_confirmacion', note: 'Pedido registrado por cliente', timestamp: '2026-10-19T10:00:00Z', updatedBy: 'Sistema' },
          { status: 'pago_recibido', note: 'Comprobante Bancolombia verificado por tesorería', timestamp: '2026-10-19T10:30:00Z', updatedBy: 'Admin' },
          { status: 'en_preparacion', note: 'En taller de anchetas armando arreglos y moño', timestamp: '2026-10-19T11:15:00Z', updatedBy: 'Admin' }
        ],
        createdAt: '2026-10-19T10:00:00Z',
        updatedAt: '2026-10-19T11:15:00Z'
      }
    ],
    coupons: defaultCoupons,
    settings: defaultSettings,
    sessions: {}
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure new structures exist if schema changed
        if (!this.data.sessions) this.data.sessions = {};
        if (!this.data.coupons) this.data.coupons = defaultCoupons;
        if (!this.data.settings) this.data.settings = defaultSettings;
        if (!this.data.products || this.data.products.length === 0) this.data.products = defaultProducts;
      } catch (err) {
        console.error('Error reading database, initializing defaults:', err);
        this.data = getInitialDatabase();
        this.save();
      }
    } else {
      this.data = getInitialDatabase();
      this.save();
    }
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- SESSIONS ---
  createSession(userId: string, role: 'admin' | 'customer'): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    this.data.sessions[token] = { token, userId, role, expiresAt };
    this.save();
    return token;
  }

  getSession(token: string): Session | null {
    const session = this.data.sessions[token];
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      delete this.data.sessions[token];
      this.save();
      return null;
    }
    return session;
  }

  deleteSession(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
    }
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase());
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return this.data.orders
      .filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.orders[idx];
  }

  // --- SETTINGS ---
  getSettings(): BusinessSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<BusinessSettings>): BusinessSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- COUPONS ---
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  findCoupon(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
  }

  createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }

  updateCoupon(code: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  deleteCoupon(code: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    if (this.data.coupons.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
