import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Download, Calendar, Award, User } from "lucide-react";

interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface CertificatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: Certificate[];
  userName: string;
}

const CertificatePopup: React.FC<CertificatePopupProps> = ({
  isOpen,
  onClose,
  certificates,
  userName,
}) => {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownload = async (certificate: Certificate) => {
    setDownloading(certificate.id);

    try {
      // Create a simple certificate PDF content
      const certificateContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${certificate.certificateNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .certificate {
              background: white;
              color: #333;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              font-size: 2.5em;
              font-weight: bold;
              color: #2C2C2C;
              margin-bottom: 20px;
            }
            .subtitle {
              font-size: 1.2em;
              color: #666;
              margin-bottom: 40px;
            }
            .name {
              font-size: 2em;
              font-weight: bold;
              color: #B85A1A;
              margin: 30px 0;
            }
            .details {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              font-size: 0.9em;
              color: #666;
            }
            .certificate-number {
              font-weight: bold;
              color: #2C2C2C;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">Certificate of Completion</div>
            <div class="subtitle">This is to certify that</div>
            <div class="name">${userName}</div>
            <div class="subtitle">has successfully completed the training program</div>
            <div class="details">
              <div>
                <div>Certificate Number: <span class="certificate-number">${
                  certificate.certificateNumber
                }</span></div>
                <div>Issue Date: ${new Date(
                  certificate.issueDate
                ).toLocaleDateString()}</div>
                <div>Expiry Date: ${new Date(
                  certificate.expiryDate
                ).toLocaleDateString()}</div>
              </div>
              <div>
                <div>Status: <span class="certificate-number">${certificate.status.toUpperCase()}</span></div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([certificateContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${certificate.certificateNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download certificate:", error);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "revoked":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
            <Award className="h-6 w-6 text-[#B85A1A]" />
            Your Certificates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {certificates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Certificates Found
                </h3>
                <p className="text-gray-500">
                  You don't have any certificates for this training area yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            certificates.map((certificate) => (
              <Card key={certificate.id} className="border-[#E5E5E5]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
                        Certificate #{certificate.certificateNumber}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{userName}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(certificate.status)}>
                      {certificate.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#B85A1A]" />
                      <div>
                        <div className="font-medium">Issue Date</div>
                        <div className="text-gray-600">
                          {formatDate(certificate.issueDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#B85A1A]" />
                      <div>
                        <div className="font-medium">Expiry Date</div>
                        <div className="text-gray-600">
                          {formatDate(certificate.expiryDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleDownload(certificate)}
                      disabled={downloading === certificate.id}
                      className="bg-[#B85A1A] hover:bg-[#A04A15] text-white"
                    >
                      {downloading === certificate.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#E5E5E5] text-[#2C2C2C] hover:bg-gray-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificatePopup;
