import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function AuthGate({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-card px-5 py-4 shadow-soft">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-sm font-semibold">Oturum kontrol ediliyor</span>
        </div>
      </div>
    );
  }

  return children;
}
