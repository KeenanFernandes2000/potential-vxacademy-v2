import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    moduleId: 1,
    name: "Complete React Development",
    description: "Full-stack React development from basics to advanced",
    imageUrl: "/images/react-course.jpg",
    internalNote: "High priority course for frontend developers",
    courseType: "free",
    duration: 480, // 8 weeks in minutes
    showDuration: true,
    level: "beginner",
    showLevel: true,
    estimatedDuration: "8 weeks",
    difficultyLevel: "intermediate",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    moduleId: 2,
    name: "Data Analysis with Python",
    description: "Comprehensive data analysis using Python libraries",
    imageUrl: "/images/python-course.jpg",
    internalNote: "Popular course with high completion rates",
    courseType: "premium",
    duration: 600, // 10 weeks in minutes
    showDuration: true,
    level: "intermediate",
    showLevel: true,
    estimatedDuration: "10 weeks",
    difficultyLevel: "advanced",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    moduleId: 3,
    name: "Team Leadership Workshop",
    description: "Essential skills for leading and managing teams",
    imageUrl: "/images/leadership-course.jpg",
    internalNote: "Soft skills development program",
    courseType: "free",
    duration: 240, // 4 weeks in minutes
    showDuration: false,
    level: "beginner",
    showLevel: false,
    estimatedDuration: "4 weeks",
    difficultyLevel: "beginner",
    createdAt: "2024-01-20",
  },
];

const CoursesPage = () => {
  const [courses, setCourses] = useState(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()) ||
          course.courseType.toLowerCase().includes(query.toLowerCase()) ||
          course.level.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCreateCourse = (formData: any) => {
    const newCourse = {
      id: courses.length + 1,
      moduleId: parseInt(formData.moduleId),
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl || null,
      internalNote: formData.internalNote || null,
      courseType: formData.courseType,
      duration: parseInt(formData.duration),
      showDuration: formData.showDuration === "true",
      level: formData.level,
      showLevel: formData.showLevel === "true",
      estimatedDuration: formData.estimatedDuration || null,
      difficultyLevel: formData.difficultyLevel,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCourses([...courses, newCourse]);
    setFilteredCourses([...courses, newCourse]);
  };

  const CreateCourseForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      moduleId: "",
      imageUrl: "",
      internalNote: "",
      courseType: "",
      duration: "",
      showDuration: "true",
      level: "",
      showLevel: "true",
      estimatedDuration: "",
      difficultyLevel: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateCourse(formData);
      setFormData({
        name: "",
        description: "",
        moduleId: "",
        imageUrl: "",
        internalNote: "",
        courseType: "",
        duration: "",
        showDuration: "true",
        level: "",
        showLevel: "true",
        estimatedDuration: "",
        difficultyLevel: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Course Name</Label>
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
          <Label htmlFor="moduleId">Module ID</Label>
          <Input
            id="moduleId"
            type="number"
            value={formData.moduleId}
            onChange={(e) =>
              setFormData({ ...formData, moduleId: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="internalNote">Internal Note</Label>
          <Input
            id="internalNote"
            value={formData.internalNote}
            onChange={(e) =>
              setFormData({ ...formData, internalNote: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseType">Course Type</Label>
          <Input
            id="courseType"
            value={formData.courseType}
            onChange={(e) =>
              setFormData({ ...formData, courseType: e.target.value })
            }
            placeholder="free, premium, etc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showDuration">Show Duration</Label>
          <Input
            id="showDuration"
            value={formData.showDuration}
            onChange={(e) =>
              setFormData({ ...formData, showDuration: e.target.value })
            }
            placeholder="true or false"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            placeholder="beginner, intermediate, advanced"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showLevel">Show Level</Label>
          <Input
            id="showLevel"
            value={formData.showLevel}
            onChange={(e) =>
              setFormData({ ...formData, showLevel: e.target.value })
            }
            placeholder="true or false"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Estimated Duration</Label>
          <Input
            id="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={(e) =>
              setFormData({ ...formData, estimatedDuration: e.target.value })
            }
            placeholder="e.g., 8 weeks"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficultyLevel">Difficulty Level</Label>
          <Input
            id="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={(e) =>
              setFormData({ ...formData, difficultyLevel: e.target.value })
            }
            placeholder="beginner, intermediate, advanced"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Course</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Module ID",
    "Course Type",
    "Duration (min)",
    "Level",
    "Difficulty Level",
    "Show Duration",
    "Show Level",
    "Created At",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Courses"
      description="Manage courses and learning programs"
    >
      <AdminTableLayout
        searchPlaceholder="Search courses..."
        createButtonText="Create Course"
        createForm={<CreateCourseForm />}
        tableData={filteredCourses}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default CoursesPage;
