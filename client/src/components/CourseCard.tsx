import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AccessTime as Clock,
  PlayArrowRounded as Play,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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

  const handleStart = () => {
    // If onStart is provided, use it (for custom behavior like opening in new tab)
    if (onStart) {
      onStart();
    } else if (courseId) {
      // Default behavior: navigate to course details page
      navigate(`/user/courses/${courseId}`);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg py-0 flex flex-col h-full group hover:border-gray-300">
      {/* Course Image or Initials Fallback */}
      <div className="relative w-full h-48 overflow-hidden">
        {image && image !== "null" ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sandstone to-sandstone/80">
            <div className="w-20 h-20 bg-dawn backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
              <span className="text-2xl font-bold text-white">
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
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1.5 flex items-center rounded-full backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span className="ml-1.5 text-xs font-medium">{duration}</span>
          </div>
        )}
      </div>

      <CardContent className="px-6 py-4 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-xl font-bold text-[#2C2C2C] mb-3 break-words min-h-[3rem] flex items-start group-hover:text-dawn transition-colors duration-300">
          {title}
        </h3>

        {/* Course Description */}
        <p className="text-sm text-[#666666] leading-relaxed font-light line-clamp-3 h-16 overflow-hidden flex-1">
          {description}
        </p>
      </CardContent>

      <CardFooter className="px-6 pb-6 mt-auto">
        <div className="w-full">
          {/* Progress Section */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-[#2C2C2C]">
              Course Progress
            </span>
            <span className="text-sm text-[#666666] font-light">
              {Math.round(progress)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-300 bg-dawn`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Start/Continue Button */}
          <Button
            onClick={handleStart}
            className="w-full bg-dawn hover:bg-[#B85A1A] text-white font-semibold py-3 px-4 shadow-sm transition-all duration-300 hover:scale-105 rounded-lg border border-dawn"
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
