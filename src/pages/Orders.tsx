import { CheckCircle2, Clock, Flame, Plus, ReceiptText } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { NewOrderModal } from '../components/orders/NewOrderModal';
import { OrderCard } from '../components/orders/OrderCard';
import { Button } from '../components/ui/Button';
import { useConsumableStore } from '../store/consumableStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/formatCurrency';
import { getOrderStatusLabel, orderStatusFilters } from '../utils/orderHelpers';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

export function Orders() {
  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const error = useOrderStore((state) => state.error);
  const dataSource = useOrderStore((state) => state.dataSource);
  const addOrder = useOrderStore((state) => state.addOrder);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const updateOrderPayment = useOrderStore((state) => state.updateOrderPayment);
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const decrementConsumableQuantity = useConsumableStore((state) => state.decrementConsumableQuantity);
  const currency = useSettingsStore((state) => state.settings.currency);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeOrders = useMemo(() => (Array.isArray(orders) ? orders.filter(Boolean) : []), [orders]);
  const statusCounts = useMemo(() => {
    const counts = orderStatusFilters.reduce(
      (currentCounts, status) => ({ ...currentCounts, [status]: 0 }),
      {} as Record<OrderStatus | 'all', number>,
    );

    counts.all = safeOrders.length;
    safeOrders.forEach((order) => {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
    });

    return counts;
  }, [safeOrders]);
  const orderSummary = useMemo(() => {
    const activeOrders = safeOrders.filter((order) => order.status !== 'cancelled' && order.status !== 'delivered');
    const waitingOrders = safeOrders.filter((order) => order.status === 'new' || order.status === 'preparing');
    const readyOrders = safeOrders.filter((order) => order.status === 'ready');
    const activeTotal = activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const paidTotal = safeOrders
      .filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled')
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return {
      active: activeOrders.length,
      waiting: waitingOrders.length,
      ready: readyOrders.length,
      activeTotal,
      paidTotal,
    };
  }, [safeOrders]);
  const filteredOrders = useMemo(
    () => safeOrders.filter((order) => activeFilter === 'all' || order.status === activeFilter),
    [activeFilter, safeOrders],
  );
  const handleAddOrder = useCallback(
    (
      order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'paymentStatus' | 'paymentMethod'> & {
        paymentStatus?: PaymentStatus;
        paymentMethod?: PaymentMethod | null;
      },
    ) => {
      void addOrder(order)
        .then(async () => {
          const complimentaryItems = order.items.filter((item) => item.isComplimentary && item.consumableItemId);
          await Promise.all(
            complimentaryItems.map((item) => decrementConsumableQuantity(item.consumableItemId!, item.quantity)),
          );
        })
        .catch((error) => {
          console.error('Sipariş veya ikram stok düşümü tamamlanamadı.', error);
        });
    },
    [addOrder, decrementConsumableQuantity],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Canlı operasyon</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Siparişler</h2>
          <p className="mt-1 text-muted">Aktif siparişleri önceliklendirin, hazırlık akışını takip edin ve durumları hızlıca güncelleyin.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-line bg-card px-3 py-1 text-muted">
              Veri kaynağı: {dataSource === 'supabase' ? 'Supabase' : 'Demo veri'}
            </span>
            {isLoading ? <span className="text-orange-300">Siparişler yükleniyor...</span> : null}
          </div>
        </div>
        <Button className="w-full md:w-auto" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Yeni Sipariş
        </Button>
      </section>

      {error ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-orange-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <OrderMetricCard
          icon={<ReceiptText size={18} />}
          label="Aktif sipariş"
          value={orderSummary.active.toString()}
          helper="Teslim ve iptal hariç"
        />
        <OrderMetricCard
          icon={<Clock size={18} />}
          label="Hazırlık bekleyen"
          value={orderSummary.waiting.toString()}
          helper="Yeni veya hazırlanıyor"
        />
        <OrderMetricCard
          icon={<CheckCircle2 size={18} />}
          label="Teslime hazır"
          value={orderSummary.ready.toString()}
          helper="Hızlı aksiyon bekliyor"
        />
        <OrderMetricCard
          icon={<Flame size={18} />}
          label="Ödenen tutar"
          value={formatCurrency(orderSummary.paidTotal, currency)}
          helper="İptal hariç tahsilat"
        />
      </section>

      <section className="rounded-2xl border border-line bg-card p-3 shadow-soft">
        <div className="flex gap-2 overflow-x-auto pb-1">
        {orderStatusFilters.map((filter) => (
          <button
            key={filter}
            aria-pressed={activeFilter === filter}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              activeFilter === filter ? 'border-primary bg-primary text-white' : 'border-line bg-app text-muted hover:border-primary/60 hover:text-white'
            }`}
            type="button"
            onClick={() => setActiveFilter(filter)}
          >
            <span>{getOrderStatusLabel(filter)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${activeFilter === filter ? 'bg-white/20 text-white' : 'bg-white/5 text-stone-300'}`}>
              {statusCounts[filter] ?? 0}
            </span>
          </button>
        ))}
        </div>
      </section>

      {filteredOrders.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={(id, status) => void updateOrderStatus(id, status)}
              onPaymentChange={(id, paymentStatus, paymentMethod) => void updateOrderPayment(id, paymentStatus, paymentMethod)}
              onCancel={(id) => void cancelOrder(id)}
            />
          ))}
        </section>
      ) : (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card p-8 text-center">
          <h3 className="text-lg font-bold text-white">Bu görünümde sipariş yok</h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            Filtreyi değiştirerek diğer siparişleri kontrol edebilir veya yeni bir sipariş oluşturabilirsiniz.
          </p>
          <Button className="mt-5" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
            Yeni Sipariş
          </Button>
        </section>
      )}

      <NewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddOrder} />
    </div>
  );
}

function OrderMetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">{label}</p>
          <strong className="mt-2 block text-2xl font-bold text-white">{value}</strong>
          <p className="mt-2 text-xs text-muted">{helper}</p>
        </div>
        <div className="rounded-xl bg-primary/15 p-2 text-primary">{icon}</div>
      </div>
    </article>
  );
}
