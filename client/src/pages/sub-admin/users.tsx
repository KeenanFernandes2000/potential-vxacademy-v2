import React from "react";

const Users = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions for your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Active Users</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">1,234</p>
          <p className="text-sm text-muted-foreground">
            Currently active users
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">New This Month</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">89</p>
          <p className="text-sm text-muted-foreground">
            New user registrations
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Pending Approval</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">12</p>
          <p className="text-sm text-muted-foreground">
            Users awaiting approval
          </p>
        </div>
      </div>
    </div>
  );
};

export default Users;
