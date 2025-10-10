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
import { MoreVert, Email, Edit, Delete, Close } from "@mui/icons-material";
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

  async getAllSubAdminsWithFrontlinerCounts(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users/sub-admins`, {
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
      console.error(
        "Failed to fetch sub-admins with frontliner counts:",
        error
      );
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

  async getSubOrganizationById(subOrgId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-organizations/${subOrgId}`,
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
      console.error("Failed to fetch sub-organization:", error);
      throw error;
    }
  },

  async getAssetById(assetId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets/${assetId}`, {
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
      console.error("Failed to fetch asset:", error);
      throw error;
    }
  },

  async getSubAssetById(subAssetId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-assets/${subAssetId}`,
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
      console.error("Failed to fetch sub-asset:", error);
      throw error;
    }
  },

  async checkSubAdminExists(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-admins/check/${userId}`,
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
      console.error("Failed to check sub-admin existence:", error);
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
  totalFrontliners: number;
  dateAdded: string;
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
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Dropdown data states
  const [organizations, setOrganizations] = useState<any[]>([]);

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;

      try {
        const orgsResponse = await api.getAllOrganizations(token);
        setOrganizations(orgsResponse.data || []);
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
      // console.log("token", token);
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      } else {
        // console.log("token", token);
        setError("");
      }

      try {
        setIsLoading(true);
        const response = await api.getAllSubAdminsWithFrontlinerCounts(token);

        // Transform data to match our display format
        const transformedUsers =
          response.data?.map((user: any) => ({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            organization: user.organization || "N/A",
            subOrganization: Array.isArray(user.subOrganization)
              ? user.subOrganization.join(", ")
              : user.subOrganization || "N/A",
            asset: user.asset || "N/A",
            subAsset: user.subAsset || "N/A",
            totalFrontliners: user.totalFrontliners || 0,
            dateAdded: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEmailSubAdmin(user)}
                  title="Send Email"
                >
                  <Email sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditSubAdmin(user)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteSubAdmin(user)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

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
          (typeof subAdmin.subOrganization === "string" &&
            subAdmin.subOrganization
              .toLowerCase()
              .includes(query.toLowerCase())) ||
          (typeof subAdmin.asset === "string" &&
            subAdmin.asset.toLowerCase().includes(query.toLowerCase())) ||
          (typeof subAdmin.subAsset === "string" &&
            subAdmin.subAsset.toLowerCase().includes(query.toLowerCase())) ||
          subAdmin.totalFrontliners.toString().includes(query)
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
        password: "123456", // Default password
        organization: formData.organization,
        subOrganization: formData.sub_organization,
        asset: formData.asset,
        subAsset: formData.sub_asset,
        userType: "sub_admin", // Hard coded as sub-admin
      };

      const response = await api.createUser(userData, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setError("");
        showSuccessMessage("Sub-Admin created successfully!");
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

  const handleUpdateSubAdmin = async (
    formData: any,
    isSubAdminInTable?: boolean | null
  ) => {
    if (!token || !selectedUser) {
      setError("Authentication required or no user selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const userData: any = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        password: "123456", // Default password
        organization: formData.organization,
        subOrganization: formData.sub_organization,
        asset: formData.asset,
        subAsset: formData.sub_asset,
        userType: "sub_admin", // Hard coded as sub-admin
      };

      // Only include totalFrontliners if the user exists in the subAdmins table
      if (isSubAdminInTable !== false) {
        userData.totalFrontliners = parseInt(formData.total_frontliners) || 0;
      }

      const response = await api.updateUser(selectedUser.id, userData, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setError("");
        showSuccessMessage("Sub-Admin updated successfully!");
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

  const handleDeleteSubAdmin = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSubAdmin = async () => {
    if (!token || !userToDelete) {
      setError("Authentication required or no user selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteUser(userToDelete.id, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setError("");
        showSuccessMessage("Sub-Admin deleted successfully!");
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
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
    const updatedResponse = await api.getAllSubAdminsWithFrontlinerCounts(
      token
    );

    const transformedUsers =
      updatedResponse.data?.map((user: any) => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        organization: user.organization || "N/A",
        subOrganization: Array.isArray(user.subOrganization)
          ? user.subOrganization.join(", ")
          : user.subOrganization || "N/A",
        asset: user.asset || "N/A",
        subAsset: user.subAsset || "N/A",
        totalFrontliners: user.totalFrontliners || 0,
        dateAdded: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEmailSubAdmin(user)}
              title="Send Email"
            >
              <Email sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditSubAdmin(user)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteSubAdmin(user)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setSubAdmins(transformedUsers);
    setFilteredSubAdmins(transformedUsers);
  };

  const CreateSubAdminForm = () => {
    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      organization: "",
      sub_organization: [] as string[],
      asset: "",
      sub_asset: "",
    });
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [selectedSubOrgIds, setSelectedSubOrgIds] = useState<number[]>([]);
    const [formSubOrganizations, setFormSubOrganizations] = useState<any[]>([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState("");
    const [validationErrors, setValidationErrors] = useState<{
      first_name?: string;
      last_name?: string;
      email?: string;
      organization?: string;
    }>({});
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Validation function
    const validateForm = () => {
      const errors: {
        first_name?: string;
        last_name?: string;
        email?: string;
        organization?: string;
      } = {};

      if (!formData.first_name.trim()) {
        errors.first_name = "First name is required";
      }

      if (!formData.last_name.trim()) {
        errors.last_name = "Last name is required";
      }

      if (!formData.email.trim()) {
        errors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!formData.organization) {
        errors.organization = "Please select an organization";
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );

    const handleOrgChange = async (orgId: number) => {
      // Validate orgId to prevent NaN API calls
      if (isNaN(orgId) || orgId <= 0) {
        console.warn("Invalid organization ID:", orgId);
        return;
      }

      setSelectedOrgId(orgId);
      const selectedOrg = organizations.find((org) => org.id === orgId);
      setFormData({
        ...formData,
        organization: selectedOrg?.name || "",
        sub_organization: [],
        asset: "",
        sub_asset: "",
      });
      setSelectedSubOrgIds([]);
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

    const handleSubOrgChange = async (subOrgIds: number[]) => {
      setSelectedSubOrgIds(subOrgIds);
      const selectedSubOrgs = formSubOrganizations.filter((subOrg) =>
        subOrgIds.includes(subOrg.id)
      );

      // Fetch assets and sub-assets for selected sub-organizations
      let assets: string[] = [];
      let subAssets: string[] = [];

      if (subOrgIds.length > 0 && token) {
        try {
          // Fetch each sub-organization individually to get their asset and sub-asset IDs
          const subOrgPromises = subOrgIds.map((id) =>
            api.getSubOrganizationById(id, token)
          );
          const subOrgResponses = await Promise.all(subOrgPromises);

          // Collect unique asset and sub-asset IDs
          const assetIds: number[] = [];
          const subAssetIds: number[] = [];

          subOrgResponses.forEach((response) => {
            if (response.data) {
              const subOrg = response.data;
              if (subOrg.assetId && !assetIds.includes(subOrg.assetId)) {
                assetIds.push(subOrg.assetId);
              }
              if (
                subOrg.subAssetId &&
                !subAssetIds.includes(subOrg.subAssetId)
              ) {
                subAssetIds.push(subOrg.subAssetId);
              }
            }
          });

          // Fetch asset and sub-asset names using their IDs
          const assetPromises = assetIds.map((id) =>
            api.getAssetById(id, token)
          );
          const subAssetPromises = subAssetIds.map((id) =>
            api.getSubAssetById(id, token)
          );

          const [assetResponses, subAssetResponses] = await Promise.all([
            Promise.all(assetPromises),
            Promise.all(subAssetPromises),
          ]);

          // Extract names from responses
          assetResponses.forEach((response) => {
            if (response.data && response.data.name) {
              assets.push(response.data.name);
            }
          });

          subAssetResponses.forEach((response) => {
            if (response.data && response.data.name) {
              subAssets.push(response.data.name);
            }
          });
        } catch (error) {
          console.error("Error fetching sub-organization data:", error);
        }
      }

      setFormData({
        ...formData,
        sub_organization: selectedSubOrgs.map((subOrg) => subOrg.name),
        asset: assets.join(", "),
        sub_asset: subAssets.join(", "),
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      await handleCreateSubAdmin(formData);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        organization: "",
        sub_organization: [],
        asset: "",
        sub_asset: "",
      });
      setSelectedOrgId(null);
      setSelectedSubOrgIds([]);
      setFormSubOrganizations([]);
      setValidationErrors({});
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
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                // Clear validation error when user starts typing
                if (validationErrors.first_name) {
                  setValidationErrors({
                    ...validationErrors,
                    first_name: undefined,
                  });
                }
              }}
              className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
                validationErrors.first_name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
              placeholder="Type Sub-Admin's First Name"
              required
            />
            {validationErrors.first_name && (
              <p className="text-sm text-red-500">
                {validationErrors.first_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                // Clear validation error when user starts typing
                if (validationErrors.last_name) {
                  setValidationErrors({
                    ...validationErrors,
                    last_name: undefined,
                  });
                }
              }}
              className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
                validationErrors.last_name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
              placeholder="Type Sub-Admin's Last Name"
              required
            />
            {validationErrors.last_name && (
              <p className="text-sm text-red-500">
                {validationErrors.last_name}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: undefined });
              }
            }}
            className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
              validationErrors.email
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E5E5]"
            }`}
            placeholder="Type Sub-Admin's Email Address"
            required
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization *</Label>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => {
              const orgId = parseInt(value);
              if (!isNaN(orgId)) {
                handleOrgChange(orgId);
              }
              // Clear validation error when user selects an option
              if (validationErrors.organization) {
                setValidationErrors({
                  ...validationErrors,
                  organization: undefined,
                });
              }
            }}
            required
          >
            <SelectTrigger
              className={`w-full rounded-full bg-white text-[#2C2C2C] ${
                validationErrors.organization
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
            >
              <SelectValue placeholder="Select organization" />
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
                  filteredOrganizations.map((org) => (
                    <SelectItem
                      key={org.id}
                      value={org.id.toString()}
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
                      {org.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          {validationErrors.organization && (
            <p className="text-sm text-red-500">
              {validationErrors.organization}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sub_organization">Sub Organization</Label>
          <div className="max-h-32 overflow-y-auto border border-[#E5E5E5] rounded-lg p-2 bg-white">
            {!selectedOrgId ? (
              <p className="text-[#666666] text-sm">
                Select organization first
              </p>
            ) : formSubOrganizations.length === 0 ? (
              <p className="text-[#666666] text-sm">
                No sub-organizations available
              </p>
            ) : (
              <div className="space-y-2">
                {formSubOrganizations.map((subOrg) => (
                  <div key={subOrg.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`sub-org-${subOrg.id}`}
                      checked={selectedSubOrgIds.includes(subOrg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSubOrgChange([...selectedSubOrgIds, subOrg.id]);
                        } else {
                          handleSubOrgChange(
                            selectedSubOrgIds.filter((id) => id !== subOrg.id)
                          );
                        }
                      }}
                      className="rounded border-[#E5E5E5]"
                    />
                    <label
                      htmlFor={`sub-org-${subOrg.id}`}
                      className="text-sm text-[#2C2C2C]"
                    >
                      {subOrg.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 hidden">
          <Label htmlFor="asset">Assets</Label>
          <Input
            id="asset"
            value={formData.asset}
            readOnly
            className="rounded-full bg-gray-50 border-[#E5E5E5] text-[#2C2C2C] cursor-not-allowed"
            placeholder="Assets will be populated based on selected sub-organizations"
          />
        </div>

        <div className="space-y-2 hidden">
          <Label htmlFor="sub_asset">Sub Assets</Label>
          <Input
            id="sub_asset"
            value={formData.sub_asset}
            readOnly
            className="rounded-full bg-gray-50 border-[#E5E5E5] text-[#2C2C2C] cursor-not-allowed"
            placeholder="Sub-assets will be populated based on selected sub-organizations"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.first_name.trim() ||
              !formData.last_name.trim() ||
              !formData.email.trim() ||
              !formData.organization
            }
            className="rounded-full"
          >
            {isLoading ? "Creating..." : "Create Sub-Admin"}
          </Button>
        </div>
      </form>
    );
  };

  const EditSubAdminForm = () => {
    // console.log("EditSubAdminForm rendered with organizations:", organizations);
    // console.log("selectedUser in EditSubAdminForm:", selectedUser);

    const [formData, setFormData] = useState({
      first_name: "",
      last_name: "",
      email: "",
      organization: "",
      sub_organization: [] as string[],
      asset: "",
      sub_asset: "",
      total_frontliners: "",
    });

    // console.log("Current formData:", formData);
    const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
    const [selectedSubOrgIds, setSelectedSubOrgIds] = useState<number[]>([]);
    const [formSubOrganizations, setFormSubOrganizations] = useState<any[]>([]);
    const [orgSearchQuery, setOrgSearchQuery] = useState("");
    const [validationErrors, setValidationErrors] = useState<{
      first_name?: string;
      last_name?: string;
      email?: string;
      organization?: string;
      total_frontliners?: string;
    }>({});
    const [isSubAdminInTable, setIsSubAdminInTable] = useState<boolean | null>(
      null
    );
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Validation function
    const validateForm = () => {
      const errors: {
        first_name?: string;
        last_name?: string;
        email?: string;
        organization?: string;
        total_frontliners?: string;
      } = {};

      if (!formData.first_name.trim()) {
        errors.first_name = "First name is required";
      }

      if (!formData.last_name.trim()) {
        errors.last_name = "Last name is required";
      }

      if (!formData.email.trim()) {
        errors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!formData.organization) {
        errors.organization = "Please select an organization";
      }

      // Only validate total_frontliners if the user exists in the subAdmins table
      if (isSubAdminInTable !== false) {
        if (!formData.total_frontliners.trim()) {
          errors.total_frontliners = "Total frontliners is required";
        } else if (
          isNaN(Number(formData.total_frontliners)) ||
          Number(formData.total_frontliners) < 0
        ) {
          errors.total_frontliners =
            "Total frontliners must be a valid non-negative number";
        }
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    // Filter organizations based on search query
    const filteredOrganizations = organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );

    // Initialize selected values based on current user data
    useEffect(() => {
      if (selectedUser) {
        // Get first and last name directly from selectedUser properties
        const firstName = selectedUser.firstName || "";
        const lastName = selectedUser.LastName || selectedUser.lastName || ""; // Try both cases

        // Update form data when selectedUser changes
        const newFormData = {
          first_name: firstName,
          last_name: lastName,
          email: selectedUser?.email || "",
          organization: selectedUser?.organization || "",
          sub_organization: Array.isArray(selectedUser?.subOrganization)
            ? selectedUser.subOrganization
            : selectedUser?.subOrganization &&
              selectedUser.subOrganization !== "N/A"
            ? selectedUser.subOrganization
                .split(", ")
                .filter((name: string) => name.trim() !== "")
            : [],
          asset: selectedUser?.asset || "",
          sub_asset: selectedUser?.subAsset || "",
          total_frontliners: selectedUser?.totalFrontliners?.toString() || "",
        };

        // console.log("Setting form data to:", newFormData);
        setFormData(newFormData);

        // Find organization by name
        const org = organizations.find(
          (o) => o.name === selectedUser.organization
        );

        if (org) {
          setSelectedOrgId(org.id);

          // Fetch sub-organizations if we have an organization
          if (token) {
            api
              .getSubOrganizationsByOrganizationId(org.id, token)
              .then((response) => {
                setFormSubOrganizations(response.data || []);

                // Find and set sub-organization IDs
                const subOrgNames = Array.isArray(selectedUser.subOrganization)
                  ? selectedUser.subOrganization
                  : selectedUser.subOrganization &&
                    selectedUser.subOrganization !== "N/A"
                  ? selectedUser.subOrganization
                      .split(", ")
                      .filter((name: string) => name.trim() !== "")
                  : [];

                const subOrgIds =
                  response.data
                    ?.filter((so: any) => subOrgNames.includes(so.name))
                    ?.map((so: any) => so.id) || [];

                setSelectedSubOrgIds(subOrgIds);
              })
              .catch((error) => {
                console.error("Error fetching sub-organizations:", error);
              });
          }
        }

        // Restore focus to search input after form initialization
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    }, [selectedUser, organizations, token]);

    // Check if user exists in subAdmins table
    useEffect(() => {
      if (selectedUser && token) {
        api
          .checkSubAdminExists(selectedUser.id, token)
          .then((response) => {
            setIsSubAdminInTable(response.data?.exists || false);
          })
          .catch((error) => {
            console.error("Error checking sub-admin existence:", error);
            setIsSubAdminInTable(false);
          });
      } else {
        setIsSubAdminInTable(null);
      }
    }, [selectedUser, token]);

    // Focus search input when edit modal opens
    useEffect(() => {
      if (isEditModalOpen && searchInputRef.current) {
        const timer = setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isEditModalOpen]);

    const handleOrgChange = async (orgId: number) => {
      // Validate orgId to prevent NaN API calls
      if (isNaN(orgId) || orgId <= 0) {
        console.warn("Invalid organization ID:", orgId);
        return;
      }
      setSelectedOrgId(orgId);
      const selectedOrg = organizations.find((org) => org.id === orgId);
      setFormData({
        ...formData,
        organization: selectedOrg?.name || "",
        sub_organization: [],
        asset: "",
        sub_asset: "",
      });
      setSelectedSubOrgIds([]);
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

    const handleSubOrgChange = async (subOrgIds: number[]) => {
      setSelectedSubOrgIds(subOrgIds);
      const selectedSubOrgs = formSubOrganizations.filter((subOrg) =>
        subOrgIds.includes(subOrg.id)
      );

      // Fetch assets and sub-assets for selected sub-organizations
      let assets: string[] = [];
      let subAssets: string[] = [];

      if (subOrgIds.length > 0 && token) {
        try {
          // Fetch each sub-organization individually to get their asset and sub-asset IDs
          const subOrgPromises = subOrgIds.map((id) =>
            api.getSubOrganizationById(id, token)
          );
          const subOrgResponses = await Promise.all(subOrgPromises);

          // Collect unique asset and sub-asset IDs
          const assetIds: number[] = [];
          const subAssetIds: number[] = [];

          subOrgResponses.forEach((response) => {
            if (response.data) {
              const subOrg = response.data;
              if (subOrg.assetId && !assetIds.includes(subOrg.assetId)) {
                assetIds.push(subOrg.assetId);
              }
              if (
                subOrg.subAssetId &&
                !subAssetIds.includes(subOrg.subAssetId)
              ) {
                subAssetIds.push(subOrg.subAssetId);
              }
            }
          });

          // Fetch asset and sub-asset names using their IDs
          const assetPromises = assetIds.map((id) =>
            api.getAssetById(id, token)
          );
          const subAssetPromises = subAssetIds.map((id) =>
            api.getSubAssetById(id, token)
          );

          const [assetResponses, subAssetResponses] = await Promise.all([
            Promise.all(assetPromises),
            Promise.all(subAssetPromises),
          ]);

          // Extract names from responses
          assetResponses.forEach((response) => {
            if (response.data && response.data.name) {
              assets.push(response.data.name);
            }
          });

          subAssetResponses.forEach((response) => {
            if (response.data && response.data.name) {
              subAssets.push(response.data.name);
            }
          });
        } catch (error) {
          console.error("Error fetching sub-organization data:", error);
        }
      }

      setFormData({
        ...formData,
        sub_organization: selectedSubOrgs.map((subOrg) => subOrg.name),
        asset: assets.join(", "),
        sub_asset: subAssets.join(", "),
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      await handleUpdateSubAdmin(formData, isSubAdminInTable);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_first_name">First Name *</Label>
            <Input
              id="edit_first_name"
              value={formData.first_name}
              onChange={(e) => {
                setFormData({ ...formData, first_name: e.target.value });
                // Clear validation error when user starts typing
                if (validationErrors.first_name) {
                  setValidationErrors({
                    ...validationErrors,
                    first_name: undefined,
                  });
                }
              }}
              className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
                validationErrors.first_name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
              placeholder="Type Sub-Admin's First Name"
              required
            />
            {validationErrors.first_name && (
              <p className="text-sm text-red-500">
                {validationErrors.first_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_last_name">Last Name *</Label>
            <Input
              id="edit_last_name"
              value={formData.last_name}
              onChange={(e) => {
                setFormData({ ...formData, last_name: e.target.value });
                // Clear validation error when user starts typing
                if (validationErrors.last_name) {
                  setValidationErrors({
                    ...validationErrors,
                    last_name: undefined,
                  });
                }
              }}
              className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
                validationErrors.last_name
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
              placeholder="Type Sub-Admin's Last Name"
              required
            />
            {validationErrors.last_name && (
              <p className="text-sm text-red-500">
                {validationErrors.last_name}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_email">Email Address *</Label>
          <Input
            id="edit_email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: undefined });
              }
            }}
            className={`rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] ${
              validationErrors.email
                ? "border-red-500 focus:border-red-500"
                : "border-[#E5E5E5]"
            }`}
            placeholder="Type Sub-Admin's Email Address"
            required
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_organization">Organization *</Label>
          <Select
            value={selectedOrgId?.toString() || ""}
            onValueChange={(value) => {
              const orgId = parseInt(value);
              if (!isNaN(orgId)) {
                handleOrgChange(orgId);
              }
              // Clear validation error when user selects an option
              if (validationErrors.organization) {
                setValidationErrors({
                  ...validationErrors,
                  organization: undefined,
                });
              }
            }}
            required
          >
            <SelectTrigger
              className={`w-full rounded-full bg-white text-[#2C2C2C] ${
                validationErrors.organization
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#E5E5E5]"
              }`}
            >
              <SelectValue placeholder="Select organization" />
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
                  filteredOrganizations.map((org) => (
                    <SelectItem
                      key={org.id}
                      value={org.id.toString()}
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
                      {org.name}
                    </SelectItem>
                  ))
                )}
              </div>
            </SelectContent>
          </Select>
          {validationErrors.organization && (
            <p className="text-sm text-red-500">
              {validationErrors.organization}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_sub_organization">Sub Organization</Label>
          <div className="max-h-32 overflow-y-auto border border-[#E5E5E5] rounded-lg p-2 bg-white">
            {!selectedOrgId ? (
              <p className="text-[#666666] text-sm">
                Select organization first
              </p>
            ) : formSubOrganizations.length === 0 ? (
              <p className="text-[#666666] text-sm">
                No sub-organizations available
              </p>
            ) : (
              <div className="space-y-2">
                {formSubOrganizations.map((subOrg) => (
                  <div key={subOrg.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-sub-org-${subOrg.id}`}
                      checked={selectedSubOrgIds.includes(subOrg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSubOrgChange([...selectedSubOrgIds, subOrg.id]);
                        } else {
                          handleSubOrgChange(
                            selectedSubOrgIds.filter((id) => id !== subOrg.id)
                          );
                        }
                      }}
                      className="rounded border-[#E5E5E5]"
                    />
                    <label
                      htmlFor={`edit-sub-org-${subOrg.id}`}
                      className="text-sm text-[#2C2C2C]"
                    >
                      {subOrg.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 hidden">
          <Label htmlFor="edit_asset">Assets</Label>
          <Input
            id="edit_asset"
            value={formData.asset}
            readOnly
            className="rounded-full bg-gray-50 border-[#E5E5E5] text-[#2C2C2C] cursor-not-allowed"
            placeholder="Assets will be populated based on selected sub-organizations"
          />
        </div>

        <div className="space-y-2 hidden">
          <Label htmlFor="edit_sub_asset">Sub Assets</Label>
          <Input
            id="edit_sub_asset"
            value={formData.sub_asset}
            readOnly
            className="rounded-full bg-gray-50 border-[#E5E5E5] text-[#2C2C2C] cursor-not-allowed"
            placeholder="Sub-assets will be populated based on selected sub-organizations"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_total_frontliners">
            Total Frontliners{" "}
            {isSubAdminInTable === false ? "(Not Available)" : "*"}
          </Label>
          <Input
            id="edit_total_frontliners"
            type="number"
            min="0"
            value={formData.total_frontliners}
            onChange={(e) => {
              setFormData({ ...formData, total_frontliners: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.total_frontliners) {
                setValidationErrors({
                  ...validationErrors,
                  total_frontliners: undefined,
                });
              }
            }}
            disabled={isSubAdminInTable === false}
            className={`rounded-full text-[#2C2C2C] placeholder:text-[#666666] ${
              isSubAdminInTable === false
                ? "bg-gray-50 border-[#E5E5E5] cursor-not-allowed"
                : validationErrors.total_frontliners
                ? "bg-white border-red-500 focus:border-red-500"
                : "bg-white border-[#E5E5E5]"
            }`}
            placeholder={
              isSubAdminInTable === false
                ? "User not found in sub-admins table"
                : "Enter total number of frontliners"
            }
            required={isSubAdminInTable !== false}
          />
          {validationErrors.total_frontliners && (
            <p className="text-sm text-red-500">
              {validationErrors.total_frontliners}
            </p>
          )}
          {isSubAdminInTable === false && (
            <p className="text-sm text-gray-500">
              This user is not registered in the sub-admins table, so total
              frontliners cannot be updated.
            </p>
          )}
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
    "Email Address",
    "Organization",
    "Sub-Organization",
    "Asset",
    "Asset Sub-Categories",
    "Total Frontliners",
    "Date Added",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub-Admins"
      description="Manage your Sub-Administrators"
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
        searchPlaceholder="Search sub-admins..."
        createButtonText="Create Sub-Admin"
        createForm={<CreateSubAdminForm />}
        tableData={filteredSubAdmins}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">Edit Sub-Admin</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <EditSubAdminForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[#666666]">
              Send an email to {selectedUser?.email}
            </p>
            <div className="space-y-2">
              <Label className="text-[#2C2C2C]">Join URL:</Label>
              <div className="p-3 bg-sandstone rounded-lg border border-[#E5E5E5]">
                <code className="text-dawn break-all">
                  {import.meta.env.VITE_FRONTEND_URL || window.location.origin}
                  /join?id={selectedUser?.id}
                </code>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={async () => {
                  if (selectedUser) {
                    try {
                      const baseUrl = import.meta.env.VITE_API_URL;
                      const response = await fetch(
                        `${baseUrl}/api/users/sub-admins/reminder`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            userId: selectedUser.id,
                          }),
                        }
                      );

                      if (response.ok) {
                        console.log("Reminder email sent successfully");
                        showSuccessMessage("Email sent successfully!");
                      } else {
                        console.error("Failed to send reminder email");
                        setError("Failed to send email. Please try again.");
                      }
                    } catch (error) {
                      console.error("Error sending reminder email:", error);
                      setError("Failed to send email. Please try again.");
                    }
                  }

                  setIsEmailModalOpen(false);
                  setSelectedUser(null);
                }}
                className="rounded-full"
              >
                Send Email
              </Button>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Delete Sub-Admin
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[#2C2C2C] mb-6">
              Are you sure you want to delete the sub-admin "
              {userToDelete?.fullName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteSubAdmin}
                disabled={isLoading}
                className="rounded-full"
              >
                {isLoading ? "Deleting..." : "Delete Sub-Admin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default SubAdminPage;
