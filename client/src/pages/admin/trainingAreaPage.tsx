import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for training areas
const mockTrainingAreas = [
  {
    id: 1,
    name: "Software Development",
    description: "Programming and software engineering courses",
    category: "Technology",
    courseCount: 15,
    studentCount: 450,
    createdDate: "2024-01-01",
    status: "Active",
  },
  {
    id: 2,
    name: "Data Science",
    description: "Analytics, machine learning, and data visualization",
    category: "Technology",
    courseCount: 8,
    studentCount: 320,
    createdDate: "2024-01-05",
    status: "Active",
  },
  {
    id: 3,
    name: "Business Management",
    description: "Leadership, strategy, and organizational skills",
    category: "Business",
    courseCount: 12,
    studentCount: 280,
    createdDate: "2024-01-10",
    status: "Draft",
  },
];

const TrainingAreaPage = () => {
  const [trainingAreas, setTrainingAreas] = useState(mockTrainingAreas);
  const [filteredTrainingAreas, setFilteredTrainingAreas] =
    useState(mockTrainingAreas);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredTrainingAreas(trainingAreas);
    } else {
      const filtered = trainingAreas.filter(
        (area) =>
          area.name.toLowerCase().includes(query.toLowerCase()) ||
          area.description.toLowerCase().includes(query.toLowerCase()) ||
          area.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTrainingAreas(filtered);
    }
  };

  const handleCreateTrainingArea = (formData: any) => {
    const newTrainingArea = {
      id: trainingAreas.length + 1,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      courseCount: 0,
      studentCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setTrainingAreas([...trainingAreas, newTrainingArea]);
    setFilteredTrainingAreas([...trainingAreas, newTrainingArea]);
  };

  const CreateTrainingAreaForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      category: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateTrainingArea(formData);
      setFormData({ name: "", description: "", category: "" });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Training Area Name</Label>
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Training Area</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Category",
    "Courses",
    "Students",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Training Areas"
      description="Manage training areas and course categories"
    >
      <AdminTableLayout
        searchPlaceholder="Search training areas..."
        createButtonText="Create Training Area"
        createForm={<CreateTrainingAreaForm />}
        tableData={filteredTrainingAreas}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default TrainingAreaPage;
