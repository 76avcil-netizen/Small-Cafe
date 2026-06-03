import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bike,
  Calculator,
  LayoutDashboard,
  Menu as MenuIcon,
  ReceiptText,
  Settings,
  Table2,
  Utensils,
  LogOut,
  X,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { roleLabels, type AuthProfile } from '../../store/authStore';
import type { AppSettings } from '../../store/settingsStore';
import { canAccessPath } from '../../utils/permissions';
import { Button } from '../ui/Button';

const items = [
  { label: 'Ana Panel', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Siparişler', path: '/orders', icon: ReceiptText },
  { label: 'Paket Servis', path: '/delivery', icon: Bike },
  { label: 'Masalar', path: '/tables', icon: Table2 },
  { label: 'Menü', path: '/menu', icon: Utensils },
  { label: 'Muhasebe', path: '/accounting', icon: Calculator },
  { label: 'Raporlar', path: '/reports', icon: BarChart3 },
  { label: 'Ayarlar', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  settings: AppSettings;
  profile: AuthProfile;
  onClose: () => void;
  onSignOut: () => void;
}

export function Sidebar({ isOpen, settings, profile, onClose, onSignOut }: SidebarProps) {
  const visibleItems = items.filter((item) => canAccessPath(profile.role, item.path));

  return (
    <>
      <div
        className={twMerge(
          'fixed inset-0 z-30 bg-black/60 transition lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={twMerge(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-panel px-4 py-5 shadow-soft transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
              <MenuIcon size={22} />
            </div>
            <div>
              <p className="text-lg font-black text-white">{settings.restaurantName}</p>
              <p className="text-xs text-muted">Restoran yönetimi</p>
            </div>
          </div>
          <Button aria-label="Menüyü kapat" variant="ghost" className="h-9 w-9 px-0 lg:hidden" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <nav className="space-y-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-muted transition hover:border-line hover:bg-white/5 hover:text-white',
                  isActive && 'border-primary/40 bg-primary text-white shadow-lg shadow-orange-950/30',
                )
              }
            >
              <item.icon size={19} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-line bg-card p-4">
          <p className="mb-3 rounded-xl bg-app px-3 py-2 text-xs font-semibold text-stone-200">{roleLabels[profile.role]}</p>
          <p className="text-sm font-semibold text-white">Bugün açık</p>
          <p className="mt-1 text-xs text-muted">{settings.openingTime} - {settings.closingTime} çalışma saati</p>
          <Button className="mt-4 w-full" icon={<LogOut size={17} />} variant="secondary" onClick={onSignOut}>
            Çıkış Yap
          </Button>
        </div>
      </aside>
    </>
  );
}
