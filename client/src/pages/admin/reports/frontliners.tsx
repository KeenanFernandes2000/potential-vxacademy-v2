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
} from "lucide-react";

interface Frontliner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  position: string;
  coursesCompleted: number;
  certificatesEarned: number;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
  progress: number;
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
            organization: "Tech Solutions Inc",
            position: "Customer Service Rep",
            coursesCompleted: 8,
            certificatesEarned: 5,
            createdAt: "2024-01-15",
            lastLogin: "2024-12-20",
            status: "active",
            progress: 85,
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@healthcarepartners.com",
            organization: "Healthcare Partners",
            position: "Nurse",
            coursesCompleted: 12,
            certificatesEarned: 8,
            createdAt: "2024-02-20",
            lastLogin: "2024-12-19",
            status: "active",
            progress: 92,
          },
          {
            id: "3",
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.johnson@edufoundation.org",
            organization: "Education Foundation",
            position: "Teacher",
            coursesCompleted: 6,
            certificatesEarned: 4,
            createdAt: "2024-03-10",
            lastLogin: "2024-12-18",
            status: "active",
            progress: 78,
          },
          {
            id: "4",
            firstName: "Sarah",
            lastName: "Wilson",
            email: "sarah.wilson@globalservices.com",
            organization: "Global Services Ltd",
            position: "Support Specialist",
            coursesCompleted: 15,
            certificatesEarned: 12,
            createdAt: "2024-01-05",
            lastLogin: "2024-12-20",
            status: "active",
            progress: 95,
          },
          {
            id: "5",
            firstName: "Tom",
            lastName: "Brown",
            email: "tom.brown@innovationhub.com",
            organization: "Innovation Hub",
            position: "Sales Rep",
            coursesCompleted: 3,
            certificatesEarned: 2,
            createdAt: "2024-04-12",
            lastLogin: "2024-11-15",
            status: "inactive",
            progress: 45,
          },
          {
            id: "6",
            firstName: "Lisa",
            lastName: "Davis",
            email: "lisa.davis@techsolutions.com",
            organization: "Tech Solutions Inc",
            position: "Technical Support",
            coursesCompleted: 10,
            certificatesEarned: 7,
            createdAt: "2024-02-28",
            lastLogin: "2024-12-19",
            status: "active",
            progress: 88,
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

  // Filter frontliners based on search term, status, and organization
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
          frontliner.organization
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          frontliner.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.status === statusFilter
      );
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (frontliner) => frontliner.organization === organizationFilter
      );
    }

    setFilteredFrontliners(filtered);
  }, [frontliners, searchTerm, statusFilter, organizationFilter]);

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Name",
        "Email",
        "Organization",
        "Position",
        "Courses Completed",
        "Certificates",
        "Progress",
        "Status",
        "Created",
        "Last Login",
      ],
      ...filteredFrontliners.map((frontliner) => [
        `${frontliner.firstName} ${frontliner.lastName}`,
        frontliner.email,
        frontliner.organization,
        frontliner.position,
        frontliner.coursesCompleted.toString(),
        frontliner.certificatesEarned.toString(),
        `${frontliner.progress}%`,
        frontliner.status,
        new Date(frontliner.createdAt).toLocaleDateString(),
        new Date(frontliner.lastLogin).toLocaleDateString(),
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

  const totalCoursesCompleted = frontliners.reduce(
    (sum, frontliner) => sum + frontliner.coursesCompleted,
    0
  );
  const totalCertificatesEarned = frontliners.reduce(
    (sum, frontliner) => sum + frontliner.certificatesEarned,
    0
  );
  const activeFrontliners = frontliners.filter(
    (frontliner) => frontliner.status === "active"
  ).length;
  const averageProgress =
    frontliners.length > 0
      ? Math.round(
          frontliners.reduce(
            (sum, frontliner) => sum + frontliner.progress,
            0
          ) / frontliners.length
        )
      : 0;
  const uniqueOrganizations = Array.from(
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
                Courses Completed
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalCoursesCompleted}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Certificates Earned
              </CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalCertificatesEarned}
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
                {loading ? "..." : uniqueOrganizations.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <Input
                    placeholder="Search frontliners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Organizations</option>
                  {uniqueOrganizations.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white/80">Name</TableHead>
                      <TableHead className="text-white/80">Email</TableHead>
                      <TableHead className="text-white/80">
                        Organization
                      </TableHead>
                      <TableHead className="text-white/80">Position</TableHead>
                      <TableHead className="text-white/80">Courses</TableHead>
                      <TableHead className="text-white/80">
                        Certificates
                      </TableHead>
                      <TableHead className="text-white/80">Progress</TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">Created</TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFrontliners.map((frontliner) => (
                      <TableRow key={frontliner.id} className="border-white/10">
                        <TableCell className="text-white font-medium">
                          {frontliner.firstName} {frontliner.lastName}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {frontliner.email}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {frontliner.organization}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {frontliner.position}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {frontliner.coursesCompleted}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {frontliner.certificatesEarned}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/20 rounded-full h-2">
                              <div
                                className="bg-[#00d8cc] h-2 rounded-full"
                                style={{ width: `${frontliner.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              {frontliner.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              frontliner.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {frontliner.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(frontliner.createdAt)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/80 hover:text-white hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
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

export default Frontliners;
