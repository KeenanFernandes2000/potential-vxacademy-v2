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
import { Edit, Search, Visibility } from "@mui/icons-material";
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
      const response = await fetch(`${baseUrl}/api/users/users/with-details`, {
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
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Chatbot cleanup and prevention logic
  useEffect(() => {
    // Global flag to prevent multiple chatbot initializations
    if ((window as any).chatbotInitialized) {
      return;
    }

    // Aggressive cleanup: Remove ALL existing chatbot instances before creating new ones
    const existingChatHosts = document.querySelectorAll("#potChatHost");
    existingChatHosts.forEach((host) => {
      host.remove();
    });

    // Remove any other chatbot-related elements
    const chatbotElements = document.querySelectorAll('[id^="pot"]');
    chatbotElements.forEach((element) => {
      element.remove();
    });

    // Remove any existing chatbot scripts
    const existingScripts = document.querySelectorAll("#chatbot-embed-script");
    existingScripts.forEach((script) => {
      script.remove();
    });

    // Clean up the global chatbotembed function
    if (window.chatbotembed) {
      delete window.chatbotembed;
    }

    // Double-check: If potChatHost still exists after cleanup, don't proceed
    const stillExistingChatHost = document.getElementById("potChatHost");
    if (stillExistingChatHost) {
      console.warn(
        "potChatHost still exists after cleanup, skipping initialization"
      );
      return;
    }

    // Dynamically load the chatbot script
    const script = document.createElement("script");
    script.src = "https://ai.potential.com/static/embed/chat.js";
    script.charset = "utf-8";
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.id = "chatbot-embed-script";

    // Initialize chatbot after script loads
    script.onload = () => {
      // Final check before initialization
      const finalCheck = document.getElementById("potChatHost");
      if (finalCheck) {
        console.warn("potChatHost exists during initialization, skipping");
        return;
      }

      // @ts-ignore
      chatbotembed({
        botId: "68d631a094d4851d85bb8903",
        botIcon:
          "https://api.potential.com/static/mentors/sdadassd-1753092691035-person.jpeg",
        botColor: "#404040",
      });
      (window as any).chatbotInitialized = true;
    };

    // Handle script loading errors
    script.onerror = () => {
      console.error("Failed to load chatbot script");
    };

    // Append script to document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script tag
      const scriptElement = document.getElementById("chatbot-embed-script");
      if (scriptElement) {
        scriptElement.remove();
      }

      // Remove chatbot UI elements
      const potChatHost = document.getElementById("potChatHost");
      if (potChatHost) {
        potChatHost.remove();
      }

      // Remove any other chatbot-related elements
      const chatbotElements = document.querySelectorAll('[id^="pot"]');
      chatbotElements.forEach((element) => {
        element.remove();
      });

      // Clean up the global chatbotembed function
      if (window.chatbotembed) {
        delete window.chatbotembed;
      }

      // Reset the global flag
      (window as any).chatbotInitialized = false;
    };
  }, []);

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

        // Filter users based on current user's organization and suborganizations
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

            // Filter by suborganization if current user has suborganizations
            if (
              currentUserData.subOrganization &&
              Array.isArray(currentUserData.subOrganization) &&
              currentUserData.subOrganization.length > 0
            ) {
              // If user has suborganizations, check if they have any matching suborganization
              if (
                !user.subOrganization ||
                !Array.isArray(user.subOrganization) ||
                user.subOrganization.length === 0
              ) {
                return false;
              }

              // Check if user has any suborganization that matches current user's suborganizations
              const hasMatchingSubOrg = user.subOrganization.some(
                (userSubOrg: string) =>
                  currentUserData.subOrganization.includes(userSubOrg)
              );

              if (!hasMatchingSubOrg) {
                return false;
              }
            }

            return true;
          });
        }

        // Transform data to match our display format
        const transformedUsers = filteredUsersData.map((user: any) => {
          const transformedUser = {
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
            userType: user.userType || "user",
            actions: null as React.ReactNode,
          };

          transformedUser.actions = (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-dawn hover:bg-dawn/10"
                onClick={() => handleViewMore(transformedUser)}
                title="View Full Profile"
              >
                <Visibility sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-dawn hover:bg-dawn/10"
                onClick={() => handleEditUser(transformedUser)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
            </div>
          );

          return transformedUser;
        });

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
        // Close modal immediately
        setIsEditModalOpen(false);

        // Show success message
        setSuccessMessage("User updated successfully!");
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);

        // Use setTimeout to ensure modal is fully closed before updating state
        setTimeout(() => {
          setSelectedUser(null);
          setError("");
          // Refresh the user list after modal is closed
          refreshUserList();
        }, 0);
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

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    // Clear any previous messages when opening modal
    setError("");
    setSuccessMessage("");
  };

  const handleViewMore = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    // Clear any previous messages when opening modal
    setError("");
    setSuccessMessage("");
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

      // Get all users with details
      const usersResponse = await api.getAllUsers(token);
      let filteredUsersData = usersResponse.data || [];

      // Filter users based on current user's organization and suborganizations
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

          // Filter by suborganization if current user has suborganizations
          if (
            currentUserData.subOrganization &&
            Array.isArray(currentUserData.subOrganization) &&
            currentUserData.subOrganization.length > 0
          ) {
            // If user has suborganizations, check if they have any matching suborganization
            if (
              !user.subOrganization ||
              !Array.isArray(user.subOrganization) ||
              user.subOrganization.length === 0
            ) {
              return false;
            }

            // Check if user has any suborganization that matches current user's suborganizations
            const hasMatchingSubOrg = user.subOrganization.some(
              (userSubOrg: string) =>
                currentUserData.subOrganization.includes(userSubOrg)
            );

            if (!hasMatchingSubOrg) {
              return false;
            }
          }

          return true;
        });
      }

      const transformedUsers = filteredUsersData.map((user: any) => {
        const transformedUser = {
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
          userType: user.userType || "user",
          actions: null as React.ReactNode,
        };

        transformedUser.actions = (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-dawn hover:bg-dawn/10"
              onClick={() => handleViewMore(transformedUser)}
              title="View Full Profile"
            >
              <Visibility sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-dawn hover:bg-dawn/10"
              onClick={() => handleEditUser(transformedUser)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
          </div>
        );

        return transformedUser;
      });

      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    } catch (error) {
      console.error("Error refreshing user list:", error);
      setError("Failed to refresh user list. Please try again.");
    }
  };

  // Helper function to check if user should be highlighted
  const shouldHighlightUser = (user: any) => {
    const progress = parseFloat(user.overallProgress.replace("%", ""));
    const lastLoginDate = new Date(user.lastLoginDate);
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    return progress < 100 && lastLoginDate < fifteenDaysAgo;
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
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="edit_firstName">First Name *</Label>
          <Input
            id="edit_firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="rounded-full bg-white border-[#E5E5E5]"
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
            className="rounded-full bg-white border-[#E5E5E5]"
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
            className="rounded-full bg-white border-[#E5E5E5]"
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
            <SelectTrigger className="rounded-full w-full bg-white border-[#E5E5E5]">
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
              setError("");
            }}
            className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:bg-sandstone hover:text-[#2C2C2C]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-dawn hover:bg-[#B85A1A] text-white"
          >
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
    <div className="space-y-6 max-w-full overflow-hidden">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C]">
            Frontliners
          </h1>
          <p className="text-[#666666] mt-2">
            Manage frontliners within your organization
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10 rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] placeholder:text-[#666666] w-full"
          />
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={downloadExcel}
            className="rounded-full bg-dawn hover:bg-[#B85A1A] text-white whitespace-nowrap"
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* Legend/Explanation */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
          <p className="text-red-700 font-medium text-sm">
            <strong>Red highlighting:</strong> Inactive users who haven't
            completed the course
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="w-full overflow-x-auto border bg-white border-[#E5E5E5] rounded-lg">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-[#E5E5E5]">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="text-[#2C2C2C] font-semibold whitespace-nowrap px-4"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => {
              const shouldHighlight = shouldHighlightUser(user);
              return (
                <TableRow
                  key={index}
                  className={`border-[#E5E5E5] hover:bg-sandstone/50 ${
                    shouldHighlight ? "bg-red-50 border-red-200" : ""
                  }`}
                >
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.id}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.firstName}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.lastName}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.eid}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.roleCategory}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.role}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.seniority}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.overallProgress}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.certificates}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.registrationDate}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.lastLoginDate}
                  </TableCell>
                  <TableCell
                    className={`text-[#2C2C2C] whitespace-nowrap px-4 ${
                      shouldHighlight ? "text-red-700 font-medium" : ""
                    }`}
                  >
                    {user.actions}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E5E5E5] text-[#2C2C2C]">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">Edit User</DialogTitle>
          </DialogHeader>
          <EditUserForm />
        </DialogContent>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-[#E5E5E5] text-[#2C2C2C] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              User Profile Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#666666]">First Name</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.firstName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Last Name</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.lastName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Email Address</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">EID</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.eid}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Phone Number</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.phoneNumber}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">User Type</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.userType}
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#666666]">Role Category</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.roleCategory}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Role</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.role}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Seniority</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.seniority}
                  </div>
                </div>
              </div>

              {/* Progress and Certificates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#666666]">Overall Progress</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.overallProgress}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Certificates</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.certificates}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#666666]">Registration Date</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.registrationDate}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#666666]">Last Login Date</Label>
                  <div className="p-3 bg-sandstone rounded-lg text-[#2C2C2C]">
                    {selectedUser.lastLoginDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="rounded-full bg-white border-[#E5E5E5] text-[#2C2C2C] hover:bg-sandstone hover:text-[#2C2C2C]"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditUser(selectedUser);
                  }}
                  className="rounded-full bg-dawn hover:bg-[#B85A1A] text-white"
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
