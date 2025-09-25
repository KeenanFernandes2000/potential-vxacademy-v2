import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Filter,
  Download,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  eid?: string;
  phoneNumber?: string;
  userType: string;
  organization: string;
  subOrganization?: string;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
}

interface ReportConfig {
  format: "dataTable" | "excel" | "pdf";
  download: "excel" | "csv" | "pdf";
  search: boolean;
  filters: {
    userType: string[];
    organization: string[];
    registrationDate: {
      start: string;
      end: string;
    };
  };
}

const AllUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    format: "dataTable",
    download: "excel",
    search: true,
    filters: {
      userType: [],
      organization: [],
      registrationDate: {
        start: "",
        end: "",
      },
    },
  });
  const [showFilters, setShowFilters] = useState(false);

  // API object for user operations
  const api = {
    async getAllUsers(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/users/users`, {
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
        console.error("Failed to fetch users:", error);
        throw error;
      }
    },

    async generateReport(token: string, config: ReportConfig) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(config),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to generate report:", error);
        throw error;
      }
    },

    async getOrganizations(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/organizations`, {
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
        console.error("Failed to fetch organizations:", error);
        throw error;
      }
    },
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getAllUsers(token);
        const usersData = response.data || [];

        // Transform the data to match our interface
        const transformedUsers: User[] = usersData.map((user: any) => ({
          id: user.id,
          firstName: user.firstName || "N/A",
          lastName: user.lastName || "N/A",
          email: user.email || "N/A",
          eid: user.eid || "N/A",
          phoneNumber: user.phoneNumber || "N/A",
          userType: user.userType || "user",
          organization: user.organization?.name || "N/A",
          subOrganization: user.subOrganization || "N/A",
          createdAt: user.createdAt || "N/A",
          lastLogin: user.lastLogin || "N/A",
          status: user.isActive ? "active" : "inactive",
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Filter users based on type
  useEffect(() => {
    let filtered = users;

    // Filter by user type
    if (filterType !== "all") {
      filtered = filtered.filter((user) => user.userType === filterType);
    }

    setFilteredUsers(filtered);
  }, [users, filterType]);

  // Configuration update functions
  const updateReportConfig = (updates: Partial<ReportConfig>) => {
    setReportConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleExport = async () => {
    try {
      const response = await api.generateReport(token!, reportConfig);

      if (reportConfig.download === "excel") {
        // Handle Excel download
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-report-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (reportConfig.download === "csv") {
        // Handle CSV download
        const csvContent = generateCSVContent();
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-report-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export report");
    }
  };

  const generateCSVContent = () => {
    const headers = [
      "Name",
      "Email",
      "Type",
      "Organization",
      "Status",
      "Created",
      "Last Login",
    ];

    const data = filteredUsers.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      user.userType,
      user.organization,
      user.status,
      formatDate(user.createdAt),
      formatDate(user.lastLogin),
    ]);

    return [headers, ...data].map((row) => row.join(",")).join("\n");
  };

  const formatDate = (dateString: string) => {
    if (dateString === "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  return (
    <AdminPageLayout
      title="All Users Report"
      description="Complete overview of all users in the system"
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
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : users.filter((u) => u.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Organizations
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : new Set(users.map((u) => u.organization)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Filtered Results
              </CardTitle>
              <Filter className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {filteredUsers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions - Right above the table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="outline"
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                >
                  User Type <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                >
                  Organization <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                >
                  Registration Date <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <Button
                onClick={handleExport}
                className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00d8cc]" />
              Users List ({filteredUsers.length} results)
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
                      <TableHead className="text-white/80">Type</TableHead>
                      <TableHead className="text-white/80">
                        Organization
                      </TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">Created</TableHead>
                      <TableHead className="text-white/80">
                        Last Login
                      </TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-white/10">
                        <TableCell className="text-white">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.userType === "admin"
                                ? "bg-red-500/20 text-red-300"
                                : user.userType === "sub_admin"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {user.userType}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {user.organization}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(user.lastLogin)}
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

export default AllUsers;
