import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    name: "Complete React Development",
    description: "Full-stack React development from basics to advanced",
    module: "React Fundamentals",
    instructor: "John Smith",
    duration: "8 weeks",
    price: "$299",
    studentCount: 85,
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Data Analysis with Python",
    description: "Comprehensive data analysis using Python libraries",
    module: "Python for Data Science",
    instructor: "Sarah Johnson",
    duration: "10 weeks",
    price: "$399",
    studentCount: 62,
    createdDate: "2024-01-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Team Leadership Workshop",
    description: "Essential skills for leading and managing teams",
    module: "Leadership Essentials",
    instructor: "Mike Wilson",
    duration: "4 weeks",
    price: "$199",
    studentCount: 0,
    createdDate: "2024-01-20",
    status: "Draft",
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
          course.module.toLowerCase().includes(query.toLowerCase()) ||
          course.instructor.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCreateCourse = (formData: any) => {
    const newCourse = {
      id: courses.length + 1,
      name: formData.name,
      description: formData.description,
      module: formData.module,
      instructor: formData.instructor,
      duration: formData.duration,
      price: formData.price,
      studentCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setCourses([...courses, newCourse]);
    setFilteredCourses([...courses, newCourse]);
  };

  const CreateCourseForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      module: "",
      instructor: "",
      duration: "",
      price: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateCourse(formData);
      setFormData({
        name: "",
        description: "",
        module: "",
        instructor: "",
        duration: "",
        price: "",
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
          <Label htmlFor="module">Module</Label>
          <Input
            id="module"
            value={formData.module}
            onChange={(e) =>
              setFormData({ ...formData, module: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            value={formData.instructor}
            onChange={(e) =>
              setFormData({ ...formData, instructor: e.target.value })
            }
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
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
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
    "Module",
    "Instructor",
    "Duration",
    "Price",
    "Students",
    "Created Date",
    "Status",
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
