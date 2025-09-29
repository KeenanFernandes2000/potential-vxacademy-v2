import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Award, TrendingUp, Loader2, X } from "lucide-react";
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

interface Organization {
  id: string;
  name: string;
  asset: string;
  subAsset: string;
  subOrganization?: string;
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
  organizations: Organization[];
  generalStats: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalFrontliners: number;
    registeredFrontliners: number;
  };
}

const Organizations = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");

  // API object for organization operations
  const api = {
    async getOrganizationsReport(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/organizations`, {
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
        console.error("Failed to fetch organizations report:", error);
        throw error;
      }
    },
  };

  useEffect(() => {
    const fetchOrganizationsReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getOrganizationsReport(token);
        const reportData = response.data;

        setReportData(reportData);
        setFilteredOrganizations(reportData.organizations);
      } catch (err) {
        console.error("Failed to fetch organizations report:", err);
        setError("Failed to load organizations report data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationsReport();
  }, [token]);

  // Filter organizations based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.organizations;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter((org) => org.asset === selectedAsset);
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter((org) => org.subAsset === selectedSubAsset);
    }

    setFilteredOrganizations(filtered);
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

    let filtered = reportData.organizations;

    if (query) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.subAdminName.toLowerCase().includes(query.toLowerCase()) ||
          org.subAdminEmail.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredOrganizations(filtered);
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
  const tableData = filteredOrganizations.map((org) => ({
    "Org ID": org.id,
    "Organization Name": org.name,
    "Sub-Organization": org.subOrganization || "N/A",
    "Total Frontliners": org.totalFrontliners.toString(),
    "Registered Frontliners": org.registeredFrontliners.toString(),
    "Sub-Admin Name": org.subAdminName,
    "Sub-Admin Email": org.subAdminEmail,
    Asset: org.asset,
    "Sub-Asset": org.subAsset,
    Status: org.status,
    Created: formatDate(org.createdAt),
  }));

  if (loading) {
    return (
      <AdminPageLayout
        title="Organizations Report"
        description="Complete overview of all organizations in the system"
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
        title="Organizations Report"
        description="Complete overview of all organizations in the system"
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
        title="Organizations Report"
        description="Complete overview of all organizations in the system"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Organizations Report"
      description="Complete overview of all organizations in the system"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-dawn" />
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
                Active Organizations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.activeOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
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
                Registered Frontliners
              </CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.registeredFrontliners}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
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

        {/* Data Table */}
        <AdminTableLayout
          searchPlaceholder="Search organizations..."
          tableData={tableData}
          columns={[
            "Org ID",
            "Organization Name",
            "Sub-Organization",
            "Total Frontliners",
            "Registered Frontliners",
            "Sub-Admin Name",
            "Sub-Admin Email",
            "Asset",
            "Sub-Asset",
            "Status",
            "Created",
          ]}
          onSearch={handleSearch}
        />
      </div>
    </AdminPageLayout>
  );
};

export default Organizations;
