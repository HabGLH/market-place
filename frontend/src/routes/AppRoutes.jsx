import { Routes, Route, Outlet } from "react-router-dom";
import RequireAuth from "../auth/RequireAuth";

// Layouts (We might need to create these if they don't exist, or just use placeholders for now)
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Auth Pages
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";

// User Pages
import HomePage from "../user/pages/HomePage";
import CartPage from "../user/pages/CartPage";
import OrdersPage from "../user/pages/OrdersPage";
import ProfilePage from "../user/pages/ProfilePage";

// Admin Pages
import Dashboard from "../admin/pages/Dashboard";
import AdminProducts from "../admin/pages/Products";
import AdminOrders from "../admin/pages/Orders";
import AdminUsers from "../admin/pages/Users";
import AdminLayout from "../admin/AdminLayout";

// Placeholder wrapper for standard layout
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: "80vh", padding: "20px" }}>{children}</main>
    <Footer />
  </>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Pages with Main Layout */}
      <Route
        element={
          <>
            <Navbar />
            <Outlet />
            <Footer />
          </>
        }
      >
        <Route path="/" element={<HomePage />} />
        {/* Product Details etc */}
      </Route>

      {/* Protected User Routes */}
      <Route element={<RequireAuth allowedRoles={["user", "admin"]} />}>
        <Route
          element={
            <>
              <Navbar />
              <Outlet />
              <Footer />
            </>
          }
        >
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Profile etc */}
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
