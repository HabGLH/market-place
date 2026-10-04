import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LoginPage = lazy(() => import("../auth/LoginPage"));
const RegisterPage = lazy(() => import("../auth/RegisterPage"));
const HomePage = lazy(() => import("../user/pages/HomePage"));
const ProductsPage = lazy(() => import("../user/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../user/pages/ProductDetailPage"));
const CategoriesPage = lazy(() => import("../user/pages/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("../user/pages/CategoryDetailPage"));
const CartPage = lazy(() => import("../user/pages/CartPage"));
const CheckoutPage = lazy(() => import("../user/pages/CheckoutPage"));
const OrdersPage = lazy(() => import("../user/pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("../user/pages/OrderDetailPage"));
const PaymentReturnPage = lazy(() => import("../user/pages/PaymentReturnPage"));
const ProfilePage = lazy(() => import("../user/pages/ProfilePage"));
const StaticPage = lazy(() => import("../user/pages/StaticPage"));
const Dashboard = lazy(() => import("../admin/pages/Dashboard"));
const AdminProducts = lazy(() => import("../admin/pages/Products"));
const AdminOrders = lazy(() => import("../admin/pages/Orders"));
const AdminUsers = lazy(() => import("../admin/pages/Users"));
const AdminCategories = lazy(() => import("../admin/pages/Categories"));
const AdminInventory = lazy(() => import("../admin/pages/Inventory"));
const AdminActivityLogs = lazy(() => import("../admin/pages/ActivityLogs"));
const AdminLayout = lazy(() => import("../admin/AdminLayout"));
const NotFoundPage = lazy(() => import("../components/NotFoundPage"));

const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 font-semibold" role="status">
          <svg className="h-8 w-8 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading TechBrand...
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/about" element={<StaticPage />} />
          <Route path="/contact" element={<StaticPage />} />
          <Route path="/faq" element={<StaticPage />} />
          <Route path="/shipping" element={<StaticPage />} />
          <Route path="/returns" element={<StaticPage />} />
          <Route path="/shipping-returns" element={<StaticPage />} />
          <Route path="/privacy" element={<StaticPage />} />
          <Route path="/terms" element={<StaticPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={["user", "admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/return" element={<PaymentReturnPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="logs" element={<AdminActivityLogs />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
