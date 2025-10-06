import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  CheckCircle,
  ErrorOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import HomeNavigation from "@/components/homeNavigation";
// import "@/homepage.css";

// API object for this page
const api = {
  async verifyPasswordResetToken(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/password-reset/verify/${token}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to verify password reset token:", error);
      throw error;
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/password-reset/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  },
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await api.verifyPasswordResetToken(token);

        if (response.success) {
          setUserInfo(response.data);
        } else {
          setError(response.message || "Invalid or expired reset token");
        }
      } catch (error: any) {
        setError("Failed to verify reset token. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.resetPassword(token, password);

      if (response.success) {
        setShowSuccessDialog(true);
      } else {
        setError(
          response.message || "Failed to reset password. Please try again."
        );
      }
    } catch (error: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    setShowSuccessDialog(false);
    navigate("/login");
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col bg-primary-sandstone relative overflow-hidden">
        <HomeNavigation />
        <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
          <div className="w-full max-w-md lg:max-w-lg">
            <Card className="shadow-2xl bg-primary-white backdrop-blur-sm border border-primary-sandstone overflow-hidden rounded-none">
              <CardContent className="px-8 lg:px-10 py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dawn mx-auto mb-4"></div>
                  <p className="text-[#666666] text-lg">
                    Verifying reset token...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token verification failed
  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-sandstone relative overflow-hidden">
        <HomeNavigation />
        <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
          <div className="w-full max-w-md lg:max-w-lg">
            <Card className="shadow-2xl bg-white backdrop-blur-sm border border-sandstone overflow-hidden rounded-none">
              <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
                <CardTitle className="text-primary-black text-3xl lg:text-4xl font-bold text-center mb-3">
                  Invalid Reset Link
                </CardTitle>
                <div className="w-24 h-1 bg-primary-dawn rounded-full mx-auto mb-4"></div>
                <CardDescription className="text-[#666666] text-center text-lg leading-relaxed">
                  This password reset link is invalid or has expired
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 lg:px-10 pb-10">
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
                  <ErrorOutline className="!h-4 !w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <Button
                  onClick={() => navigate("/forgot-password")}
                  className="w-full bg-dawn hover:bg-[#B85A1A] text-white py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-sandstone transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 rounded-full"
                >
                  Request New Reset Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-sandstone relative overflow-hidden">
      <HomeNavigation />

      {/* Reset Password Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="shadow-2xl bg-primary-white backdrop-blur-sm border border-primary-sandstone overflow-hidden rounded-none">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-primary-black text-3xl lg:text-4xl font-bold text-center mb-3">
                Reset Password
              </CardTitle>
              <div className="w-24 h-1 bg-primary-dawn rounded-full mx-auto mb-4"></div>
              <CardDescription className="text-[#666666] text-center text-lg leading-relaxed">
                {userInfo ? (
                  <>
                    Reset password for{" "}
                    <span className="text-primary-dawn font-semibold">
                      {userInfo.email}
                    </span>
                  </>
                ) : (
                  "Enter your new password below"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-primary-black font-semibold text-base tracking-wide pl-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(""); // Clear error when user types
                      }}
                      className="bg-primary-white backdrop-blur-sm border-primary-sandstone text-primary-black placeholder:text-[#666666] focus:bg-primary-white focus:border-primary-dawn transition-all duration-300 py-3 text-base border-2 hover:border-primary-dawn rounded-full w-full px-4 pr-12 outline-none"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#666666] transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <VisibilityOff className="!h-5 !w-5" />
                      ) : (
                        <Visibility className="!h-5 !w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-primary-black font-semibold text-base tracking-wide pl-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError(""); // Clear error when user types
                      }}
                      className="bg-primary-white backdrop-blur-sm border-primary-sandstone text-primary-black placeholder:text-[#666666] focus:bg-primary-white focus:border-primary-dawn transition-all duration-300 py-3 text-base border-2 hover:border-primary-dawn rounded-full w-full px-4 pr-12 outline-none"
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#666666] transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff className="!h-5 !w-5" />
                      ) : (
                        <Visibility className="!h-5 !w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <ErrorOutline className="!h-4 !w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-4 space-y-4">
                  <Button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="w-full bg-primary-dawn hover:bg-[#B85A1A] text-primary-white text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-primary-dawn rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-primary-white border-primary-sandstone text-primary-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary-dawn">
              Password Updated Successfully!
            </DialogTitle>
            <DialogDescription className="text-[#666666] text-center text-lg mt-4">
              Your password has been reset successfully. You can now log in with
              your new password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <CheckCircle className="!h-16 !w-16 text-primary-dawn" />
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleContinueToLogin}
              className="bg-primary-dawn hover:bg-[#B85A1A] text-primary-white text-lg px-8 py-3 font-semibold shadow-xl transition-all duration-300 hover:scale-105 rounded-full"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
