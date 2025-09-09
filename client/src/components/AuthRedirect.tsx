import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on user type
      const dashboardPath =
        user.userType === "admin"
          ? "/admin/dashboard"
          : user.userType === "sub_admin"
          ? "/sub-admin/dashboard"
          : "/user/dashboard";

      navigate(dashboardPath, { replace: true });
    } else if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login", { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#003451]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
        <p className="text-white/80 text-lg">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
