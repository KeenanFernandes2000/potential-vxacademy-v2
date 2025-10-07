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
  Users,
  Search,
  Building2,
  Calendar,
  Award,
  BookOpen,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

interface Frontliner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  phoneNumber: string;
  asset: string;
  subAsset: string;
  organization: string;
  subOrganization?: string;
  roleCategory: string;
  role: string;
  seniority: string;
  overallProgress: number;
  alMidhyaf: number;
  adInformation: number;
  generalVxSoftSkills: number;
  generalVxHardSkills: number;
  managerialCompetencies: number;
  vxPoints: number;
  registrationDate: string;
  lastLoginDate: string;
  status: "active" | "inactive";
}

interface ReportData {
  filters: {
    assets: Array<{ value: string; label: string }>;
    subAssets: Array<{ value: string; label: string }>;
    organizations: Array<{ value: string; label: string }>;
    subOrganizations: Array<{ value: string; label: string }>;
    roleCategories: Array<{ value: string; label: string }>;
  };
  frontliners: Frontliner[];
  generalStats: {
    totalFrontliners: number;
    activeFrontliners: number;
    totalVxPoints: number;
    averageAlMidhyaf: number;
    averageProgress: number;
    totalOrganizations: number;
  };
}

const Frontliners = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredFrontliners, setFilteredFrontliners] = useState<Frontliner[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");
  const [selectedSubOrganization, setSelectedSubOrganization] =
    useState<string>("all");
  const [selectedRoleCategory, setSelectedRoleCategory] =
    useState<string>("all");
  const [selectedProgress, setSelectedProgress] = useState<string>("all");

  // Asset and sub-asset state for dynamic filtering
  const [assets, setAssets] = useState<Array<{ id: number; name: string }>>([]);
  const [subAssets, setSubAssets] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingSubAssets, setIsLoadingSubAssets] = useState(false);

  // Comprehensive user details state
  const [comprehensiveUserData, setComprehensiveUserData] = useState<any>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // API object for frontliner operations
  const api = {
    async getFrontlinersReport(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/frontliners`, {
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
        console.error("Failed to fetch frontliners report:", error);
        throw error;
      }
    },

    async getUserComprehensiveDetails(userId: string, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/users/${userId}/comprehensive-details`,
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
        console.error("Failed to fetch comprehensive user details:", error);
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
    const fetchFrontlinersReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getFrontlinersReport(token);
        const reportData = response.data;

        setReportData(reportData);
        setFilteredFrontliners(reportData.frontliners);
      } catch (err) {
        console.error("Failed to fetch frontliners report:", err);
        setError("Failed to load frontliners report data");
      } finally {
        setLoading(false);
      }
    };

    fetchFrontlinersReport();
    fetchAssets();
  }, [token]);

  // Handler for viewing comprehensive user details
  const handleViewUserDetails = async (userId: string) => {
    if (!token) return;

    setSelectedUserId(userId);
    setShowUserDetailsModal(true);

    try {
      setLoadingUserDetails(true);
      const response = await api.getUserComprehensiveDetails(userId, token);
      setComprehensiveUserData(response.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      setError("Failed to load user details");
    } finally {
      setLoadingUserDetails(false);
    }
  };

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
    // Reset sub-asset, organization, and sub-organization selection when asset changes
    setSelectedSubAsset("all");
    setOrganizationFilter("all");
    setSelectedSubOrganization("all");
  }, [selectedAsset, assets]);

  // Handle sub-asset selection change
  useEffect(() => {
    // Reset organization and sub-organization selection when sub-asset changes
    setOrganizationFilter("all");
    setSelectedSubOrganization("all");
  }, [selectedSubAsset]);

  // Handle organization selection change
  useEffect(() => {
    // Reset sub-organization selection when organization changes
    setSelectedSubOrganization("all");
  }, [organizationFilter]);

  // Function to get filtered organizations based on selected asset and sub-asset
  const getFilteredOrganizations = () => {
    if (!reportData) return [];

    let filtered = reportData.frontliners;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.subAsset === selectedSubAsset
      );
    }

    // Get unique organizations from filtered data
    const uniqueOrganizations = Array.from(
      new Set(filtered.map((frontliner) => frontliner.organization))
    ).map((org) => ({ value: org, label: org }));

    return uniqueOrganizations;
  };

  // Function to get filtered sub-organizations based on selected asset, sub-asset, and organization
  const getFilteredSubOrganizations = () => {
    if (!reportData) return [];

    let filtered = reportData.frontliners;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.subAsset === selectedSubAsset
      );
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.organization === organizationFilter
      );
    }

    // Get unique sub-organizations from filtered data
    const uniqueSubOrganizations = Array.from(
      new Set(
        filtered
          .map((frontliner) => frontliner.subOrganization)
          .filter((subOrg) => subOrg && subOrg !== "N/A")
      )
    ).map((subOrg) => ({ value: subOrg, label: subOrg }));

    return uniqueSubOrganizations;
  };

  // Filter frontliners based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.frontliners;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.subAsset === selectedSubAsset
      );
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.organization === organizationFilter
      );
    }

    // Filter by sub-organization
    if (selectedSubOrganization !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.subOrganization === selectedSubOrganization
      );
    }

    // Filter by role category
    if (selectedRoleCategory !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.roleCategory === selectedRoleCategory
      );
    }

    // Filter by progress range
    if (selectedProgress !== "all") {
      filtered = filtered.filter((frontliner) => {
        switch (selectedProgress) {
          case "0-25":
            return (
              frontliner.overallProgress >= 0 &&
              frontliner.overallProgress <= 25
            );
          case "26-50":
            return (
              frontliner.overallProgress >= 26 &&
              frontliner.overallProgress <= 50
            );
          case "51-75":
            return (
              frontliner.overallProgress >= 51 &&
              frontliner.overallProgress <= 75
            );
          case "76-100":
            return (
              frontliner.overallProgress >= 76 &&
              frontliner.overallProgress <= 100
            );
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (frontliner) =>
          frontliner.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          frontliner.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          frontliner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          frontliner.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          frontliner.organization
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          frontliner.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.status === statusFilter
      );
    }

    setFilteredFrontliners(filtered);
  }, [
    reportData,
    selectedAsset,
    selectedSubAsset,
    organizationFilter,
    selectedSubOrganization,
    selectedRoleCategory,
    selectedProgress,
    searchTerm,
    statusFilter,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAsset("all");
    setSelectedSubAsset("all");
    setOrganizationFilter("all");
    setSelectedSubOrganization("all");
    setSelectedRoleCategory("all");
    setSelectedProgress("all");
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedAsset !== "all" ||
    selectedSubAsset !== "all" ||
    organizationFilter !== "all" ||
    selectedSubOrganization !== "all" ||
    selectedRoleCategory !== "all" ||
    selectedProgress !== "all" ||
    searchTerm !== "" ||
    statusFilter !== "all";

  // Toggle accordion row
  const toggleRow = (frontlinerId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(frontlinerId)) {
        newSet.delete(frontlinerId);
      } else {
        newSet.add(frontlinerId);
      }
      return newSet;
    });
  };

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "User ID",
        "First Name",
        "Last Name",
        "Email Address",
        "EID",
        "Phone Number",
        "Asset",
        "Asset Sub-Category",
        "Organization",
        "Sub-Organization",
        "Role Category",
        "Role",
        "Seniority",
        "Overall Progress",
        "Al Midhyaf",
        "AD Information",
        "General VX Soft Skills",
        "General VX Hard Skills",
        "Managerial Competencies",
        "VX Points",
        "Registration Date",
        "Last Login Date",
        "Status",
      ],
      ...filteredFrontliners.map((frontliner) => [
        frontliner.id,
        frontliner.firstName,
        frontliner.lastName,
        frontliner.email,
        frontliner.eid,
        frontliner.phoneNumber,
        frontliner.asset,
        frontliner.subAsset,
        frontliner.organization,
        Array.isArray(frontliner.subOrganization)
          ? frontliner.subOrganization.join("; ")
          : (frontliner.subOrganization || "N/A").toString().replace(/,/g, ";"),
        frontliner.roleCategory,
        frontliner.role,
        frontliner.seniority,
        `${frontliner.overallProgress}%`,
        `${frontliner.alMidhyaf}%`,
        `${frontliner.adInformation}%`,
        `${frontliner.generalVxSoftSkills}%`,
        `${frontliner.generalVxHardSkills}%`,
        `${frontliner.managerialCompetencies}%`,
        frontliner.vxPoints.toString(),
        new Date(frontliner.registrationDate).toLocaleDateString(),
        new Date(frontliner.lastLoginDate).toLocaleDateString(),
        frontliner.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "frontliners-report.csv";
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

  const formatProgress = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  if (loading) {
    return (
      <AdminPageLayout
        title="Frontliners Report"
        description="Complete overview of all frontliner users in the system"
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
        title="Frontliners Report"
        description="Complete overview of all frontliner users in the system"
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
        title="Frontliners Report"
        description="Complete overview of all frontliner users in the system"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Frontliners Report"
      description="Complete overview of all frontliner users in the system"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Frontliners
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
                Active Frontliners
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.activeFrontliners}
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalVxPoints.toLocaleString()}
              </div>
            </CardContent>
          </Card> */}

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Al Midhyaf Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.averageAlMidhyaf}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Average Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.averageProgress}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalOrganizations}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={organizationFilter}
                onValueChange={setOrganizationFilter}
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
            <div className="space-y-2">
              <Label htmlFor="subOrganizationFilter" className="text-[#2C2C2C]">
                Sub-Organization
              </Label>
              <Select
                value={selectedSubOrganization}
                onValueChange={setSelectedSubOrganization}
                disabled={!reportData}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select sub-organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Organizations</SelectItem>
                  {getFilteredSubOrganizations().map((subOrg) => (
                    <SelectItem key={subOrg.value} value={subOrg.value || ""}>
                      {subOrg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
            <div className="space-y-2">
              <Label htmlFor="progressFilter" className="text-[#2C2C2C]">
                Overall Progress
              </Label>
              <Select
                value={selectedProgress}
                onValueChange={setSelectedProgress}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select progress range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress</SelectItem>
                  <SelectItem value="0-25">0-25%</SelectItem>
                  <SelectItem value="26-50">26-50%</SelectItem>
                  <SelectItem value="51-75">51-75%</SelectItem>
                  <SelectItem value="76-100">76-100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter" className="text-[#2C2C2C]">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchFilter" className="text-[#2C2C2C]">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C2C2C]/60 h-4 w-4" />
                <Input
                  placeholder="Search frontliners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#2C2C2C]/60"
                />
              </div>
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
            onClick={handleExport}
            className="bg-dawn hover:bg-[#B85A1A] text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Frontliners Accordion Table */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Users className="h-5 w-5 text-dawn" />
              Frontliners List ({filteredFrontliners.length} results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-dawn animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
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
                    EID
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Asset
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Organization
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Role
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Progress
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Status
                  </div>
                  <div className="col-span-1 text-[#2C2C2C] font-medium truncate">
                    Actions
                  </div>
                </div>

                {/* Accordion Rows */}
                {filteredFrontliners.map((frontliner) => (
                  <div
                    key={frontliner.id}
                    className="border border-white/10 rounded-lg overflow-hidden"
                  >
                    {/* Primary Row */}
                    <div
                      className="grid grid-cols-12 gap-4 p-4 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => toggleRow(frontliner.id)}
                    >
                      <div
                        className="col-span-1 text-[#2C2C2C] font-medium truncate"
                        title={frontliner.id}
                      >
                        {frontliner.id}
                      </div>
                      <div
                        className="col-span-2 text-[#2C2C2C] truncate"
                        title={`${frontliner.firstName} ${frontliner.lastName}`}
                      >
                        {frontliner.firstName} {frontliner.lastName}
                      </div>
                      <div
                        className="col-span-2 text-[#2C2C2C] truncate"
                        title={frontliner.email}
                      >
                        {frontliner.email}
                      </div>
                      <div
                        className="col-span-1 text-[#2C2C2C] truncate"
                        title={frontliner.eid}
                      >
                        {frontliner.eid}
                      </div>
                      <div
                        className="col-span-1 text-[#2C2C2C] truncate"
                        title={frontliner.asset}
                      >
                        {frontliner.asset}
                      </div>
                      <div
                        className="col-span-1 text-[#2C2C2C] truncate"
                        title={frontliner.organization}
                      >
                        {frontliner.organization}
                      </div>
                      <div
                        className="col-span-1 text-[#2C2C2C] truncate"
                        title={frontliner.role}
                      >
                        {frontliner.role}
                      </div>
                      <div className="col-span-1 text-[#2C2C2C]">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-white/20 rounded-full h-2">
                            <div
                              className="bg-[#00d8cc] h-2 rounded-full"
                              style={{
                                width: `${formatProgress(
                                  frontliner.overallProgress
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {formatProgress(frontliner.overallProgress)}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 text-[#2C2C2C]">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            frontliner.status === "active"
                              ? "bg-green-500/20 text-black"
                              : "bg-red-500/20 text-black"
                          }`}
                        >
                          {frontliner.status}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center gap-2">
                        {expandedRows.has(frontliner.id) ? (
                          <ChevronDown className="h-4 w-4 text-[#2C2C2C]/60" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#2C2C2C]/60" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewUserDetails(frontliner.id);
                          }}
                          disabled={loadingUserDetails}
                        >
                          {loadingUserDetails ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Row */}
                    {expandedRows.has(frontliner.id) && (
                      <div className="bg-white/5 border-t border-white/10 p-4">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Phone Number
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.phoneNumber}
                            >
                              {frontliner.phoneNumber}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Asset Sub-Category
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.subAsset}
                            >
                              {frontliner.subAsset}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Sub-Organization
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.subOrganization || "N/A"}
                            >
                              {frontliner.subOrganization || "N/A"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Role Category
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.roleCategory}
                            >
                              {frontliner.roleCategory}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Seniority
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.seniority}
                            >
                              {frontliner.seniority}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              VX Points
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={frontliner.vxPoints.toLocaleString()}
                            >
                              {frontliner.vxPoints.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Al Midhyaf
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${formatProgress(
                                      frontliner.alMidhyaf
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#2C2C2C]">
                                {formatProgress(frontliner.alMidhyaf)}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              AD Information
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${formatProgress(
                                      frontliner.adInformation
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#2C2C2C]">
                                {formatProgress(frontliner.adInformation)}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              VX Soft Skills
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{
                                    width: `${formatProgress(
                                      frontliner.generalVxSoftSkills
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#2C2C2C]">
                                {formatProgress(frontliner.generalVxSoftSkills)}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              VX Hard Skills
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{
                                    width: `${formatProgress(
                                      frontliner.generalVxHardSkills
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#2C2C2C]">
                                {formatProgress(frontliner.generalVxHardSkills)}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Managerial Competencies
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{
                                    width: `${formatProgress(
                                      frontliner.managerialCompetencies
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#2C2C2C]">
                                {formatProgress(
                                  frontliner.managerialCompetencies
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-[#2C2C2C]/60 mb-1">
                              Registration Date
                            </div>
                            <div
                              className="text-[#2C2C2C] truncate"
                              title={formatDate(frontliner.registrationDate)}
                            >
                              {formatDate(frontliner.registrationDate)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs text-[#2C2C2C]/60 mb-1">
                            Last Login Date
                          </div>
                          <div
                            className="text-[#2C2C2C] truncate"
                            title={formatDate(frontliner.lastLoginDate)}
                          >
                            {formatDate(frontliner.lastLoginDate)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive User Details Dialog */}
      <Dialog
        open={showUserDetailsModal}
        onOpenChange={setShowUserDetailsModal}
      >
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#2C2C2C]">
              Comprehensive User Details
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {loadingUserDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#2C2C2C] animate-spin" />
                <span className="ml-2 text-[#2C2C2C]">
                  Loading user details...
                </span>
              </div>
            ) : comprehensiveUserData ? (
              <>
                {/* Basic User Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#2C2C2C]/60">Name</label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.firstName}{" "}
                        {comprehensiveUserData.user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#2C2C2C]/60">Email</label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#2C2C2C]/60">
                        User Type
                      </label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.userType}
                      </p>
                    </div>
                    {/* <div>
                      <label className="text-sm text-[#2C2C2C]/60">
                        XP Points
                      </label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.xp}
                      </p>
                    </div> */}
                    <div>
                      <label className="text-sm text-[#2C2C2C]/60">
                        Organization
                      </label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.organization}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#2C2C2C]/60">Asset</label>
                      <p className="text-[#2C2C2C]">
                        {comprehensiveUserData.user.asset}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Admin or Normal User Details */}
                {comprehensiveUserData.subAdminDetails && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                      Sub-Admin Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Job Title
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.subAdminDetails.jobTitle}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">EID</label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.subAdminDetails.eid}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Phone Number
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.subAdminDetails.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Total Frontliners
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.subAdminDetails
                            .totalFrontliners || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {comprehensiveUserData.normalUserDetails && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                      Normal User Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Role Category
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.roleCategory}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Role
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Seniority
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.seniority}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">EID</label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.eid}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Phone Number
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#2C2C2C]/60">
                          Existing User
                        </label>
                        <p className="text-[#2C2C2C]">
                          {comprehensiveUserData.normalUserDetails.existing
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                    Training Progress
                  </h3>

                  {/* Training Area Progress */}
                  {comprehensiveUserData.progress.trainingAreaProgress.length >
                    0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-[#2C2C2C] mb-2">
                        Training Areas
                      </h4>
                      <div className="space-y-2">
                        {comprehensiveUserData.progress.trainingAreaProgress.map(
                          (progress: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-[#2C2C2C]">
                                  {progress.trainingAreaName}
                                </span>
                                <span className="text-sm text-[#2C2C2C]/60">
                                  {progress.completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${progress.completionPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Course Progress */}
                  {comprehensiveUserData.progress.courseProgress.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-[#2C2C2C] mb-2">
                        Courses
                      </h4>
                      <div className="space-y-2">
                        {comprehensiveUserData.progress.courseProgress.map(
                          (progress: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-[#2C2C2C]">
                                  {progress.courseName}
                                </span>
                                <span className="text-sm text-[#2C2C2C]/60">
                                  {progress.completionPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${progress.completionPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assessment Attempts */}
                {comprehensiveUserData.assessments.attempts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                      Assessment Attempts
                    </h3>
                    <div className="space-y-2">
                      {comprehensiveUserData.assessments.attempts.map(
                        (attempt: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-[#2C2C2C]">
                                Assessment #{attempt.assessmentId}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#2C2C2C]/60">
                                  Score: {attempt.score}
                                </span>
                                <span
                                  className={`text-sm ${
                                    attempt.passed
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {attempt.passed ? "Passed" : "Failed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Certificates */}
                {comprehensiveUserData.gamification.certificates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                      Certificates
                    </h3>
                    <div className="space-y-2">
                      {comprehensiveUserData.gamification.certificates.map(
                        (cert: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-[#2C2C2C]">
                                Certificate #{cert.certificateNumber}
                              </span>
                              <span className="text-sm text-[#2C2C2C]/60">
                                {cert.status}
                              </span>
                            </div>
                            <div className="text-xs text-[#2C2C2C]/60 mt-1">
                              Issued:{" "}
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Badges */}
                {comprehensiveUserData.gamification.badges.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-[#2C2C2C] mb-4">
                      Badges
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {comprehensiveUserData.gamification.badges.map(
                        (badge: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="text-[#2C2C2C] font-medium">
                              {badge.badgeName}
                            </div>
                            <div className="text-sm text-[#2C2C2C]/60">
                              {badge.badgeDescription}
                            </div>
                            <div className="text-xs text-[#2C2C2C]/60 mt-1">
                              Earned:{" "}
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-[#2C2C2C]/60">No user data available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default Frontliners;
