import React, { useState, useEffect, useRef } from "react";
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
  Building2,
  Award,
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
import AdminTableLayout from "@/components/adminTableLayout";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  eid?: string;
  phoneNumber?: string;
  userType: string;
  organization: string;
  subOrganization?: string;
  registrationDate: string;
  lastLoginDate: string;
  asset?: string;
  subAsset?: string;
  roleCategory?: string;
  role?: string;
  seniority?: string;
  frontlinerType?: string;
  // vxPoints?: number;
  overallProgress?: number;
}

interface ReportData {
  filters: {
    userTypes: Array<{ value: string; label: string }>;
    organizations: Array<{ value: string; label: string }>;
    registrationDates: Array<{ value: string; label: string }>;
  };
  dataTableColumns: string[];
  dataTableRows: User[];
  userTypeStats: {
    totalUsers: number;
    totalFrontliners: number;
    totalSubAdmins: number;
    totalAdmins: number;
  };
}

const AllUsers = () => {
  const { token } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>("all");
  const [selectedRegistrationDateRange, setSelectedRegistrationDateRange] =
    useState<{
      from: string;
      to: string;
    }>({ from: "", to: "" });

  // Organization search state
  const [organizationSearchQuery, setOrganizationSearchQuery] =
    useState<string>("");
  const [showOrganizationDropdown, setShowOrganizationDropdown] =
    useState<boolean>(false);
  const organizationDropdownRef = useRef<HTMLDivElement>(null);

  // API object for user operations
  const api = {
    async getUsersReport(token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/reports/users`, {
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
        console.error("Failed to fetch users report:", error);
        throw error;
      }
    },
  };

  useEffect(() => {
    const fetchUsersReport = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.getUsersReport(token);
        const reportData = response.data;

        setReportData(reportData);
        setFilteredUsers(reportData.dataTableRows);
      } catch (err) {
        console.error("Failed to fetch users report:", err);
        setError("Failed to load users report data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersReport();
  }, [token]);

  // Handle click outside to close organization dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        organizationDropdownRef.current &&
        !organizationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowOrganizationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter users based on all criteria
  useEffect(() => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

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
    if (
      selectedRegistrationDateRange.from ||
      selectedRegistrationDateRange.to
    ) {
      filtered = filtered.filter((user) => {
        if (user.registrationDate === "N/A") return false;
        const userDate = new Date(user.registrationDate);

        // If only from date is set
        if (
          selectedRegistrationDateRange.from &&
          !selectedRegistrationDateRange.to
        ) {
          const fromDate = new Date(selectedRegistrationDateRange.from);
          return userDate >= fromDate;
        }

        // If only to date is set
        if (
          !selectedRegistrationDateRange.from &&
          selectedRegistrationDateRange.to
        ) {
          const toDate = new Date(selectedRegistrationDateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          return userDate <= toDate;
        }

        // If both dates are set
        if (
          selectedRegistrationDateRange.from &&
          selectedRegistrationDateRange.to
        ) {
          const fromDate = new Date(selectedRegistrationDateRange.from);
          const toDate = new Date(selectedRegistrationDateRange.to);
          toDate.setHours(23, 59, 59, 999); // Include the entire day
          return userDate >= fromDate && userDate <= toDate;
        }

        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [
    reportData,
    selectedUserType,
    selectedOrganization,
    selectedRegistrationDateRange,
  ]);

  // Filter organizations based on search query
  const filteredOrganizations =
    reportData?.filters.organizations.filter((org) =>
      org.label.toLowerCase().includes(organizationSearchQuery.toLowerCase())
    ) || [];

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedUserType("all");
    setSelectedOrganization("all");
    setSelectedRegistrationDateRange({ from: "", to: "" });
    setOrganizationSearchQuery("");
    setShowOrganizationDropdown(false);
  };

  // Handle organization selection
  const handleOrganizationSelect = (organization: string) => {
    setSelectedOrganization(organization);
    if (organization === "all") {
      setOrganizationSearchQuery("");
    } else {
      const selectedOrg = reportData?.filters.organizations.find(
        (org) => org.value === organization
      );
      setOrganizationSearchQuery(selectedOrg?.label || "");
    }
    setShowOrganizationDropdown(false);
  };

  // Handle organization search input
  const handleOrganizationSearch = (query: string) => {
    setOrganizationSearchQuery(query);
    setShowOrganizationDropdown(true);
  };

  // Handle date range changes
  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    setSelectedRegistrationDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedUserType !== "all" ||
    selectedOrganization !== "all" ||
    selectedRegistrationDateRange.from !== "" ||
    selectedRegistrationDateRange.to !== "";

  // Handle search
  const handleSearch = (query: string) => {
    if (!reportData) return;

    let filtered = reportData.dataTableRows;

    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.organization.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      reportData.dataTableColumns,
      ...filteredUsers.map((user) => [
        user.userId,
        user.firstName,
        user.lastName,
        user.email,
        user.eid || "N/A",
        user.phoneNumber || "N/A",
        user.userType,
        user.organization,
        Array.isArray(user.subOrganization)
          ? user.subOrganization.join("; ")
          : (user.subOrganization || "N/A").toString().replace(/,/g, ";"),
        formatDate(user.registrationDate),
        formatDate(user.lastLoginDate),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-users-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    if (dateString === "N/A" || !dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // Prepare table data for AdminTableLayout
  const tableData = filteredUsers.map((user) => ({
    "User ID": user.userId,
    "First Name": user.firstName,
    "Last Name": user.lastName,
    "Email Address": user.email,
    EID: user.eid || "N/A",
    "Phone Number": user.phoneNumber || "N/A",
    "User Type": user.userType,
    Organization: user.organization,
    "Sub-Organization": Array.isArray(user.subOrganization)
      ? user.subOrganization.join(", ")
      : (user.subOrganization || "N/A").toString(),
    "Registration Date": formatDate(user.registrationDate),
    "Last Login Date": formatDate(user.lastLoginDate),
  }));

  if (loading) {
    return (
      <AdminPageLayout
        title="All Users Report"
        description="Complete overview of all users in the system"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-dawn animate-spin" />
        </div>
      </AdminPageLayout>
    );
  }

  if (error) {
    return (
      <AdminPageLayout
        title="All Users Report"
        description="Complete overview of all users in the system"
      >
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </AdminPageLayout>
    );
  }

  if (!reportData) {
    return (
      <AdminPageLayout
        title="All Users Report"
        description="Complete overview of all users in the system"
      >
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="All Users Report"
      description="Complete overview of all users in the system"
    >
      <div className="space-y-6">
        {/* User Type Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C2C2C]">
                {reportData.userTypeStats.totalUsers}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All users in the platform
              </p>
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
              <div className="text-3xl font-bold text-[#2C2C2C]">
                {reportData.userTypeStats.totalFrontliners}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                All registered frontliners
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Sub-Admins
              </CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C2C2C]">
                {reportData.userTypeStats.totalSubAdmins}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Registered sub-admins
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Admins
              </CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2C2C2C]">
                {reportData.userTypeStats.totalAdmins}
              </div>
              <p className="text-xs text-gray-500 mt-1">Assigned admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dawn">Filter By</h3>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
                className="text-dawn border-dawn hover:bg-dawn hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userTypeFilter" className="text-[#2C2C2C]">
                User Type
              </Label>
              <Select
                value={selectedUserType}
                onValueChange={setSelectedUserType}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportData.filters.userTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationFilter" className="text-[#2C2C2C]">
                Organization
              </Label>
              <div className="relative" ref={organizationDropdownRef}>
                <Input
                  value={organizationSearchQuery}
                  onChange={(e) => handleOrganizationSearch(e.target.value)}
                  onFocus={() => setShowOrganizationDropdown(true)}
                  placeholder={
                    selectedOrganization === "all"
                      ? "All Organizations"
                      : "Search organizations..."
                  }
                  className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] pr-8"
                />
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() =>
                    setShowOrganizationDropdown(!showOrganizationDropdown)
                  }
                />

                {showOrganizationDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                      className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => handleOrganizationSelect("all")}
                    >
                      All Organizations
                    </div>
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <div
                          key={org.value}
                          className="px-3 py-2 text-sm text-[#2C2C2C] hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOrganizationSelect(org.value)}
                        >
                          {org.label}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No organizations found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="registrationDateFilter"
                className="text-[#2C2C2C] text-center block"
              >
                Registration Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={selectedRegistrationDateRange.from}
                    onChange={(e) =>
                      handleDateRangeChange("from", e.target.value)
                    }
                    placeholder="From date"
                    className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={selectedRegistrationDateRange.to}
                    onChange={(e) =>
                      handleDateRangeChange("to", e.target.value)
                    }
                    placeholder="To date"
                    className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleExportCSV}
            className="bg-dawn hover:bg-[#B85A1A] text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Data Table */}
        <AdminTableLayout
          searchPlaceholder="Search users..."
          tableData={tableData}
          columns={reportData.dataTableColumns}
          onSearch={handleSearch}
        />
      </div>
    </AdminPageLayout>
  );
};

export default AllUsers;
