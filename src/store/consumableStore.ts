import { create } from 'zustand';
import { mockConsumables } from '../data/mockConsumables';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  createConsumable,
  deleteConsumable as deleteSupabaseConsumable,
  getConsumablesByRestaurant,
  updateConsumable as updateSupabaseConsumable,
} from '../services/consumablesService';
import type { ConsumableItem } from '../types';

type ConsumableDataSource = 'mock' | 'supabase';
type NewConsumablePayload = Omit<ConsumableItem, 'id' | 'createdAt'>;

interface ConsumableState {
  consumables: ConsumableItem[];
  isLoading: boolean;
  error: string | null;
  dataSource: ConsumableDataSource;
  activeRestaurantId: string | null;
  loadConsumablesForRestaurant: (restaurantId?: string | null) => Promise<void>;
  addConsumable: (item: NewConsumablePayload) => Promise<void>;
  updateConsumable: (id: string, item: NewConsumablePayload) => Promise<void>;
  decrementConsumableQuantity: (id: string, quantity: number) => Promise<void>;
  deleteConsumable: (id: string) => Promise<void>;
}

export const useConsumableStore = create<ConsumableState>((set, get) => ({
  consumables: mockConsumables,
  isLoading: false,
  error: null,
  dataSource: 'mock',
  activeRestaurantId: null,
  loadConsumablesForRestaurant: async (restaurantId) => {
    if (!isSupabaseConfigured || !restaurantId) {
      set({
        consumables: mockConsumables,
        dataSource: 'mock',
        activeRestaurantId: null,
        error: !isSupabaseConfigured ? 'Supabase yapılandırması geçersiz, demo sarf kayıtları gösteriliyor.' : null,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null, activeRestaurantId: restaurantId });

    try {
      const consumables = await getConsumablesByRestaurant(restaurantId);
      set({ consumables, dataSource: 'supabase', isLoading: false, error: null });
    } catch (error) {
      set({
        consumables: mockConsumables,
        dataSource: 'mock',
        activeRestaurantId: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sarf kayıtları alınamadı, demo kayıtlar gösteriliyor.',
      });
    }
  },
  addConsumable: async (item) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await createConsumable({
        restaurant_id: state.activeRestaurantId,
        name: item.name,
        category: item.category ?? null,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost ?? null,
        purchase_date: item.purchaseDate,
        expiry_date: item.expiryDate ?? null,
        storage_location: item.storageLocation ?? null,
        usage_type: item.usageType,
        note: item.note ?? null,
      });
      await get().loadConsumablesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      consumables: [
        {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
        ...currentState.consumables,
      ],
    }));
  },
  updateConsumable: async (id, item) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseConsumable(id, {
        name: item.name,
        category: item.category ?? null,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unitCost ?? null,
        purchase_date: item.purchaseDate,
        expiry_date: item.expiryDate ?? null,
        storage_location: item.storageLocation ?? null,
        usage_type: item.usageType,
        note: item.note ?? null,
      });
      await get().loadConsumablesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      consumables: currentState.consumables.map((currentItem) =>
        currentItem.id === id ? { ...currentItem, ...item } : currentItem,
      ),
    }));
  },
  decrementConsumableQuantity: async (id, quantity) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    const state = get();
    const currentItem = state.consumables.find((item) => item.id === id);
    if (!currentItem) {
      return;
    }

    const nextQuantity = Math.max(0, currentItem.quantity - quantity);
    const nextItem = { ...currentItem, quantity: nextQuantity };

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await updateSupabaseConsumable(id, {
        name: nextItem.name,
        category: nextItem.category ?? null,
        quantity: nextItem.quantity,
        unit: nextItem.unit,
        unit_cost: nextItem.unitCost ?? null,
        purchase_date: nextItem.purchaseDate,
        expiry_date: nextItem.expiryDate ?? null,
        storage_location: nextItem.storageLocation ?? null,
        usage_type: nextItem.usageType,
        note: nextItem.note ?? null,
      });
      await get().loadConsumablesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      consumables: currentState.consumables.map((item) => (item.id === id ? nextItem : item)),
    }));
  },
  deleteConsumable: async (id) => {
    const state = get();

    if (state.dataSource === 'supabase' && state.activeRestaurantId) {
      await deleteSupabaseConsumable(id);
      await get().loadConsumablesForRestaurant(state.activeRestaurantId);
      return;
    }

    set((currentState) => ({
      consumables: currentState.consumables.filter((item) => item.id !== id),
    }));
  },
}));
