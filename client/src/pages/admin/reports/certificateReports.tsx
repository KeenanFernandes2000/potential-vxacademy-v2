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
  Award,
  Search,
  Users,
  Calendar,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  BookOpen,
  Building2,
} from "lucide-react";

interface Certificate {
  id: string;
  certificateNumber: string;
  recipientName: string;
  recipientEmail: string;
  organization: string;
  courseName: string;
  trainingArea: string;
  issuedDate: string;
  expiryDate: string;
  status: "valid" | "expired" | "revoked";
  issuedBy: string;
  grade: number;
  completionDate: string;
}

const CertificateReports = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call - replace with actual API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with real API data
        const mockCertificates: Certificate[] = [
          {
            id: "1",
            certificateNumber: "CERT-2024-001",
            recipientName: "John Doe",
            recipientEmail: "john.doe@techsolutions.com",
            organization: "Tech Solutions Inc",
            courseName: "Customer Service Excellence",
            trainingArea: "Customer Service",
            issuedDate: "2024-01-15",
            expiryDate: "2025-01-15",
            status: "valid",
            issuedBy: "Admin User",
            grade: 95,
            completionDate: "2024-01-14",
          },
          {
            id: "2",
            certificateNumber: "CERT-2024-002",
            recipientName: "Jane Smith",
            recipientEmail: "jane.smith@healthcarepartners.com",
            organization: "Healthcare Partners",
            courseName: "Healthcare Communication",
            trainingArea: "Healthcare",
            issuedDate: "2024-02-20",
            expiryDate: "2025-02-20",
            status: "valid",
            issuedBy: "Admin User",
            grade: 98,
            completionDate: "2024-02-19",
          },
          {
            id: "3",
            certificateNumber: "CERT-2024-003",
            recipientName: "Mike Johnson",
            recipientEmail: "mike.johnson@edufoundation.org",
            organization: "Education Foundation",
            courseName: "Technical Support Fundamentals",
            trainingArea: "Technical",
            issuedDate: "2024-03-10",
            expiryDate: "2025-03-10",
            status: "valid",
            issuedBy: "Admin User",
            grade: 87,
            completionDate: "2024-03-09",
          },
          {
            id: "4",
            certificateNumber: "CERT-2024-004",
            recipientName: "Sarah Wilson",
            recipientEmail: "sarah.wilson@globalservices.com",
            organization: "Global Services Ltd",
            courseName: "Sales and Marketing",
            trainingArea: "Sales",
            issuedDate: "2024-01-05",
            expiryDate: "2025-01-05",
            status: "valid",
            issuedBy: "Admin User",
            grade: 92,
            completionDate: "2024-01-04",
          },
          {
            id: "5",
            certificateNumber: "CERT-2023-005",
            recipientName: "Tom Brown",
            recipientEmail: "tom.brown@innovationhub.com",
            organization: "Innovation Hub",
            courseName: "Leadership Development",
            trainingArea: "Leadership",
            issuedDate: "2023-12-15",
            expiryDate: "2024-12-15",
            status: "expired",
            issuedBy: "Admin User",
            grade: 89,
            completionDate: "2023-12-14",
          },
          {
            id: "6",
            certificateNumber: "CERT-2024-006",
            recipientName: "Lisa Davis",
            recipientEmail: "lisa.davis@techsolutions.com",
            organization: "Tech Solutions Inc",
            courseName: "Data Analysis Basics",
            trainingArea: "Analytics",
            issuedDate: "2024-02-28",
            expiryDate: "2025-02-28",
            status: "valid",
            issuedBy: "Admin User",
            grade: 91,
            completionDate: "2024-02-27",
          },
        ];

        setCertificates(mockCertificates);
        setFilteredCertificates(mockCertificates);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
        setError("Failed to load certificates data");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search term, status, organization, and date range
  useEffect(() => {
    let filtered = certificates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.recipientEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          cert.certificateNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((cert) => cert.status === statusFilter);
    }

    // Filter by organization
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (cert) => cert.organization === organizationFilter
      );
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const currentYear = now.getFullYear();

      filtered = filtered.filter((cert) => {
        const issuedDate = new Date(cert.issuedDate);
        const issuedYear = issuedDate.getFullYear();

        switch (dateRange) {
          case "this_year":
            return issuedYear === currentYear;
          case "last_year":
            return issuedYear === currentYear - 1;
          case "last_6_months":
            const sixMonthsAgo = new Date(
              now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
            );
            return issuedDate >= sixMonthsAgo;
          case "last_3_months":
            const threeMonthsAgo = new Date(
              now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000
            );
            return issuedDate >= threeMonthsAgo;
          default:
            return true;
        }
      });
    }

    setFilteredCertificates(filtered);
  }, [certificates, searchTerm, statusFilter, organizationFilter, dateRange]);

  const handleExport = () => {
    // Implement CSV export functionality
    const csvContent = [
      [
        "Certificate #",
        "Recipient",
        "Email",
        "Organization",
        "Course",
        "Training Area",
        "Grade",
        "Status",
        "Issued Date",
        "Expiry Date",
        "Issued By",
      ],
      ...filteredCertificates.map((cert) => [
        cert.certificateNumber,
        cert.recipientName,
        cert.recipientEmail,
        cert.organization,
        cert.courseName,
        cert.trainingArea,
        cert.grade.toString(),
        cert.status,
        new Date(cert.issuedDate).toLocaleDateString(),
        new Date(cert.expiryDate).toLocaleDateString(),
        cert.issuedBy,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificates-report.csv";
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

  const totalCertificates = certificates.length;
  const validCertificates = certificates.filter(
    (cert) => cert.status === "valid"
  ).length;
  const expiredCertificates = certificates.filter(
    (cert) => cert.status === "expired"
  ).length;
  const revokedCertificates = certificates.filter(
    (cert) => cert.status === "revoked"
  ).length;
  const averageGrade =
    certificates.length > 0
      ? Math.round(
          certificates.reduce((sum, cert) => sum + cert.grade, 0) /
            certificates.length
        )
      : 0;
  const uniqueOrganizations = Array.from(
    new Set(certificates.map((cert) => cert.organization))
  );
  const uniqueTrainingAreas = Array.from(
    new Set(certificates.map((cert) => cert.trainingArea))
  );

  // Calculate certificates issued this year
  const currentYear = new Date().getFullYear();
  const certificatesThisYear = certificates.filter(
    (cert) => new Date(cert.issuedDate).getFullYear() === currentYear
  ).length;

  return (
    <AdminPageLayout
      title="Certificate Reports"
      description="Complete overview of all certificates issued in the system"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalCertificates}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Valid Certificates
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : validCertificates}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Issued This Year
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : certificatesThisYear}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Average Grade
              </CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : averageGrade}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Expired Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : expiredCertificates}
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

          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Training Areas
              </CardTitle>
              <BookOpen className="h-4 w-4 text-[#00d8cc]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : uniqueTrainingAreas.length}
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
                    placeholder="Search certificates..."
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
                  <option value="valid">Valid</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
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
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="this_year">This Year</option>
                  <option value="last_year">Last Year</option>
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="last_3_months">Last 3 Months</option>
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

        {/* Certificates Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-[#00d8cc]" />
              Certificates List ({filteredCertificates.length} results)
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
                        Certificate #
                      </TableHead>
                      <TableHead className="text-white/80">Recipient</TableHead>
                      <TableHead className="text-white/80">
                        Organization
                      </TableHead>
                      <TableHead className="text-white/80">Course</TableHead>
                      <TableHead className="text-white/80">
                        Training Area
                      </TableHead>
                      <TableHead className="text-white/80">Grade</TableHead>
                      <TableHead className="text-white/80">Status</TableHead>
                      <TableHead className="text-white/80">
                        Issued Date
                      </TableHead>
                      <TableHead className="text-white/80">
                        Expiry Date
                      </TableHead>
                      <TableHead className="text-white/80">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((cert) => (
                      <TableRow key={cert.id} className="border-white/10">
                        <TableCell className="text-white font-medium">
                          {cert.certificateNumber}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div>
                            <div className="font-medium">
                              {cert.recipientName}
                            </div>
                            <div className="text-xs text-white/60">
                              {cert.recipientEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {cert.organization}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {cert.courseName}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {cert.trainingArea}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {cert.grade}%
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              cert.status === "valid"
                                ? "bg-green-500/20 text-green-300"
                                : cert.status === "expired"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {cert.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(cert.issuedDate)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatDate(cert.expiryDate)}
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

export default CertificateReports;
