import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for sub-asset operations
const api = {
  async getAllSubAssets(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/sub-assets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch sub-assets:", error);
      throw error;
    }
  },

  async getAllAssets(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  },

  async createSubAsset(subAssetData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/sub-assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subAssetData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create sub-asset:", error);
      throw error;
    }
  },

  async updateSubAsset(subAssetId: number, subAssetData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-assets/${subAssetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subAssetData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update sub-asset:", error);
      throw error;
    }
  },

  async deleteSubAsset(subAssetId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-assets/${subAssetId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to delete sub-asset:", error);
      throw error;
    }
  },
};

// Type for sub-asset data
interface SubAssetData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  parentAsset: string;
  size: string;
  createdDate: string;
  status: string;
  actions: React.ReactNode;
}

const SubAssetsPage = () => {
  const { token } = useAuth();
  const [subAssets, setSubAssets] = useState<SubAssetData[]>([]);
  const [filteredSubAssets, setFilteredSubAssets] = useState<SubAssetData[]>(
    []
  );
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubAsset, setSelectedSubAsset] = useState<any>(null);

  // Fetch sub-assets and assets from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [subAssetsResponse, assetsResponse] = await Promise.all([
          api.getAllSubAssets(token),
          api.getAllAssets(token),
        ]);

        // Set assets for dropdown
        setAssets(assetsResponse.data || []);

        // Create a map for quick asset lookup
        const assetMap = new Map();
        assetsResponse.data?.forEach((asset: any) => {
          assetMap.set(asset.id, asset.name);
        });

        // Transform data to match our display format
        const transformedSubAssets =
          subAssetsResponse.data?.map((subAsset: any) => ({
            id: subAsset.id,
            name: subAsset.name,
            parentAsset: assetMap.get(subAsset.assetId) || "N/A",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditSubAsset(subAsset)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteSubAsset(subAsset.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setSubAssets(transformedSubAssets);
        setFilteredSubAssets(transformedSubAssets);
        setError("");
      } catch (error) {
        console.error("Error fetching sub-assets:", error);
        setError("Failed to load sub-assets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubAssets(subAssets);
    } else {
      const filtered = subAssets.filter(
        (subAsset) =>
          subAsset.name.toLowerCase().includes(query.toLowerCase()) ||
          subAsset.parentAsset.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubAssets(filtered);
    }
  };

  const handleCreateSubAsset = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const subAssetData = {
        name: formData.name,
        assetId: parseInt(formData.parentAsset),
      };

      const response = await api.createSubAsset(subAssetData, token);

      if (response.success) {
        // Refresh the sub-asset list
        await refreshSubAssetList();
        setError("");
      } else {
        setError(response.message || "Failed to create sub-asset");
      }
    } catch (error) {
      console.error("Error creating sub-asset:", error);
      setError("Failed to create sub-asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubAsset = async (formData: any) => {
    if (!token || !selectedSubAsset) {
      setError("Authentication required or no sub-asset selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const subAssetData = {
        name: formData.name,
        assetId: parseInt(formData.parentAsset),
      };

      const response = await api.updateSubAsset(
        selectedSubAsset.id,
        subAssetData,
        token
      );

      if (response.success) {
        // Refresh the sub-asset list
        await refreshSubAssetList();
        setIsEditModalOpen(false);
        setSelectedSubAsset(null);
        setError("");
      } else {
        setError(response.message || "Failed to update sub-asset");
      }
    } catch (error) {
      console.error("Error updating sub-asset:", error);
      setError("Failed to update sub-asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubAsset = async (subAssetId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this sub-asset?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteSubAsset(subAssetId, token);

      if (response.success) {
        // Refresh the sub-asset list
        await refreshSubAssetList();
        setError("");
      } else {
        setError(response.message || "Failed to delete sub-asset");
      }
    } catch (error) {
      console.error("Error deleting sub-asset:", error);
      setError("Failed to delete sub-asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubAsset = (subAsset: any) => {
    setSelectedSubAsset(subAsset);
    setIsEditModalOpen(true);
  };

  const refreshSubAssetList = async () => {
    if (!token) return;
    const [updatedSubAssetsResponse, updatedAssetsResponse] = await Promise.all(
      [api.getAllSubAssets(token), api.getAllAssets(token)]
    );

    // Update assets state
    setAssets(updatedAssetsResponse.data || []);

    // Create a map for quick asset lookup
    const assetMap = new Map();
    updatedAssetsResponse.data?.forEach((asset: any) => {
      assetMap.set(asset.id, asset.name);
    });

    const transformedSubAssets =
      updatedSubAssetsResponse.data?.map((subAsset: any) => ({
        id: subAsset.id,
        name: subAsset.name,
        parentAsset: assetMap.get(subAsset.assetId) || "N/A",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditSubAsset(subAsset)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteSubAsset(subAsset.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setSubAssets(transformedSubAssets);
    setFilteredSubAssets(transformedSubAssets);
  };

  const CreateSubAssetForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      parentAsset: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateSubAsset(formData);
      setFormData({ name: "", parentAsset: "" });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Sub-Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentAsset">Parent Asset *</Label>
          <select
            id="parentAsset"
            value={formData.parentAsset}
            onChange={(e) =>
              setFormData({ ...formData, parentAsset: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="">Select an asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Sub-Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const EditSubAssetForm = () => {
    const [formData, setFormData] = useState({
      name: selectedSubAsset?.name || "",
      parentAsset: selectedSubAsset?.parentAsset || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateSubAsset(formData);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_name">Sub-Asset Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_parentAsset">Parent Asset *</Label>
          <select
            id="edit_parentAsset"
            value={formData.parentAsset}
            onChange={(e) =>
              setFormData({ ...formData, parentAsset: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="">Select an asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedSubAsset(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Sub-Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Name", "Parent Asset", "Actions"];

  return (
    <AdminPageLayout
      title="Sub Assets"
      description="Manage sub-assets and components of your training materials"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search sub-assets..."
        createButtonText="Create Sub-Asset"
        createForm={<CreateSubAssetForm />}
        tableData={filteredSubAssets}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Sub-Asset</DialogTitle>
          </DialogHeader>
          <EditSubAssetForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubAssetsPage;
