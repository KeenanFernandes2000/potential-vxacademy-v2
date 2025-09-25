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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import HomeNavigation from "@/components/homeNavigation";
// import "@/homepage.css";

// API object for this page
const api = {
  async requestPasswordReset(email: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/password-reset/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error;
    }
  },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState("");

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.requestPasswordReset(email);

      if (response.success) {
        setShowSuccessDialog(true);
      } else {
        setError(
          response.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-sandstone relative overflow-hidden">
      {/* Navigation Bar with Glassmorphism */}
      <HomeNavigation />

      {/* Forgot Password Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="shadow-2xl bg-white backdrop-blur-sm border border-sandstone overflow-hidden rounded-none">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-[#2C2C2C] text-3xl lg:text-4xl font-bold text-center mb-3">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-[#666666] text-center text-lg leading-relaxed">
                Enter your email address to receive a password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[#2C2C2C] font-semibold text-base tracking-wide pl-2">
                    Email Address
                  </label>
                  <input
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(""); // Clear error when user types
                    }}
                    className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full w-full px-4 outline-none"
                    type="email"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <ErrorOutline className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <Button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={isLoading}
                    className="w-full bg-dawn hover:bg-[#B85A1A] text-white py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-dawn transition-all duration-300 hover:scale-105 hover:shadow-dawn/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full cursor-pointer"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                    className="w-full text-dawn hover:text-[#B85A1A] hover:bg-dawn/10 py-4 font-medium transition-all duration-300 rounded-full cursor-pointer disabled:opacity-50"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-white border-sandstone text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-dawn">
              Reset Link Sent!
            </DialogTitle>
            <DialogDescription className="text-[#666666] text-center text-lg mt-4">
              If an account with this email exists, a password reset link has
              been sent to your email address. Please check your inbox and
              follow the instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <CheckCircle className="!h-16 !w-16 text-dawn" />
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleCloseSuccessDialog}
              className="bg-dawn hover:bg-[#B85A1A] text-white px-8 py-3 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 rounded-full"
            >
              Back to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
