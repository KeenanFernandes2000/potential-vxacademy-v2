import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// API object with all endpoints
const api = {
  baseUrl: import.meta.env.VITE_BACKEND_URL,

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async sendInvitation(
    token: string,
    type: "new_joiner" | "existing_joiner",
    userId: number
  ) {
    return this.makeRequest("/api/users/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, createdBy: userId }),
    });
  },

  async getInvitationsByCreator(token: string, createdBy: number) {
    return this.makeRequest(`/api/users/invitations/creator/${createdBy}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

const Links = () => {
  const { token, user } = useAuth();
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

  // Fetch existing invitations on component mount
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!token || !user) return;

      setIsFetchingInvitations(true);
      try {
        const response = await api.getInvitationsByCreator(token, user.id);
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
        // Don't show error message for initial fetch, just log it
      } finally {
        setIsFetchingInvitations(false);
      }
    };

    fetchInvitations();
  }, [token, user]);

  const makeInvitationRequest = async (
    type: "new_joiner" | "existing_joiner"
  ) => {
    if (!token || !user) {
      setMessage({ type: "error", text: "Authentication required" });
      return;
    }

    setIsLoading((prev) => ({
      ...prev,
      [type === "new_joiner" ? "newJoiner" : "existingJoiner"]: true,
    }));
    setMessage(null);

    try {
      const data = await api.sendInvitation(token, type, user!.id);
      setMessage({
        type: "success",
        text: data.message || "Invitation sent successfully!",
      });

      // Generate invitation link using tokenHash
      if (data.data?.tokenHash) {
        const baseUrl = window.location.origin;
        const invitationUrl = `${baseUrl}/join?token=${data.data.tokenHash}&type=${type}`;
        setInvitationLinks((prev) => ({
          ...prev,
          [type]: invitationUrl,
        }));
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      setMessage({
        type: "error",
        text: "Failed to send invitation. Please try again.",
      });
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [type === "new_joiner" ? "newJoiner" : "existingJoiner"]: false,
      }));
    }
  };

  // Helper functions
  const hasInvitation = (type: "new_joiner" | "existing_joiner") => {
    return invitations.some((invitation) => invitation.type === type);
  };

  const hasInvitationLink = (type: "new_joiner" | "existing_joiner") => {
    return hasInvitation(type) && invitationLinks[type];
  };

  const getInvitationLink = (type: "new_joiner" | "existing_joiner") => {
    return invitationLinks[type] || null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({
        type: "success",
        text: "Link copied to clipboard!",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setMessage({
        type: "error",
        text: "Failed to copy link to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Invitations</h1>
        <p className="text-muted-foreground">
          Send invitations to new users or existing users in your organization.
        </p>
      </div>

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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">New Users</h3>
          {hasInvitationLink("new_joiner") ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invitation link generated:
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <code className="text-sm flex-1 break-all text-slate-700">
                  {getInvitationLink("new_joiner")}
                </code>
                <Button
                  onClick={() =>
                    copyToClipboard(getInvitationLink("new_joiner")!)
                  }
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>
          ) : hasInvitation("new_joiner") ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Invitation exists but link is not available. Generate a new
                  invitation to get the link.
                </p>
              </div>
              <Button
                onClick={() => makeInvitationRequest("new_joiner")}
                disabled={isLoading.newJoiner}
                className="w-full"
              >
                {isLoading.newJoiner
                  ? "Generating..."
                  : "Generate New Invitation Link"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => makeInvitationRequest("new_joiner")}
              disabled={isLoading.newJoiner}
              className="w-full"
            >
              {isLoading.newJoiner
                ? "Generating..."
                : "Generate New User Invitation"}
            </Button>
          )}
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-2">Existing Users</h3>
          {hasInvitationLink("existing_joiner") ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invitation link generated:
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <code className="text-sm flex-1 break-all text-slate-700">
                  {getInvitationLink("existing_joiner")}
                </code>
                <Button
                  onClick={() =>
                    copyToClipboard(getInvitationLink("existing_joiner")!)
                  }
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>
          ) : hasInvitation("existing_joiner") ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Invitation exists but link is not available. Generate a new
                  invitation to get the link.
                </p>
              </div>
              <Button
                onClick={() => makeInvitationRequest("existing_joiner")}
                disabled={isLoading.existingJoiner}
                className="w-full"
              >
                {isLoading.existingJoiner
                  ? "Generating..."
                  : "Generate New Invitation Link"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => makeInvitationRequest("existing_joiner")}
              disabled={isLoading.existingJoiner}
              className="w-full"
            >
              {isLoading.existingJoiner
                ? "Generating..."
                : "Generate Existing User Invitation"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Links;
