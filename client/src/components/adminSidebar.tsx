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
  Analytics as Report,
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
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Dynamic state management for all sections
  const [sectionStates, setSectionStates] = React.useState({
    main: true,
    reports: true,
    learningPath: true,
    organization: true,
    contentManagement: true,
    platformSettings: true,
  });

  const toggleSection = (sectionName: string) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName as keyof typeof prev],
    }));
  };

  // When sidebar is collapsed (icon mode), open all dropdowns
  React.useEffect(() => {
    if (state === "collapsed") {
      setSectionStates({
        main: true,
        reports: true,
        learningPath: true,
        organization: true,
        contentManagement: true,
        platformSettings: true,
      });
    }
  }, [state]);

  const mainNavItems = [
    {
      title: "Dashboard",
      icon: DashboardIcon,
      url: "/admin/dashboard",
      badge: null,
    },
  ];

  const reportsNavItems = [
    {
      title: "Analytics",
      icon: Report,
      // url: "/admin/analytics",
      badge: null,
    },
    {
      title: "All Users",
      icon: Users,
      // url: "/admin/all-users",
      badge: null,
    },
    {
      title: "Organizations",
      icon: Users,
      url: "/admin/organizations",
      badge: null,
    },
    {
      title: "Sub-Admins",
      icon: Shield,
      url: "/admin/sub-admins",
      badge: null,
    },
    {
      title: "Frontliners",
      icon: Users,
      // url: "/admin/frontliners",
      badge: null,
    },
    {
      title: "Training Areas",
      icon: FileText,
      // url: "/admin/training-areas",
      badge: null,
    },
    {
      title: "Certificate Reports",
      icon: FileText,
      // url: "/admin/certificate-reports",
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
  const organizationNavItems = [
    {
      title: "Organization",
      icon: Users,
      url: "/admin/organization",
      badge: null,
    },
    // {
    //   title: "Sub-Organization",
    //   icon: Users,
    //   url: "/admin/sub-organization",
    //   badge: null,
    // },
    {
      title: "Sub-Admin",
      icon: Shield,
      url: "/admin/sub-admin",
      badge: null,
    },
  ];

  // const assetNavItems = [
  //   {
  //     title: "Assets",
  //     icon: WebAsset,
  //     url: "/admin/assets",
  //     badge: null,
  //   },
  //   {
  //     title: "Sub-Assets",
  //     icon: WebAsset,
  //     url: "/admin/subassets",
  //     badge: null,
  //   },
  // ];

  // const roleManagementNavItems = [
  //   {
  //     title: "Role Categories",
  //     icon: CategoryIcon,
  //     url: "/admin/role-categories",
  //     badge: null,
  //   },
  //   {
  //     title: "Roles",
  //     icon: RoleIcon,
  //     url: "/admin/roles",
  //     badge: null,
  //   },
  // ];

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
      title: "Learning Units",
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
    // {
    //   title: "Questions",
    //   icon: Quiz,
    //   url: "/admin/questions",
    //   badge: null,
    // },
    {
      title: "Media",
      icon: WebAsset,
      url: "/admin/media",
      badge: null,
    },
  ];

  const platformSettingsNavItems = [
    {
      title: "Assets",
      icon: WebAsset,
      url: "/admin/assets",
      badge: null,
    },
    {
      title: "Asset Sub-Categories",
      icon: WebAsset,
      url: "/admin/subassets",
      badge: null,
    },
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
    {
      title: "Communication Emails",
      icon: FileText,
      // url: "/admin/communication-emails",
      badge: null,
    },
  ];

  // Define all sections with their data
  const sections = [
    {
      key: "main",
      title: "Main",
      items: mainNavItems,
    },
    {
      key: "reports",
      title: "Reports",
      items: reportsNavItems,
    },
    {
      key: "learningPath",
      title: "Learning Path",
      items: learningPathNavItems,
    },
    {
      key: "organization",
      title: "Organization",
      items: organizationNavItems,
    },
    {
      key: "contentManagement",
      title: "Content Management",
      items: lmsNavItems,
    },
    {
      key: "platformSettings",
      title: "Platform Settings",
      items: platformSettingsNavItems,
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
        {sections.map((section, index) => (
          <React.Fragment key={section.key}>
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="cursor-pointer hover:bg-sidebar-accent"
                onClick={() => toggleSection(section.key)}
              >
                <button className="w-full text-left">
                  <div className="flex items-center justify-between">
                    <span>{section.title}</span>
                    <ChevronDown
                      sx={{
                        ml: "auto",
                        transition: "transform 200ms",
                        transform: sectionStates[
                          section.key as keyof typeof sectionStates
                        ]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        fontSize: 16,
                      }}
                    />
                  </div>
                </button>
              </SidebarGroupLabel>
              {sectionStates[section.key as keyof typeof sectionStates] && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                        >
                          <Link to={item.url || "#"}>
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
            {index < sections.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter className="border-t-2 border-sidebar-accent">
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
