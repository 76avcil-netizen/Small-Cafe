import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type { Expense } from '../types';

export interface ExpensePayload {
  restaurant_id: string;
  title: string;
  amount: number;
  category?: string | null;
  expense_date?: string;
  note?: string | null;
}

export async function getExpensesByRestaurant(restaurantId: string): Promise<Expense[]> {
  const { data, error } = await getSupabaseClient()
    .from('expenses')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Giderler alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map(mapExpenseRow);
}

export async function createExpense(payload: ExpensePayload) {
  const { data, error } = await getSupabaseClient().from('expenses').insert(payload).select('*').single();

  if (error) {
    throw new Error(`Gider oluşturulamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return mapExpenseRow(data);
}

export async function updateExpense(id: string, payload: Partial<Omit<ExpensePayload, 'restaurant_id'>>) {
  const { data, error } = await getSupabaseClient().from('expenses').update(payload).eq('id', id).select('*').single();

  if (error) {
    throw new Error(`Gider güncellenemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return mapExpenseRow(data);
}

export async function deleteExpense(id: string) {
  const { error } = await getSupabaseClient().from('expenses').delete().eq('id', id);

  if (error) {
    throw new Error(`Gider silinemedi: ${getSafeSupabaseErrorDetails(error)}`);
  }
}

function mapExpenseRow(row: Record<string, any>): Expense {
  return {
    id: String(row.id),
    name: String(row.title ?? 'Gider'),
    amount: Number(row.amount) || 0,
    category: row.category ? String(row.category) : undefined,
    expenseDate: String(row.expense_date ?? new Date().toISOString().slice(0, 10)),
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}
