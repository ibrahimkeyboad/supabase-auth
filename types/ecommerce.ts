export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number; // Price in TZS
  originalPrice?: number;
  rating: number;
  reviews: number;
  supplier: string;
  categoryId: string;
  createdAt: string;
  variants?: ProductVariant[];
  options?: ProductOption[];
  inStock: boolean;
  stockQuantity: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceAdjustment: number; // Additional cost in TZS
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
  required: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  price: number; // Price per unit in TZS
  quantity: number;
  supplier: string;
  selectedVariants?: { [key: string]: string };
  selectedOptions?: { [key: string]: string };
  subtotal: number; // quantity * price in TZS
}

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'bank_transfer' | 'cash_on_delivery' | 'card';
  provider: string; // M-Pesa, Airtel Money, Tigo Pesa, etc.
  accountNumber?: string;
  isDefault: boolean;
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number; // Price in TZS
  estimatedDays: string;
  regions: string[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  price: number; // Price per unit in TZS
  quantity: number;
  supplier: string;
  selectedVariants?: { [key: string]: string };
  selectedOptions?: { [key: string]: string };
  subtotal: number; // quantity * price in TZS
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number; // TZS
  tax: number; // TZS
  shippingCost: number; // TZS
  discountAmount: number; // TZS
  total: number; // TZS
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  discountCode?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  // Admin fields
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  priority?: 'low' | 'normal' | 'high';
  userId?: string; // ✅ Add userId field
}

export interface CheckoutState {
  step: 'shipping' | 'payment' | 'review' | 'complete';
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  discountCode?: string;
  isProcessing: boolean;
  errors: { [key: string]: string };
}

export interface CartSummary {
  itemCount: number;
  subtotal: number; // TZS
  tax: number; // TZS
  shippingCost: number; // TZS
  discountAmount: number; // TZS
  total: number; // TZS
}

export interface OrderStatusHistory {
  status: Order['status'];
  timestamp: string;
  note?: string;
}