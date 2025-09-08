import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for sub-admins
const mockSubAdmins = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@vxacademy.com",
    organization: "VX Academy Main",
    role: "Department Head",
    createdDate: "2024-01-15",
    status: "Active",
    lastLogin: "2024-01-20",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    organization: "TechCorp Training",
    role: "Training Manager",
    createdDate: "2024-01-10",
    status: "Active",
    lastLogin: "2024-01-19",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@university.edu",
    organization: "University of Learning",
    role: "Course Coordinator",
    createdDate: "2024-01-12",
    status: "Pending",
    lastLogin: "Never",
  },
];

const SubAdminPage = () => {
  const [subAdmins, setSubAdmins] = useState(mockSubAdmins);
  const [filteredSubAdmins, setFilteredSubAdmins] = useState(mockSubAdmins);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredSubAdmins(subAdmins);
    } else {
      const filtered = subAdmins.filter(
        (subAdmin) =>
          subAdmin.name.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.organization.toLowerCase().includes(query.toLowerCase()) ||
          subAdmin.role.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubAdmins(filtered);
    }
  };

  const handleCreateSubAdmin = (formData: any) => {
    const newSubAdmin = {
      id: subAdmins.length + 1,
      name: formData.name,
      email: formData.email,
      organization: formData.organization,
      role: formData.role,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      lastLogin: "Never",
    };
    setSubAdmins([...subAdmins, newSubAdmin]);
    setFilteredSubAdmins([...subAdmins, newSubAdmin]);
  };

  const CreateSubAdminForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      organization: "",
      role: "",
      description: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateSubAdmin(formData);
      setFormData({
        name: "",
        email: "",
        organization: "",
        role: "",
        description: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            value={formData.organization}
            onChange={(e) =>
              setFormData({ ...formData, organization: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
          <Button type="submit">Create Sub-Admin</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "User ID",
    "Job Title",
    "Total Frontliners",
    "EID",
    "Phone Number",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Sub Admins"
      description="Manage sub-administrators and their access permissions"
    >
      <AdminTableLayout
        searchPlaceholder="Search sub-admins..."
        createButtonText="Create Sub-Admin"
        createForm={<CreateSubAdminForm />}
        tableData={filteredSubAdmins}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default SubAdminPage;
