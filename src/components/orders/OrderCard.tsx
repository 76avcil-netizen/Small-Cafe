import { ArrowRight, XCircle } from 'lucide-react';
import {
  formatDateTime,
  getNextOrderStatus,
  getOrderStatusBadgeTone,
  getOrderStatusLabel,
  getOrderTypeLabel,
  getPaymentMethodLabel,
  getPaymentStatusBadgeTone,
  getPaymentStatusLabel,
} from '../../utils/orderHelpers';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OrderCardProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onPaymentChange: (id: string, paymentStatus: PaymentStatus, paymentMethod?: PaymentMethod | null) => void;
  onCancel: (id: string) => void;
}

export function OrderCard({ order, onStatusChange, onPaymentChange, onCancel }: OrderCardProps) {
  const currency = useSettingsStore((state) => state.settings.currency);
  const safeItems = Array.isArray(order.items) ? order.items : [];
  const safeStatus = order.status ?? 'new';
  const next = getNextOrderStatus(safeStatus);
  const canCancel = safeStatus !== 'cancelled' && safeStatus !== 'delivered';
  const canMoveNext = next !== null && next !== safeStatus;
  const createdTime = formatDateTime(order.createdAt);
  const total = Number.isFinite(order.total) ? order.total : safeItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-soft transition hover:border-primary/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-semibold text-stone-300">{order.orderNumber || 'RY-0000'}</span>
            <span>·</span>
            <span>{getOrderTypeLabel(order.type)}</span>
            <span>·</span>
            <span>{createdTime}</span>
          </div>
          <h3 className="mt-2 truncate text-lg font-bold text-white">{order.customerName || 'İsimsiz müşteri'}</h3>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={getOrderStatusBadgeTone(safeStatus)}>{getOrderStatusLabel(safeStatus)}</Badge>
          <Badge tone={getPaymentStatusBadgeTone(order.paymentStatus)}>
            {getPaymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-2xl bg-app p-4">
        {safeItems.length > 0 ? safeItems.map((item) => (
          <div key={`${order.id}-${item.productId}`} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0 break-words text-stone-200">{item.quantity ?? 0} x {item.productName || 'Ürün'}</span>
            <span className="shrink-0 text-muted">{formatCurrency(item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 0), currency)}</span>
          </div>
        )) : <p className="text-sm text-muted">Ürün bilgisi yok.</p>}
      </div>
      {order.note ? <p className="mt-4 rounded-xl bg-app px-3 py-2 text-sm text-orange-200">Not: {order.note}</p> : null}
      <div className="mt-4 rounded-2xl border border-line bg-app p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Ödeme</p>
            <p className="mt-1 text-sm font-semibold text-stone-200">{getPaymentMethodLabel(order.paymentMethod)}</p>
          </div>
          {order.paymentStatus !== 'paid' && safeStatus !== 'cancelled' ? (
            <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col">
              <Button className="h-9 px-3" type="button" variant="secondary" onClick={() => onPaymentChange(order.id, 'paid', 'cash')}>
                Nakit
              </Button>
              <Button className="h-9 px-3" type="button" variant="secondary" onClick={() => onPaymentChange(order.id, 'paid', 'card')}>
                Kart
              </Button>
              <Button className="h-9 px-3" type="button" variant="secondary" onClick={() => onPaymentChange(order.id, 'paid', 'online')}>
                Online
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">{safeItems.length} kalem</p>
          <strong className="text-xl text-white">{formatCurrency(total, currency)}</strong>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col">
          {canCancel ? (
            <Button variant="danger" onClick={() => onCancel(order.id)} icon={<XCircle size={17} />}>
              İptal Et
            </Button>
          ) : null}
          {canMoveNext ? (
            <Button onClick={() => onStatusChange(order.id, next)} icon={<ArrowRight size={17} />}>
              {getOrderStatusLabel(next)}
            </Button>
          ) : (
            <Button variant="secondary" disabled>{safeStatus === 'cancelled' ? 'İptal' : 'Tamamlandı'}</Button>
          )}
        </div>
      </div>
    </article>
  );
}
