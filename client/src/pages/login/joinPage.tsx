import React, { useState, useEffect } from "react";
import { PhoneInput } from "react-international-phone";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import HomeNavigation from "@/components/homeNavigation";

// API object for sub-admin registration and token verification
const api = {
  async getRoleCategories() {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/role-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching role categories:", error);
      throw error;
    }
  },

  async getAllRoles() {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  async createRole(roleData: { name: string; categoryId: number }) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  async completeSubAdminRegistration(id: string, registrationData: any) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/sub-admins/register/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to complete sub-admin registration:", error);
      throw error;
    }
  },

  async verifyInvitationToken(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/invitations/verify/${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to verify invitation token:", error);
      throw error;
    }
  },

  async createUser(userData: any) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  },

  async registerNormalUser(userId: string, normalUserData: any) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/users/${userId}/register-normal-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(normalUserData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to register normal user:", error);
      throw error;
    }
  },
};

type Props = {};

const joinPage = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  // Form 1 state (sub admin)
  const [form1Data, setForm1Data] = useState({
    job_title: "",
    total_frontliners: "",
    eid: "",
    phone_number: "",
    password: "",
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
    // Remove all non-digit characters
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

  // Form 2 state (user)
  const [form2Data, setForm2Data] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role_category: "",
    role: "",
    seniority: "",
    eid: "",
    phone_number: "",
    organization: "",
    subOrganization: "",
    asset: "",
    subAsset: "",
  });

  // Custom role state for "Other" option
  const [customRole, setCustomRole] = useState("");

  // User form step state
  const [userFormStep, setUserFormStep] = useState(1);

  // User form password validation state
  const [userPasswordError, setUserPasswordError] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Token verification states
  const [invitationData, setInvitationData] = useState<any>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState("");

  // Role categories state
  const [roleCategories, setRoleCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [isLoadingRoleCategories, setIsLoadingRoleCategories] = useState(false);

  // Roles state
  const [allRoles, setAllRoles] = useState<
    Array<{ id: number; categoryId: number; name: string }>
  >([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // User form password validation function
  const validateUserPasswords = (password: string, confirmPassword: string) => {
    if (confirmPassword && password !== confirmPassword) {
      setUserPasswordError("Passwords do not match");
    } else if (confirmPassword && password === confirmPassword) {
      setUserPasswordError("");
    } else if (!confirmPassword) {
      setUserPasswordError("");
    }
  };

  // Fetch role categories and roles on component mount
  useEffect(() => {
    const fetchRoleCategories = async () => {
      setIsLoadingRoleCategories(true);
      try {
        const response = await api.getRoleCategories();
        if (response.success && response.data) {
          setRoleCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch role categories:", error);
        // Fallback to empty array on error
        setRoleCategories([]);
      } finally {
        setIsLoadingRoleCategories(false);
      }
    };

    const fetchAllRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const response = await api.getAllRoles();
        if (response.success && response.data) {
          setAllRoles(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        // Fallback to empty array on error
        setAllRoles([]);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoleCategories();
    fetchAllRoles();
  }, []);

  // Function to get filtered roles based on selected role category
  const getFilteredRoles = (categoryId: string) => {
    if (!categoryId || categoryId === "") return [];
    const categoryIdNum = parseInt(categoryId);
    return allRoles.filter((role) => role.categoryId === categoryIdNum);
  };

  const seniorityLevels = ["Manager", "Staff"];

  // Check parameters and redirect if needed
  useEffect(() => {
    if (
      ((!id || id.trim() === "") && (!token || token.trim() === "")) ||
      (id && id.trim() !== "" && token && token.trim() !== "")
    ) {
      navigate("/login");
    }
  }, [id, token, navigate]);

  // Verify invitation token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (token && token.trim() !== "" && (!id || id.trim() === "")) {
        try {
          setIsVerifyingToken(true);
          setTokenError("");

          const response = await api.verifyInvitationToken(token);

          if (response.success) {
            setInvitationData(response.data);
            // Store invitation data in form2Data
            if (response.data.subAdmin) {
              setForm2Data((prev) => ({
                ...prev,
                organization: response.data.subAdmin.organization || "",
                subOrganization: response.data.subAdmin.subOrganization || "",
                asset: response.data.subAdmin.asset || "",
                subAsset: response.data.subAdmin.subAsset || "",
              }));
            }
          } else {
            setTokenError(
              response.message || "Invalid or expired invitation token"
            );
          }
        } catch (error: any) {
          console.error("Token verification error:", error);
          setTokenError(
            "Failed to verify invitation token. Please try again or contact support."
          );
        } finally {
          setIsVerifyingToken(false);
        }
      }
    };

    verifyToken();
  }, [token, id]);

  const handleForm1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setForm1Data((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setForm1Data((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        // Validate passwords in real-time
        if (name === "password" || name === "confirm_password") {
          const password = name === "password" ? value : prev.password;
          const confirmPassword =
            name === "confirm_password" ? value : prev.confirm_password;
          validatePasswords(password, confirmPassword);
        }

        return newData;
      });
    }
  };

  const handleForm2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setForm2Data((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setForm2Data((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        // Validate passwords in real-time
        if (name === "password" || name === "confirm_password") {
          const password = name === "password" ? value : prev.password;
          const confirmPassword =
            name === "confirm_password" ? value : prev.confirm_password;
          validateUserPasswords(password, confirmPassword);
        }

        return newData;
      });
    }
  };

  const handleForm2SelectChange = (name: string, value: string) => {
    setForm2Data((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear custom role when a different role is selected
    if (name === "role" && value !== "Other") {
      setCustomRole("");
    }

    // Reset role when role category changes
    if (name === "role_category") {
      setForm2Data((prev) => ({
        ...prev,
        role: "",
      }));
      setCustomRole("");
    }
  };

  const handleForm1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password confirmation
    if (passwordError) {
      alert("Please fix the password validation errors before submitting.");
      return;
    }

    // Check password strength (optional - basic validation)
    if (form1Data.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Check if all required fields are filled
    if (!form1Data.job_title || !form1Data.eid || !form1Data.phone_number) {
      alert("Please fill in all required fields.");
      return;
    }

    // Check if id is present
    if (!id || id.trim() === "") {
      alert("Invalid registration link. Please contact your administrator.");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare registration data
      const registrationData = {
        jobTitle: form1Data.job_title,
        totalFrontliners: parseInt(form1Data.total_frontliners) || 0,
        eid: form1Data.eid,
        phoneNumber: form1Data.phone_number,
        password: form1Data.password,
      };

      const response = await api.completeSubAdminRegistration(
        id,
        registrationData
      );
      localStorage.setItem("userData", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      if (response.success) {
        navigate("/sub-admin/dashboard");
      } else {
        alert(
          `Registration failed: ${response.message || "Please try again."}`
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForm2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate custom role when "Other" is selected
    if (form2Data.role === "Other" && !customRole.trim()) {
      alert("Please specify your role when 'Other' is selected.");
      return;
    }

    // Check if all required fields are filled
    if (
      !form2Data.role_category ||
      !form2Data.role ||
      !form2Data.seniority ||
      !form2Data.eid ||
      !form2Data.phone_number
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);

      let finalRole = form2Data.role;
      let roleId = null;

      // If "Other" is selected, create a new role
      if (form2Data.role === "Other" && customRole.trim()) {
        const categoryId = parseInt(form2Data.role_category);

        try {
          const roleResponse = await api.createRole({
            name: customRole.trim(),
            categoryId: categoryId,
          });

          if (roleResponse.success && roleResponse.data) {
            // Use the newly created role
            finalRole = roleResponse.data.name;
            roleId = roleResponse.data.id;

            // Update local state with the new role
            setAllRoles((prev) => [...prev, roleResponse.data]);
          } else {
            throw new Error("Failed to create new role");
          }
        } catch (roleError) {
          console.error("Error creating role:", roleError);
          alert(
            "Failed to create custom role. Please try again or select an existing role."
          );
          return;
        }
      }

      // Check if we have the created user ID from step 1
      if (!invitationData?.createdUser?.id) {
        alert("User ID not found. Please try the registration process again.");
        return;
      }

      // Prepare normal user registration data
      const normalUserData = {
        roleCategory: form2Data.role_category,
        role: finalRole,
        seniority: form2Data.seniority,
        eid: form2Data.eid,
        phoneNumber: form2Data.phone_number,
        existing: type === "existing_joiner",
      };

      // Call the normal user registration endpoint
      const response = await api.registerNormalUser(
        invitationData.createdUser.id.toString(),
        normalUserData
      );

      if (response.success) {
        let userData = JSON.parse(localStorage.getItem("userData") || "{}");
        console.log(response.data);
        let flags = {
          existing: type === "existing_joiner",
          initialAssessment: response.data.initialAssessment,
        };
        localStorage.setItem("flags", JSON.stringify(flags));
        if (type === "existing_joiner") {
          navigate("/initial-assessment");
        } else {
          navigate("/user/dashboard");
        }
        // alert("Registration completed successfully! You can now log in.");
        // navigate("/login");
      } else {
        alert(
          `Registration failed: ${response.message || "Please try again."}`
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  // User form step navigation functions
  const handleUserFormNext = async () => {
    // Validate step 1 fields
    if (
      !form2Data.first_name ||
      !form2Data.last_name ||
      !form2Data.email ||
      !form2Data.password ||
      !form2Data.confirm_password
    ) {
      alert("Please fill in all required fields before proceeding.");
      return;
    }

    if (userPasswordError) {
      alert("Please fix the password validation errors before proceeding.");
      return;
    }

    if (form2Data.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Check if token is present
    if (!token || token.trim() === "") {
      alert("Invalid registration link. Please contact your administrator.");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare user data for API (only basic info for now)
      const userData = {
        firstName: form2Data.first_name,
        lastName: form2Data.last_name,
        email: form2Data.email,
        password: form2Data.password,
        organization: form2Data.organization,
        subOrganization: form2Data.subOrganization,
        asset: form2Data.asset,
        subAsset: form2Data.subAsset,
        invitationToken: token,
        userType: "user",
      };

      const response = await api.createUser(userData);
      localStorage.setItem("userData", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      if (response.success) {
        // Store the created user data for step 2
        setInvitationData((prev: any) => ({
          ...prev,
          createdUser: response.user,
        }));
        setUserFormStep(2);
      } else {
        alert(
          `Registration failed: ${response.message || "Please try again."}`
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm1 = () => (
    <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl md:text-2xl lg:text-5xl font-bold text-white mb-4">
          Sub Admin Form
        </CardTitle>
        <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
        <CardDescription className="text-md lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
          Sub Administrator Registration Form
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleForm1Submit} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="job_title"
              className="block text-lg font-semibold text-white pl-2"
            >
              Job Title
            </label>
            <Input
              id="job_title"
              name="job_title"
              type="text"
              placeholder="Enter your job title"
              value={form1Data.job_title}
              onChange={handleForm1Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="total_frontliners"
              className="block text-lg font-semibold text-white pl-2"
            >
              Total Frontliners
            </label>
            <Input
              id="total_frontliners"
              name="total_frontliners"
              type="number"
              placeholder="Enter total number of frontliners"
              value={form1Data.total_frontliners}
              onChange={handleForm1Change}
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="eid"
              className="block text-lg font-semibold text-white pl-2"
            >
              EID
            </label>
            <Input
              id="eid"
              name="eid"
              type="text"
              placeholder="784-YYYY-XXXXXXX-Z"
              value={form1Data.eid}
              onChange={handleForm1Change}
              maxLength={19}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="phone_number"
              className="block text-lg font-semibold text-white pl-2"
            >
              Phone Number
            </label>
            <div className="relative" id="phone_number">
              <PhoneInput
                defaultCountry="ae"
                value={form1Data.phone_number}
                onChange={(phone) =>
                  setForm1Data((prev) => ({ ...prev, phone_number: phone }))
                }
                className="react-international-phone"
                
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="password"
              className="block text-lg font-semibold text-white pl-2"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form1Data.password}
              onChange={handleForm1Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="confirm_password"
              className="block text-lg font-semibold text-white pl-2"
            >
              Confirm Password
            </label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Confirm your password"
              value={form1Data.confirm_password}
              onChange={handleForm1Change}
              required
              className={`bg-[#00d8cc]/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                passwordError
                  ? "border-red-500/60 focus:border-red-500/80 hover:border-red-500/70"
                  : form1Data.confirm_password &&
                    form1Data.password === form1Data.confirm_password
                  ? "border-green-500/60 focus:border-green-500/80 hover:border-green-500/70"
                  : "border-[#00d8cc]/20 focus:border-[#00d8cc]/40 hover:border-[#00d8cc]/30"
              }`}
            />
            {passwordError && (
              <p className="text-red-400 text-sm pl-2 flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {passwordError}
              </p>
            )}
            {form1Data.confirm_password &&
              form1Data.password === form1Data.confirm_password &&
              !passwordError && (
                <p className="text-green-400 text-sm pl-2 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Passwords match
                </p>
              )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderForm2 = () => {
    // Show loading state while verifying token
    if (isVerifyingToken) {
      return (
        <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl md:text-2xl lg:text-5xl font-bold text-white mb-4">
              Verifying Invitation
            </CardTitle>
            <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
            <CardDescription className="text-md lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
              Please wait while we verify your invitation...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto"></div>
          </CardContent>
        </Card>
      );
    }

    // Show error state if token verification failed
    if (tokenError) {
      return (
        <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl md:text-2xl lg:text-5xl font-bold text-white mb-4">
              Invalid Invitation
            </CardTitle>
            <div className="w-24 h-1 bg-red-500 rounded-full mx-auto mb-4"></div>
            <CardDescription className="text-md lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
              {tokenError}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl md:text-2xl lg:text-5xl font-bold text-white mb-4">
            User Form
          </CardTitle>
          <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
          <CardDescription className="text-md lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
            User Registration Form
          </CardDescription>

          {/* Step Indicator */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                userFormStep >= 1
                  ? "bg-[#00d8cc] text-black"
                  : "bg-white/20 text-white/60"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 rounded-full ${
                userFormStep >= 2 ? "bg-[#00d8cc]" : "bg-white/20"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                userFormStep >= 2
                  ? "bg-[#00d8cc] text-black"
                  : "bg-white/20 text-white/60"
              }`}
            >
              2
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {userFormStep === 1 ? (
            // Step 1: Basic Information
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label
                    htmlFor="first_name"
                    className="block text-lg font-semibold text-white pl-2"
                  >
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Enter first name"
                    value={form2Data.first_name}
                    onChange={handleForm2Change}
                    required
                    className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                  />
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="last_name"
                    className="block text-lg font-semibold text-white pl-2"
                  >
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Enter last name"
                    value={form2Data.last_name}
                    onChange={handleForm2Change}
                    required
                    className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form2Data.email}
                  onChange={handleForm2Change}
                  required
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form2Data.password}
                  onChange={handleForm2Change}
                  required
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="confirm_password"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Confirm your password"
                  value={form2Data.confirm_password}
                  onChange={handleForm2Change}
                  required
                  className={`bg-[#00d8cc]/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 transition-all duration-300 py-4 lg:py-5 text-base border-2 rounded-full ${
                    userPasswordError
                      ? "border-red-500/60 focus:border-red-500/80 hover:border-red-500/70"
                      : form2Data.confirm_password &&
                        form2Data.password === form2Data.confirm_password
                      ? "border-green-500/60 focus:border-green-500/80 hover:border-green-500/70"
                      : "border-[#00d8cc]/20 focus:border-[#00d8cc]/40 hover:border-[#00d8cc]/30"
                  }`}
                />
                {userPasswordError && (
                  <p className="text-red-400 text-sm pl-2 flex items-center gap-2">
                    <span className="text-red-500">⚠</span>
                    {userPasswordError}
                  </p>
                )}
                {form2Data.confirm_password &&
                  form2Data.password === form2Data.confirm_password &&
                  !userPasswordError && (
                    <p className="text-green-400 text-sm pl-2 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Passwords match
                    </p>
                  )}
              </div>

              <Button
                type="button"
                onClick={handleUserFormNext}
                disabled={isLoading}
                className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? "Creating Account..." : "Next Step"}
              </Button>
            </div>
          ) : (
            // Step 2: Professional Information
            <form onSubmit={handleForm2Submit} className="space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="role_category"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Role Category
                </label>
                <Select
                  value={form2Data.role_category}
                  onValueChange={(value) =>
                    handleForm2SelectChange("role_category", value)
                  }
                  required
                >
                  <SelectTrigger
                    className={`w-full bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 border-2 hover:border-[#00d8cc]/30 rounded-full text-sm ${
                      form2Data.role_category
                        ? "[&>span]:text-white"
                        : "[&>span]:text-cyan-50/55"
                    } `}
                  >
                    <SelectValue placeholder="Select role category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#003451] border-[#00d8cc]/20 text-white">
                    {isLoadingRoleCategories ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      roleCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="role"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Role
                </label>
                <Select
                  value={form2Data.role}
                  onValueChange={(value) =>
                    handleForm2SelectChange("role", value)
                  }
                  required
                >
                  <SelectTrigger
                    className={`w-full bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-sm border-2 hover:border-[#00d8cc]/30 rounded-full ${
                      form2Data.role
                        ? "[&>span]:text-white"
                        : "[&>span]:text-cyan-50/55"
                    }`}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#003451] border-[#00d8cc]/20 text-white">
                    {isLoadingRoles ? (
                      <SelectItem value="loading" disabled>
                        Loading roles...
                      </SelectItem>
                    ) : getFilteredRoles(form2Data.role_category).length ===
                      0 ? (
                      <SelectItem value="no-roles" disabled>
                        {form2Data.role_category
                          ? "No roles available for this category"
                          : "Please select a role category first"}
                      </SelectItem>
                    ) : (
                      <>
                        {getFilteredRoles(form2Data.role_category).map(
                          (role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          )
                        )}
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* Custom role input - only show when "Other" is selected */}
                {form2Data.role === "Other" && (
                  <div className="space-y-3 mt-4">
                    <label
                      htmlFor="custom_role"
                      className="block text-lg font-semibold text-white pl-2"
                    >
                      Specify Your Role
                    </label>
                    <Input
                      id="custom_role"
                      name="custom_role"
                      type="text"
                      placeholder="Enter your specific role"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      required
                      className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="seniority"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Seniority
                </label>
                <Select
                  value={form2Data.seniority}
                  onValueChange={(value) =>
                    handleForm2SelectChange("seniority", value)
                  }
                  required
                >
                  <SelectTrigger
                    className={`w-full bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-sm border-2 hover:border-[#00d8cc]/30 rounded-full ${
                      form2Data.seniority
                        ? "[&>span]:text-white"
                        : "[&>span]:text-cyan-50/55"
                    }`}
                  >
                    <SelectValue placeholder="Select seniority level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#003451] border-[#00d8cc]/20 text-white">
                    {seniorityLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="eid"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  EID
                </label>
                <Input
                  id="eid"
                  name="eid"
                  type="text"
                  placeholder="784-YYYY-XXXXXXX-Z"
                  value={form2Data.eid}
                  onChange={handleForm2Change}
                  maxLength={19}
                  required
                  className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
                />
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="phone_number"
                  className="block text-lg font-semibold text-white pl-2"
                >
                  Phone Number
                </label>
                <div className="relative" id="phone_number">
                  <PhoneInput
                    defaultCountry="ae"
                    value={form2Data.phone_number}
                    onChange={(phone) =>
                      setForm2Data((prev) => ({ ...prev, phone_number: phone }))
                    }
                    className="react-international-phone"
                    
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (token && token.trim() !== "" && (!id || id.trim() === "")) {
      return renderForm2();
    } else if (id && id.trim() !== "" && (!token || token.trim() === "")) {
      return renderForm1();
    } else {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#003451] relative overflow-hidden">
      {/* Navigation Bar with Glassmorphism */}
      <HomeNavigation />

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default joinPage;
