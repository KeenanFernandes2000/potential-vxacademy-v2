import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Edit, Delete, Close } from "@mui/icons-material";
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

// Type for validation errors
interface ValidationErrors {
  name?: string;
}

const AssetsPage = () => {
  const { token } = useAuth();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<any>(null);

  // Function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Validation function
  const validateForm = (formData: any): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Asset name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditAsset(asset)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteAsset(asset)}
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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        setValidationErrors({});
        showSuccessMessage("Asset created successfully!");
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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        setValidationErrors({});
        showSuccessMessage("Asset updated successfully!");
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

  const handleDeleteAsset = (asset: any) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (!token || !assetToDelete) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteAsset(assetToDelete.id, token);

      if (response.success) {
        // Refresh the asset list
        await refreshAssetList();
        setError("");
        showSuccessMessage("Asset deleted successfully!");
      } else {
        setError(response.message || "Failed to delete asset");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      setError("Failed to delete asset. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
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
              onClick={() => handleDeleteAsset(asset)}
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

    const handleInputChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
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
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
              validationErrors.name
                ? "border-red-500 focus:border-red-500 hover:border-red-500"
                : "border-sandstone focus:border-dawn hover:border-dawn"
            }`}
            placeholder="Type your Asset Name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="rounded-full"
          >
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

    const handleInputChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_name">Asset Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
              validationErrors.name
                ? "border-red-500 focus:border-red-500 hover:border-red-500"
                : "border-sandstone focus:border-dawn hover:border-dawn"
            }`}
            placeholder="Type your Asset Name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedAsset(null);
            }}
            className="rounded-full hover:bg-accent/30 hover:text-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="rounded-full"
          >
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
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
          {successMessage}
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
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">Edit Asset</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedAsset(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <EditAssetForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">Delete Asset</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setAssetToDelete(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[#2C2C2C] mb-6">
              Are you sure you want to delete the asset "{assetToDelete?.name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAssetToDelete(null);
                }}
                className="rounded-full hover:bg-accent/30 hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteAsset}
                disabled={isLoading}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? "Deleting..." : "Delete Asset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AssetsPage;
