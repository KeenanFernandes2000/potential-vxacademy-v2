import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CertificateFormFillerProps {
  userName: string;
  className?: string;
}

export default function CertificateFormFiller({
  userName,
  className = "",
}: CertificateFormFillerProps) {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);

  const getTemplateUrl = async (): Promise<string> => {
    if (templateUrl) {
      return templateUrl;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Get the PDF template URL from media API
    const mediaResponse = await fetch(
      `${baseUrl}/api/media/type/application%2Fpdf`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const generateCertificate = async () => {
    setLoading(true);

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
      nameField.setText(userName);

      // Optionally lock the field so it becomes non-editable
      nameField.enableReadOnly();

      // Save
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${userName.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    setPreviewLoading(true);

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
      nameField.setText(userName);

      // Optionally lock the field so it becomes non-editable
      nameField.enableReadOnly();

      // Save
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      alert("Failed to generate preview. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setIsPreviewOpen(false);
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex gap-3">
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={generatePreview}
              disabled={previewLoading}
              variant="outline"
              className="px-6 py-2 border-[#00d8cc] text-[#00d8cc] hover:bg-[#00d8cc] hover:text-black rounded-full disabled:opacity-50"
            >
              {previewLoading ? "Loading..." : "Preview"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto p-4">
            <DialogHeader className="pb-4">
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <div className="w-full h-[85vh] flex justify-center items-center">
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=150`}
                  className="w-full h-full border-0"
                  title="Certificate Preview"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Button
          onClick={generateCertificate}
          disabled={loading}
          className="px-8 py-2 bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-black rounded-full disabled:opacity-50"
        >
          {loading ? "Generating..." : "Download Certificate"}
        </Button>
      </div>
    </div>
  );
}
