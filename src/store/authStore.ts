import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSafeSupabaseErrorDetails, isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { getCurrentProfile } from '../services/profilesService';

export type AppRole = 'owner' | 'admin' | 'cashier' | 'kitchen' | 'courier' | 'operator';
export type AuthMode = 'supabase' | 'demo';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  restaurantId?: string | null;
}

interface AuthState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  mode: AuthMode;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: (role?: AppRole) => void;
  signOut: () => Promise<void>;
}

const demoSessionKey = 'restoyonet-demo-auth';

const demoProfiles: Record<AppRole, AuthProfile> = {
  owner: {
    id: 'demo-owner',
    email: 'yonetici@restoyonet.local',
    fullName: 'Yönetici Hesabı',
    role: 'owner',
    restaurantId: 'demo-restaurant',
  },
  admin: {
    id: 'demo-admin',
    email: 'admin@restoyonet.local',
    fullName: 'Admin Kullanıcı',
    role: 'admin',
    restaurantId: 'demo-restaurant',
  },
  cashier: {
    id: 'demo-cashier',
    email: 'kasa@restoyonet.local',
    fullName: 'Kasa Kullanıcısı',
    role: 'cashier',
    restaurantId: 'demo-restaurant',
  },
  kitchen: {
    id: 'demo-kitchen',
    email: 'mutfak@restoyonet.local',
    fullName: 'Mutfak Kullanıcısı',
    role: 'kitchen',
    restaurantId: 'demo-restaurant',
  },
  courier: {
    id: 'demo-courier',
    email: 'kurye@restoyonet.local',
    fullName: 'Kurye Kullanıcısı',
    role: 'courier',
    restaurantId: 'demo-restaurant',
  },
  operator: {
    id: 'demo-operator',
    email: 'operator@restoyonet.local',
    fullName: 'Sistem Operatörü',
    role: 'operator',
    restaurantId: null,
  },
};

export const roleLabels: Record<AppRole, string> = {
  owner: 'İşletme Sahibi',
  admin: 'Yönetici',
  cashier: 'Kasiyer',
  kitchen: 'Mutfak',
  courier: 'Kurye',
  operator: 'Operatör',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  error: null,
  session: null,
  user: null,
  profile: null,
  mode: isSupabaseConfigured ? 'supabase' : 'demo',
  initializeAuth: async () => {
    if (get().isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });

    if (!isSupabaseConfigured || !supabase) {
      const storedDemoAuth = getStoredDemoAuth();
      set({
        ...storedDemoAuth,
        isInitialized: true,
        isLoading: false,
        mode: 'demo',
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }

      if (data.session?.user) {
        const profile = await loadProfile(data.session.user);
        set({ session: data.session, user: data.session.user, profile, mode: 'supabase' });
      } else {
        set({ session: null, user: null, profile: null, mode: 'supabase' });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        setTimeout(async () => {
          if (!session?.user) {
            set({ session: null, user: null, profile: null, mode: 'supabase' });
            return;
          }

          const profile = await loadProfile(session.user);
          set({ session, user: session.user, profile, mode: 'supabase' });
        }, 0);
      });

      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      const storedDemoAuth = getStoredDemoAuth();
      set({
        ...storedDemoAuth,
        error: `Supabase oturumu alınamadı, demo giriş kullanılabilir: ${getSafeSupabaseErrorDetails(error)}`,
        isInitialized: true,
        isLoading: false,
        mode: 'demo',
      });
    }
  },
  signIn: async (email, password) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      set({ error: 'Email ve şifre zorunludur.', isLoading: false, session: null, user: null, profile: null });
      return;
    }

    window.localStorage.removeItem(demoSessionKey);
    set({ isLoading: true, error: null, session: null, user: null, profile: null, mode: isSupabaseConfigured ? 'supabase' : 'demo' });

    if (!isSupabaseConfigured || !supabase) {
      setDemoAuth('owner', set);
      return;
    }

    try {
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        throw error;
      }

      const user = data.user ?? data.session?.user ?? null;
      const profile = user ? await loadProfile(user) : null;
      set({ session: data.session, user, profile, mode: 'supabase', isLoading: false });
    } catch (error) {
      set({
        error: `Giriş yapılamadı: ${getSafeSupabaseErrorDetails(error)}`,
        isLoading: false,
        session: null,
        user: null,
        profile: null,
        mode: 'supabase',
      });
    }
  },
  signInDemo: (role = 'owner') => {
    setDemoAuth(role, set);
  },
  signOut: async () => {
    set({ isLoading: true, error: null });
    window.localStorage.removeItem(demoSessionKey);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        set({ error: `Çıkış yapılamadı: ${getSafeSupabaseErrorDetails(error)}`, isLoading: false });
        return;
      }
    }

    set({ session: null, user: null, profile: null, isLoading: false, mode: isSupabaseConfigured ? 'supabase' : 'demo' });
  },
}));

async function loadProfile(user: User): Promise<AuthProfile> {
  try {
    const profile = await getCurrentProfile();
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: profile?.full_name ?? user.email ?? 'Kullanıcı',
      role: normalizeRole(profile?.role),
      restaurantId: profile?.restaurant_id,
    };
  } catch {
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: user.email ?? 'Kullanıcı',
      role: 'owner',
      restaurantId: null,
    };
  }
}

function setDemoAuth(role: AppRole, set: (state: Partial<AuthState>) => void) {
  const profile = demoProfiles[role];
  window.localStorage.setItem(demoSessionKey, role);
  set({
    session: null,
    user: null,
    profile,
    mode: 'demo',
    error: null,
    isInitialized: true,
    isLoading: false,
  });
}

function getStoredDemoAuth() {
  const storedRole = window.localStorage.getItem(demoSessionKey);
  if (!isRole(storedRole)) {
    return { session: null, user: null, profile: null };
  }

  return { session: null, user: null, profile: demoProfiles[storedRole] };
}

function normalizeRole(role: unknown): AppRole {
  return isRole(role) ? role : 'owner';
}

function isRole(value: unknown): value is AppRole {
  return value === 'owner' || value === 'admin' || value === 'cashier' || value === 'kitchen' || value === 'courier' || value === 'operator';
}
