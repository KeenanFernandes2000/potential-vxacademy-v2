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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, Filter } from "lucide-react";

// Mock data for Al Midhyaf COC
const mockData = [
  {
    id: 1,
    participantName: "Ahmed Al-Rashid",
    organization: "Ministry of Health",
    department: "Emergency Services",
    enrollmentDate: "2024-01-15",
    completionDate: "2024-02-20",
    status: "Completed",
    score: 95,
    certificateIssued: "2024-02-21",
    courseVersion: "v2.1",
  },
  {
    id: 2,
    participantName: "Fatima Al-Zahra",
    organization: "Dubai Health Authority",
    department: "Patient Care",
    enrollmentDate: "2024-01-20",
    completionDate: "2024-02-25",
    status: "Completed",
    score: 88,
    certificateIssued: "2024-02-26",
    courseVersion: "v2.1",
  },
  {
    id: 3,
    participantName: "Mohammed Al-Sabah",
    organization: "Abu Dhabi Health Services",
    department: "Emergency Response",
    enrollmentDate: "2024-02-01",
    completionDate: null,
    status: "In Progress",
    score: null,
    certificateIssued: null,
    courseVersion: "v2.1",
  },
  {
    id: 4,
    participantName: "Aisha Al-Mansouri",
    organization: "Sharjah Health Authority",
    department: "Quality Assurance",
    enrollmentDate: "2024-02-10",
    completionDate: "2024-03-15",
    status: "Completed",
    score: 92,
    certificateIssued: "2024-03-16",
    courseVersion: "v2.1",
  },
  {
    id: 5,
    participantName: "Omar Al-Hashimi",
    organization: "Ministry of Health",
    department: "Training & Development",
    enrollmentDate: "2024-02-15",
    completionDate: null,
    status: "Not Started",
    score: null,
    certificateIssued: null,
    courseVersion: "v2.1",
  },
];

const AlMidhyafCoc = () => {
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");

  // Calculate summary statistics
  const totalParticipants = data.length;
  const completedParticipants = data.filter(
    (item) => item.status === "Completed"
  ).length;
  const inProgressParticipants = data.filter(
    (item) => item.status === "In Progress"
  ).length;
  const notStartedParticipants = data.filter(
    (item) => item.status === "Not Started"
  ).length;
  const averageScore =
    data
      .filter((item) => item.score !== null)
      .reduce((acc, item) => acc + item.score!, 0) /
    data.filter((item) => item.score !== null).length;

  useEffect(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.participantName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Apply organization filter
    if (organizationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.organization === organizationFilter
      );
    }

    setFilteredData(filtered);
  }, [data, searchTerm, statusFilter, organizationFilter]);

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Participant Name",
        "Organization",
        "Department",
        "Enrollment Date",
        "Completion Date",
        "Status",
        "Score",
        "Certificate Issued",
        "Course Version",
      ],
      ...filteredData.map((item) => [
        item.participantName,
        item.organization,
        item.department,
        item.enrollmentDate,
        item.completionDate || "N/A",
        item.status,
        item.score || "N/A",
        item.certificateIssued || "N/A",
        item.courseVersion,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "al-midhyaf-coc-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-400 bg-green-400/20";
      case "In Progress":
        return "text-blue-400 bg-blue-400/20";
      case "Not Started":
        return "text-white/60 bg-white/10";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  return (
    <AdminPageLayout
      title="Al Midhyaf COC Report"
      description="Comprehensive report on Al Midhyaf Code of Conduct training participation and completion"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalParticipants}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {completedParticipants}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {inProgressParticipants}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Not Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white/60">
                {notStartedParticipants}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {averageScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white">Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                    size={16}
                  />
                  <Input
                    placeholder="Search participants, organizations, or departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={organizationFilter}
                onValueChange={setOrganizationFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="Ministry of Health">
                    Ministry of Health
                  </SelectItem>
                  <SelectItem value="Dubai Health Authority">
                    Dubai Health Authority
                  </SelectItem>
                  <SelectItem value="Abu Dhabi Health Services">
                    Abu Dhabi Health Services
                  </SelectItem>
                  <SelectItem value="Sharjah Health Authority">
                    Sharjah Health Authority
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} className="w-full sm:w-auto">
                <Download className="mr-2" size={16} />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
          <CardHeader>
            <CardTitle className="text-white">
              Al Midhyaf COC Training Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/80">
                      Participant Name
                    </TableHead>
                    <TableHead className="text-white/80">
                      Organization
                    </TableHead>
                    <TableHead className="text-white/80">Department</TableHead>
                    <TableHead className="text-white/80">
                      Enrollment Date
                    </TableHead>
                    <TableHead className="text-white/80">
                      Completion Date
                    </TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                    <TableHead className="text-white/80">Score</TableHead>
                    <TableHead className="text-white/80">
                      Certificate Issued
                    </TableHead>
                    <TableHead className="text-white/80">
                      Course Version
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-white/20 hover:bg-white/5"
                    >
                      <TableCell className="font-medium text-white">
                        {item.participantName}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.organization}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.department}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.enrollmentDate}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.completionDate || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.score ? `${item.score}%` : "N/A"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.certificateIssued || "N/A"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.courseVersion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
};

export default AlMidhyafCoc;
