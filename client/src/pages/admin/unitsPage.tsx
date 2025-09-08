import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for units
const mockUnits = [
  {
    id: 1,
    name: "Introduction to React",
    description: "Basic concepts and setup of React development",
    course: "Complete React Development",
    order: 1,
    duration: "2 hours",
    type: "Video",
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Components and Props",
    description: "Understanding React components and prop passing",
    course: "Complete React Development",
    order: 2,
    duration: "3 hours",
    type: "Interactive",
    createdDate: "2024-01-16",
    status: "Active",
  },
  {
    id: 3,
    name: "Data Types in Python",
    description: "Introduction to Python data types and structures",
    course: "Data Analysis with Python",
    order: 1,
    duration: "2.5 hours",
    type: "Video",
    createdDate: "2024-01-10",
    status: "Draft",
  },
];

const UnitsPage = () => {
  const [units, setUnits] = useState(mockUnits);
  const [filteredUnits, setFilteredUnits] = useState(mockUnits);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(
        (unit) =>
          unit.name.toLowerCase().includes(query.toLowerCase()) ||
          unit.description.toLowerCase().includes(query.toLowerCase()) ||
          unit.course.toLowerCase().includes(query.toLowerCase()) ||
          unit.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  };

  const handleCreateUnit = (formData: any) => {
    const newUnit = {
      id: units.length + 1,
      name: formData.name,
      description: formData.description,
      course: formData.course,
      order: parseInt(formData.order),
      duration: formData.duration,
      type: formData.type,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setUnits([...units, newUnit]);
    setFilteredUnits([...units, newUnit]);
  };

  const CreateUnitForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      course: "",
      order: "",
      duration: "",
      type: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateUnit(formData);
      setFormData({
        name: "",
        description: "",
        course: "",
        order: "",
        duration: "",
        type: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Unit Name</Label>
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
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
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
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Unit</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Internal Note",
    "Order",
    "Duration (min)",
    "Show Duration",
    "XP Points",
    "Created At",
    "Updated At",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Units"
      description="Manage course units and learning segments"
    >
      <AdminTableLayout
        searchPlaceholder="Search units..."
        createButtonText="Create Unit"
        createForm={<CreateUnitForm />}
        tableData={filteredUnits}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default UnitsPage;
