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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
  X,
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
    totalCertificatesIssued: number;
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

  // Organization and sub-organization search states
  const organizationDropdownRef = React.useRef<HTMLDivElement>(null);
  const subOrganizationDropdownRef = React.useRef<HTMLDivElement>(null);
  const [organizationSearchQuery, setOrganizationSearchQuery] =
    useState<string>("");
  const [showOrganizationDropdown, setShowOrganizationDropdown] =
    useState<boolean>(false);
  const [subOrganizationSearchQuery, setSubOrganizationSearchQuery] =
    useState<string>("");
  const [showSubOrganizationDropdown, setShowSubOrganizationDropdown] =
    useState<boolean>(false);

  // Asset and sub-asset state for dynamic filtering
  const [assets, setAssets] = useState<Array<{ id: number; name: string }>>([]);
  const [subAssets, setSubAssets] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingSubAssets, setIsLoadingSubAssets] = useState(false);

  const toggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // API functions for assets and sub-assets
  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    try {
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
      if (data.success && data.data) {
        setAssets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const fetchSubAssets = async (assetId: number) => {
    if (!assetId) {
      setSubAssets([]);
      return;
    }

    setIsLoadingSubAssets(true);
    try {
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
      if (data.success && data.data) {
        setSubAssets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sub-assets:", error);
      setSubAssets([]);
    } finally {
      setIsLoadingSubAssets(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setAssetFilter("all");
    setAssetSubCategoryFilter("all");
    setOrganizationFilter("all");
    setSubOrganizationFilter("all");
    setRoleCategoryFilter("all");
    setOverallProgressFilter("all");
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
    setShowOrganizationDropdown(false);
    setShowSubOrganizationDropdown(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm !== "" ||
    assetFilter !== "all" ||
    assetSubCategoryFilter !== "all" ||
    organizationFilter !== "all" ||
    subOrganizationFilter !== "all" ||
    roleCategoryFilter !== "all" ||
    overallProgressFilter !== "all";

  // Handle organization selection
  const handleOrganizationSelect = (organization: string) => {
    setOrganizationFilter(organization);
    if (organization === "all") {
      setOrganizationSearchQuery("");
    } else {
      const selectedOrg = reportData?.filters.organizations.find(
        (org) => org.value === organization
      );
      setOrganizationSearchQuery(selectedOrg?.label || "");
    }
    setShowOrganizationDropdown(false);
  };

  // Handle organization search input
  const handleOrganizationSearch = (query: string) => {
    setOrganizationSearchQuery(query);
    setShowOrganizationDropdown(true);
  };

  // Handle sub-organization selection
  const handleSubOrganizationSelect = (subOrganization: string) => {
    setSubOrganizationFilter(subOrganization);
    if (subOrganization === "all") {
      setSubOrganizationSearchQuery("");
    } else {
      const selectedSubOrg = reportData?.filters.subOrganizations.find(
        (subOrg) => subOrg.value === subOrganization
      );
      // Clean the label for display in the input
      const cleanLabel = selectedSubOrg?.label
        ? cleanJsonString(selectedSubOrg.label)
        : "";
      setSubOrganizationSearchQuery(cleanLabel);
    }
    setShowSubOrganizationDropdown(false);
  };

  // Handle sub-organization search input
  const handleSubOrganizationSearch = (query: string) => {
    setSubOrganizationSearchQuery(query);
    setShowSubOrganizationDropdown(true);
  };

  // Filter organizations based on search query
  const filteredOrganizations = (() => {
    if (!reportData?.filters.organizations) return [];

    return reportData.filters.organizations.filter((org) => {
      if (!org || !org.label || typeof org.label !== "string") {
        return false;
      }

      const searchQuery = organizationSearchQuery || "";
      return org.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  })();

  // Helper function to clean JSON-formatted strings
  const cleanJsonString = (str: string): string => {
    if (!str) return "";
    return str
      .replace(/^["']|["']$/g, "") // Remove leading/trailing quotes
      .replace(/^\{|\}$/g, "") // Remove leading/trailing braces
      .replace(/^"|"$/g, "") // Remove any remaining quotes
      .trim(); // Remove any whitespace
  };

  // Filter sub-organizations based on search query
  const filteredSubOrganizations = (() => {
    if (!reportData?.filters.subOrganizations) return [];

    return reportData.filters.subOrganizations.filter((subOrg) => {
      if (!subOrg || !subOrg.label || typeof subOrg.label !== "string") {
        return false;
      }

      // Clean the label by removing JSON formatting
      const cleanLabel = cleanJsonString(subOrg.label);

      const searchQuery = subOrganizationSearchQuery || "";
      return cleanLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });
  })();

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
    fetchAssets();
  }, []);

  // Handle asset selection change
  useEffect(() => {
    if (assetFilter !== "all") {
      // Find the asset ID from the assets array
      const asset = assets.find((a) => a.name === assetFilter);
      if (asset) {
        fetchSubAssets(asset.id);
      }
    } else {
      setSubAssets([]);
    }
    // Reset sub-asset, organization, and sub-organization selection when asset changes
    setAssetSubCategoryFilter("all");
    setOrganizationFilter("all");
    setSubOrganizationFilter("all");
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
  }, [assetFilter, assets]);

  // Handle sub-asset selection change
  useEffect(() => {
    // Reset organization and sub-organization selection when sub-asset changes
    setOrganizationFilter("all");
    setSubOrganizationFilter("all");
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
  }, [assetSubCategoryFilter]);

  // Handle organization selection change
  useEffect(() => {
    // Reset sub-organization selection when organization changes
    setSubOrganizationFilter("all");
    setSubOrganizationSearchQuery("");
  }, [organizationFilter]);

  // Handle click outside to close organization dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        organizationDropdownRef.current &&
        !organizationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowOrganizationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle click outside to close sub-organization dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subOrganizationDropdownRef.current &&
        !subOrganizationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubOrganizationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        <div className="grid gap-4 md:grid-cols-2">
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

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Average Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.averageOverallProgress.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dawn">Filter By</h3>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="text-dawn border-dawn hover:bg-dawn hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assetFilter" className="text-[#2C2C2C]">
                Asset
              </Label>
              <Select value={assetFilter} onValueChange={setAssetFilter}>
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
              <Label
                htmlFor="assetSubCategoryFilter"
                className="text-[#2C2C2C]"
              >
                Asset Sub-Category
              </Label>
              <Select
                value={assetSubCategoryFilter}
                onValueChange={setAssetSubCategoryFilter}
                disabled={assetFilter === "all" || isLoadingSubAssets}
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
              <div className="relative" ref={organizationDropdownRef}>
                <Input
                  value={organizationSearchQuery}
                  onChange={(e) => handleOrganizationSearch(e.target.value)}
                  onFocus={() => setShowOrganizationDropdown(true)}
                  placeholder={
                    organizationFilter === "all"
                      ? "All Organizations"
                      : "Search organizations..."
                  }
                  className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] pr-8"
                />
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowOrganizationDropdown(!showOrganizationDropdown)
                  }
                />

                {showOrganizationDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => handleOrganizationSelect("all")}
                    >
                      All Organizations
                    </div>
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <div
                          key={org.value}
                          className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOrganizationSelect(org.value)}
                        >
                          {org.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No organizations found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subOrganizationFilter" className="text-[#2C2C2C]">
                Sub-Organization
              </Label>
              <div className="relative" ref={subOrganizationDropdownRef}>
                <Input
                  value={subOrganizationSearchQuery}
                  onChange={(e) => handleSubOrganizationSearch(e.target.value)}
                  onFocus={() => setShowSubOrganizationDropdown(true)}
                  placeholder={
                    subOrganizationFilter === "all"
                      ? "All Sub-Organizations"
                      : "Search sub-organizations..."
                  }
                  className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] pr-8"
                />
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowSubOrganizationDropdown(!showSubOrganizationDropdown)
                  }
                />

                {showSubOrganizationDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => handleSubOrganizationSelect("all")}
                    >
                      All Sub-Organizations
                    </div>
                    {filteredSubOrganizations.length > 0 ? (
                      filteredSubOrganizations.map((subOrg) => {
                        if (!subOrg.value) return null;
                        // Clean the label for display
                        const cleanLabel = cleanJsonString(subOrg.label);
                        return (
                          <div
                            key={subOrg.value}
                            className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              handleSubOrganizationSelect(subOrg.value!)
                            }
                          >
                            {cleanLabel}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No sub-organizations found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="roleCategoryFilter" className="text-[#2C2C2C]">
                Role Category
              </Label>
              <Select
                value={roleCategoryFilter}
                onValueChange={setRoleCategoryFilter}
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
              <Label htmlFor="overallProgressFilter" className="text-[#2C2C2C]">
                Overall Progress
              </Label>
              <Select
                value={overallProgressFilter}
                onValueChange={setOverallProgressFilter}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select progress range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress Levels</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (50-79%)</SelectItem>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
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

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C2C2C]/60 h-4 w-4" />
          <Input
            placeholder="Search frontliners, organizations, or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#2C2C2C]/60"
          />
        </div>

        {/* Certificate Reports Table */}
        <div className="border bg-card/50 backdrop-blur-sm border-border w-full max-w-8xl mx-auto rounded-lg overflow-hidden">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sandstone/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sandstone/50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-dawn animate-spin" />
              </div>
            ) : (
              <div className="w-full">
                <Table className="table-auto w-full">
                  <TableHeader className="sticky top-0 bg-card/50 backdrop-blur-sm z-10">
                    <TableRow className="border-border">
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        User ID
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Full Name
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Email
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Organization
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Sub-Organization
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Role Category
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Seniority
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Overall Progress
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Certificates
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item: any) => (
                      <React.Fragment key={item.userId}>
                        {/* Primary Row */}
                        <TableRow
                          className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => toggleRow(item.userId)}
                        >
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.userId}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.firstName} {item.lastName}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.email}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.organization}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.subOrganization || "N/A"}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.roleCategory}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {item.seniority}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-dawn h-2 rounded-full"
                                  style={{
                                    width: `${item.overallProgress.toFixed(
                                      1
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {item.overallProgress.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
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
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {expandedRows.has(item.userId) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row */}
                        {expandedRows.has(item.userId) && (
                          <TableRow className="border-border bg-muted/30">
                            <TableCell colSpan={10} className="p-6">
                              <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-5 gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      EID
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {item.eid}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Phone Number
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {item.phoneNumber}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Asset
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {item.asset}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Asset Sub-Category
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {item.subAsset}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Frontliner Type
                                    </div>
                                    <div className="text-foreground text-sm">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(
                                          item.frontlinerType
                                        )}`}
                                      >
                                        {item.frontlinerType}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Role Information */}
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Role
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {item.role}
                                    </div>
                                  </div>
                                </div>

                                {/* Certificate Status */}
                                <div>
                                  <div className="text-xs text-muted-foreground mb-3 font-medium">
                                    Certificate Status
                                  </div>
                                  <div className="grid grid-cols-6 gap-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Award
                                          className={`h-4 w-4 ${
                                            item.alMidhyafCertificate
                                              ? "text-green-600"
                                              : "text-red-500"
                                          }`}
                                        />
                                        <span className="text-foreground text-sm">
                                          Al Midhyaf
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.alMidhyafCertificate
                                          ? "Earned"
                                          : "Not Earned"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Award
                                          className={`h-4 w-4 ${
                                            item.adInformationCertificate
                                              ? "text-green-600"
                                              : "text-red-500"
                                          }`}
                                        />
                                        <span className="text-foreground text-sm">
                                          AD Information
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.adInformationCertificate
                                          ? "Earned"
                                          : "Not Earned"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Award
                                          className={`h-4 w-4 ${
                                            item.generalVXSoftSkillsCertificate
                                              ? "text-green-600"
                                              : "text-red-500"
                                          }`}
                                        />
                                        <span className="text-foreground text-sm">
                                          Soft Skills
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.generalVXSoftSkillsCertificate
                                          ? "Earned"
                                          : "Not Earned"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Award
                                          className={`h-4 w-4 ${
                                            item.generalVXHardSkillsCertificate
                                              ? "text-green-600"
                                              : "text-red-500"
                                          }`}
                                        />
                                        <span className="text-foreground text-sm">
                                          Hard Skills
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.generalVXHardSkillsCertificate
                                          ? "Earned"
                                          : "Not Earned"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Award
                                          className={`h-4 w-4 ${
                                            item.managerialCompetenciesCertificate
                                              ? "text-green-600"
                                              : "text-red-500"
                                          }`}
                                        />
                                        <span className="text-foreground text-sm">
                                          Managerial
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {item.managerialCompetenciesCertificate
                                          ? "Earned"
                                          : "Not Earned"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-foreground text-sm font-medium">
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
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Certificates Earned
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Date Information */}
                                <div className="grid grid-cols-6 gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Registration Date
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {formatDate(item.registrationDate)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Last Login Date
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {formatDate(item.lastLoginDate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default CertificateReports;
