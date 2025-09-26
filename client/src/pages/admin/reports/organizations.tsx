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

interface Organization {
  id: string;
  name: string;
  asset: string;
  subAsset: string;
  subOrganization?: string;
  totalFrontliners: number;
  registeredFrontliners: number;
  subAdminName: string;
  subAdminEmail: string;
  createdAt: string;
  status: "active" | "inactive";
}

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [selectedSubAsset, setSelectedSubAsset] = useState<string>("all");

  // Extract unique values for filters
  const uniqueAssets = Array.from(
    new Set(organizations.map((org) => org.asset))
  ).filter(Boolean);
  const uniqueSubAssets = Array.from(
    new Set(organizations.map((org) => org.subAsset))
  ).filter(Boolean);

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
            asset: "Technology",
            subAsset: "Software Development",
            subOrganization: "Engineering Division",
            totalFrontliners: 50,
            registeredFrontliners: 45,
            subAdminName: "John Smith",
            subAdminEmail: "john.smith@techsolutions.com",
            createdAt: "2024-01-15",
            status: "active",
          },
          {
            id: "2",
            name: "Healthcare Partners",
            asset: "Healthcare",
            subAsset: "Medical Services",
            subOrganization: "Emergency Department",
            totalFrontliners: 85,
            registeredFrontliners: 78,
            subAdminName: "Sarah Johnson",
            subAdminEmail: "sarah.johnson@healthcarepartners.com",
            createdAt: "2024-02-20",
            status: "active",
          },
          {
            id: "3",
            name: "Education Foundation",
            asset: "Education",
            subAsset: "Academic Programs",
            subOrganization: "Primary Education",
            totalFrontliners: 40,
            registeredFrontliners: 32,
            subAdminName: "Michael Brown",
            subAdminEmail: "michael.brown@edufoundation.org",
            createdAt: "2024-03-10",
            status: "active",
          },
          {
            id: "4",
            name: "Global Services Ltd",
            asset: "Technology",
            subAsset: "IT Support",
            subOrganization: "Customer Service",
            totalFrontliners: 170,
            registeredFrontliners: 156,
            subAdminName: "Emily Davis",
            subAdminEmail: "emily.davis@globalservices.com",
            createdAt: "2024-01-05",
            status: "active",
          },
          {
            id: "5",
            name: "Innovation Hub",
            asset: "Technology",
            subAsset: "Research & Development",
            subOrganization: "Innovation Lab",
            totalFrontliners: 30,
            registeredFrontliners: 23,
            subAdminName: "David Wilson",
            subAdminEmail: "david.wilson@innovationhub.com",
            createdAt: "2024-04-12",
            status: "inactive",
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

  // Filter organizations based on all criteria
  useEffect(() => {
    let filtered = organizations;

    // Filter by asset
    if (selectedAsset !== "all") {
      filtered = filtered.filter((org) => org.asset === selectedAsset);
    }

    // Filter by sub-asset
    if (selectedSubAsset !== "all") {
      filtered = filtered.filter((org) => org.subAsset === selectedSubAsset);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.subAdminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.subAdminEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrganizations(filtered);
  }, [organizations, selectedAsset, selectedSubAsset, searchTerm]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAsset("all");
    setSelectedSubAsset("all");
    setSearchTerm("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedAsset !== "all" || selectedSubAsset !== "all" || searchTerm !== "";

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Org ID",
        "Organization Name",
        "Sub-Organization",
        "Total Frontliners",
        "Registered Frontliners",
        "Sub-Admin Name",
        "Sub-Admin Email",
        "Asset",
        "Sub-Asset",
        "Status",
        "Created",
      ],
      ...filteredOrganizations.map((org) => [
        org.id,
        org.name,
        org.subOrganization || "N/A",
        org.totalFrontliners.toString(),
        org.registeredFrontliners.toString(),
        org.subAdminName,
        org.subAdminEmail,
        org.asset,
        org.subAsset,
        org.status,
        new Date(org.createdAt).toLocaleDateString(),
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

  const totalFrontliners = organizations.reduce(
    (sum, org) => sum + org.totalFrontliners,
    0
  );
  const registeredFrontliners = organizations.reduce(
    (sum, org) => sum + org.registeredFrontliners,
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
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : organizations.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Active Organizations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : activeOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : totalFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Registered Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {loading ? "..." : registeredFrontliners}
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

                {/* Search */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-[#2C2C2C]/60">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2C2C2C]/60 h-4 w-4" />
                    <Input
                      placeholder="Search organizations..."
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
                className="bg-dawn hover:bg-[#B85A1A] text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizations Table */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#2C2C2C] flex items-center gap-2">
              <Building2 className="h-5 w-5 text-dawn" />
              Organizations List ({filteredOrganizations.length} results)
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
                      <TableHead className="text-[#2C2C2C]">Org ID</TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Organization Name
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Sub-Organization
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Total Frontliners
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Registered Frontliners
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Sub-Admin Name
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">
                        Sub-Admin Email
                      </TableHead>
                      <TableHead className="text-[#2C2C2C]">Status</TableHead>
                      <TableHead className="text-[#2C2C2C]">Created</TableHead>
                      <TableHead className="text-[#2C2C2C]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id} className="border-white/10">
                        <TableCell className="text-[#2C2C2C] font-medium">
                          {org.id}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {org.name}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {org.subOrganization || "N/A"}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {org.totalFrontliners}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {org.registeredFrontliners}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {org.subAdminName}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
                          {org.subAdminEmail}
                        </TableCell>
                        <TableCell className="text-[#2C2C2C]">
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
                        <TableCell className="text-[#2C2C2C]">
                          {formatDate(org.createdAt)}
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

export default Organizations;
