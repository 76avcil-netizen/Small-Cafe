import { Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useExpenseStore } from '../store/expenseStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import type { Expense } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { getOrderTotal, getRevenueByChannel, isActiveOrder, isPaidOrder, sumOrderTotals } from '../utils/restaurantMetrics';

export function Accounting() {
  const orders = useOrderStore((state) => state.orders);
  const expenses = useExpenseStore((state) => state.expenses);
  const expenseError = useExpenseStore((state) => state.error);
  const expenseDataSource = useExpenseStore((state) => state.dataSource);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const isExpenseLoading = useExpenseStore((state) => state.isLoading);
  const currency = useSettingsStore((state) => state.settings.currency);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expenseNote, setExpenseNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const accounting = useMemo(() => {
    const paidOrders = orders.filter(isPaidOrder);
    const revenue = sumOrderTotals(paidOrders);
    const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
        { label: 'Gider', value: expenseTotal },
        { label: 'Net Kazanç', value: revenue - expenseTotal },
      ],
      dayEnd: {
        cashTotal,
        cardTotal,
        onlineTotal,
        unpaidCount: unpaidOrders.length,
        cancelledCount: cancelledOrders.length,
        openTotal,
      },
      expenseTotal,
    };
  }, [expenses, orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Muhasebe</h2>
          <p className="mt-1 text-muted">Teslim edilen siparişlerden gelir ve günlük gider özeti</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openCreateExpenseModal}>
          Gider ekle
        </Button>
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Gider Listesi</h3>
            <p className="mt-1 text-sm text-muted">Veri kaynağı: {expenseDataSource === 'supabase' ? 'Supabase' : 'Demo veri'}</p>
          </div>
          <strong className="text-lg text-red-300">{formatCurrency(accounting.expenseTotal, currency)}</strong>
        </div>
        {expenseError ? (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{expenseError}</p>
        ) : null}
        <div className="mt-4 divide-y divide-line">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <span className="font-semibold text-stone-200">{expense.name}</span>
                <p className="mt-1 text-xs text-muted">
                  {[expense.category, formatExpenseDate(expense.expenseDate)].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <strong className="text-red-300">{formatCurrency(expense.amount, currency)}</strong>
                <div className="flex items-center gap-2">
                  <Button
                    aria-label={`${expense.name} giderini düzenle`}
                    className="h-9 w-9 px-0"
                    type="button"
                    variant="secondary"
                    onClick={() => openEditExpenseModal(expense)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    aria-label={`${expense.name} giderini sil`}
                    className="h-9 w-9 px-0"
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteExpense(expense)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isExpenseModalOpen} title={editingExpense ? 'Gideri düzenle' : 'Gider ekle'} onClose={closeExpenseModal}>
        <form className="space-y-5" onSubmit={handleExpenseSubmit}>
          <div className="rounded-xl border border-line bg-app p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-primary/20 p-2 text-primary">
                <ReceiptText size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Yeni gider kaydı</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {editingExpense
                    ? 'Değişiklik Supabase modunda veritabanına, demo modunda geçici listeye uygulanır.'
                    : 'Kayıt Supabase modunda veritabanına, demo modunda geçici listeye eklenir.'}
                </p>
              </div>
            </div>
          </div>

          {formError ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{formError}</p>
          ) : null}

          <label className="block text-sm font-semibold text-stone-200">
            Gider adı
            <Input
              className="mt-2"
              placeholder="Örn. Un ve yağ alımı"
              value={expenseName}
              onChange={(event) => setExpenseName(event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-stone-200">
              Tutar
              <Input
                className="mt-2"
                inputMode="decimal"
                min="0"
                placeholder="0"
                step="0.01"
                type="number"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-stone-200">
              Tarih
              <Input
                className="mt-2"
                type="date"
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-stone-200">
            Kategori
            <Input
              className="mt-2"
              placeholder="Malzeme, kira, operasyon..."
              value={expenseCategory}
              onChange={(event) => setExpenseCategory(event.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-stone-200">
            Not
            <textarea
              className="mt-2 min-h-24 w-full rounded-xl border border-line bg-app px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="İsteğe bağlı açıklama"
              value={expenseNote}
              onChange={(event) => setExpenseNote(event.target.value)}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeExpenseModal}>
              Vazgeç
            </Button>
            <Button disabled={isSavingExpense || isExpenseLoading} type="submit">
              {isSavingExpense ? 'Kaydediliyor' : editingExpense ? 'Değişiklikleri kaydet' : 'Gideri kaydet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  async function handleExpenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = expenseName.trim();
    const normalizedAmount = Number(expenseAmount);

    if (!normalizedName) {
      setFormError('Gider adı zorunludur.');
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setFormError('Tutar sıfırdan büyük olmalıdır.');
      return;
    }

    setFormError(null);
    setIsSavingExpense(true);

    try {
      const payload = {
        name: normalizedName,
        amount: normalizedAmount,
        category: expenseCategory.trim() || undefined,
        expenseDate: expenseDate || new Date().toISOString().slice(0, 10),
        note: expenseNote.trim() || undefined,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }
      closeExpenseModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gider kaydedilemedi.');
    } finally {
      setIsSavingExpense(false);
    }
  }

  function closeExpenseModal() {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpenseNote('');
    setFormError(null);
  }

  function openCreateExpenseModal() {
    setEditingExpense(null);
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpenseNote('');
    setFormError(null);
    setIsExpenseModalOpen(true);
  }

  function openEditExpenseModal(expense: Expense) {
    setEditingExpense(expense);
    setExpenseName(expense.name);
    setExpenseAmount(String(expense.amount));
    setExpenseCategory(expense.category ?? '');
    setExpenseDate(expense.expenseDate);
    setExpenseNote(expense.note ?? '');
    setFormError(null);
    setIsExpenseModalOpen(true);
  }

  async function handleDeleteExpense(expense: Expense) {
    const confirmed = window.confirm(`${expense.name} gideri silinsin mi?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(expense.id);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gider silinemedi.');
      setIsExpenseModalOpen(true);
    }
  }
}

function formatExpenseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function SummaryTile({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-app p-4">
      <p className="text-xs text-muted">{label}</p>
      <strong className={`mt-2 block text-lg ${muted ? 'text-stone-200' : 'text-white'}`}>{value}</strong>
    </div>
  );
}
