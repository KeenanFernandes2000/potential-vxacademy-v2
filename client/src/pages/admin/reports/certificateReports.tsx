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
  Award,
  Search,
  Users,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// API endpoint for certificate reports
const baseUrl = import.meta.env.VITE_API_URL;

// Interface for the API response
interface CertificateReportData {
  filters: {
    assets: Array<{ value: string; label: string }>;
    subAssets: Array<{ value: string; label: string }>;
    organizations: Array<{ value: string; label: string }>;
    subOrganizations: Array<{ value: string; label: string }>;
    roleCategories: Array<{ value: string; label: string }>;
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
    subOrganization: string | null;
    roleCategory: string;
    role: string;
    seniority: string;
    frontlinerType: string;
    vxPoints: number;
    overallProgress: number;
    registrationDate: string;
    lastLoginDate: string;
    alMidhyafCertificate: boolean;
    adInformationCertificate: boolean;
    generalVXSoftSkillsCertificate: boolean;
    generalVXHardSkillsCertificate: boolean;
    managerialCompetenciesCertificate: boolean;
  }>;
  generalStats: {
    totalFrontliners: number;
    totalOrganizations: number;
    totalCertificatesIssued: number;
    totalVxPointsEarned: number;
    averageOverallProgress: number;
  };
  trainingAreas: Array<{
    id: number;
    name: string;
  }>;
}

const CertificateReports = () => {
  const [reportData, setReportData] = useState<CertificateReportData | null>(
    null
  );
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [assetSubCategoryFilter, setAssetSubCategoryFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [subOrganizationFilter, setSubOrganizationFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [overallProgressFilter, setOverallProgressFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Fetch certificate report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/reports/certificates`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        setFilteredData(result.data.dataTableRows);
      } else {
        throw new Error(
          result.error || "Failed to fetch certificate report data"
        );
      }
    } catch (err) {
      console.error("Error fetching certificate report data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, []);

  // Filter data based on search term and filters
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          `${item.firstName} ${item.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userId.toString().includes(searchTerm) ||
          item.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by asset
    if (assetFilter !== "all") {
      filtered = filtered.filter((item) => item.asset === assetFilter);
    }

    // Filter by asset sub-category
    if (assetSubCategoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.subAsset === assetSubCategoryFilter
      );
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.organization === organizationFilter
      );
    }

    // Filter by sub-organization
    if (subOrganizationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.subOrganization === subOrganizationFilter
      );
    }

    // Filter by role category
    if (roleCategoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.roleCategory === roleCategoryFilter
      );
    }

    // Filter by overall progress
    if (overallProgressFilter !== "all") {
      filtered = filtered.filter((item) => {
        const progress = item.overallProgress;
        switch (overallProgressFilter) {
          case "high":
            return progress >= 80;
          case "medium":
            return progress >= 50 && progress < 80;
          case "low":
            return progress < 50;
          default:
            return true;
        }
      });
    }

    setFilteredData(filtered);
  }, [
    reportData,
    searchTerm,
    assetFilter,
    assetSubCategoryFilter,
    organizationFilter,
    subOrganizationFilter,
    roleCategoryFilter,
    overallProgressFilter,
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
        item.subOrganization || "N/A",
        item.roleCategory,
        item.role,
        item.seniority,
        item.frontlinerType,
        item.vxPoints,
        item.overallProgress,
        new Date(item.registrationDate).toLocaleDateString(),
        new Date(item.lastLoginDate).toLocaleDateString(),
        item.alMidhyafCertificate ? "Yes" : "No",
        item.adInformationCertificate ? "Yes" : "No",
        item.generalVXSoftSkillsCertificate ? "Yes" : "No",
        item.generalVXHardSkillsCertificate ? "Yes" : "No",
        item.managerialCompetenciesCertificate ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate-reports.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getClassificationColor = (frontlinerType: string) => {
    switch (frontlinerType) {
      case "Existing":
        return "text-blue-600 bg-blue-100";
      case "New":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Loading state
  if (loading) {
    return (
      <AdminPageLayout
        title="Certificate Reports"
        description="Complete overview of all frontliners and their certificate achievements"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Loading certificate data...</span>
        </div>
      </AdminPageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminPageLayout
        title="Certificate Reports"
        description="Complete overview of all frontliners and their certificate achievements"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              Error loading certificate data: {error}
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
        title="Certificate Reports"
        description="Complete overview of all frontliners and their certificate achievements"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Certificate Reports"
      description="Complete overview of all frontliners and their certificate achievements"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Number of Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Number of Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Certificates Issued
              </CardTitle>
              <Award className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points Earned
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalVxPointsEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card> */}

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Overall Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.averageOverallProgress.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C]">Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    placeholder="Search frontliners, organizations, or roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 text-[#2C2C2C] placeholder:text-gray-500 focus:border-dawn focus:ring-dawn"
                  />
                </div>
              </div>

              <Select value={assetFilter} onValueChange={setAssetFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
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
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
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

              <Select
                value={overallProgressFilter}
                onValueChange={setOverallProgressFilter}
              >
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="Filter by progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress Levels</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (50-79%)</SelectItem>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleExportCSV}
                className="w-full sm:w-auto bg-dawn hover:bg-[#B85A1A] text-white"
              >
                <Download className="mr-2" size={16} />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accordion Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C]">
              Certificate Reports Data ({filteredData.length} results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Header - Simplified */}
            <div className="grid grid-cols-9 gap-4 p-4 bg-sandstone rounded-lg border border-gray-200">
              <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                User ID
              </div>
              <div className="col-span-2 text-[#2C2C2C] font-medium truncate">
                Name
              </div>
              <div className="col-span-2 text-[#2C2C2C] font-medium truncate">
                Email
              </div>
              <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                Type
              </div>
              <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                Progress
              </div>
              <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                Certificates
              </div>
              <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                Actions
              </div>
            </div>

            {/* Rows */}
            <div className="mt-2 space-y-2">
              {filteredData.map((item: any) => (
                <div
                  key={item.userId}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Primary Row - Basic Info Only */}
                  <div
                    className="grid grid-cols-9 gap-4 p-4 bg-white hover:bg-sandstone cursor-pointer transition-colors"
                    onClick={() => toggleRow(item.userId)}
                  >
                    <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                      {item.userId}
                    </div>
                    <div className="col-span-2 text-[#2C2C2C] truncate">
                      {item.firstName} {item.lastName}
                    </div>
                    <div className="col-span-2 text-[#2C2C2C] truncate">
                      {item.email}
                    </div>
                    <div className="col-span-1 text-[#2C2C2C]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(
                          item.frontlinerType
                        )}`}
                      >
                        {item.frontlinerType}
                      </span>
                    </div>
                    <div className="col-span-1 text-[#2C2C2C] truncate">
                      {item.overallProgress.toFixed(1)}%
                    </div>
                    <div className="col-span-1 text-[#2C2C2C] truncate">
                      {
                        [
                          item.alMidhyafCertificate,
                          item.adInformationCertificate,
                          item.generalVXSoftSkillsCertificate,
                          item.generalVXHardSkillsCertificate,
                          item.managerialCompetenciesCertificate,
                        ].filter(Boolean).length
                      }
                      /5
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      {expandedRows.has(item.userId) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Row - All Additional Details */}
                  {expandedRows.has(item.userId) && (
                    <div className="bg-sandstone border-t border-gray-200 p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">EID</div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.eid}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Phone Number
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.phoneNumber}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Asset
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.asset}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Asset Sub-Category
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.subAsset}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Organization
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.organization}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Sub-Organization
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.subOrganization || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-12 gap-4">
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Role Category
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.roleCategory}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">Role</div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.role}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Seniority
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.seniority}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            VX Points
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {item.vxPoints}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Registration Date
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {formatDate(item.registrationDate)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">
                            Last Login Date
                          </div>
                          <div className="text-[#2C2C2C] truncate">
                            {formatDate(item.lastLoginDate)}
                          </div>
                        </div>
                      </div>

                      {/* Certificates Section */}
                      <div className="mt-4">
                        <div className="text-xs text-gray-600 mb-2">
                          Certificate Status
                        </div>
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Award
                                className={`h-4 w-4 ${
                                  item.alMidhyafCertificate
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              />
                              <span className="text-[#2C2C2C] text-sm">
                                Al Midhyaf
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.alMidhyafCertificate
                                ? "Earned"
                                : "Not Earned"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Award
                                className={`h-4 w-4 ${
                                  item.adInformationCertificate
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              />
                              <span className="text-[#2C2C2C] text-sm">
                                AD Information
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.adInformationCertificate
                                ? "Earned"
                                : "Not Earned"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Award
                                className={`h-4 w-4 ${
                                  item.generalVXSoftSkillsCertificate
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              />
                              <span className="text-[#2C2C2C] text-sm">
                                Soft Skills
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.generalVXSoftSkillsCertificate
                                ? "Earned"
                                : "Not Earned"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Award
                                className={`h-4 w-4 ${
                                  item.generalVXHardSkillsCertificate
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              />
                              <span className="text-[#2C2C2C] text-sm">
                                Hard Skills
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.generalVXHardSkillsCertificate
                                ? "Earned"
                                : "Not Earned"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <Award
                                className={`h-4 w-4 ${
                                  item.managerialCompetenciesCertificate
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              />
                              <span className="text-[#2C2C2C] text-sm">
                                Managerial
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.managerialCompetenciesCertificate
                                ? "Earned"
                                : "Not Earned"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[#2C2C2C] text-sm font-medium">
                              Total:{" "}
                              {
                                [
                                  item.alMidhyafCertificate,
                                  item.adInformationCertificate,
                                  item.generalVXSoftSkillsCertificate,
                                  item.generalVXHardSkillsCertificate,
                                  item.managerialCompetenciesCertificate,
                                ].filter(Boolean).length
                              }
                              /5
                            </div>
                            <div className="text-xs text-gray-600">
                              Certificates Earned
                            </div>
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

export default CertificateReports;
