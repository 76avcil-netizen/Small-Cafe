import type { AppRole } from '../store/authStore';

export const pagePermissions: Record<string, AppRole[]> = {
  '/dashboard': ['owner', 'admin', 'cashier'],
  '/orders': ['owner', 'admin', 'cashier', 'kitchen'],
  '/delivery': ['owner', 'admin', 'courier'],
  '/tables': ['owner', 'admin', 'cashier'],
  '/menu': ['owner', 'admin', 'kitchen'],
  '/accounting': ['owner', 'admin'],
  '/reports': ['owner', 'admin'],
  '/settings': ['owner', 'admin'],
};

export function canAccessPath(role: AppRole, path: string) {
  return (pagePermissions[path] ?? pagePermissions['/dashboard']).includes(role);
}

export function getDefaultPathForRole(role: AppRole) {
  if (role === 'courier') {
    return '/delivery';
  }

  if (role === 'kitchen') {
    return '/orders';
  }

  return '/dashboard';
}
