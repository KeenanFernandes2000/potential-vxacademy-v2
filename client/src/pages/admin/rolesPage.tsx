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
import { Delete, Assignment, Edit, Close } from "@mui/icons-material";

// API object for role operations
const api = {
  async getAllRoles(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
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
      console.error("Failed to fetch roles:", error);
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

  async createRole(roleData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create role:", error);
      throw error;
    }
  },

  async updateRole(roleId: number, roleData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update role:", error);
      throw error;
    }
  },

  async deleteRole(roleId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles/${roleId}`, {
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
      console.error("Failed to delete role:", error);
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

  async createUnitRoleAssignments(assignmentData: any, token: string) {
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
          body: JSON.stringify(assignmentData),
        }
      );

      if (!response.ok && response.status !== 207) {
        // 207 is Multi-Status, which we handle as success with partial failures
        const errorData = await response.json();
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).response = { json: () => Promise.resolve(errorData) };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create unit role assignments:", error);
      throw error;
    }
  },

  async getAllUnitRoleAssignments(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/training/unit-role-assignments`;

      const response = await fetch(url, {
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
      console.error("Failed to fetch unit role assignments:", error);
      throw error;
    }
  },

  async deleteUnitRoleAssignment(assignmentId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/unit-role-assignments/${assignmentId}`,
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
      console.error("Failed to delete unit role assignment:", error);
      throw error;
    }
  },
};

// Type for role data
interface RoleData extends Record<string, string | number | React.ReactNode> {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  actions: React.ReactNode;
}

const RolesPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<RoleData[]>([]);
  const [roleCategories, setRoleCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Fetch roles and role categories from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [rolesResponse, categoriesResponse] = await Promise.all([
          api.getAllRoles(token),
          api.getAllRoleCategories(token),
        ]);

        setRoleCategories(categoriesResponse.data || []);

        // Create a map for quick category lookup
        const categoryMap = new Map();
        categoriesResponse.data?.forEach((cat: any) => {
          categoryMap.set(cat.id, cat.name);
        });

        // Transform data to match our display format
        const transformedRoles =
          rolesResponse.data?.map((role: any) => ({
            id: role.id,
            name: role.name,
            categoryId: role.categoryId,
            categoryName: categoryMap.get(role.categoryId) || "Unknown",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={() => handleEditRole(role)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteRole(role.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setRoles(transformedRoles);
        setFilteredRoles(transformedRoles);
        setError("");
      } catch (error) {
        console.error("Error fetching roles:", error);
        setError("Failed to load roles. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(query.toLowerCase()) ||
          role.categoryName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  };

  const handleCreateRole = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const roleData = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
      };

      const response = await api.createRole(roleData, token);

      if (response.success) {
        // Refresh the role list
        await refreshRoleList();
        setError("");
        setSuccessMessage("Role created successfully!");
      } else {
        setError(response.message || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      setError("Failed to create role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
  };

  const handleUpdateRole = async (formData: any) => {
    if (!token || !editingRole) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const roleData = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
      };

      const response = await api.updateRole(editingRole.id, roleData, token);

      if (response.success) {
        // Refresh the role list
        await refreshRoleList();
        setError("");
        setSuccessMessage("Role updated successfully!");
        setEditingRole(null);
      } else {
        setError(response.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteRole(roleId, token);

      if (response.success) {
        // Refresh the role list
        await refreshRoleList();
        setError("");
      } else {
        setError(response.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      setError("Failed to delete role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRoleList = async () => {
    if (!token) return;
    const [rolesResponse, categoriesResponse] = await Promise.all([
      api.getAllRoles(token),
      api.getAllRoleCategories(token),
    ]);

    // Create a map for quick category lookup
    const categoryMap = new Map();
    categoriesResponse.data?.forEach((cat: any) => {
      categoryMap.set(cat.id, cat.name);
    });

    const transformedRoles =
      rolesResponse.data?.map((role: any) => ({
        id: role.id,
        name: role.name,
        categoryId: role.categoryId,
        categoryName: categoryMap.get(role.categoryId) || "Unknown",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-blue-400 hover:bg-blue-400/10"
              onClick={() => handleEditRole(role)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteRole(role.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setRoles(transformedRoles);
    setFilteredRoles(transformedRoles);
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
    setSeniorityLevels([]);
    setAssets([]);
    setExistingUnits([]);
    setExistingAssignments([]);
  };

  // Fetch existing assignments and filter units
  const fetchExistingAssignments = async (currentFilters = filters) => {
    if (!token || !selectedRole) return;

    try {
      console.log("Fetching all existing assignments");
      const response = await api.getAllUnitRoleAssignments(token);
      console.log("All assignments response:", response);

      // Store all assignment data
      const allAssignments = response.data || [];

      // Filter assignments based on current role and filters
      const filteredAssignments = allAssignments.filter((assignment: any) => {
        // Filter by role
        if (assignment.roleId !== selectedRole.id) return false;
        if (assignment.roleCategoryId !== selectedRole.categoryId) return false;

        // Filter by seniority level if specified
        if (currentFilters.seniorityId) {
          const seniorityId = parseInt(currentFilters.seniorityId);
          if (assignment.seniorityLevelId !== seniorityId) return false;
        }

        // Filter by asset if specified
        if (currentFilters.assetId) {
          const assetId = parseInt(currentFilters.assetId);
          if (assignment.assetId !== assetId) return false;
        }

        return true;
      });

      console.log("Filtered assignments:", filteredAssignments);

      // Store the filtered assignment data
      setExistingAssignments(filteredAssignments);

      // Get unit details for existing assignments
      const assignedUnitIds = filteredAssignments.map(
        (assignment: any) => assignment.unitId
      );
      const assignedUnits = units.filter((unit) =>
        assignedUnitIds.includes(unit.id)
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
      setExistingAssignments([]);
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

      // Transform and set initial filtered units
      const transformedUnits = transformUnitsData(
        unitsResponse.data || [],
        courseUnitsResponse.data || [],
        coursesResponse.data || [],
        modulesResponse.data || [],
        trainingAreasResponse.data || []
      );
      setFilteredUnits(transformedUnits);

      // Fetch existing assignments for this role
      await fetchExistingAssignments();
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

    // Apply filters to units
    applyFiltersToUnits(newFilters);

    // Fetch existing assignments when seniority or asset filters change
    if (filterType === "seniorityId" || filterType === "assetId") {
      await fetchExistingAssignments(newFilters);
    }
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
    if (!token || !selectedRole || selectedUnits.size === 0) {
      setError("Please select at least one unit to assign");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare assignment data
      const assignmentData = {
        unitIds: Array.from(selectedUnits),
        roleId: selectedRole.id,
        roleCategoryId: selectedRole.categoryId,
        seniorityLevelId: filters.seniorityId
          ? parseInt(filters.seniorityId)
          : undefined,
        assetId: filters.assetId ? parseInt(filters.assetId) : undefined,
      };

      const response = await api.createUnitRoleAssignments(
        assignmentData,
        token
      );

      if (response.success) {
        // Show success message
        setError("");

        let message = `Successfully assigned ${response.count} unit(s) to role "${selectedRole.name}"`;

        // Handle partial failures
        if (
          response.failedAssignments &&
          response.failedAssignments.length > 0
        ) {
          const failedUnitIds = response.failedAssignments
            .map((f: any) => f.unitId)
            .join(", ");
          message += `\n\nNote: ${response.failedAssignments.length} unit(s) failed to assign: ${failedUnitIds}`;
        }

        alert(message);

        // Refresh existing assignments
        await fetchExistingAssignments();

        // Clear selected units
        setSelectedUnits(new Set());
      } else {
        setError(response.message || "Failed to assign units");
      }
    } catch (error: any) {
      console.error("Error assigning units:", error);

      // Handle validation errors
      if (error.message && error.message.includes("409")) {
        try {
          const errorData = await error.response?.json();
          if (errorData?.errors) {
            setError(`Assignment conflicts: ${errorData.errors.join(", ")}`);
          } else {
            setError("Some units already have this assignment combination");
          }
        } catch {
          setError("Some units already have this assignment combination");
        }
      } else {
        setError("Failed to assign units. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (
    assignmentId: number,
    unitName: string
  ) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove "${unitName}" from this role assignment?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteUnitRoleAssignment(assignmentId, token);

      if (response.success) {
        // Refresh existing assignments
        await fetchExistingAssignments();
        setError("");
      } else {
        setError(response.message || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Failed to delete assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const CreateRoleForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: "",
      categoryId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateRole(formData);
      setFormData({
        name: "",
        categoryId: "",
      });
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
          <h3 className="text-lg font-semibold">Create Role</h3>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Type your Role Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
              required
            >
              <option value="" className="text-gray-900">
                Select a category
              </option>
              {roleCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="text-gray-900"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Creating..." : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditRoleForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: editingRole?.name || "",
      categoryId: editingRole?.categoryId?.toString() || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateRole(formData);
      setFormData({
        name: "",
        categoryId: "",
      });
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
          <h3 className="text-lg font-semibold">Edit Role</h3>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Role Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
              placeholder="Type your Role Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-categoryId">Category *</Label>
            <select
              id="edit-categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-full bg-[#00d8cc]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-transparent"
              required
            >
              <option value="" className="text-gray-900">
                Select a category
              </option>
              {roleCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="text-gray-900"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = ["ID", "Role", "Role Category", "Actions"];

  // Assign Units Modal Component
  const AssignUnitsModal = () => {
    return (
      <Dialog
        open={isAssignUnitsModalOpen}
        onOpenChange={(open) => {
          if (!open) handleModalClose();
        }}
      >
        <DialogContent className="max-w-6xl bg-sandstone border-white/20 text-white max-h-[90%]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Assign Units - {selectedRole?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent">
            {/* Unit Filtering Row */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#00d8cc]">
                Filter Units
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainingArea">Training Area</Label>
                  <Select
                    value={filters.trainingAreaId}
                    onValueChange={(value) =>
                      handleFilterChange("trainingAreaId", value)
                    }
                  >
                    <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
                  <Label htmlFor="module">Module</Label>
                  <Select
                    value={filters.moduleId}
                    onValueChange={(value) =>
                      handleFilterChange("moduleId", value)
                    }
                    disabled={!filters.trainingAreaId}
                  >
                    <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={filters.courseId}
                    onValueChange={(value) =>
                      handleFilterChange("courseId", value)
                    }
                    disabled={!filters.moduleId}
                  >
                    <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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

            {/* Seniority & Assets Row */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#00d8cc]">
                Additional Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select
                    value={filters.seniorityId}
                    onValueChange={(value) =>
                      handleFilterChange("seniorityId", value)
                    }
                  >
                    <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                      <SelectValue placeholder="Select seniority level" />
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

                <div className="space-y-2">
                  <Label htmlFor="asset">Asset</Label>
                  <Select
                    value={filters.assetId}
                    onValueChange={(value) =>
                      handleFilterChange("assetId", value)
                    }
                  >
                    <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                      <SelectValue placeholder="Select asset" />
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
              </div>
            </div>
            {/* Existing Assignments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#00d8cc]">
                Existing Units ({existingUnits.length})
              </h3>
              {existingUnits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {existingUnits.map((unit) => {
                    // Find the assignment ID for this unit
                    const assignment = existingAssignments?.find(
                      (a: any) => a.unitId === unit.id
                    );
                    return (
                      <div
                        key={unit.id}
                        className="border border-green-500/30 rounded-lg p-4 bg-green-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white">
                              {unit.name}
                            </h4>
                          </div>
                          {assignment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id, unit.name)
                              }
                              title="Remove Assignment"
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  No units assigned for the selected filters.
                </div>
              )}
            </div>

            {/* Units Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#00d8cc]">
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
                      className="w-4 h-4 text-[#00d8cc] bg-transparent border-white/30 rounded focus:ring-[#00d8cc] focus:ring-2"
                    />
                    <Label htmlFor="selectAll" className="text-sm text-white">
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
                          ? "bg-[#00d8cc]/20 border-[#00d8cc]/50"
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
                          className="w-4 h-4 text-[#00d8cc] bg-transparent border-white/30 rounded focus:ring-[#00d8cc] focus:ring-2"
                        />
                        <h4 className="text-sm font-medium text-white">
                          {unit.name}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  No units found matching the selected filters.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-2 border-white/20">
            <Button
              variant="outline"
              onClick={handleModalClose}
              className="rounded-full bg-[#00d8cc]/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignUnitsSubmit}
              disabled={isLoading || selectedUnits.size === 0}
              className="rounded-full bg-[#00d8cc] hover:bg-[#00d8cc]/80"
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
    <AdminPageLayout title="Roles" description="Manage your Roles">
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
        searchPlaceholder="Search roles..."
        createButtonText="Create Role"
        createForm={<CreateRoleForm onClose={() => {}} />}
        tableData={filteredRoles}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <EditRoleForm onClose={() => setEditingRole(null)} />
          </div>
        </div>
      )}

      {/* Assign Units Modal */}
      <AssignUnitsModal />
    </AdminPageLayout>
  );
};

export default RolesPage;
