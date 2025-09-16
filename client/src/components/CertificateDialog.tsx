import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#003451",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  body: {
    padding: 30,
    flex: 1,
  },
  borderContainer: {
    border: "3px solid #00d8cc",
    borderRadius: 6,
    padding: 20,
    marginBottom: 20,
  },
  innerBorder: {
    border: "2px solid #003451",
    borderRadius: 6,
    padding: 25,
  },
  content: {
    alignItems: "center",
  },
  introText: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 15,
    textAlign: "center",
  },
  nameSection: {
    marginVertical: 15,
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003451",
    marginBottom: 5,
    textAlign: "center",
  },
  organizationText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 5,
    textAlign: "center",
  },
  courseSection: {
    marginVertical: 15,
    alignItems: "center",
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003451",
    marginBottom: 8,
    textAlign: "center",
  },
  completionText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  detailsSection: {
    position: "relative",
    marginTop: 15,
    paddingTop: 10,
    borderTop: "1px solid #e5e7eb",
    width: "100%",
    height: 50,
  },
  detailItem: {
    alignItems: "center",
    width: "45%",
  },
  detailItemLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    alignItems: "center",
    width: "45%",
  },
  detailItemRight: {
    position: "absolute",
    right: 0,
    top: 0,
    alignItems: "center",
    width: "45%",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
    marginTop: 10,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#003451",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signatureItem: {
    alignItems: "center",
    flex: 1,
  },
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: "#9ca3af",
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#4b5563",
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#003451",
  },
});

// PDF Document Component
const CertificatePDF = ({
  user,
  courseName,
  completionDate,
  certificateId,
}: {
  user: User;
  courseName: string;
  completionDate: string;
  certificateId: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logo} src="/vx-academy-logo.png" />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.borderContainer}>
          <View style={styles.innerBorder}>
            <View style={styles.content}>
              <Text style={styles.introText}>This is to certify that</Text>

              <View style={styles.nameSection}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                {user.organization && (
                  <Text style={styles.organizationText}>
                    Organization: {user.organization}
                  </Text>
                )}
                {user.subOrganization && (
                  <Text style={styles.organizationText}>
                    Department: {user.subOrganization}
                  </Text>
                )}
              </View>

              <Text style={styles.introText}>
                has successfully completed the
              </Text>

              <View style={styles.courseSection}>
                <Text style={styles.courseName}>{courseName}</Text>
                <Text style={styles.completionText}>
                  with excellence and dedication
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.detailItemLeft}>
                  <Text style={styles.detailLabel}>Completion Date</Text>
                  <Text style={styles.detailValue}>{completionDate}</Text>
                </View>
                <View style={styles.detailItemRight}>
                  <Text style={styles.detailLabel}>Certificate ID</Text>
                  <Text style={styles.detailValue}>{certificateId}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Training Director</Text>
            <Text style={styles.signatureName}>VX Training Director</Text>
          </View>
          <View style={styles.signatureItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Chief Executive Officer</Text>
            <Text style={styles.signatureName}>VX Chief Executive Officer</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// User interface to match the auth context
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: "admin" | "sub_admin" | "user";
  organization?: string;
  subOrganization?: string;
  asset?: string;
  subAsset?: string;
}

interface CertificateDialogProps {
  courseName?: string;
  completionDate?: string;
  certificateId?: string;
  triggerText?: string;
  triggerClassName?: string;
}

const CertificateDialog: React.FC<CertificateDialogProps> = ({
  courseName = "Advanced Safety Training Program",
  completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  certificateId = `VX-${Date.now()}`,
  triggerText = "View Certificate",
  triggerClassName = "px-8 py-2 bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-black",
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Get user data from localStorage
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log("User data from localStorage:", userData);
          setUser(userData);
        } else {
          console.log("No user data found in localStorage");
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(null);
      }
    };

    getUserFromStorage();
  }, []);

  // PDF generation using @react-pdf/renderer
  const handleDownloadPDF = async () => {
    if (!user) return;

    setIsDownloading(true);

    try {
      // Dynamically import @react-pdf/renderer to avoid HMR issues
      const { pdf } = await import("@react-pdf/renderer");

      // Create the PDF document
      const doc = (
        <CertificatePDF
          user={user}
          courseName={courseName}
          completionDate={completionDate}
          certificateId={certificateId}
        />
      );

      // Generate PDF blob
      const blob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VX-Academy-Certificate-${user.firstName}-${user.lastName}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download certificate as image using @react-pdf/renderer
  const handleDownloadImage = async () => {
    if (!user) return;

    setIsDownloadingImage(true);

    try {
      // Dynamically import @react-pdf/renderer to avoid HMR issues
      const { pdf } = await import("@react-pdf/renderer");

      // Create the PDF document
      const doc = (
        <CertificatePDF
          user={user}
          courseName={courseName}
          completionDate={completionDate}
          certificateId={certificateId}
        />
      );

      // Generate PDF blob
      const blob = await pdf(doc).toBlob();

      // Create download link for PDF (since @react-pdf/renderer generates PDFs)
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VX-Academy-Certificate-${user.firstName}-${user.lastName}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-[#003451]">
              Certificate of Completion
            </DialogTitle>
          </DialogHeader>

          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            ref={certificateRef}
          >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-[#003451] to-[#004d6b] text-white p-8 text-center">
              <div className="flex justify-center items-center mb-6">
                <img
                  src={"/vx-academy-logo.svg"}
                  alt="VX Academy Logo"
                  className="h-16 w-auto filter brightness-0 invert"
                />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                CERTIFICATE OF COMPLETION
              </h1>
            </div>

            {/* Certificate Body */}
            <div className="p-12 text-center">
              {/* Decorative Border */}
              <div className="border-4 border-[#00d8cc] rounded-lg p-8 mb-8">
                <div className="border-2 border-[#003451] rounded-lg p-6">
                  {/* Main Content */}
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600">
                      This is to certify that
                    </p>

                    <div className="py-4">
                      <h2 className="text-3xl font-bold text-[#003451] mb-2">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {user?.organization &&
                          `Organization: ${user?.organization}`}
                      </p>
                      {user?.subOrganization && (
                        <p className="text-lg text-gray-600">
                          Department: {user?.subOrganization}
                        </p>
                      )}
                    </div>

                    <p className="text-lg text-gray-600">
                      has successfully completed the
                    </p>

                    <div className="py-4">
                      <h3 className="text-2xl font-semibold text-[#003451] mb-2">
                        {courseName}
                      </h3>
                      <p className="text-lg text-gray-600">
                        with excellence and dedication
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          Completion Date
                        </p>
                        <p className="font-semibold text-[#003451]">
                          {completionDate}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          Certificate ID
                        </p>
                        <p className="font-semibold text-[#003451]">
                          {certificateId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="flex justify-between items-end mt-8">
                <div className="text-center">
                  <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm text-gray-600">Training Director</p>
                  <p className="font-semibold text-[#003451]">
                    VX Training Director
                  </p>
                </div>

                <div className="text-center">
                  <div className="border-b-2 border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm text-gray-600">
                    Chief Executive Officer
                  </p>
                  <p className="font-semibold text-[#003451]">
                    VX Chief Executive Officer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || isDownloadingImage}
              className="bg-[#003451] text-white px-6 py-2 hover:bg-[#004d6b] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button
              onClick={handleDownloadImage}
              disabled={isDownloading || isDownloadingImage}
              className="bg-[#00d8cc] text-black px-6 py-2 hover:bg-[#00d8cc]/80 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloadingImage ? "Generating PDF..." : "Download PDF (Alt)"}
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-6 py-2 hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Print Certificate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateDialog;
