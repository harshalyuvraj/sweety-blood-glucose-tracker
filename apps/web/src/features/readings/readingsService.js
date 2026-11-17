
import api from '../../lib/api.js';

export const readingsService = {
  async getAll(page = 1, limit = 20) {
    const response = await api.get('/readings', {
      params: {
        page,
        limit,
      },
    });

    return {
      readings: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getById(id) {
    const response = await api.get(`/readings/${id}`);
    return response.data.data;
  },

  async create(readingData) {
    const response = await api.post('/readings', readingData);
    return response.data.data;
  },

  async update(id, readingData) {
    const response = await api.put(`/readings/${id}`, readingData);
    return response.data.data;
  },

  async remove(id) {
    const response = await api.delete(`/readings/${id}`);
    return response.data;
  },
};
