import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LockKeyhole, Store, UserRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { roleLabels, useAuthStore, type AppRole } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { canAccessPath, getDefaultPathForRole } from '../utils/permissions';

const demoRoles: AppRole[] = ['owner', 'cashier', 'kitchen', 'courier', 'operator'];

export function Login() {
  const location = useLocation();
  const settings = useSettingsStore((state) => state.settings);
  const profile = useAuthStore((state) => state.profile);
  const signIn = useAuthStore((state) => state.signIn);
  const signInDemo = useAuthStore((state) => state.signInDemo);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDemoRole, setSelectedDemoRole] = useState<AppRole>('owner');
  const state = location.state as { from?: unknown } | null;
  const from = typeof state?.from === 'string' ? state.from : '/dashboard';

  if (profile) {
    return <Navigate to={canAccessPath(profile.role, from) ? from : getDefaultPathForRole(profile.role)} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formEmail = String(formData.get('email') ?? email);
    const formPassword = String(formData.get('password') ?? password);
    setEmail(formEmail);
    setPassword(formPassword);
    void signIn(formEmail, formPassword);
  }

  return (
    <div className="grid min-h-screen bg-app text-white lg:grid-cols-[1fr_0.9fr]">
      <section className="flex min-h-screen flex-col justify-between border-r border-line bg-panel p-6 md:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xl font-black">{settings.restaurantName}</p>
            <p className="text-sm text-muted">Restoran yönetimi</p>
          </div>
        </div>

        <div className="max-w-xl py-12">
          <p className="text-sm font-semibold text-primary">Güvenli giriş</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Operasyonu role göre yönetin</h1>
          <p className="mt-5 text-base leading-7 text-muted">
            Yönetici, kasa, mutfak ve kurye kullanıcıları aynı panelde yalnızca ihtiyaç duydukları ekranlara erişir.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-muted sm:grid-cols-3">
          <span className="rounded-2xl border border-line bg-card p-4">Rol bazlı menü</span>
          <span className="rounded-2xl border border-line bg-card p-4">Korumalı sayfalar</span>
          <span className="rounded-2xl border border-line bg-card p-4">Supabase Auth hazır</span>
        </div>
      </section>

      <main className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div>
            <h2 className="text-2xl font-bold">Giriş Yap</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Supabase kullanıcı bilgileriyle giriş yapın veya geliştirme için demo rol seçin.
            </p>
          </div>

          {authError ? (
            <p className="mt-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{authError}</p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Email</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                <Input
                  autoComplete="email"
                  className="pl-11"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Şifre</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                <Input
                  autoComplete="current-password"
                  className="pl-11"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-200">Demo girişleri</p>
              <span className="rounded-full border border-line bg-app px-3 py-1 text-xs text-muted">
                {isSupabaseConfigured ? 'Opsiyonel' : 'Supabase kapalı'}
              </span>
            </div>
            <p className="mb-3 text-xs leading-5 text-muted">
              Rol seçimi yalnızca demo giriş için geçerlidir. Email ve şifreyle girişte Supabase profilinizdeki rol kullanılır.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoRoles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedDemoRole === role ? 'primary' : 'secondary'}
                  onClick={() => setSelectedDemoRole(role)}
                >
                  {roleLabels[role]}
                </Button>
              ))}
            </div>
            <Button className="mt-3 w-full" type="button" onClick={() => signInDemo(selectedDemoRole)}>
              {roleLabels[selectedDemoRole]} olarak demo giriş
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
