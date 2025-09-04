import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for learning blocks
const mockLearningBlocks = [
  {
    id: 1,
    name: "React Hooks Tutorial",
    description: "Deep dive into React hooks and state management",
    unit: "Introduction to React",
    type: "Video",
    duration: "45 minutes",
    difficulty: "Intermediate",
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Component Lifecycle",
    description: "Understanding React component lifecycle methods",
    unit: "Components and Props",
    type: "Interactive",
    duration: "30 minutes",
    difficulty: "Beginner",
    createdDate: "2024-01-16",
    status: "Active",
  },
  {
    id: 3,
    name: "Python Lists and Dictionaries",
    description: "Working with Python data structures",
    unit: "Data Types in Python",
    type: "Exercise",
    duration: "60 minutes",
    difficulty: "Beginner",
    createdDate: "2024-01-10",
    status: "Draft",
  },
];

const LearningBlockPage = () => {
  const [learningBlocks, setLearningBlocks] = useState(mockLearningBlocks);
  const [filteredLearningBlocks, setFilteredLearningBlocks] =
    useState(mockLearningBlocks);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredLearningBlocks(learningBlocks);
    } else {
      const filtered = learningBlocks.filter(
        (block) =>
          block.name.toLowerCase().includes(query.toLowerCase()) ||
          block.description.toLowerCase().includes(query.toLowerCase()) ||
          block.unit.toLowerCase().includes(query.toLowerCase()) ||
          block.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLearningBlocks(filtered);
    }
  };

  const handleCreateLearningBlock = (formData: any) => {
    const newLearningBlock = {
      id: learningBlocks.length + 1,
      name: formData.name,
      description: formData.description,
      unit: formData.unit,
      type: formData.type,
      duration: formData.duration,
      difficulty: formData.difficulty,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setLearningBlocks([...learningBlocks, newLearningBlock]);
    setFilteredLearningBlocks([...learningBlocks, newLearningBlock]);
  };

  const CreateLearningBlockForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      unit: "",
      type: "",
      duration: "",
      difficulty: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateLearningBlock(formData);
      setFormData({
        name: "",
        description: "",
        unit: "",
        type: "",
        duration: "",
        difficulty: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Learning Block Name</Label>
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
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
          <Label htmlFor="difficulty">Difficulty</Label>
          <Input
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Learning Block</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Unit",
    "Type",
    "Duration",
    "Difficulty",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Learning Blocks"
      description="Manage learning blocks and content segments"
    >
      <AdminTableLayout
        searchPlaceholder="Search learning blocks..."
        createButtonText="Create Learning Block"
        createForm={<CreateLearningBlockForm />}
        tableData={filteredLearningBlocks}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default LearningBlockPage;
