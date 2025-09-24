import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
} from "docx";

// API object with all endpoints
const api = {
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

        // Update invitations state to include the new invitation
        const newInvitation = {
          type,
          tokenHash: data.data.tokenHash,
          createdBy: user.id,
          // Add other fields that might be returned from the API
          ...data.data,
        };
        setInvitations((prev) => {
          // Remove any existing invitation of the same type and add the new one
          const filtered = prev.filter((inv) => inv.type !== type);
          return [...filtered, newInvitation];
        });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Frontliner Invitations
        </h1>
        <p className="text-muted-foreground">
          Send invitations to new frontliners or existing frontliners in your
          organization.
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
                Invitation generated successfully. Download the Word document to
                send to new users:
              </p>
              <Button
                onClick={() =>
                  generateWordDocument(
                    "new_joiner",
                    getInvitationLink("new_joiner")!
                  )
                }
                className="w-full"
                variant="default"
              >
                📄 Download New User Invitation Document
              </Button>
            </div>
          ) : hasInvitation("new_joiner") ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Invitation exists but link is not available. Generate a new
                  invitation to get the document.
                </p>
              </div>
              <Button
                onClick={() => makeInvitationRequest("new_joiner")}
                disabled={isLoading.newJoiner}
                className="w-full"
              >
                {isLoading.newJoiner
                  ? "Generating..."
                  : "Generate New Invitation Document"}
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
                Invitation generated successfully. Download the Word document to
                send to existing users:
              </p>
              <Button
                onClick={() =>
                  generateWordDocument(
                    "existing_joiner",
                    getInvitationLink("existing_joiner")!
                  )
                }
                className="w-full"
                variant="default"
              >
                📄 Download Existing User Invitation Document
              </Button>
            </div>
          ) : hasInvitation("existing_joiner") ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Invitation exists but link is not available. Generate a new
                  invitation to get the document.
                </p>
              </div>
              <Button
                onClick={() => makeInvitationRequest("existing_joiner")}
                disabled={isLoading.existingJoiner}
                className="w-full"
              >
                {isLoading.existingJoiner
                  ? "Generating..."
                  : "Generate New Invitation Document"}
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
