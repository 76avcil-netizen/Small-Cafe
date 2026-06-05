export type Category = string;

export interface MenuCategory {
  id: string;
  name: string;
  slug?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  isAvailable: boolean;
  isFeatured?: boolean;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'table' | 'delivery' | 'takeaway';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'online';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  tableNumber?: number;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  note?: string;
  createdAt: string;
}

export type DeliveryStatus = 'Hazırlanıyor' | 'Kurye Bekliyor' | 'Yolda' | 'Teslim Edildi';

export interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: DeliveryStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  note?: string;
}

export type TableStatus = 'Boş' | 'Dolu' | 'Ödeme Bekliyor' | 'Rezerve';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  totalAmount?: number;
  currentOrderCount?: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category?: string;
  expenseDate: string;
  note?: string;
  createdAt: string;
}

export type IntegrationStatus = 'connected' | 'pending' | 'error' | 'disabled';
export type IntegrationEventStatus = 'success' | 'warning' | 'error';

export interface OperatorIntegration {
  id: string;
  restaurantId: string;
  name: string;
  status: IntegrationStatus;
  accountLabel?: string;
  lastCheckedAt?: string;
  lastError?: string;
}

export interface OperatorRestaurant {
  id: string;
  name: string;
  ownerEmail: string;
  city: string;
  users: number;
  integrations: OperatorIntegration[];
}

export interface OperatorIntegrationEvent {
  id: string;
  restaurantId?: string | null;
  restaurantName: string;
  provider: string;
  title: string;
  status: IntegrationEventStatus;
  receivedAt: string;
}
