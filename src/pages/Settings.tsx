import { Building2, Clock, Palette, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore, type AppCurrency, type AppSettings, type AppTheme } from '../store/settingsStore';

const currencyOptions: Array<{ label: string; value: AppCurrency }> = [
  { label: 'Türk Lirası', value: 'TRY' },
  { label: 'Dolar', value: 'USD' },
  { label: 'Euro', value: 'EUR' },
];

const themeOptions: Array<{ label: string; value: AppTheme; helper: string }> = [
  { label: 'Koyu', value: 'dark', helper: 'Standart turuncu operasyon teması' },
  { label: 'Sıcak', value: 'warm', helper: 'Daha yumuşak ve sıcak kontrast' },
  { label: 'Kontrast', value: 'contrast', helper: 'Daha belirgin çizgiler ve vurgu' },
];

export function Settings() {
  const settings = useSettingsStore((state) => state.settings);
  const saveSettings = useSettingsStore((state) => state.saveSettings);
  const dataSource = useSettingsStore((state) => state.dataSource);
  const isSaving = useSettingsStore((state) => state.isLoading);
  const settingsError = useSettingsStore((state) => state.error);
  const authMode = useAuthStore((state) => state.mode);
  const restaurantId = useAuthStore((state) => state.profile?.restaurantId);
  const [form, setForm] = useState<AppSettings>(settings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.restaurantName.trim()) {
      setError('Restoran adı boş bırakılamaz.');
      return;
    }

    if (form.openingTime >= form.closingTime) {
      setError('Kapanış saati açılış saatinden sonra olmalı.');
      return;
    }

    await saveSettings(form, authMode === 'supabase' ? restaurantId : null);
    const savedSource = useSettingsStore.getState().dataSource;
    setMessage(savedSource === 'supabase' ? 'Ayarlar Supabase’e kaydedildi ve uygulamaya uygulandı.' : 'Ayarlar yerel olarak kaydedildi ve uygulamaya uygulandı.');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Ayarlar</h2>
        <p className="mt-1 text-muted">Restoran kimliğini, çalışma saatlerini ve uygulama görünümünü yönetin</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <form className="space-y-6 rounded-2xl border border-line bg-card p-5 shadow-soft" onSubmit={handleSubmit}>
          {message ? <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-green-200">{message}</p> : null}
          {error ? <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {settingsError ? <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-orange-200">{settingsError}</p> : null}

          <SettingsGroup icon={<Building2 size={18} />} title="İşletme Bilgileri">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Restoran adı</span>
              <Input value={form.restaurantName} onChange={(event) => setForm({ ...form, restaurantName: event.target.value })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-200">Telefon</span>
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-200">Para birimi</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-line bg-app px-4 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={form.currency}
                  onChange={(event) => setForm({ ...form, currency: event.target.value as AppCurrency })}
                >
                  {currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-200">Adres</span>
              <Input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
          </SettingsGroup>

          <SettingsGroup icon={<Clock size={18} />} title="Çalışma Saatleri">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-200">Açılış</span>
                <Input type="time" value={form.openingTime} onChange={(event) => setForm({ ...form, openingTime: event.target.value })} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-stone-200">Kapanış</span>
                <Input type="time" value={form.closingTime} onChange={(event) => setForm({ ...form, closingTime: event.target.value })} />
              </label>
            </div>
          </SettingsGroup>

          <SettingsGroup icon={<Palette size={18} />} title="Görünüm">
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    form.theme === option.value ? 'border-primary bg-primary/10' : 'border-line bg-app hover:border-primary/50'
                  }`}
                >
                  <input
                    checked={form.theme === option.value}
                    className="sr-only"
                    name="theme"
                    type="radio"
                    value={option.value}
                    onChange={() => setForm({ ...form, theme: option.value })}
                  />
                  <span className="block text-sm font-bold text-white">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{option.helper}</span>
                </label>
              ))}
            </div>
          </SettingsGroup>

          <div className="flex justify-end">
            <Button disabled={isSaving} type="submit" icon={<Save size={18} />}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-card p-5 shadow-soft">
          <h3 className="text-lg font-bold text-white">Aktif Ayarlar</h3>
          <div className="mt-5 space-y-4 text-sm">
            <SummaryRow label="Restoran" value={settings.restaurantName} />
            <SummaryRow label="Telefon" value={settings.phone} />
            <SummaryRow label="Adres" value={settings.address} />
            <SummaryRow label="Para birimi" value={settings.currency} />
            <SummaryRow label="Tema" value={themeOptions.find((option) => option.value === settings.theme)?.label ?? settings.theme} />
            <SummaryRow label="Çalışma" value={`${settings.openingTime} - ${settings.closingTime}`} />
            <SummaryRow label="Veri kaynağı" value={dataSource === 'supabase' ? 'Supabase' : 'Yerel'} />
          </div>
          <p className="mt-5 rounded-xl border border-line bg-app p-3 text-xs leading-5 text-muted">
            Kaydedilen bilgiler üst bar, yan menü, tema renkleri ve tüm fiyat gösterimlerinde kullanılır.
          </p>
        </aside>
      </section>
    </div>
  );
}

function SettingsGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/15 p-2 text-primary">{icon}</div>
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <strong className="max-w-44 text-right text-white">{value}</strong>
    </div>
  );
}
