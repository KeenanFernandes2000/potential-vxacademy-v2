import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  MoreVert,
  Edit,
  Delete,
  Close,
  Publish,
  Drafts,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InsertImage from "@/components/insertImage";
import { Image as ImageIcon } from "lucide-react";

// API object for module operations
const api = {
  async getAllTrainingAreas(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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

  async publishModule(moduleId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/modules/${moduleId}/publish`,
        {
          method: "PUT",
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
      console.error("Failed to publish module:", error);
      throw error;
    }
  },

  async draftModule(moduleId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/modules/${moduleId}/draft`,
        {
          method: "PUT",
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
      console.error("Failed to draft module:", error);
      throw error;
    }
  },
};

// Type for module data
interface ModuleData extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  training_area_name: string;
  status: string;
  actions: React.ReactNode;
}

const ModulesPage = () => {
  const { token } = useAuth();
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [filteredModules, setFilteredModules] = useState<ModuleData[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
          modulesResponse.data?.map((module: any) => {
            // Find the training area for this module
            const trainingArea = trainingAreasResponse.data?.find(
              (ta: any) => ta.id === module.trainingAreaId
            );

            return {
              id: module.id,
              name: module.name,
              training_area_name: trainingArea?.name || "N/A",
              status: module.status || "draft",
              trainingAreaId: module.trainingAreaId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-blue-400 hover:bg-blue-400/10"
                    onClick={() => handleEditModule(module)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  {module.status === "draft" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:text-green-400 hover:bg-green-400/10"
                      onClick={() => handlePublishModule(module.id)}
                      title="Publish"
                    >
                      <Publish sx={{ fontSize: 16 }} />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                      onClick={() => handleDraftModule(module.id)}
                      title="Draft"
                    >
                      <Drafts sx={{ fontSize: 16 }} />
                    </Button>
                  )}
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
            };
          }) || [];

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
      const filtered = modules.filter((module) =>
        module.name.toLowerCase().includes(query.toLowerCase())
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
        setSuccessMessage("Module created successfully!");
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

  const handlePublishModule = async (moduleId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.publishModule(moduleId, token);

      if (response.success) {
        await refreshModuleList();
        setError("");
        setSuccessMessage("Module published successfully!");
      } else {
        setError(response.message || "Failed to publish module");
      }
    } catch (error) {
      console.error("Error publishing module:", error);
      setError("Failed to publish module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftModule = async (moduleId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.draftModule(moduleId, token);

      if (response.success) {
        await refreshModuleList();
        setError("");
        setSuccessMessage("Module moved to draft successfully!");
      } else {
        setError(response.message || "Failed to draft module");
      }
    } catch (error) {
      console.error("Error drafting module:", error);
      setError("Failed to draft module. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshModuleList = async () => {
    if (!token) return;
    const [updatedResponse, trainingAreasResponse] = await Promise.all([
      api.getAllModules(token),
      api.getAllTrainingAreas(token),
    ]);

    // Update training areas state
    setTrainingAreas(trainingAreasResponse.data || []);

    const transformedModules =
      updatedResponse.data?.map((module: any) => {
        // Find the training area for this module
        const trainingArea = trainingAreasResponse.data?.find(
          (ta: any) => ta.id === module.trainingAreaId
        );

        return {
          id: module.id,
          name: module.name,
          training_area_name: trainingArea?.name || "N/A",
          status: module.status || "draft",
          trainingAreaId: module.trainingAreaId, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => handleEditModule(module)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              {module.status === "draft" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-green-400 hover:bg-green-400/10"
                  onClick={() => handlePublishModule(module.id)}
                  title="Publish"
                >
                  <Publish sx={{ fontSize: 16 }} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-yellow-400 hover:bg-yellow-400/10"
                  onClick={() => handleDraftModule(module.id)}
                  title="Draft"
                >
                  <Drafts sx={{ fontSize: 16 }} />
                </Button>
              )}
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
        };
      }) || [];

    setModules(transformedModules);
    setFilteredModules(transformedModules);
  };

  const CreateModuleForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      training_area_id: "",
      image_url: "",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

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

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
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
          <h3 className="text-lg font-semibold">Create Module</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Module Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Type your Module name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Add a description"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
              required
            >
              <option value="" className="text-gray-900">
                Select a training area
              </option>
              {trainingAreas.map((area) => (
                <option key={area.id} value={area.id} className="text-gray-900">
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
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Paste your image URL"
            />
          </div>
          <div className="space-y-2">
            <Label>Or Upload Image</Label>
            <InsertImage
              onImageInsert={handleImageInsert}
              onClose={() => setShowInsertImage(false)}
              currentImageUrl={formData.image_url}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Creating..." : "Create Module"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditModuleForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: selectedModule?.name || "",
      description: selectedModule?.description || "",
      training_area_id: selectedModule?.trainingAreaId || "",
      image_url: selectedModule?.imageUrl || "",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateModule(formData);
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
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
          <h3 className="text-lg font-semibold">Edit Module</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Module Name *</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Type your Module name"
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
              placeholder="Add a description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_training_area_id">Training Area *</Label>
            <select
              id="edit_training_area_id"
              value={formData.training_area_id}
              onChange={(e) =>
                setFormData({ ...formData, training_area_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
              required
            >
              <option value="" className="text-gray-900">
                Select a training area
              </option>
              {trainingAreas.map((area) => (
                <option key={area.id} value={area.id} className="text-gray-900">
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_image_url">Image URL</Label>
            <Input
              id="edit_image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Paste your image URL"
            />
          </div>
          <div className="space-y-2">
            <Label>Or Upload Image</Label>
            <InsertImage
              onImageInsert={handleImageInsert}
              onClose={() => setShowInsertImage(false)}
              currentImageUrl={formData.image_url}
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
              className="rounded-full bg-[#00d8cc]/30"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Module"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = ["ID", "Module", "Training Area", "Actions"];

  return (
    <AdminPageLayout title="Modules" description="Manage your Modules">
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
        searchPlaceholder="Search modules..."
        createButtonText="Create Module"
        createForm={<CreateModuleForm onClose={() => {}} />}
        tableData={filteredModules}
        columns={columns}
        onSearch={handleSearch}
        enableColumnFiltering={true}
        columnFilterConfig={{
          trainingAreaId: "trainingAreaId",
        }}
        dropdownConfig={{
          showTrainingArea: true,
          showModule: false,
          showCourse: false,
          showUnit: false,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Module</DialogTitle>
          </DialogHeader>
          <EditModuleForm
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedModule(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default ModulesPage;
