import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InsertImage from "@/components/insertImage";

// API object for course operations
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

  async createCourse(courseData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create course:", error);
      throw error;
    }
  },

  async updateCourse(courseId: number, courseData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update course:", error);
      throw error;
    }
  },

  async deleteCourse(courseId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/courses/${courseId}`,
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
      console.error("Failed to delete course:", error);
      throw error;
    }
  },
};

// Type for course data
interface CourseData
  extends Record<string, string | number | boolean | React.ReactNode> {
  id: number;
  name: string;
  module_name: string;
  training_area_name: string;
  duration: number;
  level: string;
  status: string;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  name?: string;
  description?: string;
  module_id?: string;
  duration?: string;
  level?: string;
  status?: string;
  image_url?: string;
}

const CoursesPage = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
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
      errors.name = "Course name is required";
    }

    if (!formData.module_id || formData.module_id === "") {
      errors.module_id = "Module selection is required";
    }

    if (
      formData.show_duration &&
      (!formData.duration || formData.duration.trim() === "")
    ) {
      errors.duration = "Duration is required when show duration is enabled";
    }

    if (formData.show_level && (!formData.level || formData.level === "")) {
      errors.level = "Level is required when show level is enabled";
    }

    if (!formData.status || formData.status === "") {
      errors.status = "Status selection is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch courses from database on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [coursesResponse, modulesResponse, trainingAreasResponse] =
          await Promise.all([
            api.getAllCourses(token),
            api.getAllModules(token),
            api.getAllTrainingAreas(token),
          ]);

        setModules(modulesResponse.data || []);
        setTrainingAreas(trainingAreasResponse.data || []);

        // Transform data to match our display format
        const transformedCourses =
          coursesResponse.data?.map((course: any) => {
            // Find the module for this course
            const module = modulesResponse.data?.find(
              (m: any) => m.id === course.moduleId
            );
            // Find the training area for this module
            const trainingArea = module
              ? trainingAreasResponse.data?.find(
                  (ta: any) => ta.id === module.trainingAreaId
                )
              : null;

            return {
              id: course.id,
              name: course.name,
              module_name: module?.name || "N/A",
              training_area_name: trainingArea?.name || "N/A",
              duration: course.duration || 0,
              // level: course.level || "beginner",
              status: (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.status === "published" ? "Published" : "Draft"}
                </span>
              ),
              // trainingAreaId: trainingArea?.id, // Keep for filtering
              // moduleId: course.moduleId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-orange-500 hover:bg-orange-500/10"
                    onClick={() => handleEditCourse(course)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteCourse(course)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || [];

        setCourses(transformedCourses);
        setFilteredCourses(transformedCourses);
        setError("");
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course: any) =>
        course.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const handleCreateCourse = async (formData: any) => {
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
      const courseData = {
        moduleId: parseInt(formData.module_id),
        name: formData.name,
        description: formData.description,
        imageUrl: formData.image_url || "",
        internalNote: formData.internal_note || "",
        duration: parseInt(formData.duration),
        showDuration: formData.show_duration,
        level: formData.level,
        showLevel: formData.show_level,
        status: formData.status,
      };

      const response = await api.createCourse(courseData, token);

      if (response.success) {
        // Refresh the course list
        await refreshCourseList();
        setError("");
        setSuccessMessage("Course created successfully!");
        setValidationErrors({});
      } else {
        setError(response.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (formData: any) => {
    if (!token || !selectedCourse) {
      setError("Authentication required or no course selected");
      return;
    }

    // Validate form before submission
    if (!validateForm(formData)) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const courseData = {
        moduleId: parseInt(formData.module_id),
        name: formData.name,
        description: formData.description,
        imageUrl: formData.image_url || "",
        internalNote: formData.internal_note || "",
        duration: parseInt(formData.duration),
        showDuration: formData.show_duration,
        level: formData.level,
        showLevel: formData.show_level,
        status: formData.status,
      };

      const response = await api.updateCourse(
        selectedCourse.id,
        courseData,
        token
      );

      if (response.success) {
        // Refresh the course list
        await refreshCourseList();
        setIsEditModalOpen(false);
        setSelectedCourse(null);
        setError("");
        setSuccessMessage("Course updated successfully!");
        setValidationErrors({});
      } else {
        setError(response.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      setError("Failed to update course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = (course: any) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!token || !courseToDelete) {
      setError("Authentication required or no course selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteCourse(courseToDelete.id, token);

      if (response.success) {
        // Refresh the course list
        await refreshCourseList();
        setError("");
        setSuccessMessage("Course deleted successfully!");
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
      } else {
        setError(response.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const refreshCourseList = async () => {
    if (!token) return;

    // Fetch both courses and modules to ensure we have the latest data
    const [
      updatedCoursesResponse,
      updatedModulesResponse,
      updatedTrainingAreasResponse,
    ] = await Promise.all([
      api.getAllCourses(token),
      api.getAllModules(token),
      api.getAllTrainingAreas(token),
    ]);

    // Update modules and training areas state
    setModules(updatedModulesResponse.data || []);
    setTrainingAreas(updatedTrainingAreasResponse.data || []);

    const transformedCourses =
      updatedCoursesResponse.data?.map((course: any) => {
        // Find the module for this course
        const module = updatedModulesResponse.data?.find(
          (m: any) => m.id === course.moduleId
        );
        // Find the training area for this module
        const trainingArea = module
          ? updatedTrainingAreasResponse.data?.find(
              (ta: any) => ta.id === module.trainingAreaId
            )
          : null;

        return {
          id: course.id,
          name: course.name,
          module_name: module?.name || "N/A",
          training_area_name: trainingArea?.name || "N/A",
          duration: course.duration || 0,
          level: course.level || "beginner",
          status: (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                course.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {course.status === "published" ? "Published" : "Draft"}
            </span>
          ),
          // trainingAreaId: trainingArea?.id, // Keep for filtering
          // moduleId: course.moduleId, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-orange-500 hover:bg-orange-500/10"
                onClick={() => handleEditCourse(course)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteCourse(course)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || [];

    setCourses(transformedCourses);
    setFilteredCourses(transformedCourses);
  };

  // Create Course Form Component - moved outside to prevent re-renders
  const CreateCourseForm = React.memo(() => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      module_id: "",
      image_url: "",
      internal_note: "",
      duration: "",
      show_duration: true,
      level: "beginner",
      show_level: true,
      status: "draft",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateCourse(formData);
      setFormData({
        name: "",
        description: "",
        module_id: "",
        image_url: "",
        internal_note: "",
        duration: "",
        show_duration: true,
        level: "beginner",
        show_level: true,
        status: "draft",
      });
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    const handleFieldChange = (field: string, value: string | boolean) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error for this field when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[#2C2C2C]">
            Course Name *
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
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
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
          <Label htmlFor="module_id" className="text-[#2C2C2C]">
            Module *
          </Label>
          <Select
            value={formData.module_id}
            onValueChange={(value) => handleFieldChange("module_id", value)}
          >
            <SelectTrigger
              className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                validationErrors.module_id
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
            >
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.module_id && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.module_id}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[#2C2C2C]">Image</Label>
          <InsertImage
            onImageInsert={handleImageInsert}
            onClose={() => setShowInsertImage(false)}
            currentImageUrl={formData.image_url}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="internal_note" className="text-[#2C2C2C]">
            Internal Note
          </Label>
          <Input
            id="internal_note"
            value={formData.internal_note}
            onChange={(e) => handleFieldChange("internal_note", e.target.value)}
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showDuration" className="text-[#2C2C2C]">
            Show Duration
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="showDuration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label htmlFor="showDuration" className="text-sm text-[#2C2C2C]">
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        {formData.show_duration && (
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-[#2C2C2C]">
              Duration (minutes) *
            </Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleFieldChange("duration", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.duration
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
              required
            />
            {validationErrors.duration && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.duration}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="showLevel" className="text-[#2C2C2C]">
            Show Level
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="showLevel"
              checked={formData.show_level}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_level: checked })
              }
            />
            <Label htmlFor="showLevel" className="text-sm text-[#2C2C2C]">
              {formData.show_level ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        {formData.show_level && (
          <div className="space-y-2">
            <Label htmlFor="level" className="text-[#2C2C2C]">
              Level *
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleFieldChange("level", value)}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.level ? "border-red-500" : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.level && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.level}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-[#2C2C2C]">
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleFieldChange("status", value)}
          >
            <SelectTrigger
              className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                validationErrors.status ? "border-red-500" : "border-sandstone"
              }`}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (Hidden from users)</SelectItem>
              <SelectItem value="published">
                Published (Visible to users)
              </SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.status && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.status}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.name.trim() ||
              !formData.module_id ||
              !formData.status ||
              (formData.show_duration && !formData.duration.trim()) ||
              (formData.show_level && !formData.level)
            }
            className="rounded-full"
          >
            {isLoading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    );
  });

  // Edit Course Form Component - moved outside to prevent re-renders
  const EditCourseForm = React.memo(() => {
    const [formData, setFormData] = useState({
      name: selectedCourse?.name || "",
      description: selectedCourse?.description || "",
      module_id: selectedCourse?.moduleId?.toString() || "",
      image_url: selectedCourse?.imageUrl || "",
      internal_note: selectedCourse?.internalNote || "",
      duration: selectedCourse?.duration?.toString() || "",
      show_duration: selectedCourse?.showDuration || true,
      level: selectedCourse?.level || "beginner",
      show_level: selectedCourse?.showLevel || true,
      status: selectedCourse?.status || "draft",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    // Update form data when selectedCourse changes
    useEffect(() => {
      if (selectedCourse) {
        setFormData({
          name: selectedCourse.name || "",
          description: selectedCourse.description || "",
          module_id: selectedCourse.moduleId?.toString() || "",
          image_url: selectedCourse.imageUrl || "",
          internal_note: selectedCourse.internalNote || "",
          duration: selectedCourse.duration?.toString() || "",
          show_duration: selectedCourse.showDuration || true,
          level: selectedCourse.level || "beginner",
          show_level: selectedCourse.showLevel || true,
          status: selectedCourse.status || "draft",
        });
      }
    }, [selectedCourse]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateCourse(formData);
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    const handleFieldChange = (field: string, value: string | boolean) => {
      setFormData({ ...formData, [field]: value });
      // Clear validation error for this field when user starts typing
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors({ ...validationErrors, [field]: undefined });
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_name" className="text-[#2C2C2C]">
            Course Name *
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
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
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
          <Label htmlFor="edit_module_id" className="text-[#2C2C2C]">
            Module *
          </Label>
          <Select
            value={formData.module_id}
            onValueChange={(value) => handleFieldChange("module_id", value)}
          >
            <SelectTrigger
              className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                validationErrors.module_id
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
            >
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.module_id && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.module_id}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-[#2C2C2C]">Image</Label>
          <InsertImage
            onImageInsert={handleImageInsert}
            onClose={() => setShowInsertImage(false)}
            currentImageUrl={formData.image_url}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_internal_note" className="text-[#2C2C2C]">
            Internal Note
          </Label>
          <Input
            id="edit_internal_note"
            value={formData.internal_note}
            onChange={(e) => handleFieldChange("internal_note", e.target.value)}
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_showDuration" className="text-[#2C2C2C]">
            Show Duration
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_showDuration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label
              htmlFor="edit_showDuration"
              className="text-sm text-[#2C2C2C]"
            >
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        {formData.show_duration && (
          <div className="space-y-2">
            <Label htmlFor="edit_duration" className="text-[#2C2C2C]">
              Duration (minutes) *
            </Label>
            <Input
              id="edit_duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleFieldChange("duration", e.target.value)}
              className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
                validationErrors.duration
                  ? "border-red-500"
                  : "border-sandstone"
              }`}
              required
            />
            {validationErrors.duration && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.duration}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="edit_showLevel" className="text-[#2C2C2C]">
            Show Level
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_showLevel"
              checked={formData.show_level}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_level: checked })
              }
            />
            <Label htmlFor="edit_showLevel" className="text-sm text-[#2C2C2C]">
              {formData.show_level ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        {formData.show_level && (
          <div className="space-y-2">
            <Label htmlFor="edit_level" className="text-[#2C2C2C]">
              Level *
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleFieldChange("level", value)}
            >
              <SelectTrigger
                className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                  validationErrors.level ? "border-red-500" : "border-sandstone"
                }`}
              >
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.level && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.level}
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="edit_status" className="text-[#2C2C2C]">
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleFieldChange("status", value)}
          >
            <SelectTrigger
              className={`w-full bg-white border-2 text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full ${
                validationErrors.status ? "border-red-500" : "border-sandstone"
              }`}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (Hidden from users)</SelectItem>
              <SelectItem value="published">
                Published (Visible to users)
              </SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.status && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.status}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedCourse(null);
            }}
            className="rounded-full hover:bg-accent/30 hover:text-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.name.trim() ||
              !formData.module_id ||
              !formData.status ||
              (formData.show_duration && !formData.duration.trim()) ||
              (formData.show_level && !formData.level)
            }
            className="rounded-full"
          >
            {isLoading ? "Updating..." : "Update Course"}
          </Button>
        </div>
      </form>
    );
  });

  const columns = [
    "ID",
    "Course",
    "Module",
    "Training Area",
    "Duration (Min)",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout title="Courses" description="Manage your Courses">
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
        searchPlaceholder="Search courses..."
        createButtonText="Create Course"
        createForm={<CreateCourseForm />}
        tableData={filteredCourses}
        columns={columns}
        onSearch={handleSearch}
        enableColumnFiltering={true}
        columnFilterConfig={{
          trainingAreaId: "training_area_name",
          moduleId: "module_name",
        }}
        dropdownConfig={{
          showTrainingArea: true,
          showModule: true,
          showCourse: false,
          showUnit: false,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white border-sandstone text-[#2C2C2C] max-h-[80%]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">Edit Course</DialogTitle>
          </DialogHeader>
          <EditCourseForm />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-white border-sandstone text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">Delete Course</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#2C2C2C]">
              Are you sure you want to delete the course "{courseToDelete?.name}
              "? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCourseToDelete(null);
              }}
              className="rounded-full bg-orange-500/30"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteCourse}
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

export default CoursesPage;
