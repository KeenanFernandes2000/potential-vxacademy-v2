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

// Mock data for AD Information
const mockData = [
  {
    id: 1,
    participantName: "Sarah Al-Maktoum",
    organization: "Abu Dhabi Government",
    department: "Information Technology",
    enrollmentDate: "2024-01-10",
    completionDate: "2024-02-15",
    status: "Completed",
    score: 92,
    certificateIssued: "2024-02-16",
    courseVersion: "v1.3",
    dataClassification: "Confidential",
  },
  {
    id: 2,
    participantName: "Khalid Al-Nahyan",
    organization: "Abu Dhabi Municipality",
    department: "Digital Services",
    enrollmentDate: "2024-01-12",
    completionDate: "2024-02-18",
    status: "Completed",
    score: 88,
    certificateIssued: "2024-02-19",
    courseVersion: "v1.3",
    dataClassification: "Public",
  },
  {
    id: 3,
    participantName: "Amina Al-Suwaidi",
    organization: "Abu Dhabi Health Services",
    department: "Health Information",
    enrollmentDate: "2024-01-20",
    completionDate: null,
    status: "In Progress",
    score: null,
    certificateIssued: null,
    courseVersion: "v1.3",
    dataClassification: "Restricted",
  },
  {
    id: 4,
    participantName: "Hassan Al-Dhaheri",
    organization: "Abu Dhabi Police",
    department: "Cyber Security",
    enrollmentDate: "2024-02-01",
    completionDate: "2024-03-10",
    status: "Completed",
    score: 95,
    certificateIssued: "2024-03-11",
    courseVersion: "v1.3",
    dataClassification: "Top Secret",
  },
  {
    id: 5,
    participantName: "Layla Al-Mansoori",
    organization: "Abu Dhabi Education Council",
    department: "Student Records",
    enrollmentDate: "2024-02-15",
    completionDate: null,
    status: "Not Started",
    score: null,
    certificateIssued: null,
    courseVersion: "v1.3",
    dataClassification: "Confidential",
  },
];

const AdInformation = () => {
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");

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

    // Apply classification filter
    if (classificationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.dataClassification === classificationFilter
      );
    }

    setFilteredData(filtered);
  }, [
    data,
    searchTerm,
    statusFilter,
    organizationFilter,
    classificationFilter,
  ]);

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
        "Data Classification",
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
        item.dataClassification,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ad-information-report.csv";
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

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Top Secret":
        return "text-red-400 bg-red-400/20";
      case "Confidential":
        return "text-orange-400 bg-orange-400/20";
      case "Restricted":
        return "text-yellow-400 bg-yellow-400/20";
      case "Public":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  return (
    <AdminPageLayout
      title="AD Information Report"
      description="Comprehensive report on Abu Dhabi Information Management training participation and completion"
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
                  <SelectItem value="Abu Dhabi Government">
                    Abu Dhabi Government
                  </SelectItem>
                  <SelectItem value="Abu Dhabi Municipality">
                    Abu Dhabi Municipality
                  </SelectItem>
                  <SelectItem value="Abu Dhabi Health Services">
                    Abu Dhabi Health Services
                  </SelectItem>
                  <SelectItem value="Abu Dhabi Police">
                    Abu Dhabi Police
                  </SelectItem>
                  <SelectItem value="Abu Dhabi Education Council">
                    Abu Dhabi Education Council
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={classificationFilter}
                onValueChange={setClassificationFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classifications</SelectItem>
                  <SelectItem value="Top Secret">Top Secret</SelectItem>
                  <SelectItem value="Confidential">Confidential</SelectItem>
                  <SelectItem value="Restricted">Restricted</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
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
              AD Information Training Data
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
                    <TableHead className="text-white/80">
                      Data Classification
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
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(
                            item.dataClassification
                          )}`}
                        >
                          {item.dataClassification}
                        </span>
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

export default AdInformation;
