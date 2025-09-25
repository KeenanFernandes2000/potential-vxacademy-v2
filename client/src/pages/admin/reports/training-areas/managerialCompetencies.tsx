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

// Mock data for Managerial Competencies
const mockData = [
  {
    id: 1,
    participantName: "Dr. Ahmed Al-Mansoori",
    organization: "VX Academy",
    department: "Executive Leadership",
    enrollmentDate: "2024-01-02",
    completionDate: "2024-02-15",
    status: "Completed",
    score: 96,
    certificateIssued: "2024-02-16",
    courseVersion: "v5.0",
    managementLevel: "Senior Executive",
    strategicThinkingScore: 98,
    teamLeadershipScore: 94,
    decisionMakingScore: 95,
    changeManagementScore: 97,
  },
  {
    id: 2,
    participantName: "Ms. Fatima Al-Zahra",
    organization: "VX Academy",
    department: "Operations Management",
    enrollmentDate: "2024-01-05",
    completionDate: "2024-02-18",
    status: "Completed",
    score: 92,
    certificateIssued: "2024-02-19",
    courseVersion: "v5.0",
    managementLevel: "Middle Management",
    strategicThinkingScore: 90,
    teamLeadershipScore: 93,
    decisionMakingScore: 91,
    changeManagementScore: 94,
  },
  {
    id: 3,
    participantName: "Mr. Khalid Al-Suwaidi",
    organization: "VX Academy",
    department: "Project Management",
    enrollmentDate: "2024-01-10",
    completionDate: null,
    status: "In Progress",
    score: null,
    certificateIssued: null,
    courseVersion: "v5.0",
    managementLevel: "Middle Management",
    strategicThinkingScore: null,
    teamLeadershipScore: null,
    decisionMakingScore: null,
    changeManagementScore: null,
  },
  {
    id: 4,
    participantName: "Dr. Layla Al-Rashid",
    organization: "VX Academy",
    department: "Strategic Planning",
    enrollmentDate: "2024-01-15",
    completionDate: "2024-03-01",
    status: "Completed",
    score: 89,
    certificateIssued: "2024-03-02",
    courseVersion: "v5.0",
    managementLevel: "Senior Management",
    strategicThinkingScore: 92,
    teamLeadershipScore: 87,
    decisionMakingScore: 88,
    changeManagementScore: 89,
  },
  {
    id: 5,
    participantName: "Mr. Omar Al-Hashimi",
    organization: "VX Academy",
    department: "Team Leadership",
    enrollmentDate: "2024-02-01",
    completionDate: null,
    status: "Not Started",
    score: null,
    certificateIssued: null,
    courseVersion: "v5.0",
    managementLevel: "First Line Management",
    strategicThinkingScore: null,
    teamLeadershipScore: null,
    decisionMakingScore: null,
    changeManagementScore: null,
  },
];

const ManagerialCompetencies = () => {
  const [data, setData] = useState(mockData);
  const [filteredData, setFilteredData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managementLevelFilter, setManagementLevelFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

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
  const averageStrategicThinkingScore =
    data
      .filter((item) => item.strategicThinkingScore !== null)
      .reduce((acc, item) => acc + item.strategicThinkingScore!, 0) /
    data.filter((item) => item.strategicThinkingScore !== null).length;
  const averageTeamLeadershipScore =
    data
      .filter((item) => item.teamLeadershipScore !== null)
      .reduce((acc, item) => acc + item.teamLeadershipScore!, 0) /
    data.filter((item) => item.teamLeadershipScore !== null).length;
  const averageDecisionMakingScore =
    data
      .filter((item) => item.decisionMakingScore !== null)
      .reduce((acc, item) => acc + item.decisionMakingScore!, 0) /
    data.filter((item) => item.decisionMakingScore !== null).length;
  const averageChangeManagementScore =
    data
      .filter((item) => item.changeManagementScore !== null)
      .reduce((acc, item) => acc + item.changeManagementScore!, 0) /
    data.filter((item) => item.changeManagementScore !== null).length;

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

    // Apply management level filter
    if (managementLevelFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.managementLevel === managementLevelFilter
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.department === departmentFilter
      );
    }

    setFilteredData(filtered);
  }, [data, searchTerm, statusFilter, managementLevelFilter, departmentFilter]);

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
        "Management Level",
        "Strategic Thinking Score",
        "Team Leadership Score",
        "Decision Making Score",
        "Change Management Score",
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
        item.managementLevel,
        item.strategicThinkingScore || "N/A",
        item.teamLeadershipScore || "N/A",
        item.decisionMakingScore || "N/A",
        item.changeManagementScore || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "managerial-competencies-report.csv";
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

  const getManagementLevelColor = (level: string) => {
    switch (level) {
      case "Senior Executive":
        return "text-red-400 bg-red-400/20";
      case "Senior Management":
        return "text-orange-400 bg-orange-400/20";
      case "Middle Management":
        return "text-blue-400 bg-blue-400/20";
      case "First Line Management":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-white/60 bg-white/10";
    }
  };

  return (
    <AdminPageLayout
      title="Managerial Competencies Report"
      description="Comprehensive report on Managerial Competencies training participation and completion"
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

        {/* Competency Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Strategic Thinking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {averageStrategicThinkingScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Team Leadership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {averageTeamLeadershipScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Decision Making
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {averageDecisionMakingScore.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                Change Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {averageChangeManagementScore.toFixed(1)}%
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
                value={managementLevelFilter}
                onValueChange={setManagementLevelFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by management level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Management Levels</SelectItem>
                  <SelectItem value="Senior Executive">
                    Senior Executive
                  </SelectItem>
                  <SelectItem value="Senior Management">
                    Senior Management
                  </SelectItem>
                  <SelectItem value="Middle Management">
                    Middle Management
                  </SelectItem>
                  <SelectItem value="First Line Management">
                    First Line Management
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Executive Leadership">
                    Executive Leadership
                  </SelectItem>
                  <SelectItem value="Operations Management">
                    Operations Management
                  </SelectItem>
                  <SelectItem value="Project Management">
                    Project Management
                  </SelectItem>
                  <SelectItem value="Strategic Planning">
                    Strategic Planning
                  </SelectItem>
                  <SelectItem value="Team Leadership">
                    Team Leadership
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
              Managerial Competencies Training Data
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
                      Management Level
                    </TableHead>
                    <TableHead className="text-white/80">
                      Strategic Thinking
                    </TableHead>
                    <TableHead className="text-white/80">
                      Team Leadership
                    </TableHead>
                    <TableHead className="text-white/80">
                      Decision Making
                    </TableHead>
                    <TableHead className="text-white/80">
                      Change Management
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getManagementLevelColor(
                            item.managementLevel
                          )}`}
                        >
                          {item.managementLevel}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.strategicThinkingScore
                          ? `${item.strategicThinkingScore}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.teamLeadershipScore
                          ? `${item.teamLeadershipScore}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.decisionMakingScore
                          ? `${item.decisionMakingScore}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {item.changeManagementScore
                          ? `${item.changeManagementScore}%`
                          : "N/A"}
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

export default ManagerialCompetencies;
