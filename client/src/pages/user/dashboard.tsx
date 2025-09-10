import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp } from "lucide-react";
import CourseCard from "@/components/CourseCard";

// Types
interface Course {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  estimatedDuration: string | null;
  difficultyLevel: string | null;
  level: string;
  imageUrl: string | null;
  moduleId: number;
  courseType: string;
  showDuration: boolean;
  showLevel: boolean;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CourseProgress {
  id: number;
  userId: number;
  courseId: number;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage: string; // This comes as a string from the database
  startedAt: string;
  completedAt: string;
}

interface UserProgress {
  courseProgress: CourseProgress[];
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user progress and courses
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) return;

      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;

        // Fetch user progress
        const progressResponse = await fetch(
          `${baseUrl}/api/progress/courses/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          console.log("Progress API Response:", progressResult);
          if (progressResult.success && progressResult.data) {
            setUserProgress(progressResult.data);
          }
        }

        // Fetch all courses
        const coursesResponse = await fetch(`${baseUrl}/api/training/courses`);
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          console.log("Courses API Response:", coursesResult);
          if (coursesResult.success && coursesResult.data) {
            setCourses(coursesResult.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  // Get courses with progress > 0%
  const getInProgressCourses = () => {
    console.log("getInProgressCourses - userProgress:", userProgress);
    console.log("getInProgressCourses - courses:", courses);

    if (
      !userProgress ||
      !userProgress.courseProgress ||
      !Array.isArray(userProgress.courseProgress) ||
      !courses ||
      !Array.isArray(courses)
    ) {
      console.log(
        "getInProgressCourses - returning empty array due to missing data"
      );
      return [];
    }

    return courses
      .map((course) => {
        const progress = userProgress.courseProgress.find(
          (p) => p.courseId === course.id
        );
        const progressPercentage = progress
          ? parseFloat(progress.completionPercentage)
          : 0;
        return {
          ...course,
          progress: progressPercentage,
          status: progress?.status || "not_started",
        };
      })
      .filter((course) => course.progress > 0 && course.progress < 100);
  };

  // Get recommended courses (from same modules as in-progress courses)
  const getRecommendedCourses = () => {
    if (
      !userProgress ||
      !userProgress.courseProgress ||
      !Array.isArray(userProgress.courseProgress) ||
      !courses ||
      !Array.isArray(courses)
    ) {
      return [];
    }

    const inProgressCourses = getInProgressCourses();
    const inProgressModuleIds = inProgressCourses.map(
      (course) => course.moduleId
    );

    return courses
      .map((course) => {
        const progress = userProgress.courseProgress.find(
          (p) => p.courseId === course.id
        );
        const progressPercentage = progress
          ? parseFloat(progress.completionPercentage)
          : 0;
        return {
          ...course,
          progress: progressPercentage,
          status: progress?.status || "not_started",
        };
      })
      .filter(
        (course) =>
          inProgressModuleIds.includes(course.moduleId) && course.progress === 0
      )
      .slice(0, 6); // Limit to 6 recommendations
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc]"></div>
      </div>
    );
  }

  const inProgressCourses = getInProgressCourses();
  const recommendedCourses = getRecommendedCourses();

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Continue your journey in becoming an exceptional hospitality
                professional.
              </p>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {userProgress?.courseProgress?.length || 0} Courses Enrolled
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Progress Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
        {inProgressCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.name}
                description={course.description || "No description available"}
                duration={formatDuration(course.duration)}
                difficulty={
                  course.level as "beginner" | "intermediate" | "advanced"
                }
                progress={Math.round(course.progress)}
                image={course.imageUrl || undefined}
                onStart={() => {
                  // Navigate to course
                  window.location.href = `/user/course/${course.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#003451]" />
            <h3 className="text-lg font-semibold mb-2 text-[#003451]">
              No courses in progress
            </h3>
            <Button
              className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white w-fit mx-auto"
              onClick={() => {
                // Navigate to courses page
                window.location.href = "/user/courses";
              }}
            >
              Browse Courses
            </Button>
            <p className="text-gray-600 mb-4">
              Start a new course to see your progress here.
            </p>
          </Card>
        )}
      </div>

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {recommendedCourses.map((course) => (
              <div key={course.id} className="min-w-[300px] flex-shrink-0">
                <CourseCard
                  title={course.name}
                  description={course.description || "No description available"}
                  duration={formatDuration(course.duration)}
                  difficulty={
                    course.level as "beginner" | "intermediate" | "advanced"
                  }
                  progress={Math.round(course.progress)}
                  image={course.imageUrl || undefined}
                  onStart={() => {
                    // Navigate to course
                    window.location.href = `/user/course/${course.id}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
