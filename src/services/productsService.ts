import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { Product } from '../types';

export interface ProductPayload {
  restaurant_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  is_available?: boolean;
  is_featured?: boolean;
}

export async function getProductsByRestaurant(restaurantId: string) {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*, categories(name)')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Ürünler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function getProductsWithCategories(restaurantId?: string | null): Promise<Product[]> {
  let query = getSupabaseClient()
    .from('products')
    .select('id, name, description, price, is_available, is_featured, created_at, updated_at, categories(name)')
    .order('created_at', { ascending: false });

  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Ürünler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  const rows = (data ?? []) as Array<Record<string, any>>;

  return rows.map((product) => {
    const categoryRelation = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    return {
      id: String(product.id),
      name: String(product.name ?? 'Ürün'),
      description: String(product.description ?? ''),
      price: Number(product.price) || 0,
      category: String(categoryRelation?.name ?? 'Kategorisiz'),
      isAvailable: product.is_available !== false,
      isFeatured: Boolean(product.is_featured),
      soldCount: 0,
      createdAt: String(product.created_at ?? new Date().toISOString()),
      updatedAt: String(product.updated_at ?? product.created_at ?? new Date().toISOString()),
    };
  });
}

export async function createProduct(payload: ProductPayload) {
  const { data, error } = await getSupabaseClient().from('products').insert(payload).select('*').single();
  if (error) {
    throw new Error(`Ürün oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const { data, error } = await getSupabaseClient().from('products').update(payload).eq('id', id).select('*').single();
  if (error) {
    throw new Error(`Ürün güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await getSupabaseClient().from('products').delete().eq('id', id);
  if (error) {
    throw new Error(`Ürün silinemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
}
