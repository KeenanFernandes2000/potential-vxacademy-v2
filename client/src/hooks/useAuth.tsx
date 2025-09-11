import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API object for authentication
const api = {
  async login(email: string, password: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        // Clear corrupted data
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

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

        return { success: true };
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

  // Logout function
  const logout = () => {
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

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
