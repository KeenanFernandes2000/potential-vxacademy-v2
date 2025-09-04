import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import HomeNavigation from "@/components/homeNavigation";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Simple navigation without form submission
  const handleSendResetLink = () => {
    navigate("/reset");
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#003451] relative overflow-hidden"
      style={{ backgroundColor: "#003451" }}
    >
      {/* Navigation Bar with Glassmorphism */}
      <HomeNavigation />

      {/* Forgot Password Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="shadow-2xl bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 overflow-hidden rounded-none">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-white text-3xl lg:text-4xl font-bold text-center mb-3">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-white/80 text-center text-lg leading-relaxed">
                Enter your email address to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-white font-semibold text-base tracking-wide pl-2">
                    Email Address
                  </label>
                  <input
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full w-full px-4 outline-none"
                    type="email"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="button"
                    onClick={handleSendResetLink}
                    className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full cursor-pointer"
                  >
                    Send Reset Link
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="w-full text-[#00d8cc] hover:text-[#00b8b0] hover:bg-[#00d8cc]/10 py-4 font-medium transition-all duration-300 rounded-full cursor-pointer"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
