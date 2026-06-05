import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/auth/AuthGate';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Accounting } from './pages/Accounting';
import { Dashboard } from './pages/Dashboard';
import { Delivery } from './pages/Delivery';
import { Menu } from './pages/Menu';
import { Orders } from './pages/Orders';
import { Operator } from './pages/Operator';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Tables } from './pages/Tables';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';
import { getDefaultPathForRole, pagePermissions } from './utils/permissions';

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={(
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={pagePermissions['/dashboard']}><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={pagePermissions['/orders']}><Orders /></ProtectedRoute>} />
          <Route path="/delivery" element={<ProtectedRoute allowedRoles={pagePermissions['/delivery']}><Delivery /></ProtectedRoute>} />
          <Route path="/tables" element={<ProtectedRoute allowedRoles={pagePermissions['/tables']}><Tables /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute allowedRoles={pagePermissions['/menu']}><Menu /></ProtectedRoute>} />
          <Route path="/accounting" element={<ProtectedRoute allowedRoles={pagePermissions['/accounting']}><Accounting /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={pagePermissions['/reports']}><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={pagePermissions['/settings']}><Settings /></ProtectedRoute>} />
          <Route path="/operator" element={<ProtectedRoute allowedRoles={pagePermissions['/operator']}><Operator /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthGate>
  );
}

function HomeRedirect() {
  const profile = useAuthStore((state) => state.profile);
  return <Navigate to={profile ? getDefaultPathForRole(profile.role) : '/login'} replace />;
}
