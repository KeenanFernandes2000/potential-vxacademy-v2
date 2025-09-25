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
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  organization: string;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
}

const AllUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

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
          userType: user.userType || "user",
          organization: user.organization?.name || "N/A",
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

  // Filter users based on search term and type
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by user type
    if (filterType !== "all") {
      filtered = filtered.filter((user) => user.userType === filterType);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterType]);

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Name",
        "Email",
        "Type",
        "Organization",
        "Status",
        "Created",
        "Last Login",
      ],
      ...filteredUsers.map((user) => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.userType,
        user.organization,
        user.status,
        new Date(user.createdAt).toLocaleDateString(),
        new Date(user.lastLogin).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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

        {/* Filters and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="admin">Admin</option>
                  <option value="sub_admin">Sub-Admin</option>
                  <option value="user">User</option>
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

        {/* Users Table */}
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
