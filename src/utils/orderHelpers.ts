import type { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '../types';

export const orderStatusFilters: Array<OrderStatus | 'all'> = [
  'all',
  'new',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
];

export const orderStatusFlow: OrderStatus[] = ['new', 'preparing', 'ready', 'delivered'];

const statusLabels: Record<OrderStatus | 'all', string> = {
  all: 'Tümü',
  new: 'Yeni',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
};

const typeLabels: Record<OrderType, string> = {
  table: 'Masa',
  delivery: 'Paket Servis',
  takeaway: 'Gel-Al',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Ödenmedi',
  paid: 'Ödendi',
  refunded: 'İade',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Nakit',
  card: 'Kart',
  online: 'Online',
};

export function getOrderStatusLabel(status?: OrderStatus | 'all') {
  return statusLabels[status ?? 'new'] ?? 'Yeni';
}

export function getOrderTypeLabel(type?: OrderType) {
  return type ? typeLabels[type] ?? 'Masa' : 'Masa';
}

export function getPaymentStatusLabel(status?: PaymentStatus) {
  return paymentStatusLabels[status ?? 'unpaid'] ?? 'Ödenmedi';
}

export function getPaymentMethodLabel(method?: PaymentMethod | null) {
  return method ? paymentMethodLabels[method] ?? 'Ödeme' : 'Yöntem yok';
}

export function getPaymentStatusBadgeTone(status?: PaymentStatus): 'default' | 'success' | 'danger' | 'warning' {
  if (status === 'paid') {
    return 'success';
  }
  if (status === 'refunded') {
    return 'danger';
  }
  return 'warning';
}

export function getOrderStatusBadgeTone(status?: OrderStatus): 'default' | 'success' | 'danger' | 'warning' {
  if (status === 'delivered') {
    return 'success';
  }
  if (status === 'cancelled') {
    return 'danger';
  }
  if (status === 'ready') {
    return 'success';
  }
  return 'warning';
}

export function getNextOrderStatus(status?: OrderStatus): OrderStatus | null {
  if (!status) {
    return null;
  }
  if (status === 'delivered' || status === 'cancelled') {
    return status;
  }
  const currentIndex = orderStatusFlow.indexOf(status);
  if (currentIndex === -1 || currentIndex === orderStatusFlow.length - 1) {
    return null;
  }
  return orderStatusFlow[currentIndex + 1];
}

export function formatDateTime(value?: string) {
  if (!value) {
    return 'Tarih yok';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih yok';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
