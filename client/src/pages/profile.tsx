import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import UserSidebar from "@/components/userSidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";
import AdminSidebar from "@/components/adminSidebar";
import HomeNavigation from "@/components/homeNavigation";
import { BarChart, CheckCircle, TrackChanges } from "@mui/icons-material";


// Hardcoded usertype - change this to switch between "subadmin" and "user"
type UserType = "subadmin" | "user";
const usertype = "asdad" as UserType; // Change to "subadmin" for sub-admin profile

type Props = {};

const ProfilePage = (props: Props) => {
  // Sub-admin profile state
  const [subAdminData, setSubAdminData] = useState({
    job_title: "Senior Manager",
    total_frontliners: "150",
    eid: "784-2023-1234567-1",
    phone_number: "+971501234567",
  });

  // User profile state
  const [userData, setUserData] = useState({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@company.com",
    role_category: "Technical",
    role: "Senior Developer",
    seniority: "Senior",
    eid: "784-2023-7654321-2",
    phone_number: "+971507654321",
  });

  // Security tab state
  const [securityData, setSecurityData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Password validation state
  const [passwordError, setPasswordError] = useState("");

  // Password validation function
  const validatePasswords = (password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else if (confirmPassword && password === confirmPassword) {
      setPasswordError("");
    } else if (!confirmPassword) {
      setPasswordError("");
    }
  };

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

  // Dummy data arrays for select dropdowns
  const roleCategories = [
    "Management",
    "Technical",
    "Administrative",
    "Support",
    "Sales",
    "Marketing",
    "Finance",
    "Human Resources",
    "Operations",
    "Research & Development",
  ];

  const roles = [
    "Manager",
    "Team Lead",
    "Senior Developer",
    "Developer",
    "Analyst",
    "Coordinator",
    "Specialist",
    "Assistant",
    "Consultant",
    "Director",
  ];

  const seniorityLevels = [
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead",
    "Principal",
    "Expert",
    "Manager",
    "Director",
    "Executive",
  ];

  // Get current user data based on usertype
  const getCurrentUserData = () => {
    if (usertype === "subadmin") {
      return {
        name: "Admin User",
        email: "admin@vx-academy.ae",
        role: "Sub Administrator",
        xp: 310,
        level: "Beginner",
        avatar: "A",
      };
    } else {
      return {
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        role: userData.role,
        xp: 150,
        level: "Beginner",
        avatar: userData.first_name.charAt(0).toUpperCase(),
      };
    }
  };

  const currentUser = getCurrentUserData();

  // Render appropriate sidebar based on usertype
  const renderSidebar = () => {
    if (usertype === "user") {
      return <UserSidebar />;
    } else if (usertype === "subadmin") {
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

  const handleUserSelectChange = (name: string, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      if (name === "new_password" || name === "confirm_password") {
        const password = name === "new_password" ? value : prev.new_password;
        const confirmPassword =
          name === "confirm_password" ? value : prev.confirm_password;
        validatePasswords(password, confirmPassword);
      }

      return newData;
    });
  };

  // Form submission handlers
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToUpdate = usertype === "subadmin" ? subAdminData : userData;
    console.log("Profile updated:", dataToUpdate);
    alert("Profile updated successfully!");
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) {
      alert("Please fix the password validation errors before submitting.");
      return;
    }
    if (securityData.new_password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    console.log("Password updated:", securityData);
    alert("Password updated successfully!");
    setSecurityData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

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
                    <TabsTrigger
                      value="security"
                      className="bg-transparent border-0 text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-none px-6 py-4"
                    >
                      Security
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
                            <p className="text-white text-2xl font-bold">12</p>
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
                            <p className="text-white text-2xl font-bold">8</p>
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
                            <p className="text-white text-2xl font-bold">67%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* User Details Tab */}
                <TabsContent value="details" className="p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {usertype === "subadmin" ? (
                      // Sub-admin fields
                      <>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      </>
                    ) : (
                      // User fields
                      <>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label
                              htmlFor="role_category"
                              className="block text-white font-medium"
                            >
                              Role Category
                            </label>
                            <Select
                              value={userData.role_category}
                              onValueChange={(value) =>
                                handleUserSelectChange("role_category", value)
                              }
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white w-full rounded-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#003451] border-white/20 text-white">
                                {roleCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="role"
                              className="block text-white font-medium"
                            >
                              Role
                            </label>
                            <Select
                              value={userData.role}
                              onValueChange={(value) =>
                                handleUserSelectChange("role", value)
                              }
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white w-full rounded-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#003451] border-white/20 text-white">
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="seniority"
                              className="block text-white font-medium"
                            >
                              Seniority
                            </label>
                            <Select
                              value={userData.seniority}
                              onValueChange={(value) =>
                                handleUserSelectChange("seniority", value)
                              }
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white w-full rounded-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#003451] border-white/20 text-white">
                                {seniorityLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              value={userData.eid}
                              onChange={handleUserChange}
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
                              value={userData.phone_number}
                              onChange={handleUserChange}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 rounded-full"
                      >
                        Update Profile
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Change Password
                      </h3>
                      <p className="text-white/70 text-sm">
                        Update your account password for security
                      </p>
                    </div>
                    <form
                      onSubmit={handleSecuritySubmit}
                      className="space-y-6 w-full"
                    >
                      <div className="space-y-2">
                        <label
                          htmlFor="old_password"
                          className="block text-white font-medium"
                        >
                          Old Password
                        </label>
                        <Input
                          id="old_password"
                          name="old_password"
                          type="password"
                          value={securityData.old_password}
                          onChange={handleSecurityChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="new_password"
                          className="block text-white font-medium"
                        >
                          New Password
                        </label>
                        <Input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={securityData.new_password}
                          onChange={handleSecurityChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="confirm_password"
                          className="block text-white font-medium"
                        >
                          Confirm New Password
                        </label>
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          value={securityData.confirm_password}
                          onChange={handleSecurityChange}
                          className={`bg-white/10 text-white placeholder:text-white/50 rounded-full w-full ${
                            passwordError
                              ? "border-red-500"
                              : securityData.confirm_password &&
                                securityData.new_password ===
                                  securityData.confirm_password
                              ? "border-green-500"
                              : "border-white/20"
                          }`}
                        />
                        {passwordError && (
                          <p className="text-red-400 text-sm flex items-center gap-2">
                            <span>⚠</span>
                            {passwordError}
                          </p>
                        )}
                        {securityData.confirm_password &&
                          securityData.new_password ===
                            securityData.confirm_password &&
                          !passwordError && (
                            <p className="text-green-400 text-sm flex items-center gap-2">
                              <span>✓</span>
                              Passwords match
                            </p>
                          )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black px-8 rounded-full"
                        >
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </div>
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
