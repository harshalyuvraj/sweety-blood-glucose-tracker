import api from '../../lib/api.js';

export const readingsService = {
  async getAll() {
    const response = await api.get('/readings');
    return response.data.data;
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