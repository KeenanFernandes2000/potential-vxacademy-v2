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

// API object for unit operations
const api = {
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
  course_id: number;
  course_name: string;
  description: string;
  internal_note: string;
  order: number;
  duration: number;
  show_duration: boolean;
  xp_points: number;
  createdDate: string;
  status: string;
  courseUnitId: number | null;
  actions: React.ReactNode;
}

const UnitsPage = () => {
  const { token } = useAuth();
  const [units, setUnits] = useState<UnitData[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseUnits, setCourseUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

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
        const [unitsResponse, coursesResponse, courseUnitsResponse] =
          await Promise.all([
            api.getAllUnits(token),
            api.getAllCourses(token),
            api.getAllCourseUnits(token),
          ]);

        setCourses(coursesResponse.data || []);
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

            return {
              id: unit.id,
              name: unit.name,
              course_id: courseUnit?.courseId || 0,
              course_name: course?.name || "N/A",
              description: unit.description || "N/A",
              internal_note: unit.internal_note || "N/A",
              order: unit.order || 1,
              duration: unit.duration || 30,
              show_duration: unit.show_duration || true,
              xp_points: unit.xp_points || 100,
              createdDate: unit.createdAt
                ? new Date(unit.createdAt).toISOString().split("T")[0]
                : "N/A",
              status: unit.status || "Active",
              courseUnitId: courseUnit?.id || null,
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditUnit(unit)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteUnit(unit.id)}
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
      const filtered = units.filter(
        (unit) =>
          unit.name.toLowerCase().includes(query.toLowerCase()) ||
          unit.description.toLowerCase().includes(query.toLowerCase()) ||
          unit.internal_note.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUnits(filtered);
    }
  };

  const handleCreateUnit = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
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
        } else {
          setError(
            courseUnitResponse.message ||
              "Failed to create course-unit relationship"
          );
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
        // Step 2: Update course-unit relationship if it exists, or create new one
        const courseUnitData = {
          courseId: parseInt(formData.course_id),
          unitId: selectedUnit.id,
          order: parseInt(formData.order),
        };

        if (selectedUnit.courseUnitId) {
          // Update existing relationship
          const courseUnitResponse = await api.updateCourseUnit(
            selectedUnit.courseUnitId,
            courseUnitData,
            token
          );
          if (!courseUnitResponse.success) {
            setError(
              courseUnitResponse.message ||
                "Failed to update course-unit relationship"
            );
            return;
          }
        } else {
          // Create new relationship
          const courseUnitResponse = await api.createCourseUnit(
            courseUnitData,
            token
          );
          if (!courseUnitResponse.success) {
            setError(
              courseUnitResponse.message ||
                "Failed to create course-unit relationship"
            );
            return;
          }
        }

        // Refresh the unit list
        await refreshUnitList();
        setIsEditModalOpen(false);
        setSelectedUnit(null);
        setError("");
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

  const handleDeleteUnit = async (unitId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this unit?")) {
      return;
    }

    try {
      setIsLoading(true);

      // Find the unit to get its courseUnitId
      const unit = units.find((u) => u.id === unitId);

      // Step 1: Delete course-unit relationship if it exists
      if (unit?.courseUnitId) {
        const courseUnitResponse = await api.deleteCourseUnit(
          unit.courseUnitId,
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
      const response = await api.deleteUnit(unitId, token);

      if (response.success) {
        // Refresh the unit list
        await refreshUnitList();
        setError("");
      } else {
        setError(response.message || "Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      setError("Failed to delete unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUnit = (unit: any) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const refreshUnitList = async () => {
    if (!token) return;
    const [unitsResponse, coursesResponse, courseUnitsResponse] =
      await Promise.all([
        api.getAllUnits(token),
        api.getAllCourses(token),
        api.getAllCourseUnits(token),
      ]);

    setCourses(coursesResponse.data || []);
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

        return {
          id: unit.id,
          name: unit.name,
          course_id: courseUnit?.courseId || 0,
          course_name: course?.name || "N/A",
          description: unit.description || "N/A",
          internal_note: unit.internal_note || "N/A",
          order: unit.order || 1,
          duration: unit.duration || 30,
          show_duration: unit.show_duration || true,
          xp_points: unit.xp_points || 100,
          createdDate: unit.createdAt
            ? new Date(unit.createdAt).toISOString().split("T")[0]
            : "N/A",
          status: unit.status || "Active",
          courseUnitId: courseUnit?.id || null,
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditUnit(unit)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteUnit(unit.id)}
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
      course_id: "",
      description: "",
      internal_note: "",
      order: "1",
      duration: "30",
      show_duration: true,
      xp_points: "100",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateUnit(formData);
      setFormData({
        name: "",
        course_id: "",
        description: "",
        internal_note: "",
        order: "1",
        duration: "30",
        show_duration: true,
        xp_points: "100",
      });
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Unit Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course_id">Course *</Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) =>
              setFormData({ ...formData, course_id: value })
            }
          >
            <SelectTrigger className="rounded-full w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-full"
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
            className="rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full"
            min="1"
            required
          />
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
            className="rounded-full"
            min="1"
            required
          />
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
          <Label htmlFor="xp_points">XP Points *</Label>
          <Input
            id="xp_points"
            type="number"
            value={formData.xp_points}
            onChange={(e) =>
              setFormData({ ...formData, xp_points: e.target.value })
            }
            className="rounded-full"
            min="0"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Unit"}
          </Button>
        </div>
      </form>
    );
  };

  const EditUnitForm = () => {
    const [formData, setFormData] = useState({
      name: selectedUnit?.name || "",
      course_id: selectedUnit?.course_id?.toString() || "",
      description: selectedUnit?.description || "",
      internal_note: selectedUnit?.internal_note || "",
      order: selectedUnit?.order?.toString() || "1",
      duration: selectedUnit?.duration?.toString() || "30",
      show_duration: selectedUnit?.show_duration || true,
      xp_points: selectedUnit?.xp_points?.toString() || "100",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateUnit(formData);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_name">Unit Name *</Label>
          <Input
            id="edit_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_course_id">Course *</Label>
          <Select
            value={formData.course_id}
            onValueChange={(value) =>
              setFormData({ ...formData, course_id: value })
            }
          >
            <SelectTrigger className="rounded-full w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_description">Description</Label>
          <Input
            id="edit_description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_internal_note">Internal Note</Label>
          <Input
            id="edit_internal_note"
            value={formData.internal_note}
            onChange={(e) =>
              setFormData({ ...formData, internal_note: e.target.value })
            }
            className="rounded-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_order">Order *</Label>
          <Input
            id="edit_order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full"
            min="1"
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
            className="rounded-full"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_show_duration">Show Duration</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_show_duration"
              checked={formData.show_duration}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_duration: checked })
              }
            />
            <Label htmlFor="edit_show_duration" className="text-sm">
              {formData.show_duration ? "Show" : "Hide"}
            </Label>
          </div>
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
            className="rounded-full"
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
            className="rounded-full"
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
    "Name",
    "Course",
    "Description",
    "Internal Note",
    "Order",
    "Duration",
    "Show Duration",
    "XP Points",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Units"
      description="Manage course units and learning segments"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search units..."
        createButtonText="Create Unit"
        createForm={<CreateUnitForm />}
        tableData={filteredUnits}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Unit</DialogTitle>
          </DialogHeader>
          <EditUnitForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default UnitsPage;
