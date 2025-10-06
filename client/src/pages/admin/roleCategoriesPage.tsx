import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { Delete, Edit, Close } from "@mui/icons-material";

// API object for role category operations
const api = {
  async getAllRoleCategories(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/role-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
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

  async createRoleCategory(roleCategoryData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/role-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleCategoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create role category:", error);
      throw error;
    }
  },

  async updateRoleCategory(
    roleCategoryId: number,
    roleCategoryData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/role-categories/${roleCategoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roleCategoryData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update role category:", error);
      throw error;
    }
  },

  async deleteRoleCategory(roleCategoryId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/role-categories/${roleCategoryId}`,
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
      console.error("Failed to delete role category:", error);
      throw error;
    }
  },
};

// Type for role category data
interface RoleCategoryData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  name?: string;
}

const RoleCategoriesPage = () => {
  const { token } = useAuth();
  const [roleCategories, setRoleCategories] = useState<RoleCategoryData[]>([]);
  const [filteredRoleCategories, setFilteredRoleCategories] = useState<
    RoleCategoryData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<RoleCategoryData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Validation function
  const validateForm = (formData: any): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Category name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch role categories from database on component mount
  useEffect(() => {
    const fetchRoleCategories = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllRoleCategories(token);

        // Transform data to match our display format
        const transformedCategories =
          response.data?.map((category: any) => ({
            id: category.id,
            name: category.name,
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={() => handleEditRoleCategory(category)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteRoleCategory(category)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setRoleCategories(transformedCategories);
        setFilteredRoleCategories(transformedCategories);
        setError("");
      } catch (error) {
        console.error("Error fetching role categories:", error);
        setError("Failed to load role categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleCategories();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRoleCategories(roleCategories);
    } else {
      const filtered = roleCategories.filter((category) =>
        category.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRoleCategories(filtered);
    }
  };

  const handleCreateRoleCategory = async (formData: any) => {
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
      const roleCategoryData = {
        name: formData.name,
      };

      const response = await api.createRoleCategory(roleCategoryData, token);

      if (response.success) {
        // Refresh the role category list
        await refreshRoleCategoryList();
        setError("");
        setValidationErrors({});
        setSuccessMessage("Role category created successfully!");
      } else {
        setError(response.message || "Failed to create role category");
      }
    } catch (error) {
      console.error("Error creating role category:", error);
      setError("Failed to create role category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoleCategory = (category: any) => {
    setEditingCategory(category);
  };

  const handleUpdateRoleCategory = async (formData: any) => {
    if (!token || !editingCategory) {
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
      const roleCategoryData = {
        name: formData.name,
      };

      const response = await api.updateRoleCategory(
        editingCategory.id,
        roleCategoryData,
        token
      );

      if (response.success) {
        // Refresh the role category list
        await refreshRoleCategoryList();
        setError("");
        setValidationErrors({});
        setSuccessMessage("Role category updated successfully!");
        setEditingCategory(null);
      } else {
        setError(response.message || "Failed to update role category");
      }
    } catch (error) {
      console.error("Error updating role category:", error);
      setError("Failed to update role category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoleCategory = (category: any) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRoleCategory = async () => {
    if (!token || !categoryToDelete) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteRoleCategory(categoryToDelete.id, token);

      if (response.success) {
        // Refresh the role category list
        await refreshRoleCategoryList();
        setError("");
        setSuccessMessage("Role category deleted successfully!");
      } else {
        setError(response.message || "Failed to delete role category");
      }
    } catch (error) {
      console.error("Error deleting role category:", error);
      setError("Failed to delete role category. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const refreshRoleCategoryList = async () => {
    if (!token) return;
    const response = await api.getAllRoleCategories(token);

    const transformedCategories =
      response.data?.map((category: any) => ({
        id: category.id,
        name: category.name,
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-blue-400 hover:bg-blue-400/10"
              onClick={() => handleEditRoleCategory(category)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteRoleCategory(category)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setRoleCategories(transformedCategories);
    setFilteredRoleCategories(transformedCategories);
  };

  const CreateRoleCategoryForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateRoleCategory(formData);
      setFormData({
        name: "",
      });
    };

    const handleInputChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <Close sx={{ fontSize: 20 }} />
        </Button>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Create Role Category</h3>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                validationErrors.name
                  ? "border-red-500 focus:border-red-500 hover:border-red-500"
                  : "border-sandstone focus:border-dawn hover:border-dawn"
              }`}
              placeholder="Type your Role Category Name"
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="rounded-full"
            >
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditRoleCategoryForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: editingCategory?.name || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateRoleCategory(formData);
      setFormData({
        name: "",
      });
    };

    const handleInputChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <Close sx={{ fontSize: 20 }} />
        </Button>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Edit Role Category</h3>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Category Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                validationErrors.name
                  ? "border-red-500 focus:border-red-500 hover:border-red-500"
                  : "border-sandstone focus:border-dawn hover:border-dawn"
              }`}
              placeholder="Type your Role Category Name"
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="rounded-full"
            >
              {isLoading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = ["ID", "Role Category", "Actions"];

  return (
    <AdminPageLayout
      title="Role Categories"
      description="Manage your role Categories"
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
        searchPlaceholder="Search role categories..."
        createButtonText="Create Category"
        createForm={<CreateRoleCategoryForm onClose={() => {}} />}
        tableData={filteredRoleCategories}
        columns={columns}
        onSearch={handleSearch}
        onCloseCreateForm={() => {}}
      />
      {editingCategory && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-[#E5E5E5]">
            <EditRoleCategoryForm onClose={() => setEditingCategory(null)} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Delete Role Category
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-[#2C2C2C] mb-6">
              Are you sure you want to delete the role category "
              {categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="rounded-full hover:bg-accent/30 hover:text-black"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteRoleCategory}
                disabled={isLoading}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                {isLoading ? "Deleting..." : "Delete Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default RoleCategoriesPage;
