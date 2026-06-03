import type { Product } from '../types';

const now = new Date().toISOString();

export const mockProducts: Product[] = [
  { id: 'p-1', name: 'Santos', description: 'Özel soslu büfe lezzeti', price: 360, category: 'Büfe Special', isAvailable: true, soldCount: 42, createdAt: now, updatedAt: now },
  { id: 'p-2', name: 'Tavuk Dolma', description: 'Doyurucu tavuk dolma porsiyon', price: 550, category: 'Büfe Special', isAvailable: true, soldCount: 38, createdAt: now, updatedAt: now },
  { id: 'p-3', name: 'XL Tavuk Dolma', description: 'Büyük porsiyon tavuk dolma', price: 600, category: 'Büfe Special', isAvailable: true, soldCount: 31, createdAt: now, updatedAt: now },
  { id: 'p-4', name: 'Bulgur Köftesi', description: 'Ev yapımı bulgur köftesi', price: 150, category: 'Büfe Special', isAvailable: true, soldCount: 24, createdAt: now, updatedAt: now },
  { id: 'p-5', name: 'XL Tavuk Dolma + İçecek', description: 'Menü yanında seçili içecek', price: 650, category: 'Büfe Special', isAvailable: false, soldCount: 29, createdAt: now, updatedAt: now },
  { id: 'p-6', name: 'Kaşarlı Tost', description: 'Bol kaşarlı klasik tost', price: 180, category: 'Sandviç & Tost', isAvailable: true, soldCount: 35, createdAt: now, updatedAt: now },
  { id: 'p-7', name: 'Karışık Tost', description: 'Sucuk, kaşar ve domates', price: 220, category: 'Sandviç & Tost', isAvailable: true, soldCount: 27, createdAt: now, updatedAt: now },
  { id: 'p-8', name: 'Burger Menü', description: 'Patates ve içecek ile servis', price: 420, category: 'Burgerler', isAvailable: true, soldCount: 33, createdAt: now, updatedAt: now },
  { id: 'p-9', name: 'Köfte Ekmek', description: 'Izgara köfte ve taze garnitür', price: 300, category: 'Köfteler', isAvailable: true, soldCount: 21, createdAt: now, updatedAt: now },
  { id: 'p-10', name: 'Ayran', description: 'Soğuk kutu ayran', price: 50, category: 'İçecekler', isAvailable: true, soldCount: 56, createdAt: now, updatedAt: now },
];
