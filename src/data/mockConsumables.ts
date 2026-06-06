import type { ConsumableItem } from '../types';

const today = new Date();

function addDays(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const mockConsumables: ConsumableItem[] = [
  {
    id: 'consumable-tea',
    name: 'İkram çayı',
    category: 'İkram',
    quantity: 4,
    unit: 'kg',
    unitCost: 185,
    purchaseDate: addDays(-8),
    expiryDate: addDays(120),
    storageLocation: 'Kuru depo',
    usageType: 'ikram',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'consumable-sauce',
    name: 'Acı sos paket',
    category: 'Sarf',
    quantity: 180,
    unit: 'adet',
    unitCost: 1.2,
    purchaseDate: addDays(-18),
    expiryDate: addDays(5),
    storageLocation: 'Paket servis rafı',
    usageType: 'sarf',
    note: 'SKT yaklaşınca önce bu parti kullanılmalı.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'consumable-yogurt',
    name: 'Yoğurt',
    category: 'Mutfak',
    quantity: 6,
    unit: 'kg',
    unitCost: 42,
    purchaseDate: addDays(-3),
    expiryDate: addDays(-1),
    storageLocation: 'Soğuk dolap',
    usageType: 'mutfak',
    note: 'Kontrol edilmeden servise çıkarılmamalı.',
    createdAt: new Date().toISOString(),
  },
];
