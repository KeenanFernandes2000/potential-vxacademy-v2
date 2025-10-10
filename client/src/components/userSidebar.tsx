import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuBook as BookOpen,
  EmojiEvents as Award,
  Logout as LogOut,
  Person as User,
  Home,
  School,
  ArrowLeft,
  SmartToy as TutorIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

const UserSidebar = () => {
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const mainNavItems = [
    { title: "My Dashboard", icon: Home, url: "/user/dashboard", badge: null },
    { title: "My Courses", icon: BookOpen, url: "/user/courses", badge: null },
    {
      title: "My Achievements",
      icon: Award,
      url: "/user/achievements",
      badge: null,
    },
    { title: "AI Concierge", icon: TutorIcon, url: "/user/tutor", badge: null },
  ];

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 z-50">
        <Button
          onClick={handleMobileMenuToggle}
          className="bg-sidebar hover:bg-sidebar-accent border-2 border-sidebar-border border-l-0 rounded-l-none text-sidebar-foreground"
          size="sm"
        >
          <MenuIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-sidebar shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <School sx={{ fontSize: 20, color: "var(--sidebar-primary)" }} />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-sidebar-foreground">
                  VX Academy
                </h2>
                <p className="text-xs text-muted-foreground">
                  Learning Platform
                </p>
              </div>
            </div>
            <Button
              onClick={handleMobileMenuClose}
              className="p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground"
              size="sm"
            >
              <CloseIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={handleMobileMenuClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.url
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon sx={{ fontSize: 20 }} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Footer */}
          <div className="border-t border-sidebar-border p-4">
            <nav className="space-y-2">
              <Link
                to="/profile"
                onClick={handleMobileMenuClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <User sx={{ fontSize: 20 }} />
                <span className="font-medium">Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  handleMobileMenuClose();
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent w-full text-left"
              >
                <LogOut sx={{ fontSize: 20 }} />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Sidebar */}
      <Sidebar collapsible="icon" className="border-r hidden md:block">
        <SidebarHeader>
          <Button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-between px-2 py-2 hover:bg-sidebar-accent rounded-lg transition-colors bg-transparent text-sidebar-foreground"
          >
            <div className="flex items-center gap-2">
              <School sx={{ fontSize: 16, color: "var(--sidebar-primary)" }} />
              {state === "expanded" && (
                <div className="flex flex-col">
                  <h2 className="text-sm font-semibold">VX Academy</h2>
                  <p className="text-xs text-muted-foreground"></p>
                </div>
              )}
            </div>

            {state === "expanded" && (
              <div className="cursor-pointer">
                <ArrowLeft />
              </div>
            )}
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon sx={{ fontSize: 16 }} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/profile">
                      <User sx={{ fontSize: 16 }} />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut sx={{ fontSize: 16 }} />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default UserSidebar;
