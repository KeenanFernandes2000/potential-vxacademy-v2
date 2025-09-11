import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { token } = useAuth();

  // State management for API data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API object for user operations (same as sub-admin but without filtering)
  const api = {
    async getAllUsers(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
      }
    },

    async getAllAssets(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/assets`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        throw error;
      }
    },

    async getAllSubAssets(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/sub-assets`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch sub-assets:", error);
        throw error;
      }
    },
  };

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all users (no filtering for admin)
        const usersResponse = await api.getAllUsers(token);
        const allUsers = usersResponse.data || [];

        // Calculate real stats only
        const totalUsers = allUsers.length;

        // Count new users (created this month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newUsersThisMonth = allUsers.filter((user: any) => {
          if (!user.createdAt) return false;
          const userCreatedDate = new Date(user.createdAt);
          return (
            userCreatedDate.getMonth() === currentMonth &&
            userCreatedDate.getFullYear() === currentYear
          );
        }).length;

        setStats({
          totalUsers,
          newUsersThisMonth,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
        // Keep default stats (all zeros) on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "positive",
    loading = false,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    loading?: boolean;
  }) => (
    <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 hover:bg-[#00d8cc]/15 transition-all duration-300 rounded-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80">
          {title}
        </CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-[#00d8cc] animate-spin" />
        ) : (
          <Icon className="h-4 w-4 text-[#00d8cc]" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {loading ? "..." : value}
        </div>
        {change && !loading && (
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                ? "text-red-400"
                : "text-white/60"
            }`}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminPageLayout
      title="Dashboard"
      description="Welcome back! Here's what's happening with your academy."
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            change="All users in the system"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Users"
            value={stats.newUsersThisMonth}
            icon={Users}
            change="Registered this month"
            changeType="positive"
            loading={loading}
          />
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Dashboard;
