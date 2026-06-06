import { Banknote, Coffee, CreditCard, Gift, Globe2, Minus, Plus, Search, Trash2, WalletCards } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useConsumableStore } from '../../store/consumableStore';
import { useMenuStore } from '../../store/menuStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { OrderItem, OrderType, PaymentMethod, PaymentStatus } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface NewOrderPayload {
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  tableNumber?: number;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  note?: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: NewOrderPayload) => void;
}

export function NewOrderModal(props: NewOrderModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return <NewOrderModalContent {...props} />;
}

function NewOrderModalContent({ isOpen, onClose, onSubmit }: NewOrderModalProps) {
  const products = useMenuStore((state) => state.products);
  const consumables = useConsumableStore((state) => state.consumables);
  const currency = useSettingsStore((state) => state.settings.currency);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>('table');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [formError, setFormError] = useState('');

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const availableProducts = useMemo(
    () => safeProducts.filter((product) => product && product.isAvailable !== false),
    [safeProducts],
  );
  const availableComplimentaryItems = useMemo(
    () => consumables.filter((item) => item.usageType === 'ikram' && item.quantity > 0),
    [consumables],
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('tr-TR');
    if (!query) {
      return availableProducts;
    }

    return availableProducts.filter((product) => {
      const name = (product.name ?? '').toLocaleLowerCase('tr-TR');
      const category = (product.category ?? '').toLocaleLowerCase('tr-TR');
      return name.includes(query) || category.includes(query);
    });
  }, [availableProducts, searchTerm]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0),
    [cartItems],
  );

  function resetForm() {
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setTableNumber(1);
    setOrderType('table');
    setPaymentStatus('unpaid');
    setPaymentMethod(null);
    setNote('');
    setSearchTerm('');
    setCartItems([]);
    setFormError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function addProductToCart(productId: string) {
    const product = availableProducts.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setFormError('');
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item,
        );
      }

      const unitPrice = Number(product.price) || 0;
      return [
        ...currentItems,
        {
          productId: product.id,
          productName: product.name || 'Ürün',
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
        },
      ];
    });
  }

  function addComplimentaryToCart(consumableItemId: string) {
    const consumable = availableComplimentaryItems.find((item) => item.id === consumableItemId);
    if (!consumable) {
      return;
    }

    setFormError('');
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.consumableItemId === consumable.id && item.isComplimentary);
      if (existingItem) {
        if (existingItem.quantity >= consumable.quantity) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.consumableItemId === consumable.id && item.isComplimentary
            ? { ...item, quantity: item.quantity + 1, totalPrice: 0 }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          productId: `ikram-${consumable.id}`,
          productName: `${consumable.name} (İkram)`,
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          isComplimentary: true,
          consumableItemId: consumable.id,
        },
      ];
    });
  }

  function increaseQuantity(productId: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (item.isComplimentary && item.consumableItemId) {
          const consumable = availableComplimentaryItems.find((currentItem) => currentItem.id === item.consumableItemId);
          if (consumable && item.quantity >= consumable.quantity) {
            return item;
          }

          return { ...item, quantity: item.quantity + 1, totalPrice: 0 };
        }

        return { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice };
      }),
    );
  }

  function decreaseQuantity(productId: string) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1, totalPrice: (item.quantity - 1) * item.unitPrice }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCartItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function getCartQuantity(productId: string) {
    return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function getComplimentaryQuantity(consumableItemId: string) {
    return cartItems.find((item) => item.consumableItemId === consumableItemId && item.isComplimentary)?.quantity ?? 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCustomerName = customerName.trim();

    if (orderType !== 'table' && !normalizedCustomerName) {
      setFormError('Müşteri adı gerekli.');
      return;
    }
    if (cartItems.length === 0) {
      setFormError('En az bir ürün seçin.');
      return;
    }
    if (orderType === 'table' && (!tableNumber || tableNumber < 1)) {
      setFormError('Masa numarası gerekli.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setFormError('Paket servis için adres gerekli.');
      return;
    }

    onSubmit({
      customerName: normalizedCustomerName || `Masa ${tableNumber}`,
      customerPhone: customerPhone.trim() || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      tableNumber: orderType === 'table' ? tableNumber : undefined,
      type: orderType,
      items: cartItems,
      subtotal: total,
      total,
      paymentStatus,
      paymentMethod: paymentStatus === 'paid' ? paymentMethod : null,
      note: note.trim() || undefined,
    });
    resetForm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title="Yeni Sipariş" onClose={handleClose}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{formError}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-200">
              Müşteri adı{orderType === 'table' ? ' (opsiyonel)' : ''}
            </span>
            <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-200">Sipariş tipi</span>
            <select
              className="min-h-11 w-full rounded-xl border border-line bg-app px-4 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={orderType}
              onChange={(event) => setOrderType(event.target.value as OrderType)}
            >
              <option value="table">Masa</option>
              <option value="delivery">Paket Servis</option>
              <option value="takeaway">Gel-Al</option>
            </select>
          </label>
        </div>

        {orderType === 'table' ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-200">Masa numarası</span>
            <Input
              min="1"
              type="number"
              value={tableNumber}
              onChange={(event) => setTableNumber(Number(event.target.value))}
            />
          </label>
        ) : null}

        {orderType === 'delivery' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Telefon</span>
              <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Adres</span>
              <Input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
            </label>
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-stone-200">Sipariş notu</span>
          <Input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>

        <div className="space-y-3 rounded-2xl border border-line bg-app p-4">
          <div>
            <p className="text-sm font-semibold text-stone-200">Ödeme durumu</p>
            <p className="mt-1 text-xs leading-5 text-muted">Bu bilgi sipariş kartında ve paket servis ekranında görünür.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <PaymentOptionButton
              active={paymentStatus === 'unpaid'}
              icon={<WalletCards size={17} />}
              label="Tahsilat sonra"
              helper="Sipariş ödenmedi"
              onClick={() => {
                setPaymentStatus('unpaid');
                setPaymentMethod(null);
              }}
            />
            <PaymentOptionButton
              active={paymentStatus === 'paid' && paymentMethod === 'cash'}
              icon={<Banknote size={17} />}
              label="Nakit ödendi"
              helper="Kasada veya teslimatta"
              onClick={() => {
                setPaymentStatus('paid');
                setPaymentMethod('cash');
              }}
            />
            <PaymentOptionButton
              active={paymentStatus === 'paid' && paymentMethod === 'card'}
              icon={<CreditCard size={17} />}
              label="Kart ödendi"
              helper="POS ile tahsil edildi"
              onClick={() => {
                setPaymentStatus('paid');
                setPaymentMethod('card');
              }}
            />
            <PaymentOptionButton
              active={paymentStatus === 'paid' && paymentMethod === 'online'}
              icon={<Globe2 size={17} />}
              label="Online ödendi"
              helper="Kurye tahsilat almaz"
              onClick={() => {
                setPaymentStatus('paid');
                setPaymentMethod('online');
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-stone-200">Ürün seçimi</p>
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <Input
                className="pl-10"
                placeholder="Ürün ara"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-line bg-app p-3 transition hover:border-primary/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{product.name || 'Ürün'}</p>
                      <p className="text-sm text-muted">{product.category} · {formatCurrency(Number(product.price) || 0, currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 w-8 px-0"
                        onClick={() => decreaseQuantity(product.id)}
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold">{getCartQuantity(product.id)}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-8 w-8 px-0"
                        onClick={() => addProductToCart(product.id)}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-line bg-app p-5 text-center text-sm text-muted sm:col-span-2">
                Uygun ürün bulunamadı.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-app p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary/15 p-2 text-primary">
              <Gift size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-200">İkram ekle</p>
              <p className="mt-1 text-xs leading-5 text-muted">Siparişte görünür, tutara eklenmez ve sarf stoktan düşer.</p>
            </div>
          </div>

          <div className="grid max-h-48 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {availableComplimentaryItems.length > 0 ? availableComplimentaryItems.map((item) => {
              const selectedQuantity = getComplimentaryQuantity(item.id);

              return (
                <button
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 text-left transition hover:border-primary/60"
                  type="button"
                  onClick={() => addComplimentaryToCart(item.id)}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Coffee size={15} />
                      {item.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      Stok: {item.quantity} {item.unit} · Ücretsiz
                    </span>
                  </span>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                    {selectedQuantity}
                  </span>
                </button>
              );
            }) : (
              <div className="rounded-2xl border border-line bg-card p-5 text-center text-sm text-muted sm:col-span-2">
                Stokta ikram için işaretlenmiş sarf malzemesi yok.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-line bg-app p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-200">Sepet</p>
            <span className="text-xs text-muted">{cartItems.length} ürün</span>
          </div>
          {cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3">
                  <div>
                    <p className="font-semibold text-white">{item.productName}</p>
                    <p className="text-sm text-muted">
                      {item.quantity} x {item.isComplimentary ? 'İkram · faturaya yansımaz' : formatCurrency(item.unitPrice, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 w-8 px-0"
                      onClick={() => decreaseQuantity(item.productId)}
                    >
                      <Minus size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 w-8 px-0"
                      onClick={() => increaseQuantity(item.productId)}
                    >
                      <Plus size={14} />
                    </Button>
                    <strong className="text-white">{formatCurrency(item.totalPrice, currency)}</strong>
                    <Button
                      aria-label="Sepetten çıkar"
                      type="button"
                      variant="danger"
                      className="h-8 w-8 px-0"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-card p-4 text-center text-sm text-muted">Sepete ürün eklenmedi.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-app p-4">
          <span className="text-sm text-muted">Toplam tutar</span>
          <strong className="text-2xl text-white">{formatCurrency(total, currency)}</strong>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Vazgeç
          </Button>
          <Button type="submit">Sipariş Oluştur</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentOptionButton({
  active,
  icon,
  label,
  helper,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  helper: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-h-20 items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
        active ? 'border-primary bg-primary/20 text-white' : 'border-line bg-card text-stone-200 hover:border-primary/70'
      }`}
      type="button"
      onClick={onClick}
    >
      <span className={`rounded-lg p-2 ${active ? 'bg-primary text-white' : 'bg-app text-primary'}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-xs leading-4 text-muted">{helper}</span>
      </span>
    </button>
  );
}
