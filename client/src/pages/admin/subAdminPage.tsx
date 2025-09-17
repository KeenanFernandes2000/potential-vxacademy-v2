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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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

  async getSubOrganizationsByOrganizationId(
    organizationId: number,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-organizations/by-organization/${organizationId}`,
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
      console.error("Failed to fetch sub-organizations:", error);
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

  // Dropdown data states
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [subAssets, setSubAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  // Fetch organizations and assets on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;

      try {
        const [orgsResponse, assetsResponse] = await Promise.all([
          api.getAllOrganizations(token),
          api.getAllAssets(token),
        ]);

        setOrganizations(orgsResponse.data || []);
        setAssets(assetsResponse.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Failed to load dropdown data. Please try again.");
      }
    };

    fetchDropdownData();
  }, [token]);

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
          name: `${user.firstName} ${user.lastName}`,
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

  const handleAssetChange = async (assetId: number) => {
    if (!token) return;

    setSelectedAssetId(assetId);
    setSubAssets([]); // Clear previous sub-assets

    try {
      const response = await api.getSubAssetsByAssetId(assetId, token);
      setSubAssets(response.data || []);
    } catch (error) {
      console.error("Error fetching sub-assets:", error);
      setError("Failed to load sub-assets. Please try again.");
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
      name: `${user.firstName} ${user.lastName}`,
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
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [selectedSubOrgId, setSelectedSubOrgId] = useState<number | null>(
      null
    );
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [selectedSubAssetId, setSelectedSubAssetId] = useState<number | null>(
      null
    );
    const [formSubAssets, setFormSubAssets] = useState<any[]>([]);
    const [formSubOrganizations, setFormSubOrganizations] = useState<any[]>([]);

    const handleOrgChange = async (orgId: number) => {
      setSelectedOrgId(orgId);
      const selectedOrg = organizations.find((org) => org.id === orgId);
      setFormData({
        ...formData,
        organization: selectedOrg?.name || "",
        sub_organization: "",
      });
      setSelectedSubOrgId(null);
      setFormSubOrganizations([]);

      // Fetch sub-organizations for the selected organization
      if (token) {
        try {
          const response = await api.getSubOrganizationsByOrganizationId(
            orgId,
            token
          );
          setFormSubOrganizations(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-organizations:", error);
        }
      }
    };

    const handleSubOrgChange = (subOrgId: number) => {
      setSelectedSubOrgId(subOrgId);
      const selectedSubOrg = formSubOrganizations.find(
        (subOrg) => subOrg.id === subOrgId
      );
      setFormData({
        ...formData,
        sub_organization: selectedSubOrg?.name || "",
      });
    };

    const handleAssetChange = async (assetId: number) => {
      setSelectedAssetId(assetId);
      const selectedAsset = assets.find((asset) => asset.id === assetId);
      setFormData({
        ...formData,
        asset: selectedAsset?.name || "",
        sub_asset: "",
        organization: "",
        sub_organization: "",
      });
      setSelectedSubAssetId(null);
      setSelectedOrgId(null);
      setSelectedSubOrgId(null);
      setFormSubAssets([]);
      setFormSubOrganizations([]);

      if (token) {
        try {
          const response = await api.getSubAssetsByAssetId(assetId, token);
          setFormSubAssets(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-assets:", error);
        }
      }
    };

    const handleSubAssetChange = async (subAssetId: number) => {
      setSelectedSubAssetId(subAssetId);
      const selectedSubAsset = formSubAssets.find(
        (subAsset) => subAsset.id === subAssetId
      );
      setFormData({
        ...formData,
        sub_asset: selectedSubAsset?.name || "",
        organization: "",
        sub_organization: "",
      });
      setSelectedOrgId(null);
      setSelectedSubOrgId(null);
      setFormSubOrganizations([]);
    };

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
      setSelectedOrgId(null);
      setSelectedSubOrgId(null);
      setSelectedAssetId(null);
      setSelectedSubAssetId(null);
      setFormSubAssets([]);
      setFormSubOrganizations([]);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset">Asset *</Label>
          <Select
            value={selectedAssetId?.toString() || ""}
            onValueChange={(value) => handleAssetChange(parseInt(value))}
            required
          >
            <SelectTrigger className="w-full rounded-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select asset" />
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
          <Label htmlFor="sub_asset">Sub Asset *</Label>
          <Select
            value={selectedSubAssetId?.toString() || ""}
            onValueChange={(value) => handleSubAssetChange(parseInt(value))}
            required
            disabled={!selectedAssetId || formSubAssets.length === 0}
          >
            <SelectTrigger className="w-full rounded-full bg-[#00d8cc]/30">
              <SelectValue
                placeholder={
                  selectedAssetId ? "Select sub-asset" : "Select asset first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {formSubAssets.map((subAsset) => (
                <SelectItem key={subAsset.id} value={subAsset.id.toString()}>
                  {subAsset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => handleOrgChange(parseInt(value))}
            required
            disabled={!selectedAssetId || !selectedSubAssetId}
          >
            <SelectTrigger className="w-full rounded-full bg-[#00d8cc]/30">
              <SelectValue
                placeholder={
                  !selectedAssetId || !selectedSubAssetId
                    ? "Select asset and sub-asset first"
                    : "Select organization"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {organizations
                .filter(
                  (org) =>
                    org.assetId === selectedAssetId &&
                    org.subAssetId === selectedSubAssetId
                )
                .map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub_organization">Sub Organization</Label>
          <Select
            value={selectedSubOrgId?.toString() || ""}
            onValueChange={(value) => handleSubOrgChange(parseInt(value))}
            disabled={!selectedOrgId || formSubOrganizations.length === 0}
          >
            <SelectTrigger className="w-full rounded-full bg-[#00d8cc]/30">
              <SelectValue
                placeholder={
                  !selectedOrgId
                    ? "Select organization first"
                    : formSubOrganizations.length === 0
                    ? "No sub-organizations available"
                    : "Select sub-organization"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {formSubOrganizations.map((subOrg) => (
                <SelectItem key={subOrg.id} value={subOrg.id.toString()}>
                  {subOrg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            className="rounded-full bg-[#00d8cc]/30"
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
    console.log("EditSubAdminForm rendered with assets:", assets);
    console.log("EditSubAdminForm rendered with organizations:", organizations);

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
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [selectedSubOrgId, setSelectedSubOrgId] = useState<number | null>(
      null
    );
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [selectedSubAssetId, setSelectedSubAssetId] = useState<number | null>(
      null
    );
    const [formSubAssets, setFormSubAssets] = useState<any[]>([]);
    const [formSubOrganizations, setFormSubOrganizations] = useState<any[]>([]);

    // Initialize selected values based on current user data
    useEffect(() => {
      if (selectedUser && organizations.length > 0 && assets.length > 0) {
        // Step 1: Find and set asset ID
        const asset = assets.find((a) => a.name === selectedUser.asset);
        if (asset) {
          setSelectedAssetId(asset.id);

          // Step 2: Find organization by name first (simplified approach)
          const org = organizations.find(
            (o) => o.name === selectedUser.organization
          );

          if (org) {
            setSelectedOrgId(org.id);
          }

          // Step 3: Fetch sub-assets for this asset
          if (token) {
            console.log("Fetching sub-assets for assetId:", asset.id);
            api
              .getSubAssetsByAssetId(asset.id, token)
              .then((response) => {
                console.log("Sub-assets response:", response);
                setFormSubAssets(response.data || []);

                // Step 4: Find and set sub-asset ID
                const subAsset = response.data?.find(
                  (sa: any) => sa.name === selectedUser.subAsset
                );

                if (subAsset) {
                  setSelectedSubAssetId(subAsset.id);
                }
              })
              .catch((error) => {
                console.error("Error fetching sub-assets:", error);
              });
          }

          // Step 5: Fetch sub-organizations if we have an organization
          if (org && token) {
            api
              .getSubOrganizationsByOrganizationId(org.id, token)
              .then((response) => {
                setFormSubOrganizations(response.data || []);

                // Step 6: Find and set sub-organization ID
                const subOrg = response.data?.find(
                  (so: any) => so.name === selectedUser.subOrganization
                );

                if (subOrg) {
                  setSelectedSubOrgId(subOrg.id);
                }
              })
              .catch((error) => {
                console.error("Error fetching sub-organizations:", error);
              });
          }
        }
      }
    }, [selectedUser, organizations, assets, token]);

    const handleOrgChange = async (orgId: number) => {
      setSelectedOrgId(orgId);
      const selectedOrg = organizations.find((org) => org.id === orgId);
      setFormData({
        ...formData,
        organization: selectedOrg?.name || "",
        sub_organization: "",
      });
      setSelectedSubOrgId(null);
      setFormSubOrganizations([]);

      // Fetch sub-organizations for the selected organization
      if (token) {
        try {
          const response = await api.getSubOrganizationsByOrganizationId(
            orgId,
            token
          );
          setFormSubOrganizations(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-organizations:", error);
        }
      }
    };

    const handleSubOrgChange = (subOrgId: number) => {
      setSelectedSubOrgId(subOrgId);
      const selectedSubOrg = formSubOrganizations.find(
        (subOrg) => subOrg.id === subOrgId
      );
      setFormData({
        ...formData,
        sub_organization: selectedSubOrg?.name || "",
      });
    };

    const handleAssetChange = async (assetId: number) => {
      setSelectedAssetId(assetId);
      const selectedAsset = assets.find((asset) => asset.id === assetId);
      setFormData({
        ...formData,
        asset: selectedAsset?.name || "",
        sub_asset: "",
        organization: "",
        sub_organization: "",
      });
      setSelectedSubAssetId(null);
      setSelectedOrgId(null);
      setSelectedSubOrgId(null);
      setFormSubAssets([]);
      setFormSubOrganizations([]);

      if (token) {
        try {
          console.log(
            "EditSubAdminForm: About to fetch sub-assets for assetId:",
            assetId
          );
          const response = await api.getSubAssetsByAssetId(assetId, token);
          console.log(
            "EditSubAdminForm: Received sub-assets response:",
            response
          );
          setFormSubAssets(response.data || []);
        } catch (error) {
          console.error("Error fetching sub-assets:", error);
        }
      }
    };

    const handleSubAssetChange = async (subAssetId: number) => {
      console.log(
        "EditSubAdminForm: handleSubAssetChange called with:",
        subAssetId
      );
      setSelectedSubAssetId(subAssetId);
      const selectedSubAsset = formSubAssets.find(
        (subAsset) => subAsset.id === subAssetId
      );
      console.log(
        "EditSubAdminForm: Found selected sub-asset:",
        selectedSubAsset
      );
      setFormData({
        ...formData,
        sub_asset: selectedSubAsset?.name || "",
        organization: "",
        sub_organization: "",
      });
      setSelectedOrgId(null);
      setSelectedSubOrgId(null);
      setFormSubOrganizations([]);
    };

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
          <Label htmlFor="edit_asset">Asset *</Label>
          <Select
            value={selectedAssetId?.toString() || ""}
            onValueChange={(value) => handleAssetChange(parseInt(value))}
            required
          >
            <SelectTrigger className="w-full rounded-full">
              <SelectValue placeholder="Select asset" />
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
          <Label htmlFor="edit_sub_asset">Sub Asset *</Label>
          <Select
            value={selectedSubAssetId?.toString() || ""}
            onValueChange={(value) => handleSubAssetChange(parseInt(value))}
            required
          >
            <SelectTrigger className="w-full rounded-full">
              <SelectValue
                placeholder={
                  selectedAssetId ? "Select sub-asset" : "Select asset first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {formSubAssets.map((subAsset) => (
                <SelectItem key={subAsset.id} value={subAsset.id.toString()}>
                  {subAsset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_organization">Organization *</Label>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => handleOrgChange(parseInt(value))}
            required
          >
            <SelectTrigger className="w-full rounded-full">
              <SelectValue
                placeholder={
                  !selectedAssetId || !selectedSubAssetId
                    ? "Select asset and sub-asset first"
                    : "Select organization"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {organizations
                .filter(
                  (org) =>
                    org.assetId === selectedAssetId &&
                    org.subAssetId === selectedSubAssetId
                )
                .map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_sub_organization">Sub Organization</Label>
          <Select
            value={selectedSubOrgId?.toString() || ""}
            onValueChange={(value) => handleSubOrgChange(parseInt(value))}
          >
            <SelectTrigger className="w-full rounded-full">
              <SelectValue
                placeholder={
                  !selectedOrgId
                    ? "Select organization first"
                    : formSubOrganizations.length === 0
                    ? "No sub-organizations available"
                    : "Select sub-organization"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {formSubOrganizations.map((subOrg) => (
                <SelectItem key={subOrg.id} value={subOrg.id.toString()}>
                  {subOrg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
