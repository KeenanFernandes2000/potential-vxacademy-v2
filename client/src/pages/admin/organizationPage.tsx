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
  dateAdded: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  // Function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

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

        // Fetch organizations
        const organizationsResponse = await api.getAllOrganizations(token);

        // Transform organizations data to match our display format
        const transformedOrganizations =
          organizationsResponse.data?.map((organization: any) => ({
            id: organization.id,
            name: organization.name,
            dateAdded: organization.createdAt
              ? new Date(organization.createdAt).toLocaleDateString()
              : "N/A",
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
          })) || [];

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
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(query.toLowerCase())
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

      // Prepare data for API - only send name
      const organizationData = {
        name: formData.name,
      };

      const response = await api.createOrganization(organizationData, token);

      if (response.success) {
        // Refresh the organization list
        await refreshOrganizationList();
        setError("");
        showSuccessMessage("Organization created successfully!");
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

      // Prepare data for API - only send name
      const organizationData = {
        name: formData.name,
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
        showSuccessMessage("Organization updated successfully!");
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
        showSuccessMessage("Organization deleted successfully!");
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

    // Fetch organizations
    const updatedResponse = await api.getAllOrganizations(token);

    const transformedOrganizations =
      updatedResponse.data?.map((organization: any) => ({
        id: organization.id,
        name: organization.name,
        dateAdded: organization.createdAt
          ? new Date(organization.createdAt).toLocaleDateString()
          : "N/A",
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
      })) || [];

    setOrganizations(transformedOrganizations);
    setFilteredOrganizations(transformedOrganizations);
  };

  const CreateOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateOrganization(formData);
      setFormData({
        name: "",
      });
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
            className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#666666]"
            placeholder="Type Organization Name"
            required
          />
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
    });

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
            className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#666666]"
            placeholder="Type Organization Name"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedOrganization(null);
            }}
            className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#666666]"
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

  const columns = ["ID", "Organization", "Date Added", "Actions"];

  return (
    <AdminPageLayout
      title="Organization Management"
      description="Manage Organizations and Sub-Organizations"
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
        searchPlaceholder="Search organizations..."
        createButtonText="Create Organization"
        createForm={<CreateOrganizationForm />}
        tableData={filteredOrganizations}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Edit Organization
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedOrganization(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <EditOrganizationForm />
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default OrganizationPage;
