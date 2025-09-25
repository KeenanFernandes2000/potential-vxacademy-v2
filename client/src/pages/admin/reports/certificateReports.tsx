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
  Award,
  Search,
  Users,
  Calendar,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  BookOpen,
  Building2,
} from "lucide-react";

interface Frontliner {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  phoneNumber: string;
  asset: string;
  assetSubCategory: string;
  organization: string;
  subOrganization: string;
  roleCategory: string;
  role: string;
  seniority: string;
  registrationDate: string;
  vxPoints: number;
  overallProgress: number;
  certificates: {
    alMidhyaf: boolean;
    adInformation: boolean;
    generalVXSoftSkills: boolean;
    generalVXHardSkills: boolean;
    managerialCompetencies: boolean;
  };
}

const CertificateReports = () => {
  const [frontliners, setFrontliners] = useState<Frontliner[]>([]);
  const [filteredFrontliners, setFilteredFrontliners] = useState<Frontliner[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [assetSubCategoryFilter, setAssetSubCategoryFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [subOrganizationFilter, setSubOrganizationFilter] = useState("all");
  const [roleCategoryFilter, setRoleCategoryFilter] = useState("all");
  const [overallProgressFilter, setOverallProgressFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
            userId: "FL001",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@techsolutions.com",
            eid: "EID001",
            phoneNumber: "+971501234567",
            asset: "Customer Service",
            assetSubCategory: "Call Center",
            organization: "Tech Solutions Inc",
            subOrganization: "Dubai Branch",
            roleCategory: "Frontline",
            role: "Customer Service Representative",
            seniority: "Senior",
            registrationDate: "2024-01-15",
            vxPoints: 1250,
            overallProgress: 85,
            certificates: {
              alMidhyaf: true,
              adInformation: true,
              generalVXSoftSkills: true,
              generalVXHardSkills: false,
              managerialCompetencies: false,
            },
          },
          {
            id: "2",
            userId: "FL002",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@healthcarepartners.com",
            eid: "EID002",
            phoneNumber: "+971501234568",
            asset: "Healthcare",
            assetSubCategory: "Patient Care",
            organization: "Healthcare Partners",
            subOrganization: "Abu Dhabi Branch",
            roleCategory: "Frontline",
            role: "Healthcare Assistant",
            seniority: "Mid-level",
            registrationDate: "2024-02-20",
            vxPoints: 980,
            overallProgress: 72,
            certificates: {
              alMidhyaf: true,
              adInformation: true,
              generalVXSoftSkills: true,
              generalVXHardSkills: true,
              managerialCompetencies: false,
            },
          },
          {
            id: "3",
            userId: "FL003",
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.johnson@edufoundation.org",
            eid: "EID003",
            phoneNumber: "+971501234569",
            asset: "Education",
            assetSubCategory: "Student Support",
            organization: "Education Foundation",
            subOrganization: "Sharjah Branch",
            roleCategory: "Support",
            role: "Student Advisor",
            seniority: "Junior",
            registrationDate: "2024-03-10",
            vxPoints: 650,
            overallProgress: 45,
            certificates: {
              alMidhyaf: false,
              adInformation: true,
              generalVXSoftSkills: true,
              generalVXHardSkills: false,
              managerialCompetencies: false,
            },
          },
          {
            id: "4",
            userId: "FL004",
            firstName: "Sarah",
            lastName: "Wilson",
            email: "sarah.wilson@globalservices.com",
            eid: "EID004",
            phoneNumber: "+971501234570",
            asset: "Sales",
            assetSubCategory: "Retail",
            organization: "Global Services Ltd",
            subOrganization: "Ajman Branch",
            roleCategory: "Sales",
            role: "Sales Representative",
            seniority: "Senior",
            registrationDate: "2024-01-05",
            vxPoints: 1580,
            overallProgress: 92,
            certificates: {
              alMidhyaf: true,
              adInformation: true,
              generalVXSoftSkills: true,
              generalVXHardSkills: true,
              managerialCompetencies: true,
            },
          },
          {
            id: "5",
            userId: "FL005",
            firstName: "Tom",
            lastName: "Brown",
            email: "tom.brown@innovationhub.com",
            eid: "EID005",
            phoneNumber: "+971501234571",
            asset: "Technology",
            assetSubCategory: "IT Support",
            organization: "Innovation Hub",
            subOrganization: "Ras Al Khaimah Branch",
            roleCategory: "Technical",
            role: "IT Support Specialist",
            seniority: "Mid-level",
            registrationDate: "2023-12-15",
            vxPoints: 1100,
            overallProgress: 68,
            certificates: {
              alMidhyaf: true,
              adInformation: false,
              generalVXSoftSkills: true,
              generalVXHardSkills: true,
              managerialCompetencies: false,
            },
          },
          {
            id: "6",
            userId: "FL006",
            firstName: "Lisa",
            lastName: "Davis",
            email: "lisa.davis@techsolutions.com",
            eid: "EID006",
            phoneNumber: "+971501234572",
            asset: "Analytics",
            assetSubCategory: "Data Analysis",
            organization: "Tech Solutions Inc",
            subOrganization: "Dubai Branch",
            roleCategory: "Analytics",
            role: "Data Analyst",
            seniority: "Senior",
            registrationDate: "2024-02-28",
            vxPoints: 1420,
            overallProgress: 88,
            certificates: {
              alMidhyaf: true,
              adInformation: true,
              generalVXSoftSkills: true,
              generalVXHardSkills: true,
              managerialCompetencies: true,
            },
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

  // Filter frontliners based on search term and filters
  useEffect(() => {
    let filtered = frontliners;

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
          frontliner.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          frontliner.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          frontliner.organization
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by asset
    if (assetFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.asset === assetFilter
      );
    }

    // Filter by asset sub-category
    if (assetSubCategoryFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.assetSubCategory === assetSubCategoryFilter
      );
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.organization === organizationFilter
      );
    }

    // Filter by sub-organization
    if (subOrganizationFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.subOrganization === subOrganizationFilter
      );
    }

    // Filter by role category
    if (roleCategoryFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.roleCategory === roleCategoryFilter
      );
    }

    // Filter by overall progress
    if (overallProgressFilter !== "all") {
      filtered = filtered.filter((frontliner) => {
        const progress = frontliner.overallProgress;
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

    setFilteredFrontliners(filtered);
  }, [
    frontliners,
    searchTerm,
    assetFilter,
    assetSubCategoryFilter,
    organizationFilter,
    subOrganizationFilter,
    roleCategoryFilter,
    overallProgressFilter,
  ]);

  const toggleRowExpansion = (frontlinerId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(frontlinerId)) {
      newExpandedRows.delete(frontlinerId);
    } else {
      newExpandedRows.add(frontlinerId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "User ID",
        "First Name",
        "Last Name",
        "Email",
        "EID",
        "Phone Number",
        "Asset",
        "Asset Sub-Category",
        "Organization",
        "Sub-Organization",
        "Role Category",
        "Role",
        "Seniority",
        "VX Points",
        "Overall Progress",
        "Registration Date",
        "Al Midhyaf Certificate",
        "AD Information Certificate",
        "General VX Soft Skills Certificate",
        "General VX Hard Skills Certificate",
        "Managerial Competencies Certificate",
      ],
      ...filteredFrontliners.map((frontliner) => [
        frontliner.userId,
        frontliner.firstName,
        frontliner.lastName,
        frontliner.email,
        frontliner.eid,
        frontliner.phoneNumber,
        frontliner.asset,
        frontliner.assetSubCategory,
        frontliner.organization,
        frontliner.subOrganization,
        frontliner.roleCategory,
        frontliner.role,
        frontliner.seniority,
        frontliner.vxPoints.toString(),
        frontliner.overallProgress.toString(),
        new Date(frontliner.registrationDate).toLocaleDateString(),
        frontliner.certificates.alMidhyaf ? "Yes" : "No",
        frontliner.certificates.adInformation ? "Yes" : "No",
        frontliner.certificates.generalVXSoftSkills ? "Yes" : "No",
        frontliner.certificates.generalVXHardSkills ? "Yes" : "No",
        frontliner.certificates.managerialCompetencies ? "Yes" : "No",
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

  const totalFrontliners = frontliners.length;
  const uniqueOrganizations = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.organization))
  );
  const totalCertificatesIssued = frontliners.reduce((total, frontliner) => {
    return (
      total + Object.values(frontliner.certificates).filter(Boolean).length
    );
  }, 0);
  const totalVXPoints = frontliners.reduce(
    (total, frontliner) => total + frontliner.vxPoints,
    0
  );
  const averageOverallProgress =
    frontliners.length > 0
      ? Math.round(
          frontliners.reduce(
            (sum, frontliner) => sum + frontliner.overallProgress,
            0
          ) / frontliners.length
        )
      : 0;

  // Get unique values for filters
  const uniqueAssets = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.asset))
  );
  const uniqueAssetSubCategories = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.assetSubCategory))
  );
  const uniqueSubOrganizations = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.subOrganization))
  );
  const uniqueRoleCategories = Array.from(
    new Set(frontliners.map((frontliner) => frontliner.roleCategory))
  );

  return (
    <AdminPageLayout
      title="Frontliner Reports"
      description="Complete overview of all frontliners and their progress in the system"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Number of Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Number of Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : uniqueOrganizations.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Certificates Issued
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total VX Points Earned
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalVXPoints.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Overall Progress
              </CardTitle>
              <BookOpen className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : averageOverallProgress}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <Input
                    placeholder="Search frontliners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-[#00d8cc]"
                  />
                </div>
                <Button
                  onClick={handleExport}
                  className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Assets
                  </option>
                  {uniqueAssets.map((asset) => (
                    <option
                      key={asset}
                      value={asset}
                      className="bg-gray-800 text-white"
                    >
                      {asset}
                    </option>
                  ))}
                </select>

                <select
                  value={assetSubCategoryFilter}
                  onChange={(e) => setAssetSubCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Sub-Categories
                  </option>
                  {uniqueAssetSubCategories.map((subCategory) => (
                    <option
                      key={subCategory}
                      value={subCategory}
                      className="bg-gray-800 text-white"
                    >
                      {subCategory}
                    </option>
                  ))}
                </select>

                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Organizations
                  </option>
                  {uniqueOrganizations.map((org) => (
                    <option
                      key={org}
                      value={org}
                      className="bg-gray-800 text-white"
                    >
                      {org}
                    </option>
                  ))}
                </select>

                <select
                  value={subOrganizationFilter}
                  onChange={(e) => setSubOrganizationFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Sub-Organizations
                  </option>
                  {uniqueSubOrganizations.map((subOrg) => (
                    <option
                      key={subOrg}
                      value={subOrg}
                      className="bg-gray-800 text-white"
                    >
                      {subOrg}
                    </option>
                  ))}
                </select>

                <select
                  value={roleCategoryFilter}
                  onChange={(e) => setRoleCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Role Categories
                  </option>
                  {uniqueRoleCategories.map((roleCategory) => (
                    <option
                      key={roleCategory}
                      value={roleCategory}
                      className="bg-gray-800 text-white"
                    >
                      {roleCategory}
                    </option>
                  ))}
                </select>

                <select
                  value={overallProgressFilter}
                  onChange={(e) => setOverallProgressFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d8cc]"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    All Progress Levels
                  </option>
                  <option value="high" className="bg-gray-800 text-white">
                    High (80%+)
                  </option>
                  <option value="medium" className="bg-gray-800 text-white">
                    Medium (50-79%)
                  </option>
                  <option value="low" className="bg-gray-800 text-white">
                    Low (&lt;50%)
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frontliners Table */}
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
              <div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white/80">User ID</TableHead>
                      <TableHead className="text-white/80">Name</TableHead>
                      <TableHead className="text-white/80">Email</TableHead>
                      <TableHead className="text-white/80">Asset</TableHead>
                      <TableHead className="text-white/80">
                        Organization
                      </TableHead>
                      <TableHead className="text-white/80">Role</TableHead>
                      <TableHead className="text-white/80">Seniority</TableHead>
                      <TableHead className="text-white/80">VX Points</TableHead>
                      <TableHead className="text-white/80">Progress</TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrontliners.map((frontliner) => (
                      <React.Fragment key={frontliner.id}>
                        <TableRow className="border-white/10">
                          <TableCell className="text-white font-medium">
                            {frontliner.userId}
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div>
                              <div className="font-medium">
                                {frontliner.firstName} {frontliner.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div className="max-w-[200px] truncate">
                              {frontliner.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                              {frontliner.asset}
                            </span>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div className="max-w-[150px] truncate">
                              {frontliner.organization}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div className="max-w-[120px] truncate">
                              {frontliner.role}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                              {frontliner.seniority}
                            </span>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {frontliner.vxPoints}
                            </div>
                          </TableCell>
                          <TableCell className="text-white/80">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-white/10 rounded-full h-2">
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
                          </TableCell>
                          <TableCell className="text-white/80">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(frontliner.id)}
                              className="text-white/80 hover:text-white hover:bg-white/10"
                            >
                              {expandedRows.has(frontliner.id) ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Row with Additional Data */}
                        {expandedRows.has(frontliner.id) && (
                          <TableRow className="border-white/10 bg-white/5">
                            <TableCell colSpan={10} className="p-0">
                              <div className="p-4 space-y-6">
                                {/* Personal Information */}
                                <div>
                                  <h4 className="text-sm font-medium text-white/80 mb-3 border-b border-white/20 pb-2">
                                    Personal Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                      <span className="text-xs text-white/60">
                                        EID
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.eid}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Phone Number
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.phoneNumber}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Registration Date
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {formatDate(
                                          frontliner.registrationDate
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Asset Sub-Category
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.assetSubCategory}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Organization Details */}
                                <div>
                                  <h4 className="text-sm font-medium text-white/80 mb-3 border-b border-white/20 pb-2">
                                    Organization Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Sub-Organization
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.subOrganization}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Role Category
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.roleCategory}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-xs text-white/60">
                                        Seniority Level
                                      </span>
                                      <div className="text-white/80 text-sm">
                                        {frontliner.seniority}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress & Certificates */}
                                <div>
                                  <h4 className="text-sm font-medium text-white/80 mb-3 border-b border-white/20 pb-2">
                                    Progress & Certificates
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="mb-2">
                                        <span className="text-xs text-white/60">
                                          Overall Progress
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="w-full bg-white/10 rounded-full h-2">
                                            <div
                                              className="bg-[#00d8cc] h-2 rounded-full"
                                              style={{
                                                width: `${frontliner.overallProgress}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-white text-sm">
                                            {frontliner.overallProgress}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-white/80 text-sm">
                                        <span className="font-medium">
                                          VX Points:
                                        </span>{" "}
                                        {frontliner.vxPoints.toLocaleString()}
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-xs text-white/60 mb-2 block">
                                        Certificates Status
                                      </span>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Award className="h-4 w-4 text-[#00d8cc]" />
                                          <span className="text-white/80 text-sm">
                                            Al Midhyaf Certificate:{" "}
                                            {frontliner.certificates.alMidhyaf
                                              ? "✓"
                                              : "✗"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Award className="h-4 w-4 text-[#00d8cc]" />
                                          <span className="text-white/80 text-sm">
                                            AD Information Certificate:{" "}
                                            {frontliner.certificates
                                              .adInformation
                                              ? "✓"
                                              : "✗"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Award className="h-4 w-4 text-[#00d8cc]" />
                                          <span className="text-white/80 text-sm">
                                            General VX Soft Skills Certificate:{" "}
                                            {frontliner.certificates
                                              .generalVXSoftSkills
                                              ? "✓"
                                              : "✗"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Award className="h-4 w-4 text-[#00d8cc]" />
                                          <span className="text-white/80 text-sm">
                                            General VX Hard Skills Certificate:{" "}
                                            {frontliner.certificates
                                              .generalVXHardSkills
                                              ? "✓"
                                              : "✗"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Award className="h-4 w-4 text-[#00d8cc]" />
                                          <span className="text-white/80 text-sm">
                                            Managerial Competencies Certificate:{" "}
                                            {frontliner.certificates
                                              .managerialCompetencies
                                              ? "✓"
                                              : "✗"}
                                          </span>
                                        </div>
                                        <div className="mt-2 text-white/80 text-sm">
                                          <span className="font-medium">
                                            Total Certificates Earned:{" "}
                                            {
                                              Object.values(
                                                frontliner.certificates
                                              ).filter(Boolean).length
                                            }
                                            /5
                                          </span>
                                        </div>
                                      </div>
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
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default CertificateReports;
