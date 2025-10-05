import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import ComingSoonCourseCard, {
  comingSoonCourses,
} from "@/components/ComingSoonCourseCard";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDownIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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

  // Custom dropdown states
  const [isTrainingAreaOpen, setIsTrainingAreaOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const trainingAreaRef = useRef<HTMLDivElement>(null);
  const moduleRef = useRef<HTMLDivElement>(null);

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
    setIsTrainingAreaOpen(false);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        trainingAreaRef.current &&
        !trainingAreaRef.current.contains(event.target as Node)
      ) {
        setIsTrainingAreaOpen(false);
      }
      if (
        moduleRef.current &&
        !moduleRef.current.contains(event.target as Node)
      ) {
        setIsModuleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              className="bg-dawn hover:bg-[#B85A1A] text-[#2C2C2C] px-4 py-2 rounded"
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
      <div className="bg-white p-6 rounded-lg border border-[#E5E5E5]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Training Area Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Training Area
            </label>
            <div className="relative" ref={trainingAreaRef}>
              <button
                type="button"
                onClick={() => setIsTrainingAreaOpen(!isTrainingAreaOpen)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d8cc]/20 focus:border-[#00d8cc] transition-all duration-200 cursor-pointer hover:border-gray-300 hover:shadow-sm shadow-sm font-medium flex items-center justify-between"
              >
                <span>
                  {selectedTrainingArea
                    ? trainingAreas.find(
                        (area) => area.id === selectedTrainingArea
                      )?.name
                    : "All Training Areas"}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isTrainingAreaOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isTrainingAreaOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => handleTrainingAreaChange(null)}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150"
                  >
                    All Training Areas
                  </button>
                  {trainingAreas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => handleTrainingAreaChange(area.id)}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150"
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Module
            </label>
            <div className="relative" ref={moduleRef}>
              <button
                type="button"
                onClick={() =>
                  selectedTrainingArea && setIsModuleOpen(!isModuleOpen)
                }
                disabled={!selectedTrainingArea}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d8cc]/20 focus:border-[#00d8cc] transition-all duration-200 shadow-sm font-medium flex items-center justify-between ${
                  !selectedTrainingArea
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400"
                    : "bg-white border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm text-gray-900"
                }`}
              >
                <span>
                  {selectedModule
                    ? getFilteredModules().find(
                        (module) => module.id === selectedModule
                      )?.name
                    : "All Modules"}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    !selectedTrainingArea ? "text-gray-300" : "text-gray-500"
                  } ${isModuleOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isModuleOpen && selectedTrainingArea && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModule(null);
                      setIsModuleOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150"
                  >
                    All Modules
                  </button>
                  {getFilteredModules().map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => {
                        setSelectedModule(module.id);
                        setIsModuleOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-150"
                    >
                      {module.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                    <h2 className="text-2xl font-semibold text-[#2C2C2C]">
                      {trainingArea.name}
                    </h2>
                  </div>

                  {/* Modules */}
                  {modulesWithCourses.map(
                    ({ module, courses: moduleCourses }) => (
                      <div key={module.id} className="space-y-4">
                        {/* Module Header */}
                        <div className="ml-4">
                          <h3 className="text-xl font-medium text-muted-foreground">
                            {module.name}
                          </h3>
                        </div>

                        {/* Courses Grid */}
                        <div className="ml-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {moduleCourses
                            .sort((a, b) => a.id - b.id)
                            .map((course) => (
                              <CourseCard
                                key={course.id}
                                title={course.name}
                                courseId={course.id}
                                description={
                                  course.description ||
                                  "No description available"
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

      {/* Courses Coming Soon Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Courses Coming Soon</h2>
          <p className="text-gray-600">Exciting new courses are on the way!</p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-[90%] ml-16 lg:mx-20"
        >
          <CarouselContent className="w-full">
            {comingSoonCourses.map((course) => (
              <CarouselItem
                key={course.id}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 "
              >
                <ComingSoonCourseCard
                  title={course.name}
                  image={course.imageUrl}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white hover:bg-sandstone border-sandstone text-[#2C2C2C] hover:text-dawn" />
          <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white hover:bg-sandstone border-sandstone text-[#2C2C2C] hover:text-dawn" />
        </Carousel>
      </div>
    </div>
  );
};

export default Courses;
