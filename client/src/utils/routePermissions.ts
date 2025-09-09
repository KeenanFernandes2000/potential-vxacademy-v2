import { UserType, hasRouteAccess, getAccessibleRoutes } from "@/config/routePermissions";

/**
 * Check if the current user has access to a specific route
 */
export const checkUserRouteAccess = (path: string, userType: UserType | null): boolean => {
  if (!userType) {
    return false;
  }
  
  return hasRouteAccess(path, userType);
};

/**
 * Get all routes accessible by the current user
 */
export const getUserAccessibleRoutes = (userType: UserType | null) => {
  if (!userType) {
    return [];
  }
  
  return getAccessibleRoutes(userType);
};

/**
 * Get the appropriate dashboard path for a user type
 */
export const getDashboardPath = (userType: UserType | null): string => {
  switch (userType) {
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

/**
 * Get the appropriate home path for a user type
 */
export const getHomePath = (userType: UserType | null): string => {
  if (!userType) {
    return "/home";
  }
  
  return getDashboardPath(userType);
};

/**
 * Check if a route is a public route (doesn't require authentication)
 */
export const isPublicRoute = (path: string): boolean => {
  const publicRoutes = [
    "/",
    "/home",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/join",
  ];
  
  return publicRoutes.includes(path);
};

/**
 * Check if a route is an admin-only route
 */
export const isAdminRoute = (path: string): boolean => {
  return path.startsWith("/admin/");
};

/**
 * Check if a route is a sub-admin-only route
 */
export const isSubAdminRoute = (path: string): boolean => {
  return path.startsWith("/sub-admin");
};

/**
 * Check if a route is a user-only route
 */
export const isUserRoute = (path: string): boolean => {
  return path.startsWith("/user");
};

/**
 * Get the required user type for a route
 */
export const getRequiredUserType = (path: string): UserType | null => {
  if (isAdminRoute(path)) {
    return "admin";
  }
  
  if (isSubAdminRoute(path)) {
    return "sub_admin";
  }
  
  if (isUserRoute(path)) {
    return "user";
  }
  
  return null;
};

/**
 * Validate if a user can access a route and return appropriate redirect path
 */
export const validateRouteAccess = (
  path: string,
  userType: UserType | null
): { canAccess: boolean; redirectPath?: string } => {
  // Public routes are always accessible
  if (isPublicRoute(path)) {
    return { canAccess: true };
  }
  
  // If user is not authenticated, redirect to login
  if (!userType) {
    return { canAccess: false, redirectPath: "/login" };
  }
  
  // Check if user has access to the route
  if (checkUserRouteAccess(path, userType)) {
    return { canAccess: true };
  }
  
  // User doesn't have access, redirect to their dashboard
  return { canAccess: false, redirectPath: getDashboardPath(userType) };
};
