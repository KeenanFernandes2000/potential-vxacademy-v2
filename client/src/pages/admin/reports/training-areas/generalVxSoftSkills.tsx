import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Filter,
  Download,
  Eye,
  Loader2,
  ChevronDown,
  X,
  Building2,
  Award,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminTableLayout from "@/components/adminTableLayout";

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

const GeneralVxSoftSkills = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<TrainingAreaReportData | null>(
    null
  );
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");
  const [selectedRoleCategory, setSelectedRoleCategory] =
    useState<string>("all");

  // API object for training area operations
  const api = {
    async getTrainingAreaReport(token: string, trainingAreaId: number) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/reports/training-area/${trainingAreaId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch training area report:", error);
        throw error;
      }
    },
  };

  useEffect(() => {
    const fetchTrainingAreaReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getTrainingAreaReport(token, 4); // General VX Soft Skills training area ID
        const reportData = response.data;

        setReportData(reportData);
        setFilteredUsers(reportData.dataTableRows);
      } catch (err) {
        console.error("Failed to fetch training area report:", err);
        setError("Failed to load training area report data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingAreaReport();
  }, [token]);

  // Filter users based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    // Filter by organization
    if (selectedOrganization !== "all") {
      filtered = filtered.filter(
        (user) => user.organization === selectedOrganization
      );
    }

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter((user) => user.asset === selectedAsset);
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter((user) => user.subAsset === selectedSubAsset);
    }

    // Filter by role category
    if (selectedRoleCategory !== "all") {
      filtered = filtered.filter(
        (user) => user.roleCategory === selectedRoleCategory
      );
    }

    setFilteredUsers(filtered);
  }, [
    reportData,
    selectedOrganization,
    selectedAsset,
    selectedSubAsset,
    selectedRoleCategory,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedOrganization("all");
    setSelectedAsset("all");
    setSelectedSubAsset("all");
    setSelectedRoleCategory("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedOrganization !== "all" ||
    selectedAsset !== "all" ||
    selectedSubAsset !== "all" ||
    selectedRoleCategory !== "all";

  // Handle search
  const handleSearch = (query: string) => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.organization.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string) => {
    if (dateString === "N/A" || !dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // Prepare table data for AdminTableLayout
  const tableData = filteredUsers.map((user) => ({
    "User ID": user.userId,
    "First Name": user.firstName,
    "Last Name": user.lastName,
    "Email Address": user.email,
    EID: user.eid || "N/A",
    "Phone Number": user.phoneNumber || "N/A",
    Asset: user.asset,
    "Sub-Asset": user.subAsset,
    Organization: user.organization,
    "Sub-Organization": Array.isArray(user.subOrganization)
      ? user.subOrganization?.join(", ")
      : user.subOrganization ?? "N/A",
    "Role Category": user.roleCategory,
    Role: user.role,
    Seniority: user.seniority,
    "Frontliner Type": user.frontlinerType,
    "Al Midhyaf Progress": user.alMidhyafOverallProgress + "%",
    "Module 1 Progress": user.module1Progress + "%",
    "VX Points": user.vxPoints,
    "Registration Date": formatDate(user.registrationDate),
    "Last Login Date": formatDate(user.lastLoginDate),
  }));

  if (loading) {
    return (
      <AdminPageLayout
        title="General VX Soft Skills Report"
        description="Comprehensive report on General VX Soft Skills training participation and completion"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-dawn animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout
        title="General VX Soft Skills Report"
        description="Comprehensive report on General VX Soft Skills training participation and completion"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                The General VX Soft Skills training area is currently under
                development.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium text-sm">
                  This feature will be available soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPageLayout>
    );
  }

  if (!reportData) {
    return (
      <AdminPageLayout
        title="General VX Soft Skills Report"
        description="Comprehensive report on General VX Soft Skills training participation and completion"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">Coming Soon</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="General VX Soft Skills Report"
      description="Comprehensive report on General VX Soft Skills training participation and completion"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Certificates Issued
              </CardTitle>
              <Award className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalVxPointsEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total who completed Al Midyaf
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCompletedAlMidhyaf}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.alMidhyafOverallProgress.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationFilter" className="text-[#2C2C2C]">
                Organization
              </Label>
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select organization" />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetFilter" className="text-[#2C2C2C]">
                Asset
              </Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select asset" />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="subAssetFilter" className="text-[#2C2C2C]">
                Sub-Asset
              </Label>
              <Select
                value={selectedSubAsset}
                onValueChange={setSelectedSubAsset}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select sub-asset" />
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleCategoryFilter" className="text-[#2C2C2C]">
                Role Category
              </Label>
              <Select
                value={selectedRoleCategory}
                onValueChange={setSelectedRoleCategory}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select role category" />
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
            </div>
          </div>
        </div>

        {/* Data Table */}
        <AdminTableLayout
          searchPlaceholder="Search users..."
          tableData={tableData}
          columns={reportData.dataTableColumns}
          onSearch={handleSearch}
        />
      </div>
    </AdminPageLayout>
  );
};

export default GeneralVxSoftSkills;
