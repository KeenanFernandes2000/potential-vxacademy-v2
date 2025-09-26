import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.userType) {
      case "admin":
        return "/admin/dashboard";
      case "sub_admin":
        return "/sub-admin/dashboard";
      case "user":
        return "/user/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen bg-sandstone flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <CardTitle className="text-3xl font-bold text-white">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-white/80 text-lg">
            You don't have permission to access this page.
          </p>

          {user && (
            <div className="bg-[#00d8cc]/10 border border-[#00d8cc]/20 rounded-lg p-4">
              <p className="text-white/70 text-sm mb-2">
                Current user type:{" "}
                <span className="font-semibold text-[#00d8cc]">
                  {user.userType.replace("_", " ").toUpperCase()}
                </span>
              </p>
              <p className="text-white/70 text-sm">
                This page requires different permissions.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black"
            >
              <Link to={getDashboardPath()}>Go to Dashboard</Link>
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-[#00d8cc]/20 text-white hover:bg-[#00d8cc]/10"
            >
              Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
