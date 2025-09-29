import React, { ReactNode, useState, useEffect } from "react";
import { Search, Plus, ChevronUp, ChevronDown } from "lucide-react";
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
  createForm?: ReactNode;
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
    showTrainingArea: false,
    showModule: false,
    showCourse: false,
    showUnit: false,
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

  // Update filteredTableData when tableData prop changes
  useEffect(() => {
    console.log("tableData prop changed:", {
      length: tableData.length,
      columns: columns,
      firstRow: tableData[0],
    });
    setFilteredTableData(tableData);
  }, [tableData, columns]);

  // Sort state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
    }
    // Note: We don't set filteredTableData to tableData here anymore
    // because the tableData useEffect handles that
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

  // Check if a column header contains 'name' using regex
  const isNameColumn = (columnName: string): boolean => {
    const isName = /name/i.test(columnName);
    console.log(`Column "${columnName}" is name column:`, isName);
    return isName;
  };

  // Handle sort functionality
  const handleSort = (columnName: string) => {
    if (!isNameColumn(columnName)) return;

    console.log("Sorting by column:", columnName);
    console.log("Current sort column:", sortColumn);
    console.log("Current sort direction:", sortDirection);

    if (sortColumn === columnName) {
      // Toggle direction if same column
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      console.log("Toggling direction to:", newDirection);
      setSortDirection(newDirection);
    } else {
      // Set new column and default to ascending
      console.log("Setting new column:", columnName);
      setSortColumn(columnName);
      setSortDirection("asc");
    }
  };

  // Map display column names to actual data property names
  const getDataPropertyName = (columnName: string): string => {
    // Common mappings for display names to data properties
    const columnMappings: Record<string, string> = {
      Name: "name",
      "Role Name": "name", // Assuming role name is stored in 'name' property
      "Module Name": "module_name",
      "Course Name": "name",
      "Unit Name": "name",
      "Full Name": "name",
      Username: "name",
      "Display Name": "name",
      Title: "name",
      Organization: "name",
      Asset: "name",
      "Sub Asset": "name",
      Category: "name",
    };

    // Check if we have a specific mapping
    if (columnMappings[columnName]) {
      return columnMappings[columnName];
    }

    // Fallback: convert column name to camelCase or snake_case
    // "Role Name" -> "roleName" or "role_name"
    const camelCase = columnName
      .toLowerCase()
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase());
    const snakeCase = columnName.toLowerCase().replace(/\s+/g, "_");

    // Try camelCase first, then snake_case, then original
    return camelCase;
  };

  // Sort the filtered data
  const getSortedData = (): Record<string, string | number | ReactNode>[] => {
    console.log(
      "getSortedData called - sortColumn:",
      sortColumn,
      "sortDirection:",
      sortDirection
    );
    console.log("filteredTableData length:", filteredTableData.length);

    if (!sortColumn) {
      console.log("No sort column, returning filteredTableData");
      return filteredTableData;
    }

    // Get the actual data property name
    const dataProperty = getDataPropertyName(sortColumn);
    console.log(
      `Mapping column "${sortColumn}" to data property "${dataProperty}"`
    );
    console.log("Sample data row:", filteredTableData[0]);
    console.log(
      "Available properties:",
      Object.keys(filteredTableData[0] || {})
    );

    const sorted = [...filteredTableData].sort((a, b) => {
      const aValue = a[dataProperty];
      const bValue = b[dataProperty];

      console.log(`Comparing ${dataProperty}:`, aValue, "vs", bValue);

      // Handle different data types
      const aStr =
        typeof aValue === "string" || typeof aValue === "number"
          ? String(aValue).toLowerCase()
          : "";
      const bStr =
        typeof bValue === "string" || typeof bValue === "number"
          ? String(bValue).toLowerCase()
          : "";

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    console.log("Sorted data length:", sorted.length);
    return sorted;
  };

  // Sortable TableHead component
  const SortableTableHead: React.FC<{ column: string }> = ({ column }) => {
    const isSortable = isNameColumn(column);
    const isActive = sortColumn === column;

    console.log(`Rendering SortableTableHead for "${column}":`, {
      isSortable,
      isActive,
      sortColumn,
      sortDirection,
    });

    return (
      <TableHead
        className={`text-foreground font-semibold ${
          isSortable ? "cursor-pointer hover:bg-muted/50 select-none" : ""
        }`}
        onClick={() => {
          console.log(
            `Clicked on column: "${column}", isSortable:`,
            isSortable
          );
          if (isSortable) {
            handleSort(column);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span>{column}</span>
          {isSortable && (
            <div className="flex flex-col">
              <ChevronUp
                className={`h-3 w-3 ${
                  isActive && sortDirection === "asc"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <ChevronDown
                className={`h-3 w-3 -mt-1 ${
                  isActive && sortDirection === "desc"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
            </div>
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Create Section */}
      <div className="flex items-center gap-4 justify-between w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary rounded-lg"
          />
        </div>

        {createForm && createButtonText && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                style={{ minWidth: "120px", height: "40px" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {createButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border text-card-foreground max-h-[80%] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">
                  {createButtonText}
                </DialogTitle>
              </DialogHeader>
              {createForm}
            </DialogContent>
          </Dialog>
        )}
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
            <SelectTrigger className="w-full rounded-lg bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary">
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
            <SelectTrigger className="w-full rounded-lg bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary">
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
            <SelectTrigger className="w-full rounded-lg bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary">
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
            <SelectTrigger className="w-full rounded-lg bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary">
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
            <SelectTrigger className="w-full rounded-lg bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary">
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
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border">
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
      <div className="border bg-card/50 backdrop-blur-sm border-border w-full max-w-8xl mx-auto rounded-lg overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sandstone/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sandstone/50 [&::-webkit-scrollbar-corner]:bg-transparent">
          <div className="min-w-[800px]">
            <Table className="table-fixed w-full">
              <TableHeader className="sticky top-0 bg-card/50 backdrop-blur-sm z-10">
                <TableRow className="border-border">
                  {columns.map((column) => (
                    <SortableTableHead key={column} column={column} />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedData().map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-border hover:bg-muted/50"
                  >
                    {Object.values(row).map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="text-foreground/90 whitespace-nowrap max-w-[200px] truncate"
                      >
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
      </div>
    </div>
  );
};

export default AdminTableLayout;
