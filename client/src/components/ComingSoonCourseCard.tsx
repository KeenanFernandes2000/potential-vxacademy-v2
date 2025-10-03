import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface ComingSoonCourse {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

interface ComingSoonCourseCardProps {
  title: string;
  image?: string;
}

// Mock data for coming soon courses
export const comingSoonCourses: ComingSoonCourse[] = [
  {
    id: 1,
    name: "Local Customs & Hospitality Etiquette",
    description:
      "Learn the cultural traditions and hospitality customs that define Abu Dhabi's unique visitor experience.",
    imageUrl: "/hotel-1.jpg",
  },
  {
    id: 2,
    name: "Basic Arabic Hospitality and Tourism Phrases",
    description:
      "Master essential Arabic phrases and expressions to enhance communication with local and international guests.",
    imageUrl: "/attraction-1.jpg",
  },
  {
    id: 3,
    name: "Role of Frontline Workers in Acting as AD Ambassadors",
    description:
      "Understand your crucial role as an Abu Dhabi ambassador and how to represent the emirate's values and vision.",
    imageUrl: "/cruise.avif",
  },
  {
    id: 4,
    name: "Major Abu Dhabi Hospitality Chains and Unique Experiences",
    description:
      "Explore the leading hospitality brands and distinctive experiences that make Abu Dhabi a world-class destination.",
    imageUrl: "/events-1.jpg",
  },
  {
    id: 5,
    name: "Different Regions of Abu Dhabi and Their Offerings",
    description:
      "Discover the diverse regions of Abu Dhabi and the unique attractions, experiences, and opportunities each offers.",
    imageUrl: "/museum-1.jpg",
  },
  {
    id: 6,
    name: "Abu Dhabi Wayfinding and Navigation Information",
    description:
      "Master the essential navigation skills and wayfinding techniques to guide visitors confidently throughout Abu Dhabi.",
    imageUrl: "/mall-1.jpg",
  },
  {
    id: 7,
    name: "Visitor Journeys",
    description:
      "Learn to map and enhance visitor journeys to create seamless and memorable experiences from arrival to departure.",
    imageUrl: "/hotel-1.jpg",
  },
  {
    id: 8,
    name: "Customer-Centric Service Excellence",
    description:
      "Develop advanced customer service skills focused on anticipating needs and exceeding expectations in every interaction.",
    imageUrl: "/attraction-1.jpg",
  },
  {
    id: 9,
    name: "Attraction-Based Interaction Protocols",
    description:
      "Master specialized protocols and best practices for engaging with visitors at various Abu Dhabi attractions and landmarks.",
    imageUrl: "/cruise.avif",
  },
  {
    id: 10,
    name: "Crafting Memorable Visitor Experiences",
    description:
      "Learn the art of creating unforgettable moments that leave lasting positive impressions on every visitor.",
    imageUrl: "/events-1.jpg",
  },
  {
    id: 11,
    name: "Managing Complaints and Difficult Interactions",
    description:
      "Develop essential skills for professionally handling challenging situations and turning complaints into opportunities.",
    imageUrl: "/museum-1.jpg",
  },
  {
    id: 12,
    name: "Dress Code and Attire",
    description:
      "Understand professional dress standards and cultural considerations for maintaining appropriate appearance in hospitality settings.",
    imageUrl: "/mall-1.jpg",
  },
];

const ComingSoonCourseCard: React.FC<ComingSoonCourseCardProps> = ({
  title,
  image,
}) => {
  return (
    <Card className="w-full max-w-sm bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg py-0 flex flex-col h-full group hover:border-gray-300 relative">
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-white/40 z-10 flex items-center justify-center">
        <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Course Image */}
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
        </div>

        {/* Course Info */}
        <div className="px-6 py-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-[#2C2C2C] mb-3 break-words min-h-[3rem] flex items-start group-hover:text-dawn transition-colors duration-300 line-clamp-2">
            {title}
          </h3>

          {/* Coming Soon Badge */}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoonCourseCard;
