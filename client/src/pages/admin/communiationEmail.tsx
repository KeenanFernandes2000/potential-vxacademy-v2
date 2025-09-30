import React, { useState, useEffect } from "react";
import { Editor } from "@/components/blocks/editor-00/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// API object for user-related API calls
const api = {
  async fetchUsers(userType: string, progressFilter?: string) {
    const baseUrl = import.meta.env.VITE_API_URL;
    let url = `${baseUrl}/api/users/users`;
    let params = new URLSearchParams();

    if (userType === "user" && progressFilter && progressFilter !== "all") {
      // Use progress threshold endpoint
      url = `${baseUrl}/api/users/users/by-progress-threshold`;
      params.append("progressThreshold", progressFilter);
    }

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    let data;
    if (userType === "user" && progressFilter && progressFilter !== "all") {
      // Handle progress threshold response structure
      data = responseData.data.users || [];
      // Filter for userType === "user" and extract user objects
      const frontliners = data
        .filter((item: any) => item.user && item.user.userType === "user")
        .map((item: any) => item.user);
      return frontliners;
    } else {
      // Handle regular users endpoint response structure
      data = responseData.data || responseData;

      // Filter users by userType if we got all users
      if (userType === "sub_admin") {
        const subAdmins = data.filter(
          (user: any) => user.userType === "sub_admin"
        );
        return subAdmins;
      } else if (userType === "user") {
        const frontliners = data.filter(
          (user: any) => user.userType === "user"
        );
        return frontliners;
      } else {
        return data;
      }
    }
  },
};

const CommunicationEmail = () => {
  const [userType, setUserType] = useState<string>("sub_admin");
  const [emailContent, setEmailContent] = useState<string>("");
  const [editorState, setEditorState] = useState<any>(null);
  const [progressFilter, setProgressFilter] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>("");

  // Helper function to determine if API call should be made
  const shouldMakeApiCall = () => {
    if (userType === "sub_admin") {
      return true; // API call needed for sub admins
    }
    if (userType === "user" && progressFilter && progressFilter !== "all") {
      return true; // API call needed for specific progress filter
    }
    if (userType === "user" && progressFilter === "all") {
      return true; // API call needed for all frontliners
    }
    return false; // No API call needed
  };

  // Get the progress percentage for API call
  const getProgressPercentage = () => {
    if (progressFilter && progressFilter !== "all") {
      return parseInt(progressFilter);
    }
    return null;
  };

  // API call to fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const users = await api.fetchUsers(userType, progressFilter);
      setUsers(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to make API call when conditions change
  useEffect(() => {
    if (shouldMakeApiCall()) {
      fetchUsers();
    }
  }, [userType, progressFilter]);

  // Function to send bulk email
  const sendBulkEmail = async () => {
    if (!emailSubject.trim()) {
      setError("Please enter an email subject");
      return;
    }

    if (!emailContent.trim()) {
      setError("Please enter email content");
      return;
    }

    if (users.length === 0) {
      setError("No recipients selected. Please select user type and filters.");
      return;
    }

    setSending(true);
    setError("");
    setSendSuccess(false);

    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/email/sendCustomTextEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: users.map((user) => user.email).filter((email) => email),
          subject: emailSubject,
          text: emailContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setSendSuccess(true);
      console.log("Email sent successfully:", result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
      console.error("Error sending email:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Email Communication
        </h1>
        <p className="text-gray-600 mt-2">
          Send emails to users and manage communication
        </p>
      </div>

      {/* Sub Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Select Recipient Type
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose the type of users you want to send emails to
        </p>
      </div>

      {/* Radio Buttons */}
      <div className="mb-6">
        <div className="flex space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="sub_admin"
              checked={userType === "sub_admin"}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Sub Admins
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="userType"
              value="user"
              checked={userType === "user"}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Frontliners
            </span>
          </label>
        </div>
      </div>

      {/* Progress Filter - Only show when Frontliners is selected */}
      {userType === "user" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Progress Filter
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Filter frontliners by their training progress percentage
          </p>
          <div className="w-64">
            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select progress filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frontliners</SelectItem>
                <SelectItem value="10">Less than 10%</SelectItem>
                <SelectItem value="20">Less than 20%</SelectItem>
                <SelectItem value="30">Less than 30%</SelectItem>
                <SelectItem value="40">Less than 40%</SelectItem>
                <SelectItem value="50">Less than 50%</SelectItem>
                <SelectItem value="60">Less than 60%</SelectItem>
                <SelectItem value="70">Less than 70%</SelectItem>
                <SelectItem value="80">Less than 80%</SelectItem>
                <SelectItem value="90">Less than 90%</SelectItem>
                <SelectItem value="100">Less than 100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* User Emails Display */}
      {users.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recipient Emails ({users.length} users)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            The following emails will receive this communication:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {users.map((user, index) => (
                <div
                  key={user.id || index}
                  className="bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                >
                  <div className="font-medium text-gray-800">
                    {user.email || "No email"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email Subject */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Email Subject
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the subject line for your email
        </p>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          placeholder="Enter email subject..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Email Content Editor */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Email Content
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Write your email content using the rich text editor below
        </p>
        <div className="border border-gray-300 rounded-lg">
          <Editor
            editorState={editorState}
            onChange={(newEditorState) => {
              setEditorState(newEditorState);
            }}
            onSerializedChange={(serializedState) => {
              setEmailContent(JSON.stringify(serializedState));
            }}
          />
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {sendSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Email sent successfully to {users.length} recipients!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="mb-6">
        <button
          onClick={sendBulkEmail}
          disabled={
            sending ||
            users.length === 0 ||
            !emailSubject.trim() ||
            !emailContent.trim()
          }
          className={`
            px-6 py-3 rounded-full font-medium text-white transition-colors duration-200
            ${
              sending ||
              users.length === 0 ||
              !emailSubject.trim() ||
              !emailContent.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }
          `}
        >
          {sending ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </div>
          ) : (
            `Send Email to ${users.length} Recipients`
          )}
        </button>

        {users.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Please select a user type and apply filters to see recipients
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunicationEmail;
