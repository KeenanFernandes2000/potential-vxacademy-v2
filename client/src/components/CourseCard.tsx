import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AccessTime as Clock,
  PlayArrowRounded as Play,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// API object for making requests
const api = {
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

  async getCourseUnitsByCourseId(courseId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/course-units/course/${courseId}/`,
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

  async getLearningBlocksByUnitId(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/training/learning-blocks/unit/${unitId}/`,
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
      console.error("Failed to fetch learning blocks by unit ID:", error);
      throw error;
    }
  },

  async completeLearningBlock(
    userId: number,
    learningBlockId: number,
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
          body: JSON.stringify({
            userId,
            learningBlockId,
          }),
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
};

interface CourseCardProps {
  title: string;
  description: string;
  duration: string; // e.g., "0h 10m"
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number; // 0-100, comes from backend progress API
  image?: string;
  courseId?: number; // Course ID for fetching course units
  onStart?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  duration,
  difficulty,
  progress,
  image,
  courseId,
  onStart,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-gray-800 text-white";
      case "intermediate":
        return "bg-yellow-600 text-white";
      case "advanced":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  const handleStart = async () => {
    const userData = localStorage.getItem("userData");
    const normalUserDetails = JSON.parse(userData || "{}")?.normalUserDetails;
    const assetId = JSON.parse(userData || "{}")?.assetId;
    const roleCategory = normalUserDetails?.roleCategory;
    const seniority = normalUserDetails?.seniority;

    if (!token) {
      console.error("No authentication token available");
      return;
    }

    try {
      // Make API calls to get seniority levels, unit role assignments, and course units
      console.log("Making API calls...");

      const apiCalls = [
        api.getAllSeniorityLevels(token),
        api.getAllUnitRoleAssignments(token),
        api.getCourseUnitsByCourseId(courseId!, token),
      ];

      const responses = await Promise.all(apiCalls);
      const [
        seniorityLevelsResponse,
        unitRoleAssignmentsResponse,
        courseUnitsResponse,
      ] = responses;

      // Print the results
      // console.log("=== SENIORITY LEVELS API RESPONSE ===");
      // console.log(seniorityLevelsResponse);

      // console.log("=== UNIT ROLE ASSIGNMENTS API RESPONSE ===");
      // console.log(unitRoleAssignmentsResponse);

      // if (courseId && courseUnitsResponse) {
      //   console.log("=== COURSE UNITS API RESPONSE ===");
      //   console.log(courseUnitsResponse);
      // }

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

        // 3. Check unit IDs from assignments against course units and find missing ones
        if (
          courseId &&
          courseUnitsResponse?.success &&
          courseUnitsResponse?.data
        ) {
          // Extract all unit IDs from filtered assignments
          const assignmentUnitIds = new Set<number>();
          filteredUnitRoleAssignments.forEach((assignment: any) => {
            if (assignment.unitIds && Array.isArray(assignment.unitIds)) {
              assignment.unitIds.forEach((unitId: number) => {
                assignmentUnitIds.add(unitId);
              });
            }
          });

          // Extract all unit IDs from course units response
          const courseUnitIds = new Set<number>();
          courseUnitsResponse.data.forEach((courseUnit: any) => {
            if (courseUnit.unitId) {
              courseUnitIds.add(courseUnit.unitId);
            }
          });

          // Find unit IDs that exist in course units but not in assignments
          const missingUnitIds = Array.from(courseUnitIds).filter(
            (unitId) => !assignmentUnitIds.has(unitId)
          );

          console.log("=== UNIT ID COMPARISON ===");
          console.log(
            "Unit IDs from assignments:",
            Array.from(assignmentUnitIds)
          );
          console.log("Unit IDs from course units:", Array.from(courseUnitIds));
          console.log(
            "Missing unit IDs (in course units but not in assignments):",
            missingUnitIds
          );

          // 4. Get learning blocks for all missing unit IDs and collect learning block IDs
          if (missingUnitIds.length > 0) {
            console.log("=== FETCHING LEARNING BLOCKS FOR MISSING UNITS ===");

            try {
              // Get learning blocks for each missing unit ID
              const learningBlockPromises = missingUnitIds.map((unitId) =>
                api.getLearningBlocksByUnitId(unitId, token)
              );

              const learningBlockResponses = await Promise.all(
                learningBlockPromises
              );

              // Collect all learning block IDs from all responses
              // const allLearningBlockIds: number[] = [];
              // learningBlockResponses.forEach((response, index) => {
              //   if (response?.success && response?.data) {
              //     const unitId = missingUnitIds[index];
              //     const learningBlockIds = response.data.map(
              //       (block: any) => block.id
              //     );
              //     allLearningBlockIds.push(...learningBlockIds);

              //     console.log(
              //       `Learning blocks for unit ${unitId}:`,
              //       learningBlockIds
              //     );
              //   }
              // });

              // console.log("=== ALL LEARNING BLOCK IDS ===");
              // console.log(
              //   "All learning block IDs from missing units:",
              //   allLearningBlockIds
              // );

              // // 5. Complete all learning blocks
              // if (allLearningBlockIds.length > 0) {
              //   console.log("=== COMPLETING LEARNING BLOCKS ===");

              //   try {
              //     // Get user ID from localStorage
              //     const userId = JSON.parse(userData || "{}")?.id;

              //     if (!userId) {
              //       console.error("User ID not found in localStorage");
              //     } else {
              //       // Complete all learning blocks in parallel
              //       const completePromises = allLearningBlockIds.map(
              //         (learningBlockId) =>
              //           api.completeLearningBlock(
              //             userId,
              //             learningBlockId,
              //             token
              //           )
              //       );

              //       const completeResponses = await Promise.all(
              //         completePromises
              //       );

              //       console.log("=== LEARNING BLOCK COMPLETION RESULTS ===");
              //       completeResponses.forEach((response, index) => {
              //         const learningBlockId = allLearningBlockIds[index];
              //         if (response?.success) {
              //           console.log(
              //             `✅ Learning block ${learningBlockId} completed successfully`
              //           );
              //         } else {
              //           console.log(
              //             `❌ Learning block ${learningBlockId} failed to complete:`,
              //             response?.message || "Unknown error"
              //           );
              //         }
              //       });
              //   }
              // } catch (error) {
              //   console.error("Error completing learning blocks:", error);
              // }
              // } else {
              //   console.log("=== NO LEARNING BLOCKS TO COMPLETE ===");
              //   console.log("No learning blocks found in missing units");
              // }

              // Store missing unit IDs for navigation
              if (missingUnitIds.length > 0) {
                localStorage.setItem(
                  `missingUnitIds_${courseId}`,
                  JSON.stringify(missingUnitIds)
                );
                console.log("=== STORED MISSING UNIT IDS ===");
                console.log(
                  `Stored ${missingUnitIds.length} missing unit IDs for course ${courseId}:`,
                  missingUnitIds
                );
              }
            } catch (error) {
              console.error(
                "Error fetching learning blocks for missing units:",
                error
              );
            }
          } else {
            console.log("=== NO MISSING UNIT IDS ===");
            console.log(
              "No learning blocks to fetch - all units are covered by assignments"
            );
          }
        } else {
          console.log("=== UNIT ID COMPARISON SKIPPED ===");
          console.log(
            "Reason: courseId not provided or course units response not available"
          );
        }
      }
    } catch (error) {
      console.error("Error making API calls:", error);
    }

    // Navigate to course details page
    if (courseId) {
      navigate(`/user/courses/${courseId}`);
    }

    if (onStart) {
      onStart();
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden rounded-none py-0 flex flex-col h-full">
      {/* Course Image or Initials Fallback */}
      <div className="relative w-full h-48">
        {image && image !== "null" ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-[#00d8cc] backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-2xl font-bold text-black">
                {title
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
          </div>
        )}
        {/* Duration overlay */}
        {duration && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 flex items-center">
            <Clock className="w-3 h-3" />
            <span className="ml-1 text-xs">{duration}</span>
          </div>
        )}
      </div>

      <CardContent className="px-4 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-black mb-1 break-words min-h-[3rem] flex items-start">
          {title}
        </h3>

        {/* Course Description */}
        <p className="text-sm text-gray-500 line-clamp-3 h-16 overflow-hidden flex-1">
          {description}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4 mt-auto">
        <div className="w-full">
          {/* Progress Section */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Course Progress
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-300 bg-[#00d8cc]`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Start/Continue Button */}
          <Button
            onClick={handleStart}
            className="w-full bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white font-semibold py-2 px-4 shadow-sm transition-colors duration-200"
          >
            <Play className="w-4 h-4 mr-2" />
            {progress === 0 ? "Start" : "Continue"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
