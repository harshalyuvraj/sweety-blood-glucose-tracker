import api from '../../lib/api.js';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },
};