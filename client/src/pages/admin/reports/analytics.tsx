import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Loader2,
} from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    completedCourses: 0,
    totalOrganizations: 0,
    certificatesIssued: 0,
    averageCompletionRate: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - replace with actual API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real API data
        setAnalytics({
          totalUsers: 1250,
          activeUsers: 890,
          totalCourses: 45,
          completedCourses: 320,
          totalOrganizations: 25,
          certificatesIssued: 280,
          averageCompletionRate: 78.5,
          monthlyGrowth: 12.3,
        });
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
      title="Analytics Dashboard"
      description="Comprehensive analytics and insights for your academy"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            icon={Users}
            change={`+${analytics.monthlyGrowth}% this month`}
            changeType="positive"
            loading={loading}
          />
          <StatCard
            title="Active Users"
            value={analytics.activeUsers.toLocaleString()}
            icon={Activity}
            change="Currently online"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={BookOpen}
            change="Available courses"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Certificates Issued"
            value={analytics.certificatesIssued}
            icon={Award}
            change="Total issued"
            changeType="positive"
            loading={loading}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Course Completions"
            value={analytics.completedCourses}
            icon={Target}
            change="Total completions"
            changeType="positive"
            loading={loading}
          />
          <StatCard
            title="Organizations"
            value={analytics.totalOrganizations}
            icon={Users}
            change="Registered organizations"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Completion Rate"
            value={`${analytics.averageCompletionRate}%`}
            icon={TrendingUp}
            change="Average across all courses"
            changeType="positive"
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#00d8cc]" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#00d8cc]" />
                Course Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Pie chart visualization will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Analytics;
