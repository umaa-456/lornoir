import api from './api';

export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data.product),
  getRelated: (slug) => api.get(`/products/${slug}/related`).then((r) => r.data.products),
  stats: () => api.get('/products/stats').then((r) => r.data.stats),
};

export const brandsApi = {
  list: () => api.get('/brands').then((r) => r.data.brands),
};

export const categoriesApi = {
  list: () => api.get('/categories').then((r) => r.data.categories),
};

export const reviewsApi = {
  listByProductSlug: (slug) => api.get(`/reviews/product/${slug}`).then((r) => r.data.reviews),
  featured: () => api.get('/reviews/featured').then((r) => r.data.reviews),
  create: (formData) =>
    api.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.review),
  update: (id, payload) => api.patch(`/reviews/${id}`, payload).then((r) => r.data.review),
  remove: (id) => api.delete(`/reviews/${id}`),
};
