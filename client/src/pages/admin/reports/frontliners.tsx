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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const Frontliners = () => {
  const [frontliners, setFrontliners] = useState<Frontliner[]>([]);
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

  // Extract unique values for filters
  const uniqueAssets = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.asset))
  ).filter(Boolean);
  const uniqueSubAssets = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.subAsset))
  ).filter(Boolean);
  const uniqueOrganizationsForFilter = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.organization))
  ).filter(Boolean);
  const uniqueSubOrganizations = Array.from(
    new Set(
      frontliners
        .map((frontliner) => frontliner.subOrganization)
        .filter((org): org is string => Boolean(org))
    )
  );
  const uniqueRoleCategories = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.roleCategory))
  ).filter(Boolean);

  useEffect(() => {
    const fetchFrontliners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - replace with actual API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real API data
        const mockFrontliners: Frontliner[] = [
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@techsolutions.com",
            eid: "EID001",
            phoneNumber: "+971501234567",
            asset: "Technology",
            subAsset: "Software Development",
            organization: "Tech Solutions Inc",
            subOrganization: "Engineering Division",
            roleCategory: "Customer Service",
            role: "Customer Service Rep",
            seniority: "Senior",
            overallProgress: 85,
            alMidhyaf: 90,
            adInformation: 80,
            generalVxSoftSkills: 75,
            generalVxHardSkills: 88,
            managerialCompetencies: 70,
            vxPoints: 1250,
            registrationDate: "2024-01-15",
            lastLoginDate: "2024-12-20",
            status: "active",
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@healthcarepartners.com",
            eid: "EID002",
            phoneNumber: "+971501234568",
            asset: "Healthcare",
            subAsset: "Medical Services",
            organization: "Healthcare Partners",
            subOrganization: "Emergency Department",
            roleCategory: "Medical Staff",
            role: "Nurse",
            seniority: "Expert",
            overallProgress: 92,
            alMidhyaf: 95,
            adInformation: 88,
            generalVxSoftSkills: 90,
            generalVxHardSkills: 85,
            managerialCompetencies: 80,
            vxPoints: 1450,
            registrationDate: "2024-02-20",
            lastLoginDate: "2024-12-19",
            status: "active",
          },
          {
            id: "3",
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.johnson@edufoundation.org",
            eid: "EID003",
            phoneNumber: "+971501234569",
            asset: "Education",
            subAsset: "Academic Programs",
            organization: "Education Foundation",
            subOrganization: "Primary Education",
            roleCategory: "Teaching Staff",
            role: "Teacher",
            seniority: "Intermediate",
            overallProgress: 78,
            alMidhyaf: 75,
            adInformation: 70,
            generalVxSoftSkills: 85,
            generalVxHardSkills: 72,
            managerialCompetencies: 65,
            vxPoints: 980,
            registrationDate: "2024-03-10",
            lastLoginDate: "2024-12-18",
            status: "active",
          },
          {
            id: "4",
            firstName: "Sarah",
            lastName: "Wilson",
            email: "sarah.wilson@globalservices.com",
            eid: "EID004",
            phoneNumber: "+971501234570",
            asset: "Technology",
            subAsset: "IT Support",
            organization: "Global Services Ltd",
            subOrganization: "Customer Service",
            roleCategory: "Technical Support",
            role: "Support Specialist",
            seniority: "Expert",
            overallProgress: 95,
            alMidhyaf: 98,
            adInformation: 92,
            generalVxSoftSkills: 88,
            generalVxHardSkills: 96,
            managerialCompetencies: 90,
            vxPoints: 1650,
            registrationDate: "2024-01-05",
            lastLoginDate: "2024-12-20",
            status: "active",
          },
          {
            id: "5",
            firstName: "Tom",
            lastName: "Brown",
            email: "tom.brown@innovationhub.com",
            eid: "EID005",
            phoneNumber: "+971501234571",
            asset: "Technology",
            subAsset: "Research & Development",
            organization: "Innovation Hub",
            subOrganization: "Innovation Lab",
            roleCategory: "Sales",
            role: "Sales Rep",
            seniority: "Junior",
            overallProgress: 45,
            alMidhyaf: 40,
            adInformation: 35,
            generalVxSoftSkills: 50,
            generalVxHardSkills: 42,
            managerialCompetencies: 30,
            vxPoints: 450,
            registrationDate: "2024-04-12",
            lastLoginDate: "2024-11-15",
            status: "inactive",
          },
          {
            id: "6",
            firstName: "Lisa",
            lastName: "Davis",
            email: "lisa.davis@techsolutions.com",
            eid: "EID006",
            phoneNumber: "+971501234572",
            asset: "Technology",
            subAsset: "Software Development",
            organization: "Tech Solutions Inc",
            subOrganization: "Engineering Division",
            roleCategory: "Technical Support",
            role: "Technical Support",
            seniority: "Senior",
            overallProgress: 88,
            alMidhyaf: 85,
            adInformation: 82,
            generalVxSoftSkills: 90,
            generalVxHardSkills: 86,
            managerialCompetencies: 75,
            vxPoints: 1180,
            registrationDate: "2024-02-28",
            lastLoginDate: "2024-12-19",
            status: "active",
          },
        ];

        setFrontliners(mockFrontliners);
        setFilteredFrontliners(mockFrontliners);
      } catch (err) {
        console.error("Failed to fetch frontliners:", err);
        setError("Failed to load frontliners data");
      } finally {
        setLoading(false);
      }
    };

    fetchFrontliners();
  }, []);

  // Filter frontliners based on all criteria
  useEffect(() => {
    let filtered = frontliners;

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
    frontliners,
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
        frontliner.subOrganization || "N/A",
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

  const totalVxPoints = frontliners.reduce(
    (sum, frontliner) => sum + frontliner.vxPoints,
    0
  );
  const totalAlMidhyaf = frontliners.reduce(
    (sum, frontliner) => sum + frontliner.alMidhyaf,
    0
  );
  const activeFrontliners = frontliners.filter(
    (frontliner) => frontliner.status === "active"
  ).length;
  const averageProgress =
    frontliners.length > 0
      ? Math.round(
          frontliners.reduce(
            (sum, frontliner) => sum + frontliner.overallProgress,
            0
          ) / frontliners.length
        )
      : 0;
  const uniqueOrganizationsForStats = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.organization))
  );

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
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : frontliners.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Active Frontliners
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : activeFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total VX Points
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalVxPoints.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Al Midhyaf Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : Math.round(totalAlMidhyaf / frontliners.length)}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Average Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : `${averageProgress}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : uniqueOrganizationsForStats.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Asset Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">Asset</Label>
                  <Select
                    value={selectedAsset}
                    onValueChange={setSelectedAsset}
                  >
                    <SelectTrigger className="w-[120px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Assets
                      </SelectItem>
                      {uniqueAssets.map((asset) => (
                        <SelectItem
                          key={asset}
                          value={asset}
                          className="text-white hover:bg-gray-700"
                        >
                          {asset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset Sub-Category Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">
                    Asset Sub-Category
                  </Label>
                  <Select
                    value={selectedSubAsset}
                    onValueChange={setSelectedSubAsset}
                  >
                    <SelectTrigger className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Sub-Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Sub-Categories
                      </SelectItem>
                      {uniqueSubAssets.map((subAsset) => (
                        <SelectItem
                          key={subAsset}
                          value={subAsset}
                          className="text-white hover:bg-gray-700"
                        >
                          {subAsset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">Organization</Label>
                  <Select
                    value={organizationFilter}
                    onValueChange={setOrganizationFilter}
                  >
                    <SelectTrigger className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Organizations" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Organizations
                      </SelectItem>
                      {uniqueOrganizationsForFilter.map((org) => (
                        <SelectItem
                          key={org}
                          value={org}
                          className="text-white hover:bg-gray-700"
                        >
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-Organization Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">
                    Sub-Organization
                  </Label>
                  <Select
                    value={selectedSubOrganization}
                    onValueChange={setSelectedSubOrganization}
                  >
                    <SelectTrigger className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Sub-Orgs" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Sub-Orgs
                      </SelectItem>
                      {uniqueSubOrganizations.map((subOrg) => (
                        <SelectItem
                          key={subOrg}
                          value={subOrg}
                          className="text-white hover:bg-gray-700"
                        >
                          {subOrg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Category Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">Role Category</Label>
                  <Select
                    value={selectedRoleCategory}
                    onValueChange={setSelectedRoleCategory}
                  >
                    <SelectTrigger className="w-[130px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Roles
                      </SelectItem>
                      {uniqueRoleCategories.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="text-white hover:bg-gray-700"
                        >
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Overall Progress Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">
                    Overall Progress
                  </Label>
                  <Select
                    value={selectedProgress}
                    onValueChange={setSelectedProgress}
                  >
                    <SelectTrigger className="w-[130px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Progress" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Progress
                      </SelectItem>
                      <SelectItem
                        value="0-25"
                        className="text-white hover:bg-gray-700"
                      >
                        0-25%
                      </SelectItem>
                      <SelectItem
                        value="26-50"
                        className="text-white hover:bg-gray-700"
                      >
                        26-50%
                      </SelectItem>
                      <SelectItem
                        value="51-75"
                        className="text-white hover:bg-gray-700"
                      >
                        51-75%
                      </SelectItem>
                      <SelectItem
                        value="76-100"
                        className="text-white hover:bg-gray-700"
                      >
                        76-100%
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[100px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-gray-700"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value="active"
                        className="text-white hover:bg-gray-700"
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value="inactive"
                        className="text-white hover:bg-gray-700"
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-white/60">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <Input
                      placeholder="Search frontliners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[180px] pl-10 bg-orange-500/20 border-orange-500/30 text-orange-300 placeholder:text-orange-300/60"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
              <Button
                onClick={handleExport}
                className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Frontliners Accordion Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00d8cc]" />
              Frontliners List ({filteredFrontliners.length} results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#00d8cc] animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
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
                    EID
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
                    Asset
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
                    Organization
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
                    Role
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
                    Progress
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
                    Status
                  </div>
                  <div className="col-span-1 text-white/80 font-medium truncate">
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
                        className="col-span-1 text-white font-medium truncate"
                        title={frontliner.id}
                      >
                        {frontliner.id}
                      </div>
                      <div
                        className="col-span-2 text-white/80 truncate"
                        title={`${frontliner.firstName} ${frontliner.lastName}`}
                      >
                        {frontliner.firstName} {frontliner.lastName}
                      </div>
                      <div
                        className="col-span-2 text-white/80 truncate"
                        title={frontliner.email}
                      >
                        {frontliner.email}
                      </div>
                      <div
                        className="col-span-1 text-white/80 truncate"
                        title={frontliner.eid}
                      >
                        {frontliner.eid}
                      </div>
                      <div
                        className="col-span-1 text-white/80 truncate"
                        title={frontliner.asset}
                      >
                        {frontliner.asset}
                      </div>
                      <div
                        className="col-span-1 text-white/80 truncate"
                        title={frontliner.organization}
                      >
                        {frontliner.organization}
                      </div>
                      <div
                        className="col-span-1 text-white/80 truncate"
                        title={frontliner.role}
                      >
                        {frontliner.role}
                      </div>
                      <div className="col-span-1 text-white/80">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-white/20 rounded-full h-2">
                            <div
                              className="bg-[#00d8cc] h-2 rounded-full"
                              style={{
                                width: `${frontliner.overallProgress}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {frontliner.overallProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 text-white/80">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            frontliner.status === "active"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {frontliner.status}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center gap-2">
                        {expandedRows.has(frontliner.id) ? (
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

                    {/* Expanded Row */}
                    {expandedRows.has(frontliner.id) && (
                      <div className="bg-white/5 border-t border-white/10 p-4">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Phone Number
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.phoneNumber}
                            >
                              {frontliner.phoneNumber}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Asset Sub-Category
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.subAsset}
                            >
                              {frontliner.subAsset}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Sub-Organization
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.subOrganization || "N/A"}
                            >
                              {frontliner.subOrganization || "N/A"}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Role Category
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.roleCategory}
                            >
                              {frontliner.roleCategory}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Seniority
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.seniority}
                            >
                              {frontliner.seniority}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              VX Points
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={frontliner.vxPoints.toLocaleString()}
                            >
                              {frontliner.vxPoints.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Al Midhyaf
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${frontliner.alMidhyaf}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-white/80">
                                {frontliner.alMidhyaf}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              AD Information
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{
                                    width: `${frontliner.adInformation}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-white/80">
                                {frontliner.adInformation}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              VX Soft Skills
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{
                                    width: `${frontliner.generalVxSoftSkills}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-white/80">
                                {frontliner.generalVxSoftSkills}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              VX Hard Skills
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{
                                    width: `${frontliner.generalVxHardSkills}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-white/80">
                                {frontliner.generalVxHardSkills}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Managerial Competencies
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{
                                    width: `${frontliner.managerialCompetencies}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-white/80">
                                {frontliner.managerialCompetencies}%
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-white/60 mb-1">
                              Registration Date
                            </div>
                            <div
                              className="text-white/80 truncate"
                              title={formatDate(frontliner.registrationDate)}
                            >
                              {formatDate(frontliner.registrationDate)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs text-white/60 mb-1">
                            Last Login Date
                          </div>
                          <div
                            className="text-white/80 truncate"
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
    </AdminPageLayout>
  );
};

export default Frontliners;
