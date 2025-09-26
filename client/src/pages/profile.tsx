import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import UserSidebar from "@/components/userSidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";
import AdminSidebar from "@/components/adminSidebar";
import { BarChart, CheckCircle, TrackChanges } from "@mui/icons-material";
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

  // Overview data state
  const [overviewData, setOverviewData] = useState({
    totalCourses: 0,
    completedCourses: 0,
    overallProgress: 0,
    loading: true,
  });

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
  };

  // Fetch user profile data
  useEffect(() => {
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

    fetchUserProfile();
  }, [user, token]);

  // Fetch overview data (courses and progress)
  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!user || !token) {
        setOverviewData((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setOverviewData((prev) => ({ ...prev, loading: true }));
        const baseUrl = import.meta.env.VITE_API_URL;

        // Fetch all courses
        const coursesResponse = await fetch(`${baseUrl}/api/training/courses`);
        let totalCourses = 0;
        if (coursesResponse.ok) {
          const coursesResult = await coursesResponse.json();
          if (coursesResult.success && coursesResult.data) {
            totalCourses = coursesResult.data.length;
          }
        }

        // Fetch user progress
        const progressResponse = await fetch(
          `${baseUrl}/api/progress/courses/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let completedCourses = 0;
        let overallProgress = 0;

        if (progressResponse.ok) {
          const progressResult = await progressResponse.json();
          if (progressResult.success && progressResult.data) {
            const courseProgress = progressResult.data;
            completedCourses = courseProgress.filter(
              (course: any) => course.progress === 100
            ).length;

            // Calculate overall progress
            if (courseProgress.length > 0) {
              const totalProgress = courseProgress.reduce(
                (sum: number, course: any) => sum + (course.progress || 0),
                0
              );
              overallProgress = Math.round(
                totalProgress / courseProgress.length
              );
            }
          }
        }

        setOverviewData({
          totalCourses,
          completedCourses,
          overallProgress,
          loading: false,
        });
      } catch (err: any) {
        console.error("Error fetching overview data:", err);
        setOverviewData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchOverviewData();
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

  // Form submission handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !userProfile) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL;

      // Only update basic user data (first name, last name, email)
      const userUpdateData = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
      };

      const response = await fetch(`${baseUrl}/api/users/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userUpdateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      if (result.success) {
        alert("Profile updated successfully!");
        // Refresh the profile data by refetching
        try {
          const userResponse = await fetch(
            `${baseUrl}/api/users/users/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.success) {
              updateFormDataFromProfile(userResult.data);
            }
          }
        } catch (err) {
          console.error("Error refreshing profile data:", err);
        }
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message}`);
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
                    <div className="flex items-center space-x-2">
                      <span className="text-black">⭐</span>
                      <span className="text-card-foreground font-medium">
                        {currentUser.xp} XP
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
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

            {/* Tabs Section */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b border-border">
                  <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
                    <TabsTrigger
                      value="overview"
                      className="bg-transparent border-0 text-foreground data-[state=active]:bg-muted/50 data-[state=active]:text-foreground rounded-lg px-6 py-4"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="bg-transparent border-0 text-foreground data-[state=active]:bg-muted/50 data-[state=active]:text-foreground rounded-lg px-6 py-4"
                    >
                      User Details
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6 min-w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-card/50 border-border rounded-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-lg">
                            <BarChart className="text-primary text-xl" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Total Courses
                            </p>
                            <p className="text-card-foreground text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-muted/50 h-8 w-12 rounded"></div>
                              ) : (
                                overviewData.totalCourses
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border rounded-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-lg">
                            <CheckCircle className="text-primary text-xl" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Completed
                            </p>
                            <p className="text-card-foreground text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-muted/50 h-8 w-12 rounded"></div>
                              ) : (
                                overviewData.completedCourses
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border rounded-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-lg">
                            <TrackChanges className="text-primary text-xl" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Progress
                            </p>
                            <p className="text-card-foreground text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-muted/50 h-8 w-12 rounded"></div>
                              ) : (
                                `${overviewData.overallProgress}%`
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* User Details Tab */}
                <TabsContent value="details" className="p-6">
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
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* Basic user information - only first name, last name, and email are editable */}
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
                            className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg"
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
                            className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg"
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
                          onChange={handleUserChange}
                          className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg"
                        />
                      </div>

                      <div className="flex justify-end items-center gap-4">
                        <Link
                          to="/forgot-password"
                          className="text-primary hover:text-primary/80 underline transition-colors duration-200"
                        >
                          Reset Password
                        </Link>
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-lg"
                        >
                          Update Profile
                        </Button>
                      </div>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProfilePage;
