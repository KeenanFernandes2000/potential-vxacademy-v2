import React, { useState, useEffect } from "react";
import { Editor } from "@/components/blocks/editor-00/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CommunicationEmail = () => {
  const [userType, setUserType] = useState<string>("sub_admin");
  const [emailContent, setEmailContent] = useState<string>("");
  const [editorState, setEditorState] = useState<any>(null);
  const [progressFilter, setProgressFilter] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
        setUsers(frontliners);
      } else {
        // Handle regular users endpoint response structure
        data = responseData.data || responseData;

        // Filter users by userType if we got all users
        if (userType === "sub_admin") {
          const subAdmins = data.filter(
            (user: any) => user.userType === "sub_admin"
          );
          setUsers(subAdmins);
        } else if (userType === "user") {
          const frontliners = data.filter(
            (user: any) => user.userType === "user"
          );
          setUsers(frontliners);
        } else {
          setUsers(data);
        }
      }
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

      {/* Debug Info - Remove this section later */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
        <p className="text-sm text-gray-600">User Type: {userType}</p>
        <p className="text-sm text-gray-600">
          Progress Filter: {progressFilter || "None selected"}
        </p>
        <p className="text-sm text-gray-600">
          Should make API call: {shouldMakeApiCall() ? "Yes" : "No"}
        </p>
        <p className="text-sm text-gray-600">
          Progress Percentage: {getProgressPercentage() || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Loading: {loading ? "Yes" : "No"}
        </p>
        <p className="text-sm text-gray-600">Users Found: {users.length}</p>
        {error && <p className="text-sm text-red-600">Error: {error}</p>}
      </div>

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
    </div>
  );
};

export default CommunicationEmail;
