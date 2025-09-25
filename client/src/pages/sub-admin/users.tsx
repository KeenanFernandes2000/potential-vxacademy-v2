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

import { Add as Plus, Download } from "@mui/icons-material";
import * as XLSX from "xlsx";

import { useAuth } from "@/hooks/useAuth";
import { Edit, Delete, Search, Visibility } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// API object for user operations
const api = {
  async getAllUsers(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users`, {
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
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  async getUserById(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
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
      console.error("Failed to fetch user:", error);
      throw error;
    }
  },

  async updateUser(userId: number, userData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  async deleteUser(userId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
        method: "DELETE",
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
      console.error("Failed to delete user:", error);
      throw error;
    }
  },
};

// Type for user data
interface UserData
  extends Record<string, string | number | boolean | React.ReactNode> {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  eid: string;
  phoneNumber: string;
  roleCategory: string;
  role: string;
  seniority: string;
  overallProgress: string;
  certificates: string;
  registrationDate: string;
  lastLoginDate: string;
  actions: React.ReactNode;
}

const Users = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users from database on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Get current user's full details for filtering
        const currentUserResponse = await api.getUserById(
          currentUser?.id || 0,
          token
        );
        const currentUserData = currentUserResponse.data;

        // Get all users
        const usersResponse = await api.getAllUsers(token);
        let filteredUsersData = usersResponse.data || [];

        // Filter users based on current user's organization, suborganization, assets, and subassets
        if (currentUserData) {
          filteredUsersData = filteredUsersData.filter((user: any) => {
            // Filter out Sub_admin users
            if (user.userType !== "user") {
              return false;
            }

            // Filter by organization
            if (user.organization !== currentUserData.organization) {
              return false;
            }

            // Filter by suborganization if current user has one
            if (
              currentUserData.subOrganization &&
              user.subOrganization !== currentUserData.subOrganization
            ) {
              return false;
            }

            // Filter by asset
            if (user.asset !== currentUserData.asset) {
              return false;
            }

            // Filter by subasset
            if (user.subAsset !== currentUserData.subAsset) {
              return false;
            }

            return true;
          });
        }

        // Transform data to match our display format
        const transformedUsers = filteredUsersData.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          eid: user.eid || "N/A",
          phoneNumber: user.phoneNumber || "N/A",
          roleCategory: user.roleCategory || "N/A",
          role: user.role || "N/A",
          seniority: user.seniority || "N/A",
          overallProgress: user.overallProgress
            ? `${user.overallProgress}%`
            : "0%",
          certificates: user.certificates || "0",
          registrationDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A",
          lastLoginDate: user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "N/A",
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleViewMore(user)}
                title="View Full Profile"
              >
                <Visibility sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditUser(user)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteUser(user.id)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setError("");
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token, currentUser]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user: any) =>
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleUpdateUser = async (formData: any) => {
    if (!token || !selectedUser) {
      setError("Authentication required or no user selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        userType: formData.userType,
      };

      const response = await api.updateUser(selectedUser.id, userData, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setError("");
      } else {
        setError(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteUser(userId, token);

      if (response.success) {
        // Refresh the user list
        await refreshUserList();
        setError("");
      } else {
        setError(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewMore = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const refreshUserList = async () => {
    if (!token) return;

    try {
      // Get current user's full details for filtering
      const currentUserResponse = await api.getUserById(
        currentUser?.id || 0,
        token
      );
      const currentUserData = currentUserResponse.data;

      // Get all users
      const usersResponse = await api.getAllUsers(token);
      let filteredUsersData = usersResponse.data || [];

      // Filter users based on current user's organization, suborganization, assets, and subassets
      if (currentUserData) {
        filteredUsersData = filteredUsersData.filter((user: any) => {
          // Filter out Sub_admin users
          if (user.userType !== "user") {
            return false;
          }

          // Filter by organization
          if (user.organization !== currentUserData.organization) {
            return false;
          }

          // Filter by suborganization if current user has one
          if (
            currentUserData.subOrganization &&
            user.subOrganization !== currentUserData.subOrganization
          ) {
            return false;
          }

          // Filter by asset
          if (user.asset !== currentUserData.asset) {
            return false;
          }

          // Filter by subasset
          if (user.subAsset !== currentUserData.subAsset) {
            return false;
          }

          return true;
        });
      }

      const transformedUsers = filteredUsersData.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        eid: user.eid || "N/A",
        phoneNumber: user.phoneNumber || "N/A",
        roleCategory: user.roleCategory || "N/A",
        role: user.role || "N/A",
        seniority: user.seniority || "N/A",
        overallProgress: user.overallProgress
          ? `${user.overallProgress}%`
          : "0%",
        certificates: user.certificates || "0",
        registrationDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
        lastLoginDate: user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString()
          : "N/A",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleViewMore(user)}
              title="View Full Profile"
            >
              <Visibility sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditUser(user)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteUser(user.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      }));

      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    } catch (error) {
      console.error("Error refreshing user list:", error);
      setError("Failed to refresh user list. Please try again.");
    }
  };

  const downloadExcel = () => {
    // Prepare data for Excel export (exclude the actions column)
    const excelData = filteredUsers.map((user) => ({
      ID: user.id,
      "First Name": user.firstName,
      "Last Name": user.lastName,
      "Email Address": user.email,
      EID: user.eid,
      "Phone Number": user.phoneNumber,
      "Role Category": user.roleCategory,
      Role: user.role,
      Seniority: user.seniority,
      "Overall Progress": user.overallProgress,
      Certificates: user.certificates,
      "Registration Date": user.registrationDate,
      "Last Login Date": user.lastLoginDate,
    }));

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Frontliners");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `frontliners_${currentDate}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  };

  const EditUserForm = () => {
    const [formData, setFormData] = useState({
      firstName: selectedUser?.firstName || "",
      lastName: selectedUser?.lastName || "",
      email: selectedUser?.email || "",
      userType: selectedUser?.userType || "user",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateUser(formData);
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sidebar-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-sidebar-accent"
      >
        <div className="space-y-2">
          <Label htmlFor="edit_firstName">First Name *</Label>
          <Input
            id="edit_firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_lastName">Last Name *</Label>
          <Input
            id="edit_lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_email">Email *</Label>
          <Input
            id="edit_email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_userType">User Type *</Label>
          <Select
            value={formData.userType}
            onValueChange={(value) =>
              setFormData({ ...formData, userType: value })
            }
          >
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="sub_admin">Sub Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "First Name",
    "Last Name",
    "Email Address",
    "EID",
    "Phone Number",
    "Role Category",
    "Role",
    "Seniority",
    "Overall Progress",
    "Certificates",
    "Registration Date",
    "Last Login Date",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Frontliners
          </h1>
          <p className="text-white/80 mt-2">
            Manage frontliners within your organization
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10 rounded-full bg-[#00d8cc]/30 border-white/20 text-white placeholder:text-white/60 w-full"
          />
        </div>
        <div>
          <Button
            onClick={downloadExcel}
            className="rounded-full bg-[#00d8cc]/30"
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* User Table */}
      <div className="border bg-white/10 backdrop-blur-sm border-white/20 w-full rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20">
              {columns.map((column) => (
                <TableHead key={column} className="text-white font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow
                key={index}
                className="border-white/20 hover:bg-white/5"
              >
                <TableCell className="text-white/90">{user.id}</TableCell>
                <TableCell className="text-white/90">
                  {user.firstName}
                </TableCell>
                <TableCell className="text-white/90">{user.lastName}</TableCell>
                <TableCell className="text-white/90">{user.email}</TableCell>
                <TableCell className="text-white/90">{user.eid}</TableCell>
                <TableCell className="text-white/90">
                  {user.phoneNumber}
                </TableCell>
                <TableCell className="text-white/90">
                  {user.roleCategory}
                </TableCell>
                <TableCell className="text-white/90">{user.role}</TableCell>
                <TableCell className="text-white/90">
                  {user.seniority}
                </TableCell>
                <TableCell className="text-white/90">
                  {user.overallProgress}
                </TableCell>
                <TableCell className="text-white/90">
                  {user.certificates}
                </TableCell>
                <TableCell className="text-white/90">
                  {user.registrationDate}
                </TableCell>
                <TableCell className="text-white/90">
                  {user.lastLoginDate}
                </TableCell>
                <TableCell className="text-white/90">{user.actions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-[#003451] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
          </DialogHeader>
          <EditUserForm />
        </DialogContent>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              User Profile Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">First Name</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.firstName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Last Name</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.lastName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Email Address</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">EID</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.eid}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Phone Number</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.phoneNumber}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">User Type</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.userType}
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Role Category</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.roleCategory}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Role</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.role}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Seniority</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.seniority}
                  </div>
                </div>
              </div>

              {/* Progress and Certificates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Overall Progress</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.overallProgress}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Certificates</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.certificates}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Registration Date</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.registrationDate}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Last Login Date</Label>
                  <div className="p-3 bg-white/10 rounded-lg text-white">
                    {selectedUser.lastLoginDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-full bg-[#00d8cc]/30 border-white/20 text-white hover:bg-[#00d8cc]/50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditUser(selectedUser);
                  }}
                  className="rounded-full bg-[#00d8cc] hover:bg-[#00d8cc]/80"
                >
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
