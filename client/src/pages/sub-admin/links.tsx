import React from "react";

const Links = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Links Management</h1>
        <p className="text-muted-foreground">
          Manage and organize important links for your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Quick Links</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Manage frequently accessed links
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Resource Links</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Organize learning resources and materials
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">External Links</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Manage external website references
          </p>
        </div>
      </div>
    </div>
  );
};

export default Links;
