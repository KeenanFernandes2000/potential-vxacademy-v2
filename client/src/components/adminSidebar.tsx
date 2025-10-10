import React, { useState } from "react";
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

const AdminSidebar = () => {
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

  // Enhanced toggle function that closes training areas first
  const handleToggleSidebar = () => {
    // If training areas dropdown is open and we're about to collapse
    if (sectionStates.trainingAreas && state === "expanded") {
      // First close the training areas dropdown
      setSectionStates((prev) => ({
        ...prev,
        trainingAreas: false,
      }));

      // Then collapse the sidebar after a delay
      setTimeout(() => {
        toggleSidebar();
      }, 200); // Wait for dropdown animation to complete (slightly longer for smooth transition)
    } else {
      // Normal toggle behavior
      toggleSidebar();
    }
  };

  // Dynamic state management for all sections
  const [sectionStates, setSectionStates] = React.useState({
    main: true,
    reports: true,
    learningPath: true,
    organization: true,
    contentManagement: true,
    platformSettings: true,
    trainingAreas: false, // Add state for training areas dropdown
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
        trainingAreas: true, // Add training areas to collapsed state
      });
    }
  }, [state]);

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
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-80 bg-sidebar shadow-xl transform transition-transform duration-300 ease-in-out ${
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
                <p className="text-xs text-muted-foreground">Admin Panel</p>
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
            <nav className="space-y-4">
              {sections.map((section) => (
                <div key={section.key} className="space-y-2">
                  <h3 className="text-sm font-semibold text-sidebar-foreground px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.key === "reports" ? (
                      <>
                        {/* Regular report items */}
                        {section.items.slice(0, -1).map((item) => (
                          <Link
                            key={item.title}
                            to={item.url || "#"}
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

                        {/* Training Areas */}
                        <div className="ml-4 space-y-1">
                          <h4 className="text-xs font-medium text-muted-foreground px-2">
                            Training Areas
                          </h4>
                          {trainingAreasNavItems.map((trainingItem) => (
                            <Link
                              key={trainingItem.title}
                              to={trainingItem.url || "#"}
                              onClick={handleMobileMenuClose}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                location.pathname === trainingItem.url
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                              }`}
                            >
                              <trainingItem.icon sx={{ fontSize: 20 }} />
                              <span className="font-medium">
                                {trainingItem.title}
                              </span>
                            </Link>
                          ))}
                        </div>

                        {/* Certificate Reports */}
                        {section.items.slice(-1).map((item) => (
                          <Link
                            key={item.title}
                            to={item.url || "#"}
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
                      </>
                    ) : (
                      section.items.map((item) => (
                        <Link
                          key={item.title}
                          to={item.url || "#"}
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
                      ))
                    )}
                  </div>
                </div>
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
      url: "/admin/reports/analytics",
      badge: null,
    },
    {
      title: "All Users",
      icon: Users,
      url: "/admin/reports/all-users",
      badge: null,
    },
    {
      title: "Organizations",
      icon: Users,
      url: "/admin/reports/organizations",
      badge: null,
    },
    {
      title: "Sub-Organizations",
      icon: Users,
      url: "/admin/reports/sub-organizations",
      badge: null,
    },
    {
      title: "Sub-Admins",
      icon: Shield,
      url: "/admin/reports/sub-admins",
      badge: null,
    },
    {
      title: "Frontliners",
      icon: Users,
      url: "/admin/reports/frontliners",
      badge: null,
    },
    {
      title: "Certificate Reports",
      icon: FileText,
      url: "/admin/reports/certificate-reports",
      badge: null,
    },
  ];

  // Add training areas sub-items
  const trainingAreasNavItems = [
    {
      title: "Al Midhyaf COC",
      icon: School,
      url: "/admin/reports/training-areas/al-midhyaf-coc",
      badge: null,
    },
    {
      title: "AD Information",
      icon: School,
      url: "/admin/reports/training-areas/ad-information",
      badge: null,
    },
    {
      title: "General VX Soft Skills",
      icon: School,
      url: "/admin/reports/training-areas/general-vx-soft-skills",
      badge: null,
    },
    {
      title: "General VX Hard Skills",
      icon: School,
      url: "/admin/reports/training-areas/general-vx-hard-skills",
      badge: null,
    },
    {
      title: "Managerial Competencies",
      icon: School,
      url: "/admin/reports/training-areas/managerial-competencies",
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
      url: "/admin/communication-email",
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
      title: "Learning Path Management",
      items: learningPathNavItems,
    },
    {
      key: "organization",
      title: "Organization Management",
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
    <>
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Sidebar */}
      <Sidebar collapsible="icon" className="border-r hidden md:block">
        <SidebarHeader>
          <Button
            onClick={handleToggleSidebar}
            className="flex w-full items-center justify-between px-2 py-2 hover:bg-sidebar-accent rounded-lg transition-colors bg-transparent text-sidebar-foreground"
          >
            <div className="flex items-center gap-2">
              <School sx={{ fontSize: 16, color: "var(--sidebar-primary)" }} />
              <div
                className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
                  state === "expanded"
                    ? "max-w-32 opacity-100"
                    : "max-w-0 opacity-0"
                }`}
              >
                <h2 className="text-sm font-semibold whitespace-nowrap">
                  VX Academy
                </h2>
                <p className="text-xs text-muted-foreground"></p>
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-300 ease-in-out ${
                state === "expanded"
                  ? "opacity-100 transform rotate-0"
                  : "opacity-0 transform rotate-180"
              }`}
            >
              <ArrowLeft />
            </div>
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
                      {/* Custom rendering for Reports section */}
                      {section.key === "reports" ? (
                        <>
                          {/* Regular report items before Training Areas */}
                          {section.items.slice(0, -1).map((item) => (
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

                          {/* Training Areas - different rendering for collapsed vs expanded */}
                          {state === "collapsed" ? (
                            /* Collapsed state: show individual training area items as icons */
                            <>
                              {trainingAreasNavItems.map((trainingItem) => (
                                <SidebarMenuItem key={trainingItem.title}>
                                  <SidebarMenuButton
                                    asChild
                                    isActive={
                                      location.pathname === trainingItem.url
                                    }
                                  >
                                    <Link to={trainingItem.url || "#"}>
                                      <trainingItem.icon
                                        sx={{ fontSize: 16 }}
                                      />
                                      <span>{trainingItem.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </>
                          ) : (
                            /* Expanded state: show dropdown structure */
                            <>
                              {/* Training Areas dropdown */}
                              <SidebarMenuItem>
                                <SidebarMenuButton
                                  asChild
                                  className="cursor-pointer hover:bg-sidebar-accent"
                                  onClick={() => toggleSection("trainingAreas")}
                                >
                                  <button className="w-full text-left flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <School sx={{ fontSize: 16 }} />
                                      <span>Training Areas</span>
                                    </div>
                                    <ChevronDown
                                      sx={{
                                        ml: "auto",
                                        transition: "transform 200ms",
                                        transform: sectionStates.trainingAreas
                                          ? "rotate(180deg)"
                                          : "rotate(0deg)",
                                        fontSize: 16,
                                      }}
                                    />
                                  </button>
                                </SidebarMenuButton>
                              </SidebarMenuItem>

                              {/* Training Areas sub-items with animation */}
                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  sectionStates.trainingAreas
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="space-y-1">
                                  {trainingAreasNavItems.map((trainingItem) => (
                                    <SidebarMenuItem
                                      key={trainingItem.title}
                                      className="ml-4"
                                    >
                                      <SidebarMenuButton
                                        asChild
                                        isActive={
                                          location.pathname === trainingItem.url
                                        }
                                      >
                                        <Link to={trainingItem.url || "#"}>
                                          <trainingItem.icon
                                            sx={{ fontSize: 16 }}
                                          />
                                          <span>{trainingItem.title}</span>
                                        </Link>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Certificate Reports (last item) */}
                          {section.items.slice(-1).map((item) => (
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
                        </>
                      ) : (
                        /* Regular rendering for other sections */
                        section.items.map((item) => (
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
                        ))
                      )}
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
    </>
  );
};

export default AdminSidebar;
