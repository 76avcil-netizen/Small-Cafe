import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { AppRole } from '../store/authStore';

export interface ProfilePayload {
  id: string;
  restaurant_id?: string | null;
  full_name?: string | null;
  role?: AppRole;
}

export async function getCurrentProfile() {
  const supabase = getSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(`Kullanıcı bilgisi alınamadı: ${getSafeSupabaseErrorDetails(authError)}`);
  }
  const userId = authData.user?.id;
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    throw new Error(`Profil alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function getProfilesByRestaurant(restaurantId: string) {
  const { data, error } = await getSupabaseClient().from('profiles').select('*').eq('restaurant_id', restaurantId);
  if (error) {
    throw new Error(`Profiller alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}

export async function upsertProfile(payload: ProfilePayload) {
  const { data, error } = await getSupabaseClient().from('profiles').upsert(payload).select('*').single();
  if (error) {
    throw new Error(`Profil kaydedilemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
  return data;
}
