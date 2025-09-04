import React from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";

// Mock course data
const coursesData = [
  {
    id: 1,
    title: "GEM Values",
    description:
      "Introduces the GEM values that guide frontline behavior and service delivery, fostering genuine, empathetic, and meaningful interactions with customers and colleagues.",
    duration: "0h 10m",
    difficulty: "beginner" as const,
    progress: 0,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: 2,
    title: "React Fundamentals",
    description:
      "Learn the basics of React development including components, state management, and hooks. Perfect for beginners starting their React journey.",
    duration: "2h 30m",
    difficulty: "beginner" as const,
    progress: 75,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: 3,
    title: "TypeScript Advanced",
    description:
      "Master advanced TypeScript concepts including generics, decorators, and advanced type manipulation techniques for enterprise applications.",
    duration: "4h 15m",
    difficulty: "intermediate" as const,
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: 4,
    title: "Node.js Backend",
    description:
      "Build robust backend applications with Node.js, Express, and modern JavaScript. Learn about APIs, databases, and deployment strategies.",
    duration: "6h 45m",
    difficulty: "intermediate" as const,
    progress: 90,
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: 5,
    title: "System Architecture",
    description:
      "Design and implement scalable system architectures using microservices, cloud platforms, and modern DevOps practices.",
    duration: "8h 20m",
    difficulty: "advanced" as const,
    progress: 25,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop&crop=center",
  },
  {
    id: 6,
    title: "Data Structures & Algorithms",
    description:
      "Master fundamental data structures and algorithms to solve complex programming problems efficiently and optimize your code.",
    duration: "5h 10m",
    difficulty: "advanced" as const,
    progress: 0,
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop&crop=center",
  },
];

const Courses = () => {
  const navigate = useNavigate();

  const handleCourseStart = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          Track your learning progress and access your enrolled courses.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coursesData.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            duration={course.duration}
            difficulty={course.difficulty}
            progress={course.progress}
            image={course.image}
            onStart={() => handleCourseStart(course.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
