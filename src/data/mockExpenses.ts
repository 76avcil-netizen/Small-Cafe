import type { Expense } from '../types';

export const mockExpenses: Expense[] = [
  {
    id: 'expense-vegetables',
    name: 'Sebze ve garnitür',
    amount: 280,
    category: 'Malzeme',
    expenseDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'expense-packaging',
    name: 'Paket malzemesi',
    amount: 170,
    category: 'Paketleme',
    expenseDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'expense-courier-fuel',
    name: 'Kurye yakıt desteği',
    amount: 230,
    category: 'Operasyon',
    expenseDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  },
];
