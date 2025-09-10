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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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

  async getLearningBlocksByUnit(unitId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const courseId = parseInt(id || "1");

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
            const [learningBlocksResponse, assessmentsResponse] =
              await Promise.all([
                api.getLearningBlocksByUnit(courseUnit.unitId, token),
                api.getAssessmentsByUnit(courseUnit.unitId, token),
              ]);

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
              name: courseUnit.unit?.name || "Unit",
              description: courseUnit.unit?.description || "",
              order: courseUnit.order || 1,
              duration: courseUnit.unit?.duration || 0,
              xpPoints: courseUnit.unit?.xpPoints || 0,
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

        // Calculate overall course progress
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
        const progressPercentage =
          totalBlocks > 0
            ? Math.round((completedBlocks / totalBlocks) * 100)
            : 0;

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
        {/* Course Details Card */}
        <CourseDetailsCard course={course} />

        {/* Course Content Layout */}
        <CourseContentLayout
          units={course.units}
          onCompleteLearningBlock={async (learningBlockId: number) => {
            if (token && user) {
              try {
                await api.completeLearningBlock(
                  learningBlockId,
                  user.id,
                  token
                );
                // Refresh course data to update progress
                window.location.reload();
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
