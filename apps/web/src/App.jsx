import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ProtectedRoute from './features/auth/ProtectedRoute.jsx';
import AdminRoute from './features/auth/AdminRoute.jsx';
import ReadingsPage from './pages/readings/ReadingsPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/readings" element={<ReadingsPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={<AdminDashboardPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
