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
  Building2,
  Search,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  Loader2,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  userCount: number;
  subAdminCount: number;
  createdAt: string;
  status: "active" | "inactive";
  lastActivity: string;
}

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - replace with actual API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real API data
        const mockOrganizations: Organization[] = [
          {
            id: "1",
            name: "Tech Solutions Inc",
            email: "contact@techsolutions.com",
            contactPerson: "John Smith",
            userCount: 45,
            subAdminCount: 3,
            createdAt: "2024-01-15",
            status: "active",
            lastActivity: "2024-12-20",
          },
          {
            id: "2",
            name: "Healthcare Partners",
            email: "admin@healthcarepartners.com",
            contactPerson: "Sarah Johnson",
            userCount: 78,
            subAdminCount: 5,
            createdAt: "2024-02-20",
            status: "active",
            lastActivity: "2024-12-19",
          },
          {
            id: "3",
            name: "Education Foundation",
            email: "info@edufoundation.org",
            contactPerson: "Michael Brown",
            userCount: 32,
            subAdminCount: 2,
            createdAt: "2024-03-10",
            status: "active",
            lastActivity: "2024-12-18",
          },
          {
            id: "4",
            name: "Global Services Ltd",
            email: "contact@globalservices.com",
            contactPerson: "Emily Davis",
            userCount: 156,
            subAdminCount: 8,
            createdAt: "2024-01-05",
            status: "active",
            lastActivity: "2024-12-20",
          },
          {
            id: "5",
            name: "Innovation Hub",
            email: "hello@innovationhub.com",
            contactPerson: "David Wilson",
            userCount: 23,
            subAdminCount: 1,
            createdAt: "2024-04-12",
            status: "inactive",
            lastActivity: "2024-11-15",
          },
        ];

        setOrganizations(mockOrganizations);
        setFilteredOrganizations(mockOrganizations);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
        setError("Failed to load organizations data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    } else {
      setFilteredOrganizations(organizations);
    }
  }, [organizations, searchTerm]);

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Organization",
        "Email",
        "Contact Person",
        "Users",
        "Sub-Admins",
        "Status",
        "Created",
        "Last Activity",
      ],
      ...filteredOrganizations.map((org) => [
        org.name,
        org.email,
        org.contactPerson,
        org.userCount.toString(),
        org.subAdminCount.toString(),
        org.status,
        new Date(org.createdAt).toLocaleDateString(),
        new Date(org.lastActivity).toLocaleDateString(),
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
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);
  const totalSubAdmins = organizations.reduce(
    (sum, org) => sum + org.subAdminCount,
    0
  );
  const activeOrganizations = organizations.filter(
    (org) => org.status === "active"
  ).length;

  return (
    <AdminPageLayout
      title="Organizations Report"
      description="Complete overview of all organizations in the system"
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
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : organizations.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Active Organizations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : activeOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Users
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
                Sub-Admins
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalSubAdmins}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
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
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#00d8cc]" />
              Organizations List ({filteredOrganizations.length} results)
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
                      <TableHead className="text-white/80">
                        Organization
                      </TableHead>
                      <TableHead className="text-white/80">
                        Contact Person
                      </TableHead>
                      <TableHead className="text-white/80">Email</TableHead>
                      <TableHead className="text-white/80">Users</TableHead>
                      <TableHead className="text-white/80">
                        Sub-Admins
                      </TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">Created</TableHead>
                      <TableHead className="text-white/80">
                        Last Activity
                      </TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id} className="border-white/10">
                        <TableCell className="text-white font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {org.contactPerson}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {org.email}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {org.userCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {org.subAdminCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              org.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {org.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(org.createdAt)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(org.lastActivity)}
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

export default Organizations;
