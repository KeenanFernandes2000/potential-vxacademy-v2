import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, CheckCircle } from "lucide-react";
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
  lastAccessedAt?: string;
  timeSpent?: number; // in minutes
}

// The API returns progress data directly as an array, not wrapped in courseProgress
type ProgressApiResponse = CourseProgress[];

interface EnhancedCourse extends Course {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const [userProgress, setUserProgress] = useState<ProgressApiResponse | null>(
    null
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user progress and courses
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) return;

      try {
        const baseUrl = import.meta.env.VITE_API_URL;

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
          if (progressResult.success && progressResult.data) {
            setUserProgress(progressResult.data);
          }
        }

        // Fetch all courses
        const coursesResponse = await fetch(`${baseUrl}/api/training/courses`);
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
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

  // Get courses that have progress (only show courses with progress > 0 or status = "in_progress")
  const getInProgressCourses = (): EnhancedCourse[] => {
    if (
      !userProgress ||
      !Array.isArray(userProgress) ||
      !courses ||
      !Array.isArray(courses)
    ) {
      return [];
    }

    return courses
      .map((course) => {
        const progress = userProgress.find((p) => p.courseId === course.id);
        const progressPercentage = progress
          ? parseFloat(progress.completionPercentage)
          : 0;
        const status = progress?.status || "not_started";
        return {
          ...course,
          progress: progressPercentage,
          status: status as "not_started" | "in_progress" | "completed",
        };
      })
      .filter(
        (course) =>
          // Only show courses that have progress > 0 OR are marked as in_progress
          course.progress > 0 || course.status === "in_progress"
      )
      .sort((a, b) => {
        // Sort by progress descending
        return b.progress - a.progress;
      });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Get progress statistics
  const getProgressStats = () => {
    const inProgressCourses = getInProgressCourses();
    const totalCourses = userProgress?.length || 0;
    const completedCourses =
      userProgress?.filter((p) => p.status === "completed").length || 0;
    const inProgressCount = inProgressCourses.length;
    const averageProgress =
      inProgressCourses.length > 0
        ? Math.round(
            inProgressCourses.reduce(
              (sum, course) => sum + course.progress,
              0
            ) / inProgressCourses.length
          )
        : 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCount,
      averageProgress,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc]"></div>
      </div>
    );
  }

  const inProgressCourses = getInProgressCourses();
  const progressStats = getProgressStats();

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.firstName}!
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Continue your journey in becoming an exceptional hospitality
                professional.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span className="text-lg font-semibold">
                    {progressStats.totalCourses} Courses Enrolled
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-lg font-semibold">
                    {progressStats.completedCourses} Completed
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-lg font-semibold">
                    0 Certificates Earned
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Progress Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Courses in Progress</h2>
        </div>

        {inProgressCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.name}
                courseId={course.id}
                description={course.description || "No description available"}
                duration={formatDuration(course.duration)}
                difficulty={
                  course.level as "beginner" | "intermediate" | "advanced"
                }
                progress={Math.round(course.progress)}
                image={course.imageUrl || undefined}
                onStart={() => {
                  window.location.href = `/user/courses/${course.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#00d8cc] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Courses in Progress
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                You don't have any courses in progress at the moment. Browse our
                course catalog and begin your learning journey today!
              </p>
              <div className="space-y-4">
                <Button
                  className="bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => {
                    window.location.href = "/user/courses";
                  }}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse All Courses
                </Button>
                <div className="text-sm text-gray-500">
                  <p>• Choose from our comprehensive course library</p>
                  <p>• Learn at your own pace</p>
                  <p>• Track your progress and achievements</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
