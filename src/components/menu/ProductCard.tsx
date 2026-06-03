import { Edit, Power, Trash2 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete, onToggleAvailability }: ProductCardProps) {
  const currency = useSettingsStore((state) => state.settings.currency);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">{product.name}</h3>
          <p className="mt-1 text-sm text-muted">{product.category}</p>
        </div>
        <Badge tone={product.isAvailable ? 'success' : 'danger'}>
          {product.isAvailable ? 'Satışta' : 'Satış Dışı'}
        </Badge>
      </div>
      <p className="mt-4 min-h-10 text-sm text-muted">{product.description}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Fiyat</p>
          <strong className="text-2xl text-white">{formatCurrency(product.price, currency)}</strong>
        </div>
        <p className="text-xs text-muted">{product.soldCount} satış</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Button aria-label="Ürünü düzenle" variant="secondary" className="px-0" onClick={() => onEdit(product)}>
          <Edit size={17} />
        </Button>
        <Button
          aria-label="Satış durumunu değiştir"
          variant="secondary"
          className="px-0"
          onClick={() => onToggleAvailability(product.id)}
        >
          <Power size={17} />
        </Button>
        <Button aria-label="Ürünü sil" variant="danger" className="px-0" onClick={() => onDelete(product.id)}>
          <Trash2 size={17} />
        </Button>
      </div>
    </article>
  );
}
