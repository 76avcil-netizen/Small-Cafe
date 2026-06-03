import { mockCategories } from '../../data/mockCategories';
import type { Category } from '../../types';

interface CategoryTabsProps {
  activeCategory: Category;
  categories?: Category[];
  onChange: (category: Category) => void;
}

export function CategoryTabs({ activeCategory, categories = mockCategories, onChange }: CategoryTabsProps) {
  const safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : mockCategories;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {safeCategories.map((category) => (
        <button
          key={category}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeCategory === category
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-card text-muted hover:border-primary/60 hover:text-white'
          }`}
          onClick={() => onChange(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
