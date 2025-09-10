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
import InsertImage from "@/components/insertImage";
import { Image as ImageIcon } from "lucide-react";

// API object for training area operations
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

  async createTrainingArea(trainingAreaData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
};

// Type for training area data
interface TrainingAreaData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  actions: React.ReactNode;
}

const TrainingAreaPage = () => {
  const { token } = useAuth();
  const [trainingAreas, setTrainingAreas] = useState<TrainingAreaData[]>([]);
  const [filteredTrainingAreas, setFilteredTrainingAreas] = useState<
    TrainingAreaData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrainingArea, setSelectedTrainingArea] = useState<any>(null);

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
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditTrainingArea(trainingArea)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteTrainingArea(trainingArea.id)}
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

  const handleDeleteTrainingArea = async (trainingAreaId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this training area?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteTrainingArea(trainingAreaId, token);

      if (response.success) {
        // Refresh the training area list
        await refreshTrainingAreaList();
        setError("");
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
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditTrainingArea(trainingArea)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteTrainingArea(trainingArea.id)}
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

  const CreateTrainingAreaForm = () => {
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

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Training Area Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
            <Label>Image</Label>
            <InsertImage
              onImageInsert={handleImageInsert}
              onClose={() => setShowInsertImage(false)}
              currentImageUrl={formData.image_url}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
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
  };

  const EditTrainingAreaForm = () => {
    const [formData, setFormData] = useState({
      name: selectedTrainingArea?.name || "",
      description: selectedTrainingArea?.description || "",
      image_url: selectedTrainingArea?.image_url || "",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateTrainingArea(formData);
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Training Area Name *</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
            <Label>Image</Label>
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
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Training Area"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

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
      <AdminTableLayout
        searchPlaceholder="Search training areas..."
        createButtonText="Create Training Area"
        createForm={<CreateTrainingAreaForm />}
        tableData={filteredTrainingAreas}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Training Area</DialogTitle>
          </DialogHeader>
          <EditTrainingAreaForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default TrainingAreaPage;
