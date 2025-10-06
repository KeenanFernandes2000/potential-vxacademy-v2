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
  X,
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

  // Asset and sub-asset state for dynamic filtering
  const [assets, setAssets] = useState<Array<{ id: number; name: string }>>([]);
  const [subAssets, setSubAssets] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingSubAssets, setIsLoadingSubAssets] = useState(false);

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

    async getAllAssets() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/assets`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching assets:", error);
        throw error;
      }
    },

    async getSubAssetsByAssetId(assetId: number) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/users/sub-assets/by-asset/${assetId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching sub-assets:", error);
        throw error;
      }
    },
  };

  // Function to fetch assets
  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await api.getAllAssets();
      if (response.success && response.data) {
        setAssets(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Function to fetch sub-assets by asset ID
  const fetchSubAssets = async (assetId: number) => {
    if (!assetId) {
      setSubAssets([]);
      return;
    }

    setIsLoadingSubAssets(true);
    try {
      const response = await api.getSubAssetsByAssetId(assetId);
      if (response.success && response.data) {
        setSubAssets(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch sub-assets:", error);
      setSubAssets([]);
    } finally {
      setIsLoadingSubAssets(false);
    }
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
    fetchAssets();
  }, [token]);

  // Handle asset selection change
  useEffect(() => {
    if (selectedAsset !== "all") {
      // Find the asset ID from the assets array
      const asset = assets.find((a) => a.name === selectedAsset);
      if (asset) {
        fetchSubAssets(asset.id);
      }
    } else {
      setSubAssets([]);
    }
    // Reset sub-asset selection when asset changes
    setSelectedSubAsset("all");
  }, [selectedAsset, assets]);

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

  // Handle CSV export
  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      [
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
      ],
      ...filteredOrganizations.map((org) => [
        org.id,
        org.name,
        (() => {
          if (!org.subOrganization || org.subOrganization === "N/A")
            return "N/A";
          try {
            const parsed = JSON.parse(org.subOrganization);

            // If it's an array, join with semicolons
            if (Array.isArray(parsed)) {
              return parsed.join("; ");
            }

            // If it's an object, extract values and join with semicolons
            if (typeof parsed === "object" && parsed !== null) {
              return Object.values(parsed).join("; ");
            }

            // If it's a string or other type, return as is
            return org.subOrganization;
          } catch (error) {
            console.log("CSV JSON parse error: ", error);
            // If parsing fails, try to clean up the string manually
            let cleaned = org.subOrganization;

            // Handle the specific format: {"value1","value2","value3"}
            if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
              // Remove outer curly braces
              cleaned = cleaned.slice(1, -1);
              // Split by comma and clean each item
              const items = cleaned
                .split(",")
                .map((item) => item.trim().replace(/"/g, "").replace(/'/g, ""));
              return items.join("; ");
            }

            // Fallback: just remove quotes if no curly braces
            cleaned = cleaned.replace(/"/g, "");
            return cleaned;
          }
        })(),
        org.totalFrontliners.toString(),
        org.registeredFrontliners.toString(),
        org.subAdminName,
        org.subAdminEmail,
        org.asset,
        org.subAsset,
        org.status,
        formatDate(org.createdAt),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organizations-report.csv";
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
  const tableData = filteredOrganizations.map((org) => ({
    "Org ID": org.id,
    "Organization Name": org.name,
    "Sub-Organization": (() => {
      if (!org.subOrganization || org.subOrganization === "N/A") return "N/A";
      console.log("Org Sub-Organization: ", org.subOrganization);
      try {
        // Parse JSON string and extract values
        const parsed = JSON.parse(org.subOrganization);
        console.log("Parsed: ", parsed);

        // If it's an array, join with commas
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }

        // If it's an object, extract values and join with commas
        if (typeof parsed === "object" && parsed !== null) {
          return Object.values(parsed).join(", ");
        }

        // If it's a string or other type, return as is
        return org.subOrganization;
      } catch (error) {
        console.log("JSON parse error: ", error);
        // If parsing fails, try to clean up the string manually
        let cleaned = org.subOrganization;

        // Handle the specific format: {"value1","value2","value3"}
        if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
          // Remove outer curly braces
          cleaned = cleaned.slice(1, -1);
          // Split by comma and clean each item
          const items = cleaned
            .split(",")
            .map((item) => item.trim().replace(/"/g, "").replace(/'/g, ""));
          return items.join(", ");
        }

        // Fallback: just remove quotes if no curly braces
        cleaned = cleaned.replace(/"/g, "");
        return cleaned;
      }
    })(),
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
              <div className="text-5xl font-bold text-[#2C2C2C]">
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
              <div className="text-5xl font-bold text-[#2C2C2C]">
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
              <div className="text-5xl font-bold text-[#2C2C2C]">
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
              <div className="text-5xl font-bold text-[#2C2C2C]">
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
                  {isLoadingAssets ? (
                    <SelectItem value="loading" disabled>
                      Loading assets...
                    </SelectItem>
                  ) : (
                    assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.name}>
                        {asset.name}
                      </SelectItem>
                    ))
                  )}
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
                disabled={selectedAsset === "all" || isLoadingSubAssets}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Categories</SelectItem>
                  {isLoadingSubAssets ? (
                    <SelectItem value="loading" disabled>
                      Loading sub-assets...
                    </SelectItem>
                  ) : (
                    subAssets.map((subAsset) => (
                      <SelectItem key={subAsset.id} value={subAsset.name}>
                        {subAsset.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
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
