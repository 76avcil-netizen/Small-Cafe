import { create } from 'zustand';
import { mockCategories } from '../data/mockCategories';
import { mockProducts } from '../data/mockProducts';
import { getSafeSupabaseErrorDetails, isSupabaseConfigured } from '../lib/supabaseClient';
import { createCategory, getActiveCategories } from '../services/categoriesService';
import { createProduct, deleteProduct as deleteSupabaseProduct, getProductsWithCategories, updateProduct as updateSupabaseProduct } from '../services/productsService';
import type { Product } from '../types';

type MenuDataSource = 'mock' | 'supabase';
let hasWarnedAboutSupabaseFetch = false;
let menuLoadPromise: Promise<void> | null = null;

type ProductForm = Omit<Product, 'id' | 'soldCount' | 'createdAt' | 'updatedAt'>;

interface MenuState {
  products: Product[];
  categories: string[];
  categoryIdsByName: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  dataSource: MenuDataSource;
  activeRestaurantId: string | null;
  loadMenuForRestaurant: (restaurantId?: string | null) => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  addProduct: (product: ProductForm) => Promise<void>;
  updateProduct: (id: string, product: ProductForm) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  products: mockProducts,
  categories: mockCategories,
  categoryIdsByName: {},
  isLoading: false,
  error: null,
  dataSource: 'mock',
  activeRestaurantId: null,
  loadMenuForRestaurant: async (restaurantId) => {
    if (menuLoadPromise) {
      return menuLoadPromise;
    }

    menuLoadPromise = loadMenu(set, restaurantId);
    try {
      await menuLoadPromise;
    } finally {
      menuLoadPromise = null;
    }
  },
  addCategory: async (name) => {
    const categoryName = name.trim();
    if (!categoryName || categoryName === 'Tümü') {
      return false;
    }

    const state = get();
    if (state.categories.some((category) => category.toLocaleLowerCase('tr-TR') === categoryName.toLocaleLowerCase('tr-TR'))) {
      set({ error: 'Bu kategori zaten var.' });
      return false;
    }

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      try {
        await createCategory({
          restaurant_id: state.activeRestaurantId,
          name: categoryName,
          slug: slugify(categoryName),
          sort_order: Math.max(0, state.categories.length - 1),
          is_active: true,
        });
        await get().loadMenuForRestaurant(state.activeRestaurantId);
        return true;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Kategori eklenemedi.' });
        return false;
      }
    }

    set((currentState) => ({
      categories: [...currentState.categories, categoryName],
      error: null,
    }));
    return true;
  },
  addProduct: async (product) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await createProduct({
        restaurant_id: state.activeRestaurantId,
        category_id: state.categoryIdsByName[product.category] ?? null,
        name: product.name,
        description: product.description,
        price: product.price,
        is_available: product.isAvailable,
      });
      await get().loadMenuForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      products: [
        {
          ...product,
          id: crypto.randomUUID(),
          soldCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...currentState.products,
      ],
    }));
  },
  updateProduct: async (id, product) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseProduct(id, {
        category_id: state.categoryIdsByName[product.category] ?? null,
        name: product.name,
        description: product.description,
        price: product.price,
        is_available: product.isAvailable,
      });
      await get().loadMenuForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      products: currentState.products.map((item) =>
        item.id === id ? { ...item, ...product, updatedAt: new Date().toISOString() } : item,
      ),
    }));
  },
  deleteProduct: async (id) => {
    const state = get();
    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await deleteSupabaseProduct(id);
      await get().loadMenuForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({ products: currentState.products.filter((product) => product.id !== id) }));
  },
  toggleProductAvailability: async (id) => {
    const state = get();
    const product = state.products.find((item) => item.id === id);
    if (!product) {
      return;
    }

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseProduct(id, { is_available: !product.isAvailable });
      await get().loadMenuForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      products: currentState.products.map((currentProduct) =>
        currentProduct.id === id
          ? { ...currentProduct, isAvailable: !currentProduct.isAvailable, updatedAt: new Date().toISOString() }
          : currentProduct,
      ),
    }));
  },
}));

async function loadMenu(set: (state: Partial<MenuState>) => void, restaurantId?: string | null) {
  set({ isLoading: true, error: null });

  if (!isSupabaseConfigured || !restaurantId) {
    set({
      products: mockProducts,
      categories: mockCategories,
      categoryIdsByName: {},
      dataSource: 'mock',
      activeRestaurantId: null,
      error: !isSupabaseConfigured ? 'Supabase yapılandırması geçersiz, demo veriler gösteriliyor.' : null,
      isLoading: false,
    });
    return;
  }

  try {
    const [supabaseCategories, supabaseProducts] = await Promise.all([
      getActiveCategories(restaurantId),
      getProductsWithCategories(restaurantId),
    ]);

    if (import.meta.env.DEV) {
      console.log('Menu loaded from Supabase restaurant', restaurantId);
    }

    const categoryIdsByName = Object.fromEntries(
      supabaseCategories.map((category) => [category.name, category.id]),
    );

    set({
      products: supabaseProducts,
      categories:
        supabaseCategories.length > 0
          ? ['Tümü', ...supabaseCategories.map((category) => category.name)]
          : mockCategories,
      categoryIdsByName,
      dataSource: 'supabase',
      activeRestaurantId: restaurantId,
      error: null,
      isLoading: false,
    });
  } catch (error) {
    warnSupabaseFetchFailed(error);
    set({
      products: mockProducts,
      categories: mockCategories,
      categoryIdsByName: {},
      dataSource: 'mock',
      activeRestaurantId: null,
      error: 'Supabase verisi alınamadı, demo veriler gösteriliyor.',
      isLoading: false,
    });
  }
}

function warnSupabaseFetchFailed(error: unknown) {
  if (!import.meta.env.DEV || hasWarnedAboutSupabaseFetch) {
    return;
  }

  hasWarnedAboutSupabaseFetch = true;
  console.warn('Supabase fetch failed', {
    error: getSafeSupabaseErrorDetails(error),
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
