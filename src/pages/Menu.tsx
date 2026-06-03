import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { ProductCard } from '../components/menu/ProductCard';
import { ProductModal } from '../components/menu/ProductModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';
import { useMenuStore } from '../store/menuStore';
import type { Category, Product } from '../types';

type ProductForm = Omit<Product, 'id' | 'soldCount' | 'createdAt' | 'updatedAt'>;

export function Menu() {
  const products = useMenuStore((state) => state.products);
  const categories = useMenuStore((state) => state.categories);
  const isLoading = useMenuStore((state) => state.isLoading);
  const error = useMenuStore((state) => state.error);
  const dataSource = useMenuStore((state) => state.dataSource);
  const loadMenuForRestaurant = useMenuStore((state) => state.loadMenuForRestaurant);
  const addCategory = useMenuStore((state) => state.addCategory);
  const addProduct = useMenuStore((state) => state.addProduct);
  const updateProduct = useMenuStore((state) => state.updateProduct);
  const deleteProduct = useMenuStore((state) => state.deleteProduct);
  const toggleProductAvailability = useMenuStore((state) => state.toggleProductAvailability);
  const authMode = useAuthStore((state) => state.mode);
  const restaurantId = useAuthStore((state) => state.profile?.restaurantId);
  const [activeCategory, setActiveCategory] = useState<Category>('Tümü');
  const [search, setSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    void loadMenuForRestaurant(authMode === 'supabase' ? restaurantId : null);
  }, [authMode, loadMenuForRestaurant, restaurantId]);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products.filter(Boolean) : []), [products]);

  const filteredProducts = useMemo(
    () =>
      safeProducts.filter((product) => {
        const matchesCategory = activeCategory === 'Tümü' || product.category === activeCategory;
        const normalizedSearch = search.toLocaleLowerCase('tr-TR');
        const matchesSearch =
          product.name.toLocaleLowerCase('tr-TR').includes(normalizedSearch) ||
          product.description.toLocaleLowerCase('tr-TR').includes(normalizedSearch);
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, safeProducts, search],
  );

  function openCreateModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(product: ProductForm) {
    setActionError('');
    setActionMessage('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, product);
        setActionMessage('Ürün güncellendi.');
        return;
      }

      await addProduct(product);
      setActionMessage('Ürün eklendi.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Ürün kaydedilemedi.');
    }
  }

  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryName = newCategoryName.trim();
    if (!categoryName) {
      return;
    }

    setActionError('');
    setActionMessage('');

    const didAddCategory = await addCategory(categoryName);
    if (didAddCategory) {
      setActiveCategory(categoryName);
      setNewCategoryName('');
      setActionMessage('Kategori eklendi.');
    }
  }

  async function handleToggleAvailability(productId: string) {
    setActionError('');
    setActionMessage('');

    try {
      await toggleProductAvailability(productId);
      setActionMessage('Satış durumu güncellendi.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Satış durumu güncellenemedi.');
    }
  }

  async function handleConfirmDelete() {
    if (!deletingProduct) {
      return;
    }

    setActionError('');
    setActionMessage('');

    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      setActionMessage('Ürün silindi.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Ürün silinemedi.');
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Menü Yönetimi</h2>
          <p className="mt-1 text-muted">Ürünleri düzenleyin ve fiyatları güncelleyin</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-line bg-card px-3 py-1 text-muted">
              Veri kaynağı: {dataSource === 'supabase' ? 'Supabase' : 'Demo veri'}
            </span>
            {isLoading ? <span className="text-orange-300">Menü verileri yükleniyor...</span> : null}
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={openCreateModal}>Yeni Ürün</Button>
      </section>

      {error ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-orange-200">
          {error}
        </div>
      ) : null}
      {actionMessage ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-green-200">
          {actionMessage}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">
          {actionError}
        </div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <Input className="pl-11" placeholder="Ürün ara" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <CategoryTabs activeCategory={activeCategory} categories={categories} onChange={setActiveCategory} />
        <form className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto]" onSubmit={handleAddCategory}>
          <Input
            placeholder="Yeni kategori adı"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <Button disabled={!newCategoryName.trim() || isLoading} icon={<Plus size={18} />} type="submit">
            Kategori Ekle
          </Button>
        </form>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={(id) => {
                const selectedProduct = safeProducts.find((item) => item.id === id);
                if (selectedProduct) {
                  setDeletingProduct(selectedProduct);
                }
              }}
              onEdit={(selectedProduct) => {
                setEditingProduct(selectedProduct);
                setIsModalOpen(true);
              }}
              onToggleAvailability={(id) => void handleToggleAvailability(id)}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-line bg-card p-8 text-center text-muted">Aradığınız kriterlerde ürün bulunamadı.</div>
      )}

      <ProductModal
        categories={categories}
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <Modal isOpen={Boolean(deletingProduct)} title="Ürünü Sil" onClose={() => setDeletingProduct(null)}>
        <div className="space-y-5">
          <div className="flex gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-red-100">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold">{deletingProduct?.name} silinecek</p>
              <p className="mt-1 text-sm leading-6 text-red-100/80">
                Bu işlem menü listesinden ürünü kaldırır. Supabase modunda ürün veritabanından silinir.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setDeletingProduct(null)}>
              Vazgeç
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirmDelete}>
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
