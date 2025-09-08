import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for assessments
const mockAssessments = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    description: "Test knowledge of React basics and component structure",
    trainingAreaId: 1,
    moduleId: 1,
    unitId: 1,
    courseId: 1,
    placement: "end",
    isGraded: true,
    showCorrectAnswers: false,
    passingScore: 70,
    hasTimeLimit: true,
    timeLimit: 30,
    maxRetakes: 3,
    hasCertificate: false,
    certificateTemplate: null,
    xpPoints: 50,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Python Data Analysis Project",
    description: "Hands-on project using Python for data analysis",
    trainingAreaId: 2,
    moduleId: 2,
    unitId: 2,
    courseId: 2,
    placement: "end",
    isGraded: true,
    showCorrectAnswers: true,
    passingScore: 80,
    hasTimeLimit: false,
    timeLimit: null,
    maxRetakes: 2,
    hasCertificate: true,
    certificateTemplate: "python_certificate",
    xpPoints: 100,
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    title: "Leadership Skills Assessment",
    description: "Evaluate leadership and management capabilities",
    trainingAreaId: 3,
    moduleId: 3,
    unitId: 3,
    courseId: 3,
    placement: "middle",
    isGraded: true,
    showCorrectAnswers: false,
    passingScore: 75,
    hasTimeLimit: true,
    timeLimit: 45,
    maxRetakes: 1,
    hasCertificate: false,
    certificateTemplate: null,
    xpPoints: 75,
    createdAt: "2024-01-20",
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
          assessment.title.toLowerCase().includes(query.toLowerCase()) ||
          assessment.description.toLowerCase().includes(query.toLowerCase()) ||
          assessment.placement.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAssessments(filtered);
    }
  };

  const handleCreateAssessment = (formData: any) => {
    const newAssessment = {
      id: assessments.length + 1,
      title: formData.title,
      description: formData.description,
      trainingAreaId: parseInt(formData.trainingAreaId),
      moduleId: parseInt(formData.moduleId),
      unitId: parseInt(formData.unitId),
      courseId: parseInt(formData.courseId),
      placement: formData.placement,
      isGraded: formData.isGraded === "true",
      showCorrectAnswers: formData.showCorrectAnswers === "true",
      passingScore: parseInt(formData.passingScore),
      hasTimeLimit: formData.hasTimeLimit === "true",
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
      maxRetakes: parseInt(formData.maxRetakes),
      hasCertificate: formData.hasCertificate === "true",
      certificateTemplate: formData.certificateTemplate || null,
      xpPoints: parseInt(formData.xpPoints),
      createdAt: new Date().toISOString().split("T")[0],
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
    "Title",
    "Description",
    "Training Area ID",
    "Module ID",
    "Unit ID",
    "Course ID",
    "Placement",
    "Passing Score",
    "Time Limit",
    "Max Retakes",
    "XP Points",
    "Created At",
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
