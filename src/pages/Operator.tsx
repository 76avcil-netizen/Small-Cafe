import { Activity, Building2, Cable, CheckCircle2, Clock3, KeyRound, UserRoundCog, Webhook } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '../components/ui/Badge';
import { useOperatorStore } from '../store/operatorStore';
import type { IntegrationEventStatus, IntegrationStatus } from '../types';

export function Operator() {
  const restaurants = useOperatorStore((state) => state.restaurants);
  const events = useOperatorStore((state) => state.events);
  const isLoading = useOperatorStore((state) => state.isLoading);
  const error = useOperatorStore((state) => state.error);
  const dataSource = useOperatorStore((state) => state.dataSource);
  const loadOperatorDashboard = useOperatorStore((state) => state.loadOperatorDashboard);
  const connectedCount = restaurants.reduce(
    (sum, restaurant) => sum + restaurant.integrations.filter((integration) => integration.status === 'connected').length,
    0,
  );
  const pendingCount = restaurants.reduce(
    (sum, restaurant) => sum + restaurant.integrations.filter((integration) => integration.status === 'pending').length,
    0,
  );
  const errorCount = restaurants.reduce(
    (sum, restaurant) => sum + restaurant.integrations.filter((integration) => integration.status === 'error').length,
    0,
  );
  const userCount = restaurants.reduce((sum, restaurant) => sum + restaurant.users, 0);

  useEffect(() => {
    void loadOperatorDashboard();
  }, [loadOperatorDashboard]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold text-primary">Sistem yönetimi</p>
          <h2 className="mt-1 text-2xl font-bold text-white">Operatör Paneli</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Restoran hesapları, personel bağlantıları ve dış kanal entegrasyonlarını müşteri ekranlarından ayrı takip edin.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-card px-4 py-3">
          <p className="text-xs text-muted">Veri kaynağı</p>
          <strong className="mt-1 block text-sm text-white">{dataSource === 'supabase' ? 'Supabase' : 'Demo veri'}</strong>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OperatorStat title="Restoran" value={`${restaurants.length}`} icon={Building2} helper="Aktif tenant" />
        <OperatorStat title="Kullanıcı" value={`${userCount}`} icon={UserRoundCog} helper="Bağlı profil" />
        <OperatorStat title="Bağlı API" value={`${connectedCount}`} icon={Cable} helper={`${pendingCount} bekleyen`} />
        <OperatorStat title="Uyarı" value={`${errorCount}`} icon={Activity} helper="Kontrol gereken" danger={errorCount > 0} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Restoranlar ve Entegrasyonlar</h3>
              <p className="mt-1 text-sm text-muted">API hesaplarının işletme bazlı durum özeti</p>
            </div>
            <Badge tone={dataSource === 'supabase' ? 'success' : 'warning'}>
              {isLoading ? 'Yükleniyor' : dataSource === 'supabase' ? 'Canlı veri' : 'Demo iskelet'}
            </Badge>
          </div>

          <div className="mt-5 divide-y divide-line">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="grid gap-4 py-4 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <p className="font-bold text-white">{restaurant.name}</p>
                  <p className="mt-1 text-sm text-muted">{restaurant.city} · {restaurant.ownerEmail}</p>
                  <p className="mt-2 text-xs text-muted">{restaurant.users} kullanıcı bağlı</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {restaurant.integrations.length > 0 ? restaurant.integrations.map((integration) => (
                    <span
                      key={`${restaurant.id}-${integration.name}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getIntegrationClassName(integration.status)}`}
                    >
                      {getIntegrationIcon(integration.status)}
                      {integration.name}
                    </span>
                  )) : (
                    <span className="rounded-full border border-line bg-app px-3 py-1 text-xs font-semibold text-muted">Entegrasyon yok</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <h3 className="text-lg font-bold text-white">Son Webhook Olayları</h3>
          <p className="mt-1 text-sm text-muted">Dış kanallardan gelen son sinyaller</p>
          <div className="mt-5 space-y-3">
            {events.length > 0 ? events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-line bg-app p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{event.provider}</p>
                    <p className="mt-1 text-xs text-muted">{event.restaurantName}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getEventClassName(event.status)}`}>
                    {event.receivedAt}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-5 text-stone-200">{event.title}</p>
              </div>
            )) : (
              <p className="rounded-2xl border border-line bg-app p-4 text-center text-sm text-muted">
                Henüz webhook olayı yok.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <NextStep icon={KeyRound} title="Kimlik bilgileri" text="API anahtarları frontend'e gelmeden Supabase/Edge Function tarafında saklanacak." />
        <NextStep icon={Webhook} title="Webhook uçları" text="Platformlardan gelen bildirimler restoran bazlı olay kaydına düşecek." />
        <NextStep icon={Clock3} title="Operatör izi" text="Restoran, kullanıcı ve entegrasyon değişiklikleri audit log olarak tutulacak." />
      </section>
    </div>
  );
}

function OperatorStat({
  title,
  value,
  icon: Icon,
  helper,
  danger,
}: {
  title: string;
  value: string;
  icon: typeof Building2;
  helper: string;
  danger?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <strong className={`mt-2 block text-2xl ${danger ? 'text-red-200' : 'text-white'}`}>{value}</strong>
        </div>
        <span className={`rounded-2xl p-3 ${danger ? 'bg-danger/10 text-red-200' : 'bg-primary/15 text-primary'}`}>
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">{helper}</p>
    </article>
  );
}

function NextStep({ icon: Icon, title, text }: { icon: typeof KeyRound; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-soft">
      <span className="inline-flex rounded-2xl bg-primary/15 p-3 text-primary">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </article>
  );
}

function getIntegrationClassName(status: IntegrationStatus) {
  if (status === 'connected') {
    return 'border-success/30 bg-success/10 text-green-200';
  }

  if (status === 'error') {
    return 'border-danger/30 bg-danger/10 text-red-200';
  }

  if (status === 'disabled') {
    return 'border-line bg-app text-muted';
  }

  return 'border-primary/30 bg-primary/10 text-orange-200';
}

function getIntegrationIcon(status: IntegrationStatus) {
  if (status === 'connected') {
    return <CheckCircle2 size={14} />;
  }

  if (status === 'error') {
    return <Activity size={14} />;
  }

  return <Clock3 size={14} />;
}

function getEventClassName(status: IntegrationEventStatus) {
  if (status === 'success') {
    return 'border-success/30 bg-success/10 text-green-200';
  }

  if (status === 'error') {
    return 'border-danger/30 bg-danger/10 text-red-200';
  }

  return 'border-primary/30 bg-primary/10 text-orange-200';
}
