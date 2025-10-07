import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Award,
  TrendingUp,
  Building2,
  BookOpen,
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

interface SubAdmin {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  phoneNumber: string;
  jobTitle: string;
  asset: string;
  subAsset: string;
  organization: string;
  subOrganization: string;
  totalFrontliners: number;
  registeredFrontliners: number;
  registrationDate: string;
  lastLoginDate: string;
  status: "active" | "inactive";
  certificatesIssued: number;
  alMidhyafCompleted: number;
  totalVxPoints: number;
  overallProgress: number;
}

interface ReportData {
  filters: {
    assets: Array<{ value: string; label: string }>;
    subAssets: Array<{ value: string; label: string }>;
    organizations: Array<{ value: string; label: string }>;
  };
  dataTableColumns: string[];
  dataTableRows: SubAdmin[];
  generalStats: {
    totalFrontliners: number;
    totalOrganizations: number;
    totalCertificatesIssued: number;
    totalCompletedAlMidhyaf: number;
    totalVxPointsEarned: number;
    overallProgress: number;
  };
}

const SubAdmins = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredSubAdmins, setFilteredSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("all");

  // Asset and sub-asset state for dynamic filtering
  const [assets, setAssets] = useState<Array<{ id: number; name: string }>>([]);
  const [subAssets, setSubAssets] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingSubAssets, setIsLoadingSubAssets] = useState(false);

  // API object for sub-admin operations
  const api = {
    async getSubAdminsReport(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/sub-admins`, {
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
        console.error("Failed to fetch sub-admins report:", error);
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
    const fetchSubAdminsReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getSubAdminsReport(token);
        const reportData = response.data;

        setReportData(reportData);
        setFilteredSubAdmins(reportData.dataTableRows);
      } catch (err) {
        console.error("Failed to fetch sub-admins report:", err);
        setError("Failed to load sub-admins report data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubAdminsReport();
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
    // Reset sub-asset and organization selection when asset changes
    setSelectedSubAsset("all");
    setSelectedOrganization("all");
  }, [selectedAsset, assets]);

  // Handle sub-asset selection change
  useEffect(() => {
    // Reset organization selection when sub-asset changes
    setSelectedOrganization("all");
  }, [selectedSubAsset]);

  // Function to get filtered organizations based on selected asset and sub-asset
  const getFilteredOrganizations = () => {
    if (!reportData) return [];

    let filtered = reportData.dataTableRows;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.subAsset === selectedSubAsset
      );
    }

    // Get unique organizations from filtered data
    const uniqueOrganizations = Array.from(
      new Set(filtered.map((subAdmin) => subAdmin.organization))
    ).map((org) => ({ value: org, label: org }));

    return uniqueOrganizations;
  };

  // Filter sub-admins based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.subAsset === selectedSubAsset
      );
    }

    // Filter by organization
    if (selectedOrganization !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.organization === selectedOrganization
      );
    }

    setFilteredSubAdmins(filtered);
  }, [reportData, selectedAsset, selectedSubAsset, selectedOrganization]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAsset("all");
    setSelectedSubAsset("all");
    setSelectedOrganization("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedAsset !== "all" ||
    selectedSubAsset !== "all" ||
    selectedOrganization !== "all";

  // Handle search
  const handleSearch = (query: string) => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    if (query) {
      filtered = filtered.filter(
        (subAdmin) =>
          subAdmin.firstName.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.lastName.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.organization.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredSubAdmins(filtered);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      reportData.dataTableColumns,
      ...filteredSubAdmins.map((subAdmin) => [
        subAdmin.userId,
        subAdmin.firstName,
        subAdmin.lastName,
        subAdmin.email,
        subAdmin.eid,
        subAdmin.phoneNumber,
        subAdmin.asset,
        subAdmin.subAsset,
        subAdmin.organization,
        Array.isArray(subAdmin.subOrganization)
          ? subAdmin.subOrganization.join("; ")
          : (subAdmin.subOrganization || "N/A").toString().replace(/,/g, ";"),
        subAdmin.totalFrontliners.toString(),
        subAdmin.registeredFrontliners.toString(),
        formatDate(subAdmin.registrationDate),
        formatDate(subAdmin.lastLoginDate),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sub-admins-report.csv";
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
  const tableData = filteredSubAdmins.map((subAdmin) => ({
    "User ID": subAdmin.userId,
    "First Name": subAdmin.firstName,
    "Last Name": subAdmin.lastName,
    "Email Address": subAdmin.email,
    EID: subAdmin.eid,
    "Phone Number": subAdmin.phoneNumber,
    Asset: subAdmin.asset,
    "Asset Sub-Category": subAdmin.subAsset,
    Organization: subAdmin.organization,
    "Sub-Organization": subAdmin.subOrganization || "N/A",
    "Total Frontliners": subAdmin.totalFrontliners.toString(),
    "Registered Frontliners": subAdmin.registeredFrontliners.toString(),
    "Registration Date": formatDate(subAdmin.registrationDate),
    "Last Login Date": formatDate(subAdmin.lastLoginDate),
    "Remind Sub-Admin": "Action Button",
  }));

  if (loading) {
    return (
      <AdminPageLayout
        title="Sub-Admins Report"
        description="Complete overview of all sub-administrators in the system"
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
        title="Sub-Admins Report"
        description="Complete overview of all sub-administrators in the system"
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
        title="Sub-Admins Report"
        description="Complete overview of all sub-administrators in the system"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Sub-Admins Report"
      description="Complete overview of all sub-administrators in the system"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
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
              <Building2 className="h-4 w-4 text-blue-400" />
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
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCompletedAlMidhyaf}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
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
              <TrendingUp className="h-4 w-4 text-dawn" />
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
          <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="organizationFilter" className="text-[#2C2C2C]">
                Organization
              </Label>
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
                disabled={!reportData}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {getFilteredOrganizations().map((org) => (
                    <SelectItem key={org.value} value={org.value}>
                      {org.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/30"
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
          searchPlaceholder="Search sub-admins..."
          tableData={tableData}
          columns={reportData.dataTableColumns}
          onSearch={handleSearch}
        />
      </div>
    </AdminPageLayout>
  );
};

export default SubAdmins;
