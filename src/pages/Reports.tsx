import { useMemo, type ReactNode } from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useMenuStore } from '../store/menuStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore, type AppCurrency } from '../store/settingsStore';
import type { Expense, Order } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getBusyHours,
  getCategorySales,
  getOrderTotal,
  getSafeOrders,
  getSafeProducts,
  getTopProductsFromOrders,
  getWeeklyRevenue,
  isActiveOrder,
  isPaidOrder,
  sumOrderTotals,
} from '../utils/restaurantMetrics';

export function Reports() {
  const products = useMenuStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);
  const expenses = useExpenseStore((state) => state.expenses);
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
  const liveEvaluation = useMemo(() => buildLiveEvaluation(safeOrders, expenses, currency), [currency, expenses, safeOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Raporlar</h2>
        <p className="mt-1 text-muted">Satış performansını ve operasyon verilerini inceleyin</p>
      </div>

      <section className="rounded-2xl border border-line bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Canlı İşletme Değerlendirmesi</h3>
            <p className="mt-1 text-sm text-muted">Sipariş, tahsilat ve giderlere göre anlık durum</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-green-200">
            <Activity size={14} />
            Canlı hesap
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Tahsilat" value={formatCurrency(liveEvaluation.revenue, currency)} />
          <MetricTile label="Gider" value={formatCurrency(liveEvaluation.expenseTotal, currency)} tone="danger" />
          <MetricTile label="Net" value={formatCurrency(liveEvaluation.net, currency)} tone={liveEvaluation.net >= 0 ? 'success' : 'danger'} />
          <MetricTile label="Ortalama Sipariş" value={formatCurrency(liveEvaluation.averageOrder, currency)} />
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {liveEvaluation.notes.map((note) => (
            <EvaluationNote key={note.title} {...note} />
          ))}
        </div>
      </section>

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

function buildLiveEvaluation(orders: Order[], expenses: Expense[], currency: AppCurrency) {
  const paidOrders = orders.filter(isPaidOrder);
  const activeOrders = orders.filter(isActiveOrder);
  const unpaidOrders = orders.filter((order) => order.paymentStatus !== 'paid' && order.status !== 'cancelled');
  const revenue = sumOrderTotals(paidOrders);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const net = revenue - expenseTotal;
  const averageOrder = paidOrders.length > 0 ? revenue / paidOrders.length : 0;
  const openTotal = activeOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const expenseRatio = revenue > 0 ? expenseTotal / revenue : 0;

  return {
    revenue,
    expenseTotal,
    net,
    averageOrder,
    notes: [
      {
        icon: net >= 0 ? TrendingUp : AlertTriangle,
        title: net >= 0 ? 'Net durum pozitif' : 'Net durum negatif',
        text: net >= 0 ? `${paidOrders.length} tahsil edilmiş sipariş kârı destekliyor.` : 'Giderler tahsilatı aşmış görünüyor.',
        tone: net >= 0 ? 'success' : 'danger',
      },
      {
        icon: AlertTriangle,
        title: unpaidOrders.length > 0 ? 'Tahsilat bekleyen var' : 'Tahsilat dengeli',
        text:
          unpaidOrders.length > 0
            ? `${unpaidOrders.length} sipariş için ödeme takibi gerekli.`
            : 'Ödenmemiş aktif sipariş görünmüyor.',
        tone: unpaidOrders.length > 0 ? 'warning' : 'success',
      },
      {
        icon: Activity,
        title: expenseRatio > 0.45 ? 'Gider oranı yüksek' : 'Operasyon dengesi',
        text:
          expenseRatio > 0.45
            ? `Giderler tahsilatın yaklaşık %${Math.round(expenseRatio * 100)} seviyesinde.`
            : `${formatCurrency(openTotal, currency)} açık operasyon tutarı takipte.`,
        tone: expenseRatio > 0.45 ? 'warning' : 'default',
      },
    ] as EvaluationNoteProps[],
  };
}

function MetricTile({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-green-200' : tone === 'danger' ? 'text-red-200' : 'text-white';

  return (
    <div className="rounded-2xl border border-line bg-app p-4">
      <p className="text-xs text-muted">{label}</p>
      <strong className={`mt-2 block text-xl ${toneClass}`}>{value}</strong>
    </div>
  );
}

interface EvaluationNoteProps {
  icon: typeof Activity;
  title: string;
  text: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
}

function EvaluationNote({ icon: Icon, title, text, tone }: EvaluationNoteProps) {
  const toneClass =
    tone === 'success'
      ? 'border-success/30 bg-success/10 text-green-200'
      : tone === 'warning'
        ? 'border-primary/30 bg-primary/10 text-orange-200'
        : tone === 'danger'
          ? 'border-danger/30 bg-danger/10 text-red-200'
          : 'border-line bg-app text-stone-200';

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <strong className="text-sm">{title}</strong>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{text}</p>
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
