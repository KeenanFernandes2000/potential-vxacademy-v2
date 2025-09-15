import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
interface SubAdminData {
  job_title: string;
  total_frontliners: string;
  eid: string;
  phone_number: string;
}

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

  // Sub-admin profile state
  const [subAdminData, setSubAdminData] = useState<SubAdminData>({
    job_title: "",
    total_frontliners: "",
    eid: "",
    phone_number: "",
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

    // Set form data based on user type
    if (profileData.userType === "sub_admin" && profileData.subAdminDetails) {
      setSubAdminData({
        job_title: profileData.subAdminDetails.jobTitle || "",
        total_frontliners:
          profileData.subAdminDetails.totalFrontliners?.toString() || "",
        eid: profileData.subAdminDetails.eid || "",
        phone_number: profileData.subAdminDetails.phoneNumber || "",
      });
    } else if (
      profileData.userType === "user" &&
      profileData.normalUserDetails
    ) {
      setUserData({
        first_name: profileData.firstName || "",
        last_name: profileData.lastName || "",
        email: profileData.email || "",
        role_category: profileData.normalUserDetails.roleCategory || "",
        role: profileData.normalUserDetails.role || "",
        seniority: profileData.normalUserDetails.seniority || "",
        eid: profileData.normalUserDetails.eid || "",
        phone_number: profileData.normalUserDetails.phoneNumber || "",
      });
    } else if (profileData.userType === "user") {
      // For users without normalUserDetails, just set basic fields
      setUserData({
        first_name: profileData.firstName || "",
        last_name: profileData.lastName || "",
        email: profileData.email || "",
        role_category: "",
        role: "",
        seniority: "",
        eid: "",
        phone_number: "",
      });
    } else if (profileData.userType === "admin") {
      // For admin users, set basic fields
      setUserData({
        first_name: profileData.firstName || "",
        last_name: profileData.lastName || "",
        email: profileData.email || "",
        role_category: "",
        role: "",
        seniority: "",
        eid: "",
        phone_number: "",
      });
    }
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

  // EID formatting function
  const formatEID = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 14) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(
        7,
        14
      )}-${digits.slice(14, 15)}`;
    }
  };

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

  // Form handlers
  const handleSubAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setSubAdminData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setSubAdminData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setUserData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Form submission handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !userProfile) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      let response: Response;
      let result: any;

      // First, update basic user data for all user types
      const userUpdateData = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
      };

      response = await fetch(`${baseUrl}/api/users/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userUpdateData),
      });

      // If user is sub-admin, also update sub-admin specific data
      if (userProfile.userType === "sub_admin") {
        const subAdminUpdateData = {
          jobTitle: subAdminData.job_title,
          totalFrontliners: parseInt(subAdminData.total_frontliners) || 0,
          eid: subAdminData.eid,
          phoneNumber: subAdminData.phone_number,
        };

        const subAdminResponse = await fetch(
          `${baseUrl}/api/users/${user.id}/sub-admin`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subAdminUpdateData),
          }
        );

        if (!subAdminResponse.ok) {
          throw new Error("Failed to update sub-admin details");
        }
      }

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      result = await response.json();
      if (result.success) {
        alert("Profile updated successfully!");
        // Refresh the profile data by refetching
        try {
          const baseUrl = import.meta.env.VITE_API_URL;
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
        <div className="min-h-screen bg-[#003451] relative overflow-hidden flex w-full">
          <UserSidebar />
          <SidebarInset className="flex-1 w-full">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
                <p className="text-white/80 text-lg">Loading profile...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#003451] relative overflow-hidden flex w-full">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content Area */}
        <SidebarInset className="flex-1 w-full">
          {/* Main Content */}
          <div className="w-full px-8 py-12">
            {/* User Details Header */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-none p-6 mb-8">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {currentUser.avatar}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {currentUser.name}
                  </h1>
                  <p className="text-white/80 mb-3">{currentUser.email}</p>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-black">⭐</span>
                      <span className="text-white font-medium">
                        {currentUser.xp} XP
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">🏅</span>
                      <span className="text-gray-400">{currentUser.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">🛡️</span>
                      <span className="text-gray-400">{currentUser.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-none">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b border-white/20">
                  <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
                    <TabsTrigger
                      value="overview"
                      className="bg-transparent border-0 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-none px-6 py-4"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="bg-transparent border-0 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-none px-6 py-4"
                    >
                      User Details
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6 min-w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-white/5 border-white/20 rounded-none">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#00d8cc]/20 flex items-center justify-center">
                            <BarChart className="text-[#00d8cc] text-xl" />
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">
                              Total Courses
                            </p>
                            <p className="text-white text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
                              ) : (
                                overviewData.totalCourses
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/20 rounded-none">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#00d8cc]/20 flex items-center justify-center">
                            <CheckCircle className="text-[#00d8cc] text-xl" />
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Completed</p>
                            <p className="text-white text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
                              ) : (
                                overviewData.completedCourses
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/20 rounded-none">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#00d8cc]/20 flex items-center justify-center">
                            <TrackChanges className="text-[#00d8cc] text-xl" />
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Progress</p>
                            <p className="text-white text-2xl font-bold">
                              {overviewData.loading ? (
                                <div className="animate-pulse bg-white/20 h-8 w-12 rounded"></div>
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
                        <p className="text-white/80 text-lg">
                          Loading profile...
                        </p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400 text-lg mb-4">
                        Error loading profile
                      </p>
                      <p className="text-white/60">{error}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* Basic user information - available for all user types */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="first_name"
                            className="block text-white font-medium"
                          >
                            First Name
                          </label>
                          <Input
                            id="first_name"
                            name="first_name"
                            value={userData.first_name}
                            onChange={handleUserChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="last_name"
                            className="block text-white font-medium"
                          >
                            Last Name
                          </label>
                          <Input
                            id="last_name"
                            name="last_name"
                            value={userData.last_name}
                            onChange={handleUserChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-white font-medium"
                        >
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={userData.email}
                          onChange={handleUserChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                        />
                      </div>

                      {/* Sub-admin specific fields */}
                      {userProfile?.userType === "sub_admin" && (
                        <>
                          <div className="border-t border-white/20 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                              Sub-Admin Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label
                                  htmlFor="job_title"
                                  className="block text-white font-medium"
                                >
                                  Job Title
                                </label>
                                <Input
                                  id="job_title"
                                  name="job_title"
                                  value={subAdminData.job_title}
                                  onChange={handleSubAdminChange}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label
                                  htmlFor="total_frontliners"
                                  className="block text-white font-medium"
                                >
                                  Total Frontliners
                                </label>
                                <Input
                                  id="total_frontliners"
                                  name="total_frontliners"
                                  type="number"
                                  value={subAdminData.total_frontliners}
                                  onChange={handleSubAdminChange}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <div className="space-y-2">
                                <label
                                  htmlFor="eid"
                                  className="block text-white font-medium"
                                >
                                  EID
                                </label>
                                <Input
                                  id="eid"
                                  name="eid"
                                  value={subAdminData.eid}
                                  onChange={handleSubAdminChange}
                                  maxLength={19}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <label
                                  htmlFor="phone_number"
                                  className="block text-white font-medium"
                                >
                                  Phone Number
                                </label>
                                <Input
                                  id="phone_number"
                                  name="phone_number"
                                  type="tel"
                                  value={subAdminData.phone_number}
                                  onChange={handleSubAdminChange}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex justify-end items-center gap-4">
                          <Link 
                            to="/forgot-password"
                            className="text-[#00d8cc] hover:text-[#00b8b0] underline transition-colors duration-200"
                          >
                              Reset Password
                          </Link>
                          <Button
                            type="submit"
                            className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 rounded-full"
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
