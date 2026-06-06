import { create } from 'zustand';
import { mockOrders } from '../data/mockOrders';
import { createOrder, getOrdersByRestaurant, updateOrderPayment as updateSupabaseOrderPayment, updateOrderStatus as updateSupabaseOrderStatus } from '../services/ordersService';
import { getNextOrderStatus } from '../utils/orderHelpers';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

type OrdersDataSource = 'mock' | 'supabase';
type NewOrderPayload = Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'paymentStatus' | 'paymentMethod'> & {
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
};

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  dataSource: OrdersDataSource;
  activeRestaurantId: string | null;
  loadOrdersForRestaurant: (restaurantId?: string | null) => Promise<void>;
  addOrder: (order: NewOrderPayload) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateOrderPayment: (id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getNextOrderStatus: (status: OrderStatus) => OrderStatus | null;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: Array.isArray(mockOrders) ? mockOrders : [],
  isLoading: false,
  error: null,
  dataSource: 'mock',
  activeRestaurantId: null,
  loadOrdersForRestaurant: async (restaurantId) => {
    if (!restaurantId) {
      set({ orders: mockOrders, dataSource: 'mock', activeRestaurantId: null, error: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null, activeRestaurantId: restaurantId });
    try {
      const orders = await getOrdersByRestaurant(restaurantId);
      set({ orders, dataSource: 'supabase', isLoading: false, error: null });
    } catch (error) {
      set({
        orders: mockOrders,
        dataSource: 'mock',
        activeRestaurantId: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Siparişler alınamadı, demo veriler gösteriliyor.',
      });
    }
  },
  addOrder: async (order) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      const orderNumber = getNextOrderNumber(state.orders ?? []);
      await createOrder(
        {
          restaurant_id: state.activeRestaurantId,
          order_number: orderNumber,
          customer_name: order.customerName,
          customer_phone: order.customerPhone ?? null,
          delivery_address: order.deliveryAddress ?? null,
          table_number: order.tableNumber ?? null,
          order_type: order.type,
          status: 'new',
          payment_status: order.paymentStatus ?? 'unpaid',
          payment_method: order.paymentMethod ?? null,
          subtotal: order.subtotal,
          total: order.total,
          note: order.note ?? null,
        },
        order.items.map((item) => ({
          product_id: item.isComplimentary ? null : item.productId || null,
          consumable_item_id: item.consumableItemId ?? null,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          is_complimentary: Boolean(item.isComplimentary),
        })),
      );
      await get().loadOrdersForRestaurant(state.activeRestaurantId);
      return;
    }

    set((state) => ({
      orders: [
        {
          ...order,
          id: crypto.randomUUID(),
          orderNumber: getNextOrderNumber(state.orders ?? []),
          status: 'new',
          paymentStatus: order.paymentStatus ?? 'unpaid',
          paymentMethod: order.paymentMethod ?? null,
          createdAt: new Date().toISOString(),
        },
        ...(state.orders ?? []),
      ],
    }));
  },
  updateOrderStatus: async (id, status) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseOrderStatus(id, status);
      await get().loadOrdersForRestaurant(state.activeRestaurantId);
      return;
    }

    set((state) => ({
      orders: (state.orders ?? []).map((order) => {
        if (order.id !== id || order.status === 'cancelled' || order.status === 'delivered') {
          return order;
        }
        return { ...order, status };
      }),
    }));
  },
  updateOrderPayment: async (id, paymentStatus, paymentMethod) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseOrderPayment(id, paymentStatus, paymentMethod);
      await get().loadOrdersForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      orders: (currentState.orders ?? []).map((order) =>
        order.id === id ? { ...order, paymentStatus, paymentMethod: paymentMethod ?? null } : order,
      ),
    }));
  },
  cancelOrder: async (id) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseOrderStatus(id, 'cancelled');
      await get().loadOrdersForRestaurant(state.activeRestaurantId);
      return;
    }

    set((state) => ({
      orders: (state.orders ?? []).map((order) =>
        order.id === id && order.status !== 'delivered' ? { ...order, status: 'cancelled' } : order,
      ),
    }));
  },
  getOrdersByStatus: (status) => (get().orders ?? []).filter((order) => order.status === status),
  getNextOrderStatus,
}));

function getNextOrderNumber(orders: Order[]) {
  const lastNumber = orders.reduce((max, order) => {
    const orderNumber = Number((order.orderNumber ?? '').replace('RY-', ''));
    return Number.isFinite(orderNumber) ? Math.max(max, orderNumber) : max;
  }, 1000);

  return `RY-${lastNumber + 1}`;
}
