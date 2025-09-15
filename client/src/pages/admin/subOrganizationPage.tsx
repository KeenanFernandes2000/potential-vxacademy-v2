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
import { Edit, Delete } from "@mui/icons-material";
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
  actions: React.ReactNode;
}

// Type for organization data
interface OrganizationData {
  id: number;
  name: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubOrganization, setSelectedSubOrganization] =
    useState<any>(null);

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

        // Fetch sub-organizations and organizations in parallel
        const [subOrganizationsResponse, organizationsResponse] =
          await Promise.all([
            api.getAllSubOrganizations(token),
            api.getAllOrganizations(token),
          ]);

        // Set organizations
        setOrganizations(organizationsResponse.data || []);

        // Transform sub-organizations data to match our display format
        const transformedSubOrganizations =
          subOrganizationsResponse.data?.map((subOrg: any) => ({
            id: subOrg.id,
            name: subOrg.name,
            organizationName:
              organizationsResponse.data?.find(
                (org: any) => org.id === subOrg.organizationId
              )?.name || "N/A",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditSubOrganization(subOrg)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteSubOrganization(subOrg.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

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
          subOrg.organizationName.toLowerCase().includes(query.toLowerCase())
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
      };

      const response = await api.createSubOrganization(
        subOrganizationData,
        token
      );

      if (response.success) {
        // Refresh the sub-organization list
        await refreshSubOrganizationList();
        setError("");
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

  const handleDeleteSubOrganization = async (subOrganizationId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this sub-organization?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteSubOrganization(
        subOrganizationId,
        token
      );

      if (response.success) {
        // Refresh the sub-organization list
        await refreshSubOrganizationList();
        setError("");
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

    // Fetch both sub-organizations and organizations
    const [updatedResponse, organizationsResponse] = await Promise.all([
      api.getAllSubOrganizations(token),
      api.getAllOrganizations(token),
    ]);

    const transformedSubOrganizations =
      updatedResponse.data?.map((subOrg: any) => ({
        id: subOrg.id,
        name: subOrg.name,
        organizationName:
          organizationsResponse.data?.find(
            (org: any) => org.id === subOrg.organizationId
          )?.name || "N/A",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditSubOrganization(subOrg)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteSubOrganization(subOrg.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setSubOrganizations(transformedSubOrganizations);
    setFilteredSubOrganizations(transformedSubOrganizations);
  };

  const CreateSubOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      organizationId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateSubOrganization(formData);
      setFormData({
        name: "",
        organizationId: "",
      });
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Select
            value={formData.organizationId}
            onValueChange={(value) =>
              setFormData({ ...formData, organizationId: value })
            }
            required
          >
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30 w-full">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((organization) => (
                <SelectItem
                  key={organization.id}
                  value={organization.id.toString()}
                >
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
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
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateSubOrganization(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_name">Sub-Organization Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
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
            <SelectTrigger className="rounded-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((organization) => (
                <SelectItem
                  key={organization.id}
                  value={organization.id.toString()}
                >
                  {organization.name}
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
            className="rounded-full bg-[#00d8cc]/30"
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

  const columns = ["ID", "Name", "Organization", "Actions"];

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
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Sub-Organization
            </DialogTitle>
          </DialogHeader>
          <EditSubOrganizationForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubOrganizationPage;
