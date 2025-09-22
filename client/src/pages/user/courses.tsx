import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { useAuth } from "@/hooks/useAuth";

// Types for the API responses
interface TrainingArea {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: number;
  name: string;
  trainingAreaId: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  name: string;
  moduleId: number;
  duration: number;
  description: string | null;
  imageUrl: string | null;
  internalNote: string | null;
  courseType: "free" | "premium";
  showDuration: boolean;
  level: "beginner" | "intermediate" | "advanced";
  showLevel: boolean;
  estimatedDuration: string | null;
  difficultyLevel: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CourseWithProgress extends Course {
  progress: number;
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

  async getUserProgress(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/courses/${userId}`,
        {
          headers: {
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
      console.error("Failed to fetch user progress:", error);
      throw error;
    }
  },
};

const Courses = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [trainingAreas, setTrainingAreas] = useState<TrainingArea[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<{
    [courseId: number]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedTrainingArea, setSelectedTrainingArea] = useState<
    number | null
  >(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Helper function to get course progress
  // Progress data comes from /api/progress/courses/:userId endpoint
  const getCourseProgress = (courseId: number): number => {
    return userProgress[courseId] || 0;
  };

  // Helper function to get difficulty level
  const getDifficultyLevel = (
    course: Course
  ): "beginner" | "intermediate" | "advanced" => {
    if (course.difficultyLevel) {
      const level = course.difficultyLevel.toLowerCase();
      if (level.includes("beginner")) return "beginner";
      if (level.includes("intermediate")) return "intermediate";
      if (level.includes("advanced")) return "advanced";
    }
    return course.level;
  };

  // Filter courses based on selected training area and module
  const getFilteredCourses = () => {
    return courses.filter((course) => {
      const courseModule = modules.find(
        (module) => module.id === course.moduleId
      );
      if (!courseModule) return false;

      // Filter by training area
      if (
        selectedTrainingArea &&
        courseModule.trainingAreaId !== selectedTrainingArea
      ) {
        return false;
      }

      // Filter by module
      if (selectedModule && course.moduleId !== selectedModule) {
        return false;
      }

      return true;
    });
  };

  // Get modules for selected training area
  const getFilteredModules = () => {
    if (!selectedTrainingArea) return modules;
    return modules.filter(
      (module) => module.trainingAreaId === selectedTrainingArea
    );
  };

  // Reset module filter when training area changes
  const handleTrainingAreaChange = (trainingAreaId: number | null) => {
    setSelectedTrainingArea(trainingAreaId);
    setSelectedModule(null); // Reset module filter
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch training areas
        const trainingAreasResponse = await api.getAllTrainingAreas();
        if (trainingAreasResponse.success) {
          setTrainingAreas(trainingAreasResponse.data);
        }

        // Fetch user progress
        try {
          const progressResponse = await api.getUserProgress(user.id, token);
          if (progressResponse.success && progressResponse.data) {
            const progressMap: { [courseId: number]: number } = {};
            // The backend returns an array of course progress objects directly
            if (Array.isArray(progressResponse.data)) {
              progressResponse.data.forEach((progress: any) => {
                if (
                  progress.courseId &&
                  progress.completionPercentage !== undefined
                ) {
                  progressMap[progress.courseId] =
                    parseFloat(progress.completionPercentage) || 0;
                }
              });
            }
            setUserProgress(progressMap);
          }
        } catch (progressError) {
          console.warn(
            "Failed to fetch user progress, continuing without progress data:",
            progressError
          );
          // Continue without progress data - courses will show 0% progress
        }

        // Fetch modules for each training area
        const allModules: Module[] = [];
        for (const trainingArea of trainingAreasResponse.data || []) {
          const modulesResponse = await api.getModulesByTrainingArea(
            trainingArea.id
          );
          if (modulesResponse.success) {
            allModules.push(...modulesResponse.data);
          }
        }
        setModules(allModules);

        // Fetch courses for each module
        const allCourses: Course[] = [];
        for (const module of allModules) {
          const coursesResponse = await api.getCoursesByModule(module.id);
          if (coursesResponse.success) {
            allCourses.push(...coursesResponse.data);
          }
        }
        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching courses data:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, token]);

  const handleCourseStart = (courseId: number) => {
    navigate(`/user/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Track your learning progress and access your enrolled courses.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Track your learning progress and access your enrolled courses.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Access your VX Academy courses</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Area Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Training Area
            </label>
            <select
              value={selectedTrainingArea || ""}
              onChange={(e) =>
                handleTrainingAreaChange(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-[#00d8cc] transition-colors"
            >
              <option value="" className="bg-gray-700 text-white">
                All Training Areas
              </option>
              {trainingAreas.map((area) => (
                <option
                  key={area.id}
                  value={area.id}
                  className="bg-gray-700 text-white"
                >
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Module
            </label>
            <select
              value={selectedModule || ""}
              onChange={(e) =>
                setSelectedModule(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className={`w-full px-4 py-3 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00d8cc] focus:border-[#00d8cc] transition-colors ${
                !selectedTrainingArea
                  ? "bg-gray-600 border-gray-500 cursor-not-allowed"
                  : "bg-gray-700 border-gray-600"
              }`}
              disabled={!selectedTrainingArea}
            >
              <option value="" className="bg-gray-700 text-white">
                All Modules
              </option>
              {getFilteredModules().map((module) => (
                <option
                  key={module.id}
                  value={module.id}
                  className="bg-gray-700 text-white"
                >
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {trainingAreas.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              No courses available at the moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {(() => {
            const filteredCourses = getFilteredCourses();

            if (filteredCourses.length === 0) {
              return (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      No courses found matching your filters.
                    </p>
                  </div>
                </div>
              );
            }

            // Group courses by training area and module
            const groupedCourses = trainingAreas
              .map((trainingArea) => {
                const trainingAreaModules = modules.filter(
                  (module) => module.trainingAreaId === trainingArea.id
                );

                const modulesWithCourses = trainingAreaModules
                  .map((module) => {
                    const moduleCourses = filteredCourses.filter(
                      (course) => course.moduleId === module.id
                    );
                    return { module, courses: moduleCourses };
                  })
                  .filter(({ courses }) => courses.length > 0);

                return { trainingArea, modulesWithCourses };
              })
              .filter(
                ({ modulesWithCourses }) => modulesWithCourses.length > 0
              );

            return groupedCourses.map(
              ({ trainingArea, modulesWithCourses }) => (
                <div key={trainingArea.id} className="space-y-6">
                  {/* Training Area Header */}
                  <div className="border-b pb-4">
                    <h2 className="text-2xl font-semibold text-white">
                      {trainingArea.name}
                    </h2>
                  </div>

                  {/* Modules */}
                  {modulesWithCourses.map(
                    ({ module, courses: moduleCourses }) => (
                      <div key={module.id} className="space-y-4">
                        {/* Module Header */}
                        <div className="ml-4">
                          <h3 className="text-xl font-medium text-gray-200">
                            {module.name}
                          </h3>
                        </div>

                        {/* Courses Grid */}
                        <div className="ml-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {moduleCourses.map((course) => (
                            <CourseCard
                              key={course.id}
                              title={course.name}
                              courseId={course.id}
                              description={
                                course.description || "No description available"
                              }
                              duration={
                                course.showDuration
                                  ? formatDuration(course.duration)
                                  : ""
                              }
                              difficulty={getDifficultyLevel(course)}
                              progress={getCourseProgress(course.id)}
                              image={course.imageUrl || undefined}
                              onStart={() => handleCourseStart(course.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Courses;
