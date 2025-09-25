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
  Shield,
  Search,
  Users,
  Building2,
  Calendar,
  Download,
  Eye,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

interface SubAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  userCount: number;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
  permissions: string[];
}

const SubAdmins = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [filteredSubAdmins, setFilteredSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - replace with actual API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real API data
        const mockSubAdmins: SubAdmin[] = [
          {
            id: "1",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice.johnson@techsolutions.com",
            organization: "Tech Solutions Inc",
            userCount: 45,
            createdAt: "2024-01-15",
            lastLogin: "2024-12-20",
            status: "active",
            permissions: ["user_management", "course_management"],
          },
          {
            id: "2",
            firstName: "Bob",
            lastName: "Smith",
            email: "bob.smith@healthcarepartners.com",
            organization: "Healthcare Partners",
            userCount: 78,
            createdAt: "2024-02-20",
            lastLogin: "2024-12-19",
            status: "active",
            permissions: ["user_management", "reports"],
          },
          {
            id: "3",
            firstName: "Carol",
            lastName: "Davis",
            email: "carol.davis@edufoundation.org",
            organization: "Education Foundation",
            userCount: 32,
            createdAt: "2024-03-10",
            lastLogin: "2024-12-18",
            status: "active",
            permissions: ["course_management", "assessments"],
          },
          {
            id: "4",
            firstName: "David",
            lastName: "Wilson",
            email: "david.wilson@globalservices.com",
            organization: "Global Services Ltd",
            userCount: 156,
            createdAt: "2024-01-05",
            lastLogin: "2024-12-20",
            status: "active",
            permissions: ["user_management", "course_management", "reports"],
          },
          {
            id: "5",
            firstName: "Eva",
            lastName: "Brown",
            email: "eva.brown@innovationhub.com",
            organization: "Innovation Hub",
            userCount: 23,
            createdAt: "2024-04-12",
            lastLogin: "2024-11-15",
            status: "inactive",
            permissions: ["user_management"],
          },
        ];

        setSubAdmins(mockSubAdmins);
        setFilteredSubAdmins(mockSubAdmins);
      } catch (err) {
        console.error("Failed to fetch sub-admins:", err);
        setError("Failed to load sub-admins data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubAdmins();
  }, []);

  // Filter sub-admins based on search term and status
  useEffect(() => {
    let filtered = subAdmins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (subAdmin) =>
          subAdmin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subAdmin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subAdmin.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.status === statusFilter
      );
    }

    setFilteredSubAdmins(filtered);
  }, [subAdmins, searchTerm, statusFilter]);

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Name",
        "Email",
        "Organization",
        "Users",
        "Status",
        "Created",
        "Last Login",
        "Permissions",
      ],
      ...filteredSubAdmins.map((subAdmin) => [
        `${subAdmin.firstName} ${subAdmin.lastName}`,
        subAdmin.email,
        subAdmin.organization,
        subAdmin.userCount.toString(),
        subAdmin.status,
        new Date(subAdmin.createdAt).toLocaleDateString(),
        new Date(subAdmin.lastLogin).toLocaleDateString(),
        subAdmin.permissions.join("; "),
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
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const totalUsers = subAdmins.reduce(
    (sum, subAdmin) => sum + subAdmin.userCount,
    0
  );
  const activeSubAdmins = subAdmins.filter(
    (subAdmin) => subAdmin.status === "active"
  ).length;
  const uniqueOrganizations = new Set(
    subAdmins.map((subAdmin) => subAdmin.organization)
  ).size;

  return (
    <AdminPageLayout
      title="Sub-Admins Report"
      description="Complete overview of all sub-administrators in the system"
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
                Total Sub-Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : subAdmins.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Active Sub-Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : activeSubAdmins}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Users Managed
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : uniqueOrganizations}
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
                    placeholder="Search sub-admins..."
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

        {/* Sub-Admins Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00d8cc]" />
              Sub-Admins List ({filteredSubAdmins.length} results)
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
                      <TableHead className="text-white/80">
                        Users Managed
                      </TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">Created</TableHead>
                      <TableHead className="text-white/80">
                        Last Login
                      </TableHead>
                      <TableHead className="text-white/80">
                        Permissions
                      </TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubAdmins.map((subAdmin) => (
                      <TableRow key={subAdmin.id} className="border-white/10">
                        <TableCell className="text-white font-medium">
                          {subAdmin.firstName} {subAdmin.lastName}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {subAdmin.email}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {subAdmin.organization}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {subAdmin.userCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              subAdmin.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {subAdmin.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(subAdmin.createdAt)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(subAdmin.lastLogin)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex flex-wrap gap-1">
                            {subAdmin.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
                              >
                                {permission.replace("_", " ")}
                              </span>
                            ))}
                          </div>
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

export default SubAdmins;
