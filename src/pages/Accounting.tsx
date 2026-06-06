import { CalendarClock, PackageCheck, Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useConsumableStore } from '../store/consumableStore';
import { useExpenseStore } from '../store/expenseStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import type { ConsumableItem, ConsumableUsageType, Expense } from '../types';
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
  const consumables = useConsumableStore((state) => state.consumables);
  const consumableError = useConsumableStore((state) => state.error);
  const consumableDataSource = useConsumableStore((state) => state.dataSource);
  const addConsumable = useConsumableStore((state) => state.addConsumable);
  const updateConsumable = useConsumableStore((state) => state.updateConsumable);
  const deleteConsumable = useConsumableStore((state) => state.deleteConsumable);
  const isConsumableLoading = useConsumableStore((state) => state.isLoading);
  const currency = useSettingsStore((state) => state.settings.currency);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isConsumableModalOpen, setIsConsumableModalOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expenseNote, setExpenseNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [consumableFormError, setConsumableFormError] = useState<string | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingConsumable, setIsSavingConsumable] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingConsumable, setEditingConsumable] = useState<ConsumableItem | null>(null);
  const [consumableName, setConsumableName] = useState('');
  const [consumableCategory, setConsumableCategory] = useState('');
  const [consumableQuantity, setConsumableQuantity] = useState('');
  const [consumableUnit, setConsumableUnit] = useState('adet');
  const [consumableUnitCost, setConsumableUnitCost] = useState('');
  const [consumablePurchaseDate, setConsumablePurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [consumableExpiryDate, setConsumableExpiryDate] = useState('');
  const [consumableStorageLocation, setConsumableStorageLocation] = useState('');
  const [consumableUsageType, setConsumableUsageType] = useState<ConsumableUsageType>('sarf');
  const [consumableNote, setConsumableNote] = useState('');
  const accounting = useMemo(() => {
    const paidOrders = orders.filter(isPaidOrder);
    const revenue = sumOrderTotals(paidOrders);
    const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const channelRevenue = getRevenueByChannel(orders);
    const consumableValue = consumables.reduce((sum, item) => sum + item.quantity * (item.unitCost ?? 0), 0);
    const expiredCount = consumables.filter((item) => getExpiryState(item.expiryDate) === 'expired').length;
    const expiringSoonCount = consumables.filter((item) => getExpiryState(item.expiryDate) === 'soon').length;
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
      consumables: {
        totalValue: consumableValue,
        expiredCount,
        expiringSoonCount,
      },
    };
  }, [consumables, expenses, orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Muhasebe</h2>
          <p className="mt-1 text-muted">Teslim edilen siparişlerden gelir ve günlük gider özeti</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button icon={<PackageCheck size={18} />} variant="secondary" onClick={openCreateConsumableModal}>
            Sarf ekle
          </Button>
          <Button icon={<Plus size={18} />} onClick={openCreateExpenseModal}>
            Gider ekle
          </Button>
        </div>
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
            <h3 className="text-lg font-bold text-white">Sarf Stok Takibi</h3>
            <p className="mt-1 text-sm text-muted">
              Alınan ürün, kalan miktar ve son kullanım tarihi kontrolü · İkram seçilenler siparişten düşer · Veri kaynağı: {consumableDataSource === 'supabase' ? 'Supabase' : 'Demo veri'}
            </p>
          </div>
          <Button icon={<Plus size={18} />} variant="secondary" onClick={openCreateConsumableModal}>
            Kayıt ekle
          </Button>
        </div>
        {consumableError ? (
          <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{consumableError}</p>
        ) : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryTile label="Sarf değeri" value={formatCurrency(accounting.consumables.totalValue, currency)} />
          <SummaryTile label="SKT yaklaşan" value={`${accounting.consumables.expiringSoonCount} ürün`} muted={accounting.consumables.expiringSoonCount === 0} />
          <SummaryTile label="SKT geçmiş" value={`${accounting.consumables.expiredCount} ürün`} muted={accounting.consumables.expiredCount === 0} />
        </div>
        <div className="mt-4 divide-y divide-line">
          {consumables.length > 0 ? consumables.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-3 py-4 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-stone-200">{item.name}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getConsumableExpiryClass(item.expiryDate)}`}>
                    {getConsumableExpiryLabel(item.expiryDate)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {[
                    getUsageTypeLabel(item.usageType),
                    item.category,
                    `${item.quantity} ${item.unit}`,
                    item.storageLocation,
                  ].filter(Boolean).join(' · ')}
                </p>
                {item.note ? <p className="mt-2 text-xs leading-5 text-orange-200">{item.note}</p> : null}
              </div>
              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <div className="text-right">
                  <strong className="block text-stone-200">{formatCurrency(item.quantity * (item.unitCost ?? 0), currency)}</strong>
                  <span className="text-xs text-muted">{item.expiryDate ? `SKT ${formatExpenseDate(item.expiryDate)}` : 'SKT yok'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    aria-label={`${item.name} sarf kaydını düzenle`}
                    className="h-9 w-9 px-0"
                    type="button"
                    variant="secondary"
                    onClick={() => openEditConsumableModal(item)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    aria-label={`${item.name} sarf kaydını sil`}
                    className="h-9 w-9 px-0"
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteConsumable(item)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <p className="py-6 text-center text-sm text-muted">Henüz sarf veya ikram kaydı yok.</p>
          )}
        </div>
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

      <Modal isOpen={isConsumableModalOpen} title={editingConsumable ? 'Sarf kaydını düzenle' : 'Sarf kaydı ekle'} onClose={closeConsumableModal}>
        <form className="space-y-5" onSubmit={handleConsumableSubmit}>
          <div className="rounded-xl border border-line bg-app p-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-primary/20 p-2 text-primary">
                <CalendarClock size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">SKT ve stok kontrolü</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  İkram olarak kullanılacak sarfları sipariş ekranından ücretsiz kalem olarak düşebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {consumableFormError ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{consumableFormError}</p>
          ) : null}

          <label className="block text-sm font-semibold text-stone-200">
            Ürün adı
            <Input
              className="mt-2"
              placeholder="Örn. acı sos paket, ikram çayı"
              value={consumableName}
              onChange={(event) => setConsumableName(event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-stone-200">
              Kullanım tipi
              <select
                className="mt-2 w-full rounded-xl border border-line bg-app px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={consumableUsageType}
                onChange={(event) => setConsumableUsageType(event.target.value as ConsumableUsageType)}
              >
                <option value="sarf">Sarf</option>
                <option value="ikram">İkram</option>
                <option value="mutfak">Mutfak</option>
                <option value="paketleme">Paketleme</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-stone-200">
              Kategori
              <Input
                className="mt-2"
                placeholder="Sos, temizlik, ikram..."
                value={consumableCategory}
                onChange={(event) => setConsumableCategory(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-stone-200">
              Miktar
              <Input
                className="mt-2"
                inputMode="decimal"
                min="0"
                step="0.01"
                type="number"
                value={consumableQuantity}
                onChange={(event) => setConsumableQuantity(event.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-stone-200">
              Birim
              <Input
                className="mt-2"
                placeholder="adet, kg, lt"
                value={consumableUnit}
                onChange={(event) => setConsumableUnit(event.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-stone-200">
              Birim maliyet
              <Input
                className="mt-2"
                inputMode="decimal"
                min="0"
                step="0.01"
                type="number"
                value={consumableUnitCost}
                onChange={(event) => setConsumableUnitCost(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-stone-200">
              Alım tarihi
              <Input
                className="mt-2"
                type="date"
                value={consumablePurchaseDate}
                onChange={(event) => setConsumablePurchaseDate(event.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-stone-200">
              Son kullanım tarihi
              <Input
                className="mt-2"
                type="date"
                value={consumableExpiryDate}
                onChange={(event) => setConsumableExpiryDate(event.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-stone-200">
            Saklama yeri
            <Input
              className="mt-2"
              placeholder="Soğuk dolap, kuru depo..."
              value={consumableStorageLocation}
              onChange={(event) => setConsumableStorageLocation(event.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-stone-200">
            Not
            <textarea
              className="mt-2 min-h-24 w-full rounded-xl border border-line bg-app px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Örn. önce bu parti tüketilecek"
              value={consumableNote}
              onChange={(event) => setConsumableNote(event.target.value)}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeConsumableModal}>
              Vazgeç
            </Button>
            <Button disabled={isSavingConsumable || isConsumableLoading} type="submit">
              {isSavingConsumable ? 'Kaydediliyor' : editingConsumable ? 'Değişiklikleri kaydet' : 'Kaydı ekle'}
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

  async function handleConsumableSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = consumableName.trim();
    const normalizedQuantity = Number(consumableQuantity);
    const normalizedUnitCost = consumableUnitCost.trim() ? Number(consumableUnitCost) : undefined;
    const normalizedUnit = consumableUnit.trim();

    if (!normalizedName) {
      setConsumableFormError('Ürün adı zorunludur.');
      return;
    }

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      setConsumableFormError('Miktar sıfırdan büyük olmalıdır.');
      return;
    }

    if (!normalizedUnit) {
      setConsumableFormError('Birim zorunludur.');
      return;
    }

    if (normalizedUnitCost !== undefined && (!Number.isFinite(normalizedUnitCost) || normalizedUnitCost < 0)) {
      setConsumableFormError('Birim maliyet negatif olamaz.');
      return;
    }

    setConsumableFormError(null);
    setIsSavingConsumable(true);

    try {
      const payload = {
        name: normalizedName,
        category: consumableCategory.trim() || undefined,
        quantity: normalizedQuantity,
        unit: normalizedUnit,
        unitCost: normalizedUnitCost,
        purchaseDate: consumablePurchaseDate || new Date().toISOString().slice(0, 10),
        expiryDate: consumableExpiryDate || undefined,
        storageLocation: consumableStorageLocation.trim() || undefined,
        usageType: consumableUsageType,
        note: consumableNote.trim() || undefined,
      };

      if (editingConsumable) {
        await updateConsumable(editingConsumable.id, payload);
      } else {
        await addConsumable(payload);
      }
      closeConsumableModal();
    } catch (error) {
      setConsumableFormError(error instanceof Error ? error.message : 'Sarf kaydı kaydedilemedi.');
    } finally {
      setIsSavingConsumable(false);
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

  function closeConsumableModal() {
    setIsConsumableModalOpen(false);
    setEditingConsumable(null);
    setConsumableName('');
    setConsumableCategory('');
    setConsumableQuantity('');
    setConsumableUnit('adet');
    setConsumableUnitCost('');
    setConsumablePurchaseDate(new Date().toISOString().slice(0, 10));
    setConsumableExpiryDate('');
    setConsumableStorageLocation('');
    setConsumableUsageType('sarf');
    setConsumableNote('');
    setConsumableFormError(null);
  }

  function openCreateConsumableModal() {
    setEditingConsumable(null);
    setConsumableName('');
    setConsumableCategory('');
    setConsumableQuantity('');
    setConsumableUnit('adet');
    setConsumableUnitCost('');
    setConsumablePurchaseDate(new Date().toISOString().slice(0, 10));
    setConsumableExpiryDate('');
    setConsumableStorageLocation('');
    setConsumableUsageType('sarf');
    setConsumableNote('');
    setConsumableFormError(null);
    setIsConsumableModalOpen(true);
  }

  function openEditConsumableModal(item: ConsumableItem) {
    setEditingConsumable(item);
    setConsumableName(item.name);
    setConsumableCategory(item.category ?? '');
    setConsumableQuantity(String(item.quantity));
    setConsumableUnit(item.unit);
    setConsumableUnitCost(item.unitCost === undefined ? '' : String(item.unitCost));
    setConsumablePurchaseDate(item.purchaseDate);
    setConsumableExpiryDate(item.expiryDate ?? '');
    setConsumableStorageLocation(item.storageLocation ?? '');
    setConsumableUsageType(item.usageType);
    setConsumableNote(item.note ?? '');
    setConsumableFormError(null);
    setIsConsumableModalOpen(true);
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

  async function handleDeleteConsumable(item: ConsumableItem) {
    const confirmed = window.confirm(`${item.name} sarf kaydı silinsin mi?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteConsumable(item.id);
    } catch (error) {
      setConsumableFormError(error instanceof Error ? error.message : 'Sarf kaydı silinemedi.');
      setIsConsumableModalOpen(true);
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

function getExpiryState(value?: string) {
  if (!value) {
    return 'none';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(value);
  expiryDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(expiryDate.getTime())) {
    return 'none';
  }

  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / 86400000);
  if (daysLeft < 0) {
    return 'expired';
  }

  if (daysLeft <= 7) {
    return 'soon';
  }

  return 'safe';
}

function getConsumableExpiryClass(value?: string) {
  const state = getExpiryState(value);

  if (state === 'expired') {
    return 'border-danger/30 bg-danger/10 text-red-200';
  }

  if (state === 'soon') {
    return 'border-primary/30 bg-primary/10 text-orange-200';
  }

  if (state === 'safe') {
    return 'border-success/30 bg-success/10 text-green-200';
  }

  return 'border-line bg-app text-muted';
}

function getConsumableExpiryLabel(value?: string) {
  const state = getExpiryState(value);

  if (state === 'expired') {
    return 'SKT geçmiş';
  }

  if (state === 'soon') {
    return 'SKT yaklaşıyor';
  }

  if (state === 'safe') {
    return 'SKT uygun';
  }

  return 'SKT yok';
}

function getUsageTypeLabel(value: ConsumableUsageType) {
  const labels: Record<ConsumableUsageType, string> = {
    ikram: 'İkram',
    sarf: 'Sarf',
    mutfak: 'Mutfak',
    paketleme: 'Paketleme',
  };

  return labels[value];
}
