import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { Order, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '../types';

export interface OrderItemPayload {
  product_id?: string | null;
  consumable_item_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_complimentary?: boolean;
  note?: string | null;
}

export interface OrderPayload {
  restaurant_id: string;
  order_number: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  delivery_address?: string | null;
  table_number?: number | null;
  order_type: OrderType;
  status: OrderStatus;
  payment_status?: 'unpaid' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'card' | 'online' | null;
  subtotal: number;
  discount?: number;
  total: number;
  note?: string | null;
}

export async function getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*, order_items(*)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Siparişler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return (data ?? []).map(mapOrderRow);
}

export async function createOrder(payload: OrderPayload, items: OrderItemPayload[] = []) {
  const supabase = getSupabaseClient();
  const { data: order, error } = await supabase.from('orders').insert(payload).select('*').single();
  if (error) {
    throw new Error(`Sipariş oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  if (items.length > 0) {
    const orderItems = items.map((item) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      const { error: cleanupError } = await supabase.from('orders').delete().eq('id', order.id);
      const cleanupMessage = cleanupError
        ? ` Ana sipariş temizlenemedi: ${getSafeSupabaseErrorDetails(cleanupError)}`
        : '';

      throw new Error(`Sipariş kalemleri oluşturulamadı: ${getSafeSupabaseErrorDetails(itemsError)}.${cleanupMessage}`);
    }
  }

  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data, error } = await getSupabaseClient().from('orders').update({ status }).eq('id', id).select('*').single();
  if (error) {
    throw new Error(`Sipariş durumu güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function cancelOrder(id: string) {
  return updateOrderStatus(id, 'cancelled');
}

export async function updateOrderPayment(id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null) {
  const { data, error } = await getSupabaseClient()
    .from('orders')
    .update({ payment_status: paymentStatus, payment_method: paymentMethod ?? null })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Ödeme bilgisi güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return data;
}

function mapOrderRow(row: Record<string, any>): Order {
  const items = Array.isArray(row.order_items) ? row.order_items : [];

  return {
    id: String(row.id),
    orderNumber: String(row.order_number ?? 'RY-0000'),
    customerName: String(row.customer_name ?? 'İsimsiz müşteri'),
    customerPhone: row.customer_phone ? String(row.customer_phone) : undefined,
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    tableNumber: Number(row.table_number) || undefined,
    type: normalizeOrderType(row.order_type),
    status: normalizeOrderStatus(row.status),
    paymentStatus: normalizePaymentStatus(row.payment_status),
    paymentMethod: normalizePaymentMethod(row.payment_method),
    items: items.map((item: Record<string, any>) => ({
      productId: String(item.product_id ?? ''),
      consumableItemId: item.consumable_item_id ? String(item.consumable_item_id) : undefined,
      productName: String(item.product_name ?? 'Ürün'),
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unit_price) || 0,
      totalPrice: Number(item.total_price) || 0,
      isComplimentary: Boolean(item.is_complimentary),
    })),
    subtotal: Number(row.subtotal) || 0,
    total: Number(row.total) || 0,
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function normalizeOrderType(value: unknown): OrderType {
  return value === 'delivery' || value === 'takeaway' || value === 'table' ? value : 'table';
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  return value === 'new' || value === 'preparing' || value === 'ready' || value === 'delivered' || value === 'cancelled'
    ? value
    : 'new';
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
  return value === 'paid' || value === 'refunded' || value === 'unpaid' ? value : 'unpaid';
}

function normalizePaymentMethod(value: unknown): PaymentMethod | null {
  return value === 'cash' || value === 'card' || value === 'online' ? value : null;
}
