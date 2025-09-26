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
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SubAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  asset: string;
  subAsset: string;
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

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");

  // Extract unique values for filters
  const uniqueAssets = Array.from(
    new Set(subAdmins.map((subAdmin) => subAdmin.asset))
  ).filter(Boolean);
  const uniqueSubAssets = Array.from(
    new Set(subAdmins.map((subAdmin) => subAdmin.subAsset))
  ).filter(Boolean);

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
            asset: "Technology",
            subAsset: "Software Development",
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
            asset: "Healthcare",
            subAsset: "Medical Services",
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
            asset: "Education",
            subAsset: "Academic Programs",
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
            asset: "Technology",
            subAsset: "IT Support",
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
            asset: "Technology",
            subAsset: "Research & Development",
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

  // Filter sub-admins based on all criteria
  useEffect(() => {
    let filtered = subAdmins;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.asset === selectedAsset
      );
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter(
        (subAdmin) => subAdmin.subAsset === selectedSubAsset
      );
    }

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
  }, [subAdmins, selectedAsset, selectedSubAsset, searchTerm, statusFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAsset("all");
    setSelectedSubAsset("all");
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedAsset !== "all" ||
    selectedSubAsset !== "all" ||
    searchTerm !== "" ||
    statusFilter !== "all";

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Name",
        "Email",
        "Organization",
        "Asset",
        "Sub-Asset",
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
        subAdmin.asset,
        subAdmin.subAsset,
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
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Sub-Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : subAdmins.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Active Sub-Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : activeSubAdmins}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Users Managed
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : uniqueOrganizations}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Asset Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">Asset</Label>
                  <Select
                    value={selectedAsset}
                    onValueChange={setSelectedAsset}
                  >
                    <SelectTrigger className="w-[140px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        All Assets
                      </SelectItem>
                      {uniqueAssets.map((asset) => (
                        <SelectItem
                          key={asset}
                          value={asset}
                          className="text-[#2C2C2C] hover:bg-gray-700"
                        >
                          {asset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asset Sub-Category Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">
                    Asset Sub-Category
                  </Label>
                  <Select
                    value={selectedSubAsset}
                    onValueChange={setSelectedSubAsset}
                  >
                    <SelectTrigger className="w-[160px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Sub-Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        All Sub-Categories
                      </SelectItem>
                      {uniqueSubAssets.map((subAsset) => (
                        <SelectItem
                          key={subAsset}
                          value={subAsset}
                          className="text-[#2C2C2C] hover:bg-gray-700"
                        >
                          {subAsset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] bg-orange-500/20 border-orange-500/30 text-orange-300">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem
                        value="all"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value="active"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value="inactive"
                        className="text-[#2C2C2C] hover:bg-gray-700"
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C2C2C]/60 h-4 w-4" />
                    <Input
                      placeholder="Search sub-admins..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-[200px] pl-10 bg-orange-500/20 border-orange-500/30 text-orange-300 placeholder:text-orange-300/60"
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
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Admins Table */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Shield className="h-5 w-5 text-dawn" />
              Sub-Admins List ({filteredSubAdmins.length} results)
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
                      <TableHead className="text-[#2C2C2C]">
                        Organization
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Users Managed
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">Status</TableHead>
                      <TableHead className="text-[#2C2C2C]">Created</TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Last Login
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Permissions
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubAdmins.map((subAdmin) => (
                      <TableRow key={subAdmin.id} className="border-white/10">
                        <TableCell className="text-[#2C2C2C] font-medium">
                          {subAdmin.firstName} {subAdmin.lastName}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {subAdmin.email}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {subAdmin.organization}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {subAdmin.userCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
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
                        <TableCell className="text-[#2C2C2C]">
                          {formatDate(subAdmin.createdAt)}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {formatDate(subAdmin.lastLogin)}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
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

export default SubAdmins;
