import { CreditCard, MapPin, Phone, WalletCards } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { Badge } from '../components/ui/Badge';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore, type AppCurrency } from '../store/settingsStore';
import { buildDeliveryOrdersFromOrders } from '../utils/restaurantMetrics';
import { useMemo } from 'react';
import { getPaymentMethodLabel } from '../utils/orderHelpers';

export function Delivery() {
  const orders = useOrderStore((state) => state.orders);
  const currency = useSettingsStore((state) => state.settings.currency);
  const deliveryOrders = useMemo(() => buildDeliveryOrdersFromOrders(orders), [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Paket Servis</h2>
        <p className="mt-1 text-muted">Kurye ve teslimat sürecini izleyin</p>
      </div>
      {deliveryOrders.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {deliveryOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-line bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{order.customerName}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted"><Phone size={15} />{order.phone}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge tone={order.status === 'Teslim Edildi' ? 'success' : 'warning'}>{order.status}</Badge>
                  <Badge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                    {getDeliveryPaymentLabel(order)}
                  </Badge>
                </div>
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-app p-4 text-sm text-stone-200"><MapPin className="mt-0.5 shrink-0" size={16} />{order.address}</p>
              <div className={getDeliveryPaymentPanelClassName(order)}>
                {order.paymentStatus === 'paid' && order.paymentMethod === 'online' ? (
                  <CreditCard className="mt-0.5 shrink-0 text-green-300" size={18} />
                ) : (
                  <WalletCards className="mt-0.5 shrink-0 text-orange-300" size={18} />
                )}
                <div>
                  <p className="text-sm font-bold text-white">{getDeliveryPaymentTitle(order)}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{getDeliveryPaymentDescription(order, currency)}</p>
                </div>
              </div>
              {order.note ? <p className="mt-3 text-sm text-orange-200">Not: {order.note}</p> : null}
              <strong className="mt-5 block text-2xl text-white">{formatCurrency(order.totalAmount, currency)}</strong>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-line bg-card p-8 text-center text-muted">Aktif paket servis siparişi yok.</div>
      )}
    </div>
  );
}

function getDeliveryPaymentLabel(order: ReturnType<typeof buildDeliveryOrdersFromOrders>[number]) {
  if (order.paymentStatus === 'paid' && order.paymentMethod === 'online') {
    return 'Online ödendi';
  }

  if (order.paymentStatus === 'paid') {
    return order.paymentMethod ? `${getPaymentMethodLabel(order.paymentMethod)} ödendi` : 'Ödendi';
  }

  return 'Tahsilat var';
}

function getDeliveryPaymentTitle(order: ReturnType<typeof buildDeliveryOrdersFromOrders>[number]) {
  if (order.paymentStatus === 'paid' && order.paymentMethod === 'online') {
    return 'Online ödeme alındı';
  }

  if (order.paymentStatus === 'paid') {
    return order.paymentMethod ? `${getPaymentMethodLabel(order.paymentMethod)} ödeme alındı` : 'Ödeme alındı';
  }

  return 'Kapıda tahsilat alınacak';
}

function getDeliveryPaymentDescription(order: ReturnType<typeof buildDeliveryOrdersFromOrders>[number], currency: AppCurrency) {
  if (order.paymentStatus === 'paid') {
    return 'Kurye müşteriden tekrar ödeme istememeli.';
  }

  return `${formatCurrency(order.totalAmount, currency)} teslimatta tahsil edilecek.`;
}

function getDeliveryPaymentPanelClassName(order: ReturnType<typeof buildDeliveryOrdersFromOrders>[number]) {
  const tone =
    order.paymentStatus === 'paid' && order.paymentMethod === 'online'
      ? 'border-success/30 bg-success/10'
      : 'border-primary/30 bg-primary/10';

  return `mt-3 flex items-start gap-3 rounded-2xl border p-4 ${tone}`;
}
