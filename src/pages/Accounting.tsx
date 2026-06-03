import { useMemo } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/formatCurrency';
import { DAILY_EXPENSES, getOrderTotal, getRevenueByChannel, isActiveOrder, isPaidOrder, sumOrderTotals } from '../utils/restaurantMetrics';

export function Accounting() {
  const orders = useOrderStore((state) => state.orders);
  const currency = useSettingsStore((state) => state.settings.currency);
  const accounting = useMemo(() => {
    const paidOrders = orders.filter(isPaidOrder);
    const revenue = sumOrderTotals(paidOrders);
    const expenses = DAILY_EXPENSES.reduce((sum, expense) => sum + expense.amount, 0);
    const channelRevenue = getRevenueByChannel(orders);
    const cashTotal = sumOrderTotals(paidOrders.filter((order) => order.paymentMethod === 'cash'));
    const cardTotal = sumOrderTotals(paidOrders.filter((order) => order.paymentMethod === 'card'));
    const onlineTotal = sumOrderTotals(paidOrders.filter((order) => order.paymentMethod === 'online'));
    const unpaidOrders = orders.filter((order) => order.paymentStatus !== 'paid' && order.status !== 'cancelled');
    const cancelledOrders = orders.filter((order) => order.status === 'cancelled');
    const activeOrders = orders.filter(isActiveOrder);
    const openTotal = activeOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);

    return {
      cards: [
        { label: 'Tahsilat', value: revenue },
        { label: 'Salon', value: channelRevenue.table },
        { label: 'Paket Servis', value: channelRevenue.delivery },
        { label: 'Gider', value: expenses },
        { label: 'Net Kazanç', value: revenue - expenses },
      ],
      dayEnd: {
        cashTotal,
        cardTotal,
        onlineTotal,
        unpaidCount: unpaidOrders.length,
        cancelledCount: cancelledOrders.length,
        openTotal,
      },
      expenses,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Muhasebe</h2>
        <p className="mt-1 text-muted">Teslim edilen siparişlerden gelir ve günlük gider özeti</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {accounting.cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-line bg-card p-5 shadow-soft">
            <p className="text-sm text-muted">{card.label}</p>
            <strong className="mt-3 block text-2xl text-white">{formatCurrency(card.value, currency)}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Gün Sonu Özeti</h3>
              <p className="mt-1 text-sm text-muted">Tahsilat ve açık sipariş durumu</p>
            </div>
            <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-green-200">
              Canlı hesap
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SummaryTile label="Nakit" value={formatCurrency(accounting.dayEnd.cashTotal, currency)} />
            <SummaryTile label="Kart" value={formatCurrency(accounting.dayEnd.cardTotal, currency)} />
            <SummaryTile label="Online" value={formatCurrency(accounting.dayEnd.onlineTotal, currency)} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SummaryTile label="Ödenmemiş" value={`${accounting.dayEnd.unpaidCount} sipariş`} muted />
            <SummaryTile label="İptal" value={`${accounting.dayEnd.cancelledCount} sipariş`} muted />
            <SummaryTile label="Açık Tutar" value={formatCurrency(accounting.dayEnd.openTotal, currency)} muted />
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <h3 className="text-lg font-bold text-white">Kasa Notu</h3>
          <div className="mt-5 space-y-3 text-sm leading-6 text-muted">
            <p>Tahsilat yalnızca ödeme durumu “Ödendi” olan siparişlerden hesaplanır.</p>
            <p>Açık tutar, teslim ya da iptal edilmemiş siparişlerin toplamıdır.</p>
            <p>Bu görünüm henüz kasa kapatma kaydı oluşturmaz; sadece mevcut operasyonun anlık özetidir.</p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-card p-5 shadow-soft">
        <h3 className="text-lg font-bold text-white">Gider Listesi</h3>
        <div className="mt-4 divide-y divide-line">
          {DAILY_EXPENSES.map((expense) => (
            <div key={expense.name} className="flex justify-between gap-4 py-4">
              <span className="text-stone-200">{expense.name}</span>
              <strong className="text-red-300">{formatCurrency(expense.amount, currency)}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryTile({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-app p-4">
      <p className="text-xs text-muted">{label}</p>
      <strong className={`mt-2 block text-lg ${muted ? 'text-stone-200' : 'text-white'}`}>{value}</strong>
    </div>
  );
}
