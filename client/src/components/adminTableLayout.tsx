import React, { ReactNode, useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

// Types for the API responses
interface TrainingArea {
  id: number;
  name: string;
  description?: string;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  trainingAreaId: number;
}

interface Course {
  id: number;
  name: string;
  description?: string;
  moduleId: number;
}

interface Unit {
  id: number;
  name: string;
  description?: string;
  courseId: number;
}

// API service functions
const api = {
  async getAllTrainingAreas() {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/training/training-areas`);

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

  async getModulesByTrainingArea(trainingAreaId: number) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/training/modules/training-area/${trainingAreaId}`
      );

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

  async getCoursesByModule(moduleId: number) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/training/courses/module/${moduleId}`
      );

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

  async getCourseUnitsByCourse(courseId: number) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/training/course-units/course/${courseId}`
      );

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

  async getAllUnits() {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/training/units`);

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

  async getAllAssessments() {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/assessments/assessments`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
      throw error;
    }
  },
};

interface ColumnFilterConfig {
  trainingAreaId?: string; // Column name that contains training area ID
  moduleId?: string; // Column name that contains module ID
  courseId?: string; // Column name that contains course ID
  unitId?: string; // Column name that contains unit ID
  assessmentId?: string; // Column name that contains assessment ID
}

interface DropdownConfig {
  showTrainingArea?: boolean;
  showModule?: boolean;
  showCourse?: boolean;
  showUnit?: boolean;
  showAssessment?: boolean;
}

interface AdminTableLayoutProps {
  searchPlaceholder?: string;
  createButtonText?: string;
  createForm: ReactNode;
  tableData: Record<string, string | number | ReactNode>[];
  columns: string[];
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: {
    trainingAreaId?: number;
    moduleId?: number;
    courseId?: number;
    unitId?: number;
  }) => void;
  columnFilterConfig?: ColumnFilterConfig; // Configuration for which columns to filter by
  enableColumnFiltering?: boolean; // Whether to enable automatic column filtering
  dropdownConfig?: DropdownConfig; // Configuration for which dropdowns to show
}

/**
 * AdminTableLayout Component
 *
 * A reusable table layout component for admin pages with integrated filtering dropdowns.
 *
 * Features:
 * - Search functionality
 * - Create modal with custom form
 * - Cascading dropdown filters (Training Area → Module → Course → Unit)
 * - Real-time API integration for dropdown data
 * - Loading states and proper error handling
 * - Smart unit filtering: Gets course units first, then filters all units by unit IDs
 * - Automatic column filtering: Filter table data based on dropdown selections
 *
 * Usage Example:
 * ```tsx
 * const [tableData, setTableData] = useState([]);
 *
 * const handleFilterChange = (filters) => {
 *   // Optional: Handle filter changes for custom logic
 *   console.log('Filters changed:', filters);
 * };
 *
 * // Basic usage without column filtering
 * <AdminTableLayout
 *   searchPlaceholder="Search assessments..."
 *   createButtonText="Create Assessment"
 *   createForm={<YourCreateForm />}
 *   tableData={tableData}
 *   columns={['ID', 'Title', 'Actions']}
 *   onSearch={handleSearch}
 *   onFilterChange={handleFilterChange}
 * />
 *
 * // With automatic column filtering
 * <AdminTableLayout
 *   searchPlaceholder="Search assessments..."
 *   createButtonText="Create Assessment"
 *   createForm={<YourCreateForm />}
 *   tableData={tableData}
 *   columns={['ID', 'Title', 'Training Area', 'Module', 'Course', 'Unit', 'Actions']}
 *   onSearch={handleSearch}
 *   onFilterChange={handleFilterChange}
 *   enableColumnFiltering={true}
 *   columnFilterConfig={{
 *     trainingAreaId: 'trainingAreaId', // Column name containing training area ID
 *     moduleId: 'moduleId',             // Column name containing module ID
 *     courseId: 'courseId',             // Column name containing course ID
 *     unitId: 'unitId'                  // Column name containing unit ID
 *   }}
 * />
 * ```
 */

const AdminTableLayout: React.FC<AdminTableLayoutProps> = ({
  searchPlaceholder = "Search...",
  createButtonText = "Create",
  createForm,
  tableData,
  columns,
  onSearch,
  onFilterChange,
  columnFilterConfig,
  enableColumnFiltering = false,
  dropdownConfig = {
    showTrainingArea: true,
    showModule: true,
    showCourse: true,
    showUnit: true,
    showAssessment: false,
  },
}) => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State for dropdown data
  const [trainingAreas, setTrainingAreas] = useState<TrainingArea[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  // State for selected values
  const [selectedTrainingArea, setSelectedTrainingArea] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");

  // Loading states
  const [loadingTrainingAreas, setLoadingTrainingAreas] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Filtered data state
  const [filteredTableData, setFilteredTableData] =
    useState<Record<string, string | number | ReactNode>[]>(tableData);

  // Load training areas on component mount (only if training area dropdown is enabled)
  useEffect(() => {
    if (!dropdownConfig.showTrainingArea) return;

    const loadTrainingAreas = async () => {
      setLoadingTrainingAreas(true);
      try {
        const response = await api.getAllTrainingAreas();
        if (response.success && response.data) {
          setTrainingAreas(response.data);
        }
      } catch (error) {
        console.error("Failed to load training areas:", error);
      } finally {
        setLoadingTrainingAreas(false);
      }
    };

    loadTrainingAreas();
  }, [dropdownConfig.showTrainingArea]);

  // Load modules when training area changes (only if module dropdown is enabled)
  useEffect(() => {
    if (!dropdownConfig.showModule || !selectedTrainingArea) {
      setModules([]);
      setCourses([]);
      setUnits([]);
      setSelectedModule("");
      setSelectedCourse("");
      setSelectedUnit("");
      return;
    }

    const loadModules = async () => {
      setLoadingModules(true);
      setModules([]);
      setCourses([]);
      setUnits([]);
      setSelectedModule("");
      setSelectedCourse("");
      setSelectedUnit("");

      try {
        const response = await api.getModulesByTrainingArea(
          parseInt(selectedTrainingArea)
        );
        if (response.success && response.data) {
          setModules(response.data);
        }
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    loadModules();
  }, [selectedTrainingArea, dropdownConfig.showModule]);

  // Load courses when module changes (only if course dropdown is enabled)
  useEffect(() => {
    if (!dropdownConfig.showCourse || !selectedModule) {
      setCourses([]);
      setUnits([]);
      setSelectedCourse("");
      setSelectedUnit("");
      return;
    }

    const loadCourses = async () => {
      setLoadingCourses(true);
      setCourses([]);
      setUnits([]);
      setSelectedCourse("");
      setSelectedUnit("");

      try {
        const response = await api.getCoursesByModule(parseInt(selectedModule));
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [selectedModule, dropdownConfig.showCourse]);

  // Load units when course changes (only if unit dropdown is enabled)
  useEffect(() => {
    if (!dropdownConfig.showUnit || !selectedCourse) {
      setUnits([]);
      setSelectedUnit("");
      return;
    }

    const loadUnits = async () => {
      setLoadingUnits(true);
      setUnits([]);
      setSelectedUnit("");

      try {
        // First, get course units for the selected course
        const courseUnitsResponse = await api.getCourseUnitsByCourse(
          parseInt(selectedCourse)
        );

        if (courseUnitsResponse.success && courseUnitsResponse.data) {
          // Extract unit IDs from course units
          const unitIds = courseUnitsResponse.data.map(
            (courseUnit: any) => courseUnit.unitId
          );

          if (unitIds.length > 0) {
            // Get all units
            const allUnitsResponse = await api.getAllUnits();

            if (allUnitsResponse.success && allUnitsResponse.data) {
              // Filter units based on the unit IDs from course units
              const filteredUnits = allUnitsResponse.data.filter((unit: Unit) =>
                unitIds.includes(unit.id)
              );
              setUnits(filteredUnits);
            }
          } else {
            setUnits([]);
          }
        }
      } catch (error) {
        console.error("Failed to load units:", error);
      } finally {
        setLoadingUnits(false);
      }
    };

    loadUnits();
  }, [selectedCourse, dropdownConfig.showUnit]);

  // Load assessments on component mount (only if assessment dropdown is enabled)
  useEffect(() => {
    if (!dropdownConfig.showAssessment) return;

    const loadAssessments = async () => {
      setLoadingAssessments(true);
      try {
        const response = await api.getAllAssessments();
        if (response.success && response.data) {
          setAssessments(response.data);
        }
      } catch (error) {
        console.error("Failed to load assessments:", error);
      } finally {
        setLoadingAssessments(false);
      }
    };

    loadAssessments();
  }, [dropdownConfig.showAssessment]);

  // Filter table data based on dropdown selections
  useEffect(() => {
    if (enableColumnFiltering && columnFilterConfig) {
      let filtered = [...tableData];

      // Filter by training area (only if training area dropdown is enabled)
      if (
        dropdownConfig.showTrainingArea &&
        selectedTrainingArea &&
        columnFilterConfig.trainingAreaId
      ) {
        filtered = filtered.filter((row) => {
          const value = row[columnFilterConfig.trainingAreaId!];
          return (
            value === parseInt(selectedTrainingArea) ||
            value === selectedTrainingArea
          );
        });
      }

      // Filter by module (only if module dropdown is enabled)
      if (
        dropdownConfig.showModule &&
        selectedModule &&
        columnFilterConfig.moduleId
      ) {
        filtered = filtered.filter((row) => {
          const value = row[columnFilterConfig.moduleId!];
          return value === parseInt(selectedModule) || value === selectedModule;
        });
      }

      // Filter by course (only if course dropdown is enabled)
      if (
        dropdownConfig.showCourse &&
        selectedCourse &&
        columnFilterConfig.courseId
      ) {
        filtered = filtered.filter((row) => {
          const value = row[columnFilterConfig.courseId!];
          return value === parseInt(selectedCourse) || value === selectedCourse;
        });
      }

      // Filter by unit (only if unit dropdown is enabled)
      if (
        dropdownConfig.showUnit &&
        selectedUnit &&
        columnFilterConfig.unitId
      ) {
        filtered = filtered.filter((row) => {
          const value = row[columnFilterConfig.unitId!];
          return value === parseInt(selectedUnit) || value === selectedUnit;
        });
      }

      // Filter by assessment (only if assessment dropdown is enabled)
      if (
        dropdownConfig.showAssessment &&
        selectedAssessment &&
        columnFilterConfig.assessmentId
      ) {
        filtered = filtered.filter((row) => {
          const value = row[columnFilterConfig.assessmentId!];
          return (
            value === parseInt(selectedAssessment) ||
            value === selectedAssessment
          );
        });
      }

      setFilteredTableData(filtered);
    } else {
      setFilteredTableData(tableData);
    }
  }, [
    tableData,
    selectedTrainingArea,
    selectedModule,
    selectedCourse,
    selectedUnit,
    selectedAssessment,
    enableColumnFiltering,
    columnFilterConfig,
    dropdownConfig,
  ]);

  // Notify parent component of filter changes
  useEffect(() => {
    onFilterChange?.({
      trainingAreaId: selectedTrainingArea
        ? parseInt(selectedTrainingArea)
        : undefined,
      moduleId: selectedModule ? parseInt(selectedModule) : undefined,
      courseId: selectedCourse ? parseInt(selectedCourse) : undefined,
      unitId: selectedUnit ? parseInt(selectedUnit) : undefined,
    });
  }, [
    selectedTrainingArea,
    selectedModule,
    selectedCourse,
    selectedUnit,
    selectedAssessment,
    onFilterChange,
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4">
      {/* Search and Create Section */}
      <div className="flex items-center gap-4 justify-between w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc] rounded-full"
          />
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black font-semibold rounded-full"
              style={{ minWidth: "120px", height: "40px" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {createButtonText}
              </DialogTitle>
            </DialogHeader>
            {createForm}
          </DialogContent>
        </Dialog>
      </div>
      {/* Conditional Dropdowns Section */}
      <div className="flex items-center gap-4 w-full">
        {/* Training Area Dropdown */}
        {dropdownConfig.showTrainingArea && (
          <Select
            value={selectedTrainingArea}
            onValueChange={setSelectedTrainingArea}
            disabled={loadingTrainingAreas}
          >
            <SelectTrigger className="w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]">
              <SelectValue
                placeholder={
                  loadingTrainingAreas ? "Loading..." : "Select a training area"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {trainingAreas.map((area) => (
                <SelectItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Module Dropdown */}
        {dropdownConfig.showModule && (
          <Select
            value={selectedModule}
            onValueChange={setSelectedModule}
            disabled={!selectedTrainingArea || loadingModules}
          >
            <SelectTrigger className="w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]">
              <SelectValue
                placeholder={
                  !selectedTrainingArea
                    ? "Select training area first"
                    : loadingModules
                    ? "Loading..."
                    : "Select a module"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Course Dropdown */}
        {dropdownConfig.showCourse && (
          <Select
            value={selectedCourse}
            onValueChange={setSelectedCourse}
            disabled={!selectedModule || loadingCourses}
          >
            <SelectTrigger className="w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]">
              <SelectValue
                placeholder={
                  !selectedModule
                    ? "Select module first"
                    : loadingCourses
                    ? "Loading..."
                    : "Select a course"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Unit Dropdown */}
        {dropdownConfig.showUnit && (
          <Select
            value={selectedUnit}
            onValueChange={setSelectedUnit}
            disabled={!selectedCourse || loadingUnits}
          >
            <SelectTrigger className="w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]">
              <SelectValue
                placeholder={
                  !selectedCourse
                    ? "Select course first"
                    : loadingUnits
                    ? "Loading..."
                    : "Select a unit"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Assessment Dropdown */}
        {dropdownConfig.showAssessment && (
          <Select
            value={selectedAssessment}
            onValueChange={setSelectedAssessment}
            disabled={loadingAssessments}
          >
            <SelectTrigger className="w-full rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]">
              <SelectValue
                placeholder={
                  loadingAssessments ? "Loading..." : "Select an assessment"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem
                  key={assessment.id}
                  value={assessment.id.toString()}
                >
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Filter Status */}
      {enableColumnFiltering &&
        (selectedTrainingArea ||
          selectedModule ||
          selectedCourse ||
          selectedUnit ||
          selectedAssessment) && (
          <div className="text-sm text-white/70 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
            Showing {filteredTableData.length} of {tableData.length} results
            {(selectedTrainingArea ||
              selectedModule ||
              selectedCourse ||
              selectedUnit ||
              selectedAssessment) && (
              <span className="ml-2">
                (filtered by:{" "}
                {[
                  selectedTrainingArea && "Training Area",
                  selectedModule && "Module",
                  selectedCourse && "Course",
                  selectedUnit && "Unit",
                  selectedAssessment && "Assessment",
                ]
                  .filter(Boolean)
                  .join(", ")}
                )
              </span>
            )}
          </div>
        )}

      {/* Table */}
      <div className="border bg-white/10 backdrop-blur-sm border-white/20 w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20">
              {columns.map((column) => (
                <TableHead key={column} className="text-white font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTableData.map((row, index) => (
              <TableRow
                key={index}
                className="border-white/20 hover:bg-white/5"
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-white/90">
                    {typeof cell === "string" || typeof cell === "number"
                      ? String(cell)
                      : cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTableLayout;
