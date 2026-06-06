import type { OperatorAuditLog, OperatorIntegrationEvent, OperatorRestaurant } from '../types';

export const mockOperatorRestaurants: OperatorRestaurant[] = [
  {
    id: 'lezzet-bufe',
    name: 'Lezzet Büfe',
    ownerEmail: 'yonetici@lezzetbufe.local',
    city: 'İstanbul',
    users: 5,
    integrations: [
      { id: 'ys-lezzet', restaurantId: 'lezzet-bufe', name: 'Yemeksepeti', status: 'connected' },
      { id: 'feedme-lezzet', restaurantId: 'lezzet-bufe', name: 'Feedme', status: 'pending' },
      { id: 'getir-lezzet', restaurantId: 'lezzet-bufe', name: 'Getir', status: 'error' },
    ],
  },
  {
    id: 'sahil-doner',
    name: 'Sahil Döner',
    ownerEmail: 'admin@sahildoner.local',
    city: 'İzmir',
    users: 3,
    integrations: [
      { id: 'ys-sahil', restaurantId: 'sahil-doner', name: 'Yemeksepeti', status: 'connected' },
      { id: 'ty-sahil', restaurantId: 'sahil-doner', name: 'Trendyol Yemek', status: 'pending' },
    ],
  },
  {
    id: 'merkez-kofte',
    name: 'Merkez Köfte',
    ownerEmail: 'sahip@merkez.local',
    city: 'Ankara',
    users: 4,
    integrations: [
      { id: 'feedme-merkez', restaurantId: 'merkez-kofte', name: 'Feedme', status: 'connected' },
      { id: 'wolt-merkez', restaurantId: 'merkez-kofte', name: 'Wolt', status: 'connected' },
    ],
  },
];

export const mockOperatorEvents: OperatorIntegrationEvent[] = [
  {
    id: 'evt-1',
    restaurantId: 'lezzet-bufe',
    restaurantName: 'Lezzet Büfe',
    provider: 'Yemeksepeti',
    title: 'Yeni sipariş bildirimi alındı',
    status: 'success',
    receivedAt: '2 dk önce',
  },
  {
    id: 'evt-2',
    restaurantId: 'lezzet-bufe',
    restaurantName: 'Lezzet Büfe',
    provider: 'Getir',
    title: 'Kimlik doğrulama hatası',
    status: 'error',
    receivedAt: '18 dk önce',
  },
  {
    id: 'evt-3',
    restaurantId: 'sahil-doner',
    restaurantName: 'Sahil Döner',
    provider: 'Trendyol Yemek',
    title: 'Webhook test bildirimi beklemede',
    status: 'warning',
    receivedAt: '42 dk önce',
  },
];

export const mockOperatorAuditLogs: OperatorAuditLog[] = [
  {
    id: 'audit-1',
    operatorName: 'Sistem Operatörü',
    restaurantName: 'Lezzet Büfe',
    action: 'integration.secret_rotated',
    targetType: 'integration_account',
    targetId: 'getir-lezzet',
    summary: 'Getir webhook secret referansı yenilendi.',
    severity: 'medium',
    createdAt: '11 dk önce',
  },
  {
    id: 'audit-2',
    operatorName: 'Sistem Operatörü',
    restaurantName: 'Sahil Döner',
    action: 'profile.role_changed',
    targetType: 'profile',
    summary: 'Personel rolü kurye olarak güncellendi.',
    severity: 'low',
    createdAt: '34 dk önce',
  },
  {
    id: 'audit-3',
    operatorName: 'Koruma Kontrolü',
    restaurantName: 'Lezzet Büfe',
    action: 'access.suspicious_attempt',
    targetType: 'operator_route',
    summary: 'Restoran kullanıcısından operatör ekranına yetkisiz erişim denemesi yakalandı.',
    severity: 'high',
    createdAt: '1 sa önce',
  },
];
