import { useMemo, type ReactNode } from 'react';
import { useMenuStore } from '../store/menuStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore, type AppCurrency } from '../store/settingsStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getBusyHours, getCategorySales, getSafeOrders, getSafeProducts, getTopProductsFromOrders, getWeeklyRevenue } from '../utils/restaurantMetrics';

export function Reports() {
  const products = useMenuStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);
  const currency = useSettingsStore((state) => state.settings.currency);
  const safeProducts = useMemo(() => getSafeProducts(products), [products]);
  const safeOrders = useMemo(() => getSafeOrders(orders), [orders]);
  const topProducts = useMemo(() => getTopProductsFromOrders(safeOrders).slice(0, 4), [safeOrders]);
  const categorySales = useMemo(() => getCategorySales(safeOrders, safeProducts).slice(0, 4), [safeOrders, safeProducts]);
  const weeklyRevenue = useMemo(() => getWeeklyRevenue(safeOrders), [safeOrders]);
  const busyHours = useMemo(() => getBusyHours(safeOrders), [safeOrders]);
  const maxRevenue = Math.max(...weeklyRevenue.map((item) => item.value), 0);
  const maxCategorySale = Math.max(...categorySales.map((item) => item.value), 0);
  const maxBusyHour = Math.max(...busyHours.map((item) => item.value), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Raporlar</h2>
        <p className="mt-1 text-muted">Satış performansını ve operasyon verilerini inceleyin</p>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <ReportCard title="En Çok Satan Ürünler">
          {topProducts.length > 0 ? (
            topProducts.map((product) => (
              <ProgressRow key={product.label} label={product.label} value={product.value} max={Math.max(topProducts[0]?.value ?? 0, 1)} suffix="adet" />
            ))
          ) : (
            <EmptyState>Satış verisi bulunamadı.</EmptyState>
          )}
        </ReportCard>
        <ReportCard title="Kategori Bazlı Satış">
          {categorySales.length > 0 ? (
              categorySales.map((item) => (
                <ProgressRow
                  key={item.label}
                  currency={currency}
                  label={item.label}
                  value={item.value}
                  max={Math.max(maxCategorySale, 1)}
                  suffix=""
                  format="currency"
                />
              ))
          ) : (
            <EmptyState>Kategori verisi bulunamadı.</EmptyState>
          )}
        </ReportCard>
        <ReportCard title="Haftalık Ciro">
          {weeklyRevenue.length > 0 ? (
            <div className="flex h-48 items-end gap-3">
              {weeklyRevenue.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-xl bg-primary" style={{ height: `${maxRevenue > 0 ? (item.value / maxRevenue) * 100 : 0}%` }} />
                  <span className="text-xs text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Ciro verisi bulunamadı.</EmptyState>
          )}
        </ReportCard>
        <ReportCard title="Sipariş Yoğunluğu">
          {busyHours.length > 0 ? (
            busyHours.map((item) => <ProgressRow key={item.label} label={item.label} value={item.value} max={Math.max(maxBusyHour, 1)} suffix="sipariş" />)
          ) : (
            <EmptyState>Yoğunluk verisi bulunamadı.</EmptyState>
          )}
        </ReportCard>
      </section>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-line bg-app p-4 text-center text-sm text-muted">{children}</p>;
}

function ReportCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function ProgressRow({
  label,
  value,
  max,
  suffix,
  format,
  currency,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  format?: 'currency';
  currency?: AppCurrency;
}) {
  const displayValue = format === 'currency' ? formatCurrency(value, currency) : `${value} ${suffix}`;

  return (
    <div>
      <div className="mb-2 flex justify-between gap-4 text-sm">
        <span className="font-semibold text-stone-200">{label}</span>
        <span className="text-muted">{displayValue}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-app">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
