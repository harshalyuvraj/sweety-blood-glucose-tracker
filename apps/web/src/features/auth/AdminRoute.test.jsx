
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from './AdminRoute.jsx';
import { useAuth } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

vi.mock('./AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});


function renderAdminRoute(user, isAuthenticated = Boolean(user)) {
  useAuth.mockReturnValue({
    user,
    isAuthenticated,
  });

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<p>User Dashboard</p>} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<p>Admin Dashboard</p>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}


describe('AdminRoute', () => {
  it('allows an administrator to access the admin dashboard', () => {
    renderAdminRoute({
      id: 'admin-1',
      name: 'Admin',
      is_admin: true,
    });

    expect(
      screen.getByText('Admin Dashboard'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('User Dashboard'),
    ).not.toBeInTheDocument();
  });

  it('redirects a regular user to the user dashboard', () => {
    renderAdminRoute({
      id: 'user-1',
      name: 'Regular User',
      is_admin: false,
    });

    expect(
      screen.getByText('User Dashboard'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Admin Dashboard'),
    ).not.toBeInTheDocument();
  });

  it('redirects an unauthenticated user to the login page', () => {
    renderAdminRoute(null, false);

    expect(screen.getByText('Login Page')).toBeInTheDocument();

    expect(
      screen.queryByText('Admin Dashboard'),
    ).not.toBeInTheDocument();
  });
});
