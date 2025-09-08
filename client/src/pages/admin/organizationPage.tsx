import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for organizations
const mockOrganizations = [
  {
    id: 1,
    name: "VX Academy Main",
    type: "Educational Institution",
    location: "New York, NY",
    contactEmail: "admin@vxacademy.com",
    createdDate: "2024-01-01",
    status: "Active",
    userCount: 1250,
  },
  {
    id: 2,
    name: "TechCorp Training",
    type: "Corporate",
    location: "San Francisco, CA",
    contactEmail: "training@techcorp.com",
    createdDate: "2024-01-05",
    status: "Active",
    userCount: 450,
  },
  {
    id: 3,
    name: "University of Learning",
    type: "University",
    location: "Boston, MA",
    contactEmail: "admin@university.edu",
    createdDate: "2024-01-10",
    status: "Pending",
    userCount: 0,
  },
];

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [filteredOrganizations, setFilteredOrganizations] =
    useState(mockOrganizations);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.type.toLowerCase().includes(query.toLowerCase()) ||
          org.location.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  };

  const handleCreateOrganization = (formData: any) => {
    const newOrganization = {
      id: organizations.length + 1,
      name: formData.name,
      type: formData.type,
      location: formData.location,
      contactEmail: formData.contactEmail,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      userCount: 0,
    };
    setOrganizations([...organizations, newOrganization]);
    setFilteredOrganizations([...organizations, newOrganization]);
  };

  const CreateOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      type: "",
      location: "",
      contactEmail: "",
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateOrganization(formData);
      setFormData({
        name: "",
        type: "",
        location: "",
        contactEmail: "",
        description: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Organization Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Organization</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Organization",
    "Sub Organization",
    "Asset",
    "Sub Asset",
    "User Type",
    "Email",
    "First Name",
    "Last Name",
    "Created At",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Organizations"
      description="Manage organizations and institutions using the platform"
    >
      <AdminTableLayout
        searchPlaceholder="Search organizations..."
        createButtonText="Create Organization"
        createForm={<CreateOrganizationForm />}
        tableData={filteredOrganizations}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default OrganizationPage;
