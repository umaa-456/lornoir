import api from './api';

// API collection endpoints are expected to return arrays, but a deployed
// backend/proxy can occasionally return an incomplete success payload. Keep
// that malformed boundary from leaking `undefined` into rendering code.
const asArray = (value) => (Array.isArray(value) ? value : []);
const positiveInteger = (value, fallback) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};
const nonNegativeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

// Matches the backend listProducts contract: { page, limit, total,
// totalPages }. Keeping this complete prevents a malformed payload from
// replacing Shop's pagination object with undefined during a successful HTTP
// response.
const normalizePagination = (value, productCount) => {
  const source = value && typeof value === 'object' ? value : {};
  const limit = positiveInteger(source.limit, 12);
  const total = nonNegativeNumber(source.total, productCount);
  return {
    page: positiveInteger(source.page, 1),
    limit,
    total,
    totalPages: positiveInteger(source.totalPages, Math.max(1, Math.ceil(total / limit))),
  };
};

export const productsApi = {
  list: (params) => api.get('/products', { params }).then((r) => {
    const data = r.data && typeof r.data === 'object' ? r.data : {};
    const products = asArray(data.products);
    return { ...data, products, pagination: normalizePagination(data.pagination, products.length) };
  }),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data.product),
  getRelated: (slug) => api.get(`/products/${slug}/related`).then((r) => asArray(r.data?.products)),
  getAvailability: (ids) => api.get('/products/availability', { params: { ids: ids.join(',') } }).then((r) => asArray(r.data?.products)),
  stats: () => api.get('/products/stats').then((r) => r.data.stats),
};

export const brandsApi = {
  list: () => api.get('/brands').then((r) => asArray(r.data?.brands)),
};

export const categoriesApi = {
  list: () => api.get('/categories').then((r) => asArray(r.data?.categories)),
};

export const reviewsApi = {
  listByProductSlug: (slug) => api.get(`/reviews/product/${slug}`).then((r) => asArray(r.data?.reviews)),
  featured: () => api.get('/reviews/featured').then((r) => asArray(r.data?.reviews)),
  create: (formData) =>
    api.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.review),
  update: (id, payload) => api.patch(`/reviews/${id}`, payload).then((r) => r.data.review),
  remove: (id) => api.delete(`/reviews/${id}`),
};
