import React, { useState, useEffect, useRef } from "react";
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
  frontlinerType: string;
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
    totalCertificates: number;
    alMidhyafProgress: number;
    averageProgress: number;
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

  // Organization and sub-organization search states
  const [organizationSearchQuery, setOrganizationSearchQuery] =
    useState<string>("");
  const [showOrganizationDropdown, setShowOrganizationDropdown] =
    useState<boolean>(false);
  const organizationDropdownRef = useRef<HTMLDivElement>(null);

  const [subOrganizationSearchQuery, setSubOrganizationSearchQuery] =
    useState<string>("");
  const [showSubOrganizationDropdown, setShowSubOrganizationDropdown] =
    useState<boolean>(false);
  const subOrganizationDropdownRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");
  const [selectedSubOrganization, setSelectedSubOrganization] =
    useState<string>("all");
  const [selectedRoleCategory, setSelectedRoleCategory] =
    useState<string>("all");
  const [selectedProgress, setSelectedProgress] = useState<string>("all");
  const [selectedRegistrationDateRange, setSelectedRegistrationDateRange] =
    useState<{
      from: string;
      to: string;
    }>({ from: "", to: "" });

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
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
  }, [selectedAsset, assets]);

  // Handle sub-asset selection change
  useEffect(() => {
    // Reset organization and sub-organization selection when sub-asset changes
    setOrganizationFilter("all");
    setSelectedSubOrganization("all");
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
  }, [selectedSubAsset]);

  // Handle organization selection change
  useEffect(() => {
    // Reset sub-organization selection when organization changes
    setSelectedSubOrganization("all");
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
    // Handle both array and string cases
    const allSubOrgs = filtered.flatMap((frontliner) => {
      if (Array.isArray(frontliner.subOrganization)) {
        return frontliner.subOrganization;
      }
      return frontliner.subOrganization ? [frontliner.subOrganization] : [];
    });

    const uniqueSubOrganizations = Array.from(
      new Set(allSubOrgs.filter((subOrg) => subOrg && subOrg !== "N/A"))
    ).map((subOrg) => ({ value: subOrg, label: subOrg }));

    return uniqueSubOrganizations;
  };

  // Filter organizations based on search query
  const filteredOrganizations = (() => {
    if (!reportData?.filters.organizations) return [];

    return reportData.filters.organizations.filter((org) => {
      // More comprehensive check
      if (!org || !org.label || typeof org.label !== "string") {
        return false;
      }

      const searchQuery = organizationSearchQuery || "";
      return org.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  })();

  // Filter sub-organizations based on search query
  const filteredSubOrganizations = (() => {
    if (!reportData?.filters.subOrganizations) return [];

    return reportData.filters.subOrganizations.filter((subOrg) => {
      // Simple check - same pattern as organization filter
      if (!subOrg || !subOrg.label || typeof subOrg.label !== "string") {
        return false;
      }

      const searchQuery = subOrganizationSearchQuery || "";
      return subOrg.label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  })();

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
      filtered = filtered.filter((frontliner) => {
        // Handle both array and string cases
        if (Array.isArray(frontliner.subOrganization)) {
          return frontliner.subOrganization.includes(selectedSubOrganization);
        }
        return frontliner.subOrganization === selectedSubOrganization;
      });
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

    // Filter by registration date range
    if (
      selectedRegistrationDateRange.from ||
      selectedRegistrationDateRange.to
    ) {
      filtered = filtered.filter((frontliner) => {
        if (frontliner.registrationDate === "N/A") return false;
        const userDate = new Date(frontliner.registrationDate);

        // If only from date is set
        if (
          selectedRegistrationDateRange.from &&
          !selectedRegistrationDateRange.to
        ) {
          const fromDate = new Date(selectedRegistrationDateRange.from);
          return userDate >= fromDate;
        }

        // If only to date is set
        if (
          !selectedRegistrationDateRange.from &&
          selectedRegistrationDateRange.to
        ) {
          const toDate = new Date(selectedRegistrationDateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          return userDate <= toDate;
        }

        // If both dates are set
        if (
          selectedRegistrationDateRange.from &&
          selectedRegistrationDateRange.to
        ) {
          const fromDate = new Date(selectedRegistrationDateRange.from);
          const toDate = new Date(selectedRegistrationDateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          return userDate >= fromDate && userDate <= toDate;
        }

        return true;
      });
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
    selectedRegistrationDateRange,
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
    setSelectedRegistrationDateRange({ from: "", to: "" });
    setOrganizationSearchQuery("");
    setSubOrganizationSearchQuery("");
    setShowOrganizationDropdown(false);
    setShowSubOrganizationDropdown(false);
  };

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
    setSelectedSubOrganization(subOrganization);
    if (subOrganization === "all") {
      setSubOrganizationSearchQuery("");
    } else {
      const selectedSubOrg = reportData?.filters.subOrganizations.find(
        (subOrg) => subOrg.value === subOrganization
      );
      setSubOrganizationSearchQuery(selectedSubOrg?.label || "");
    }
    setShowSubOrganizationDropdown(false);
  };

  // Handle sub-organization search input
  const handleSubOrganizationSearch = (query: string) => {
    setSubOrganizationSearchQuery(query);
    setShowSubOrganizationDropdown(true);
  };

  // Handle date range changes
  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    setSelectedRegistrationDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    statusFilter !== "all" ||
    selectedRegistrationDateRange.from !== "" ||
    selectedRegistrationDateRange.to !== "";

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
        "Frontliner Type",
        "Overall Progress",
        "Al Midhyaf",
        "AD Information",
        "General VX Soft Skills",
        "General VX Hard Skills",
        "Managerial Competencies",
        // "VX Points",
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
        frontliner.frontlinerType,
        `${frontliner.overallProgress}%`,
        `${frontliner.alMidhyaf}%`,
        `${frontliner.adInformation}%`,
        `${frontliner.generalVxSoftSkills}%`,
        `${frontliner.generalVxHardSkills}%`,
        `${frontliner.managerialCompetencies}%`,
        // frontliner.vxPoints.toString(),
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
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Registered Frontliners
              </p>
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
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Active in last 15 days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCertificates}
              </div>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Certificates issued
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Al-Midhyaf Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.alMidhyafProgress}%
              </div>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Al-Midhyaf completion rate
              </p>
            </CardContent>
          </Card>

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
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Overall completion rate
              </p>
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
                    selectedSubOrganization === "all"
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
                        return (
                          <div
                            key={subOrg.value}
                            className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              handleSubOrganizationSelect(subOrg.value!)
                            }
                          >
                            {subOrg.label}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="registrationDateFilter"
                className="text-[#2C2C2C] text-center block"
              >
                Registration Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={selectedRegistrationDateRange.from}
                    onChange={(e) =>
                      handleDateRangeChange("from", e.target.value)
                    }
                    placeholder="From date"
                    className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={selectedRegistrationDateRange.to}
                    onChange={(e) =>
                      handleDateRangeChange("to", e.target.value)
                    }
                    placeholder="To date"
                    className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
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

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C2C2C]/60 h-4 w-4" />
          <Input
            placeholder="Search frontliners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#2C2C2C]/60"
          />
        </div>

        {/* Frontliners Accordion Table */}
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
                        Status
                      </TableHead>
                      <TableHead className="text-foreground font-semibold whitespace-nowrap">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrontliners.map((frontliner) => (
                      <React.Fragment key={frontliner.id}>
                        {/* Primary Row */}
                        <TableRow
                          className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => toggleRow(frontliner.id)}
                        >
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.id}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.firstName} {frontliner.lastName}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.email}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.organization}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {Array.isArray(frontliner.subOrganization)
                              ? frontliner.subOrganization.join(", ")
                              : frontliner.subOrganization || "N/A"}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.roleCategory}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            {frontliner.seniority}
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-dawn h-2 rounded-full"
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
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                frontliner.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {frontliner.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground/90 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {expandedRows.has(frontliner.id) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-dawn hover:text-[#B85A1A] hover:bg-dawn/10"
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
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row */}
                        {expandedRows.has(frontliner.id) && (
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
                                      {frontliner.eid}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Phone Number
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {frontliner.phoneNumber}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Asset
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {frontliner.asset}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Asset Sub-Category
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {frontliner.subAsset}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Role
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {frontliner.role}
                                    </div>
                                  </div>
                                </div>

                                {/* Frontliner Type */}
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Frontliner Type
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {frontliner.frontlinerType}
                                    </div>
                                  </div>
                                </div>

                                {/* Training Progress */}
                                <div className="grid grid-cols-6 gap-4">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Al Midhyaf
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-500 h-2 rounded-full"
                                          style={{
                                            width: `${formatProgress(
                                              frontliner.alMidhyaf
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-foreground">
                                        {formatProgress(frontliner.alMidhyaf)}%
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      AD Information
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-green-500 h-2 rounded-full"
                                          style={{
                                            width: `${formatProgress(
                                              frontliner.adInformation
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-foreground">
                                        {formatProgress(
                                          frontliner.adInformation
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      VX Soft Skills
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-purple-500 h-2 rounded-full"
                                          style={{
                                            width: `${formatProgress(
                                              frontliner.generalVxSoftSkills
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-foreground">
                                        {formatProgress(
                                          frontliner.generalVxSoftSkills
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      VX Hard Skills
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-orange-500 h-2 rounded-full"
                                          style={{
                                            width: `${formatProgress(
                                              frontliner.generalVxHardSkills
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-foreground">
                                        {formatProgress(
                                          frontliner.generalVxHardSkills
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Managerial Competencies
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-red-500 h-2 rounded-full"
                                          style={{
                                            width: `${formatProgress(
                                              frontliner.managerialCompetencies
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-foreground">
                                        {formatProgress(
                                          frontliner.managerialCompetencies
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1 font-medium">
                                      Registration Date
                                    </div>
                                    <div className="text-foreground text-sm">
                                      {formatDate(frontliner.registrationDate)}
                                    </div>
                                  </div>
                                </div>

                                {/* Last Login */}
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                                    Last Login Date
                                  </div>
                                  <div className="text-foreground text-sm">
                                    {formatDate(frontliner.lastLoginDate)}
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

      {/* Comprehensive User Details Dialog */}
      <Dialog
        open={showUserDetailsModal}
        onOpenChange={setShowUserDetailsModal}
      >
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-semibold text-[#2C2C2C]">
                Comprehensive User Details
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
                  0 ? (
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
                                  {Number(
                                    progress.completionPercentage
                                  ).toFixed(2)}
                                  %
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
                  ) : (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-[#2C2C2C] mb-2">
                        Training Areas
                      </h4>
                      <div className="bg-gray-50 p-3 rounded text-center">
                        <span className="text-[#2C2C2C]/60 text-sm">
                          No training area progress data available
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Course Progress */}
                  {comprehensiveUserData.progress.courseProgress.length > 0 ? (
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
                                  {Number(
                                    progress.completionPercentage
                                  ).toFixed(2)}
                                  %
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
                  ) : (
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-[#2C2C2C] mb-2">
                        Courses
                      </h4>
                      <div className="bg-gray-50 p-3 rounded text-center">
                        <span className="text-[#2C2C2C]/60 text-sm">
                          No course progress data available
                        </span>
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
                                  Score: {Number(attempt.score).toFixed(2)}
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
