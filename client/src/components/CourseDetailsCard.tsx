import React from "react";
import { AccessTime as Clock } from "@mui/icons-material";

interface CourseDetailsCardProps {
  course: {
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
  };
}

const CourseDetailsCard: React.FC<CourseDetailsCardProps> = ({ course }) => {
  return (
    <div className="bg-white shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {course.name}
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            {course.description}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>{course.estimatedDuration}</span>
            </div>
          </div>
        </div>
        <div className="bg-white border p-4 min-w-[200px]">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Course Progress
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gray-800 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {Math.round(course.progress)}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsCard;
