import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const AdInformation = () => {
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
      setError(null);
      const response = await fetch(`${baseUrl}/reports/training-area/1`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        setFilteredData(result.data.dataTableRows);
      } else {
        throw new Error(result.error || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalParticipants = reportData?.generalStats.totalFrontliners || 0;
  const completedParticipants =
    reportData?.generalStats.totalCompletedAlMidhyaf || 0;
  const inProgressParticipants = filteredData.filter(
    (item) =>
      item.alMidhyafOverallProgress &&
      parseFloat(item.alMidhyafOverallProgress) > 0 &&
      parseFloat(item.alMidhyafOverallProgress) < 100
  ).length;
  const notStartedParticipants = filteredData.filter(
    (item) =>
      !item.alMidhyafOverallProgress ||
      parseFloat(item.alMidhyafOverallProgress) === 0
  ).length;
  const averageScore = reportData?.generalStats.alMidhyafOverallProgress || 0;

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          `${item.firstName} ${item.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.roleCategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        const progress = parseFloat(item.alMidhyafOverallProgress);
        if (statusFilter === "Completed") return progress === 100;
        if (statusFilter === "In Progress")
          return progress > 0 && progress < 100;
        if (statusFilter === "Not Started") return progress === 0;
        return true;
      });
    }

    // Apply organization filter
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.organization === organizationFilter
      );
    }

    // Apply asset filter
    if (assetFilter !== "all") {
      filtered = filtered.filter((item) => item.asset === assetFilter);
    }

    // Apply sub-asset filter
    if (subAssetFilter !== "all") {
      filtered = filtered.filter((item) => item.subAsset === subAssetFilter);
    }

    // Apply role category filter
    if (roleCategoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.roleCategory === roleCategoryFilter
      );
    }

    setFilteredData(filtered);
  }, [
    reportData,
    searchTerm,
    statusFilter,
    organizationFilter,
    assetFilter,
    subAssetFilter,
    roleCategoryFilter,
  ]);

  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      reportData.dataTableColumns,
      ...filteredData.map((item) => [
        item.userId,
        item.firstName,
        item.lastName,
        item.email,
        item.eid,
        item.phoneNumber,
        item.asset,
        item.subAsset,
        item.organization,
        item.subOrganization?.join(", ") || "N/A",
        item.roleCategory,
        item.role,
        item.seniority,
        item.frontlinerType,
        item.alMidhyafOverallProgress,
        item.module1Progress,
        item.vxPoints,
        new Date(item.registrationDate).toLocaleDateString(),
        new Date(item.lastLoginDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ad-information-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (progress: string) => {
    const progressValue = parseFloat(progress);
    if (progressValue === 100) return "text-green-400 bg-green-400/20";
    if (progressValue > 0) return "text-blue-400 bg-blue-400/20";
    return "text-white/60 bg-white/10";
  };

  const getStatusText = (progress: string) => {
    const progressValue = parseFloat(progress);
    if (progressValue === 100) return "Completed";
    if (progressValue > 0) return "In Progress";
    return "Not Started";
  };

  const getClassificationColor = (frontlinerType: string) => {
    switch (frontlinerType) {
      case "Existing":
        return "text-blue-400 bg-blue-400/20";
      case "New":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminPageLayout
        title="AD Information Report"
        description="Comprehensive report on Abu Dhabi Information Management training participation and completion"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Loading report data...</span>
        </div>
      </AdminPageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminPageLayout
        title="AD Information Report"
        description="Comprehensive report on Abu Dhabi Information Management training participation and completion"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              Error loading report data: {error}
            </p>
            <Button
              onClick={fetchReportData}
              className="bg-[#00d8cc] hover:bg-[#00d8cc]/80"
            >
              Try Again
            </Button>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  // No data state
  if (!reportData) {
    return (
      <AdminPageLayout
        title="AD Information Report"
        description="Comprehensive report on Abu Dhabi Information Management training participation and completion"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="AD Information Report"
      description="Comprehensive report on Abu Dhabi Information Management training participation and completion"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Frontliners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {reportData.generalStats.totalFrontliners}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {reportData.generalStats.totalOrganizations}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Certificates Issued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {reportData.generalStats.totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Completed Al Midhyaf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {reportData.generalStats.totalCompletedAlMidhyaf}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                VX Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {reportData.generalStats.totalVxPointsEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {reportData.generalStats.alMidhyafOverallProgress.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white">Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                    size={16}
                  />
                  <Input
                    placeholder="Search participants, organizations, or departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
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
              <Select value={subAssetFilter} onValueChange={setSubAssetFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by sub-asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Assets</SelectItem>
                  {reportData.filters.subAssets.map((subAsset) => (
                    <SelectItem key={subAsset.value} value={subAsset.value}>
                      {subAsset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={roleCategoryFilter}
                onValueChange={setRoleCategoryFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Role Categories</SelectItem>
                  {reportData.filters.roleCategories.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
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
              AD Information Training Data
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

export default AdInformation;
