import { getSafeSupabaseErrorDetails, getSupabaseClient } from '../lib/supabaseClient';
import type {
  IntegrationStatus,
  OperatorAuditLog,
  OperatorAuditSeverity,
  OperatorIntegration,
  OperatorIntegrationEvent,
  OperatorRestaurant,
} from '../types';

interface RestaurantRow {
  id: string;
  name?: string | null;
  address?: string | null;
  profiles?: Array<Record<string, any>>;
  integration_accounts?: Array<Record<string, any>>;
}

export async function getOperatorRestaurants(): Promise<OperatorRestaurant[]> {
  const { data, error } = await getSupabaseClient()
    .from('restaurants')
    .select('id, name, address, profiles(id, full_name, role), integration_accounts(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Operatör restoranları alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map(mapRestaurantRow);
}

export async function getOperatorIntegrationEvents(): Promise<OperatorIntegrationEvent[]> {
  const { data, error } = await getSupabaseClient()
    .from('integration_events')
    .select('*, restaurants(name)')
    .order('received_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Entegrasyon olayları alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map(mapIntegrationEventRow);
}

export async function getOperatorAuditLogs(): Promise<OperatorAuditLog[]> {
  const { data, error } = await getSupabaseClient()
    .from('operator_audit_logs')
    .select('*, restaurants(name), profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Operatör işlem izleri alınamadı: ${getSafeSupabaseErrorDetails(error)}`);
  }

  return (data ?? []).map(mapAuditLogRow);
}

function mapRestaurantRow(row: RestaurantRow): OperatorRestaurant {
  const profiles = Array.isArray(row.profiles) ? row.profiles : [];
  const integrations = Array.isArray(row.integration_accounts) ? row.integration_accounts.map(mapIntegrationRow) : [];
  const ownerProfile = profiles.find((profile) => profile.role === 'owner') ?? profiles[0];

  return {
    id: String(row.id),
    name: String(row.name ?? 'Restoran'),
    ownerEmail: ownerProfile?.full_name ? String(ownerProfile.full_name) : 'Profil yok',
    city: inferCity(row.address),
    users: profiles.length,
    integrations,
  };
}

function mapIntegrationRow(row: Record<string, any>): OperatorIntegration {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id),
    name: String(row.provider ?? 'Entegrasyon'),
    status: normalizeIntegrationStatus(row.status),
    accountLabel: row.account_label ? String(row.account_label) : undefined,
    lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : undefined,
    lastError: row.last_error ? String(row.last_error) : undefined,
  };
}

function mapIntegrationEventRow(row: Record<string, any>): OperatorIntegrationEvent {
  return {
    id: String(row.id),
    restaurantId: row.restaurant_id ? String(row.restaurant_id) : null,
    restaurantName: String(row.restaurants?.name ?? 'Restoran yok'),
    provider: String(row.provider ?? 'Entegrasyon'),
    title: String(row.summary ?? row.event_type ?? 'Bildirim alındı'),
    status: normalizeEventStatus(row.status),
    receivedAt: formatRelativeTime(row.received_at),
  };
}

function mapAuditLogRow(row: Record<string, any>): OperatorAuditLog {
  const details = isPlainObject(row.details) ? row.details : {};

  return {
    id: String(row.id),
    operatorName: String(row.profiles?.full_name ?? details.operatorName ?? 'Operatör'),
    restaurantName: String(row.restaurants?.name ?? details.restaurantName ?? 'Restoran yok'),
    action: String(row.action ?? 'operator.action'),
    targetType: String(row.target_type ?? 'record'),
    targetId: row.target_id ? String(row.target_id) : undefined,
    summary: String(details.summary ?? buildAuditSummary(row.action, row.target_type)),
    severity: normalizeAuditSeverity(details.severity, row.action),
    createdAt: formatRelativeTime(row.created_at),
  };
}

function normalizeIntegrationStatus(value: unknown): IntegrationStatus {
  if (value === 'connected' || value === 'pending' || value === 'error' || value === 'disabled') {
    return value;
  }

  return 'pending';
}

function normalizeEventStatus(value: unknown) {
  if (value === 'processed') {
    return 'success';
  }

  if (value === 'failed') {
    return 'error';
  }

  return 'warning';
}

function normalizeAuditSeverity(value: unknown, action: unknown): OperatorAuditSeverity {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  const actionText = typeof action === 'string' ? action.toLowerCase() : '';
  if (actionText.includes('delete') || actionText.includes('suspicious') || actionText.includes('secret')) {
    return 'high';
  }

  if (actionText.includes('role') || actionText.includes('credential') || actionText.includes('integration')) {
    return 'medium';
  }

  return 'low';
}

function buildAuditSummary(action: unknown, targetType: unknown) {
  const actionText = typeof action === 'string' ? action : 'İşlem';
  const targetText = typeof targetType === 'string' ? targetType : 'kayıt';

  return `${targetText} üzerinde ${actionText} işlemi kaydedildi.`;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function inferCity(address?: string | null) {
  if (!address) {
    return 'Konum yok';
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : address;
}

function formatRelativeTime(value: unknown) {
  if (typeof value !== 'string') {
    return 'Tarih yok';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih yok';
  }

  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) {
    return 'Az önce';
  }
  if (minutes < 60) {
    return `${minutes} dk önce`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} sa önce`;
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
