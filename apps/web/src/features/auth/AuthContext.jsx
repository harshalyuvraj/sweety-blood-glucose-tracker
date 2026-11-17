import { createContext, useContext, useState } from 'react';
import { authService } from './authService.js';
import { authStorage } from '../../lib/authStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());

  async function register(userData) {
    const data = await authService.register(userData);
    authStorage.saveAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  }

  async function login(credentials) {
    const data = await authService.login(credentials);
    authStorage.saveAuth(data.token, data.user);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    authStorage.clearAuth();
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: Boolean(user),
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}