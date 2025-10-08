import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Edit, Delete, Close, Publish } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InsertImage from "@/components/insertImage";
import { Image as ImageIcon } from "lucide-react";

// API object for training area operations
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

  async createTrainingArea(trainingAreaData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/training-areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trainingAreaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create training area:", error);
      throw error;
    }
  },

  async updateTrainingArea(
    trainingAreaId: number,
    trainingAreaData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/training-areas/${trainingAreaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(trainingAreaData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update training area:", error);
      throw error;
    }
  },

  async deleteTrainingArea(trainingAreaId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/training-areas/${trainingAreaId}`,
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
      console.error("Failed to delete training area:", error);
      throw error;
    }
  },

  async publishTrainingArea(trainingAreaId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/training-areas/${trainingAreaId}/publish`,
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
      console.error("Failed to publish training area:", error);
      throw error;
    }
  },

  async draftTrainingArea(trainingAreaId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/training-areas/${trainingAreaId}/draft`,
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
      console.error("Failed to draft training area:", error);
      throw error;
    }
  },
};

// Type for training area data
interface TrainingAreaData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  status: string;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  name?: string;
  description?: string;
  image_url?: string;
}

const TrainingAreaPage = () => {
  const { token } = useAuth();
  const [trainingAreas, setTrainingAreas] = useState<TrainingAreaData[]>([]);
  const [filteredTrainingAreas, setFilteredTrainingAreas] = useState<
    TrainingAreaData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrainingArea, setSelectedTrainingArea] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trainingAreaToDelete, setTrainingAreaToDelete] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

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
      errors.name = "Training area name is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch training areas from database on component mount
  useEffect(() => {
    const fetchTrainingAreas = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllTrainingAreas(token);

        // Transform data to match our display format
        const transformedTrainingAreas =
          response.data?.map((trainingArea: any) => ({
            id: trainingArea.id,
            name: trainingArea.name,
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-orange-500 hover:bg-orange-500/10"
                  onClick={() => handleEditTrainingArea(trainingArea)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteTrainingArea(trainingArea)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setTrainingAreas(transformedTrainingAreas);
        setFilteredTrainingAreas(transformedTrainingAreas);
        setError("");
      } catch (error) {
        console.error("Error fetching training areas:", error);
        setError("Failed to load training areas. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingAreas();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredTrainingAreas(trainingAreas);
    } else {
      const filtered = trainingAreas.filter((area) =>
        area.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTrainingAreas(filtered);
    }
  };

  const handleCreateTrainingArea = async (formData: any) => {
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
      const trainingAreaData = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.image_url,
      };

      const response = await api.createTrainingArea(trainingAreaData, token);

      if (response.success) {
        // Refresh the training area list
        await refreshTrainingAreaList();
        setError("");
        setSuccessMessage("Training area created successfully!");
        setValidationErrors({});
      } else {
        setError(response.message || "Failed to create training area");
      }
    } catch (error) {
      console.error("Error creating training area:", error);
      setError("Failed to create training area. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTrainingArea = async (formData: any) => {
    if (!token || !selectedTrainingArea) {
      setError("Authentication required or no training area selected");
      return;
    }

    // Validate form before submission
    if (!validateForm(formData)) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const trainingAreaData = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.image_url,
      };

      const response = await api.updateTrainingArea(
        selectedTrainingArea.id,
        trainingAreaData,
        token
      );

      if (response.success) {
        // Refresh the training area list
        await refreshTrainingAreaList();
        setIsEditModalOpen(false);
        setSelectedTrainingArea(null);
        setError("");
        setSuccessMessage("Training area updated successfully!");
        setValidationErrors({});
      } else {
        setError(response.message || "Failed to update training area");
      }
    } catch (error) {
      console.error("Error updating training area:", error);
      setError("Failed to update training area. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrainingArea = (trainingArea: any) => {
    setTrainingAreaToDelete(trainingArea);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTrainingArea = async () => {
    if (!token || !trainingAreaToDelete) {
      setError("Authentication required or no training area selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteTrainingArea(
        trainingAreaToDelete.id,
        token
      );

      if (response.success) {
        // Refresh the training area list
        await refreshTrainingAreaList();
        setError("");
        setSuccessMessage("Training area deleted successfully!");
        setIsDeleteModalOpen(false);
        setTrainingAreaToDelete(null);
      } else {
        setError(response.message || "Failed to delete training area");
      }
    } catch (error) {
      console.error("Error deleting training area:", error);
      setError("Failed to delete training area. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTrainingArea = (trainingArea: any) => {
    setSelectedTrainingArea(trainingArea);
    setIsEditModalOpen(true);
  };

  const refreshTrainingAreaList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllTrainingAreas(token);

    const transformedTrainingAreas =
      updatedResponse.data?.map((trainingArea: any) => ({
        id: trainingArea.id,
        name: trainingArea.name,
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-orange-500 hover:bg-orange-500/10"
              onClick={() => handleEditTrainingArea(trainingArea)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteTrainingArea(trainingArea)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setTrainingAreas(transformedTrainingAreas);
    setFilteredTrainingAreas(transformedTrainingAreas);
  };

  // Create Training Area Form Component - moved outside to prevent re-renders
  const CreateTrainingAreaForm = React.memo(() => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      image_url: "",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateTrainingArea(formData);
      setFormData({ name: "", description: "", image_url: "" });
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    const handleFieldChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error for this field when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#2C2C2C]">
              Training Area Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.name ? "border-red-500" : "border-sandstone"
              }`}
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#2C2C2C]">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#2C2C2C]">Image</Label>
            <InsertImage
              onImageInsert={handleImageInsert}
              onClose={() => setShowInsertImage(false)}
              currentImageUrl={formData.image_url}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="rounded-full"
            >
              {isLoading ? "Creating..." : "Create Training Area"}
            </Button>
          </div>
        </form>
        {showInsertImage && (
          <InsertImage
            onImageInsert={handleImageInsert}
            onClose={() => setShowInsertImage(false)}
          />
        )}
      </div>
    );
  });

  // Edit Training Area Form Component - moved outside to prevent re-renders
  const EditTrainingAreaForm = React.memo(() => {
    const [formData, setFormData] = useState({
      name: selectedTrainingArea?.name || "",
      description: selectedTrainingArea?.description || "",
      image_url: selectedTrainingArea?.image_url || "",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    // Update form data when selectedTrainingArea changes
    useEffect(() => {
      if (selectedTrainingArea) {
        setFormData({
          name: selectedTrainingArea.name || "",
          description: selectedTrainingArea.description || "",
          image_url: selectedTrainingArea.image_url || "",
        });
      }
    }, [selectedTrainingArea]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateTrainingArea(formData);
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    const handleFieldChange = (field: string, value: string) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error for this field when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name" className="text-[#2C2C2C]">
              Training Area Name *
            </Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.name ? "border-red-500" : "border-sandstone"
              }`}
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description" className="text-[#2C2C2C]">
              Description
            </Label>
            <Input
              id="edit_description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#2C2C2C]">Image</Label>
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
                setSelectedTrainingArea(null);
              }}
              className="rounded-full bg-orange-500/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="rounded-full"
            >
              {isLoading ? "Updating..." : "Update Training Area"}
            </Button>
          </div>
        </form>
      </div>
    );
  });

  const columns = ["ID", "Name", "Actions"];

  return (
    <AdminPageLayout
      title="Training Areas"
      description="Manage training areas and course categories"
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
        searchPlaceholder="Search training areas..."
        createButtonText="Create Training Area"
        createForm={<CreateTrainingAreaForm />}
        tableData={filteredTrainingAreas}
        columns={columns}
        enableColumnFiltering={false}
        dropdownConfig={{
          showTrainingArea: false,
          showModule: false,
          showCourse: false,
          showUnit: false,
        }}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-sandstone text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              Edit Training Area
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsEditModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <EditTrainingAreaForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-sandstone text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              Delete Training Area
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#2C2C2C]">
              Are you sure you want to delete the training area "
              {trainingAreaToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTrainingAreaToDelete(null);
              }}
              className="rounded-full bg-orange-500/30"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTrainingArea}
              disabled={isLoading}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default TrainingAreaPage;
