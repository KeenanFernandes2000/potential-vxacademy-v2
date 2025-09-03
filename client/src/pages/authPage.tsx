import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Icon from "../components/ui/icon";

// MUI Icons
import MenuIcon from "@mui/icons-material/Menu";

const AuthPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", formData);
  };

  return (
    <div className="min-h-screen bg-[#003451] relative overflow-hidden">
      {/* Navigation Bar with Glassmorphism */}
      <nav className="backdrop-blur-xl border-b border-white/10 z-50 sticky top-0 shadow-2xl">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <div className="h-12 w-auto">
                <img
                  src="/vx-academy-logo.svg"
                  alt="VX Academy Logo"
                  className="h-full"
                />
              </div>
            </Link>
            {/* </div> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8"></div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="text-white/90 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon Component={MenuIcon} size={24} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Mobile Menu with Glassmorphism */}
        {isMobileMenuOpen && (
          <div className="lg:hidden backdrop-blur-xl border-[#00d8cc]/20">
            <div className="px-4 py-4 space-y-3">
              <Link to="/">
                <Button className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-3 font-semibold shadow-lg backdrop-blur-sm border border-[#00d8cc]/20 transition-all duration-300 hover:scale-105">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] relative">
        <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Login
            </CardTitle>
            <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
            <CardDescription className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
              Enter your credentials to access your VX Academy dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-white pl-2"
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
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-lg font-semibold text-white pl-2"
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
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[#00d8cc] hover:text-[#00b8b0] bg- shadow- text-sm font-medium transition-all duration-300 hover:underline hover:translate-x-1 transform inline-block"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
