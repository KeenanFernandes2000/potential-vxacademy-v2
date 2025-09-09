import React, { useState, useEffect } from "react";
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

// API object for sub-admin registration
const api = {
  async completeSubAdminRegistration(id: string, registrationData: any) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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
};

type Props = {};

const joinPage = (props: Props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

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
  });

  // User form step state
  const [userFormStep, setUserFormStep] = useState(1);

  // User form password validation state
  const [userPasswordError, setUserPasswordError] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

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

  // Check parameters and redirect if needed
  useEffect(() => {
    if (
      ((!id || id.trim() === "") && (!token || token.trim() === "")) ||
      (id && id.trim() !== "" && token && token.trim() !== "")
    ) {
      navigate("/login");
    }
  }, [id, token, navigate]);

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

      if (response.success) {
        alert("Registration completed successfully! You can now log in.");
        navigate("/login");
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

  const handleForm2Submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // User form step navigation functions
  const handleUserFormNext = () => {
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

    setUserFormStep(2);
  };

  const handleUserFormPrevious = () => {
    setUserFormStep(1);
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
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Enter your phone number"
              value={form1Data.phone_number}
              onChange={handleForm1Change}
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

  const renderForm2 = () => (
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
              className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
            >
              Next Step
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
                  {roleCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="Enter your phone number"
                value={form2Data.phone_number}
                onChange={handleForm2Change}
                required
                className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={handleUserFormPrevious}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-white/20 rounded-full cursor-pointer"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );

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
