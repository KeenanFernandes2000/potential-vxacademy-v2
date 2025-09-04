import React from "react";

const Courses = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          Track your learning progress and access your enrolled courses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">React Fundamentals</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Learn the basics of React development
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">TypeScript Advanced</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Master advanced TypeScript concepts
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Node.js Backend</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Build robust backend applications
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>90%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "90%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
