import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Navigate } from "react-router-dom";

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: "admin" | "sub_admin" | "user";
  organization?: string;
  subOrganization?: string;
  asset?: string;
  subAsset?: string;
  normalUserDetails?: {
    existing: boolean;
    initialAssessment: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
    token?: string;
  }>;
  logout: () => void;
  updateUser: (userData: User) => void;
  userExists: () => boolean;
}

// JWT utility functions
const parseJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

const getTokenExpirationTime = (token: string): number | null => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000; // Convert to milliseconds
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API object for authentication
const api = {
  async login(email: string, password: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  },
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Function to clear all timers
  const clearAllTimers = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Function to start countdown display
  const startCountdown = (totalSeconds: number) => {
    setTimeRemaining(totalSeconds);
    setShowLogoutWarning(true);

    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to set up automatic logout timer
  const setupLogoutTimer = (token: string) => {
    // Clear any existing timers
    clearAllTimers();

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return;

    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Only set timer if token hasn't expired yet
    if (timeUntilExpiration > 0) {
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds

      // If more than 5 minutes remaining, set warning timer
      if (timeUntilExpiration > fiveMinutesInMs) {
        const warningTime = timeUntilExpiration - fiveMinutesInMs;
        warningTimerRef.current = setTimeout(() => {
          startCountdown(5 * 60); // Start 5-minute countdown
        }, warningTime);
      } else {
        // Less than 5 minutes remaining, start countdown immediately
        const remainingSeconds = Math.floor(timeUntilExpiration / 1000);
        startCountdown(remainingSeconds);
      }

      // Set the actual logout timer
      logoutTimerRef.current = setTimeout(() => {
        console.log("Token expired, logging out automatically");
        logout();
      }, timeUntilExpiration);
    } else {
      // Token is already expired, logout immediately
      console.log("Token already expired, logging out immediately");
      logout();
    }
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log("Stored token is expired, clearing auth state");
            localStorage.removeItem("userData");
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
          } else {
            // Token is valid, set user and token, then setup logout timer
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            setupLogoutTimer(storedToken);
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        // Clear corrupted data
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login(email, password);

      if (response.success) {
        // Store user data and token
        setUser(response.user);
        setToken(response.token);

        // Persist to localStorage
        localStorage.setItem("userData", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
        let flags = {
          existing: response.user.normalUserDetails?.existing,
          initialAssessment: response.user.normalUserDetails?.initialAssessment,
        };
        localStorage.setItem("flags", JSON.stringify(flags));

        // Set up automatic logout timer
        setupLogoutTimer(response.token);

        return {
          success: true,
          user: response.user,
          token: response.token,
        };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle cancel action from modal
  const handleCancelLogout = () => {
    setShowLogoutWarning(false);
    setTimeRemaining(0);

    // Clear only the warning and countdown timers, keep the logout timer running
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // The logout timer continues running in the background
  };

  // Function to handle immediate logout from modal
  const handleImmediateLogout = () => {
    setShowLogoutWarning(false);
    setTimeRemaining(0);
    logout();
  };

  // Logout function
  const logout = () => {
    // Clear all timers and modal state
    clearAllTimers();
    setShowLogoutWarning(false);
    setTimeRemaining(0);

    setUser(null);
    setToken(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  };

  // Update user data
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Simple check if user exists
  const userExists = (): boolean => {
    return user !== null && user !== undefined;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    userExists,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Logout Warning Modal */}
      {showLogoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Session Expiring Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  You will be logged out in{" "}
                  <span className="font-mono text-lg font-bold text-red-600">
                    {formatTime(timeRemaining)}
                  </span>{" "}
                  minutes.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImmediateLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredUserType?: "admin" | "sub_admin" | "user"
) => {
  return (props: P) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#003451]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
            <p className="text-white/80 text-lg">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login using React Router
      return <Navigate to="/login" replace />;
    }

    if (requiredUserType && user?.userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      const dashboardPath =
        user?.userType === "admin"
          ? "/admin/dashboard"
          : user?.userType === "sub_admin"
          ? "/sub-admin/dashboard"
          : "/user/dashboard";
      return <Navigate to={dashboardPath} replace />;
    }

    return <Component {...props} />;
  };
};
