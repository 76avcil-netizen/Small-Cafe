import { Banknote, Clock, PackageCheck, ReceiptText } from 'lucide-react';
import { useMemo } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { Badge } from '../components/ui/Badge';
import { useMenuStore } from '../store/menuStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getOrderStatusBadgeTone, getOrderStatusLabel, getOrderTypeLabel } from '../utils/orderHelpers';
import { getOperationalSummary, getSafeOrders, getSafeProducts } from '../utils/restaurantMetrics';

export function Dashboard() {
  const products = useMenuStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);
  const currency = useSettingsStore((state) => state.settings.currency);
  const safeProducts = useMemo(() => getSafeProducts(products), [products]);
  const safeOrders = useMemo(() => getSafeOrders(orders), [orders]);
  const summary = useMemo(() => getOperationalSummary(safeOrders, safeProducts), [safeOrders, safeProducts]);
  const topProducts = useMemo(
    () => [...safeProducts].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)).slice(0, 5),
    [safeProducts],
  );
  const recentOrders = useMemo(() => safeOrders.slice(0, 4), [safeOrders]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bugünkü Kazanç" value={formatCurrency(summary.revenue, currency)} icon={Banknote} helper="Tahsil edilen siparişler" />
        <StatCard title="Aktif Sipariş" value={summary.activeOrders.toString()} icon={ReceiptText} helper="Devam eden operasyon" />
        <StatCard title="Bekleyen Sipariş" value={summary.waitingOrders.toString()} icon={Clock} helper="Yeni veya hazırlanıyor" />
        <StatCard title="Satıştaki Ürün" value={summary.availableProducts.toString()} icon={PackageCheck} helper="Menü aktif" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold text-white">En Çok Satan Ürünler</h2>
          <div className="mt-5 space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 rounded-2xl bg-app p-4">
                <div>
                  <p className="font-semibold text-white">{product.name}</p>
                  <p className="text-sm text-muted">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{product.soldCount}</p>
                  <p className="text-xs text-muted">satış</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold text-white">Son Siparişler</h2>
          <div className="mt-5 space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-app p-4">
                <div>
                  <p className="font-semibold text-white">{order.customerName}</p>
                  <p className="text-sm text-muted">{order.orderNumber} · {getOrderTypeLabel(order.type)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={getOrderStatusBadgeTone(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                  <strong>{formatCurrency(order.total, currency)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
