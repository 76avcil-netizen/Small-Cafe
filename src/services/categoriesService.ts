import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { MenuCategory } from '../types';

export interface CategoryPayload {
  restaurant_id: string;
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
}

export async function getCategoriesByRestaurant(restaurantId: string) {
  const { data, error } = await getSupabaseClient()
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });
  if (error) {
    throw new Error(`Kategoriler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function getActiveCategories(restaurantId?: string | null): Promise<MenuCategory[]> {
  let query = getSupabaseClient()
    .from('categories')
    .select('id, name, slug, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Kategoriler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map((category) => ({
    id: String(category.id),
    name: String(category.name ?? 'Kategorisiz'),
    slug: category.slug ? String(category.slug) : undefined,
    sortOrder: Number(category.sort_order) || 0,
    isActive: category.is_active !== false,
  }));
}

export async function createCategory(payload: CategoryPayload) {
  const { data, error } = await getSupabaseClient().from('categories').insert(payload).select('*').single();
  if (error) {
    throw new Error(`Kategori oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  const { data, error } = await getSupabaseClient().from('categories').update(payload).eq('id', id).select('*').single();
  if (error) {
    throw new Error(`Kategori güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await getSupabaseClient().from('categories').delete().eq('id', id);
  if (error) {
    throw new Error(`Kategori silinemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
}
