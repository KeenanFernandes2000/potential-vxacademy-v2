export type UserType = "admin" | "sub_admin" | "user";

export interface RoutePermission {
  path: string;
  allowedUserTypes: UserType[];
  requiresAuth: boolean;
  description?: string;
}

// Define all routes and their permissions
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Public routes (no authentication required)
  {
    path: "/",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Root redirect route",
  },
  {
    path: "/home",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Home page",
  },
  {
    path: "/login",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Login page",
  },
  {
    path: "/forgot-password",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Forgot password page",
  },
  {
    path: "/reset-password",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Reset password page",
  },
  {
    path: "/join",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: false,
    description: "Join/Register page",
  },

  // Admin-only routes
  {
    path: "/admin/dashboard",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Admin dashboard",
  },
  {
    path: "/admin/sub-admin",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Sub-admin management",
  },
  {
    path: "/admin/assets",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Assets management",
  },
  {
    path: "/admin/subassets",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Sub-assets management",
  },
  {
    path: "/admin/organization",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Organization management",
  },
  {
    path: "/admin/sub-organization",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Sub-organization management",
  },
  {
    path: "/admin/training-area",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Training area management",
  },
  {
    path: "/admin/modules",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Modules management",
  },
  {
    path: "/admin/courses",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Courses management",
  },
  {
    path: "/admin/units",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Units management",
  },
  {
    path: "/admin/learning-block",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Learning block management",
  },
  {
    path: "/admin/assessments",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Assessments management",
  },
  {
    path: "/admin/questions",
    allowedUserTypes: ["admin"],
    requiresAuth: true,
    description: "Questions management",
  },

  // Sub-admin routes
  {
    path: "/sub-admin",
    allowedUserTypes: ["sub_admin"],
    requiresAuth: true,
    description: "Sub-admin layout",
  },
  {
    path: "/sub-admin/dashboard",
    allowedUserTypes: ["sub_admin"],
    requiresAuth: true,
    description: "Sub-admin dashboard",
  },
  {
    path: "/sub-admin/users",
    allowedUserTypes: ["sub_admin"],
    requiresAuth: true,
    description: "Sub-admin users management",
  },
  {
    path: "/sub-admin/links",
    allowedUserTypes: ["sub_admin"],
    requiresAuth: true,
    description: "Sub-admin links management",
  },

  // User routes
  {
    path: "/user",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "User layout",
  },
  {
    path: "/user/dashboard",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "User dashboard",
  },
  {
    path: "/user/courses",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "User courses",
  },
  {
    path: "/user/achievements",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "User achievements",
  },
  {
    path: "/user/courses/:id",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "Course details",
  },
  {
    path: "/user/assessment/:id",
    allowedUserTypes: ["user"],
    requiresAuth: true,
    description: "Assessment page",
  },

  // Profile route (accessible by all authenticated users)
  {
    path: "/profile",
    allowedUserTypes: ["admin", "sub_admin", "user"],
    requiresAuth: true,
    description: "User profile",
  },
];

// Helper function to get permission for a specific route
export const getRoutePermission = (path: string): RoutePermission | undefined => {
  return ROUTE_PERMISSIONS.find((permission) => {
    // Handle dynamic routes (with parameters)
    if (permission.path.includes(":")) {
      const pathSegments = path.split("/");
      const permissionSegments = permission.path.split("/");
      
      if (pathSegments.length !== permissionSegments.length) {
        return false;
      }
      
      return permissionSegments.every((segment, index) => {
        return segment.startsWith(":") || segment === pathSegments[index];
      });
    }
    
    return permission.path === path;
  });
};

// Helper function to check if user has access to a route
export const hasRouteAccess = (path: string, userType: UserType): boolean => {
  const permission = getRoutePermission(path);
  if (!permission) {
    return false; // Route not found in permissions
  }
  
  return permission.allowedUserTypes.includes(userType);
};

// Helper function to get all accessible routes for a user type
export const getAccessibleRoutes = (userType: UserType): RoutePermission[] => {
  return ROUTE_PERMISSIONS.filter((permission) =>
    permission.allowedUserTypes.includes(userType)
  );
};
