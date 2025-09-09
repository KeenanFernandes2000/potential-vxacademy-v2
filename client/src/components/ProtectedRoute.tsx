import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "admin" | "sub_admin" | "user";
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  fallbackPath,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#003451]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user type permission if required
  if (requiredUserType && user.userType !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    const dashboardPath =
      user.userType === "admin"
        ? "/admin/dashboard"
        : user.userType === "sub_admin"
        ? "/sub-admin/dashboard"
        : "/user/dashboard";

    return <Navigate to={dashboardPath} replace />;
  }

  // If custom fallback path is provided and user doesn't have permission
  if (fallbackPath && requiredUserType && user.userType !== requiredUserType) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User is authenticated and has permission
  return <>{children}</>;
};

export default ProtectedRoute;
