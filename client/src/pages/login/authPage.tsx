import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import "@/homepage.css";

// MUI Icons
import HomeNavigation from "@/components/homeNavigation";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, redirectIfLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Check if user is already logged in and redirect them
  useEffect(() => {
    redirectIfLoggedIn();
  }, [redirectIfLoggedIn]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Get user data from the login response to determine redirect path
        const user = (result as any).user;
        let redirectPath = "/";

        // Redirect based on user type
        if (user?.userType === "admin") {
          redirectPath = "/admin/dashboard";
        } else if (user?.userType === "sub_admin") {
          redirectPath = "/sub-admin/dashboard";
        } else if (user?.userType === "user") {
          const getflags = JSON.parse(localStorage.getItem("flags") || "{}");
          if (getflags?.existing && !getflags?.initialAssessment) {
            redirectPath = "/initial-assessment";
          } else {
            redirectPath = "/user/dashboard";
          }
        }

        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-sandstone relative overflow-hidden">
      {/* Navigation Bar with Glassmorphism */}
      <HomeNavigation />

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] relative">
        <Card className="w-full max-w-lg bg-white backdrop-blur-sm border border-sandstone shadow-2xl relative z-10 rounded-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C2C2C] mb-4">
              Login
            </CardTitle>
            <div className="w-24 h-1 bg-dawn rounded-full mx-auto mb-4"></div>
            <CardDescription className="text-lg lg:text-xl text-[#666666] leading-relaxed max-w-sm mx-auto">
              Enter your credentials to access your VX Academy dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-[#2C2C2C] pl-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-lg font-semibold text-[#2C2C2C] pl-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-dawn hover:text-[#B85A1A] text-sm font-medium transition-all duration-300 hover:underline hover:translate-x-1 transform inline-block"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-dawn hover:bg-[#B85A1A] text-white text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-dawn rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
