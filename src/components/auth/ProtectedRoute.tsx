import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { roleLabels, useAuthStore, type AppRole } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const profile = useAuthStore((state) => state.profile);
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-lg rounded-2xl border border-line bg-card p-6 text-center shadow-soft">
          <p className="text-sm font-semibold text-primary">{roleLabels[profile.role]}</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Bu sayfa için yetkiniz yok</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Bu ekran yalnızca yetkili kullanıcılar tarafından görüntülenebilir. Farklı bir kullanıcıyla giriş yapabilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
