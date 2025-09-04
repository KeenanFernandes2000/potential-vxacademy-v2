import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for assets
const mockAssets = [
  {
    id: 1,
    name: "Training Materials",
    type: "Document",
    size: "2.5 MB",
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Video Tutorial",
    type: "Video",
    size: "45.2 MB",
    createdDate: "2024-01-14",
    status: "Active",
  },
  {
    id: 3,
    name: "Assessment Template",
    type: "Document",
    size: "1.8 MB",
    createdDate: "2024-01-13",
    status: "Draft",
  },
];

const AssetsPage = () => {
  const [assets, setAssets] = useState(mockAssets);
  const [filteredAssets, setFilteredAssets] = useState(mockAssets);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  };

  const handleCreateAsset = (formData: any) => {
    const newAsset = {
      id: assets.length + 1,
      name: formData.name,
      type: formData.type,
      size: "0 MB",
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setAssets([...assets, newAsset]);
    setFilteredAssets([...assets, newAsset]);
  };

  const CreateAssetForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      type: "",
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateAsset(formData);
      setFormData({ name: "", type: "", description: "" });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <Button type="submit">Create Asset</Button>
        </div>
      </form>
    );
  };

  const columns = ["Name", "Type", "Size", "Created Date", "Status", "Actions"];

  return (
    <AdminPageLayout
      title="Assets"
      description="Manage your training assets and resources"
    >
      <AdminTableLayout
        searchPlaceholder="Search assets..."
        createButtonText="Create Asset"
        createForm={<CreateAssetForm />}
        tableData={filteredAssets}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default AssetsPage;
