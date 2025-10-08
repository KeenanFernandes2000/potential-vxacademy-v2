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
import { MoreVert, Edit, Delete, Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for learning block operations
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

  async getAllCourses(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/courses`, {
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
      console.error("Failed to fetch courses:", error);
      throw error;
    }
  },

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
  order: number;
  unit_name: string;
  course_name: string;
  module_name: string;
  training_area_name: string;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  unit_id?: string;
  type?: string;
  title?: string;
  content?: string;
  video_url?: string;
  image_url?: string;
  interactive_data?: string;
  order?: string;
  xp_points?: string;
}

const LearningBlockPage = () => {
  const { token } = useAuth();
  const [learningBlocks, setLearningBlocks] = useState<LearningBlockData[]>([]);
  const [filteredLearningBlocks, setFilteredLearningBlocks] = useState<
    LearningBlockData[]
  >([]);
  const [units, setUnits] = useState<any[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLearningBlock, setSelectedLearningBlock] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [learningBlockToDelete, setLearningBlockToDelete] = useState<any>(null);

  // Validation function
  const validateForm = (formData: any): boolean => {
    const errors: ValidationErrors = {};

    // Required field validations
    if (!formData.unit_id || formData.unit_id === "") {
      errors.unit_id = "Unit is required";
    }

    if (!formData.type || formData.type === "") {
      errors.type = "Type is required";
    }

    if (!formData.title || formData.title.trim() === "") {
      errors.title = "Title is required";
    }

    if (
      !formData.order ||
      formData.order === "" ||
      parseInt(formData.order) < 1
    ) {
      errors.order = "Order must be a positive number";
    }

    if (
      !formData.xp_points ||
      formData.xp_points === "" ||
      parseInt(formData.xp_points) < 0
    ) {
      errors.xp_points = "VX Points must be a non-negative number";
    }

    // Type-specific validations
    if (
      formData.type === "text" &&
      (!formData.content || formData.content.trim() === "")
    ) {
      errors.content = "Content is required for text type";
    }

    if (
      formData.type === "video" &&
      (!formData.video_url || formData.video_url.trim() === "")
    ) {
      errors.video_url = "Video URL is required for video type";
    }

    if (
      formData.type === "image" &&
      (!formData.image_url || formData.image_url.trim() === "")
    ) {
      errors.image_url = "Image URL is required for image type";
    }

    if (
      formData.type === "interactive" &&
      (!formData.interactive_data || formData.interactive_data.trim() === "")
    ) {
      errors.interactive_data =
        "Interactive data is required for interactive type";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Success message function
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;

      try {
        const [trainingAreasRes, modulesRes, coursesRes, unitsRes] =
          await Promise.all([
            api.getAllTrainingAreas(token),
            api.getAllModules(token),
            api.getAllCourses(token),
            api.getAllUnits(token),
          ]);

        setTrainingAreas(trainingAreasRes.data || []);
        setModules(modulesRes.data || []);
        setCourses(coursesRes.data || []);
        setUnits(unitsRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, [token]);

  // Fetch learning blocks from database on component mount
  useEffect(() => {
    const fetchLearningBlocks = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      // Wait until dropdown data is loaded to correctly map names
      const dropdownsReady =
        Array.isArray(trainingAreas) &&
        Array.isArray(modules) &&
        Array.isArray(courses) &&
        Array.isArray(units) &&
        (trainingAreas.length > 0 ||
          modules.length > 0 ||
          courses.length > 0 ||
          units.length > 0);
      if (!dropdownsReady) {
        return;
      }

      try {
        setIsLoading(true);
        const learningBlocksResponse = await api.getAllLearningBlocks(token);

        // Transform data to match our display format
        const transformedLearningBlocks =
          learningBlocksResponse.data?.map((learningBlock: any) => {
            // Find the unit for this learning block
            const unit = units.find((u: any) => u.id === learningBlock.unitId);

            return {
              id: learningBlock.id,
              name: learningBlock.title || "N/A",
              type: learningBlock.type || "N/A",
              unit_name: unit?.name || "N/A",
              order: learningBlock.order || "N/A",
              // unitId: learningBlock.unitId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditLearningBlock(learningBlock)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteLearningBlock(learningBlock)}
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
  }, [token, trainingAreas, modules, courses, units]);

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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        showSuccessMessage("Learning block created successfully!");
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

    // Validate form before submission
    if (!validateForm(formData)) {
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
        showSuccessMessage("Learning block updated successfully!");
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

  const handleDeleteLearningBlock = (learningBlock: any) => {
    setLearningBlockToDelete(learningBlock);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLearningBlock = async () => {
    if (!token || !learningBlockToDelete) {
      setError("Authentication required or no learning block selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteLearningBlock(
        learningBlockToDelete.id,
        token
      );

      if (response.success) {
        // Refresh the learning block list
        await refreshLearningBlockList();
        setError("");
        showSuccessMessage("Learning block deleted successfully!");
      } else {
        setError(response.message || "Failed to delete learning block");
      }
    } catch (error) {
      console.error("Error deleting learning block:", error);
      setError("Failed to delete learning block. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setLearningBlockToDelete(null);
    }
  };

  const handleEditLearningBlock = (learningBlock: any) => {
    setSelectedLearningBlock(learningBlock);
    setIsEditModalOpen(true);
  };

  const refreshLearningBlockList = async () => {
    if (!token) return;
    const learningBlocksResponse = await api.getAllLearningBlocks(token);

    const transformedLearningBlocks =
      learningBlocksResponse.data?.map((learningBlock: any) => {
        // Find the unit for this learning block
        const unit = units.find((u: any) => u.id === learningBlock.unitId);

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
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditLearningBlock(learningBlock)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteLearningBlock(learningBlock)}
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
      training_area_id: "",
      module_id: "",
      course_id: "",
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
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);

    // Filter modules based on selected training area
    useEffect(() => {
      if (formData.training_area_id) {
        const filtered = modules.filter(
          (module) =>
            module.trainingAreaId === parseInt(formData.training_area_id)
        );
        setFilteredModules(filtered);
        // Reset module, course, and unit selections
        setFormData((prev) => ({
          ...prev,
          module_id: "",
          course_id: "",
          unit_id: "",
        }));
      } else {
        setFilteredModules([]);
        setFormData((prev) => ({
          ...prev,
          module_id: "",
          course_id: "",
          unit_id: "",
        }));
      }
    }, [formData.training_area_id, modules]);

    // Filter courses based on selected module
    useEffect(() => {
      if (formData.module_id) {
        const filtered = courses.filter(
          (course) => course.moduleId === parseInt(formData.module_id)
        );
        setFilteredCourses(filtered);
        // Reset course and unit selections
        setFormData((prev) => ({ ...prev, course_id: "", unit_id: "" }));
      } else {
        setFilteredCourses([]);
        setFormData((prev) => ({ ...prev, course_id: "", unit_id: "" }));
      }
    }, [formData.module_id, courses]);

    // Filter units based on selected course
    useEffect(() => {
      if (formData.course_id) {
        // Get course-units for the selected course
        const fetchCourseUnits = async () => {
          try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(
              `${baseUrl}/api/training/course-units/course/${formData.course_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const courseUnitsData = await response.json();
              const unitIds =
                courseUnitsData.data?.map((cu: any) => cu.unitId) || [];
              const filtered = units.filter((unit) =>
                unitIds.includes(unit.id)
              );
              setFilteredUnits(filtered);
            } else {
              setFilteredUnits([]);
            }
          } catch (error) {
            console.error("Error fetching course units:", error);
            setFilteredUnits([]);
          }
        };

        fetchCourseUnits();
        // Reset unit selection
        setFormData((prev) => ({ ...prev, unit_id: "" }));
      } else {
        setFilteredUnits([]);
        setFormData((prev) => ({ ...prev, unit_id: "" }));
      }
    }, [formData.course_id, units, token]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        content:
          formData.type === "text"
            ? editorState !== null
              ? JSON.stringify(editorState)
              : formData.content
            : formData.content,
      };
      await handleCreateLearningBlock(submitData);
      setFormData({
        training_area_id: "",
        module_id: "",
        course_id: "",
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
      setValidationErrors({});
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
            <Label htmlFor="training_area_id">Training Area</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                handleFieldChange("training_area_id", value)
              }
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select training area" />
              </SelectTrigger>
              <SelectContent>
                {trainingAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module_id">Module</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) => handleFieldChange("module_id", value)}
              disabled={!formData.training_area_id}
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {filteredModules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_id">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => handleFieldChange("course_id", value)}
              disabled={!formData.module_id}
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_id">Unit *</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) => handleFieldChange("unit_id", value)}
              disabled={!formData.course_id}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.unit_id
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.unit_id && (
              <p className="text-red-500 text-sm">{validationErrors.unit_id}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleFieldChange("type", value)}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.type ? "border-red-500" : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.type && (
              <p className="text-red-500 text-sm">{validationErrors.type}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.title ? "border-red-500" : "border-sandstone"
              }`}
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm">{validationErrors.title}</p>
            )}
          </div>
          {formData.type === "text" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <div
                className={`min-h-[200px] border-2 rounded-lg p-2 ${
                  validationErrors.content
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
              >
                <Editor onChange={setEditorState} />
              </div>
              {validationErrors.content && (
                <p className="text-red-500 text-sm">
                  {validationErrors.content}
                </p>
              )}
            </div>
          )}
          {formData.type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => handleFieldChange("video_url", e.target.value)}
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.video_url
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                required
              />
              {validationErrors.video_url && (
                <p className="text-red-500 text-sm">
                  {validationErrors.video_url}
                </p>
              )}
            </div>
          )}
          {formData.type === "image" && (
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL *</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleFieldChange("image_url", e.target.value)}
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.image_url
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                required
              />
              {validationErrors.image_url && (
                <p className="text-red-500 text-sm">
                  {validationErrors.image_url}
                </p>
              )}
            </div>
          )}
          {formData.type === "interactive" && (
            <div className="space-y-2">
              <Label htmlFor="interactive_data">
                Interactive Data (JSON) *
              </Label>
              <Input
                id="interactive_data"
                value={formData.interactive_data}
                onChange={(e) =>
                  handleFieldChange("interactive_data", e.target.value)
                }
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.interactive_data
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                placeholder='{"type": "quiz", "questions": []}'
                required
              />
              {validationErrors.interactive_data && (
                <p className="text-red-500 text-sm">
                  {validationErrors.interactive_data}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="order">Order *</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleFieldChange("order", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.order ? "border-red-500" : "border-sandstone"
              }`}
              min="1"
              required
            />
            {validationErrors.order && (
              <p className="text-red-500 text-sm">{validationErrors.order}</p>
            )}
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="xp_points">VX Points *</Label>
            <Input
              id="xp_points"
              type="number"
              value={formData.xp_points}
              onChange={(e) => handleFieldChange("xp_points", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.xp_points
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
              min="0"
              required
            />
            {validationErrors.xp_points && (
              <p className="text-red-500 text-sm">
                {validationErrors.xp_points}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.unit_id ||
                !formData.type ||
                !formData.title ||
                !formData.order ||
                !formData.xp_points ||
                (formData.type === "text" && !editorState) ||
                (formData.type === "video" && !formData.video_url) ||
                (formData.type === "image" && !formData.image_url) ||
                (formData.type === "interactive" && !formData.interactive_data)
              }
              className="rounded-full"
            >
              {isLoading ? "Creating..." : "Create Learning Block"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditLearningBlockForm = () => {
    const [formData, setFormData] = useState({
      training_area_id: "",
      module_id: "",
      course_id: "",
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
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);

    // Filter modules based on selected training area
    useEffect(() => {
      if (formData.training_area_id) {
        const filtered = modules.filter(
          (module) =>
            module.trainingAreaId === parseInt(formData.training_area_id)
        );
        setFilteredModules(filtered);
      } else {
        setFilteredModules([]);
      }
    }, [formData.training_area_id, modules]);

    // Filter courses based on selected module
    useEffect(() => {
      if (formData.module_id) {
        const filtered = courses.filter(
          (course) => course.moduleId === parseInt(formData.module_id)
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses([]);
      }
    }, [formData.module_id, courses]);

    // Filter units based on selected course
    useEffect(() => {
      if (formData.course_id) {
        // Get course-units for the selected course
        const fetchCourseUnits = async () => {
          try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(
              `${baseUrl}/api/training/course-units/course/${formData.course_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const courseUnitsData = await response.json();
              const unitIds =
                courseUnitsData.data?.map((cu: any) => cu.unitId) || [];
              const filtered = units.filter((unit) =>
                unitIds.includes(unit.id)
              );
              setFilteredUnits(filtered);
            } else {
              setFilteredUnits([]);
            }
          } catch (error) {
            console.error("Error fetching course units:", error);
            setFilteredUnits([]);
          }
        };

        fetchCourseUnits();
      } else {
        setFilteredUnits([]);
      }
    }, [formData.course_id, units, token]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const submitData = {
        ...formData,
        content:
          formData.type === "text"
            ? editorState !== null
              ? JSON.stringify(editorState)
              : selectedLearningBlock?.content || formData.content
            : formData.content,
      };
      await handleUpdateLearningBlock(submitData);
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
            <Label htmlFor="edit_training_area_id">Training Area</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                handleFieldChange("training_area_id", value)
              }
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select training area" />
              </SelectTrigger>
              <SelectContent>
                {trainingAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_module_id">Module</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) => handleFieldChange("module_id", value)}
              disabled={!formData.training_area_id}
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {filteredModules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_course_id">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => handleFieldChange("course_id", value)}
              disabled={!formData.module_id}
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_unit_id">Unit *</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) => handleFieldChange("unit_id", value)}
              disabled={!formData.course_id}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.unit_id
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.unit_id && (
              <p className="text-red-500 text-sm">{validationErrors.unit_id}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleFieldChange("type", value)}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.type ? "border-red-500" : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.type && (
              <p className="text-red-500 text-sm">{validationErrors.type}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_title">Title *</Label>
            <Input
              id="edit_title"
              value={formData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.title ? "border-red-500" : "border-sandstone"
              }`}
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm">{validationErrors.title}</p>
            )}
          </div>
          {formData.type === "text" && (
            <div className="space-y-2">
              <Label htmlFor="edit_content">Content *</Label>
              <div
                className={`min-h-[200px] border-2 rounded-lg p-2 ${
                  validationErrors.content
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
              >
                <Editor
                  content={selectedLearningBlock?.content}
                  onChange={setEditorState}
                />
              </div>
              {validationErrors.content && (
                <p className="text-red-500 text-sm">
                  {validationErrors.content}
                </p>
              )}
            </div>
          )}
          {formData.type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="edit_video_url">Video URL *</Label>
              <Input
                id="edit_video_url"
                value={formData.video_url}
                onChange={(e) => handleFieldChange("video_url", e.target.value)}
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.video_url
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                required
              />
              {validationErrors.video_url && (
                <p className="text-red-500 text-sm">
                  {validationErrors.video_url}
                </p>
              )}
            </div>
          )}
          {formData.type === "image" && (
            <div className="space-y-2">
              <Label htmlFor="edit_image_url">Image URL *</Label>
              <Input
                id="edit_image_url"
                value={formData.image_url}
                onChange={(e) => handleFieldChange("image_url", e.target.value)}
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.image_url
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                required
              />
              {validationErrors.image_url && (
                <p className="text-red-500 text-sm">
                  {validationErrors.image_url}
                </p>
              )}
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
                  handleFieldChange("interactive_data", e.target.value)
                }
                className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                  validationErrors.interactive_data
                    ? "border-red-500"
                    : "border-sandstone"
                }`}
                placeholder='{"type": "quiz", "questions": []}'
                required
              />
              {validationErrors.interactive_data && (
                <p className="text-red-500 text-sm">
                  {validationErrors.interactive_data}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit_order">Order *</Label>
            <Input
              id="edit_order"
              type="number"
              value={formData.order}
              onChange={(e) => handleFieldChange("order", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.order ? "border-red-500" : "border-sandstone"
              }`}
              min="1"
              required
            />
            {validationErrors.order && (
              <p className="text-red-500 text-sm">{validationErrors.order}</p>
            )}
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="edit_xp_points">VX Points *</Label>
            <Input
              id="edit_xp_points"
              type="number"
              value={formData.xp_points}
              onChange={(e) => handleFieldChange("xp_points", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.xp_points
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
              min="0"
              required
            />
            {validationErrors.xp_points && (
              <p className="text-red-500 text-sm">
                {validationErrors.xp_points}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedLearningBlock(null);
              }}
              className="rounded-full hover:bg-accent/30 hover:text-black"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Learning Block"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = ["ID", "Title", "Type", "Learning Unit", "Order", "Actions"];

  return (
    <AdminPageLayout
      title="Learning Blocks"
      description="Manage your Learning Blocks"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg relative z-[60]">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
          {successMessage}
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
          unitId: "unit_name",
        }}
        dropdownConfig={{
          showTrainingArea: true,
          showModule: true,
          showCourse: true,
          showUnit: true,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border text-card-foreground max-h-[80%] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Edit Learning Block
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
          <div className="mt-4">
            <EditLearningBlockForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Delete Learning Block
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-card-foreground mb-6">
              Are you sure you want to delete the learning block "
              {learningBlockToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-full hover:bg-accent/30 hover:text-black"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteLearningBlock}
                disabled={isLoading}
                className="rounded-full"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default LearningBlockPage;
