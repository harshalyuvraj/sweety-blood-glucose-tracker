
import api from '../../lib/api.js';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  async getRecentUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async getRecentActivity() {
    const response = await api.get('/admin/activity');
    return response.data.data;
  },
};
