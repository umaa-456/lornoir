import api from './api';

export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),

  // Products
  listProducts: (params) => api.get('/products', { params }).then((r) => r.data),
  getProduct: (id) => api.get(`/products/id/${id}`).then((r) => r.data),
  createProduct: (payload) => api.post('/products', payload).then((r) => r.data),
  updateProduct: (id, payload) => api.patch(`/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  uploadProductImages: (id, formData) =>
    api.post(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  deleteProductImage: (id, publicId) => api.delete(`/products/${id}/images/${encodeURIComponent(publicId)}`).then((r) => r.data),
  reorderProductImages: (id, publicIds) => api.patch(`/products/${id}/images/order`, { publicIds }).then((r) => r.data),
  getLowStock: () => api.get('/products/low-stock').then((r) => r.data),
  listSaleProducts: () => api.get('/products/sale-options').then((r) => r.data),
  listShippingProducts: (params) => api.get('/products/shipping-management', { params }).then((r) => r.data),
  updateProductShippingFee: (id, shippingFee) => api.patch(`/products/${id}/shipping-fee`, { shippingFee }).then((r) => r.data),

  // Brands
  listBrands: () => api.get('/brands').then((r) => r.data),
  createBrand: (payload) => api.post('/brands', payload).then((r) => r.data),
  updateBrand: (id, payload) => api.patch(`/brands/${id}`, payload).then((r) => r.data),
  deleteBrand: (id) => api.delete(`/brands/${id}`).then((r) => r.data),
  uploadBrandLogo: (id, formData) =>
    api.post(`/brands/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  // Categories
  listCategories: () => api.get('/categories').then((r) => r.data),
  createCategory: (payload) => api.post('/categories', payload).then((r) => r.data),
  updateCategory: (id, payload) => api.patch(`/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
  uploadCategoryImage: (id, formData) =>
    api.post(`/categories/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  // Orders
  listOrders: (params) => api.get('/orders', { params }).then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, payload) => api.patch(`/orders/${id}/status`, payload).then((r) => r.data),
  deleteCancelledOrder: (id) => api.delete(`/orders/${id}`).then((r) => r.data),
  refundOrder: (id, payload) => api.post(`/orders/${id}/refund`, payload).then((r) => r.data),
  updatePaymentStatus: (id, paymentStatus) => api.patch(`/orders/${id}/payment`, { paymentStatus }).then((r) => r.data),

  // Sales
  listSales: () => api.get('/sales').then((r) => r.data),
  createSale: (payload) => api.post('/sales', payload).then((r) => r.data),
  updateSale: (id, payload) => api.patch(`/sales/${id}`, payload).then((r) => r.data),
  deleteSale: (id) => api.delete(`/sales/${id}`).then((r) => r.data),

  // Customers / employees
  listCustomers: (params) => api.get('/admin/customers', { params }).then((r) => r.data),
  createStaffMember: (payload) => api.post('/admin/customers/staff', payload).then((r) => r.data),
  updateUserRole: (id, role) => api.patch(`/admin/customers/${id}/role`, { role }).then((r) => r.data),
  toggleUserActive: (id) => api.patch(`/admin/customers/${id}/toggle-active`).then((r) => r.data),

  // Reviews
  listReviewsForModeration: () => api.get('/admin/reviews').then((r) => r.data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),

  // Coupons
  listCoupons: () => api.get('/coupons').then((r) => r.data),
  createCoupon: (payload) => api.post('/coupons', payload).then((r) => r.data),
  updateCoupon: (id, payload) => api.patch(`/coupons/${id}`, payload).then((r) => r.data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`).then((r) => r.data),
};

export default adminApi;
