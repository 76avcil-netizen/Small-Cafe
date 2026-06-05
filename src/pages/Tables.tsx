import { Banknote, CheckCircle2, CreditCard, Eye, ReceiptText, UsersRound } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import type { Order, Table } from '../types';
import {
  buildTablesFromOrders,
  getOrderTotal,
  isActiveOrder,
} from '../utils/restaurantMetrics';
import {
  getNextOrderStatus,
  getOrderStatusBadgeTone,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusBadgeTone,
  getPaymentStatusLabel,
} from '../utils/orderHelpers';

export function Tables() {
  const orders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const updateOrderPayment = useOrderStore((state) => state.updateOrderPayment);
  const currency = useSettingsStore((state) => state.settings.currency);
  const tables = useMemo(() => buildTablesFromOrders(orders), [orders]);
  const tableOrders = useMemo(() => groupActiveTableOrders(orders), [orders]);
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null);
  const selectedTable = selectedTableNumber ? tables.find((table) => table.number === selectedTableNumber) ?? null : null;
  const selectedOrders = selectedTableNumber ? tableOrders.get(selectedTableNumber) ?? [] : [];
  const occupiedTables = tables.filter((table) => table.status !== 'Boş').length;
  const waitingPaymentTables = tables.filter((table) => table.status === 'Ödeme Bekliyor').length;
  const openTableTotal = tables.reduce((sum, table) => sum + (table.totalAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Masa Yönetimi</h2>
          <p className="mt-1 text-muted">Salon doluluğunu, masadaki siparişleri ve tahsilatı takip edin</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
          <SummaryPill label="Dolu" value={`${occupiedTables}`} />
          <SummaryPill label="Ödeme" value={`${waitingPaymentTables}`} />
          <SummaryPill label="Açık" value={formatCurrency(openTableTotal, currency)} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const activeOrders = tableOrders.get(table.number) ?? [];
          const unpaidOrders = activeOrders.filter((order) => order.paymentStatus !== 'paid');
          const readyOrders = activeOrders.filter((order) => order.status === 'ready');
          const canCloseTable = activeOrders.length > 0 && unpaidOrders.length === 0;

          return (
            <article key={table.id} className="flex min-h-[270px] flex-col rounded-2xl border border-line bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-white">Masa {table.number}</h3>
                <Badge tone={getTableBadgeTone(table)}>{table.status}</Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <TableStat icon={<ReceiptText size={16} />} label="Sipariş" value={`${table.currentOrderCount ?? 0}`} />
                <TableStat icon={<UsersRound size={16} />} label="Bekleyen" value={`${unpaidOrders.length}`} />
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-app p-4">
                <p className="text-xs text-muted">Masa tutarı</p>
                <strong className="mt-1 block text-2xl text-white">{formatCurrency(table.totalAmount ?? 0, currency)}</strong>
                <p className="mt-2 text-xs text-muted">
                  {activeOrders.length > 0
                    ? readyOrders.length > 0
                      ? `${readyOrders.length} sipariş servise hazır`
                      : 'Aktif servis devam ediyor'
                    : 'Aktif sipariş yok'}
                </p>
              </div>

              <div className="mt-auto grid gap-2 pt-4">
                {unpaidOrders.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="h-9 px-3"
                      icon={<Banknote size={16} />}
                      type="button"
                      variant="secondary"
                      onClick={() => void markTablePaid(unpaidOrders, 'cash')}
                    >
                      Nakit
                    </Button>
                    <Button
                      className="h-9 px-3"
                      icon={<CreditCard size={16} />}
                      type="button"
                      variant="secondary"
                      onClick={() => void markTablePaid(unpaidOrders, 'card')}
                    >
                      Kart
                    </Button>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-9 px-3"
                    icon={<Eye size={16} />}
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedTableNumber(table.number)}
                  >
                    Detay
                  </Button>
                  <Button
                    className="h-9 px-3"
                    disabled={!canCloseTable}
                    icon={<CheckCircle2 size={16} />}
                    type="button"
                    onClick={() => void closeTable(activeOrders)}
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <Modal
        isOpen={selectedTable !== null}
        title={selectedTable ? `Masa ${selectedTable.number} Detayı` : 'Masa detayı'}
        onClose={() => setSelectedTableNumber(null)}
      >
        {selectedTable ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryTile label="Durum" value={selectedTable.status} />
              <SummaryTile label="Sipariş" value={`${selectedTable.currentOrderCount ?? 0}`} />
              <SummaryTile label="Toplam" value={formatCurrency(selectedTable.totalAmount ?? 0, currency)} />
            </div>

            {selectedOrders.length > 0 ? (
              <div className="space-y-3">
                {selectedOrders.map((order) => {
                  const next = getNextOrderStatus(order.status);
                  const canMoveNext = next !== null && next !== order.status;

                  return (
                    <article key={order.id} className="rounded-2xl border border-line bg-app p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-muted">{order.orderNumber}</p>
                          <h4 className="mt-1 text-base font-bold text-white">{order.customerName}</h4>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge tone={getOrderStatusBadgeTone(order.status)}>{getOrderStatusLabel(order.status)}</Badge>
                          <Badge tone={getPaymentStatusBadgeTone(order.paymentStatus)}>{getPaymentStatusLabel(order.paymentStatus)}</Badge>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.productId}`} className="flex justify-between gap-3 text-sm">
                            <span className="text-stone-200">{item.quantity} x {item.productName}</span>
                            <span className="text-muted">{formatCurrency(item.totalPrice, currency)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <div>
                          <p className="text-xs text-muted">{getPaymentMethodLabel(order.paymentMethod)}</p>
                          <strong className="text-lg text-white">{formatCurrency(getOrderTotal(order), currency)}</strong>
                        </div>
                        <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col">
                          {order.paymentStatus !== 'paid' ? (
                            <>
                              <Button className="h-9 px-3" type="button" variant="secondary" onClick={() => void updateOrderPayment(order.id, 'paid', 'cash')}>
                                Nakit
                              </Button>
                              <Button className="h-9 px-3" type="button" variant="secondary" onClick={() => void updateOrderPayment(order.id, 'paid', 'card')}>
                                Kart
                              </Button>
                            </>
                          ) : null}
                          {canMoveNext ? (
                            <Button className="h-9 px-3" type="button" onClick={() => void updateOrderStatus(order.id, next)}>
                              {getOrderStatusLabel(next)}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-line bg-app p-4 text-center text-sm text-muted">Bu masada aktif sipariş yok.</p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );

  async function markTablePaid(targetOrders: Order[], paymentMethod: 'cash' | 'card') {
    await Promise.all(targetOrders.map((order) => updateOrderPayment(order.id, 'paid', paymentMethod)));
  }

  async function closeTable(targetOrders: Order[]) {
    await Promise.all(
      targetOrders
        .filter((order) => order.status !== 'delivered')
        .map((order) => updateOrderStatus(order.id, 'delivered')),
    );
  }
}

function groupActiveTableOrders(orders: Order[]) {
  const grouped = new Map<number, Order[]>();

  orders
    .filter((order) => order.type === 'table' && isActiveOrder(order))
    .forEach((order) => {
      const tableNumber = resolveTableNumber(order);
      grouped.set(tableNumber, [...(grouped.get(tableNumber) ?? []), order]);
    });

  return grouped;
}

function resolveTableNumber(order: Order, tableCount = 12) {
  if (order.tableNumber && order.tableNumber > 0) {
    return Math.min(tableCount, order.tableNumber);
  }

  const orderNumber = Number((order.orderNumber ?? '').replace('RY-', ''));
  if (!Number.isFinite(orderNumber)) {
    return 1;
  }

  return (Math.abs(orderNumber - 1) % tableCount) + 1;
}

function getTableBadgeTone(table: Table): 'default' | 'success' | 'danger' | 'warning' {
  if (table.status === 'Boş') {
    return 'success';
  }

  if (table.status === 'Ödeme Bekliyor') {
    return 'warning';
  }

  return 'default';
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-2 text-center">
      <p className="text-xs text-muted">{label}</p>
      <strong className="mt-1 block truncate text-sm text-white">{value}</strong>
    </div>
  );
}

function TableStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-app p-3">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs text-muted">{label}</span></div>
      <strong className="mt-2 block text-lg text-white">{value}</strong>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-app p-4">
      <p className="text-xs text-muted">{label}</p>
      <strong className="mt-2 block text-lg text-white">{value}</strong>
    </div>
  );
}
