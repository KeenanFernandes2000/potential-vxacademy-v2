import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Loader2, Copy, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
} from "docx";

const Dashboard = () => {
  const { token, user: currentUser } = useAuth();

  // State management for API data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    newUsersPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invitation states
  const [isLoading, setIsLoading] = useState<{
    newJoiner: boolean;
    existingJoiner: boolean;
  }>({
    newJoiner: false,
    existingJoiner: false,
  });
  const [isFetchingInvitations, setIsFetchingInvitations] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationLinks, setInvitationLinks] = useState<{
    [key: string]: string;
  }>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // API object for user operations and invitations
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

    async sendInvitation(
      token: string,
      type: "new_joiner" | "existing_joiner",
      userId: number
    ) {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, createdBy: userId }),
      });
      const data = await response.json();
      return data;
    },

    async getInvitationsByCreator(token: string, createdBy: number) {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/invitations/creator/${createdBy}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    },
  };

  // Fetch dashboard stats and invitations on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get current user's full details for filtering (same logic as users.tsx)
        const currentUserResponse = await api.getUserById(
          currentUser?.id || 0,
          token
        );
        const currentUserData = currentUserResponse.data;

        // Get all users
        const usersResponse = await api.getAllUsers(token);
        let filteredUsersData = usersResponse.data || [];

        // Filter users based on current user's organization, suborganization, assets, and subassets (same logic as users.tsx)
        if (currentUserData) {
          filteredUsersData = filteredUsersData.filter((user: any) => {
            // Filter out Sub_admin users
            if (user.userType === "sub_admin") {
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

        // Calculate stats
        const totalUsers = filteredUsersData.length;

        // Count new users (created this month)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newUsers = filteredUsersData.filter((user: any) => {
          if (!user.createdAt) return false;
          const userCreatedDate = new Date(user.createdAt);
          return (
            userCreatedDate.getMonth() === currentMonth &&
            userCreatedDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate percentage
        const newUsersPercentage =
          totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;

        setStats({
          totalUsers,
          newUsers,
          newUsersPercentage,
        });

        // Fetch invitations
        setIsFetchingInvitations(true);
        try {
          const response = await api.getInvitationsByCreator(
            token,
            currentUser?.id || 0
          );
          const invitations = response.data.invitations || [];
          setInvitations(invitations);

          // Generate invitation links for existing invitations
          const baseUrl = window.location.origin;
          const links: { [key: string]: string } = {};

          invitations.forEach((invitation: any) => {
            const invitationUrl = `${baseUrl}/join?token=${invitation.tokenHash}&type=${invitation.type}`;
            links[invitation.type] = invitationUrl;
          });

          setInvitationLinks(links);
        } catch (error) {
          console.error("Failed to fetch invitations:", error);
        } finally {
          setIsFetchingInvitations(false);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data");
        // Keep default stats (all zeros) on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentUser]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "positive",
    loading = false,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    loading?: boolean;
  }) => (
    <Card className="bg-white border border-[#E5E5E5] hover:shadow-lg transition-all duration-300 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#2C2C2C]">
          {title}
        </CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-dawn animate-spin" />
        ) : (
          <Icon className="h-4 w-4 text-dawn" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-[#2C2C2C]">
          {loading ? "..." : value}
        </div>
        {change && !loading && (
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-[#666666]"
            }`}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Invitation helper functions
  const hasInvitation = (type: "new_joiner" | "existing_joiner") => {
    return invitations.some((invitation) => invitation.type === type);
  };

  const hasInvitationLink = (type: "new_joiner" | "existing_joiner") => {
    return hasInvitation(type) && invitationLinks[type];
  };

  const getInvitationLink = (type: "new_joiner" | "existing_joiner") => {
    return invitationLinks[type] || null;
  };

  const makeInvitationRequest = async (
    type: "new_joiner" | "existing_joiner"
  ) => {
    if (!token || !currentUser) {
      setMessage({ type: "error", text: "Authentication required" });
      return;
    }

    // Set loading state immediately
    setIsLoading((prev) => ({
      ...prev,
      [type === "new_joiner" ? "newJoiner" : "existingJoiner"]: true,
    }));
    setMessage(null);

    try {
      const data = await api.sendInvitation(token, type, currentUser!.id);

      // Generate invitation link using the API response
      if (data.data?.invitationLink) {
        const invitationUrl = data.data.invitationLink;

        // Update invitation links state immediately
        setInvitationLinks((prev) => {
          const newLinks = {
            ...prev,
            [type]: invitationUrl,
          };
          console.log("Updated invitation links:", newLinks);
          return newLinks;
        });

        // Extract token from the invitation link for storage
        const urlParams = new URLSearchParams(invitationUrl.split("?")[1]);
        const tokenHash = urlParams.get("token");

        // Update invitations state to include the new invitation
        const newInvitation = {
          type,
          tokenHash: tokenHash,
          createdBy: currentUser.id,
          // Add other fields that might be returned from the API
          ...data.data,
        };
        setInvitations((prev) => {
          // Remove any existing invitation of the same type and add the new one
          const filtered = prev.filter((inv) => inv.type !== type);
          const newInvitations = [...filtered, newInvitation];
          return newInvitations;
        });

        // Set success message after state updates with a small delay to ensure UI updates
        setTimeout(() => {
          setMessage({
            type: "success",
            text:
              data.message ||
              "Invitation generated successfully! You can now copy the link or download the document.",
          });
        }, 200);
      } else {
        setMessage({
          type: "error",
          text: "Failed to generate invitation link. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      setMessage({
        type: "error",
        text: "Failed to send invitation. Please try again.",
      });
    } finally {
      // Reset loading state
      setIsLoading((prev) => ({
        ...prev,
        [type === "new_joiner" ? "newJoiner" : "existingJoiner"]: false,
      }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({
        type: "success",
        text: "Link copied to clipboard!",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      setMessage({
        type: "error",
        text: "Failed to copy link. Please try again.",
      });
    }
  };

  const generateWordDocument = async (
    type: "new_joiner" | "existing_joiner",
    invitationUrl: string
  ) => {
    try {
      let content: Paragraph[] = [];

      if (type === "existing_joiner") {
        content = [
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear [Frontliner Name],",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Welcome to VX Academy! Start your learning journey, designed to help you deliver authentic, memorable, and world-class guest experiences.",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Please complete your registration and proceed to the Al Midhyaf Training area to access and download your certificate of completion.",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: invitationUrl,
                    bold: true,
                    color: "0066CC",
                    underline: {},
                    size: 24,
                  }),
                ],
                link: invitationUrl,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "We're excited to have you on this journey.",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Best of luck,",
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The VX Academy Team",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
        ];
      } else {
        content = [
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear [Frontliner Name],",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Thank you for completing your registration with the VX Academy. Your account has been successfully created.",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "You can now log in to the platform using the link below to access your dashboard and begin exploring the Academy:",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "👉 ",
                size: 24,
              }),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: invitationUrl,
                    bold: true,
                    color: "0066CC",
                    underline: {},
                    size: 24,
                  }),
                ],
                link: invitationUrl,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "We are excited to welcome you onboard and look forward to supporting your learning journey.",
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Best regards,",
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The VX Academy Team",
                bold: true,
                size: 24,
              }),
            ],
          }),
        ];
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: content,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VX_Academy_Invitation_${
        type === "new_joiner" ? "New_Users" : "Existing_Users"
      }.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: "Word document downloaded successfully!",
      });
    } catch (error) {
      console.error("Failed to generate Word document:", error);
      setMessage({
        type: "error",
        text: "Failed to generate Word document. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#2C2C2C]">
            Sub-Admin Dashboard
          </h1>
          <p className="text-[#666666]">
            Welcome back! Here's what's happening with your organization!
          </p>
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Invitation Cards */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-white border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C]">New Users</CardTitle>
            </CardHeader>
            <CardContent>
              {hasInvitationLink("new_joiner") ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#666666]">
                    Invitation link is ready. Copy the link or download the Word
                    document to send to new users.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() =>
                        copyToClipboard(getInvitationLink("new_joiner")!)
                      }
                      variant="outline"
                      className="flex items-center gap-2 border-[#E5E5E5] text-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-sandstone hover:border-dawn hover:scale-95"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      onClick={() =>
                        generateWordDocument(
                          "new_joiner",
                          getInvitationLink("new_joiner")!
                        )
                      }
                      className="flex items-center gap-2 bg-dawn hover:text-gray-100 text-white hover:scale-95"
                    >
                      <FileText className="h-4 w-4" />
                      Download Email Template
                    </Button>
                  </div>
                </div>
              ) : hasInvitation("new_joiner") ? (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚠️ Invitation exists but link is not available. Generate a
                      new invitation to get the document.
                    </p>
                  </div>
                  <Button
                    onClick={() => makeInvitationRequest("new_joiner")}
                    disabled={isLoading.newJoiner}
                    className="w-full bg-dawn hover:bg-[#B85A1A] text-white disabled:opacity-50"
                  >
                    {isLoading.newJoiner
                      ? "Generating Invitation..."
                      : "Generate New Invitation"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#666666]">
                    Generate an invitation link for new users to join your
                    organization.
                  </p>
                  <Button
                    onClick={() => makeInvitationRequest("new_joiner")}
                    disabled={isLoading.newJoiner}
                    className="w-full bg-dawn hover:bg-[#B85A1A] text-white disabled:opacity-50"
                  >
                    {isLoading.newJoiner
                      ? "Generating Invitation..."
                      : "Generate New User Invitation"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5]">
            <CardHeader>
              <CardTitle className="text-[#2C2C2C]">Existing Users</CardTitle>
            </CardHeader>
            <CardContent>
              {hasInvitationLink("existing_joiner") ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#666666]">
                    Invitation link is ready. Copy the link or download the Word
                    document to send to existing users.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() =>
                        copyToClipboard(getInvitationLink("existing_joiner")!)
                      }
                      variant="outline"
                      className="flex items-center gap-2 border-[#E5E5E5] text-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-sandstone hover:border-dawn hover:scale-95"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button
                      onClick={() =>
                        generateWordDocument(
                          "existing_joiner",
                          getInvitationLink("existing_joiner")!
                        )
                      }
                      className="flex items-center gap-2 bg-dawn hover:text-gray-100 text-white hover:scale-95"
                    >
                      <FileText className="h-4 w-4" />
                      Download Email Template
                    </Button>
                  </div>
                </div>
              ) : hasInvitation("existing_joiner") ? (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚠️ Invitation exists but link is not available. Generate a
                      new invitation to get the document.
                    </p>
                  </div>
                  <Button
                    onClick={() => makeInvitationRequest("existing_joiner")}
                    disabled={isLoading.existingJoiner}
                    className="w-full bg-dawn hover:bg-[#B85A1A] text-white disabled:opacity-50"
                  >
                    {isLoading.existingJoiner
                      ? "Generating Invitation..."
                      : "Generate New Invitation"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#666666]">
                    Generate an invitation link for existing users to access
                    training.
                  </p>
                  <Button
                    onClick={() => makeInvitationRequest("existing_joiner")}
                    disabled={isLoading.existingJoiner}
                    className="w-full bg-dawn hover:bg-[#B85A1A] text-white disabled:opacity-50"
                  >
                    {isLoading.existingJoiner
                      ? "Generating Invitation..."
                      : "Generate Existing User Invitation"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change="Users in your organization"
            changeType="neutral"
            loading={loading}
          />
          <StatCard
            title="New Users"
            value={stats.newUsers}
            icon={UserPlus}
            change={`${stats.newUsersPercentage}% of total users this month`}
            changeType="positive"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
