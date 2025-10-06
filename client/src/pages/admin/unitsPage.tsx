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
import { MoreVert, Edit, Delete, Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for unit operations
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

  async createUnit(unitData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(unitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      throw error;
    }
  },

  async createCourseUnit(courseUnitData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/course-units`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseUnitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create course unit relationship:", error);
      throw error;
    }
  },

  async getAllCourseUnits(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/course-units`, {
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
      console.error("Failed to fetch course units:", error);
      throw error;
    }
  },

  async updateCourseUnit(
    courseUnitId: number,
    courseUnitData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/course-units/${courseUnitId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseUnitData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update course unit relationship:", error);
      throw error;
    }
  },

  async deleteCourseUnit(courseUnitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/course-units/${courseUnitId}`,
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
      console.error("Failed to delete course unit relationship:", error);
      throw error;
    }
  },

  async updateUnit(unitId: number, unitData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units/${unitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(unitData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update unit:", error);
      throw error;
    }
  },

  async deleteUnit(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units/${unitId}`, {
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
      console.error("Failed to delete unit:", error);
      throw error;
    }
  },
};

// Type for unit data
interface UnitData
  extends Record<string, string | number | boolean | React.ReactNode> {
  id: number;
  name: string;
  order: number;
  xp_points: number;
  course_name: string;
  module_name: string;
  training_area_name: string;
  courseUnitId: number | null;
  actions: React.ReactNode;
}

// Type for validation errors
interface ValidationErrors {
  name?: string;
  description?: string;
  training_area_id?: string;
  module_id?: string;
  course_id?: string;
  order?: string;
  duration?: string;
  xp_points?: string;
}

const UnitsPage = () => {
  const { token } = useAuth();
  const [units, setUnits] = useState<UnitData[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [courseUnits, setCourseUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<any>(null);

  // Validation function
  const validateForm = (formData: any): boolean => {
    const errors: ValidationErrors = {};

    // Required field validations
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Learning Unit Name is required";
    }

    if (!formData.description || formData.description.trim() === "") {
      errors.description = "Description is required";
    }

    if (!formData.training_area_id || formData.training_area_id === "") {
      errors.training_area_id = "Training Area is required";
    }

    if (!formData.module_id || formData.module_id === "") {
      errors.module_id = "Module is required";
    }

    if (!formData.course_id || formData.course_id === "") {
      errors.course_id = "Course is required";
    }

    if (
      !formData.order ||
      formData.order === "" ||
      parseInt(formData.order) < 1
    ) {
      errors.order = "Order must be a positive number";
    }

    if (
      !formData.duration ||
      formData.duration === "" ||
      parseInt(formData.duration) < 1
    ) {
      errors.duration = "Duration must be a positive number";
    }

    if (
      !formData.xp_points ||
      formData.xp_points === "" ||
      parseInt(formData.xp_points) < 0
    ) {
      errors.xp_points = "VX Points must be a non-negative number";
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

  // Fetch units from database on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [
          unitsResponse,
          coursesResponse,
          modulesResponse,
          trainingAreasResponse,
          courseUnitsResponse,
        ] = await Promise.all([
          api.getAllUnits(token),
          api.getAllCourses(token),
          api.getAllModules(token),
          api.getAllTrainingAreas(token),
          api.getAllCourseUnits(token),
        ]);

        setCourses(coursesResponse.data || []);
        setModules(modulesResponse.data || []);
        setTrainingAreas(trainingAreasResponse.data || []);
        setCourseUnits(courseUnitsResponse.data || []);

        // Transform data to match our display format
        const transformedUnits =
          unitsResponse.data?.map((unit: any) => {
            // Find the course-unit relationship for this unit
            const courseUnit = courseUnitsResponse.data?.find(
              (cu: any) => cu.unitId === unit.id
            );
            const course = courseUnit
              ? coursesResponse.data?.find(
                  (c: any) => c.id === courseUnit.courseId
                )
              : null;
            const module = course
              ? modulesResponse.data?.find((m: any) => m.id === course.moduleId)
              : null;
            const trainingArea = module
              ? trainingAreasResponse.data?.find(
                  (ta: any) => ta.id === module.trainingAreaId
                )
              : null;

            return {
              id: unit.id,
              order: unit.order || 1,
              name: unit.name,
              // xp_points: unit.xp_points || 100,
              course_name: course?.name || "N/A",
              module_name: module?.name || "N/A",
              training_area_name: trainingArea?.name || "N/A",
              // courseUnitId: courseUnit?.id || null, // Keep for editing
              // trainingAreaId: trainingArea?.id, // Keep for filtering
              // moduleId: module?.id, // Keep for filtering
              // courseId: course?.id, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditUnit(unit)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteUnit(unit)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || [];

        setUnits(transformedUnits);
        setFilteredUnits(transformedUnits);
        setError("");
      } catch (error) {
        console.error("Error fetching units:", error);
        setError("Failed to load units. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter((unit) =>
        unit.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  };

  const handleCreateUnit = async (formData: any) => {
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

      // Step 1: Create unit without course_id
      const unitData = {
        name: formData.name,
        description: formData.description || null,
        internal_note: formData.internal_note || null,
        order: parseInt(formData.order),
        duration: parseInt(formData.duration),
        show_duration: formData.show_duration,
        xp_points: parseInt(formData.xp_points),
      };

      const unitResponse = await api.createUnit(unitData, token);

      if (unitResponse.success && unitResponse.data?.id) {
        // Step 2: Create course-unit relationship
        const courseUnitData = {
          courseId: parseInt(formData.course_id),
          unitId: unitResponse.data.id,
          order: parseInt(formData.order),
        };

        const courseUnitResponse = await api.createCourseUnit(
          courseUnitData,
          token
        );

        if (courseUnitResponse.success) {
          // Refresh the unit list
          await refreshUnitList();
          setError("");
          showSuccessMessage("Learning Unit created successfully!");
        } else {
          // Check if the error is about relationship already existing
          if (
            courseUnitResponse.message &&
            courseUnitResponse.message.includes("already exists")
          ) {
            // This is not a critical error - the unit was created successfully
            console.log(
              "Course-unit relationship already exists, continuing..."
            );
            await refreshUnitList();
            setError("");
            showSuccessMessage("Learning Unit created successfully!");
          } else {
            setError(
              courseUnitResponse.message ||
                "Failed to create course-unit relationship"
            );
          }
        }
      } else {
        setError(unitResponse.message || "Failed to create unit");
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      setError("Failed to create unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUnit = async (formData: any) => {
    if (!token || !selectedUnit) {
      setError("Authentication required or no unit selected");
      return;
    }

    // Validate form before submission
    if (!validateForm(formData)) {
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Update unit without course_id
      const unitData = {
        name: formData.name,
        description: formData.description || null,
        internal_note: formData.internal_note || null,
        order: parseInt(formData.order),
        duration: parseInt(formData.duration),
        show_duration: formData.show_duration,
        xp_points: parseInt(formData.xp_points),
      };

      const unitResponse = await api.updateUnit(
        selectedUnit.id,
        unitData,
        token
      );

      if (unitResponse.success) {
        // Refresh the unit list
        await refreshUnitList();
        setIsEditModalOpen(false);
        setSelectedUnit(null);
        setError("");
        showSuccessMessage("Learning Unit updated successfully!");
      } else {
        setError(unitResponse.message || "Failed to update unit");
      }
    } catch (error) {
      console.error("Error updating unit:", error);
      setError("Failed to update unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = (unit: any) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUnit = async () => {
    if (!token || !unitToDelete) {
      setError("Authentication required or no unit selected");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Delete course-unit relationship if it exists
      if (unitToDelete.courseUnitId) {
        const courseUnitResponse = await api.deleteCourseUnit(
          unitToDelete.courseUnitId,
          token
        );
        if (!courseUnitResponse.success) {
          setError(
            courseUnitResponse.message ||
              "Failed to delete course-unit relationship"
          );
          return;
        }
      }

      // Step 2: Delete the unit
      const response = await api.deleteUnit(unitToDelete.id, token);

      if (response.success) {
        // Refresh the unit list
        await refreshUnitList();
        setError("");
        showSuccessMessage("Learning Unit deleted successfully!");
      } else {
        setError(response.message || "Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      setError("Failed to delete unit. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setUnitToDelete(null);
    }
  };

  const handleEditUnit = (unit: any) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const refreshUnitList = async () => {
    if (!token) return;
    const [
      unitsResponse,
      coursesResponse,
      modulesResponse,
      trainingAreasResponse,
      courseUnitsResponse,
    ] = await Promise.all([
      api.getAllUnits(token),
      api.getAllCourses(token),
      api.getAllModules(token),
      api.getAllTrainingAreas(token),
      api.getAllCourseUnits(token),
    ]);

    setCourses(coursesResponse.data || []);
    setModules(modulesResponse.data || []);
    setTrainingAreas(trainingAreasResponse.data || []);
    setCourseUnits(courseUnitsResponse.data || []);

    const transformedUnits =
      unitsResponse.data?.map((unit: any) => {
        // Find the course-unit relationship for this unit
        const courseUnit = courseUnitsResponse.data?.find(
          (cu: any) => cu.unitId === unit.id
        );
        const course = courseUnit
          ? coursesResponse.data?.find((c: any) => c.id === courseUnit.courseId)
          : null;
        const module = course
          ? modulesResponse.data?.find((m: any) => m.id === course.moduleId)
          : null;
        const trainingArea = module
          ? trainingAreasResponse.data?.find(
              (ta: any) => ta.id === module.trainingAreaId
            )
          : null;

        return {
          id: unit.id,
          order: unit.order || 1,
          name: unit.name,
          // xp_points: unit.xp_points || 100,
          course_name: course?.name || "N/A",
          module_name: module?.name || "N/A",
          training_area_name: trainingArea?.name || "N/A",
          // courseUnitId: courseUnit?.id || null, // Keep for editing
          // trainingAreaId: trainingArea?.id, // Keep for filtering
          // moduleId: module?.id, // Keep for filtering
          // courseId: course?.id, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditUnit(unit)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteUnit(unit)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || [];

    setUnits(transformedUnits);
    setFilteredUnits(transformedUnits);
  };

  const CreateUnitForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      training_area_id: "",
      module_id: "",
      course_id: "",
      description: "",
      internal_note: "",
      order: "1",
      duration: "30",
      show_duration: true,
      xp_points: "100",
    });
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

    // Filter modules based on selected training area
    useEffect(() => {
      if (formData.training_area_id) {
        const filtered = modules.filter(
          (module) =>
            module.trainingAreaId === parseInt(formData.training_area_id)
        );
        setFilteredModules(filtered);
        // Reset module and course selections
        setFormData((prev) => ({ ...prev, module_id: "", course_id: "" }));
      } else {
        setFilteredModules([]);
        setFormData((prev) => ({ ...prev, module_id: "", course_id: "" }));
      }
    }, [formData.training_area_id, modules]);

    // Filter courses based on selected module
    useEffect(() => {
      if (formData.module_id) {
        const filtered = courses.filter(
          (course) => course.moduleId === parseInt(formData.module_id)
        );
        setFilteredCourses(filtered);
        // Reset course selection
        setFormData((prev) => ({ ...prev, course_id: "" }));
      } else {
        setFilteredCourses([]);
        setFormData((prev) => ({ ...prev, course_id: "" }));
      }
    }, [formData.module_id, courses]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateUnit(formData);
      setFormData({
        name: "",
        training_area_id: "",
        module_id: "",
        course_id: "",
        description: "",
        internal_note: "",
        order: "1",
        duration: "30",
        show_duration: true,
        xp_points: "100",
      });
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
      <form
        onSubmit={handleSubmit}
        className="space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Learning Unit Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.name ? "border-red-500" : "border-sandstone"
            }`}
            placeholder="Type your Learning Unit name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm">{validationErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.description
                ? "border-red-500"
                : "border-sandstone"
            }`}
            placeholder="Add a description"
            required
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm">
              {validationErrors.description}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="training_area_id">Training Area *</Label>
          <Select
            value={formData.training_area_id}
            onValueChange={(value) =>
              handleFieldChange("training_area_id", value)
            }
          >
            <SelectTrigger
              className={`rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C] ${
                validationErrors.training_area_id ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select a training area" />
            </SelectTrigger>
            <SelectContent>
              {trainingAreas.map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.training_area_id && (
            <p className="text-red-500 text-sm">
              {validationErrors.training_area_id}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="module_id">Module *</Label>
          <Select
            value={formData.module_id}
            onValueChange={(value) => handleFieldChange("module_id", value)}
            disabled={!formData.training_area_id}
          >
            <SelectTrigger
              className={`rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C] ${
                validationErrors.module_id ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {filteredModules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.module_id && (
            <p className="text-red-500 text-sm">{validationErrors.module_id}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="course_id">Course *</Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) => handleFieldChange("course_id", value)}
            disabled={!formData.module_id}
          >
            <SelectTrigger
              className={`rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C] ${
                validationErrors.course_id ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.course_id && (
            <p className="text-red-500 text-sm">{validationErrors.course_id}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="internal_note">Internal Note</Label>
          <Input
            id="internal_note"
            value={formData.internal_note}
            onChange={(e) =>
              setFormData({ ...formData, internal_note: e.target.value })
            }
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order in Course *</Label>
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
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleFieldChange("duration", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.duration ? "border-red-500" : "border-sandstone"
            }`}
            min="1"
            required
          />
          {validationErrors.duration && (
            <p className="text-red-500 text-sm">{validationErrors.duration}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="show_duration">Show Duration</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="show_duration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label htmlFor="show_duration" className="text-sm">
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="xp_points">VX Points *</Label>
          <Input
            id="xp_points"
            type="number"
            value={formData.xp_points}
            onChange={(e) => handleFieldChange("xp_points", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.xp_points ? "border-red-500" : "border-sandstone"
            }`}
            min="0"
            required
          />
          {validationErrors.xp_points && (
            <p className="text-red-500 text-sm">{validationErrors.xp_points}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.name ||
              !formData.description ||
              !formData.training_area_id ||
              !formData.module_id ||
              !formData.course_id ||
              !formData.order ||
              !formData.duration ||
              !formData.xp_points
            }
            className="rounded-full"
          >
            {isLoading ? "Creating..." : "Create Unit"}
          </Button>
        </div>
      </form>
    );
  };

  const EditUnitForm = () => {
    // Find the course-unit relationship for this unit
    const courseUnit = selectedUnit
      ? courseUnits.find((cu: any) => cu.unitId === selectedUnit.id)
      : null;
    const currentCourseId = courseUnit ? courseUnit.courseId : null;
    const currentCourse = currentCourseId
      ? courses.find((c: any) => c.id === currentCourseId)
      : null;
    const currentModule = currentCourse
      ? modules.find((m: any) => m.id === currentCourse.moduleId)
      : null;
    const currentTrainingArea = currentModule
      ? trainingAreas.find((ta: any) => ta.id === currentModule.trainingAreaId)
      : null;

    const [formData, setFormData] = useState({
      name: selectedUnit?.name || "",
      training_area_id: currentTrainingArea?.id?.toString() || "",
      module_id: currentModule?.id?.toString() || "",
      course_id: currentCourseId?.toString() || "",
      description: selectedUnit?.description || "",
      internal_note: selectedUnit?.internal_note || "",
      order: selectedUnit?.order?.toString() || "1",
      duration: selectedUnit?.duration?.toString() || "30",
      show_duration: selectedUnit?.show_duration || true,
      xp_points: selectedUnit?.xp_points?.toString() || "100",
    });
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateUnit(formData);
    };

    const handleFieldChange = (field: string, value: string) => {
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
            Learning Unit Name *
          </Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.name ? "border-red-500" : "border-sandstone"
            }`}
            placeholder="Type your Learning Unit name"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm">{validationErrors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_description" className="text-[#2C2C2C]">
            Description *
          </Label>
          <Input
            id="edit_description"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className={`bg-white text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full ${
              validationErrors.description
                ? "border-red-500"
                : "border-sandstone"
            }`}
            placeholder="Add a description"
            required
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm">
              {validationErrors.description}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_training_area_id" className="text-[#2C2C2C]">
            Training Area *
          </Label>
          <Select
            value={formData.training_area_id}
            onValueChange={(value) =>
              handleFieldChange("training_area_id", value)
            }
          >
            <SelectTrigger
              className={`rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C] ${
                validationErrors.training_area_id ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select a training area" />
            </SelectTrigger>
            <SelectContent>
              {trainingAreas.map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.training_area_id && (
            <p className="text-red-500 text-sm">
              {validationErrors.training_area_id}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_module_id" className="text-[#2C2C2C]">
            Module *
          </Label>
          <Select
            value={formData.module_id}
            onValueChange={(value) =>
              setFormData({ ...formData, module_id: value })
            }
            disabled={!formData.training_area_id}
          >
            <SelectTrigger className="rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C]">
              <SelectValue placeholder="Select a module" />
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
          <Label htmlFor="edit_course_id" className="text-[#2C2C2C]">
            Course *
          </Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) =>
              setFormData({ ...formData, course_id: value })
            }
            disabled={!formData.module_id}
          >
            <SelectTrigger className="rounded-full w-full hover:bg-accent/30 hover:text-black text-[#2C2C2C]">
              <SelectValue placeholder="Select a course" />
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
          <Label htmlFor="edit_internal_note" className="text-[#2C2C2C]">
            Internal Note
          </Label>
          <Input
            id="edit_internal_note"
            value={formData.internal_note}
            onChange={(e) =>
              setFormData({ ...formData, internal_note: e.target.value })
            }
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_order" className="text-[#2C2C2C]">
            Order in Course *
          </Label>
          <Input
            id="edit_order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_duration" className="text-[#2C2C2C]">
            Duration (minutes) *
          </Label>
          <Input
            id="edit_duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_show_duration" className="text-[#2C2C2C]">
            Show Duration
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_show_duration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label
              htmlFor="edit_show_duration"
              className="text-sm text-[#2C2C2C]"
            >
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_xp_points" className="text-[#2C2C2C]">
            VX Points *
          </Label>
          <Input
            id="edit_xp_points"
            type="number"
            value={formData.xp_points}
            onChange={(e) =>
              setFormData({ ...formData, xp_points: e.target.value })
            }
            className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
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
              setSelectedUnit(null);
            }}
            className="rounded-full hover:bg-accent/30 text-black"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Unit"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "Order",
    "Learning Unit",
    "Course",
    "Module",
    "Training Area",
    // "VX Points",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Learning Units"
      description="Manage your Learning Units"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
          {successMessage}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search by name"
        createButtonText="Create Learning Unit"
        createForm={<CreateUnitForm />}
        tableData={filteredUnits}
        columns={columns}
        onSearch={handleSearch}
        enableColumnFiltering={true}
        columnFilterConfig={{
          trainingAreaId: "training_area_name",
          moduleId: "module_name",
          courseId: "course_name",
        }}
        dropdownConfig={{
          showTrainingArea: true,
          showModule: true,
          showCourse: true,
          showUnit: false,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground max-h-[80%]">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Edit Learning Unit
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
            <EditUnitForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md bg-card border-border text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Delete Learning Unit
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
              Are you sure you want to delete the learning unit "
              {unitToDelete?.name}"? This action cannot be undone.
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
                onClick={confirmDeleteUnit}
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

export default UnitsPage;
