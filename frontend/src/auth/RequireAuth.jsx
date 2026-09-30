import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";
import Loader from "../components/Loader";

const RequireAuth = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return <Loader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized, render the protected route
  return <Outlet />;
};

export default RequireAuth;
