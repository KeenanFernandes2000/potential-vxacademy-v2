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
  type: string;
  location: string;
  contactEmail: string;
  createdDate: string;
  status: string;
  userCount: number;
  actions: React.ReactNode;
}

const OrganizationPage = () => {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    OrganizationData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);

  // Fetch organizations from database on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllOrganizations(token);

        // Transform data to match our display format
        const transformedOrganizations =
          response.data?.map((organization: any) => ({
            id: organization.id,
            name: organization.name,
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
        console.error("Error fetching organizations:", error);
        setError("Failed to load organizations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.type.toLowerCase().includes(query.toLowerCase()) ||
          org.location.toLowerCase().includes(query.toLowerCase())
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
        type: formData.type,
        location: formData.location,
        contactEmail: formData.contactEmail,
        description: formData.description,
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
    const updatedResponse = await api.getAllOrganizations(token);

    const transformedOrganizations =
      updatedResponse.data?.map((organization: any) => ({
        id: organization.id,
        name: organization.name,
        type: organization.type || "N/A",
        location: organization.location || "N/A",
        contactEmail: organization.contactEmail || "N/A",
        createdDate: organization.createdAt
          ? new Date(organization.createdAt).toISOString().split("T")[0]
          : "N/A",
        status: organization.status || "Active",
        userCount: organization.userCount || 0,
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
            className="rounded-full bg-[#00d8cc]/30"
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
      type: selectedOrganization?.type || "",
      location: selectedOrganization?.location || "",
      contactEmail: selectedOrganization?.contactEmail || "",
      description: selectedOrganization?.description || "",
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
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_type">Organization Type *</Label>
          <Input
            id="edit_type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_location">Location *</Label>
          <Input
            id="edit_location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_contactEmail">Contact Email *</Label>
          <Input
            id="edit_contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_description">Description</Label>
          <Input
            id="edit_description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
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

  const columns = ["ID", "Name", "Actions"];

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
