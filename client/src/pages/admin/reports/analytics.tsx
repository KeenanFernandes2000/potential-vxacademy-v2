import React, { useState, useEffect, useRef } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Download,
  Image,
  FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

// Professional monochromatic gradient for bar charts (orange/brown theme)
const BAR_COLORS = [
  "#F4C7A0", // Lightest orange
  "#E8A76F", // Light orange
  "#DC873E", // Medium-light orange
  "#D2691E", // Brand color (medium)
  "#B85A19", // Medium-dark orange
  "#9E4B14", // Dark orange
  "#843C0F", // Darkest orange
];

// Vibrant orange-based colors for pie and donut charts
const PIE_COLORS = [
  "#D2691E", // Chocolate (from image)
  "#E07B3F", // Lighter orange
  "#F4A460", // Sandy Brown
  "#FF8C42", // Vibrant orange
  "#FF7F50", // Coral
  "#FFA07A", // Light Salmon
  "#FFB366", // Light orange
];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalFrontliners: 0,
    newFrontliners: 0,
    totalOrganizations: 0,
    totalSubOrganizations: 0,
    certificatesIssued: 0,
    totalSubAdmins: 0,
    averageProgress: 0,
  });

  // Additional analytics data states
  const [userGrowth, setUserGrowth] = useState([]);
  const [userGrowthBar, setUserGrowthBar] = useState<
    Array<{
      period: string;
      newUsers: number;
      monthOverMonthGrowth: number | null;
    }>
  >([]);
  const [assetDistribution, setAssetDistribution] = useState([]);
  const [seniorityDistribution, setSeniorityDistribution] = useState([]);
  const [certificateAnalytics, setCertificateAnalytics] = useState([]);
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
  const [roleCategoryDistribution, setRoleCategoryDistribution] = useState<
    Array<{
      roleCategory: string;
      userCount: number;
      percentage: number;
    }>
  >([]);
  const [certificatesPerAsset, setCertificatesPerAsset] = useState<
    Array<{
      asset: string;
      certificateCount: number;
      percentage: number;
    }>
  >([]);
  const [activeInactiveUsers, setActiveInactiveUsers] = useState<
    Array<{
      name: string;
      value: number;
      percentage: number;
    }>
  >([]);
  const [trainingAreaCompletionHeatmap, setTrainingAreaCompletionHeatmap] =
    useState<
      Array<{
        trainingArea: string;
        enrolledUsers: number;
        totalFrontliners: number;
        completionRate: number;
      }>
    >([]);
  const [expectedVsActualFrontliners, setExpectedVsActualFrontliners] =
    useState<
      Array<{
        name: string;
        value: number;
        percentage: number;
      }>
    >([]);
  const [subAdminAssetDistribution, setSubAdminAssetDistribution] = useState<
    Array<{
      asset: string;
      subAsset: string;
      userCount: number;
      percentage: number;
    }>
  >([]);

  // Refs for individual chart containers
  const chartRef = useRef<HTMLDivElement>(null);
  const growthChartRef = useRef<HTMLDivElement>(null);
  const roleCategoryChartRef = useRef<HTMLDivElement>(null);
  const assetDistributionChartRef = useRef<HTMLDivElement>(null);
  const subAdminAssetChartRef = useRef<HTMLDivElement>(null);
  const certificatesPieChartRef = useRef<HTMLDivElement>(null);
  const activeInactiveChartRef = useRef<HTMLDivElement>(null);
  const seniorityChartRef = useRef<HTMLDivElement>(null);
  const expectedActualChartRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Color helper function for heatmap
  const getHeatmapColor = (rate: number) => {
    if (rate >= 86) return "#10B981"; // Dark Green
    if (rate >= 71) return "#86EFAC"; // Light Green
    if (rate >= 41) return "#FCD34D"; // Yellow
    return "#EF4444"; // Red
  };

  // Helper function to convert oklch colors to hex for html2canvas compatibility
  const convertOklchToHex = (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    const allElements = element.querySelectorAll("*");

    // Convert current element
    if (computedStyle.color.includes("oklch")) {
      element.style.color = "#000000"; // Fallback to black
    }
    if (computedStyle.backgroundColor.includes("oklch")) {
      element.style.backgroundColor = "#ffffff"; // Fallback to white
    }
    if (computedStyle.borderColor.includes("oklch")) {
      element.style.borderColor = "#e5e5e5"; // Fallback to gray
    }

    // Convert all child elements
    allElements.forEach((el) => {
      const elStyle = window.getComputedStyle(el);
      if (elStyle.color.includes("oklch")) {
        (el as HTMLElement).style.color = "#000000";
      }
      if (elStyle.backgroundColor.includes("oklch")) {
        (el as HTMLElement).style.backgroundColor = "#ffffff";
      }
      if (elStyle.borderColor.includes("oklch")) {
        (el as HTMLElement).style.borderColor = "#e5e5e5";
      }
    });
  };

  // Download functions for individual charts
  const downloadChartAsPNG = async (
    chartRef: React.RefObject<HTMLDivElement | null>,
    filename: string
  ) => {
    if (!chartRef.current) {
      console.error("Chart ref is null");
      return;
    }

    try {
      console.log("Starting PNG export for:", filename);

      // Wait a bit to ensure all dynamic content is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convert oklch colors to hex before export
      convertOklchToHex(chartRef.current);

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: chartRef.current.offsetWidth,
        height: chartRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Convert oklch colors in the cloned document
          const clonedElement = clonedDoc.querySelector(
            `[data-chart-ref="${filename}"]`
          ) as HTMLElement;
          if (clonedElement) {
            clonedElement.style.visibility = "visible";
            clonedElement.style.display = "block";

            // Convert oklch colors in cloned document
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach((el) => {
              const elStyle = window.getComputedStyle(el);
              if (elStyle.color.includes("oklch")) {
                (el as HTMLElement).style.color = "#000000";
              }
              if (elStyle.backgroundColor.includes("oklch")) {
                (el as HTMLElement).style.backgroundColor = "#ffffff";
              }
              if (elStyle.borderColor.includes("oklch")) {
                (el as HTMLElement).style.borderColor = "#e5e5e5";
              }
            });
          }
        },
      });

      console.log("Canvas created successfully");

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      link.click();

      console.log("Download initiated successfully");
    } catch (error) {
      console.error("Error downloading PNG:", error);
      console.error(
        "Error details:",
        error instanceof Error ? error.message : String(error)
      );

      // Fallback: try with simpler settings and force color conversion
      try {
        console.log("Trying fallback export method...");

        // Force convert all oklch colors to hex
        convertOklchToHex(chartRef.current);

        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: false,
          allowTaint: true,
          ignoreElements: (element) => {
            // Skip elements that might have oklch colors
            const style = window.getComputedStyle(element);
            return (
              style.color.includes("oklch") ||
              style.backgroundColor.includes("oklch") ||
              style.borderColor.includes("oklch")
            );
          },
        });

        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL();
        link.click();

        console.log("Fallback export successful");
      } catch (fallbackError) {
        console.error("Fallback export also failed:", fallbackError);
        alert(
          `Failed to download chart as PNG due to unsupported color format. Please try again or contact support.`
        );
      }
    }
  };

  const downloadChartAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("frontliner-distribution-by-asset.pdf");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download chart as PDF");
    }
  };

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
          setUserGrowthBar(data.userGrowthBar || []);
          setAssetDistribution(data.assetDistribution || []);
          setSeniorityDistribution(data.seniorityDistribution || []);
          setCertificateAnalytics(data.certificateAnalytics || []);
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
          setRoleCategoryDistribution(data.roleCategoryDistribution || []);
          setCertificatesPerAsset(data.certificatesPerAsset || []);
          setActiveInactiveUsers(data.activeInactiveUsers || []);
          setTrainingAreaCompletionHeatmap(
            data.trainingAreaCompletionHeatmap || []
          );
          setExpectedVsActualFrontliners(
            data.expectedVsActualFrontliners || []
          );
          setSubAdminAssetDistribution(data.subAdminAssetDistribution || []);
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
        <CardTitle className="text-sm font-medium text-black">
          {title}
        </CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-dawn animate-spin" />
        ) : (
          <Icon className="h-4 w-4 text-dawn" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-black">
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
            change="All users in the platform"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total Frontliners"
            value={analytics.totalFrontliners.toLocaleString()}
            icon={Users}
            change="All registered frontliners"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Frontliners"
            value={analytics.newFrontliners.toLocaleString()}
            icon={TrendingUp}
            change="Joined this month"
            changeType="positive"
            loading={loading}
          />
          <StatCard
            title="Total Organizations"
            value={analytics.totalOrganizations.toLocaleString()}
            icon={Users}
            change="Registered organizations"
            changeType="neutral"
            loading={loading}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sub-Organizations"
            value={analytics.totalSubOrganizations.toLocaleString()}
            icon={Users}
            change="Registered sub-organizations"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Total Certificates"
            value={analytics.certificatesIssued.toLocaleString()}
            icon={Award}
            change="Certificates issued"
            changeType="positive"
            loading={loading}
          />
          <StatCard
            title="Total Sub-Admins"
            value={analytics.totalSubAdmins.toLocaleString()}
            icon={Users}
            change="Registered sub-admins"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="Average Progress"
            value={`${analytics.averageProgress.toFixed(2)}%`}
            icon={Target}
            change="Overall completion rate"
            changeType="positive"
            loading={loading}
          />
        </div>

        {/* Charts Row 1: User Growth and Role Distribution */}
        <div className="grid gap-4 md:grid-cols-1">
          {/* Chart: Line Chart - User Growth Over Time */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-dawn" />
                  Growth of Frontliners Over Time (Month-over-Month)
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        growthChartRef,
                        "frontliners-growth-over-time"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={growthChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthBar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="period" stroke="#666666" />
                    <YAxis stroke="#666666" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (
                          active &&
                          payload &&
                          payload.length &&
                          userGrowthBar.length > 0
                        ) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <p className="font-medium text-black">{label}</p>
                              <p className="text-sm text-gray-600">
                                New Users: {data.newUsers}
                              </p>
                              <p className="text-sm text-gray-600">
                                Month-over-Month Growth:{" "}
                                {data.monthOverMonthGrowth || 0}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
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
                      dataKey="newUsers"
                      stroke="#d2691e"
                      strokeWidth={3}
                      name="New Users"
                      dot={{ fill: "#d2691e", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart: Bar Chart - Role Category Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-dawn" />
                  Frontliners Distribution by Role Categories
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        roleCategoryChartRef,
                        "role-categories-distribution"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {roleCategoryDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No role category data available</p>
                </div>
              ) : (
                <div ref={roleCategoryChartRef}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={roleCategoryDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis
                        dataKey="roleCategory"
                        stroke="#666666"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={12}
                        tickFormatter={(value) => {
                          // Truncate long role category names
                          return value.length > 15
                            ? value.substring(0, 15) + "..."
                            : value;
                        }}
                      />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-black">
                                  {data.roleCategory}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Users: {data.userCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E5E5",
                          borderRadius: "8px",
                          color: "#2C2C2C",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="userCount" name="Users" fill="#d2691e">
                        {roleCategoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart: Bar Chart - User Distribution by Asset */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-dawn" />
                  Frontliner Distribution by Asset
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        assetDistributionChartRef,
                        "asset-distribution"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assetDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No asset distribution data available</p>
                </div>
              ) : (
                <div ref={assetDistributionChartRef}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={assetDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis
                        dataKey="asset"
                        stroke="#666666"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={12}
                        tickFormatter={(value) => {
                          // Truncate long asset names
                          return value.length > 15
                            ? value.substring(0, 15) + "..."
                            : value;
                        }}
                      />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (
                            active &&
                            payload &&
                            payload.length &&
                            assetDistribution.length > 0
                          ) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-black">
                                  {data.asset}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Users: {data.userCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                                <p className="text-sm text-gray-600">
                                  Sub-Asset: {data.subAsset || "N/A"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E5E5",
                          borderRadius: "8px",
                          color: "#2C2C2C",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="userCount" name="Users" fill="#d2691e">
                        {assetDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2: Sub Admin Asset Distribution */}
        <div className="grid gap-4 md:grid-cols-1">
          {/* Chart: Bar Chart - Sub Admin Asset Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-dawn" />
                  Sub Admins Distribution by Asset
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        subAdminAssetChartRef,
                        "sub-admin-asset-distribution"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {subAdminAssetDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No sub admin asset distribution data available</p>
                </div>
              ) : (
                <div ref={subAdminAssetChartRef}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={subAdminAssetDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis
                        dataKey="asset"
                        stroke="#666666"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={12}
                        tickFormatter={(value) => {
                          // Truncate long asset names
                          return value.length > 15
                            ? value.substring(0, 15) + "..."
                            : value;
                        }}
                      />
                      <YAxis stroke="#666666" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (
                            active &&
                            payload &&
                            payload.length &&
                            subAdminAssetDistribution.length > 0
                          ) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-black">
                                  {data.asset}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Users: {data.userCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                                <p className="text-sm text-gray-600">
                                  Sub-Asset: {data.subAsset || "N/A"}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E5E5",
                          borderRadius: "8px",
                          color: "#2C2C2C",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="userCount" name="Users" fill="#d2691e">
                        {subAdminAssetDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3: Active vs Inactive Users */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chart: Pie Chart - Certificates Earned per Asset Category */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Award className="h-5 w-5 text-dawn" />
                  Certificates Earned per Asset Category
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        certificatesPieChartRef,
                        "certificates-per-asset"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {certificatesPerAsset.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No certificate data available</p>
                </div>
              ) : (
                <div ref={certificatesPieChartRef}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={certificatesPerAsset}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ asset, percentage }: any) => {
                          const label = `${asset} (${percentage}%)`;
                          return label.length > 20
                            ? `${asset.substring(0, 15)}... (${percentage}%)`
                            : label;
                        }}
                        outerRadius={60}
                        innerRadius={30}
                        fill="#d2691e"
                        dataKey="certificateCount"
                      >
                        {certificatesPerAsset.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-black">
                                  {data.asset}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Certificates: {data.certificateCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
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
                </div>
              )}
            </CardContent>
          </Card>
          {/* Chart: Donut Chart - Active vs Inactive Users */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Activity className="h-5 w-5 text-dawn" />
                  Active Users vs Inactive Users (15 days of inactivity)
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        activeInactiveChartRef,
                        "active-inactive-users"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeInactiveUsers.length === 0 ||
              (activeInactiveUsers[0]?.value === 0 &&
                activeInactiveUsers[1]?.value === 0) ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No active/inactive user data available</p>
                </div>
              ) : (
                <div ref={activeInactiveChartRef}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activeInactiveUsers}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name} (${percentage}%)`
                        }
                        outerRadius={80}
                        innerRadius={50}
                        fill="#d2691e"
                        dataKey="value"
                      >
                        {activeInactiveUsers.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-black">
                                  {data.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Count: {data.value} users
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
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
                </div>
              )}
            </CardContent>
          </Card>
          {/* Chart: Pie Chart - Manager vs Staff Distribution */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Target className="h-5 w-5 text-dawn" />
                  Manager vs Staff Distribution
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        seniorityChartRef,
                        "seniority-distribution"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {seniorityDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No seniority distribution data available</p>
                </div>
              ) : (
                <div ref={seniorityChartRef}>
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
                        outerRadius={60}
                        fill="#d2691e"
                        dataKey="userCount"
                      >
                        {seniorityDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-black">
                                  {data.seniority}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Count: {data.userCount} users
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Chart: Pie Chart - Expected vs Actual Frontliners */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Users className="h-5 w-5 text-dawn" />
                  Expected vs Registered Frontliners
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        expectedActualChartRef,
                        "expected-vs-actual-frontliners"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expectedVsActualFrontliners.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No frontliner data available</p>
                </div>
              ) : (
                <div ref={expectedActualChartRef}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expectedVsActualFrontliners}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name} (${percentage}%)`
                        }
                        outerRadius={60}
                        fill="#d2691e"
                        dataKey="value"
                      >
                        {expectedVsActualFrontliners.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-black">
                                  {data.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Count: {data.value} frontliners
                                </p>
                                <p className="text-sm text-gray-600">
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3: Training Area Completion Heatmap */}
        <div className="grid gap-4 md:grid-cols-1">
          {/* Chart: Heatmap - Training Area Completion */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Activity className="h-5 w-5 text-dawn" />
                  Training Area Completion Heatmap
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadChartAsPNG(
                        heatmapRef,
                        "training-area-completion-heatmap"
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trainingAreaCompletionHeatmap.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <p>No training area completion data available</p>
                </div>
              ) : (
                <div
                  ref={heatmapRef}
                  data-chart-ref="training-area-completion-heatmap"
                  className="space-y-2"
                >
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: "#10B981" }}
                      ></div>
                      <span>Excellent (86-100%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: "#86EFAC" }}
                      ></div>
                      <span>Good (71-85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: "#FCD34D" }}
                      ></div>
                      <span>Medium (41-70%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: "#EF4444" }}
                      ></div>
                      <span>Low (0-40%)</span>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="space-y-3">
                    {trainingAreaCompletionHeatmap.map((area, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                        style={{
                          backgroundColor:
                            getHeatmapColor(area.completionRate) + "20",
                        }}
                      >
                        {/* Training Area Name */}
                        <h4 className="font-medium text-black mb-2">
                          {area.trainingArea}
                        </h4>

                        {/* Completion Percentage */}
                        <div
                          className="text-2xl font-bold mb-2"
                          style={{
                            color: getHeatmapColor(area.completionRate),
                          }}
                        >
                          {area.completionRate}%
                        </div>

                        {/* Enrollment Details */}
                        <div className="text-sm text-gray-600 mb-3">
                          {area.enrolledUsers}/{area.totalFrontliners}{" "}
                          Frontliners enrolled
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(area.completionRate, 100)}%`,
                              backgroundColor: "#d2691e",
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default Analytics;
