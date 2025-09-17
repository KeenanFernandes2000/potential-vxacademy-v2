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
import { Editor } from "@/components/blocks/editor-00/editor";
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

// API object for learning block operations
const api = {
  async getAllUnits(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units`, {
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
      console.error("Failed to fetch units:", error);
      throw error;
    }
  },

  async getAllLearningBlocks(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/learning-blocks`, {
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
      console.error("Failed to fetch learning blocks:", error);
      throw error;
    }
  },

  async createLearningBlock(learningBlockData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/learning-blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(learningBlockData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create learning block:", error);
      throw error;
    }
  },

  async updateLearningBlock(
    learningBlockId: number,
    learningBlockData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/learning-blocks/${learningBlockId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(learningBlockData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update learning block:", error);
      throw error;
    }
  },

  async deleteLearningBlock(learningBlockId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/learning-blocks/${learningBlockId}`,
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
      console.error("Failed to delete learning block:", error);
      throw error;
    }
  },
};

// Type for learning block data
interface LearningBlockData
  extends Record<string, string | number | boolean | React.ReactNode> {
  id: number;
  title: string;
  type: string;
  unit_name: string;
  actions: React.ReactNode;
}

const LearningBlockPage = () => {
  const { token } = useAuth();
  const [learningBlocks, setLearningBlocks] = useState<LearningBlockData[]>([]);
  const [filteredLearningBlocks, setFilteredLearningBlocks] = useState<
    LearningBlockData[]
  >([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLearningBlock, setSelectedLearningBlock] = useState<any>(null);

  // Fetch learning blocks from database on component mount
  useEffect(() => {
    const fetchLearningBlocks = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [learningBlocksResponse, unitsResponse] = await Promise.all([
          api.getAllLearningBlocks(token),
          api.getAllUnits(token),
        ]);

        setUnits(unitsResponse.data || []);

        // Transform data to match our display format
        const transformedLearningBlocks =
          learningBlocksResponse.data?.map((learningBlock: any) => {
            // Find the unit for this learning block
            const unit = unitsResponse.data?.find(
              (u: any) => u.id === learningBlock.unitId
            );

            return {
              id: learningBlock.id,
              name: learningBlock.title || "N/A",
              type: learningBlock.type || "N/A",
              unit_name: unit?.name || "N/A",
              unitId: learningBlock.unitId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditLearningBlock(learningBlock)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteLearningBlock(learningBlock.id)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || [];

        setLearningBlocks(transformedLearningBlocks);
        setFilteredLearningBlocks(transformedLearningBlocks);
        setError("");
      } catch (error) {
        console.error("Error fetching learning blocks:", error);
        setError("Failed to load learning blocks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningBlocks();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredLearningBlocks(learningBlocks);
    } else {
      const filtered = learningBlocks.filter(
        (block) =>
          block.id.toString().includes(query) ||
          block.title.toLowerCase().includes(query.toLowerCase()) ||
          block.type.toLowerCase().includes(query.toLowerCase()) ||
          block.unit_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLearningBlocks(filtered);
    }
  };

  const handleCreateLearningBlock = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const learningBlockData = {
        unitId: parseInt(formData.unit_id),
        type: formData.type,
        title: formData.title,
        content: formData.content || "",
        videoUrl: formData.video_url || "",
        imageUrl: formData.image_url || "",
        interactiveData: formData.interactive_data || "",
        order: parseInt(formData.order),
        xpPoints: parseInt(formData.xp_points),
      };

      const response = await api.createLearningBlock(learningBlockData, token);

      if (response.success) {
        // Refresh the learning block list
        await refreshLearningBlockList();
        setError("");
      } else {
        setError(response.message || "Failed to create learning block");
      }
    } catch (error) {
      console.error("Error creating learning block:", error);
      setError("Failed to create learning block. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLearningBlock = async (formData: any) => {
    if (!token || !selectedLearningBlock) {
      setError("Authentication required or no learning block selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const learningBlockData = {
        unitId: parseInt(formData.unit_id),
        type: formData.type,
        title: formData.title,
        content: formData.content || "",
        videoUrl: formData.video_url || "",
        imageUrl: formData.image_url || "",
        interactiveData: formData.interactive_data || "",
        order: parseInt(formData.order),
        xpPoints: parseInt(formData.xp_points),
      };

      const response = await api.updateLearningBlock(
        selectedLearningBlock.id,
        learningBlockData,
        token
      );

      if (response.success) {
        // Refresh the learning block list
        await refreshLearningBlockList();
        setIsEditModalOpen(false);
        setSelectedLearningBlock(null);
        setError("");
      } else {
        setError(response.message || "Failed to update learning block");
      }
    } catch (error) {
      console.error("Error updating learning block:", error);
      setError("Failed to update learning block. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLearningBlock = async (learningBlockId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this learning block?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteLearningBlock(learningBlockId, token);

      if (response.success) {
        // Refresh the learning block list
        await refreshLearningBlockList();
        setError("");
      } else {
        setError(response.message || "Failed to delete learning block");
      }
    } catch (error) {
      console.error("Error deleting learning block:", error);
      setError("Failed to delete learning block. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLearningBlock = (learningBlock: any) => {
    setSelectedLearningBlock(learningBlock);
    setIsEditModalOpen(true);
  };

  const refreshLearningBlockList = async () => {
    if (!token) return;
    const [learningBlocksResponse, unitsResponse] = await Promise.all([
      api.getAllLearningBlocks(token),
      api.getAllUnits(token),
    ]);

    setUnits(unitsResponse.data || []);

    const transformedLearningBlocks =
      learningBlocksResponse.data?.map((learningBlock: any) => {
        // Find the unit for this learning block
        const unit = unitsResponse.data?.find(
          (u: any) => u.id === learningBlock.unitId
        );

        return {
          id: learningBlock.id,
          name: learningBlock.title || "N/A",
          type: learningBlock.type || "N/A",
          unit_name: unit?.name || "N/A",
          unitId: learningBlock.unitId, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditLearningBlock(learningBlock)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteLearningBlock(learningBlock.id)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || [];

    setLearningBlocks(transformedLearningBlocks);
    setFilteredLearningBlocks(transformedLearningBlocks);
  };

  const CreateLearningBlockForm = () => {
    const [formData, setFormData] = useState({
      unit_id: "",
      type: "text",
      title: "",
      content: "",
      video_url: "",
      image_url: "",
      interactive_data: "",
      order: "1",
      xp_points: "10",
    });

    const [editorState, setEditorState] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        content:
          formData.type === "text"
            ? JSON.stringify(editorState)
            : formData.content,
      };
      await handleCreateLearningBlock(submitData);
      setFormData({
        unit_id: "",
        type: "text",
        title: "",
        content: "",
        video_url: "",
        image_url: "",
        interactive_data: "",
        order: "1",
        xp_points: "10",
      });
      setEditorState(null);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="unit_id">Unit *</Label>
          <Select
            value={formData.unit_id}
            onValueChange={(value) =>
              setFormData({ ...formData, unit_id: value })
            }
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        {formData.type === "text" && (
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <div className="min-h-[200px]">
              <Editor onChange={setEditorState} />
            </div>
          </div>
        )}
        {formData.type === "video" && (
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL *</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              required
            />
          </div>
        )}
        {formData.type === "image" && (
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              required
            />
          </div>
        )}
        {formData.type === "interactive" && (
          <div className="space-y-2">
            <Label htmlFor="interactive_data">Interactive Data (JSON) *</Label>
            <Input
              id="interactive_data"
              value={formData.interactive_data}
              onChange={(e) =>
                setFormData({ ...formData, interactive_data: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder='{"type": "quiz", "questions": []}'
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="xp_points">XP Points *</Label>
          <Input
            id="xp_points"
            type="number"
            value={formData.xp_points}
            onChange={(e) =>
              setFormData({ ...formData, xp_points: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            min="0"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Learning Block"}
          </Button>
        </div>
      </form>
    );
  };

  const EditLearningBlockForm = () => {
    const [formData, setFormData] = useState({
      unit_id: selectedLearningBlock?.unitId?.toString() || "",
      type: selectedLearningBlock?.type || "text",
      title: selectedLearningBlock?.title || "",
      content: selectedLearningBlock?.content || "",
      video_url: selectedLearningBlock?.videoUrl || "",
      image_url: selectedLearningBlock?.imageUrl || "",
      interactive_data: selectedLearningBlock?.interactiveData || "",
      order: selectedLearningBlock?.order?.toString() || "1",
      xp_points: selectedLearningBlock?.xpPoints?.toString() || "10",
    });

    const [editorState, setEditorState] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        content:
          formData.type === "text"
            ? JSON.stringify(editorState)
            : formData.content,
      };
      await handleUpdateLearningBlock(submitData);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_unit_id">Unit *</Label>
          <Select
            value={formData.unit_id}
            onValueChange={(value) =>
              setFormData({ ...formData, unit_id: value })
            }
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_title">Title *</Label>
          <Input
            id="edit_title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        {formData.type === "text" && (
          <div className="space-y-2">
            <Label htmlFor="edit_content">Content *</Label>
            <div className="min-h-[200px]">
              <Editor
                content={selectedLearningBlock?.content}
                onChange={setEditorState}
              />
            </div>
          </div>
        )}
        {formData.type === "video" && (
          <div className="space-y-2">
            <Label htmlFor="edit_video_url">Video URL *</Label>
            <Input
              id="edit_video_url"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              required
            />
          </div>
        )}
        {formData.type === "image" && (
          <div className="space-y-2">
            <Label htmlFor="edit_image_url">Image URL *</Label>
            <Input
              id="edit_image_url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              required
            />
          </div>
        )}
        {formData.type === "interactive" && (
          <div className="space-y-2">
            <Label htmlFor="edit_interactive_data">
              Interactive Data (JSON) *
            </Label>
            <Input
              id="edit_interactive_data"
              value={formData.interactive_data}
              onChange={(e) =>
                setFormData({ ...formData, interactive_data: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder='{"type": "quiz", "questions": []}'
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="edit_order">Order *</Label>
          <Input
            id="edit_order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_xp_points">XP Points *</Label>
          <Input
            id="edit_xp_points"
            type="number"
            value={formData.xp_points}
            onChange={(e) =>
              setFormData({ ...formData, xp_points: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            min="0"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedLearningBlock(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Learning Block"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["ID", "Name", "Type", "Unit Name", "Unit ID", "Actions"];

  return (
    <AdminPageLayout
      title="Learning Blocks"
      description="Manage learning blocks and content segments"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search by ID, title, type, or unit name..."
        createButtonText="Create Learning Block"
        createForm={<CreateLearningBlockForm />}
        tableData={filteredLearningBlocks}
        columns={columns}
        onSearch={handleSearch}
        enableColumnFiltering={true}
        columnFilterConfig={{
          unitId: "unitId",
        }}
        dropdownConfig={{
          showTrainingArea: false,
          showModule: false,
          showCourse: false,
          showUnit: true,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white max-h-[80%]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Learning Block
            </DialogTitle>
          </DialogHeader>
          <EditLearningBlockForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default LearningBlockPage;
