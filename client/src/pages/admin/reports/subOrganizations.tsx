import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  Loader2,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import AdminTableLayout from "@/components/adminTableLayout";

interface SubOrganization {
  id: string;
  name: string;
  organization: string;
  asset: string;
  subAsset: string;
  totalFrontliners: number;
  registeredFrontliners: number;
  subAdminName: string;
  subAdminEmail: string;
  createdAt: string;
  status: "active" | "inactive";
}

interface ReportData {
  filters: {
    assets: Array<{ value: string; label: string }>;
    subAssets: Array<{ value: string; label: string }>;
  };
  subOrganizations: SubOrganization[];
  generalStats: {
    totalSubOrganizations: number;
    activeSubOrganizations: number;
    totalFrontliners: number;
    registeredFrontliners: number;
    totalCertificatesIssued: number;
    totalCompletedAlMidhyaf: number;
    totalVxPointsEarned: number;
    overallProgress: number;
  };
}

const SubOrganizations = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredSubOrganizations, setFilteredSubOrganizations] = useState<
    SubOrganization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");

  // API object for sub-organization operations
  const api = {
    async getSubOrganizationsReport(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/reports/sub-organizations`,
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
        console.error("Failed to fetch sub-organizations report:", error);
        throw error;
      }
    },
  };

  useEffect(() => {
    const fetchSubOrganizationsReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getSubOrganizationsReport(token);
        const reportData = response.data;

        setReportData(reportData);
        setFilteredSubOrganizations(reportData.subOrganizations);
      } catch (err) {
        console.error("Failed to fetch sub-organizations report:", err);
        setError("Failed to load sub-organizations report data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubOrganizationsReport();
  }, [token]);

  // Filter sub-organizations based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.subOrganizations;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter((subOrg) => subOrg.asset === selectedAsset);
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (subOrg) => subOrg.subAsset === selectedSubAsset
      );
    }

    setFilteredSubOrganizations(filtered);
  }, [reportData, selectedAsset, selectedSubAsset]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAsset("all");
    setSelectedSubAsset("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedAsset !== "all" || selectedSubAsset !== "all";

  // Handle search
  const handleSearch = (query: string) => {
    if (!reportData) return;

    let filtered = reportData.subOrganizations;

    if (query) {
      filtered = filtered.filter(
        (subOrg) =>
          subOrg.name.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.organization.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.subAdminName.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.subAdminEmail.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredSubOrganizations(filtered);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      [
        "Sub-Org ID",
        "Sub-Organization Name",
        "Organization",
        "Asset",
        "Asset Sub-Category",
        "Total Frontliners",
        "Registered Frontliners",
        "Sub-Admin Name",
        "Sub-Admin Email",
        "Status",
        "Created",
      ],
      ...filteredSubOrganizations.map((subOrg) => [
        subOrg.id,
        subOrg.name,
        subOrg.organization,
        subOrg.asset,
        subOrg.subAsset,
        subOrg.totalFrontliners.toString(),
        subOrg.registeredFrontliners.toString(),
        subOrg.subAdminName,
        subOrg.subAdminEmail,
        subOrg.status,
        formatDate(subOrg.createdAt),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sub-organizations-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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
  const tableData = filteredSubOrganizations.map((subOrg) => ({
    "Sub-Org ID": subOrg.id,
    "Sub-Organization Name": subOrg.name,
    Organization: subOrg.organization,
    Asset: subOrg.asset,
    "Asset Sub-Category": subOrg.subAsset,
    "Total Frontliners": subOrg.totalFrontliners.toString(),
    "Registered Frontliners": subOrg.registeredFrontliners.toString(),
    "Sub-Admin Name": subOrg.subAdminName,
    "Sub-Admin Email": subOrg.subAdminEmail,
    Status: subOrg.status,
    Created: formatDate(subOrg.createdAt),
  }));

  if (loading) {
    return (
      <AdminPageLayout
        title="Sub-Organizations Report"
        description="Complete overview of all sub-organizations in the system"
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
        title="Sub-Organizations Report"
        description="Complete overview of all sub-organizations in the system"
      >
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </AdminPageLayout>
    );
  }

  if (!reportData) {
    return (
      <AdminPageLayout
        title="Sub-Organizations Report"
        description="Complete overview of all sub-organizations in the system"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Sub-Organizations Report"
      description="Complete overview of all sub-organizations in the system"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Number of Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
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
                {reportData.generalStats.totalSubOrganizations}
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
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total who completed Al Midyaf
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCompletedAlMidhyaf}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalVxPointsEarned}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.overallProgress}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-dawn mb-4">Filters:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Asset Sub-Category
              </Label>
              <Select
                value={selectedSubAsset}
                onValueChange={setSelectedSubAsset}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Categories</SelectItem>
                  {reportData.filters.subAssets.map((subAsset) => (
                    <SelectItem key={subAsset.value} value={subAsset.value}>
                      {subAsset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleExportCSV}
            className="bg-dawn hover:bg-[#B85A1A] text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Data Table */}
        <AdminTableLayout
          searchPlaceholder="Search sub-organizations..."
          tableData={tableData}
          columns={[
            "Sub-Org ID",
            "Sub-Organization Name",
            "Organization",
            "Asset",
            "Asset Sub-Category",
            "Total Frontliners",
            "Registered Frontliners",
            "Sub-Admin Name",
            "Sub-Admin Email",
            "Status",
            "Created",
          ]}
          onSearch={handleSearch}
        />
      </div>
    </AdminPageLayout>
  );
};

export default SubOrganizations;
