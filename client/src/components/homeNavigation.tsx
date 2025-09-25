import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

// Icon components (you can replace these with your actual icon imports)
const MenuIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H21M3 6H21M3 18H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface HomeNavigationProps {
  showItems?: boolean; // Controls visibility of navigation items
}

const HomeNavigation: React.FC<HomeNavigationProps> = ({
  showItems = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userExists, user } = useAuth();

  // Get the appropriate dashboard path based on user type
  const getDashboardPath = () => {
    if (!userExists()) return "/login";

    switch (user?.userType) {
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Navigation Bar with Clean Design */}
      <nav className="bg-white border-b border-[#E5E5E5] z-50 sticky top-0 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-auto">
              <Link to={showItems ? "" : "/"}>
                <img
                  src="/logo.png"
                  alt="VX Academy Logo"
                  className="h-full"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          {showItems && (
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("about")}
                className="text-[#2C2C2C] hover:text-dawn transition-all duration-300 hover:scale-105 font-regular cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-[#2C2C2C] hover:text-dawn transition-all duration-300 hover:scale-105 font-regular cursor-pointer"
              >
                Why Join
              </button>
              <button
                onClick={() => scrollToSection("training-areas")}
                className="text-[#2C2C2C] hover:text-dawn transition-all duration-300 hover:scale-105 font-regular cursor-pointer"
              >
                Training Areas
              </button>

              <button
                onClick={() => scrollToSection("for")}
                className="text-[#2C2C2C] hover:text-dawn transition-all duration-300 hover:scale-105 font-regular cursor-pointer"
              >
                Who is it for
              </button>
              {userExists() ? (
                <Link to={getDashboardPath()}>
                  <Button className="bg-dawn hover:bg-[#B85A1A] text-white rounded-full px-6 py-2 font-regular shadow-sm border border-dawn transition-all duration-300 hover:scale-105">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-dawn hover:bg-[#B85A1A] text-white px-6 py-2 font-regular shadow-sm border border-dawn transition-all duration-300 hover:scale-105 rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {showItems && (
            <div className="lg:hidden">
              <button
                className="text-[#2C2C2C] hover:text-dawn transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <MenuIcon size={24} color="currentColor" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu with Clean Design */}
        {showItems && (
          <div
            className={`lg:hidden bg-white border-t border-[#E5E5E5] overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  scrollToSection("about");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-[#2C2C2C] hover:text-dawn transition-colors font-regular cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("benefits");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-[#2C2C2C] hover:text-dawn transition-colors font-regular cursor-pointer"
              >
                Why Join
              </button>
              <button
                onClick={() => {
                  scrollToSection("training-areas");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-[#2C2C2C] hover:text-dawn transition-colors font-regular cursor-pointer"
              >
                Training Areas
              </button>
              <button
                onClick={() => {
                  scrollToSection("for");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-[#2C2C2C] hover:text-dawn transition-colors font-regular cursor-pointer"
              >
                Who is it for
              </button>
              {userExists() ? (
                <Link to={getDashboardPath()}>
                  <Button className="w-full bg-dawn hover:bg-[#B85A1A] text-white py-3 font-regular shadow-sm border border-dawn mt-4 rounded-full">
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="w-full bg-dawn hover:bg-[#B85A1A] text-white py-3 font-regular shadow-sm border border-dawn mt-4 rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default HomeNavigation;
