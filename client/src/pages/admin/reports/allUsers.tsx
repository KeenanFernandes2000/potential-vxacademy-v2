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
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  // Filter states
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Extract unique values for filters
  const uniqueUserTypes = Array.from(
    new Set(users.map((user) => user.userType))
  ).filter(Boolean);
  const uniqueOrganizations = Array.from(
    new Set(users.map((user) => user.organization))
  ).filter((org) => org !== "N/A");

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
          organization: user.organization || "N/A",
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

  // Filter users based on all criteria
  useEffect(() => {
    let filtered = users;

    // Filter by user type
    if (selectedUserType !== "all") {
      filtered = filtered.filter((user) => user.userType === selectedUserType);
    }

    // Filter by organization
    if (selectedOrganization !== "all") {
      filtered = filtered.filter(
        (user) => user.organization === selectedOrganization
      );
    }

    // Filter by registration date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((user) => {
        if (user.createdAt === "N/A") return false;

        const userDate = new Date(user.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && userDate < startDate) return false;
        if (endDate && userDate > endDate) return false;

        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, selectedUserType, selectedOrganization, dateRange]);

  // Configuration update functions
  const updateReportConfig = (updates: Partial<ReportConfig>) => {
    setReportConfig((prev) => ({ ...prev, ...updates }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedUserType("all");
    setSelectedOrganization("all");
    setDateRange({ start: "", end: "" });
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedUserType !== "all" ||
    selectedOrganization !== "all" ||
    dateRange.start ||
    dateRange.end;

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
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading
                  ? "..."
                  : users.filter((u) => u.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Organizations
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading
                  ? "..."
                  : new Set(users.map((u) => u.organization)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Filtered Results
              </CardTitle>
              <Filter className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {filteredUsers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions - Right above the table */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                {/* User Type Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">User Type</Label>
                  <Select
                    value={selectedUserType}
                    onValueChange={setSelectedUserType}
                  >
                    <SelectTrigger className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        All Types
                      </SelectItem>
                      {uniqueUserTypes.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="text-[#2C2C2C] hover:bg-gray-700"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">
                    Organization
                  </Label>
                  <Select
                    value={selectedOrganization}
                    onValueChange={setSelectedOrganization}
                  >
                    <SelectTrigger className="w-[160px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Organizations" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        All Organizations
                      </SelectItem>
                      {uniqueOrganizations.map((org) => (
                        <SelectItem
                          key={org}
                          value={org}
                          className="text-[#2C2C2C] hover:bg-gray-700"
                        >
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Registration Date Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">
                    Registration Date
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300 placeholder:text-orange-300/60"
                      placeholder="Start Date"
                    />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300 placeholder:text-orange-300/60"
                      placeholder="End Date"
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
                className="bg-dawn hover:bg-[#B85A1A] text-[#2C2C2C]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Users className="h-5 w-5 text-dawn" />
              Users List ({filteredUsers.length} results)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-dawn animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-[#2C2C2C]">Name</TableHead>
                      <TableHead className="text-[#2C2C2C]">Email</TableHead>
                      <TableHead className="text-[#2C2C2C]">Type</TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Organization
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">Status</TableHead>
                      <TableHead className="text-[#2C2C2C]">Created</TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Last Login
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-white/10">
                        <TableCell className="text-[#2C2C2C]">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
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
                        <TableCell className="text-[#2C2C2C]">
                          {user.organization}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
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
                        <TableCell className="text-[#2C2C2C]">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-white/10"
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
