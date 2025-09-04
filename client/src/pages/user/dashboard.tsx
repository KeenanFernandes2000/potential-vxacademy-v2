import React from "react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your learning progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Courses Enrolled</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">8</p>
          <p className="text-sm text-muted-foreground">Active courses</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Completed</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">12</p>
          <p className="text-sm text-muted-foreground">Finished courses</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Certificates</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">5</p>
          <p className="text-sm text-muted-foreground">Earned certificates</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Study Hours</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">156</p>
          <p className="text-sm text-muted-foreground">
            Total hours this month
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
