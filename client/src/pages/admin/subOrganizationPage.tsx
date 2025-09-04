import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for sub-organizations
const mockSubOrganizations = [
  {
    id: 1,
    name: "VX Academy - Engineering Dept",
    parentOrg: "VX Academy Main",
    type: "Department",
    location: "New York, NY",
    contactEmail: "engineering@vxacademy.com",
    createdDate: "2024-01-02",
    status: "Active",
    userCount: 120,
  },
  {
    id: 2,
    name: "TechCorp - Sales Division",
    parentOrg: "TechCorp Training",
    type: "Division",
    location: "San Francisco, CA",
    contactEmail: "sales@techcorp.com",
    createdDate: "2024-01-06",
    status: "Active",
    userCount: 85,
  },
  {
    id: 3,
    name: "University - Computer Science",
    parentOrg: "University of Learning",
    type: "Department",
    location: "Boston, MA",
    contactEmail: "cs@university.edu",
    createdDate: "2024-01-11",
    status: "Pending",
    userCount: 0,
  },
];

const SubOrganizationPage = () => {
  const [subOrganizations, setSubOrganizations] =
    useState(mockSubOrganizations);
  const [filteredSubOrganizations, setFilteredSubOrganizations] =
    useState(mockSubOrganizations);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubOrganizations(subOrganizations);
    } else {
      const filtered = subOrganizations.filter(
        (subOrg) =>
          subOrg.name.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.parentOrg.toLowerCase().includes(query.toLowerCase()) ||
          subOrg.type.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubOrganizations(filtered);
    }
  };

  const handleCreateSubOrganization = (formData: any) => {
    const newSubOrganization = {
      id: subOrganizations.length + 1,
      name: formData.name,
      parentOrg: formData.parentOrg,
      type: formData.type,
      location: formData.location,
      contactEmail: formData.contactEmail,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      userCount: 0,
    };
    setSubOrganizations([...subOrganizations, newSubOrganization]);
    setFilteredSubOrganizations([...subOrganizations, newSubOrganization]);
  };

  const CreateSubOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      parentOrg: "",
      type: "",
      location: "",
      contactEmail: "",
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateSubOrganization(formData);
      setFormData({
        name: "",
        parentOrg: "",
        type: "",
        location: "",
        contactEmail: "",
        description: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Sub-Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentOrg">Parent Organization</Label>
          <Input
            id="parentOrg"
            value={formData.parentOrg}
            onChange={(e) =>
              setFormData({ ...formData, parentOrg: e.target.value })
            }
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
          <Button type="submit">Create Sub-Organization</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Name",
    "Parent Organization",
    "Type",
    "Location",
    "Contact Email",
    "Users",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub Organizations"
      description="Manage sub-organizations and departments within parent organizations"
    >
      <AdminTableLayout
        searchPlaceholder="Search sub-organizations..."
        createButtonText="Create Sub-Organization"
        createForm={<CreateSubOrganizationForm />}
        tableData={filteredSubOrganizations}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default SubOrganizationPage;
