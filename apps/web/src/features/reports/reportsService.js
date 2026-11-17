
import api from '../../lib/api.js';

export const reportsService = {
  async getDaily(date) {
    const response = await api.get('/reports/daily', {
      params: date ? { date } : {},
    });

    return response.data.data;
  },

  async getMonthToDate(date) {
    const response = await api.get('/reports/month-to-date', {
      params: date ? { date } : {},
    });

    return response.data.data;
  },

  async getPreviousMonth() {
    const response = await api.get('/reports/previous-month');
    return response.data.data;
  },
};
