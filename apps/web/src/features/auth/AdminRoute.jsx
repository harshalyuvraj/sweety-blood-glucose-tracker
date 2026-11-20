
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function AdminRoute() {
  const { user } = useAuth();

  if (user?.is_admin !== true) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
