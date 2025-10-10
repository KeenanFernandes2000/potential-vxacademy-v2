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
    <div className="bg-white shadow-sm p-3 sm:p-4 md:p-6 rounded-lg">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 sm:gap-4 lg:gap-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {course.name}
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4">
            {course.description}
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>{course.estimatedDuration}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg w-full lg:w-auto lg:min-w-[200px]">
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
