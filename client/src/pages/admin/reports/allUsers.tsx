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
  Building2,
  Award,
  BookOpen,
  TrendingUp,
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
  vxPoints?: number;
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
  generalStats: {
    totalFrontliners: number;
    totalOrganizations: number;
    totalCertificatesIssued: number;
    totalCompletedAlMidhyaf: number;
    totalVxPointsEarned: number;
    overallProgress: number;
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
  const [selectedRegistrationDate, setSelectedRegistrationDate] =
    useState<string>("all");

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

    // Filter by registration date
    if (selectedRegistrationDate !== "all") {
      filtered = filtered.filter((user) => {
        if (user.registrationDate === "N/A") return false;
        const userDate = new Date(user.registrationDate);
        const filterDate = new Date(selectedRegistrationDate + "-01");
        return (
          userDate.getFullYear() === filterDate.getFullYear() &&
          userDate.getMonth() === filterDate.getMonth()
        );
      });
    }

    setFilteredUsers(filtered);
  }, [
    reportData,
    selectedUserType,
    selectedOrganization,
    selectedRegistrationDate,
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedUserType("all");
    setSelectedOrganization("all");
    setSelectedRegistrationDate("all");
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedUserType !== "all" ||
    selectedOrganization !== "all" ||
    selectedRegistrationDate !== "all";

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
    "Sub-Organization": user.subOrganization || "N/A",
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
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Frontliners
              </CardTitle>
              <Users className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalFrontliners}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalOrganizations}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total Certificates Issued
              </CardTitle>
              <Award className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCertificatesIssued}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total VX Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalVxPointsEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Total who completed Al Midyaf
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.totalCompletedAlMidhyaf}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2C2C2C]">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-dawn" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2C2C2C]">
                {reportData.generalStats.overallProgress}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
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
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {reportData.filters.organizations.map((org) => (
                    <SelectItem key={org.value} value={org.value}>
                      {org.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="registrationDateFilter"
                className="text-[#2C2C2C]"
              >
                Registration Date
              </Label>
              <Select
                value={selectedRegistrationDate}
                onValueChange={setSelectedRegistrationDate}
              >
                <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C]">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  {reportData.filters.registrationDates.map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Data Table Columns - Matching the image */}

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
