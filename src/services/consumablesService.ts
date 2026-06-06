import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { ConsumableItem, ConsumableUsageType } from '../types';

export interface ConsumablePayload {
  restaurant_id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unit: string;
  unit_cost?: number | null;
  purchase_date?: string;
  expiry_date?: string | null;
  storage_location?: string | null;
  usage_type: ConsumableUsageType;
  note?: string | null;
}

export async function getConsumablesByRestaurant(restaurantId: string): Promise<ConsumableItem[]> {
  const { data, error } = await getSupabaseClient()
    .from('consumable_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('expiry_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Sarf kayıtları alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map(mapConsumableRow);
}

export async function createConsumable(payload: ConsumablePayload) {
  const { data, error } = await getSupabaseClient().from('consumable_items').insert(payload).select('*').single();

  if (error) {
    throw new Error(`Sarf kaydı oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return mapConsumableRow(data);
}

export async function updateConsumable(id: string, payload: Partial<Omit<ConsumablePayload, 'restaurant_id'>>) {
  const { data, error } = await getSupabaseClient().from('consumable_items').update(payload).eq('id', id).select('*').single();

  if (error) {
    throw new Error(`Sarf kaydı güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return mapConsumableRow(data);
}

export async function deleteConsumable(id: string) {
  const { error } = await getSupabaseClient().from('consumable_items').update({ is_active: false }).eq('id', id);

  if (error) {
    throw new Error(`Sarf kaydı silinemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
}

function mapConsumableRow(row: Record<string, any>): ConsumableItem {
  return {
    id: String(row.id),
    name: String(row.name ?? 'Sarf malzemesi'),
    category: row.category ? String(row.category) : undefined,
    quantity: Number(row.quantity) || 0,
    unit: String(row.unit ?? 'adet'),
    unitCost: row.unit_cost === null || row.unit_cost === undefined ? undefined : Number(row.unit_cost),
    purchaseDate: String(row.purchase_date ?? new Date().toISOString().slice(0, 10)),
    expiryDate: row.expiry_date ? String(row.expiry_date) : undefined,
    storageLocation: row.storage_location ? String(row.storage_location) : undefined,
    usageType: normalizeUsageType(row.usage_type),
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function normalizeUsageType(value: unknown): ConsumableUsageType {
  if (value === 'ikram' || value === 'sarf' || value === 'mutfak' || value === 'paketleme') {
    return value;
  }

  return 'sarf';
}
