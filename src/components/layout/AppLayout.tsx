import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useMenuStore } from '../../store/menuStore';
import { useOrderStore } from '../../store/orderStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Ana Panel',
  '/orders': 'Siparişler',
  '/delivery': 'Paket Servis',
  '/tables': 'Masalar',
  '/menu': 'Menü',
  '/accounting': 'Muhasebe',
  '/reports': 'Raporlar',
  '/settings': 'Ayarlar',
  '/operator': 'Operatör Paneli',
};

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const profile = useAuthStore((state) => state.profile);
  const authMode = useAuthStore((state) => state.mode);
  const signOut = useAuthStore((state) => state.signOut);
  const settings = useSettingsStore((state) => state.settings);
  const loadSettingsForRestaurant = useSettingsStore((state) => state.loadSettingsForRestaurant);
  const loadMenuForRestaurant = useMenuStore((state) => state.loadMenuForRestaurant);
  const loadOrdersForRestaurant = useOrderStore((state) => state.loadOrdersForRestaurant);
  const loadExpensesForRestaurant = useExpenseStore((state) => state.loadExpensesForRestaurant);
  const location = useLocation();
  const navigate = useNavigate();
  const title = useMemo(() => pageTitles[location.pathname] ?? 'Ana Panel', [location.pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    if (profile?.role === 'operator') {
      return;
    }

    void loadSettingsForRestaurant(authMode === 'supabase' ? profile?.restaurantId : null);
    void loadMenuForRestaurant(authMode === 'supabase' ? profile?.restaurantId : null);
    void loadOrdersForRestaurant(authMode === 'supabase' ? profile?.restaurantId : null);
    void loadExpensesForRestaurant(authMode === 'supabase' ? profile?.restaurantId : null);
  }, [
    authMode,
    loadExpensesForRestaurant,
    loadMenuForRestaurant,
    loadOrdersForRestaurant,
    loadSettingsForRestaurant,
    profile?.role,
    profile?.restaurantId,
  ]);

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-app text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        profile={profile}
        settings={settings}
        onClose={() => setIsSidebarOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="lg:pl-72">
        <Topbar
          profile={profile}
          settings={settings}
          title={title}
          onMenuClick={() => setIsSidebarOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
