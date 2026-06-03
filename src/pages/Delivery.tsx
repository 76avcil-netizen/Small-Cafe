import { MapPin, Phone } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { Badge } from '../components/ui/Badge';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { buildDeliveryOrdersFromOrders } from '../utils/restaurantMetrics';
import { useMemo } from 'react';

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
                <Badge tone={order.status === 'Teslim Edildi' ? 'success' : 'warning'}>{order.status}</Badge>
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-app p-4 text-sm text-stone-200"><MapPin className="mt-0.5 shrink-0" size={16} />{order.address}</p>
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
