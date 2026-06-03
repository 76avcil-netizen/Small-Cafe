import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { Badge } from '../components/ui/Badge';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { buildTablesFromOrders } from '../utils/restaurantMetrics';

export function Tables() {
  const orders = useOrderStore((state) => state.orders);
  const currency = useSettingsStore((state) => state.settings.currency);
  const tables = useMemo(() => buildTablesFromOrders(orders), [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Masa Yönetimi</h2>
        <p className="mt-1 text-muted">Salon doluluğunu ve ödeme durumlarını takip edin</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <article key={table.id} className="rounded-2xl border border-line bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-white">Masa {table.number}</h3>
              <Badge tone={table.status === 'Boş' ? 'success' : table.status === 'Ödeme Bekliyor' ? 'warning' : 'default'}>{table.status}</Badge>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-muted"><span>Sipariş</span><span>{table.currentOrderCount ?? 0}</span></div>
              <div className="flex justify-between text-muted"><span>Tutar</span><span>{formatCurrency(table.totalAmount ?? 0, currency)}</span></div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
