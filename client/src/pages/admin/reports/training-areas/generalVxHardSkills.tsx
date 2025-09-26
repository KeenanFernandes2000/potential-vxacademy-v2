import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Filter,
  Loader2,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// API endpoint for training area reports
const baseUrl = import.meta.env.VITE_API_URL;

// Interface for the API response
interface TrainingAreaReportData {
  filters: {
    assets: Array<{ value: string; label: string }>;
    subAssets: Array<{ value: string; label: string }>;
    organizations: Array<{ value: string; label: string }>;
    subOrganizations: Array<{ value: string; label: string }>;
    roleCategories: Array<{ value: string; label: string }>;
    progressStatuses: Array<{ value: string; label: string }>;
  };
  dataTableColumns: string[];
  dataTableRows: Array<{
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    eid: string;
    phoneNumber: string;
    asset: string;
    subAsset: string;
    organization: string;
    subOrganization: string[] | null;
    roleCategory: string;
    role: string;
    seniority: string;
    frontlinerType: string;
    alMidhyafOverallProgress: string;
    module1Progress: number;
    vxPoints: number;
    registrationDate: string;
    lastLoginDate: string;
  }>;
  generalStats: {
    totalFrontliners: number;
    totalOrganizations: number;
    totalCertificatesIssued: number;
    totalCompletedAlMidhyaf: number;
    totalVxPointsEarned: number;
    alMidhyafOverallProgress: number;
  };
}

const GeneralVxHardSkills = () => {
  const [reportData, setReportData] = useState<TrainingAreaReportData | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [subAssetFilter, setSubAssetFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Fetch training area report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/reports/training-area/3`); // General VX Hard Skills training area ID
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Filter data based on search and filters
  useEffect(() => {
    if (!reportData?.dataTableRows) {
      setFilteredData([]);
      return;
    }

    let filtered = reportData.dataTableRows.filter((item: any) => {
      const matchesSearch =
        item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesOrganization =
        organizationFilter === "all" ||
        item.organization === organizationFilter;
      const matchesAsset = assetFilter === "all" || item.asset === assetFilter;
      const matchesSubAsset =
        subAssetFilter === "all" || item.subAsset === subAssetFilter;
      const matchesRoleCategory =
        roleCategoryFilter === "all" ||
        item.roleCategory === roleCategoryFilter;

      return (
        matchesSearch &&
        matchesOrganization &&
        matchesAsset &&
        matchesSubAsset &&
        matchesRoleCategory
      );
    });

    setFilteredData(filtered);
  }, [
    reportData,
    searchTerm,
    organizationFilter,
    assetFilter,
    subAssetFilter,
    roleCategoryFilter,
  ]);

  const handleExportCSV = () => {
    if (!reportData) return;

    const headers = reportData.dataTableColumns;
    const csvData = filteredData.map((item: any) => [
      item.userId,
      item.firstName,
      item.lastName,
      item.email,
      item.eid,
      item.phoneNumber,
      item.asset,
      item.subAsset,
      item.organization,
      Array.isArray(item.subOrganization)
        ? item.subOrganization.join("; ")
        : item.subOrganization || "N/A",
      item.roleCategory,
      item.role,
      item.seniority,
      item.frontlinerType,
      item.alMidhyafOverallProgress,
      item.module1Progress,
      item.vxPoints,
      new Date(item.registrationDate).toLocaleDateString(),
      new Date(item.lastLoginDate).toLocaleDateString(),
    ]);

    const csv = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "general_vx_hard_skills_report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "not-started":
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "not-started":
        return "Not Started";
      case "pending":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  const getClassificationColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "new":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "existing":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="General VX Hard Skills Report"
        description="Comprehensive report on General VX Hard Skills training participation and completion"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading report data...</span>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout
        title="General VX Hard Skills Report"
        description="Comprehensive report on General VX Hard Skills training participation and completion"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-400">
            <p className="text-lg font-semibold mb-2">Error Loading Report</p>
            <p className="text-sm">{error}</p>
            <Button
              onClick={fetchReportData}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  if (!reportData) {
    return (
      <AdminPageLayout
        title="General VX Hard Skills Report"
        description="Comprehensive report on General VX Hard Skills training participation and completion"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-white/60">
            <p className="text-lg">No report data available</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="General VX Hard Skills Report"
      description="Comprehensive report on General VX Hard Skills training participation and completion"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-blue-400 rounded"></div>
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">
                    Total Frontliners
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.totalFrontliners.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-green-400 rounded"></div>
                </div>
                <div>
                  <p className="text-green-200 text-sm font-medium">
                    Total Organizations
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.totalOrganizations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-purple-400 rounded"></div>
                </div>
                <div>
                  <p className="text-purple-200 text-sm font-medium">
                    Certificates Issued
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.totalCertificatesIssued.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-orange-400 rounded"></div>
                </div>
                <div>
                  <p className="text-orange-200 text-sm font-medium">
                    Completed Training
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.totalCompletedAlMidhyaf.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-pink-400 rounded"></div>
                </div>
                <div>
                  <p className="text-pink-200 text-sm font-medium">
                    Total VX Points
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.totalVxPointsEarned.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <div className="w-6 h-6 bg-indigo-400 rounded"></div>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium">
                    Average Progress
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {reportData.generalStats.alMidhyafOverallProgress.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#00d8cc]" />
              Filters and Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={assetFilter} onValueChange={setAssetFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {reportData.filters.assets.map((asset) => (
                    <SelectItem key={asset.value} value={asset.value}>
                      {asset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={organizationFilter}
                onValueChange={setOrganizationFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {reportData.filters.organizations.map((org) => (
                    <SelectItem key={org.value} value={org.value}>
                      {org.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} className="w-full sm:w-auto">
                <Download className="mr-2" size={16} />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accordion Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white">
              General VX Hard Skills Training Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Header - Simplified */}
            <div className="grid grid-cols-8 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="col-span-1 text-white/80 font-medium truncate">
                User ID
              </div>
              <div className="col-span-2 text-white/80 font-medium truncate">
                Name
              </div>
              <div className="col-span-2 text-white/80 font-medium truncate">
                Email
              </div>
              <div className="col-span-1 text-white/80 font-medium truncate">
                Status
              </div>
              <div className="col-span-1 text-white/80 font-medium truncate">
                Progress
              </div>
              <div className="col-span-1 text-white/80 font-medium truncate">
                Actions
              </div>
            </div>

            {/* Rows */}
            <div className="mt-2 space-y-2">
              {filteredData.map((item: any) => (
                <div
                  key={item.userId}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  {/* Primary Row - Basic Info Only */}
                  <div
                    className="grid grid-cols-8 gap-4 p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => toggleRow(item.userId)}
                  >
                    <div className="col-span-1 text-white font-medium truncate">
                      {item.userId}
                    </div>
                    <div className="col-span-2 text-white/80 truncate">
                      {item.firstName} {item.lastName}
                    </div>
                    <div className="col-span-2 text-white/80 truncate">
                      {item.email}
                    </div>
                    <div className="col-span-1 text-white/80">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(
                          item.frontlinerType
                        )}`}
                      >
                        {item.frontlinerType}
                      </span>
                    </div>
                    <div className="col-span-1 text-white/80 truncate">
                      {item.alMidhyafOverallProgress}%
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      {expandedRows.has(item.userId) ? (
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-white/60" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Dropdown Row - All Additional Details */}
                  {expandedRows.has(item.userId) && (
                    <div className="bg-white/5 border-t border-white/10 p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">EID</div>
                          <div className="text-white/80 truncate">
                            {item.eid}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Phone Number
                          </div>
                          <div className="text-white/80 truncate">
                            {item.phoneNumber}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Asset
                          </div>
                          <div className="text-white/80 truncate">
                            {item.asset}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Asset Sub-Category
                          </div>
                          <div className="text-white/80 truncate">
                            {item.subAsset}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Organization
                          </div>
                          <div className="text-white/80 truncate">
                            {item.organization}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Sub-Organization
                          </div>
                          <div className="text-white/80 truncate">
                            {Array.isArray(item.subOrganization)
                              ? item.subOrganization?.join(", ")
                              : item.subOrganization ?? "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Role Category
                          </div>
                          <div className="text-white/80 truncate">
                            {item.roleCategory}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">Role</div>
                          <div className="text-white/80 truncate">
                            {item.role}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Seniority
                          </div>
                          <div className="text-white/80 truncate">
                            {item.seniority}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Module 1 Progress
                          </div>
                          <div className="text-white/80 truncate">
                            {item.module1Progress}%
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            VX Points
                          </div>
                          <div className="text-white/80 truncate">
                            {item.vxPoints}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-white/60 mb-1">
                            Registration Date
                          </div>
                          <div className="text-white/80 truncate">
                            {new Date(
                              item.registrationDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <div className="text-xs text-white/60 mb-1">
                            Last Login Date
                          </div>
                          <div className="text-white/80 truncate">
                            {new Date(item.lastLoginDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default GeneralVxHardSkills;
