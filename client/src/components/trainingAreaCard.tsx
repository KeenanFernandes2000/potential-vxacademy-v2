import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TrainingAreaCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onLearnMore?: () => void;
}

const TrainingAreaCard: React.FC<TrainingAreaCardProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  onLearnMore,
}) => {
  return (
    <div className="flex flex-col h-full  transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6 md:p-8">
        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-[#FF6B6B] mb-4 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#2C2C2C] text-sm md:text-base leading-relaxed mb-6 flex-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export default TrainingAreaCard;
