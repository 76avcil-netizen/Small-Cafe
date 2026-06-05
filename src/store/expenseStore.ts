import { create } from 'zustand';
import { mockExpenses } from '../data/mockExpenses';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  createExpense,
  deleteExpense as deleteSupabaseExpense,
  getExpensesByRestaurant,
  updateExpense as updateSupabaseExpense,
} from '../services/expensesService';
import type { Expense } from '../types';

type ExpenseDataSource = 'mock' | 'supabase';
type NewExpensePayload = Omit<Expense, 'id' | 'createdAt'>;

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  dataSource: ExpenseDataSource;
  activeRestaurantId: string | null;
  loadExpensesForRestaurant: (restaurantId?: string | null) => Promise<void>;
  addExpense: (expense: NewExpensePayload) => Promise<void>;
  updateExpense: (id: string, expense: NewExpensePayload) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: mockExpenses,
  isLoading: false,
  error: null,
  dataSource: 'mock',
  activeRestaurantId: null,
  loadExpensesForRestaurant: async (restaurantId) => {
    if (!isSupabaseConfigured || !restaurantId) {
      set({
        expenses: mockExpenses,
        dataSource: 'mock',
        activeRestaurantId: null,
        error: !isSupabaseConfigured ? 'Supabase yapılandırması geçersiz, demo giderler gösteriliyor.' : null,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null, activeRestaurantId: restaurantId });

    try {
      const expenses = await getExpensesByRestaurant(restaurantId);
      set({ expenses, dataSource: 'supabase', isLoading: false, error: null });
    } catch (error) {
      set({
        expenses: mockExpenses,
        dataSource: 'mock',
        activeRestaurantId: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Giderler alınamadı, demo giderler gösteriliyor.',
      });
    }
  },
  addExpense: async (expense) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await createExpense({
        restaurant_id: state.activeRestaurantId,
        title: expense.name,
        amount: expense.amount,
        category: expense.category ?? null,
        expense_date: expense.expenseDate,
        note: expense.note ?? null,
      });
      await get().loadExpensesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      expenses: [
        {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...currentState.expenses,
      ],
    }));
  },
  updateExpense: async (id, expense) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseExpense(id, {
        title: expense.name,
        amount: expense.amount,
        category: expense.category ?? null,
        expense_date: expense.expenseDate,
        note: expense.note ?? null,
      });
      await get().loadExpensesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      expenses: currentState.expenses.map((currentExpense) =>
        currentExpense.id === id ? { ...currentExpense, ...expense } : currentExpense,
      ),
    }));
  },
  deleteExpense: async (id) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await deleteSupabaseExpense(id);
      await get().loadExpensesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      expenses: currentState.expenses.filter((expense) => expense.id !== id),
    }));
  },
}));
