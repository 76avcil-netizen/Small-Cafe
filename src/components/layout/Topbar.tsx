import { LogOut, Menu, Store } from 'lucide-react';
import { roleLabels, type AuthProfile } from '../../store/authStore';
import type { AppSettings } from '../../store/settingsStore';
import { Button } from '../ui/Button';

interface TopbarProps {
  settings: AppSettings;
  profile: AuthProfile;
  title: string;
  onMenuClick: () => void;
  onSignOut: () => void;
}

export function Topbar({ settings, profile, title, onMenuClick, onSignOut }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button aria-label="Menüyü aç" variant="ghost" className="h-10 w-10 px-0 lg:hidden" onClick={onMenuClick}>
            <Menu size={20} />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white md:text-2xl">{title}</h1>
            <p className="text-sm text-muted">Operasyon görünümü</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
            <div className="rounded-xl bg-primary/15 p-2 text-primary">
              <Store size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{settings.restaurantName}</p>
              <p className="text-xs text-muted">{profile.fullName} · {roleLabels[profile.role]}</p>
            </div>
          </div>
          <Button aria-label="Çıkış yap" variant="ghost" className="h-11 w-11 px-0" onClick={onSignOut}>
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
