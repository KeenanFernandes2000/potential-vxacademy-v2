import React, { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

type Theme = "homepage" | "app";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "homepage",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const location = useLocation();

  // Function to determine theme based on current route
  const getThemeFromRoute = (pathname: string): Theme => {
    // Homepage and auth routes use homepage theme
    if (
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/join")
    ) {
      return "homepage";
    }
    // All other routes use app theme
    return "homepage";
  };

  // Update theme when route changes
  useEffect(() => {
    const newTheme = getThemeFromRoute(location.pathname);
    setTheme(newTheme);
  }, [location.pathname]);

  useEffect(() => {
    // Set the data-theme attribute on document root
    document.documentElement.setAttribute("data-theme", theme);

    // Add theme class to body for CSS targeting
    document.body.className = `theme-${theme}`;

    // Cleanup function to reset body class when component unmounts
    return () => {
      document.body.className = "";
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
