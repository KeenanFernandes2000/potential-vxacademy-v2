import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Group as Users,
  Description as FileText,
  Security as Shield,
  Logout as LogOut,
  Person as User,
  ExpandMore as ChevronDown,
  Quiz as Quiz,
  WebAsset,
  School,
  ArrowLeft,
  Dashboard as DashboardIcon,
  AdminPanelSettings as RoleIcon,
  Category as CategoryIcon,
  Timeline as LearningPathIcon,
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

const AdminSidebar = () => {
  const [mainOpen, setMainOpen] = React.useState(true);
  const [assetsOpen, setAssetsOpen] = React.useState(true);
  const [roleManagementOpen, setRoleManagementOpen] = React.useState(true);
  const [organizationOpen, setOrganizationOpen] = React.useState(true);
  const [lmsOpen, setLmsOpen] = React.useState(true);
  const [learningPathOpen, setLearningPathOpen] = React.useState(true);
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // When sidebar is collapsed (icon mode), open all dropdowns
  React.useEffect(() => {
    if (state === "collapsed") {
      setMainOpen(true);
      setAssetsOpen(true);
      setRoleManagementOpen(true);
      setOrganizationOpen(true);
      setLmsOpen(true);
      setLearningPathOpen(true);
    }
  }, [state]);

  const mainNavItems = [
    {
      title: "Dashboard",
      icon: DashboardIcon,
      url: "/admin/dashboard",
      badge: null,
    },
    {
      title: "Media",
      icon: WebAsset,
      url: "/admin/media",
      badge: null,
    },
  ];

  const assetNavItems = [
    {
      title: "Assets",
      icon: WebAsset,
      url: "/admin/assets",
      badge: null,
    },
    {
      title: "Sub-Assets",
      icon: WebAsset,
      url: "/admin/subassets",
      badge: null,
    },
  ];

  const roleManagementNavItems = [
    {
      title: "Role Categories",
      icon: CategoryIcon,
      url: "/admin/role-categories",
      badge: null,
    },
    {
      title: "Roles",
      icon: RoleIcon,
      url: "/admin/roles",
      badge: null,
    },
  ];

  const organizationNavItems = [
    {
      title: "Organization",
      icon: Users,
      url: "/admin/organization",
      badge: null,
    },
    {
      title: "Sub-Organization",
      icon: Users,
      url: "/admin/sub-organization",
      badge: null,
    },
    {
      title: "Sub-Admin",
      icon: Shield,
      url: "/admin/sub-admin",
      badge: null,
    },
  ];

  const lmsNavItems = [
    {
      title: "Training Area",
      icon: FileText,
      url: "/admin/training-area",
      badge: null,
    },
    {
      title: "Modules",
      icon: FileText,
      url: "/admin/modules",
      badge: null,
    },
    {
      title: "Courses",
      icon: FileText,
      url: "/admin/courses",
      badge: null,
    },
    {
      title: "Units",
      icon: FileText,
      url: "/admin/units",
      badge: null,
    },
    {
      title: "Learning Block",
      icon: FileText,
      url: "/admin/learning-block",
      badge: null,
    },
    {
      title: "Assessments",
      icon: Quiz,
      url: "/admin/assessments",
      badge: null,
    },
    {
      title: "Questions",
      icon: Quiz,
      url: "/admin/questions",
      badge: null,
    },
  ];

  const learningPathNavItems = [
    {
      title: "Learning Path",
      icon: LearningPathIcon,
      url: "/admin/learning-path",
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
        {/* Main Navigation - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setMainOpen(!mainOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Main</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: mainOpen ? "rotate(180deg)" : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {mainOpen && (
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
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Assets - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setAssetsOpen(!assetsOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Assets</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: assetsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {assetsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {assetNavItems.map((item) => (
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
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Role Management - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setRoleManagementOpen(!roleManagementOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Role Management</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: roleManagementOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {roleManagementOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {roleManagementNavItems.map((item) => (
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
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Learning Path - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setLearningPathOpen(!learningPathOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Learning Path</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: learningPathOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {learningPathOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {learningPathNavItems.map((item) => (
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
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Organization - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setOrganizationOpen(!organizationOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Organization</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: organizationOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {organizationOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {organizationNavItems.map((item) => (
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
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* LMS - Collapsible */}
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="cursor-pointer hover:bg-sidebar-accent"
            onClick={() => setLmsOpen(!lmsOpen)}
          >
            <button className="w-full text-left">
              <div className="flex items-center justify-between">
                <span>Content Management</span>
                <ChevronDown
                  sx={{
                    ml: "auto",
                    transition: "transform 200ms",
                    transform: lmsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    fontSize: 16,
                  }}
                />
              </div>
            </button>
          </SidebarGroupLabel>
          {lmsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {lmsNavItems.map((item) => (
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
          )}
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Profile */}
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
  );
};

export default AdminSidebar;
