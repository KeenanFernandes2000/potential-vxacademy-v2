import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  assetId: number;
  size: string;
  createdDate: string;
  status: string;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  name?: string;
  parentAsset?: string;
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
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubAsset, setSelectedSubAsset] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subAssetToDelete, setSubAssetToDelete] = useState<any>(null);

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
      errors.name = "Sub-asset name is required";
    }

    if (!formData.parentAsset || formData.parentAsset === "") {
      errors.parentAsset = "Parent asset is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
            // assetId: subAsset.assetId, // Keep the assetId for editing
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditSubAsset(subAsset)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteSubAsset(subAsset)}
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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        setValidationErrors({});
        showSuccessMessage("Asset Sub-Category created successfully!");
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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        setValidationErrors({});
        showSuccessMessage("Asset Sub-Category updated successfully!");
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

  const handleDeleteSubAsset = (subAsset: any) => {
    setSubAssetToDelete(subAsset);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSubAsset = async () => {
    if (!token || !subAssetToDelete) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteSubAsset(subAssetToDelete.id, token);

      if (response.success) {
        // Refresh the sub-asset list
        await refreshSubAssetList();
        setError("");
        showSuccessMessage("Asset Sub-Category deleted successfully!");
      } else {
        setError(response.message || "Failed to delete sub-asset");
      }
    } catch (error) {
      console.error("Error deleting sub-asset:", error);
      setError("Failed to delete sub-asset. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setSubAssetToDelete(null);
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
        // assetId: subAsset.assetId, // Keep the assetId for editing
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
              onClick={() => handleDeleteSubAsset(subAsset)}
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
          <Label htmlFor="name">Sub-Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
              validationErrors.name
                ? "border-red-500 focus:border-red-500 hover:border-red-500"
                : "border-sandstone focus:border-dawn hover:border-dawn"
            }`}
            placeholder="Type your Asset Sub-Category Name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentAsset">Parent Asset *</Label>
          <Select
            value={formData.parentAsset}
            onValueChange={(value) => handleInputChange("parentAsset", value)}
          >
            <SelectTrigger
              className={`w-full bg-white text-[#2C2C2C] transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                validationErrors.parentAsset
                  ? "border-red-500 focus:border-red-500 hover:border-red-500"
                  : "border-sandstone focus:border-dawn hover:border-dawn"
              }`}
            >
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id.toString()}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.parentAsset && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.parentAsset}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={
              isLoading || !formData.name.trim() || !formData.parentAsset
            }
            className="rounded-full"
          >
            {isLoading ? "Creating..." : "Create Sub-Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const EditSubAssetForm = () => {
    const [formData, setFormData] = useState({
      name: selectedSubAsset?.name || "",
      parentAsset: selectedSubAsset?.assetId?.toString() || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateSubAsset(formData);
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
          <Label htmlFor="edit_name">Sub-Asset Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
              validationErrors.name
                ? "border-red-500 focus:border-red-500 hover:border-red-500"
                : "border-sandstone focus:border-dawn hover:border-dawn"
            }`}
            placeholder="Type your Asset Sub-Category Name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_parentAsset">Parent Asset *</Label>
          <Select
            value={formData.parentAsset}
            onValueChange={(value) => handleInputChange("parentAsset", value)}
          >
            <SelectTrigger
              className={`w-full bg-white text-[#2C2C2C] transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                validationErrors.parentAsset
                  ? "border-red-500 focus:border-red-500 hover:border-red-500"
                  : "border-sandstone focus:border-dawn hover:border-dawn"
              }`}
            >
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id.toString()}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.parentAsset && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.parentAsset}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedSubAsset(null);
            }}
            className="rounded-full hover:bg-accent/30 hover:text-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading || !formData.name.trim() || !formData.parentAsset
            }
            className="rounded-full"
          >
            {isLoading ? "Updating..." : "Update Sub-Asset"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Asset Sub-Category", "Parent Asset", "Actions"];

  return (
    <AdminPageLayout
      title="Asset Sub-Categories"
      description="Manage your Asset Sub-Categories"
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
        searchPlaceholder="Search sub-assets..."
        createButtonText="Create Sub-Asset"
        createForm={<CreateSubAssetForm />}
        tableData={filteredSubAssets}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">Edit Sub-Asset</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedSubAsset(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <EditSubAssetForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Delete Sub-Asset
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSubAssetToDelete(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[#2C2C2C] mb-6">
              Are you sure you want to delete the sub-asset "
              {subAssetToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSubAssetToDelete(null);
                }}
                className="rounded-full hover:bg-accent/30 hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteSubAsset}
                disabled={isLoading}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? "Deleting..." : "Delete Sub-Asset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubAssetsPage;
