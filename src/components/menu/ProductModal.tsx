import { FormEvent, useEffect, useState } from 'react';
import type { Product } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

type ProductForm = Omit<Product, 'id' | 'soldCount' | 'createdAt' | 'updatedAt'>;

interface ProductModalProps {
  categories: string[];
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (product: ProductForm) => void;
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  category: 'Büfe Special',
  isAvailable: true,
};

export function ProductModal({ categories, isOpen, product, onClose, onSubmit }: ProductModalProps) {
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [error, setError] = useState('');
  const productCategories = categories.filter((category) => category !== 'Tümü');
  const fallbackCategory = productCategories[0] ?? initialForm.category;

  useEffect(() => {
    setForm(product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      isAvailable: product.isAvailable,
    } : { ...initialForm, category: fallbackCategory });
    setError('');
  }, [fallbackCategory, product, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Ürün adı zorunludur.');
      return;
    }
    if (!form.category) {
      setError('Kategori zorunludur.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Fiyat 0’dan büyük olmalıdır.');
      return;
    }
    onSubmit({ ...form, name: form.name.trim(), description: form.description.trim(), price: Number(form.price) });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} title={product ? 'Ürünü Düzenle' : 'Yeni Ürün'} onClose={onClose}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-stone-200">Ürün adı</span>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-stone-200">Açıklama</span>
          <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-200">Fiyat</span>
            <Input type="number" min="1" value={form.price || ''} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-stone-200">Kategori</span>
            <select
              className="min-h-11 w-full rounded-xl border border-line bg-app px-4 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value as ProductForm['category'] })}
            >
              {productCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-app p-4 text-sm text-stone-200">
          <input
            checked={form.isAvailable}
            className="h-4 w-4 accent-primary"
            type="checkbox"
            onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
          />
          Satışta mı?
        </label>
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
          <Button type="submit">{product ? 'Güncelle' : 'Kaydet'}</Button>
        </div>
      </form>
    </Modal>
  );
}
