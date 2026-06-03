import { create } from 'zustand';
import { getRestaurantById, mapRestaurantToSettings, mapSettingsToRestaurantPayload, updateRestaurant } from '../services/restaurantsService';

export type AppCurrency = 'TRY' | 'USD' | 'EUR';
export type AppTheme = 'dark' | 'warm' | 'contrast';
export type SettingsDataSource = 'local' | 'supabase';

export interface AppSettings {
  restaurantName: string;
  phone: string;
  address: string;
  currency: AppCurrency;
  theme: AppTheme;
  openingTime: string;
  closingTime: string;
}

interface SettingsState {
  settings: AppSettings;
  dataSource: SettingsDataSource;
  isLoading: boolean;
  error: string | null;
  activeRestaurantId: string | null;
  loadSettingsForRestaurant: (restaurantId?: string | null) => Promise<void>;
  saveSettings: (settings: AppSettings, restaurantId?: string | null) => Promise<void>;
}

const storageKey = 'restoyonet-settings';

export const defaultSettings: AppSettings = {
  restaurantName: 'Lezzet Büfe',
  phone: '0212 555 44 33',
  address: 'Merkez Mah. Lezzet Sok. No:12',
  currency: 'TRY',
  theme: 'dark',
  openingTime: '10:00',
  closingTime: '23:30',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadSettings(),
  dataSource: 'local',
  isLoading: false,
  error: null,
  activeRestaurantId: null,
  loadSettingsForRestaurant: async (restaurantId) => {
    if (!restaurantId) {
      set({ settings: loadSettings(), dataSource: 'local', activeRestaurantId: null, error: null });
      return;
    }

    set({ isLoading: true, error: null, activeRestaurantId: restaurantId });

    try {
      const restaurant = await getRestaurantById(restaurantId);
      const settings = mapRestaurantToSettings(restaurant, loadSettings());
      saveSettingsToStorage(settings);
      set({ settings, dataSource: 'supabase', isLoading: false, error: null });
    } catch (error) {
      set({
        settings: loadSettings(),
        dataSource: 'local',
        isLoading: false,
        error: getErrorMessage(error, 'Restoran ayarları alınamadı, yerel ayarlar kullanılıyor.'),
      });
    }
  },
  saveSettings: async (settings, restaurantId) => {
    const normalizedSettings = normalizeSettings(settings);
    saveSettingsToStorage(normalizedSettings);
    set({ settings: normalizedSettings, error: null });

    if (!restaurantId) {
      set({ dataSource: 'local', activeRestaurantId: null });
      return;
    }

    set({ isLoading: true, activeRestaurantId: restaurantId });

    try {
      await updateRestaurant(restaurantId, mapSettingsToRestaurantPayload(normalizedSettings));
      set({ dataSource: 'supabase', isLoading: false, error: null });
    } catch (error) {
      set({
        dataSource: 'local',
        isLoading: false,
        error: getErrorMessage(error, 'Ayarlar yerel kaydedildi, Supabase güncellenemedi.'),
      });
    }
  },
}));

function loadSettings() {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const savedSettings = window.localStorage.getItem(storageKey);
    if (!savedSettings) {
      return defaultSettings;
    }

    return normalizeSettings(JSON.parse(savedSettings));
  } catch {
    return defaultSettings;
  }
}

function saveSettingsToStorage(settings: AppSettings) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

function normalizeSettings(settings: Partial<AppSettings>) {
  return {
    ...defaultSettings,
    ...settings,
    restaurantName: settings.restaurantName?.trim() || defaultSettings.restaurantName,
    phone: settings.phone?.trim() || defaultSettings.phone,
    address: settings.address?.trim() || defaultSettings.address,
    currency: isCurrency(settings.currency) ? settings.currency : defaultSettings.currency,
    theme: isTheme(settings.theme) ? settings.theme : defaultSettings.theme,
    openingTime: settings.openingTime?.trim() || defaultSettings.openingTime,
    closingTime: settings.closingTime?.trim() || defaultSettings.closingTime,
  };
}

function isCurrency(value: unknown): value is AppCurrency {
  return value === 'TRY' || value === 'USD' || value === 'EUR';
}

function isTheme(value: unknown): value is AppTheme {
  return value === 'dark' || value === 'warm' || value === 'contrast';
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
