import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@mui/icons-material";
import CourseDetailsCard from "@/components/CourseDetailsCard";
import CourseContentLayout from "@/pages/user/CourseContentLayout";

// Mock course data - in a real app, this would come from an API
const mockCourseData = {
  1: {
    id: 1,
    name: "Introduction to the Code of Conduct Training",
    description:
      "Introduces the Frontliner Code of Conduct training, highlighting its purpose and structure, and outlining the core values, principles, and behaviors that shape service excellence and enhance the visitor experience across Abu Dhabi.",
    duration: 5, // in minutes
    level: "beginner",
    difficultyLevel: "Beginner",
    courseType: "free",
    showDuration: true,
    showLevel: true,
    estimatedDuration: "5 minutes",
    progress: 10,
    units: [
      {
        id: 1,
        name: "Importance of the Al Midhyaf Code of Conduct",
        description:
          "This unit introduces the purpose of the Code of Conduct for service excellence in Abu Dhabi, highlighting its role in fostering professional behavior, cultural pride, and outstanding visitor experiences across tourism assets.",
        order: 1,
        duration: 2,
        xpPoints: 100,
        learningBlocks: [
          {
            id: 1,
            type: "description",
            title: "Unit Description",
            content:
              "This unit introduces the purpose of the Code of Conduct for service excellence in Abu Dhabi, highlighting its role in fostering professional behavior, cultural pride, and outstanding visitor experiences across tourism assets.",
            order: 1,
            xpPoints: 10,
            status: "completed",
          },
          {
            id: 2,
            type: "outcomes",
            title: "Key Learning Outcomes",
            content:
              "By the end of this unit, you will understand the importance of the Code of Conduct and its impact on service excellence.",
            order: 2,
            xpPoints: 10,
            status: "not_started",
          },
          {
            id: 3,
            type: "content",
            title: "Unit Content",
            content:
              "Interactive content and videos explaining the Code of Conduct principles.",
            videoUrl: "https://example.com/video1",
            order: 3,
            xpPoints: 20,
            status: "not_started",
          },
          {
            id: 4,
            type: "summary",
            title: "Unit Summary",
            content: "Summary of key points covered in this unit.",
            order: 4,
            xpPoints: 10,
            status: "not_started",
          },
        ],
        assessments: [
          {
            id: 1,
            title: "Importance of the Code of Conduct Assessment",
            description:
              "Test your understanding of the Code of Conduct principles.",
            placement: "end",
            xpPoints: 50,
            status: "not_started",
            questions: 3,
            passingScore: 70,
            maxRetakes: 3,
            attemptsUsed: 0,
          },
        ],
      },
      {
        id: 2,
        name: "Structure of the Code of Conduct",
        description:
          "Learn about the organizational structure and key components of the Code of Conduct.",
        order: 2,
        duration: 3,
        xpPoints: 100,
        learningBlocks: [
          {
            id: 5,
            type: "description",
            title: "Unit Description",
            content:
              "This unit covers the structure and organization of the Code of Conduct document.",
            order: 1,
            xpPoints: 10,
            status: "not_started",
          },
        ],
        assessments: [],
      },
    ],
  },
};

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const courseId = parseInt(id || "1");
  const course = mockCourseData[courseId as keyof typeof mockCourseData];


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
        {/* Debug Info */}

        {/* Course Details Card */}
        {course && <CourseDetailsCard course={course} />}

        {/* Course Content Layout */}
        {course && <CourseContentLayout units={course.units} />}
      </div>
    </div>
  );
};

export default CourseDetails;
