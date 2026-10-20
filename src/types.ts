export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  address?: string;
  city?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'dulces' | 'salados' | 'otros';
  subcategory: string;
  price: number;
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
  orderNumber: string;
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

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  description: string;
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}
