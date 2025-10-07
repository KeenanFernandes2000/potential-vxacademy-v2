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
    averageCompletionRate: "0",
    monthlyGrowth: 0,
  });

  // Additional analytics data states
  const [userGrowth, setUserGrowth] = useState([]);
  const [assetDistribution, setAssetDistribution] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [seniorityDistribution, setSeniorityDistribution] = useState([]);
  const [certificateAnalytics, setCertificateAnalytics] = useState([]);
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
        <div className="text-5xl font-bold text-[#2C2C2C]">
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
          {/* Chart 1: Line Chart - User Growth Over Time */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dawn" />
                User Growth Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth}>
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
                    formatter={(value: any, name: any) => {
                      if (name === "totalUsers")
                        return [
                          value.toLocaleString(),
                          "Cumulative Total Users",
                        ];
                      if (name === "newUsers")
                        return [
                          value.toLocaleString(),
                          "New Users This Period",
                        ];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="#d2691e"
                    strokeWidth={3}
                    name="Cumulative Total Users"
                    dot={{ fill: "#d2691e", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#B85A1A"
                    strokeWidth={2}
                    name="New Users This Period"
                    dot={{ fill: "#B85A1A", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
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
                    label={({ asset, percentage }) =>
                      `${asset} (${percentage}%)`
                    }
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

        {/* Charts Row 3: Area Chart - Active vs Inactive Users */}
        <div className="grid gap-4 md:grid-cols-1">
          {/* Chart 6: Area Chart - Peak Usage Times */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <Users className="h-5 w-5 text-dawn" />
                Peak Usage Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={peakUsageTimes}>
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

        {/* Charts Row 4: Course Completion Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 8: Grouped Bar Chart - Course Completion Rates */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-dawn" />
                Course Completion Rates Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseCompletionRates}>
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
                  {/* Chart 11: Heatmap - Training Completion Rates (Full Width) */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Activity className="h-5 w-5 text-dawn" />
              Training Completion Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingCompletionHeatmap.map((item: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-[#E5E5E5] rounded-lg bg-sandstone hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-sm mb-2 text-[#2C2C2C]">
                    {item.trainingArea}
                  </div>
                  <div
                    className="text-lg font-bold mb-2"
                    style={{
                      color: item.completionRate > 50 ? "#d2691e" : "#B85A1A",
                    }}
                  >
                    {item.completionRate}%
                  </div>
                  <div className="text-xs text-[#2C2C2C]/50">
                    {item.completedCourses}/{item.totalEnrollments} enrollments
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${item.completionRate}%`,
                        backgroundColor:
                          item.completionRate > 50 ? "#d2691e" : "#B85A1A",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Charts Row 5: Certificate and Training Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 9: Certificate Trends */}
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
                    fill="#FFBB28"
                    name="Completion Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 10: Certificate Analytics by Asset */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dawn" />
                Certificate Analytics by Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={certificateAnalytics}>
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
                  <Bar
                    dataKey="certificatesEarned"
                    fill="#d2691e"
                    name="Certificates Earned"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
                <BarChart data={trainingAreaSeniorityDistribution}>
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
                    label={({ organization, userCount }) =>
                      `${organization} (${userCount})`
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
