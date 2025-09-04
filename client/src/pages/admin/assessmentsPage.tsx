import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for assessments
const mockAssessments = [
  {
    id: 1,
    name: "React Fundamentals Quiz",
    description: "Test knowledge of React basics and component structure",
    course: "Complete React Development",
    type: "Quiz",
    duration: "30 minutes",
    passingScore: 70,
    questionCount: 15,
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Python Data Analysis Project",
    description: "Hands-on project using Python for data analysis",
    course: "Data Analysis with Python",
    type: "Project",
    duration: "2 hours",
    passingScore: 80,
    questionCount: 0,
    createdDate: "2024-01-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Leadership Skills Assessment",
    description: "Evaluate leadership and management capabilities",
    course: "Team Leadership Workshop",
    type: "Case Study",
    duration: "45 minutes",
    passingScore: 75,
    questionCount: 8,
    createdDate: "2024-01-20",
    status: "Draft",
  },
];

const AssessmentsPage = () => {
  const [assessments, setAssessments] = useState(mockAssessments);
  const [filteredAssessments, setFilteredAssessments] =
    useState(mockAssessments);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredAssessments(assessments);
    } else {
      const filtered = assessments.filter(
        (assessment) =>
          assessment.name.toLowerCase().includes(query.toLowerCase()) ||
          assessment.description.toLowerCase().includes(query.toLowerCase()) ||
          assessment.course.toLowerCase().includes(query.toLowerCase()) ||
          assessment.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAssessments(filtered);
    }
  };

  const handleCreateAssessment = (formData: any) => {
    const newAssessment = {
      id: assessments.length + 1,
      name: formData.name,
      description: formData.description,
      course: formData.course,
      type: formData.type,
      duration: formData.duration,
      passingScore: parseInt(formData.passingScore),
      questionCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setAssessments([...assessments, newAssessment]);
    setFilteredAssessments([...assessments, newAssessment]);
  };

  const CreateAssessmentForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      course: "",
      type: "",
      duration: "",
      passingScore: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateAssessment(formData);
      setFormData({
        name: "",
        description: "",
        course: "",
        type: "",
        duration: "",
        passingScore: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Assessment Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            value={formData.course}
            onChange={(e) =>
              setFormData({ ...formData, course: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Assessment Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passingScore">Passing Score (%)</Label>
          <Input
            id="passingScore"
            type="number"
            min="0"
            max="100"
            value={formData.passingScore}
            onChange={(e) =>
              setFormData({ ...formData, passingScore: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Assessment</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Course",
    "Type",
    "Duration",
    "Passing Score",
    "Questions",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Assessments"
      description="Manage assessments, quizzes, and evaluation tools"
    >
      <AdminTableLayout
        searchPlaceholder="Search assessments..."
        createButtonText="Create Assessment"
        createForm={<CreateAssessmentForm />}
        tableData={filteredAssessments}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default AssessmentsPage;
