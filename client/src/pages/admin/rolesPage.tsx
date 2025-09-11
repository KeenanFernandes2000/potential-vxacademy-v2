import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { Delete } from "@mui/icons-material";

// API object for role operations
const api = {
  async getAllRoles(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
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
      console.error("Failed to fetch roles:", error);
      throw error;
    }
  },

  async getAllRoleCategories(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/role-categories`, {
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
      console.error("Failed to fetch role categories:", error);
      throw error;
    }
  },

  async createRole(roleData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create role:", error);
      throw error;
    }
  },

  async deleteRole(roleId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles/${roleId}`, {
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
      console.error("Failed to delete role:", error);
      throw error;
    }
  },
};

// Type for role data
interface RoleData extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  actions: React.ReactNode;
}

const RolesPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleData[]>([]);
  const [roleCategories, setRoleCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch roles and role categories from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [rolesResponse, categoriesResponse] = await Promise.all([
          api.getAllRoles(token),
          api.getAllRoleCategories(token),
        ]);

        setRoleCategories(categoriesResponse.data || []);

        // Create a map for quick category lookup
        const categoryMap = new Map();
        categoriesResponse.data?.forEach((cat: any) => {
          categoryMap.set(cat.id, cat.name);
        });

        // Transform data to match our display format
        const transformedRoles =
          rolesResponse.data?.map((role: any) => ({
            id: role.id,
            name: role.name,
            categoryName: categoryMap.get(role.categoryId) || "Unknown",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteRole(role.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setRoles(transformedRoles);
        setFilteredRoles(transformedRoles);
        setError("");
      } catch (error) {
        console.error("Error fetching roles:", error);
        setError("Failed to load roles. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(query.toLowerCase()) ||
          role.categoryName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  };

  const handleCreateRole = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const roleData = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
      };

      const response = await api.createRole(roleData, token);

      if (response.success) {
        // Refresh the role list
        await refreshRoleList();
        setError("");
      } else {
        setError(response.message || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      setError("Failed to create role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteRole(roleId, token);

      if (response.success) {
        // Refresh the role list
        await refreshRoleList();
        setError("");
      } else {
        setError(response.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setError("Failed to delete role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRoleList = async () => {
    if (!token) return;
    const [rolesResponse, categoriesResponse] = await Promise.all([
      api.getAllRoles(token),
      api.getAllRoleCategories(token),
    ]);

    // Create a map for quick category lookup
    const categoryMap = new Map();
    categoriesResponse.data?.forEach((cat: any) => {
      categoryMap.set(cat.id, cat.name);
    });

    const transformedRoles =
      rolesResponse.data?.map((role: any) => ({
        id: role.id,
        name: role.name,
        categoryId: role.categoryId,
        categoryName: categoryMap.get(role.categoryId) || "Unknown",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteRole(role.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setRoles(transformedRoles);
    setFilteredRoles(transformedRoles);
  };

  const CreateRoleForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      categoryId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateRole(formData);
      setFormData({
        name: "",
        categoryId: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Role Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {roleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Role Name", "Category", "Actions"];

  return (
    <AdminPageLayout
      title="Roles"
      description="Manage user roles and permissions across the platform"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search roles..."
        createButtonText="Create Role"
        createForm={<CreateRoleForm />}
        tableData={filteredRoles}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default RolesPage;
