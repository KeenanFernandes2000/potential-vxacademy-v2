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
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for organization operations
const api = {
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

  async getSubAssetsByAssetId(assetId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-assets/by-asset/${assetId}`,
        {
          method: "GET",
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
      console.error("Failed to fetch sub-assets:", error);
      throw error;
    }
  },

  async createOrganization(organizationData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create organization:", error);
      throw error;
    }
  },

  async updateOrganization(
    organizationId: number,
    organizationData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/organizations/${organizationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(organizationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update organization:", error);
      throw error;
    }
  },

  async deleteOrganization(organizationId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/organizations/${organizationId}`,
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
      console.error("Failed to delete organization:", error);
      throw error;
    }
  },
};

// Type for organization data
interface OrganizationData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  assetId: number;
  subAssetId: number;
  assetName: string;
  subAssetName: string;
  actions: React.ReactNode;
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

const OrganizationPage = () => {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    OrganizationData[]
  >([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [subAssets, setSubAssets] = useState<SubAssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  // Fetch organizations and assets from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch organizations and assets in parallel
        const [organizationsResponse, assetsResponse] = await Promise.all([
          api.getAllOrganizations(token),
          api.getAllAssets(token),
        ]);

        // Set assets
        setAssets(assetsResponse.data || []);

        // Transform organizations data to match our display format
        const transformedOrganizations = await Promise.all(
          organizationsResponse.data?.map(async (organization: any) => {
            let subAssetName = "N/A";
            if (organization.subAssetId) {
              try {
                const subAssetsResponse = await api.getSubAssetsByAssetId(
                  organization.assetId,
                  token
                );
                const subAsset = subAssetsResponse.data?.find(
                  (sa: any) => sa.id === organization.subAssetId
                );
                subAssetName = subAsset?.name || "N/A";
              } catch (error) {
                console.error("Error fetching sub-asset name:", error);
              }
            }

            return {
              id: organization.id,
              name: organization.name,
              assetId: organization.assetId,
              subAssetId: organization.subAssetId,
              assetName:
                assetsResponse.data?.find(
                  (asset: any) => asset.id === organization.assetId
                )?.name || "N/A",
              subAssetName,
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditOrganization(organization)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteOrganization(organization.id)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || []
        );

        setOrganizations(transformedOrganizations);
        setFilteredOrganizations(transformedOrganizations);
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
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.assetName.toLowerCase().includes(query.toLowerCase()) ||
          org.subAssetName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  };

  const handleCreateOrganization = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API - send name, assetId, and subAssetId
      const organizationData = {
        name: formData.name,
        assetId: parseInt(formData.assetId),
        subAssetId: parseInt(formData.subAssetId),
      };

      const response = await api.createOrganization(organizationData, token);

      if (response.success) {
        // Refresh the organization list
        await refreshOrganizationList();
        setError("");
      } else {
        setError(response.message || "Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      setError("Failed to create organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrganization = async (formData: any) => {
    if (!token || !selectedOrganization) {
      setError("Authentication required or no organization selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const organizationData = {
        name: formData.name,
        assetId: parseInt(formData.assetId),
        subAssetId: parseInt(formData.subAssetId),
      };

      const response = await api.updateOrganization(
        selectedOrganization.id,
        organizationData,
        token
      );

      if (response.success) {
        // Refresh the organization list
        await refreshOrganizationList();
        setIsEditModalOpen(false);
        setSelectedOrganization(null);
        setError("");
      } else {
        setError(response.message || "Failed to update organization");
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      setError("Failed to update organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async (organizationId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this organization?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteOrganization(organizationId, token);

      if (response.success) {
        // Refresh the organization list
        await refreshOrganizationList();
        setError("");
      } else {
        setError(response.message || "Failed to delete organization");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      setError("Failed to delete organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrganization = (organization: any) => {
    setSelectedOrganization(organization);
    setIsEditModalOpen(true);
  };

  const refreshOrganizationList = async () => {
    if (!token) return;

    // Fetch both organizations and assets
    const [updatedResponse, assetsResponse] = await Promise.all([
      api.getAllOrganizations(token),
      api.getAllAssets(token),
    ]);

    const transformedOrganizations = await Promise.all(
      updatedResponse.data?.map(async (organization: any) => {
        let subAssetName = "N/A";
        if (organization.subAssetId) {
          try {
            const subAssetsResponse = await api.getSubAssetsByAssetId(
              organization.assetId,
              token
            );
            const subAsset = subAssetsResponse.data?.find(
              (sa: any) => sa.id === organization.subAssetId
            );
            subAssetName = subAsset?.name || "N/A";
          } catch (error) {
            console.error("Error fetching sub-asset name:", error);
          }
        }

        return {
          id: organization.id,
          name: organization.name,
          assetId: organization.assetId,
          subAssetId: organization.subAssetId,
          assetName:
            assetsResponse.data?.find(
              (asset: any) => asset.id === organization.assetId
            )?.name || "N/A",
          subAssetName,
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditOrganization(organization)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteOrganization(organization.id)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || []
    );

    setOrganizations(transformedOrganizations);
    setFilteredOrganizations(transformedOrganizations);
  };

  const CreateOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      assetId: "",
      subAssetId: "",
    });
    const [availableSubAssets, setAvailableSubAssets] = useState<
      SubAssetData[]
    >([]);

    // Fetch sub-assets when asset changes
    const handleAssetChange = async (assetId: string) => {
      setFormData({ ...formData, assetId, subAssetId: "" });
      if (assetId && token) {
        try {
          const response = await api.getSubAssetsByAssetId(
            parseInt(assetId),
            token
          );
          setAvailableSubAssets(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-assets:", error);
          setAvailableSubAssets([]);
        }
      } else {
        setAvailableSubAssets([]);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateOrganization(formData);
      setFormData({
        name: "",
        assetId: "",
        subAssetId: "",
      });
      setAvailableSubAssets([]);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset">Asset *</Label>
          <Select
            value={formData.assetId}
            onValueChange={handleAssetChange}
            required
          >
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30 w-full">
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
          <Label htmlFor="subAsset">Sub Asset *</Label>
          <Select
            value={formData.subAssetId}
            onValueChange={(value) =>
              setFormData({ ...formData, subAssetId: value })
            }
            required
            disabled={!formData.assetId}
          >
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30 w-full">
              <SelectValue placeholder="Select a sub asset" />
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
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </form>
    );
  };

  const EditOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: selectedOrganization?.name || "",
      assetId: selectedOrganization?.assetId?.toString() || "",
      subAssetId: selectedOrganization?.subAssetId?.toString() || "",
    });
    const [availableSubAssets, setAvailableSubAssets] = useState<
      SubAssetData[]
    >([]);

    // Fetch sub-assets when component mounts or asset changes
    useEffect(() => {
      const fetchSubAssets = async () => {
        if (formData.assetId && token) {
          try {
            const response = await api.getSubAssetsByAssetId(
              parseInt(formData.assetId),
              token
            );
            setAvailableSubAssets(response.data || []);
          } catch (error) {
            console.error("Error fetching sub-assets:", error);
            setAvailableSubAssets([]);
          }
        } else {
          setAvailableSubAssets([]);
        }
      };

      fetchSubAssets();
    }, [formData.assetId, token]);

    const handleAssetChange = async (assetId: string) => {
      setFormData({ ...formData, assetId, subAssetId: "" });
      if (assetId && token) {
        try {
          const response = await api.getSubAssetsByAssetId(
            parseInt(assetId),
            token
          );
          setAvailableSubAssets(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-assets:", error);
          setAvailableSubAssets([]);
        }
      } else {
        setAvailableSubAssets([]);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateOrganization(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_name">Organization Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_asset">Asset *</Label>
          <Select
            value={formData.assetId}
            onValueChange={handleAssetChange}
            required
          >
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30 w-full">
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
          <Label htmlFor="edit_subAsset">Sub Asset *</Label>
          <Select
            value={formData.subAssetId}
            onValueChange={(value) =>
              setFormData({ ...formData, subAssetId: value })
            }
            required
          >
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30 w-full">
              <SelectValue placeholder="Select a sub asset" />
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
              setSelectedOrganization(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Organization"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Name", "Asset", "Sub Asset", "Actions"];

  return (
    <AdminPageLayout
      title="Organizations"
      description="Manage organizations and institutions using the platform"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search organizations..."
        createButtonText="Create Organization"
        createForm={<CreateOrganizationForm />}
        tableData={filteredOrganizations}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Organization</DialogTitle>
          </DialogHeader>
          <EditOrganizationForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default OrganizationPage;
