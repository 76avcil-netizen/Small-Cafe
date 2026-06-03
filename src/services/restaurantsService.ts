import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { AppSettings } from '../store/settingsStore';

export interface RestaurantPayload {
  name: string;
  slug?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  currency?: string;
  theme?: string;
  opening_time?: string;
  closing_time?: string;
}

export async function getRestaurantById(id: string) {
  const { data, error } = await getSupabaseClient().from('restaurants').select('*').eq('id', id).single();
  if (error) {
    throw new Error(`Restoran bilgisi alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function createRestaurant(payload: RestaurantPayload) {
  const { data, error } = await getSupabaseClient().from('restaurants').insert(payload).select('*').single();
  if (error) {
    throw new Error(`Restoran oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function updateRestaurant(id: string, payload: Partial<RestaurantPayload>) {
  const { data, error } = await getSupabaseClient().from('restaurants').update(payload).eq('id', id).select('*').single();
  if (error) {
    throw new Error(`Restoran güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export function mapRestaurantToSettings(row: Record<string, any>, fallback: AppSettings): AppSettings {
  return {
    ...fallback,
    restaurantName: String(row.name ?? fallback.restaurantName),
    phone: String(row.phone ?? fallback.phone),
    address: String(row.address ?? fallback.address),
    currency: row.currency === 'USD' || row.currency === 'EUR' || row.currency === 'TRY' ? row.currency : fallback.currency,
    theme: row.theme === 'warm' || row.theme === 'contrast' || row.theme === 'dark' ? row.theme : fallback.theme,
    openingTime: normalizeTime(row.opening_time, fallback.openingTime),
    closingTime: normalizeTime(row.closing_time, fallback.closingTime),
  };
}

export function mapSettingsToRestaurantPayload(settings: AppSettings): Partial<RestaurantPayload> {
  return {
    name: settings.restaurantName,
    phone: settings.phone,
    address: settings.address,
    currency: settings.currency,
    theme: settings.theme,
    opening_time: settings.openingTime,
    closing_time: settings.closingTime,
  };
}

function normalizeTime(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const match = value.match(/^(\d{2}:\d{2})/);
  return match?.[1] ?? fallback;
}
