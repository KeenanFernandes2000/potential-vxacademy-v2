import { useState } from "react";
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
import { CheckCircle } from "lucide-react";
import { DashboardNav } from "@/components/ui/dashboardNav";

export default function ResetPasswordPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // No functionality - just UI state for display
  const handleUpdatePassword = () => {
    setShowSuccessDialog(true);
  };

  const handleContinueToLogin = () => {
    setShowSuccessDialog(false);
    // No actual navigation
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#003451] relative overflow-hidden"
      style={{ backgroundColor: "#003451" }}
    >
      <DashboardNav />

      {/* Reset Password Form */}
      <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 flex-1">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="shadow-2xl bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 overflow-hidden rounded-none">
            <CardHeader className="pb-8 px-8 pt-10 lg:px-10">
              <CardTitle className="text-white text-3xl lg:text-4xl font-bold text-center mb-3">
                Reset Password
              </CardTitle>
              <CardDescription className="text-white/80 text-center text-lg leading-relaxed">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 lg:px-10 pb-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-white font-semibold text-base tracking-wide pl-2">
                    New Password
                  </label>
                  <input
                    placeholder="Enter your new password"
                    className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full w-full px-4 outline-none"
                    type="password"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-white font-semibold text-base tracking-wide pl-2">
                    Confirm New Password
                  </label>
                  <input
                    placeholder="Confirm your new password"
                    className="bg-[#00d8cc]/20 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full w-full px-4 outline-none"
                    type="password"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="button"
                    onClick={handleUpdatePassword}
                    className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black py-5 lg:py-6 font-bold text-lg lg:text-xl shadow-xl backdrop-blur-sm border-2 border-[#00d8cc]/20 transition-all duration-300 hover:scale-105 hover:shadow-[#00d8cc]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl rounded-full"
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-[#003451] border-[#00d8cc]/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-[#00d8cc]">
              Password Updated Successfully!
            </DialogTitle>
            <DialogDescription className="text-white/80 text-center text-lg mt-4">
              Your password has been reset. You can now log in with your new
              password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <CheckCircle className="h-16 w-16 text-[#00d8cc]" />
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleContinueToLogin}
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 py-3 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 rounded-full"
            >
              Continue to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
