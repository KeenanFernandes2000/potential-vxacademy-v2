import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MenuBook as BookOpen,
  EmojiEvents as Award,
  Logout as LogOut,
  Person as User,
  Home,
  School,
  ArrowLeft,
} from "@mui/icons-material";

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

  const mainNavItems = [
    { title: "Dashboard", icon: Home, url: "/user/dashboard", badge: null },
    { title: "My Courses", icon: BookOpen, url: "/user/courses", badge: null },
    {
      title: "Achievements",
      icon: Award,
      url: "/user/achievements",
      badge: null,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <Button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-between px-2 py-2 hover:bg-sidebar-accent rounded-md transition-colors bg-transparent text-white"
        >
          <div className="flex items-center gap-2">
            <School sx={{ fontSize: 16, color: "#00d8cc" }} />
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
                <SidebarMenuAction asChild>
                  <Link
                    to="#logout"
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut sx={{ fontSize: 16 }} />
                  </Link>
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserSidebar;
