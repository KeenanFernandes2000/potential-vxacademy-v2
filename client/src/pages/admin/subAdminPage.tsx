import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Email, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for user operations
const api = {
  async getAllUsers(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/users/users`, {
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
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  async createUser(userData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/users/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  async deleteUser(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
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
      console.error("Failed to delete user:", error);
      throw error;
    }
  },
};

// Type for sub-admin data
interface SubAdminData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  fullName: string;
  email: string;
  organization: string;
  subOrganization: string;
  asset: string;
  subAsset: string;
  actions: React.ReactNode;
}

const SubAdminPage = () => {
  const { token } = useAuth();
  const [subAdmins, setSubAdmins] = useState<SubAdminData[]>([]);
  const [filteredSubAdmins, setFilteredSubAdmins] = useState<SubAdminData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users from database on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      console.log("token", token);
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      } else {
        console.log("token", token);
        setError("");
      }

      try {
        setIsLoading(true);
        const response = await api.getAllUsers(token);

        // Filter for sub-admin users only
        const subAdminUsers =
          response.data?.filter((user: any) => user.userType === "sub_admin") ||
          [];

        // Transform data to match our display format
        const transformedUsers = subAdminUsers.map((user: any) => ({
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          organization: user.organization || "N/A",
          subOrganization: user.subOrganization || "N/A",
          asset: user.asset || "N/A",
          subAsset: user.subAsset || "N/A",
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEmailSubAdmin(user)}
                title="Send Email"
              >
                <Email sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditSubAdmin(user)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteSubAdmin(user.id)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        }));

        setSubAdmins(transformedUsers);
        setFilteredSubAdmins(transformedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load sub-admins. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubAdmins(subAdmins);
    } else {
      const filtered = subAdmins.filter(
        (subAdmin) =>
          subAdmin.fullName.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.organization.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.subOrganization
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          subAdmin.asset.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.subAsset.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubAdmins(filtered);
    }
  };

  const handleCreateSubAdmin = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const userData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        organization: formData.organization,
        subOrganization: formData.sub_organization,
        asset: formData.asset,
        subAsset: formData.sub_asset,
        userType: "sub_admin", // Hard coded as sub-admin
        password: formData.password,
      };

      const response = await api.createUser(userData, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setError("");
      } else {
        setError(response.message || "Failed to create sub-admin");
      }
    } catch (error) {
      console.error("Error creating sub-admin:", error);
      setError("Failed to create sub-admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubAdmin = async (formData: any) => {
    if (!token || !selectedUser) {
      setError("Authentication required or no user selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const userData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        organization: formData.organization,
        subOrganization: formData.sub_organization,
        asset: formData.asset,
        subAsset: formData.sub_asset,
        userType: "sub_admin", // Hard coded as sub-admin
        password: formData.password,
      };

      const response = await api.updateUser(selectedUser.id, userData, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setError("");
      } else {
        setError(response.message || "Failed to update sub-admin");
      }
    } catch (error) {
      console.error("Error updating sub-admin:", error);
      setError("Failed to update sub-admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (userId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this sub-admin?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteUser(userId, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setError("");
      } else {
        setError(response.message || "Failed to delete sub-admin");
      }
    } catch (error) {
      console.error("Error deleting sub-admin:", error);
      setError("Failed to delete sub-admin. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubAdmin = (user: any) => {
    setSelectedUser(user);
    setIsEmailModalOpen(true);
  };

  const handleEditSubAdmin = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const refreshUserList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllUsers(token);
    const subAdminUsers =
      updatedResponse.data?.filter(
        (user: any) => user.userType === "sub_admin"
      ) || [];

    const transformedUsers = subAdminUsers.map((user: any) => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      organization: user.organization || "N/A",
      subOrganization: user.subOrganization || "N/A",
      asset: user.asset || "N/A",
      subAsset: user.subAsset || "N/A",
      actions: (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
            onClick={() => handleEmailSubAdmin(user)}
            title="Send Email"
          >
            <Email sx={{ fontSize: 16 }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
            onClick={() => handleEditSubAdmin(user)}
            title="Edit"
          >
            <Edit sx={{ fontSize: 16 }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
            onClick={() => handleDeleteSubAdmin(user.id)}
            title="Delete"
          >
            <Delete sx={{ fontSize: 16 }} />
          </Button>
        </div>
      ),
    }));

    setSubAdmins(transformedUsers);
    setFilteredSubAdmins(transformedUsers);
  };

  const CreateSubAdminForm = () => {
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      organization: "",
      sub_organization: "",
      asset: "",
      sub_asset: "",
      password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateSubAdmin(formData);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        organization: "",
        sub_organization: "",
        asset: "",
        sub_asset: "",
        password: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="rounded-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="rounded-full"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub_organization">Sub Organization</Label>
          <Input
            id="sub_organization"
            value={formData.sub_organization}
            onChange={(e) =>
              setFormData({ ...formData, sub_organization: e.target.value })
            }
            className="rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset">Asset *</Label>
          <Input
            id="asset"
            value={formData.asset}
            onChange={(e) =>
              setFormData({ ...formData, asset: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub_asset">Sub Asset *</Label>
          <Input
            id="sub_asset"
            value={formData.sub_asset}
            onChange={(e) =>
              setFormData({ ...formData, sub_asset: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Sub-Admin"}
          </Button>
        </div>
      </form>
    );
  };

  const EditSubAdminForm = () => {
    const [formData, setFormData] = useState({
      first_name: selectedUser?.firstName || "",
      last_name: selectedUser?.lastName || "",
      email: selectedUser?.email || "",
      organization: selectedUser?.organization || "",
      sub_organization: selectedUser?.subOrganization || "",
      asset: selectedUser?.asset || "",
      sub_asset: selectedUser?.subAsset || "",
      password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateSubAdmin(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_first_name">First Name *</Label>
            <Input
              id="edit_first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="rounded-full"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_last_name">Last Name *</Label>
            <Input
              id="edit_last_name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="rounded-full"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_email">Email Address *</Label>
          <Input
            id="edit_email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_organization">Organization *</Label>
          <Input
            id="edit_organization"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_sub_organization">Sub Organization</Label>
          <Input
            id="edit_sub_organization"
            value={formData.sub_organization}
            onChange={(e) =>
              setFormData({ ...formData, sub_organization: e.target.value })
            }
            className="rounded-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_asset">Asset *</Label>
          <Input
            id="edit_asset"
            value={formData.asset}
            onChange={(e) =>
              setFormData({ ...formData, asset: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_sub_asset">Sub Asset *</Label>
          <Input
            id="edit_sub_asset"
            value={formData.sub_asset}
            onChange={(e) =>
              setFormData({ ...formData, sub_asset: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_password">
            New Password (leave blank to keep current)
          </Label>
          <Input
            id="edit_password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="rounded-full"
            placeholder="Enter new password or leave blank"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Sub-Admin"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "Full Name",
    "Email",
    "Organization",
    "Sub Organization",
    "Asset",
    "Sub Asset",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub Admins"
      description="Manage sub-administrators and their access permissions"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search sub-admins..."
        createButtonText="Create Sub-Admin"
        createForm={<CreateSubAdminForm />}
        tableData={filteredSubAdmins}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Sub-Admin</DialogTitle>
          </DialogHeader>
          <EditSubAdminForm />
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Email Sent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/90">
              An invitation email has been sent to {selectedUser?.email}
            </p>
            <div className="space-y-2">
              <Label className="text-white/90">Join URL:</Label>
              <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                <code className="text-[#00d8cc] break-all">
                  {import.meta.env.VITE_FRONTEND_URL || window.location.origin}
                  /join?id={selectedUser?.id}
                </code>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setSelectedUser(null);
                }}
                className="rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubAdminPage;
