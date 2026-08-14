import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AccountLayout from '@/components/account/AccountLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import { PageLoader } from '@/components/ui/Loader';

const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Brands = lazy(() => import('@/pages/Brands'));
const NewArrivals = lazy(() => import('@/pages/NewArrivals'));
const BestSellers = lazy(() => import('@/pages/BestSellers'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const About = lazy(() => import('@/pages/info/About'));
const Faq = lazy(() => import('@/pages/info/Faq'));
const Contact = lazy(() => import('@/pages/info/Contact'));
const Shipping = lazy(() => import('@/pages/info/Shipping'));
const Privacy = lazy(() => import('@/pages/info/Privacy'));
const Terms = lazy(() => import('@/pages/info/Terms'));
const Sustainability = lazy(() => import('@/pages/info/Sustainability'));
const Journal = lazy(() => import('@/pages/info/Journal'));
const Stores = lazy(() => import('@/pages/info/Stores'));
const TrackOrder = lazy(() => import('@/pages/info/TrackOrder'));

const AccountProfile = lazy(() => import('@/pages/account/Profile'));
const AccountOrders = lazy(() => import('@/pages/account/Orders'));
const AccountOrderDetail = lazy(() => import('@/pages/account/OrderDetail'));
const AccountAddresses = lazy(() => import('@/pages/account/Addresses'));
const AccountNotifications = lazy(() => import('@/pages/account/Notifications'));

const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminProductForm = lazy(() => import('@/pages/admin/ProductForm'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/OrderDetail'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminBrands = lazy(() => import('@/pages/admin/Brands'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminReviews = lazy(() => import('@/pages/admin/Reviews'));
const AdminCoupons = lazy(() => import('@/pages/admin/Coupons'));
const AdminInventory = lazy(() => import('@/pages/admin/Inventory'));
const AdminBranding = lazy(() => import('@/pages/admin/Branding'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: withSuspense(NotFound),
    children: [
      { index: true, element: withSuspense(Home) },
      { path: 'shop', element: withSuspense(Shop) },
      { path: 'product/:slug', element: withSuspense(ProductDetail) },
      { path: 'brands', element: withSuspense(Brands) },
      { path: 'new-arrivals', element: withSuspense(NewArrivals) },
      { path: 'best-sellers', element: withSuspense(BestSellers) },
      { path: 'about', element: withSuspense(About) },
      { path: 'faq', element: withSuspense(Faq) },
      { path: 'contact', element: withSuspense(Contact) },
      { path: 'shipping', element: withSuspense(Shipping) },
      { path: 'privacy', element: withSuspense(Privacy) },
      { path: 'terms', element: withSuspense(Terms) },
      { path: 'sustainability', element: withSuspense(Sustainability) },
      { path: 'journal', element: withSuspense(Journal) },
      { path: 'stores', element: withSuspense(Stores) },
      { path: 'track-order', element: withSuspense(TrackOrder) },
      { path: 'login', element: withSuspense(Login) },
      { path: 'signup', element: withSuspense(Signup) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
      { path: 'reset-password/:token', element: withSuspense(ResetPassword) },
      { path: 'cart', element: withSuspense(Cart) },
      { path: 'checkout', element: withSuspense(Checkout) },
      { path: 'order-confirmed', element: withSuspense(OrderConfirmation) },
      { path: 'wishlist', element: withSuspense(Wishlist) },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'account',
            element: <AccountLayout />,
            children: [
              { index: true, element: withSuspense(AccountProfile) },
              { path: 'orders', element: withSuspense(AccountOrders) },
              { path: 'orders/:id', element: withSuspense(AccountOrderDetail) },
              { path: 'addresses', element: withSuspense(AccountAddresses) },
              { path: 'notifications', element: withSuspense(AccountNotifications) },
            ],
          },
        ],
      },
    ],
  },
  { path: '/admin/login', element: withSuspense(AdminLogin) },
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    errorElement: withSuspense(NotFound),
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(AdminDashboard) },
          { path: 'products', element: withSuspense(AdminProducts) },
          { path: 'products/new', element: withSuspense(AdminProductForm) },
          { path: 'products/:id', element: withSuspense(AdminProductForm) },
          { path: 'orders', element: withSuspense(AdminOrders) },
          { path: 'orders/:id', element: withSuspense(AdminOrderDetail) },
          { path: 'categories', element: withSuspense(AdminCategories) },
          { path: 'brands', element: withSuspense(AdminBrands) },
          { path: 'customers', element: withSuspense(AdminCustomers) },
          { path: 'reviews', element: withSuspense(AdminReviews) },
          { path: 'coupons', element: withSuspense(AdminCoupons) },
          { path: 'inventory', element: withSuspense(AdminInventory) },
          { path: 'branding', element: withSuspense(AdminBranding) },
          { path: 'settings', element: withSuspense(AdminSettings) },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
