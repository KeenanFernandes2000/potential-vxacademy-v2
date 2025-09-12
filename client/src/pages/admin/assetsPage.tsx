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

// API object for asset operations
const api = {
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

  async createAsset(assetData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create asset:", error);
      throw error;
    }
  },

  async updateAsset(assetId: number, assetData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets/${assetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update asset:", error);
      throw error;
    }
  },

  async deleteAsset(assetId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets/${assetId}`, {
        method: "DELETE",
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
      console.error("Failed to delete asset:", error);
      throw error;
    }
  },
};

// Type for asset data
interface AssetData extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  actions: React.ReactNode;
}

const AssetsPage = () => {
  const { token } = useAuth();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Fetch assets from database on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllAssets(token);

        // Transform data to match our display format
        const transformedAssets =
          response.data?.map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditAsset(asset)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteAsset(asset.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setAssets(transformedAssets);
        setFilteredAssets(transformedAssets);
        setError("");
      } catch (error) {
        console.error("Error fetching assets:", error);
        setError("Failed to load assets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter((asset) =>
        asset.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  };

  const handleCreateAsset = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const assetData = {
        name: formData.name,
      };

      const response = await api.createAsset(assetData, token);

      if (response.success) {
        // Refresh the asset list
        await refreshAssetList();
        setError("");
      } else {
        setError(response.message || "Failed to create asset");
      }
    } catch (error) {
      console.error("Error creating asset:", error);
      setError("Failed to create asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAsset = async (formData: any) => {
    if (!token || !selectedAsset) {
      setError("Authentication required or no asset selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const assetData = {
        name: formData.name,
      };

      const response = await api.updateAsset(
        selectedAsset.id,
        assetData,
        token
      );

      if (response.success) {
        // Refresh the asset list
        await refreshAssetList();
        setIsEditModalOpen(false);
        setSelectedAsset(null);
        setError("");
      } else {
        setError(response.message || "Failed to update asset");
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      setError("Failed to update asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteAsset(assetId, token);

      if (response.success) {
        // Refresh the asset list
        await refreshAssetList();
        setError("");
      } else {
        setError(response.message || "Failed to delete asset");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      setError("Failed to delete asset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const refreshAssetList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllAssets(token);

    const transformedAssets =
      updatedResponse.data?.map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditAsset(asset)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteAsset(asset.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setAssets(transformedAssets);
    setFilteredAssets(transformedAssets);
  };

  const CreateAssetForm = () => {
    const [formData, setFormData] = useState({
      name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateAsset(formData);
      setFormData({ name: "" });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const EditAssetForm = () => {
    const [formData, setFormData] = useState({
      name: selectedAsset?.name || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateAsset(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_name">Asset Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedAsset(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Name", "Actions"];

  return (
    <AdminPageLayout
      title="Assets"
      description="Manage your training assets and resources"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search assets..."
        createButtonText="Create Asset"
        createForm={<CreateAssetForm />}
        tableData={filteredAssets}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Asset</DialogTitle>
          </DialogHeader>
          <EditAssetForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AssetsPage;
