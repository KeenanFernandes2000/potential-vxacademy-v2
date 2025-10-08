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
import { Edit, Delete, Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for sub-organization operations
const api = {
  async getAllSubOrganizations(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/sub-organizations`, {
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
      console.error("Failed to fetch sub-organizations:", error);
      throw error;
    }
  },

  async getAllOrganizations(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/organizations`, {
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
      console.error("Failed to fetch organizations:", error);
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

  async createSubOrganization(subOrganizationData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/sub-organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subOrganizationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create sub-organization:", error);
      throw error;
    }
  },

  async updateSubOrganization(
    subOrganizationId: number,
    subOrganizationData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-organizations/${subOrganizationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subOrganizationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update sub-organization:", error);
      throw error;
    }
  },

  async deleteSubOrganization(subOrganizationId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-organizations/${subOrganizationId}`,
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
      console.error("Failed to delete sub-organization:", error);
      throw error;
    }
  },
};

// Type for sub-organization data
interface SubOrganizationData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
  assetId: number;
  subAssetId: number;
  assetName: string;
  subAssetName: string;
  actions: React.ReactNode;
}

// Type for organization data
interface OrganizationData {
  id: number;
  name: string;
}

// Type for asset data
interface AssetData {
  id: number;
  name: string;
}

// Type for sub-asset data
interface SubAssetData {
  id: number;
  name: string;
  assetId: number;
}

const SubOrganizationPage = () => {
  const { token } = useAuth();
  const [subOrganizations, setSubOrganizations] = useState<
    SubOrganizationData[]
  >([]);
  const [filteredSubOrganizations, setFilteredSubOrganizations] = useState<
    SubOrganizationData[]
  >([]);
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [allSubAssets, setAllSubAssets] = useState<SubAssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubOrganization, setSelectedSubOrganization] =
    useState<any>(null);
  const [subOrganizationToDelete, setSubOrganizationToDelete] =
    useState<any>(null);

  // Function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Fetch sub-organizations and organizations from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch sub-organizations, organizations, assets, and sub-assets in parallel
        const [
          subOrganizationsResponse,
          organizationsResponse,
          assetsResponse,
          subAssetsResponse,
        ] = await Promise.all([
          api.getAllSubOrganizations(token),
          api.getAllOrganizations(token),
          api.getAllAssets(token),
          api.getAllSubAssets(token),
        ]);

        // Set organizations, assets, and sub-assets
        setOrganizations(organizationsResponse.data || []);
        setAssets(assetsResponse.data || []);
        setAllSubAssets(subAssetsResponse.data || []);

        // Transform sub-organizations data to match our display format
        const transformedSubOrganizations =
          subOrganizationsResponse.data?.map((subOrg: any) => {
            // Find asset and sub-asset names
            const asset = assetsResponse.data?.find(
              (asset: any) => asset.id === subOrg.assetId
            );
            const subAsset = subAssetsResponse.data?.find(
              (subAsset: any) => subAsset.id === subOrg.subAssetId
            );

            return {
              id: subOrg.id,
              name: subOrg.name,
              // organizationId: subOrg.organizationId,
              organizationName:
                organizationsResponse.data?.find(
                  (org: any) => org.id === subOrg.organizationId
                )?.name || "N/A",
              // assetId: subOrg.assetId,
              // subAssetId: subOrg.subAssetId,
              assetName: asset?.name || "N/A",
              subAssetName: subAsset?.name || "N/A",
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditSubOrganization(subOrg)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteSubOrganization(subOrg)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || [];

        setSubOrganizations(transformedSubOrganizations);
        setFilteredSubOrganizations(transformedSubOrganizations);
        setError("");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubOrganizations(subOrganizations);
    } else {
      const filtered = subOrganizations.filter(
        (subOrg) =>
          subOrg.name.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.organizationName.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.assetName.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.subAssetName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubOrganizations(filtered);
    }
  };

  const handleCreateSubOrganization = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const subOrganizationData = {
        name: formData.name,
        organizationId: parseInt(formData.organizationId),
        assetId: parseInt(formData.assetId),
        subAssetId: parseInt(formData.subAssetId),
      };

      const response = await api.createSubOrganization(
        subOrganizationData,
        token
      );

      if (response.success) {
        // Refresh the sub-organization list
        await refreshSubOrganizationList();
        setError("");
        showSuccessMessage("Sub-organization created successfully!");
      } else {
        setError(response.message || "Failed to create sub-organization");
      }
    } catch (error) {
      console.error("Error creating sub-organization:", error);
      setError("Failed to create sub-organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubOrganization = async (formData: any) => {
    if (!token || !selectedSubOrganization) {
      setError("Authentication required or no sub-organization selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const subOrganizationData = {
        name: formData.name,
        organizationId: parseInt(formData.organizationId),
        assetId: parseInt(formData.assetId),
        subAssetId: parseInt(formData.subAssetId),
      };

      const response = await api.updateSubOrganization(
        selectedSubOrganization.id,
        subOrganizationData,
        token
      );

      if (response.success) {
        // Refresh the sub-organization list
        await refreshSubOrganizationList();
        setIsEditModalOpen(false);
        setSelectedSubOrganization(null);
        setError("");
        showSuccessMessage("Sub-organization updated successfully!");
      } else {
        setError(response.message || "Failed to update sub-organization");
      }
    } catch (error) {
      console.error("Error updating sub-organization:", error);
      setError("Failed to update sub-organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubOrganization = (subOrganization: any) => {
    setSubOrganizationToDelete(subOrganization);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSubOrganization = async () => {
    if (!token || !subOrganizationToDelete) {
      setError("Authentication required or no sub-organization selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteSubOrganization(
        subOrganizationToDelete.id,
        token
      );

      if (response.success) {
        // Refresh the sub-organization list
        await refreshSubOrganizationList();
        setError("");
        showSuccessMessage("Sub-organization deleted successfully!");
        setIsDeleteModalOpen(false);
        setSubOrganizationToDelete(null);
      } else {
        setError(response.message || "Failed to delete sub-organization");
      }
    } catch (error) {
      console.error("Error deleting sub-organization:", error);
      setError("Failed to delete sub-organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubOrganization = (subOrganization: any) => {
    setSelectedSubOrganization(subOrganization);
    setIsEditModalOpen(true);
  };

  const refreshSubOrganizationList = async () => {
    if (!token) return;

    // Fetch sub-organizations, organizations, assets, and sub-assets
    const [
      updatedResponse,
      organizationsResponse,
      assetsResponse,
      subAssetsResponse,
    ] = await Promise.all([
      api.getAllSubOrganizations(token),
      api.getAllOrganizations(token),
      api.getAllAssets(token),
      api.getAllSubAssets(token),
    ]);

    // Update cached data
    setOrganizations(organizationsResponse.data || []);
    setAssets(assetsResponse.data || []);
    setAllSubAssets(subAssetsResponse.data || []);

    const transformedSubOrganizations =
      updatedResponse.data?.map((subOrg: any) => {
        // Find asset and sub-asset names
        const asset = assetsResponse.data?.find(
          (asset: any) => asset.id === subOrg.assetId
        );
        const subAsset = subAssetsResponse.data?.find(
          (subAsset: any) => subAsset.id === subOrg.subAssetId
        );

        return {
          id: subOrg.id,
          name: subOrg.name,
          // organizationId: subOrg.organizationId,
          organizationName:
            organizationsResponse.data?.find(
              (org: any) => org.id === subOrg.organizationId
            )?.name || "N/A",
          // assetId: subOrg.assetId,
          // subAssetId: subOrg.subAssetId,
          assetName: asset?.name || "N/A",
          subAssetName: subAsset?.name || "N/A",
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditSubOrganization(subOrg)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteSubOrganization(subOrg)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || [];

    setSubOrganizations(transformedSubOrganizations);
    setFilteredSubOrganizations(transformedSubOrganizations);
  };

  const CreateSubOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      organizationId: "",
      assetId: "",
      subAssetId: "",
    });
    const [availableSubAssets, setAvailableSubAssets] = useState<
      SubAssetData[]
    >([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState("");
    const [validationErrors, setValidationErrors] = useState<{
      name?: string;
      organizationId?: string;
      assetId?: string;
      subAssetId?: string;
    }>({});
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );

    // Validation function
    const validateForm = () => {
      const errors: {
        name?: string;
        organizationId?: string;
        assetId?: string;
        subAssetId?: string;
      } = {};

      if (!formData.name.trim()) {
        errors.name = "Sub-organization name is required";
      }

      if (!formData.organizationId) {
        errors.organizationId = "Please select an organization";
      }

      if (!formData.assetId) {
        errors.assetId = "Please select an asset";
      }

      if (!formData.subAssetId) {
        errors.subAssetId = "Please select a sub-asset";
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    // Filter sub-assets when asset changes using cached data
    const handleAssetChange = (assetId: string) => {
      setFormData({ ...formData, assetId, subAssetId: "" });
      // Clear validation error for asset when changed
      if (validationErrors.assetId) {
        setValidationErrors({ ...validationErrors, assetId: undefined });
      }
      if (assetId) {
        // Filter sub-assets from cached data by assetId
        const filteredSubAssets = allSubAssets.filter(
          (subAsset) => subAsset.assetId === parseInt(assetId)
        );
        setAvailableSubAssets(filteredSubAssets);
      } else {
        setAvailableSubAssets([]);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      await handleCreateSubOrganization(formData);
      setFormData({
        name: "",
        organizationId: "",
        assetId: "",
        subAssetId: "",
      });
      setAvailableSubAssets([]);
      setValidationErrors({});
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Sub-Organization Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.name) {
                setValidationErrors({ ...validationErrors, name: undefined });
              }
            }}
            className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] w-full ${
              validationErrors.name
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E5E5]"
            }`}
            required
          />
          {validationErrors.name && (
            <p className="text-sm text-red-500">{validationErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Select
            value={formData.organizationId}
            onValueChange={(value) => {
              setFormData({ ...formData, organizationId: value });
              // Clear validation error when user selects an option
              if (validationErrors.organizationId) {
                setValidationErrors({
                  ...validationErrors,
                  organizationId: undefined,
                });
              }
            }}
            required
          >
            <SelectTrigger
              className={`rounded-full bg-white text-[#2C2C2C] w-full ${
                validationErrors.organizationId
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
            >
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <div className="sticky top-0 z-10 bg-white border-b p-2">
                <Input
                  ref={searchInputRef}
                  placeholder="Search organizations..."
                  value={orgSearchQuery}
                  onChange={(e) => setOrgSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredOrganizations.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No organizations found
                  </div>
                ) : (
                  filteredOrganizations.map((organization) => (
                    <SelectItem
                      key={organization.id}
                      value={organization.id.toString()}
                      onSelect={() => {
                        setOrgSearchQuery("");
                        // Ensure focus returns to search input after selection
                        setTimeout(() => {
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }, 0);
                      }}
                    >
                      {organization.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          {validationErrors.organizationId && (
            <p className="text-sm text-red-500">
              {validationErrors.organizationId}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset">Asset *</Label>
          <Select
            value={formData.assetId}
            onValueChange={handleAssetChange}
            required
          >
            <SelectTrigger
              className={`rounded-full bg-white text-[#2C2C2C] w-full ${
                validationErrors.assetId
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
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
          {validationErrors.assetId && (
            <p className="text-sm text-red-500">{validationErrors.assetId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subAsset">Asset Sub-Category *</Label>
          <Select
            value={formData.subAssetId}
            onValueChange={(value) => {
              setFormData({ ...formData, subAssetId: value });
              // Clear validation error when user selects an option
              if (validationErrors.subAssetId) {
                setValidationErrors({
                  ...validationErrors,
                  subAssetId: undefined,
                });
              }
            }}
            required
            disabled={!formData.assetId}
          >
            <SelectTrigger
              className={`rounded-full bg-white text-[#2C2C2C] w-full ${
                validationErrors.subAssetId
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
            >
              <SelectValue placeholder="Select a Asset Sub-Category" />
            </SelectTrigger>
            <SelectContent>
              {availableSubAssets.map((subAsset) => (
                <SelectItem key={subAsset.id} value={subAsset.id.toString()}>
                  {subAsset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.subAssetId && (
            <p className="text-sm text-red-500">
              {validationErrors.subAssetId}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.name.trim() ||
              !formData.organizationId ||
              !formData.assetId ||
              !formData.subAssetId
            }
            className="rounded-full"
          >
            {isLoading ? "Creating..." : "Create Sub-Organization"}
          </Button>
        </div>
      </form>
    );
  };

  const EditSubOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: selectedSubOrganization?.name || "",
      organizationId: selectedSubOrganization?.organizationId?.toString() || "",
      assetId: selectedSubOrganization?.assetId?.toString() || "",
      subAssetId: selectedSubOrganization?.subAssetId?.toString() || "",
    });
    const [availableSubAssets, setAvailableSubAssets] = useState<
      SubAssetData[]
    >([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState("");
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );

    // Filter sub-assets when component mounts or asset changes using cached data
    useEffect(() => {
      if (formData.assetId) {
        // Filter sub-assets from cached data by assetId
        const filteredSubAssets = allSubAssets.filter(
          (subAsset) => subAsset.assetId === parseInt(formData.assetId)
        );
        setAvailableSubAssets(filteredSubAssets);
      } else {
        setAvailableSubAssets([]);
      }
    }, [formData.assetId, allSubAssets]);

    const handleAssetChange = (assetId: string) => {
      setFormData({ ...formData, assetId, subAssetId: "" });
      if (assetId) {
        // Filter sub-assets from cached data by assetId
        const filteredSubAssets = allSubAssets.filter(
          (subAsset) => subAsset.assetId === parseInt(assetId)
        );
        setAvailableSubAssets(filteredSubAssets);
      } else {
        setAvailableSubAssets([]);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateSubOrganization(formData);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_name">Sub-Organization Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] border-[#E5E5E5] w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_organization">Organization *</Label>
          <Select
            value={formData.organizationId}
            onValueChange={(value) =>
              setFormData({ ...formData, organizationId: value })
            }
            required
          >
            <SelectTrigger className="rounded-full bg-white text-[#2C2C2C] w-full border-[#E5E5E5]">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <div className="sticky top-0 z-10 bg-white border-b p-2">
                <Input
                  ref={searchInputRef}
                  placeholder="Search organizations..."
                  value={orgSearchQuery}
                  onChange={(e) => setOrgSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredOrganizations.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">
                    No organizations found
                  </div>
                ) : (
                  filteredOrganizations.map((organization) => (
                    <SelectItem
                      key={organization.id}
                      value={organization.id.toString()}
                      onSelect={() => {
                        setOrgSearchQuery("");
                        // Ensure focus returns to search input after selection
                        setTimeout(() => {
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }, 0);
                      }}
                    >
                      {organization.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_asset">Asset *</Label>
          <Select
            value={formData.assetId}
            onValueChange={handleAssetChange}
            required
          >
            <SelectTrigger className="rounded-full bg-white text-[#2C2C2C] w-full border-[#E5E5E5]">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_subAsset">Asset Sub-Category *</Label>
          <Select
            value={formData.subAssetId}
            onValueChange={(value) =>
              setFormData({ ...formData, subAssetId: value })
            }
            required
          >
            <SelectTrigger className="rounded-full bg-white text-[#2C2C2C] w-full border-[#E5E5E5]">
              <SelectValue placeholder="Select a Asset Sub-Category" />
            </SelectTrigger>
            <SelectContent>
              {availableSubAssets.map((subAsset) => (
                <SelectItem key={subAsset.id} value={subAsset.id.toString()}>
                  {subAsset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedSubOrganization(null);
            }}
            className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C]"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Sub-Organization"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "Sub-Organization",
    "Organization",
    "Asset",
    "Asset Sub-Category",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub-Organizations"
      description="Manage sub-organizations within organizations"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 right-4 z-[9999] p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search sub-organizations..."
        createButtonText="Create Sub-Organization"
        createForm={<CreateSubOrganizationForm />}
        tableData={filteredSubOrganizations}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-[#E5E5E5] text-[#2C2C2C] max-h-[80%] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              Edit Sub-Organization
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsEditModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <EditSubOrganizationForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Delete Sub-Organization
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSubOrganizationToDelete(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[#2C2C2C] mb-6">
              Are you sure you want to delete the sub-organization "
              {subOrganizationToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSubOrganizationToDelete(null);
                }}
                className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteSubOrganization}
                disabled={isLoading}
                className="rounded-full"
              >
                {isLoading ? "Deleting..." : "Delete Sub-Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubOrganizationPage;
