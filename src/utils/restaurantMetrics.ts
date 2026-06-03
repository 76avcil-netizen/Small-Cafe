import type { DeliveryOrder, Order, Product, Table } from '../types';

export const DAILY_EXPENSES = [
  { name: 'Sebze ve garnitür', amount: 280 },
  { name: 'Paket malzemesi', amount: 170 },
  { name: 'Kurye yakıt desteği', amount: 230 },
];

export function getSafeOrders(orders: Order[]) {
  return Array.isArray(orders) ? orders.filter(Boolean) : [];
}

export function getSafeProducts(products: Product[]) {
  return Array.isArray(products) ? products.filter(Boolean) : [];
}

export function isActiveOrder(order: Order) {
  return order.status !== 'cancelled' && order.status !== 'delivered';
}

export function isCompletedOrder(order: Order) {
  return order.status === 'delivered';
}

export function isPaidOrder(order: Order) {
  return order.paymentStatus === 'paid' && order.status !== 'cancelled';
}

export function sumOrderTotals(orders: Order[]) {
  return orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
}

export function getOrderTotal(order: Order) {
  const itemTotal = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
    : 0;

  return Number(order.total) || itemTotal;
}

export function getOperationalSummary(orders: Order[], products: Product[]) {
  const safeOrders = getSafeOrders(orders);
  const activeOrders = safeOrders.filter(isActiveOrder);
  const completedOrders = safeOrders.filter(isCompletedOrder);
  const paidOrders = safeOrders.filter(isPaidOrder);
  const waitingOrders = safeOrders.filter((order) => order.status === 'new' || order.status === 'preparing');
  const readyOrders = safeOrders.filter((order) => order.status === 'ready');
  const availableProducts = getSafeProducts(products).filter((product) => product.isAvailable);

  return {
    activeOrders: activeOrders.length,
    completedOrders: completedOrders.length,
    waitingOrders: waitingOrders.length,
    readyOrders: readyOrders.length,
    activeTotal: sumOrderTotals(activeOrders),
    revenue: sumOrderTotals(paidOrders),
    availableProducts: availableProducts.length,
  };
}

export function buildTablesFromOrders(orders: Order[], tableCount = 12): Table[] {
  const tables: Table[] = Array.from({ length: tableCount }, (_, index) => ({
    id: `t-${index + 1}`,
    number: index + 1,
    status: 'Boş',
    currentOrderCount: 0,
    totalAmount: 0,
  }));

  getSafeOrders(orders)
    .filter((order) => order.type === 'table' && isActiveOrder(order))
    .forEach((order) => {
      const table = tables[getTableIndex(order, tableCount)];
      table.currentOrderCount = (table.currentOrderCount ?? 0) + 1;
      table.totalAmount = (table.totalAmount ?? 0) + getOrderTotal(order);
      table.status = order.status === 'ready' ? 'Ödeme Bekliyor' : 'Dolu';
    });

  return tables;
}

export function buildDeliveryOrdersFromOrders(orders: Order[]): DeliveryOrder[] {
  return getSafeOrders(orders)
    .filter((order) => order.type === 'delivery' && order.status !== 'cancelled')
    .map((order) => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.customerPhone || 'Telefon eklenmedi',
      address: order.deliveryAddress || 'Adres bilgisi yok',
      totalAmount: getOrderTotal(order),
      status: mapOrderStatusToDeliveryStatus(order.status),
      note: order.note,
    }));
}

export function getRevenueByChannel(orders: Order[]) {
  const completedOrders = getSafeOrders(orders).filter(isPaidOrder);

  return {
    table: sumOrderTotals(completedOrders.filter((order) => order.type === 'table')),
    delivery: sumOrderTotals(completedOrders.filter((order) => order.type === 'delivery')),
    takeaway: sumOrderTotals(completedOrders.filter((order) => order.type === 'takeaway')),
  };
}

export function getCategorySales(orders: Order[], products: Product[]) {
  const productCategoryMap = new Map(getSafeProducts(products).map((product) => [product.id, product.category]));
  const totals = new Map<string, number>();

  getSafeOrders(orders)
    .filter((order) => order.status !== 'cancelled')
    .flatMap((order) => order.items ?? [])
    .forEach((item) => {
      const category = productCategoryMap.get(item.productId) ?? 'Diğer';
      totals.set(category, (totals.get(category) ?? 0) + (Number(item.totalPrice) || 0));
    });

  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopProductsFromOrders(orders: Order[]) {
  const totals = new Map<string, { label: string; value: number }>();

  getSafeOrders(orders)
    .filter((order) => order.status !== 'cancelled')
    .flatMap((order) => order.items ?? [])
    .forEach((item) => {
      const current = totals.get(item.productId) ?? { label: item.productName || 'Ürün', value: 0 };
      current.value += Number(item.quantity) || 0;
      totals.set(item.productId, current);
    });

  return [...totals.values()].sort((a, b) => b.value - a.value);
}

export function getWeeklyRevenue(orders: Order[]) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      label: new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(date),
      value: 0,
      day: date,
    };
  });

  getSafeOrders(orders)
    .filter(isPaidOrder)
    .forEach((order) => {
      const createdAt = new Date(order.createdAt);
      const target = days.find((day) => startOfDay(createdAt).getTime() === day.day.getTime());
      if (target) {
        target.value += getOrderTotal(order);
      }
    });

  return days.map(({ label, value }) => ({ label, value }));
}

export function getBusyHours(orders: Order[]) {
  const buckets = new Map<string, number>();

  getSafeOrders(orders)
    .filter((order) => order.status !== 'cancelled')
    .forEach((order) => {
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const label = `${date.getHours().toString().padStart(2, '0')}:00`;
      buckets.set(label, (buckets.get(label) ?? 0) + 1);
    });

  return [...buckets.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr-TR'));
}

function getTableIndex(order: Order, tableCount: number) {
  if (order.tableNumber && order.tableNumber > 0) {
    return Math.min(tableCount - 1, order.tableNumber - 1);
  }

  const orderNumber = Number((order.orderNumber ?? '').replace('RY-', ''));
  if (!Number.isFinite(orderNumber)) {
    return 0;
  }
  return Math.abs(orderNumber - 1) % tableCount;
}

function mapOrderStatusToDeliveryStatus(status: Order['status']): DeliveryOrder['status'] {
  if (status === 'delivered') {
    return 'Teslim Edildi';
  }
  if (status === 'ready') {
    return 'Kurye Bekliyor';
  }
  return 'Hazırlanıyor';
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
