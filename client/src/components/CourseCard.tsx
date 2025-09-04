import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessTime as Clock, PlayArrowRounded as Play } from "@mui/icons-material";

interface CourseCardProps {
  title: string;
  description: string;
  duration: string; // e.g., "0h 10m"
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number; // 0-100
  image?: string;
  onStart?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  duration,
  difficulty,
  progress,
  image,
  onStart,
}) => {
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

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden rounded-none py-0">
      {/* Course Image */}
      {image && (
        <div className="relative w-full">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {/* Duration overlay on image */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs">{duration}</span>
          </div>
        </div>
      )}

      <CardContent className="px-4">
        {/* Duration - Top Right (only show if no image) */}
        {!image && (
          <div className="flex justify-end items-center mb-2">
            <Clock className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-400">{duration}</span>
          </div>
        )}

        {/* Difficulty Tag */}
        <div className="mb-1">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>

        {/* Course Title */}
        <h3 className="text-xl font-bold text-black mb-1">{title}</h3>

        {/* Course Description */}
        <p className="text-sm text-gray-500  line-clamp-3">{description}</p>
      </CardContent>

      <CardFooter className="px-4 pb-4">
        <div className="w-full">
          {/* Progress Section */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Course Progress
            </span>
            <span className="text-sm text-gray-400">{progress}% Complete</span>
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
            onClick={onStart}
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
