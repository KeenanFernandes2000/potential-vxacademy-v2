import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
} from "recharts";

// Color palette for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
  "#87CEEB",
  "#DDA0DD",
  "#98FB98",
  "#F0E68C",
  "#FFB6C1",
];

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

  // Additional analytics data states
  const [userGrowth, setUserGrowth] = useState([]);
  const [assetDistribution, setAssetDistribution] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [seniorityDistribution, setSeniorityDistribution] = useState([]);
  const [certificateAnalytics, setCertificateAnalytics] = useState([]);
  const [registrationTrends, setRegistrationTrends] = useState([]);
  const [activeInactiveUsers, setActiveInactiveUsers] = useState([]);
  const [peakUsageTimes, setPeakUsageTimes] = useState([]);
  const [trainingAreaEnrollments, setTrainingAreaEnrollments] = useState([]);
  const [courseCompletionRates, setCourseCompletionRates] = useState([]);
  const [trainingCompletionHeatmap, setTrainingCompletionHeatmap] = useState(
    []
  );
  const [certificateTrends, setCertificateTrends] = useState([]);
  const [organizationRoleDistribution, setOrganizationRoleDistribution] =
    useState([]);
  const [
    trainingAreaSeniorityDistribution,
    setTrainingAreaSeniorityDistribution,
  ] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Single API call for all analytics data
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reports/overall-analytics`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const result = await response.json();

        if (result.success) {
          const data = result.data;

          // Set key metrics
          setAnalytics(data.keyMetrics);

          // Set all analytics data
          setUserGrowth(data.userGrowth || []);
          setAssetDistribution(data.assetDistribution || []);
          setRoleDistribution(data.roleDistribution || []);
          setSeniorityDistribution(data.seniorityDistribution || []);
          setCertificateAnalytics(data.certificateAnalytics || []);
          setRegistrationTrends(data.registrationTrends || []);
          setActiveInactiveUsers(data.activeInactiveUsers || []);
          setPeakUsageTimes(data.peakUsageTimes || []);
          setTrainingAreaEnrollments(data.trainingAreaEnrollments || []);
          setCourseCompletionRates(data.courseCompletionRates || []);
          setTrainingCompletionHeatmap(data.trainingCompletionHeatmap || []);
          setCertificateTrends(data.certificateTrends || []);
          setOrganizationRoleDistribution(
            data.organizationRoleDistribution || []
          );
          setTrainingAreaSeniorityDistribution(
            data.trainingAreaSeniorityDistribution || []
          );
        } else {
          throw new Error(result.error || "Failed to load analytics data");
        }
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
    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#2C2C2C]">
          {title}
        </CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-dawn animate-spin" />
        ) : (
          <Icon className="h-4 w-4 text-dawn" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#2C2C2C]">
          {loading ? "..." : value}
        </div>
        {change && !loading && (
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                ? "text-red-400"
                : "text-[#2C2C2C]/60"
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

        {/* Charts Row 1: User Growth and Role Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 1: Bar Chart - User Growth Over Time */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dawn" />
                User Growth Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="period" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalUsers" fill="#d2691e" name="Total Users" />
                  <Bar dataKey="newUsers" fill="#B85A1A" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Bar Chart - User Distribution by Asset */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-dawn" />
                User Distribution by Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="asset" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="userCount" fill="#d2691e" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2: Pie Charts - Asset and Seniority Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 3: Pie Chart - Asset Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-dawn" />
                Platform Users by Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#d2691e"
                    dataKey="userCount"
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 4: Pie Chart - Manager vs Staff Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Target className="h-5 w-5 text-dawn" />
                Manager vs Staff Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={seniorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ seniority, percentage }) =>
                      `${seniority} (${percentage}%)`
                    }
                    outerRadius={80}
                    fill="#d2691e"
                    dataKey="userCount"
                  >
                    {seniorityDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3: Line and Area Charts - Trends */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 5: Line Chart - Registration Trends */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Activity className="h-5 w-5 text-dawn" />
                Registration Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={registrationTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="period" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newRegistrations"
                    stroke="#d2691e"
                    name="New Registrations"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeRegistrations"
                    stroke="#B85A1A"
                    name="Cumulative"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 6: Area Chart - Active vs Inactive Users */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Users className="h-5 w-5 text-dawn" />
                Active vs Inactive Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeInactiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="period" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke="#d2691e"
                    fill="#d2691e"
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="inactiveUsers"
                    stackId="1"
                    stroke="#B85A1A"
                    fill="#B85A1A"
                    name="Inactive Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 4: Usage and Training Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 7: Bar Chart - Peak Usage Days */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-dawn" />
                Peak Usage Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakUsageTimes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="dayOfWeek" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="loginCount" fill="#FFBB28" name="Login Count" />
                  <Bar
                    dataKey="uniqueUsers"
                    fill="#FF8042"
                    name="Unique Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 8: Grouped Bar Chart - Training Area Enrollments */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-dawn" />
                Training Area Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trainingAreaEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="period" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="enrollments"
                    fill="#d2691e"
                    name="Enrollments"
                  />
                  <Bar
                    dataKey="completions"
                    fill="#B85A1A"
                    name="Completions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 5: Completion Rates and Certificate Trends */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 9: Bar Chart - Course Completion Rates by Training Area */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Target className="h-5 w-5 text-dawn" />
                Course Completion Rates by Training Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseCompletionRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="trainingArea" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="completionRate"
                    fill="#d2691e"
                    name="Completion Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 11: Stacked Column Chart - Certificate Trends */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Award className="h-5 w-5 text-dawn" />
                Certificate Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={certificateTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="period" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="certificatesEarned"
                    fill="#FFBB28"
                    name="Certificates Earned"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Chart 10: Heatmap - Training Completion Rates (Full Width) */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Activity className="h-5 w-5 text-dawn" />
              Training Completion Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trainingCompletionHeatmap.map((item: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-[#E5E5E5] rounded-lg bg-sandstone"
                >
                  <div className="font-medium text-sm mb-2 text-[#2C2C2C]">
                    {item.trainingArea}
                  </div>
                  <div className="text-xs text-[#2C2C2C]/60 mb-1">
                    {item.roleCategory} - {item.asset}
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: item.completionRate > 50 ? "#d2691e" : "#B85A1A",
                    }}
                  >
                    {item.completionRate}%
                  </div>
                  <div className="text-xs text-[#2C2C2C]/50">
                    {item.completedUsers}/{item.totalUsers} users
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 6: Organization Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 12: Bar Chart - Organization User Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-dawn" />
                Organization User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={organizationRoleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="organization" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="userCount" fill="#d2691e" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 13: Pie Chart - Training Area Seniority Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-dawn" />
                Training Area Seniority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trainingAreaSeniorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, seniority, percentage }) =>
                      `${name} - ${seniority} (${percentage}%)`
                    }
                    outerRadius={80}
                    fill="#d2691e"
                    dataKey="userCount"
                  >
                    {trainingAreaSeniorityDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      color: "#2C2C2C",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Analytics;
