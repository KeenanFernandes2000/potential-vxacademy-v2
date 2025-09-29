import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@mui/icons-material";
import CourseDetailsCard from "@/components/CourseDetailsCard";
import CourseContentLayout from "@/pages/user/courseContentLayout";
import { useAuth } from "@/hooks/useAuth";

// API object for course operations
const api = {
  async getCourseById(courseId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/courses/${courseId}`,
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
      console.error("Failed to fetch course:", error);
      throw error;
    }
  },

  async getCourseUnitsByCourse(courseId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/course-units/course/${courseId}`,
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
      console.error("Failed to fetch course units:", error);
      throw error;
    }
  },

  async getUnitById(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units/${unitId}`, {
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
      console.error("Failed to fetch unit details:", error);
      throw error;
    }
  },

  async getLearningBlocksByUnit(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/learning-blocks/unit/${unitId}`,
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
      console.error("Failed to fetch learning blocks:", error);
      throw error;
    }
  },

  async getUserLearningBlockProgress(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/learning-blocks/${userId}`,
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
      console.error("Failed to fetch user learning block progress:", error);
      throw error;
    }
  },

  async getAssessmentsByUnit(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/assessments/units/${unitId}`,
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
      console.error("Failed to fetch assessments by unit:", error);
      throw error;
    }
  },

  async getAssessmentAttemptsByUserAndAssessment(
    userId: number,
    assessmentId: number,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/users/${userId}/assessments/${assessmentId}/attempts`,
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
      console.error("Failed to fetch assessment attempts:", error);
      throw error;
    }
  },

  async completeLearningBlock(
    learningBlockId: number,
    userId: number,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/learning-blocks/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ learningBlockId, userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to complete learning block:", error);
      throw error;
    }
  },

  async recalculateUserProgress(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/user/${userId}/recalculate`,
        {
          method: "POST",
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
      console.error("Failed to recalculate user progress:", error);
      throw error;
    }
  },

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

  async getAllUnitRoleAssignments(token: string) {
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
      console.error("Failed to fetch unit role assignments:", error);
      throw error;
    }
  },

  async getUserCourseProgress(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/courses/${userId}`,
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
      console.error("Failed to fetch user course progress:", error);
      throw error;
    }
  },
};

// Interface for course data structure
interface CourseData {
  id: number;
  name: string;
  description: string;
  duration: number;
  level: string;
  difficultyLevel: string;
  courseType: string;
  showDuration: boolean;
  showLevel: boolean;
  estimatedDuration: string;
  progress: number;
  units: Unit[];
}

interface Unit {
  id: number;
  name: string;
  description: string;
  order: number;
  duration: number;
  xpPoints: number;
  learningBlocks: LearningBlock[];
  assessments: Assessment[];
}

interface LearningBlock {
  id: number;
  type: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  xpPoints: number;
  status: string;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  placement: string;
  xpPoints: number;
  status: string;
  questions: number;
  passingScore: number;
  maxRetakes: number;
  attemptsUsed: number;
}

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const courseId = parseInt(id || "1");

  // Filter units based on user role assignments
  const filterUnitsBasedOnRoleAssignments = async (
    units: Unit[],
    token: string
  ) => {
    try {
      const userData = localStorage.getItem("userData");
      const normalUserDetails = JSON.parse(userData || "{}")?.normalUserDetails;
      const assetId = JSON.parse(userData || "{}")?.assetId;
      const roleCategory = normalUserDetails?.roleCategory;
      const seniority = normalUserDetails?.seniority;

      console.log("=== FILTERING UNITS BASED ON ROLE ASSIGNMENTS ===");

      // Make API calls to get seniority levels and unit role assignments
      const [seniorityLevelsResponse, unitRoleAssignmentsResponse] =
        await Promise.all([
          api.getAllSeniorityLevels(token),
          api.getAllUnitRoleAssignments(token),
        ]);

      // 1. Check if seniority = 'manager' and get manager ID from seniority API response
      let managerId = null;
      if (
        seniority === "manager" &&
        seniorityLevelsResponse?.success &&
        seniorityLevelsResponse?.data
      ) {
        const managerLevel = seniorityLevelsResponse.data.find(
          (level: any) => level.name?.toLowerCase() === "manager"
        );
        if (managerLevel) {
          managerId = managerLevel.id;
          console.log("=== MANAGER ID FOUND ===");
          console.log("Manager ID:", managerId);
        } else {
          console.log("=== MANAGER NOT FOUND IN SENIORITY LEVELS ===");
        }
      }

      // 2. Filter Unit Role Assignments by assetId, roleCategory (converted to int), and seniorityLevelId
      let filteredUnitRoleAssignments = [];
      if (
        unitRoleAssignmentsResponse?.success &&
        unitRoleAssignmentsResponse?.data
      ) {
        const roleCategoryInt = parseInt(roleCategory);

        // Build filter criteria
        const filterCriteria = [
          (assignment: any) => assignment.assetId === assetId,
          (assignment: any) => assignment.roleCategoryId === roleCategoryInt,
        ];

        // Add seniorityLevelId filter only if we found a manager ID
        if (managerId !== null) {
          filterCriteria.push(
            (assignment: any) => assignment.seniorityLevelId === managerId
          );
        }

        filteredUnitRoleAssignments = unitRoleAssignmentsResponse.data.filter(
          (assignment: any) =>
            filterCriteria.every((criteria) => criteria(assignment))
        );

        console.log("=== FILTERED UNIT ROLE ASSIGNMENTS ===");
        console.log(
          "Filter criteria - assetId:",
          assetId,
          "roleCategory:",
          roleCategoryInt,
          "managerId:",
          managerId
        );
        console.log("Filtered assignments:", filteredUnitRoleAssignments);

        // 3. Extract all unit IDs from filtered assignments
        const assignmentUnitIds = new Set<number>();
        filteredUnitRoleAssignments.forEach((assignment: any) => {
          if (assignment.unitIds && Array.isArray(assignment.unitIds)) {
            assignment.unitIds.forEach((unitId: number) => {
              assignmentUnitIds.add(unitId);
            });
          }
        });

        // 4. Filter units to only include those the user has access to
        const accessibleUnits = units.filter((unit) =>
          assignmentUnitIds.has(unit.id)
        );

        console.log("=== UNIT FILTERING RESULTS ===");
        console.log(
          "All course units:",
          units.map((u) => u.id)
        );
        console.log("User accessible unit IDs:", Array.from(assignmentUnitIds));
        console.log(
          "Filtered accessible units:",
          accessibleUnits.map((u) => u.id)
        );

        setFilteredUnits(accessibleUnits);
      } else {
        // If no role assignments found, show no units
        console.log("=== NO ROLE ASSIGNMENTS FOUND ===");
        setFilteredUnits([]);
      }
    } catch (error) {
      console.error("Error filtering units:", error);
      // On error, show all units as fallback
      setFilteredUnits(units);
    }
  };

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!token || !user) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Fetch course details
        const courseResponse = await api.getCourseById(courseId, token);
        const courseData = courseResponse.data;

        // Fetch course units
        const courseUnitsResponse = await api.getCourseUnitsByCourse(
          courseId,
          token
        );
        const courseUnits = courseUnitsResponse.data || [];

        // Fetch learning blocks and assessments for each unit
        const unitsWithLearningBlocks = await Promise.all(
          courseUnits.map(async (courseUnit: any) => {
            try {
              const [
                unitDetailsResponse,
                learningBlocksResponse,
                assessmentsResponse,
              ] = await Promise.all([
                api.getUnitById(courseUnit.unitId, token),
                api.getLearningBlocksByUnit(courseUnit.unitId, token),
                api.getAssessmentsByUnit(courseUnit.unitId, token),
              ]);

              const unitDetails = unitDetailsResponse.data || {};
              const learningBlocks = learningBlocksResponse.data || [];
              const assessments = assessmentsResponse.data || [];

              // Fetch assessment attempts for each assessment
              const assessmentsWithAttempts = await Promise.all(
                assessments.map(async (assessment: any) => {
                  try {
                    const attemptsResponse =
                      await api.getAssessmentAttemptsByUserAndAssessment(
                        user.id,
                        assessment.id,
                        token
                      );
                    const attempts = attemptsResponse.data || [];

                    return {
                      id: assessment.id,
                      title: assessment.title,
                      description: assessment.description,
                      placement: assessment.placement || "end",
                      xpPoints: assessment.xpPoints || 0,
                      status: attempts.length > 0 ? "completed" : "not_started",
                      questions: assessment.questions?.length || 0,
                      passingScore: assessment.passingScore || 70,
                      maxRetakes: assessment.maxRetakes || 3,
                      attemptsUsed: attempts.length,
                    };
                  } catch (error) {
                    console.error(
                      `Failed to fetch attempts for assessment ${assessment.id}:`,
                      error
                    );
                    return {
                      id: assessment.id,
                      title: assessment.title,
                      description: assessment.description,
                      placement: assessment.placement || "end",
                      xpPoints: assessment.xpPoints || 0,
                      status: "not_started",
                      questions: assessment.questions?.length || 0,
                      passingScore: assessment.passingScore || 70,
                      maxRetakes: assessment.maxRetakes || 3,
                      attemptsUsed: 0,
                    };
                  }
                })
              );

              return {
                id: courseUnit.unitId,
                name: unitDetails.name || "Unit",
                description: unitDetails.description || "",
                order: courseUnit.order || 1,
                duration: unitDetails.duration || 0,
                xpPoints: unitDetails.xpPoints || 0,
                learningBlocks: learningBlocks.map((block: any) => ({
                  id: block.id,
                  type: block.type || "content",
                  title: block.title,
                  content: block.content,
                  videoUrl: block.videoUrl,
                  order: block.order || 1,
                  xpPoints: block.xpPoints || 0,
                  status: "not_started", // Will be updated with progress data
                })),
                assessments: assessmentsWithAttempts,
              };
            } catch (error) {
              console.error(
                `Failed to fetch details for unit ${courseUnit.unitId}:`,
                error
              );
              // Return a fallback unit object if fetching fails
              return {
                id: courseUnit.unitId,
                name: "Unit",
                description: "",
                order: courseUnit.order || 1,
                duration: 0,
                xpPoints: 0,
                learningBlocks: [],
                assessments: [],
              };
            }
          })
        );

        // Fetch user learning block progress to update status
        const progressResponse = await api.getUserLearningBlockProgress(
          user.id,
          token
        );
        const progressData = progressResponse.data || [];

        // Update learning block statuses based on progress
        const unitsWithProgress = unitsWithLearningBlocks.map((unit) => ({
          ...unit,
          learningBlocks: unit.learningBlocks.map((block: LearningBlock) => {
            const blockProgress = progressData.find(
              (p: any) => p.learningBlockId === block.id
            );
            return {
              ...block,
              status: blockProgress?.status || "not_started",
            };
          }),
        }));

        // Fetch course progress from the same API endpoint used by course cards
        let progressPercentage = 0;
        try {
          const courseProgressResponse = await api.getUserCourseProgress(
            user.id,
            token
          );
          if (courseProgressResponse.success && courseProgressResponse.data) {
            const courseProgress = courseProgressResponse.data.find(
              (progress: any) => progress.courseId === courseId
            );
            if (
              courseProgress &&
              courseProgress.completionPercentage !== undefined
            ) {
              progressPercentage =
                parseFloat(courseProgress.completionPercentage) || 0;
            }
          }
        } catch (progressError) {
          console.warn(
            "Failed to fetch course progress, using calculated progress:",
            progressError
          );
          // Fallback to calculated progress if API fails
          const totalBlocks = unitsWithProgress.reduce(
            (sum, unit) => sum + unit.learningBlocks.length,
            0
          );
          const completedBlocks = unitsWithProgress.reduce(
            (sum, unit) =>
              sum +
              unit.learningBlocks.filter(
                (block: LearningBlock) => block.status === "completed"
              ).length,
            0
          );
          progressPercentage =
            totalBlocks > 0
              ? Math.round((completedBlocks / totalBlocks) * 100)
              : 0;
        }

        // Transform course data to match expected structure
        const transformedCourse: CourseData = {
          id: courseData.id,
          name: courseData.name,
          description: courseData.description,
          duration: courseData.duration || 0,
          level: courseData.level || "beginner",
          difficultyLevel: courseData.difficultyLevel || "Beginner",
          courseType: courseData.courseType || "free",
          showDuration: true,
          showLevel: true,
          estimatedDuration: courseData.duration
            ? `${courseData.duration} minutes`
            : "Unknown",
          progress: progressPercentage,
          units: unitsWithProgress,
        };

        setCourse(transformedCourse);

        // Filter units based on user role assignments
        await filterUnitsBasedOnRoleAssignments(transformedCourse.units, token);

        // Show all units instead of filtering
        setFilteredUnits(transformedCourse.units);
      } catch (error: any) {
        console.error("Error fetching course data:", error);
        setError(error.message || "Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, token, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Course
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/user/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <Button onClick={() => navigate("/user/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/user/courses")}
            variant="outline"
            className="flex items-center gap-2 text-[#2C2C2C] hover:text-[#2C2C2C]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Button>
        </div>

        {/* Course Details Card */}
        <CourseDetailsCard course={course} />

        {/* Course Content Layout */}
        <CourseContentLayout
          units={filteredUnits}
          courseId={courseId}
          onUpdateCourseProgress={(progress: number) => {
            setCourse((prevCourse) => {
              if (!prevCourse) return prevCourse;
              return {
                ...prevCourse,
                progress: progress,
              };
            });
          }}
          onUpdateAssessmentStatus={(
            assessmentId: number,
            status: string,
            attemptsUsed: number
          ) => {
            // Update assessment status in course units
            setCourse((prevCourse) => {
              if (!prevCourse) return prevCourse;
              return {
                ...prevCourse,
                units: prevCourse.units.map((unit) => ({
                  ...unit,
                  assessments: unit.assessments.map((assessment) =>
                    assessment.id === assessmentId
                      ? { ...assessment, status, attemptsUsed }
                      : assessment
                  ),
                })),
              };
            });

            // Also update filtered units
            setFilteredUnits((prevFilteredUnits) => {
              return prevFilteredUnits.map((unit) => ({
                ...unit,
                assessments: unit.assessments.map((assessment) =>
                  assessment.id === assessmentId
                    ? { ...assessment, status, attemptsUsed }
                    : assessment
                ),
              }));
            });
          }}
          onCompleteLearningBlock={async (learningBlockId: number) => {
            if (token && user) {
              try {
                await api.completeLearningBlock(
                  learningBlockId,
                  user.id,
                  token
                );

                // Update the specific learning block status in state
                setCourse((prevCourse) => {
                  if (!prevCourse) return prevCourse;

                  const updatedUnits = prevCourse.units.map((unit) => ({
                    ...unit,
                    learningBlocks: unit.learningBlocks.map((block) =>
                      block.id === learningBlockId
                        ? { ...block, status: "completed" }
                        : block
                    ),
                  }));

                  return {
                    ...prevCourse,
                    units: updatedUnits,
                  };
                });

                // Also update the filtered units to reflect the changes
                setFilteredUnits((prevFilteredUnits) => {
                  return prevFilteredUnits.map((unit) => ({
                    ...unit,
                    learningBlocks: unit.learningBlocks.map((block) =>
                      block.id === learningBlockId
                        ? { ...block, status: "completed" }
                        : block
                    ),
                  }));
                });

                // Fetch updated course progress from API to ensure consistency
                try {
                  const courseProgressResponse =
                    await api.getUserCourseProgress(user.id, token);
                  if (
                    courseProgressResponse.success &&
                    courseProgressResponse.data
                  ) {
                    const courseProgress = courseProgressResponse.data.find(
                      (progress: any) => progress.courseId === courseId
                    );
                    if (
                      courseProgress &&
                      courseProgress.completionPercentage !== undefined
                    ) {
                      const updatedProgress =
                        parseFloat(courseProgress.completionPercentage) || 0;
                      setCourse((prevCourse) => {
                        if (!prevCourse) return prevCourse;
                        return {
                          ...prevCourse,
                          progress: updatedProgress,
                        };
                      });
                    }
                  }
                } catch (progressError) {
                  console.warn(
                    "Failed to fetch updated course progress:",
                    progressError
                  );
                }
              } catch (error) {
                console.error("Failed to complete learning block:", error);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default CourseDetails;
