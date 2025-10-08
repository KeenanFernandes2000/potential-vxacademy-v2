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
    totalFrontliners: 0,
    newFrontliners: 0,
    totalOrganizations: 0,
    totalSubOrganizations: 0,
    totalCertificates: 0,
    totalSubAdmins: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API object for dashboard operations
  const api = {
    async getDashboardStats(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/dashboard-stats`, {
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
        console.error("Failed to fetch dashboard stats:", error);
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

        // Get dashboard stats from the endpoint
        const dashboardStatsResponse = await api.getDashboardStats(token);
        const dashboardStats = dashboardStatsResponse.data || {};

        setStats({
          totalUsers: dashboardStats.totalUsers || 0,
          totalFrontliners: dashboardStats.totalFrontliners || 0,
          newFrontliners: dashboardStats.newFrontliners || 0,
          totalOrganizations: dashboardStats.totalOrganizations || 0,
          totalSubOrganizations: dashboardStats.totalSubOrganizations || 0,
          totalCertificates: dashboardStats.totalCertificates || 0,
          totalSubAdmins: dashboardStats.totalSubAdmins || 0,
          averageProgress: dashboardStats.averageProgress || 0,
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
        <div className="text-5xl font-bold text-card-foreground">
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
            change="All users in the platform"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total Frontliners"
            value={stats.totalFrontliners.toLocaleString()}
            icon={Target}
            change="All registered frontliners"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Frontliners"
            value={stats.newFrontliners}
            icon={TrendingUp}
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
            title="Total Sub-Organizations"
            value={stats.totalSubOrganizations.toLocaleString()}
            icon={Building2}
            change="Registered sub-organizations"
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
            title="Total Sub-Admins"
            value={stats.totalSubAdmins.toLocaleString()}
            icon={Users}
            change="Registered sub-admins"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Average Progress"
            value={`${stats.averageProgress.toFixed(2)}%`}
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
