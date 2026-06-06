import { create } from 'zustand';
import { mockOperatorAuditLogs, mockOperatorEvents, mockOperatorRestaurants } from '../data/mockOperator';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { getOperatorAuditLogs, getOperatorIntegrationEvents, getOperatorRestaurants } from '../services/operatorService';
import type { OperatorAuditLog, OperatorIntegrationEvent, OperatorRestaurant } from '../types';

type OperatorDataSource = 'mock' | 'supabase';

interface OperatorState {
  restaurants: OperatorRestaurant[];
  events: OperatorIntegrationEvent[];
  auditLogs: OperatorAuditLog[];
  isLoading: boolean;
  error: string | null;
  dataSource: OperatorDataSource;
  loadOperatorDashboard: () => Promise<void>;
}

export const useOperatorStore = create<OperatorState>((set) => ({
  restaurants: mockOperatorRestaurants,
  events: mockOperatorEvents,
  auditLogs: mockOperatorAuditLogs,
  isLoading: false,
  error: null,
  dataSource: 'mock',
  loadOperatorDashboard: async () => {
    if (!isSupabaseConfigured) {
      set({
        restaurants: mockOperatorRestaurants,
        events: mockOperatorEvents,
        auditLogs: mockOperatorAuditLogs,
        dataSource: 'mock',
        error: 'Supabase yapılandırması geçersiz, demo operatör verileri gösteriliyor.',
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const [restaurants, events, auditLogs] = await Promise.all([
        getOperatorRestaurants(),
        getOperatorIntegrationEvents(),
        getOperatorAuditLogs(),
      ]);
      const hasRestaurants = restaurants.length > 0;

      set({
        restaurants: hasRestaurants ? restaurants : mockOperatorRestaurants,
        events: hasRestaurants ? events : mockOperatorEvents,
        auditLogs: hasRestaurants ? auditLogs : mockOperatorAuditLogs,
        dataSource: hasRestaurants ? 'supabase' : 'mock',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        restaurants: mockOperatorRestaurants,
        events: mockOperatorEvents,
        auditLogs: mockOperatorAuditLogs,
        dataSource: 'mock',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Operatör verileri alınamadı, demo veriler gösteriliyor.',
      });
    }
  },
}));
