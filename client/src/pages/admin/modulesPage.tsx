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

// API object for module operations
const api = {
  async getAllTrainingAreas(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/training/training-areas`, {
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
      console.error("Failed to fetch training areas:", error);
      throw error;
    }
  },

  async getAllModules(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/training/modules`, {
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
      console.error("Failed to fetch modules:", error);
      throw error;
    }
  },

  async createModule(moduleData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/training/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create module:", error);
      throw error;
    }
  },

  async updateModule(moduleId: number, moduleData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/training/modules/${moduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(moduleData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update module:", error);
      throw error;
    }
  },

  async deleteModule(moduleId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/training/modules/${moduleId}`,
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
      console.error("Failed to delete module:", error);
      throw error;
    }
  },
};

// Type for module data
interface ModuleData extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  description: string;
  training_area_id: number;
  image_url: string;
  createdDate: string;
  actions: React.ReactNode;
}

const ModulesPage = () => {
  const { token } = useAuth();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [filteredModules, setFilteredModules] = useState<ModuleData[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Fetch modules from database on component mount
  useEffect(() => {
    const fetchModules = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [modulesResponse, trainingAreasResponse] = await Promise.all([
          api.getAllModules(token),
          api.getAllTrainingAreas(token),
        ]);

        setTrainingAreas(trainingAreasResponse.data || []);

        // Transform data to match our display format
        const transformedModules =
          modulesResponse.data?.map((module: any) => ({
            id: module.id,
            name: module.name,
            description: module.description || "N/A",
            training_area_id: module.training_area_id || 0,
            image_url: module.image_url || "N/A",
            createdDate: module.created_at
              ? new Date(module.created_at).toISOString().split("T")[0]
              : "N/A",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditModule(module)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteModule(module.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setModules(transformedModules);
        setFilteredModules(transformedModules);
        setError("");
      } catch (error) {
        console.error("Error fetching modules:", error);
        setError("Failed to load modules. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(
        (module) =>
          module.name.toLowerCase().includes(query.toLowerCase()) ||
          module.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  };

  const handleCreateModule = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const moduleData = {
        name: formData.name,
        description: formData.description,
        trainingAreaId: parseInt(formData.training_area_id),
        imageUrl: formData.image_url,
      };

      const response = await api.createModule(moduleData, token);

      if (response.success) {
        // Refresh the module list
        await refreshModuleList();
        setError("");
      } else {
        setError(response.message || "Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      setError("Failed to create module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateModule = async (formData: any) => {
    if (!token || !selectedModule) {
      setError("Authentication required or no module selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const moduleData = {
        name: formData.name,
        description: formData.description,
        trainingAreaId: parseInt(formData.training_area_id),
        imageUrl: formData.image_url,
      };

      const response = await api.updateModule(
        selectedModule.id,
        moduleData,
        token
      );

      if (response.success) {
        // Refresh the module list
        await refreshModuleList();
        setIsEditModalOpen(false);
        setSelectedModule(null);
        setError("");
      } else {
        setError(response.message || "Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      setError("Failed to update module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteModule(moduleId, token);

      if (response.success) {
        // Refresh the module list
        await refreshModuleList();
        setError("");
      } else {
        setError(response.message || "Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      setError("Failed to delete module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModule = (module: any) => {
    setSelectedModule(module);
    setIsEditModalOpen(true);
  };

  const refreshModuleList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllModules(token);

    const transformedModules =
      updatedResponse.data?.map((module: any) => ({
        id: module.id,
        name: module.name,
        description: module.description || "N/A",
        trainingArea: module.trainingArea || "N/A",
        duration: module.duration || "N/A",
        unitCount: module.unitCount || 0,
        studentCount: module.studentCount || 0,
        createdDate: module.createdAt
          ? new Date(module.createdAt).toISOString().split("T")[0]
          : "N/A",
        status: module.status || "Active",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditModule(module)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteModule(module.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setModules(transformedModules);
    setFilteredModules(transformedModules);
  };

  const CreateModuleForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      training_area_id: "",
      image_url: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateModule(formData);
      setFormData({
        name: "",
        description: "",
        training_area_id: "",
        image_url: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Module Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="training_area_id">Training Area *</Label>
          <select
            id="training_area_id"
            value={formData.training_area_id}
            onChange={(e) =>
              setFormData({ ...formData, training_area_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="">Select a training area</option>
            {trainingAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            className="rounded-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Module"}
          </Button>
        </div>
      </form>
    );
  };

  const EditModuleForm = () => {
    const [formData, setFormData] = useState({
      name: selectedModule?.name || "",
      description: selectedModule?.description || "",
      trainingArea: selectedModule?.trainingArea || "",
      duration: selectedModule?.duration || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateModule(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_name">Module Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_description">Description *</Label>
          <Input
            id="edit_description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_trainingArea">Training Area *</Label>
          <Input
            id="edit_trainingArea"
            value={formData.trainingArea}
            onChange={(e) =>
              setFormData({ ...formData, trainingArea: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_duration">Duration *</Label>
          <Input
            id="edit_duration"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedModule(null);
            }}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Module"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Description",
    "Training Area ID",
    "Image URL",
    "Created Date",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Modules"
      description="Manage training modules and course structures"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search modules..."
        createButtonText="Create Module"
        createForm={<CreateModuleForm />}
        tableData={filteredModules}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Module</DialogTitle>
          </DialogHeader>
          <EditModuleForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default ModulesPage;
