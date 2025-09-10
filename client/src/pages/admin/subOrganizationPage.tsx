import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";

// API object for organization operations
const api = {
  async getAllOrganizations(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/users/organizations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      throw error;
    }
  },
};

// Mock data for sub-organizations

const SubOrganizationPage = () => {
  const { token } = useAuth();
  // const [subOrganizations, setSubOrganizations] =
  //   useState(mockSubOrganizations);
  // const [filteredSubOrganizations, setFilteredSubOrganizations] =
  //   useState(mockSubOrganizations);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  // Fetch organizations from database on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!token) {
        return;
      }

      try {
        setIsLoadingOrganizations(true);
        const response = await api.getAllOrganizations(token);
        setOrganizations(response.data || []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, [token]);

  const handleSearch = (query: string) => {
    // Empty search function for now
  };

  const handleCreateSubOrganization = (formData: any) => {
    // const newSubOrganization = {
    //   id: subOrganizations.length + 1,
    //   name: formData.name,
    //   parentOrg: formData.parentOrg,
    //   createdDate: new Date().toISOString().split("T")[0],
    // };
    // setSubOrganizations([...subOrganizations, newSubOrganization]);
    // setFilteredSubOrganizations([...subOrganizations, newSubOrganization]);
  };

  const CreateSubOrganizationForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      parentOrg: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateSubOrganization(formData);
      setFormData({
        name: "",
        parentOrg: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Sub-Organization Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-full"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentOrg">Parent Organization *</Label>
          <Select
            value={formData.parentOrg}
            onValueChange={(value) =>
              setFormData({ ...formData, parentOrg: value })
            }
            // disabled={isLoadingOrganizations}
          >
            <SelectTrigger className="rounded-full w-full">
              {/* <SelectValue
                placeholder={
                  isLoadingOrganizations
                    ? "Loading organizations..."
                    : "Select parent organization"
                }
              /> */}
            </SelectTrigger>
            <SelectContent>
              {/* {organizations.map((org) => (
                <SelectItem key={org.id} value={org.name}>
                  {org.name}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" className="rounded-full">
            Create Sub-Organization
          </Button>
        </div>
      </form>
    );
  };

  const columns = ["Name", "Parent Organization", "Created At", "Actions"];

  return (
    <AdminPageLayout
      title="Sub Organizations"
      description="Manage sub-organizations and departments within parent organizations"
    >
      <AdminTableLayout
        searchPlaceholder="Search sub-organizations..."
        createButtonText="Create Sub-Organization"
        createForm={<CreateSubOrganizationForm />}
        tableData={[]}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default SubOrganizationPage;
