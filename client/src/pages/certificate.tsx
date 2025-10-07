import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import certificateService from "@/services/certificateService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PDFDocument } from "pdf-lib";

interface CertificateData {
  id: number;
  userId: number;
  courseId: number;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  trainingAreaId: number;
  trainingAreaName: string;
  trainingAreaDescription: string;
  trainingAreaImageUrl: string;
}

const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id || !token) return;

      try {
        setLoading(true);
        const response = await certificateService.getCertificateById(
          parseInt(id),
          token
        );

        if (response.success) {
          setCertificate(response.data);
        } else {
          setError("Failed to fetch certificate");
        }
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError("Failed to fetch certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id, token]);

  const getTemplateUrl = async (): Promise<string> => {
    if (templateUrl) {
      return templateUrl;
    }

    const baseUrl = import.meta.env.VITE_API_URL;

    // Get the PDF template URL from media API
    const mediaResponse = await fetch(
      `${baseUrl}/api/media/type/application%2Fpdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch media files: ${mediaResponse.status}`);
    }

    const mediaData = await mediaResponse.json();

    // Find the specific certificate template
    const certificateTemplate = mediaData.data.find(
      (file: any) =>
        file.originalName === "01 DCT_AlMidhyaf_Completion Certificate.pdf"
    );

    if (!certificateTemplate) {
      throw new Error("Certificate template not found");
    }

    setTemplateUrl(certificateTemplate.url);
    return certificateTemplate.url;
  };

  const generatePdfPreview = async () => {
    if (!certificate || !token) return;

    setPdfLoading(true);
    try {
      // Get the template URL (cached after first call)
      const templateUrl = await getTemplateUrl();
      const response = await fetch(templateUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF template: ${response.status}`);
      }

      const templateBytes = await response.arrayBuffer();

      // Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Get form from PDF
      const form = pdfDoc.getForm();

      // Get the specific text field (from your PDF)
      const nameField = form.getTextField("fill_2");

      // Set user name
      nameField.setText(
        `${certificate.userFirstName} ${certificate.userLastName}`
      );

      // Optionally lock the field so it becomes non-editable
      nameField.enableReadOnly();

      // Save
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setPdfPreviewUrl(url);
    } catch (error) {
      console.error("Failed to generate PDF preview:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (certificate && token) {
      generatePdfPreview();
    }
  }, [certificate, token]);

  const handleDownload = () => {
    if (pdfPreviewUrl) {
      const a = document.createElement("a");
      a.href = pdfPreviewUrl;
      a.download = `certificate-${certificate?.userFirstName}-${certificate?.userLastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Certificate Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || "The requested certificate could not be found."}
              </p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="h-[calc(100vh-80px)]">
        {pdfLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating certificate...</p>
            </div>
          </div>
        ) : pdfPreviewUrl ? (
          <iframe
            src={pdfPreviewUrl}
            className="w-full h-full border-0"
            title="Certificate Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600">
                Failed to load certificate preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
