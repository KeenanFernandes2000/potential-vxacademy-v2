import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for sub-assets
const mockSubAssets = [
  {
    id: 1,
    name: "Chapter 1: Introduction",
    parentAsset: "Training Materials",
    type: "Document",
    size: "512 KB",
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Video Segment 1",
    parentAsset: "Video Tutorial",
    type: "Video",
    size: "12.3 MB",
    createdDate: "2024-01-14",
    status: "Active",
  },
  {
    id: 3,
    name: "Quiz Questions",
    parentAsset: "Assessment Template",
    type: "Document",
    size: "256 KB",
    createdDate: "2024-01-13",
    status: "Draft",
  },
];

const SubAssetsPage = () => {
  const [subAssets, setSubAssets] = useState(mockSubAssets);
  const [filteredSubAssets, setFilteredSubAssets] = useState(mockSubAssets);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubAssets(subAssets);
    } else {
      const filtered = subAssets.filter(
        (subAsset) =>
          subAsset.name.toLowerCase().includes(query.toLowerCase()) ||
          subAsset.parentAsset.toLowerCase().includes(query.toLowerCase()) ||
          subAsset.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubAssets(filtered);
    }
  };

  const handleCreateSubAsset = (formData: any) => {
    const newSubAsset = {
      id: subAssets.length + 1,
      name: formData.name,
      parentAsset: formData.parentAsset,
      type: formData.type,
      size: "0 KB",
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setSubAssets([...subAssets, newSubAsset]);
    setFilteredSubAssets([...subAssets, newSubAsset]);
  };

  const CreateSubAssetForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      parentAsset: "",
      type: "",
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateSubAsset(formData);
      setFormData({ name: "", parentAsset: "", type: "", description: "" });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Sub-Asset Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentAsset">Parent Asset</Label>
          <Input
            id="parentAsset"
            value={formData.parentAsset}
            onChange={(e) =>
              setFormData({ ...formData, parentAsset: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Sub-Asset</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Parent Asset",
    "Type",
    "Size",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub Assets"
      description="Manage sub-assets and components of your training materials"
    >
      <AdminTableLayout
        searchPlaceholder="Search sub-assets..."
        createButtonText="Create Sub-Asset"
        createForm={<CreateSubAssetForm />}
        tableData={filteredSubAssets}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default SubAssetsPage;
