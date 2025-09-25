import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { token, user: currentUser } = useAuth();

  // State management for API data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    newUsersPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API object for user operations (same as users.tsx)
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

    async getUserById(userId: number, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
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
        console.error("Failed to fetch user:", error);
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

        // Get current user's full details for filtering (same logic as users.tsx)
        const currentUserResponse = await api.getUserById(
          currentUser?.id || 0,
          token
        );
        const currentUserData = currentUserResponse.data;

        // Get all users
        const usersResponse = await api.getAllUsers(token);
        let filteredUsersData = usersResponse.data || [];

        // Filter users based on current user's organization, suborganization, assets, and subassets (same logic as users.tsx)
        if (currentUserData) {
          filteredUsersData = filteredUsersData.filter((user: any) => {
            // Filter out Sub_admin users
            if (user.userType === "sub_admin") {
              return false;
            }

            // Filter by organization
            if (user.organization !== currentUserData.organization) {
              return false;
            }

            // Filter by suborganization if current user has one
            if (
              currentUserData.subOrganization &&
              user.subOrganization !== currentUserData.subOrganization
            ) {
              return false;
            }

            // Filter by asset
            if (user.asset !== currentUserData.asset) {
              return false;
            }

            // Filter by subasset
            if (user.subAsset !== currentUserData.subAsset) {
              return false;
            }

            return true;
          });
        }

        // Calculate stats
        const totalUsers = filteredUsersData.length;

        // Count new users (created this month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newUsers = filteredUsersData.filter((user: any) => {
          if (!user.createdAt) return false;
          const userCreatedDate = new Date(user.createdAt);
          return (
            userCreatedDate.getMonth() === currentMonth &&
            userCreatedDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate percentage
        const newUsersPercentage =
          totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;

        setStats({
          totalUsers,
          newUsers,
          newUsersPercentage,
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
  }, [token, currentUser]);

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
    <div className="min-h-screen bg-[#003451] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Sub-Admin Dashboard</h1>
          <p className="text-white/80">
          Welcome back! Here's what's happening with your organization!
          </p>
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change="Users in your organization"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Users"
            value={stats.newUsers}
            icon={UserPlus}
            change={`${stats.newUsersPercentage}% of total users this month`}
            changeType="positive"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
