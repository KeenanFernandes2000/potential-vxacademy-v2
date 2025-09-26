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
  Building2,
  GraduationCap,
  Star,
  Percent,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { token } = useAuth();

  // State management for API data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalFrontliners: 0,
    newFrontliners: 0,
    totalOrganizations: 0,
    totalCertificates: 0,
    totalVXPoints: 0,
    averageProgress: 0,
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

    async getAllOrganizations(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/organizations`, {
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
        console.error("Failed to fetch organizations:", error);
        throw error;
      }
    },

    async getAllCertificates(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/certificates`, {
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
        console.error("Failed to fetch certificates:", error);
        throw error;
      }
    },

    async getAllProgress(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/progress/all`, {
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
        console.error("Failed to fetch progress:", error);
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

        // Get organizations
        const organizationsResponse = await api.getAllOrganizations(token);
        const allOrganizations = organizationsResponse.data || [];

        // Get certificates (if endpoint exists, otherwise estimate from users)
        let totalCertificates = 0;
        try {
          const certificatesResponse = await api.getAllCertificates(token);
          totalCertificates = certificatesResponse.data?.length || 0;
        } catch (certError) {
          // If certificates endpoint doesn't exist, estimate based on users with high XP
          console.warn(
            "Certificates endpoint not available, estimating from user data:",
            certError
          );
          // Estimate certificates based on users who have completed significant progress (XP > 500)
          totalCertificates = allUsers.filter(
            (user: any) => (user.xp || 0) > 500
          ).length;
        }

        // Get progress data (if endpoint exists, otherwise calculate from users)
        let averageProgress = 0;
        try {
          const progressResponse = await api.getAllProgress(token);
          const progressData = progressResponse.data || [];
          if (progressData.length > 0) {
            const totalProgress = progressData.reduce(
              (sum: number, progress: any) => sum + (progress.percentage || 0),
              0
            );
            averageProgress = Math.round(totalProgress / progressData.length);
          }
        } catch (progressError) {
          // If progress endpoint doesn't exist, calculate from users' XP
          console.warn(
            "Progress endpoint not available, calculating from user XP:",
            progressError
          );
          if (allUsers.length > 0) {
            const totalXP = allUsers.reduce(
              (sum: number, user: any) => sum + (user.xp || 0),
              0
            );
            // Assuming max XP per user is 1000 for calculation
            const maxPossibleXP = allUsers.length * 1000;
            averageProgress =
              maxPossibleXP > 0
                ? Math.round((totalXP / maxPossibleXP) * 100)
                : 0;
          }
        }

        // Calculate real stats
        const totalUsers = allUsers.length;
        const totalOrganizations = allOrganizations.length;

        // Filter frontliners (users with userType 'user')
        const frontliners = allUsers.filter(
          (user: any) => user.userType === "user"
        );
        const totalFrontliners = frontliners.length;

        // Count new users and frontliners (created this month)
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

        const newFrontliners = frontliners.filter((user: any) => {
          if (!user.createdAt) return false;
          const userCreatedDate = new Date(user.createdAt);
          return (
            userCreatedDate.getMonth() === currentMonth &&
            userCreatedDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate total VX points (sum of all users' XP)
        const totalVXPoints = allUsers.reduce(
          (sum: number, user: any) => sum + (user.xp || 0),
          0
        );

        setStats({
          totalUsers,
          newUsersThisMonth,
          totalFrontliners,
          newFrontliners,
          totalOrganizations,
          totalCertificates,
          totalVXPoints,
          averageProgress,
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
    <Card className="bg-card/80 backdrop-blur-sm border border-border hover:bg-card/90 transition-all duration-300 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground/80">
          {title}
        </CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : (
          <Icon className="h-4 w-4 text-primary" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">
          {loading ? "..." : value}
        </div>
        {change && !loading && (
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-card-foreground/60"
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
      title="Admin Dashboard"
      description="Welcome back! Here's what's happening with your academy!"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <StatCard
            title="Total Frontliners"
            value={stats.totalFrontliners.toLocaleString()}
            icon={Target}
            change="Active frontliners"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Frontliners"
            value={stats.newFrontliners}
            icon={Target}
            change="Joined this month"
            changeType="positive"
            loading={loading}
          />
          <StatCard
            title="Total Organizations"
            value={stats.totalOrganizations.toLocaleString()}
            icon={Building2}
            change="Registered organizations"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total Certificates"
            value={stats.totalCertificates.toLocaleString()}
            icon={GraduationCap}
            change="Certificates issued"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total VX Points"
            value={stats.totalVXPoints.toLocaleString()}
            icon={Star}
            change="Points earned by all users"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Average Progress"
            value={`${stats.averageProgress}%`}
            icon={Percent}
            change="Overall completion rate"
            changeType="neutral"
            loading={loading}
          />
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Dashboard;
