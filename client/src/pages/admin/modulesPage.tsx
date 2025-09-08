import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for modules
const mockModules = [
  {
    id: 1,
    name: "React Fundamentals",
    description: "Introduction to React.js and component-based development",
    trainingArea: "Software Development",
    duration: "4 weeks",
    unitCount: 8,
    studentCount: 120,
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Python for Data Science",
    description: "Data manipulation and analysis with Python",
    trainingArea: "Data Science",
    duration: "6 weeks",
    unitCount: 12,
    studentCount: 95,
    createdDate: "2024-01-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Leadership Essentials",
    description: "Core leadership skills and team management",
    trainingArea: "Business Management",
    duration: "3 weeks",
    unitCount: 6,
    studentCount: 0,
    createdDate: "2024-01-20",
    status: "Draft",
  },
];

const ModulesPage = () => {
  const [modules, setModules] = useState(mockModules);
  const [filteredModules, setFilteredModules] = useState(mockModules);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(
        (module) =>
          module.name.toLowerCase().includes(query.toLowerCase()) ||
          module.description.toLowerCase().includes(query.toLowerCase()) ||
          module.trainingArea.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  };

  const handleCreateModule = (formData: any) => {
    const newModule = {
      id: modules.length + 1,
      name: formData.name,
      description: formData.description,
      trainingArea: formData.trainingArea,
      duration: formData.duration,
      unitCount: 0,
      studentCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setModules([...modules, newModule]);
    setFilteredModules([...modules, newModule]);
  };

  const CreateModuleForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      trainingArea: "",
      duration: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateModule(formData);
      setFormData({
        name: "",
        description: "",
        trainingArea: "",
        duration: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Module Name</Label>
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
          <Label htmlFor="trainingArea">Training Area</Label>
          <Input
            id="trainingArea"
            value={formData.trainingArea}
            onChange={(e) =>
              setFormData({ ...formData, trainingArea: e.target.value })
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
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Module</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Training Area ID",
    "Image URL",
    "Created At",
    "Updated At",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Modules"
      description="Manage training modules and course structures"
    >
      <AdminTableLayout
        searchPlaceholder="Search modules..."
        createButtonText="Create Module"
        createForm={<CreateModuleForm />}
        tableData={filteredModules}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default ModulesPage;
