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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { Delete, Assignment, Close } from "@mui/icons-material";

// API object for learning path operations
const api = {
  async getAllLearningPaths(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/unit-role-assignments`,
        {
          method: "GET",
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
      console.error("Failed to fetch learning paths:", error);
      throw error;
    }
  },

  async getAllRoleCategories(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/role-categories`, {
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
      console.error("Failed to fetch role categories:", error);
      throw error;
    }
  },

  async createLearningPath(learningPathData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/unit-role-assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create learning path:", error);
      throw error;
    }
  },

  async updateLearningPath(
    learningPathId: number,
    learningPathData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/unit-role-assignments/${learningPathId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update learning path:", error);
      throw error;
    }
  },

  async deleteLearningPath(learningPathId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/unit-role-assignments/${learningPathId}`,
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
      console.error("Failed to delete learning path:", error);
      throw error;
    }
  },

  // Training-related API functions
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

  // Seniority and Assets API functions
  async getAllSeniorityLevels(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/seniority-levels`, {
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
      console.error("Failed to fetch seniority levels:", error);
      throw error;
    }
  },

  async getAllAssets(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/assets`, {
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
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  },
};

// Type for learning path data
interface LearningPathData
  extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  assetName: string;
  seniorityName: string;
  actions: React.ReactNode;
}

const LearningPathsPage = () => {
  const { token } = useAuth();
  const [learningPaths, setLearningPaths] = useState<LearningPathData[]>([]);
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPathData[]
  >([]);
  const [roleCategories, setRoleCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Success message display function
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessMessage("");
    }, 3000);
  };

  // Modal and assignment-related state
  const [isAssignUnitsModalOpen, setIsAssignUnitsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [courseUnits, setCourseUnits] = useState<any[]>([]);
  const [seniorityLevels, setSeniorityLevels] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<Set<number>>(new Set());
  const [existingUnits, setExistingUnits] = useState<any[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<any[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    trainingAreaId: "",
    moduleId: "",
    courseId: "",
    seniorityId: "",
    assetId: "",
  });

  // Table filter state
  const [tableFilters, setTableFilters] = useState({
    assetId: "",
    roleCategoryId: "",
  });

  // Ensure no duplicates between existing and available units whenever existing units change
  useEffect(() => {
    if (existingUnits.length > 0 && filteredUnits.length > 0) {
      const existingUnitIds = existingUnits.map((unit: any) => unit.id);
      const hasDuplicates = filteredUnits.some((unit: any) =>
        existingUnitIds.includes(unit.id)
      );

      if (hasDuplicates) {
        const availableUnits = filteredUnits.filter(
          (unit: any) => !existingUnitIds.includes(unit.id)
        );
        setFilteredUnits(availableUnits);
      }
    }
  }, [existingUnits]);

  // Fetch learning paths and role categories from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [
          learningPathsResponse,
          categoriesResponse,
          assetsResponse,
          seniorityResponse,
        ] = await Promise.all([
          api.getAllLearningPaths(token),
          api.getAllRoleCategories(token),
          api.getAllAssets(token),
          api.getAllSeniorityLevels(token),
        ]);

        setRoleCategories(categoriesResponse.data || []);
        setAssets(assetsResponse.data || []);
        setSeniorityLevels(seniorityResponse.data || []);

        // Create maps for quick lookup
        const categoryMap = new Map();
        const assetMap = new Map();
        const seniorityMap = new Map();

        categoriesResponse.data?.forEach((cat: any) => {
          categoryMap.set(cat.id, cat.name);
        });

        assetsResponse.data?.forEach((asset: any) => {
          assetMap.set(asset.id, asset.name);
        });

        seniorityResponse.data?.forEach((seniority: any) => {
          seniorityMap.set(seniority.id, seniority.name);
        });

        // Transform data to match our display format
        const transformedLearningPaths =
          learningPathsResponse.data?.map((learningPath: any) => ({
            id: learningPath.id,
            name: learningPath.roleName || learningPath.name,
            assetName: assetMap.get(learningPath.assetId) || "Unknown",
            categoryName:
              categoryMap.get(learningPath.roleCategoryId) || "Unknown",
            seniorityName:
              seniorityMap.get(learningPath.seniorityLevelId) || "Unknown",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-orange-500 hover:bg-orange-500/10"
                  onClick={() => handleAssignUnits(learningPath)}
                  title="Assign Units"
                >
                  <Assignment sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteLearningPath(learningPath.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setLearningPaths(transformedLearningPaths);
        setFilteredLearningPaths(transformedLearningPaths);
        setError("");
      } catch (error) {
        console.error("Error fetching learning paths:", error);
        setError("Failed to load learning paths. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (query: string) => {
    applyTableFilters(query, tableFilters);
  };

  const applyTableFilters = (
    searchQuery: string = "",
    filtersToApply = tableFilters
  ) => {
    let filtered = learningPaths;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (learningPath) =>
          learningPath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          learningPath.categoryName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (learningPath.assetName &&
            learningPath.assetName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (learningPath.seniorityName &&
            learningPath.seniorityName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Apply asset filter
    if (filtersToApply.assetId) {
      filtered = filtered.filter(
        (learningPath) =>
          learningPath.assetName ===
          assets.find((asset) => asset.id.toString() === filtersToApply.assetId)
            ?.name
      );
    }

    // Apply role category filter
    if (filtersToApply.roleCategoryId) {
      filtered = filtered.filter(
        (learningPath) =>
          learningPath.categoryName ===
          roleCategories.find(
            (cat) => cat.id.toString() === filtersToApply.roleCategoryId
          )?.name
      );
    }

    setFilteredLearningPaths(filtered);
  };

  const handleTableFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...tableFilters, [filterType]: value };
    setTableFilters(newFilters);
    applyTableFilters("", newFilters);
  };

  const handleCreateLearningPath = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const learningPathData = {
        name: formData.name,
        unitIds: [], // Empty array by default, can be populated later
        roleCategoryId: formData.roleCategoriesId
          ? parseInt(formData.roleCategoriesId)
          : null,
        seniorityLevelId: formData.seniorityLevelId
          ? parseInt(formData.seniorityLevelId)
          : null,
        assetId: formData.assetsId ? parseInt(formData.assetsId) : null,
      };

      const response = await api.createLearningPath(learningPathData, token);

      if (response.success) {
        // Refresh the learning path list
        await refreshLearningPathList();
        setError("");
        showSuccess("Learning Path created successfully!");
      } else {
        setError(response.message || "Failed to create learning path");
      }
    } catch (error) {
      console.error("Error creating learning path:", error);
      setError("Failed to create learning path. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLearningPath = async (learningPathId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this learning path?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteLearningPath(learningPathId, token);

      if (response.success) {
        // Refresh the learning path list
        await refreshLearningPathList();
        setError("");
      } else {
        setError(response.message || "Failed to delete learning path");
      }
    } catch (error) {
      console.error("Error deleting learning path:", error);
      setError("Failed to delete learning path. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLearningPathList = async () => {
    if (!token) return;
    const [
      learningPathsResponse,
      categoriesResponse,
      assetsResponse,
      seniorityResponse,
    ] = await Promise.all([
      api.getAllLearningPaths(token),
      api.getAllRoleCategories(token),
      api.getAllAssets(token),
      api.getAllSeniorityLevels(token),
    ]);

    // Create maps for quick lookup
    const categoryMap = new Map();
    const assetMap = new Map();
    const seniorityMap = new Map();

    categoriesResponse.data?.forEach((cat: any) => {
      categoryMap.set(cat.id, cat.name);
    });

    assetsResponse.data?.forEach((asset: any) => {
      assetMap.set(asset.id, asset.name);
    });

    seniorityResponse.data?.forEach((seniority: any) => {
      seniorityMap.set(seniority.id, seniority.name);
    });

    // Update the dropdown data
    setAssets(assetsResponse.data || []);
    setSeniorityLevels(seniorityResponse.data || []);

    const transformedLearningPaths =
      learningPathsResponse.data?.map((learningPath: any) => ({
        id: learningPath.id,
        name: learningPath.roleName || learningPath.name,
        assetName: assetMap.get(learningPath.assetId) || "Unknown",
        categoryName: categoryMap.get(learningPath.roleCategoryId) || "Unknown",
        seniorityName:
          seniorityMap.get(learningPath.seniorityLevelId) || "Unknown",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleAssignUnits(learningPath)}
              title="Assign Units"
            >
              <Assignment sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteLearningPath(learningPath.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setLearningPaths(transformedLearningPaths);
    setFilteredLearningPaths(transformedLearningPaths);
  };

  // Reset modal state
  const resetModalState = () => {
    setSelectedRole(null);
    setFilters({
      trainingAreaId: "",
      moduleId: "",
      courseId: "",
      seniorityId: "",
      assetId: "",
    });
    setSelectedUnits(new Set());
    setFilteredUnits([]);
    setTrainingAreas([]);
    setModules([]);
    setCourses([]);
    setUnits([]);
    setCourseUnits([]);
    setExistingUnits([]);
  };

  // Fetch existing assignments and filter units
  const fetchExistingAssignments = async (currentFilters = filters) => {
    if (!selectedRole) return;

    try {
      console.log("Getting existing units from learning path:", selectedRole);

      // Get existing unit IDs from the selected learning path
      const existingUnitIds = selectedRole.unitIds || [];

      // Get unit details for existing assignments
      const assignedUnits = units.filter((unit) =>
        existingUnitIds.includes(unit.id)
      );

      // Transform the assigned units to include related information
      const transformedAssignedUnits = transformUnitsData(
        assignedUnits,
        courseUnits,
        courses,
        modules,
        trainingAreas
      );

      setExistingUnits(transformedAssignedUnits);

      // Refresh the available units to exclude the newly updated existing units
      applyFiltersToUnits(currentFilters);
    } catch (error) {
      console.error("Error fetching existing assignments:", error);
      setExistingUnits([]);
    }
  };

  // Handle opening the Assign Units modal
  const handleAssignUnits = async (role: any) => {
    // Reset state first
    resetModalState();
    setSelectedRole(role);
    setIsAssignUnitsModalOpen(true);

    // Fetch all necessary data for the modal
    try {
      const [
        trainingAreasResponse,
        modulesResponse,
        coursesResponse,
        unitsResponse,
        courseUnitsResponse,
        seniorityResponse,
        assetsResponse,
      ] = await Promise.all([
        api.getAllTrainingAreas(token!),
        api.getAllModules(token!),
        api.getAllCourses(token!),
        api.getAllUnits(token!),
        api.getAllCourseUnits(token!),
        api.getAllSeniorityLevels(token!),
        api.getAllAssets(token!),
      ]);

      setTrainingAreas(trainingAreasResponse.data || []);
      setModules(modulesResponse.data || []);
      setCourses(coursesResponse.data || []);
      setUnits(unitsResponse.data || []);
      setCourseUnits(courseUnitsResponse.data || []);
      setSeniorityLevels(seniorityResponse.data || []);
      setAssets(assetsResponse.data || []);

      // First, load existing units from the selected role's unitIds
      const existingUnitIds = role.unitIds || [];
      const assignedUnits = (unitsResponse.data || []).filter((unit: any) =>
        existingUnitIds.includes(unit.id)
      );

      // Transform the assigned units to include related information
      const transformedAssignedUnits = transformUnitsData(
        assignedUnits,
        courseUnitsResponse.data || [],
        coursesResponse.data || [],
        modulesResponse.data || [],
        trainingAreasResponse.data || []
      );

      setExistingUnits(transformedAssignedUnits);

      // Transform all units and then filter out existing ones
      const allTransformedUnits = transformUnitsData(
        unitsResponse.data || [],
        courseUnitsResponse.data || [],
        coursesResponse.data || [],
        modulesResponse.data || [],
        trainingAreasResponse.data || []
      );

      // Filter out units that are already assigned
      const availableUnits = allTransformedUnits.filter(
        (unit: any) => !existingUnitIds.includes(unit.id)
      );

      setFilteredUnits(availableUnits);
    } catch (error) {
      console.error("Error fetching data for assign units modal:", error);
      setError("Failed to load data for unit assignment");
    }
  };

  // Transform units data to include related information
  const transformUnitsData = (
    units: any[],
    courseUnits: any[],
    courses: any[],
    modules: any[],
    trainingAreas: any[]
  ) => {
    return units.map((unit: any) => {
      const courseUnit = courseUnits.find((cu: any) => cu.unitId === unit.id);
      const course = courseUnit
        ? courses.find((c: any) => c.id === courseUnit.courseId)
        : null;
      const module = course
        ? modules.find((m: any) => m.id === course.moduleId)
        : null;
      const trainingArea = module
        ? trainingAreas.find((ta: any) => ta.id === module.trainingAreaId)
        : null;

      return {
        id: unit.id,
        name: unit.name,
        order: unit.order || 1,
        xp_points: unit.xp_points || 100,
        trainingAreaId: trainingArea?.id,
        trainingAreaName: trainingArea?.name,
        moduleId: module?.id,
        moduleName: module?.name,
        courseId: course?.id,
        courseName: course?.name,
      };
    });
  };

  // Handle filter changes
  const handleFilterChange = async (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    // Reset dependent filters
    if (filterType === "trainingAreaId") {
      newFilters.moduleId = "";
      newFilters.courseId = "";
    } else if (filterType === "moduleId") {
      newFilters.courseId = "";
    }

    // Apply filters to both existing and available units
    applyFiltersToUnits(newFilters);
    applyFiltersToExistingUnits(newFilters);
  };

  // Apply filters to existing units
  const applyFiltersToExistingUnits = (currentFilters: any) => {
    if (!selectedRole) return;

    // Get existing unit IDs from the selected learning path
    const existingUnitIds = selectedRole.unitIds || [];

    // Get unit details for existing assignments
    const assignedUnits = units.filter((unit) =>
      existingUnitIds.includes(unit.id)
    );

    // Apply the same filtering logic as available units
    let filtered = assignedUnits;

    if (currentFilters.trainingAreaId) {
      const filteredModules = modules.filter(
        (m: any) => m.trainingAreaId === parseInt(currentFilters.trainingAreaId)
      );
      const filteredCourses = courses.filter((c: any) =>
        filteredModules.some((m: any) => m.id === c.moduleId)
      );
      const filteredCourseUnits = courseUnits.filter((cu: any) =>
        filteredCourses.some((c: any) => c.id === cu.courseId)
      );
      filtered = filtered.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    if (currentFilters.moduleId) {
      const filteredCourses = courses.filter(
        (c: any) => c.moduleId === parseInt(currentFilters.moduleId)
      );
      const filteredCourseUnits = courseUnits.filter((cu: any) =>
        filteredCourses.some((c: any) => c.id === cu.courseId)
      );
      filtered = filtered.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    if (currentFilters.courseId) {
      const filteredCourseUnits = courseUnits.filter(
        (cu: any) => cu.courseId === parseInt(currentFilters.courseId)
      );
      filtered = filtered.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    // Transform the filtered existing units
    const transformedExistingUnits = transformUnitsData(
      filtered,
      courseUnits,
      courses,
      modules,
      trainingAreas
    );

    setExistingUnits(transformedExistingUnits);
  };

  // Apply filters to units
  const applyFiltersToUnits = (currentFilters: any) => {
    let filtered = units;

    if (currentFilters.trainingAreaId) {
      const filteredModules = modules.filter(
        (m: any) => m.trainingAreaId === parseInt(currentFilters.trainingAreaId)
      );
      const filteredCourses = courses.filter((c: any) =>
        filteredModules.some((m: any) => m.id === c.moduleId)
      );
      const filteredCourseUnits = courseUnits.filter((cu: any) =>
        filteredCourses.some((c: any) => c.id === cu.courseId)
      );
      filtered = units.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    if (currentFilters.moduleId) {
      const filteredCourses = courses.filter(
        (c: any) => c.moduleId === parseInt(currentFilters.moduleId)
      );
      const filteredCourseUnits = courseUnits.filter((cu: any) =>
        filteredCourses.some((c: any) => c.id === cu.courseId)
      );
      filtered = filtered.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    if (currentFilters.courseId) {
      const filteredCourseUnits = courseUnits.filter(
        (cu: any) => cu.courseId === parseInt(currentFilters.courseId)
      );
      filtered = filtered.filter((u: any) =>
        filteredCourseUnits.some((cu: any) => cu.unitId === u.id)
      );
    }

    // Transform the filtered units
    const transformedFiltered = transformUnitsData(
      filtered,
      courseUnits,
      courses,
      modules,
      trainingAreas
    );

    // Filter out units that are already in existing units
    const existingUnitIds = existingUnits.map((unit: any) => unit.id);
    const availableUnits = transformedFiltered.filter(
      (unit: any) => !existingUnitIds.includes(unit.id)
    );

    setFilteredUnits(availableUnits);
  };

  // Get filtered options for dependent dropdowns
  const getFilteredModules = () => {
    if (!filters.trainingAreaId) return modules;
    return modules.filter(
      (m: any) => m.trainingAreaId === parseInt(filters.trainingAreaId)
    );
  };

  const getFilteredCourses = () => {
    if (!filters.moduleId) {
      if (!filters.trainingAreaId) return courses;
      const filteredModules = getFilteredModules();
      return courses.filter((c: any) =>
        filteredModules.some((m: any) => m.id === c.moduleId)
      );
    }
    return courses.filter(
      (c: any) => c.moduleId === parseInt(filters.moduleId)
    );
  };

  // Handle unit selection
  const handleUnitSelection = (unitId: number, isSelected: boolean) => {
    const newSelectedUnits = new Set(selectedUnits);
    if (isSelected) {
      newSelectedUnits.add(unitId);
    } else {
      newSelectedUnits.delete(unitId);
    }
    setSelectedUnits(newSelectedUnits);
  };

  // Handle select all units
  const handleSelectAllUnits = (isSelected: boolean) => {
    if (isSelected) {
      const allUnitIds = new Set(filteredUnits.map((unit) => unit.id));
      setSelectedUnits(allUnitIds);
    } else {
      setSelectedUnits(new Set());
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsAssignUnitsModalOpen(false);
    resetModalState();
  };

  // Handle assign units submission
  const handleAssignUnitsSubmit = async () => {
    if (!token || !selectedRole) {
      setError("Missing required data");
      return;
    }

    try {
      setIsLoading(true);

      // Get current unitIds from the selected learning path
      const currentUnitIds = selectedRole.unitIds || [];

      // Combine existing units with newly selected units
      const allUnitIds = Array.from(
        new Set([...currentUnitIds, ...Array.from(selectedUnits)])
      );

      // Prepare update data
      const updateData = {
        name: selectedRole.name,
        unitIds: allUnitIds,
        roleCategoryId: selectedRole.roleCategoryId,
        seniorityLevelId: selectedRole.seniorityLevelId,
        assetId: selectedRole.assetId,
      };

      const response = await api.updateLearningPath(
        selectedRole.id,
        updateData,
        token
      );

      if (response.success) {
        // Update the selectedRole with the new unitIds
        setSelectedRole({
          ...selectedRole,
          unitIds: allUnitIds,
        });

        // Show success message
        setError("");
        alert(
          `Successfully updated learning path "${selectedRole.name}" with ${selectedUnits.size} new unit(s)`
        );

        // Refresh the learning path list to show updated data
        await refreshLearningPathList();

        // Clear selected units and close modal
        setSelectedUnits(new Set());
        handleModalClose();
      } else {
        setError(response.message || "Failed to update learning path");
      }
    } catch (error: any) {
      console.error("Error updating learning path:", error);

      // Handle validation errors
      if (error.message && error.message.includes("409")) {
        setError(
          "A learning path with this name and combination already exists"
        );
      } else if (error.message && error.message.includes("400")) {
        setError("Invalid data provided. Please check your inputs.");
      } else {
        setError("Failed to update learning path. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (unitId: number, unitName: string) => {
    if (!token || !selectedRole) {
      setError("Authentication required");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove "${unitName}" from this learning path?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      // Get current unitIds and remove the specified unit
      const currentUnitIds = selectedRole.unitIds || [];
      const updatedUnitIds = currentUnitIds.filter(
        (id: number) => id !== unitId
      );

      // Prepare update data
      const updateData = {
        name: selectedRole.name,
        unitIds: updatedUnitIds,
        roleCategoryId: selectedRole.roleCategoryId,
        seniorityLevelId: selectedRole.seniorityLevelId,
        assetId: selectedRole.assetId,
      };

      const response = await api.updateLearningPath(
        selectedRole.id,
        updateData,
        token
      );

      if (response.success) {
        // Update the selectedRole with the new unitIds
        setSelectedRole({
          ...selectedRole,
          unitIds: updatedUnitIds,
        });

        // Refresh the existing units display
        applyFiltersToExistingUnits(filters);

        // Refresh the available units to include the removed unit
        applyFiltersToUnits(filters);

        // Refresh the learning path list to show updated data
        await refreshLearningPathList();
        setError("");
        alert(
          `Successfully removed "${unitName}" from learning path "${selectedRole.name}"`
        );
      } else {
        setError(
          response.message || "Failed to remove unit from learning path"
        );
      }
    } catch (error) {
      console.error("Error removing unit from learning path:", error);
      setError("Failed to remove unit from learning path. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const CreateLearningPathForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: "",
      assetsId: "",
      roleCategoriesId: "",
      seniorityLevelId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateLearningPath(formData);
      setFormData({
        name: "",
        assetsId: "",
        roleCategoriesId: "",
        seniorityLevelId: "",
      });
    };

    return (
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent mt-6"
        >
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[#2C2C2C] font-medium">
              Learning Path Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Type Learning Path Name"
              className="rounded-full bg-white text-[#2C2C2C] placeholder:text-[#666666] border-[#E5E5E5] focus:border-dawn"
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="assetsId" className="text-[#2C2C2C] font-medium">
              Asset *
            </Label>
            <Select
              value={formData.assetsId}
              onValueChange={(value) =>
                setFormData({ ...formData, assetsId: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:border-dawn transition-all duration-200">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="roleCategoriesId"
              className="text-[#2C2C2C] font-medium"
            >
              Role Category *
            </Label>
            <Select
              value={formData.roleCategoriesId}
              onValueChange={(value) =>
                setFormData({ ...formData, roleCategoriesId: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:border-dawn transition-all duration-200">
                <SelectValue placeholder="Select a role category" />
              </SelectTrigger>
              <SelectContent>
                {roleCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="seniorityLevelId"
              className="text-[#2C2C2C] font-medium"
            >
              Seniority Level *
            </Label>
            <Select
              value={formData.seniorityLevelId}
              onValueChange={(value) =>
                setFormData({ ...formData, seniorityLevelId: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:border-dawn transition-all duration-200">
                <SelectValue placeholder="Select a seniority level" />
              </SelectTrigger>
              <SelectContent>
                {seniorityLevels.map((seniority) => (
                  <SelectItem
                    key={seniority.id}
                    value={seniority.id.toString()}
                  >
                    {seniority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Creating..." : "Create Learning Path"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = [
    "ID",
    "Learning Path",
    "Asset",
    "Role Category",
    "Seniority",
    "Actions",
  ];

  // Assign Units Modal Component
  const AssignUnitsModal = () => {
    return (
      <Dialog
        open={isAssignUnitsModalOpen}
        onOpenChange={(open) => {
          if (!open) handleModalClose();
        }}
      >
        <DialogContent className="max-w-6xl bg-white border-white/20 text-[#2C2C2C] max-h-[90%]">
          <DialogHeader className="relative">
            <DialogTitle className="text-[#2C2C2C]">
              Assign Units - {selectedRole?.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={handleModalClose}
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent">
            {/* Unit Filtering Row */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-500">
                Filter Units
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainingArea" className="text-[#2C2C2C]">
                    Training Area
                  </Label>
                  <Select
                    value={filters.trainingAreaId}
                    onValueChange={(value) =>
                      handleFilterChange("trainingAreaId", value)
                    }
                  >
                    <SelectTrigger className="rounded-full w-full hover:bg-accent/30 hover:text-black">
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
                  <Label htmlFor="module" className="text-[#2C2C2C]">
                    Module
                  </Label>
                  <Select
                    value={filters.moduleId}
                    onValueChange={(value) =>
                      handleFilterChange("moduleId", value)
                    }
                    disabled={!filters.trainingAreaId}
                  >
                    <SelectTrigger className="rounded-full w-full hover:bg-accent/30 hover:text-black">
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredModules().map((module) => (
                        <SelectItem
                          key={module.id}
                          value={module.id.toString()}
                        >
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course" className="text-[#2C2C2C]">
                    Course
                  </Label>
                  <Select
                    value={filters.courseId}
                    onValueChange={(value) =>
                      handleFilterChange("courseId", value)
                    }
                    disabled={!filters.moduleId}
                  >
                    <SelectTrigger className="rounded-full w-full hover:bg-accent/30 hover:text-black">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredCourses().map((course) => (
                        <SelectItem
                          key={course.id}
                          value={course.id.toString()}
                        >
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Existing Assignments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-500">
                Existing Units ({existingUnits.length})
              </h3>
              {existingUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {existingUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="border border-green-500/30 rounded-lg p-4 bg-green-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[#2C2C2C]">
                            {unit.name}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() =>
                            handleDeleteAssignment(unit.id, unit.name)
                          }
                          title="Remove Unit from Learning Path"
                        >
                          <Delete sx={{ fontSize: 16 }} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#2C2C2C]/60">
                  No units assigned for the selected filters.
                </div>
              )}
            </div>

            {/* Units Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-orange-500">
                  Available Units ({filteredUnits.length})
                </h3>
                {filteredUnits.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={
                        selectedUnits.size === filteredUnits.length &&
                        filteredUnits.length > 0
                      }
                      onChange={(e) => handleSelectAllUnits(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-transparent border-white/30 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <Label
                      htmlFor="selectAll"
                      className="text-sm text-[#2C2C2C]"
                    >
                      Select All ({selectedUnits.size} selected)
                    </Label>
                  </div>
                )}
              </div>

              {filteredUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`border border-white/20 rounded-lg p-4 transition-all duration-200 ${
                        selectedUnits.has(unit.id)
                          ? "bg-orange-500/20 border-orange-500/50"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`unit-${unit.id}`}
                          checked={selectedUnits.has(unit.id)}
                          onChange={(e) =>
                            handleUnitSelection(unit.id, e.target.checked)
                          }
                          className="w-4 h-4 text-orange-500 bg-transparent border-white/30 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <h4 className="text-sm font-medium text-[#2C2C2C]">
                          {unit.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#2C2C2C]/60">
                  No units found matching the selected filters.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-2 border-white/20">
            <Button
              variant="outline"
              onClick={handleModalClose}
              className="rounded-full hover:bg-accent/30 hover:text-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignUnitsSubmit}
              disabled={isLoading || selectedUnits.size === 0}
              className="rounded-full bg-orange-500 hover:bg-orange-600"
            >
              {isLoading
                ? "Assigning..."
                : `Assign ${selectedUnits.size} Unit(s)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <AdminPageLayout
      title="Learning Paths"
      description="Manage Learning Paths and unit assignments across the platform"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          {successMessage}
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-sandstone rounded-lg border border-[#E5E5E5]">
        <h3 className="text-lg font-semibold text-dawn mb-4">Filter By</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetFilter" className="text-[#2C2C2C]">
              Asset
            </Label>
            <Select
              value={tableFilters.assetId}
              onValueChange={(value) =>
                handleTableFilterChange("assetId", value)
              }
            >
              <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:border-dawn transition-all duration-200">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleCategoryFilter" className="text-[#2C2C2C]">
              Role Category
            </Label>
            <Select
              value={tableFilters.roleCategoryId}
              onValueChange={(value) =>
                handleTableFilterChange("roleCategoryId", value)
              }
            >
              <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:border-dawn transition-all duration-200">
                <SelectValue placeholder="Select a role category" />
              </SelectTrigger>
              <SelectContent>
                {roleCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AdminTableLayout
        searchPlaceholder="Search learning paths..."
        createButtonText="Create Learning Path"
        createForm={<CreateLearningPathForm onClose={() => {}} />}
        tableData={filteredLearningPaths}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Assign Units Modal */}
      <AssignUnitsModal />
    </AdminPageLayout>
  );
};

export default LearningPathsPage;
