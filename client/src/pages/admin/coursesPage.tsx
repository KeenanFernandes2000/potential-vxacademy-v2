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
  duration: number;
  level: string;
  actions: React.ReactNode;
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
              duration: course.duration || 0,
              level: course.level || "beginner",
              trainingAreaId: trainingArea?.id, // Keep for filtering
              moduleId: course.moduleId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditCourse(course)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteCourse(course.id)}
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

    try {
      setIsLoading(true);

      // Prepare data for API
      const courseData = {
        moduleId: parseInt(formData.module_id),
        name: formData.name,
        description: formData.description,
        imageUrl: formData.image_url || "",
        internalNote: formData.internal_note || "",
        courseType: formData.course_type,
        duration: parseInt(formData.duration),
        showDuration: formData.show_duration,
        level: formData.level,
        showLevel: formData.show_level,
        estimatedDuration: formData.estimated_duration || null,
        difficultyLevel: formData.difficulty_level,
      };

      const response = await api.createCourse(courseData, token);

      if (response.success) {
        // Refresh the course list
        await refreshCourseList();
        setError("");
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

    try {
      setIsLoading(true);

      // Prepare data for API
      const courseData = {
        moduleId: parseInt(formData.moduleId),
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl || "",
        internalNote: formData.internalNote || "",
        courseType: formData.courseType,
        duration: parseInt(formData.duration),
        showDuration: formData.showDuration === "true",
        level: formData.level,
        showLevel: formData.showLevel === "true",
        estimatedDuration: formData.estimatedDuration || null,
        difficultyLevel: formData.difficultyLevel,
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

  const handleDeleteCourse = async (courseId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteCourse(courseId, token);

      if (response.success) {
        // Refresh the course list
        await refreshCourseList();
        setError("");
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
          (m: any) => m.id === course.module_id
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
          duration: course.duration || 0,
          level: course.level || "beginner",
          trainingAreaId: trainingArea?.id, // Keep for filtering
          moduleId: course.moduleId, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditCourse(course)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteCourse(course.id)}
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

  const CreateCourseForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      module_id: "",
      image_url: "",
      internal_note: "",
      course_type: "free",
      duration: "",
      show_duration: true,
      level: "beginner",
      show_level: true,
      estimated_duration: "",
      difficulty_level: "beginner",
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
        course_type: "free",
        duration: "",
        show_duration: true,
        level: "beginner",
        show_level: true,
        estimated_duration: "",
        difficulty_level: "beginner",
      });
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, image_url: imageUrl });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Course Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="module_id">Module *</Label>
          <select
            id="module_id"
            value={formData.module_id}
            onChange={(e) =>
              setFormData({ ...formData, module_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="">Select a module</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Image</Label>
          <InsertImage
            onImageInsert={handleImageInsert}
            onClose={() => setShowInsertImage(false)}
            currentImageUrl={formData.image_url}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="internal_note">Internal Note</Label>
          <Input
            id="internal_note"
            value={formData.internal_note}
            onChange={(e) =>
              setFormData({ ...formData, internal_note: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course_type">Course Type *</Label>
          <select
            id="course_type"
            value={formData.course_type}
            onChange={(e) =>
              setFormData({ ...formData, course_type: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
            required
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showDuration">Show Duration</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="showDuration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label htmlFor="showDuration" className="text-sm">
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level *</Label>
          <Input
            id="level"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            placeholder="beginner, intermediate, advanced"
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="showLevel">Show Level</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="showLevel"
              checked={formData.show_level}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_level: checked })
              }
            />
            <Label htmlFor="showLevel" className="text-sm">
              {formData.show_level ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
          <Input
            id="estimatedDuration"
            type="number"
            value={formData.estimated_duration}
            onChange={(e) =>
              setFormData({ ...formData, estimated_duration: e.target.value })
            }
            placeholder="e.g., 40"
            className="rounded-full bg-[#00d8cc]/30"
            min="0"
            step="0.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
          <Select
            value={formData.difficulty_level}
            onValueChange={(value) =>
              setFormData({ ...formData, difficulty_level: value })
            }
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    );
  };

  const EditCourseForm = () => {
    const [formData, setFormData] = useState({
      name: selectedCourse?.name || "",
      description: selectedCourse?.description || "",
      moduleId: selectedCourse?.moduleId?.toString() || "",
      imageUrl: selectedCourse?.imageUrl || "",
      internalNote: selectedCourse?.internalNote || "",
      courseType: selectedCourse?.courseType || "",
      duration: selectedCourse?.duration?.toString() || "",
      showDuration: selectedCourse?.showDuration || true,
      level: selectedCourse?.level || "",
      showLevel: selectedCourse?.showLevel || true,
      estimatedDuration: selectedCourse?.estimatedDuration || "",
      difficultyLevel: selectedCourse?.difficultyLevel || "beginner",
    });
    const [showInsertImage, setShowInsertImage] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateCourse(formData);
    };

    const handleImageInsert = (imageUrl: string) => {
      setFormData({ ...formData, imageUrl: imageUrl });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_name">Course Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_moduleId">Module ID *</Label>
          <Input
            id="edit_moduleId"
            type="number"
            value={formData.moduleId}
            onChange={(e) =>
              setFormData({ ...formData, moduleId: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Image</Label>
          <InsertImage
            onImageInsert={handleImageInsert}
            onClose={() => setShowInsertImage(false)}
            currentImageUrl={formData.imageUrl}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_internalNote">Internal Note</Label>
          <Input
            id="edit_internalNote"
            value={formData.internalNote}
            onChange={(e) =>
              setFormData({ ...formData, internalNote: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_courseType">Course Type *</Label>
          <Input
            id="edit_courseType"
            value={formData.courseType}
            onChange={(e) =>
              setFormData({ ...formData, courseType: e.target.value })
            }
            placeholder="free, premium, etc."
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_duration">Duration (minutes) *</Label>
          <Input
            id="edit_duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_showDuration">Show Duration</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_showDuration"
              checked={formData.showDuration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showDuration: checked })
              }
            />
            <Label htmlFor="edit_showDuration" className="text-sm">
              {formData.showDuration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_level">Level *</Label>
          <Input
            id="edit_level"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            placeholder="beginner, intermediate, advanced"
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_showLevel">Show Level</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_showLevel"
              checked={formData.showLevel}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showLevel: checked })
              }
            />
            <Label htmlFor="edit_showLevel" className="text-sm">
              {formData.showLevel ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_estimatedDuration">
            Estimated Duration (hours)
          </Label>
          <Input
            id="edit_estimatedDuration"
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) =>
              setFormData({ ...formData, estimatedDuration: e.target.value })
            }
            placeholder="e.g., 40"
            className="rounded-full bg-[#00d8cc]/30"
            min="0"
            step="0.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_difficultyLevel">Difficulty Level *</Label>
          <Select
            value={formData.difficultyLevel}
            onValueChange={(value) =>
              setFormData({ ...formData, difficultyLevel: value })
            }
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select difficulty level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedCourse(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Course"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "Name",
    "Module Name",
    "Duration",
    "Level",
    "Training Area ID",
    "Module ID",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Courses"
      description="Manage courses and learning programs"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
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
          trainingAreaId: "trainingAreaId",
          moduleId: "moduleId",
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
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Course</DialogTitle>
          </DialogHeader>
          <EditCourseForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default CoursesPage;
