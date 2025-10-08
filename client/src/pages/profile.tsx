import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import UserSidebar from "@/components/userSidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";
import AdminSidebar from "@/components/adminSidebar";
import { useAuth } from "@/hooks/useAuth";

type Props = {};

// Extended user data interfaces

interface NormalUserData {
  first_name: string;
  last_name: string;
  email: string;
  role_category: string;
  role: string;
  seniority: string;
  eid: string;
  phone_number: string;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  subOrganization?: string;
  asset: string;
  subAsset: string;
  userType: "admin" | "sub_admin" | "user";
  xp: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  subAdminDetails?: {
    jobTitle: string;
    totalFrontliners?: number;
    eid: string;
    phoneNumber: string;
  };
  normalUserDetails?: {
    roleCategory: string;
    role: string;
    seniority: string;
    eid: string;
    phoneNumber: string;
  };
}

const ProfilePage = (props: Props) => {
  const { user, token, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User profile state
  const [userData, setUserData] = useState<NormalUserData>({
    first_name: "",
    last_name: "",
    email: "",
    role_category: "",
    role: "",
    seniority: "",
    eid: "",
    phone_number: "",
  });

  // Editable fields state for sub-admin
  const [subAdminData, setSubAdminData] = useState({
    job_title: "",
    eid: "",
    phone_number: "",
    total_frontliners: 0,
  });

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper function to update form data based on profile data
  const updateFormDataFromProfile = (profileData: any) => {
    setUserProfile(profileData);

    // Set form data - only basic fields are editable
    setUserData({
      first_name: profileData.firstName || "",
      last_name: profileData.lastName || "",
      email: profileData.email || "",
      role_category: profileData.normalUserDetails?.roleCategory || "",
      role: profileData.normalUserDetails?.role || "",
      seniority: profileData.normalUserDetails?.seniority || "",
      eid:
        profileData.normalUserDetails?.eid ||
        profileData.subAdminDetails?.eid ||
        "",
      phone_number:
        profileData.normalUserDetails?.phoneNumber ||
        profileData.subAdminDetails?.phoneNumber ||
        "",
    });

    // Set sub-admin specific data
    if (profileData.subAdminDetails) {
      setSubAdminData({
        job_title: profileData.subAdminDetails.jobTitle || "",
        eid: profileData.subAdminDetails.eid || "",
        phone_number: profileData.subAdminDetails.phoneNumber || "",
        total_frontliners: profileData.subAdminDetails.totalFrontliners || 0,
      });
    }
  };

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, [user, token]);

  // Get current user data based on user type
  const getCurrentUserData = () => {
    if (!userProfile) {
      return {
        name: "Loading...",
        email: "",
        role: "",
        xp: 0,
        level: "Beginner",
        avatar: "?",
      };
    }

    if (userProfile.userType === "sub_admin") {
      return {
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email,
        role: "Sub Administrator",
        xp: userProfile.xp,
        level: "Beginner", // You can implement level calculation based on XP
        avatar: userProfile.firstName.charAt(0).toUpperCase(),
      };
    } else if (userProfile.userType === "admin") {
      return {
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email,
        role: "Administrator",
        xp: userProfile.xp,
        level: "Beginner",
        avatar: userProfile.firstName.charAt(0).toUpperCase(),
      };
    } else {
      return {
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email,
        role: userData.role || "User",
        xp: userProfile.xp,
        level: "Beginner",
        avatar: userProfile.firstName.charAt(0).toUpperCase(),
      };
    }
  };

  const currentUser = getCurrentUserData();

  // Render appropriate sidebar based on user type
  const renderSidebar = () => {
    if (!userProfile) {
      return <UserSidebar />; // Default while loading
    }

    if (userProfile.userType === "user") {
      return <UserSidebar />;
    } else if (userProfile.userType === "sub_admin") {
      return <SubAdminSidebar />;
    } else {
      return <AdminSidebar />;
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubAdminData((prev) => ({
      ...prev,
      [name]: name === "total_frontliners" ? parseInt(value) || 0 : value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    // Reset to original values
    if (userProfile) {
      updateFormDataFromProfile(userProfile);
    }
    setIsEditing(false);
  };

  // Form submission handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !userProfile) return;

    try {
      setSaving(true);
      const baseUrl = import.meta.env.VITE_API_URL;

      // Update user-specific data based on user type
      if (userProfile.userType === "user") {
        // Update basic user data first
        const basicUserUpdateData = {
          firstName: userData.first_name,
          lastName: userData.last_name,
        };

        const basicUserResponse = await fetch(
          `${baseUrl}/api/users/users/${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(basicUserUpdateData),
          }
        );

        if (!basicUserResponse.ok) {
          throw new Error("Failed to update basic user profile");
        }

        const basicUserResult = await basicUserResponse.json();
        if (!basicUserResult.success) {
          throw new Error(
            basicUserResult.message || "Failed to update basic user profile"
          );
        }

        // Update normal user specific data
        const userUpdateData = {
          roleCategory: userData.role_category,
          role: userData.role,
          seniority: userData.seniority,
          eid: userData.eid,
          phoneNumber: userData.phone_number,
        };

        const response = await fetch(
          `${baseUrl}/api/users/normal-users/${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userUpdateData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update user profile");
        }

        const result = await response.json();
        if (result.success) {
          alert("Profile updated successfully!");
          setIsEditing(false);
          // Refresh the profile data
          await fetchUserProfile();
        } else {
          throw new Error(result.message || "Failed to update profile");
        }
      } else if (userProfile.userType === "sub_admin") {
        // Update basic user data first
        const userUpdateData = {
          firstName: userData.first_name,
          lastName: userData.last_name,
        };

        const userResponse = await fetch(
          `${baseUrl}/api/users/users/${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userUpdateData),
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to update user profile");
        }

        const userResult = await userResponse.json();
        if (!userResult.success) {
          throw new Error(
            userResult.message || "Failed to update user profile"
          );
        }

        // Update sub-admin specific data
        const subAdminUpdateData = {
          jobTitle: subAdminData.job_title,
          eid: subAdminData.eid,
          phoneNumber: subAdminData.phone_number,
          totalFrontliners: subAdminData.total_frontliners,
        };

        const response = await fetch(
          `${baseUrl}/api/users/sub-admins/${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subAdminUpdateData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update sub-admin profile");
        }

        const result = await response.json();
        if (result.success) {
          alert("Profile updated successfully!");
          setIsEditing(false);
          // Refresh the profile data
          await fetchUserProfile();
        } else {
          throw new Error(result.message || "Failed to update profile");
        }
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to refetch user profile
  const fetchUserProfile = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const baseUrl = import.meta.env.VITE_API_URL;

      // Fetch user details
      const userResponse = await fetch(
        `${baseUrl}/api/users/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userResult = await userResponse.json();
      if (userResult.success) {
        updateFormDataFromProfile(userResult.data);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if user data is not available
  if (!user || loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-background relative overflow-hidden flex w-full">
          <UserSidebar />
          <SidebarInset className="flex-1 w-full">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  Loading profile...
                </p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background relative overflow-hidden flex w-full">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content Area */}
        <SidebarInset className="flex-1 w-full">
          {/* Main Content */}
          <div className="w-full px-8 py-12">
            {/* User Details Header */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {currentUser.avatar}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-card-foreground mb-1">
                    {currentUser.name}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    {currentUser.email}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="hidden items-center space-x-2">
                      <span className="text-muted-foreground">🏅</span>
                      <span className="text-muted-foreground">
                        {currentUser.level}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">🛡️</span>
                      <span className="text-muted-foreground">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details Section */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg">
                      Loading profile...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive text-lg mb-4">
                    Error loading profile
                  </p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-card-foreground">
                      User Details
                    </h2>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button
                          onClick={handleEditToggle}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            disabled={saving}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleProfileUpdate}
                            size="sm"
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Basic user information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="first_name"
                        className="block text-foreground font-medium"
                      >
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={userData.first_name}
                        onChange={handleUserChange}
                        readOnly={!isEditing}
                        className={
                          isEditing
                            ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                            : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last_name"
                        className="block text-foreground font-medium"
                      >
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={userData.last_name}
                        onChange={handleUserChange}
                        readOnly={!isEditing}
                        className={
                          isEditing
                            ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                            : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-foreground font-medium"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      readOnly
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                    />
                  </div>

                  {/* User type specific fields */}
                  {userProfile?.userType === "user" &&
                    userProfile?.normalUserDetails && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label
                              htmlFor="role_category"
                              className="block text-foreground font-medium"
                            >
                              Role Category
                            </label>
                            <Input
                              id="role_category"
                              name="role_category"
                              value={userData.role_category}
                              readOnly
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="role"
                              className="block text-foreground font-medium"
                            >
                              Role
                            </label>
                            <Input
                              id="role"
                              name="role"
                              value={userData.role}
                              onChange={handleUserChange}
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                  : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label
                              htmlFor="seniority"
                              className="block text-foreground font-medium"
                            >
                              Seniority
                            </label>
                            <Input
                              id="seniority"
                              name="seniority"
                              value={userData.seniority}
                              onChange={handleUserChange}
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                  : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="eid"
                              className="block text-foreground font-medium"
                            >
                              Employee ID
                            </label>
                            <Input
                              id="eid"
                              name="eid"
                              value={userData.eid}
                              readOnly
                              className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="phone_number"
                            className="block text-foreground font-medium"
                          >
                            Phone Number
                          </label>
                          <Input
                            id="phone_number"
                            name="phone_number"
                            value={userData.phone_number}
                            readOnly
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                          />
                        </div>
                      </>
                    )}

                  {userProfile?.userType === "sub_admin" &&
                    userProfile?.subAdminDetails && (
                      <>
                        <div className="space-y-2">
                          <label
                            htmlFor="job_title"
                            className="block text-foreground font-medium"
                          >
                            Job Title
                          </label>
                          <Input
                            id="job_title"
                            name="job_title"
                            value={subAdminData.job_title}
                            onChange={handleSubAdminChange}
                            readOnly={!isEditing}
                            className={
                              isEditing
                                ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label
                              htmlFor="eid"
                              className="block text-foreground font-medium"
                            >
                              Employee ID
                            </label>
                            <Input
                              id="eid"
                              name="eid"
                              value={subAdminData.eid}
                              onChange={handleSubAdminChange}
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                  : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="phone_number"
                              className="block text-foreground font-medium"
                            >
                              Phone Number
                            </label>
                            <Input
                              id="phone_number"
                              name="phone_number"
                              value={subAdminData.phone_number}
                              onChange={handleSubAdminChange}
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                  : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                              }
                            />
                          </div>
                        </div>

                        {userProfile.subAdminDetails.totalFrontliners !==
                          undefined && (
                          <div className="space-y-2">
                            <label
                              htmlFor="total_frontliners"
                              className="block text-foreground font-medium"
                            >
                              Total Frontliners
                            </label>
                            <Input
                              id="total_frontliners"
                              name="total_frontliners"
                              type="number"
                              value={subAdminData.total_frontliners}
                              onChange={handleSubAdminChange}
                              readOnly={!isEditing}
                              className={
                                isEditing
                                  ? "bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                                  : "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg cursor-not-allowed"
                              }
                            />
                          </div>
                        )}
                      </>
                    )}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;
