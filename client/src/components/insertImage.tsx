import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Image as ImageIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface InsertImageProps {
  onImageInsert: (imageUrl: string) => void;
  onClose?: () => void;
  currentImageUrl?: string;
}

// API object for media operations (reused from mediaPage)
const api = {
  async uploadMediaFile(file: File, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${baseUrl}/api/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to upload media file:", error);
      throw error;
    }
  },
};

const InsertImage: React.FC<InsertImageProps> = ({
  onImageInsert,
  onClose,
  currentImageUrl = "",
}) => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validate file type (only images)
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("Please select only image files (JPG, PNG, GIF, SVG)");
      return;
    }

    // Validate file sizes (5MB limit as shown in the image)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = imageFiles.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError(
        `Files too large: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}. Maximum size is 5MB per file.`
      );
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev; // Don't go to 100% until upload is complete
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await api.uploadMediaFile(imageFiles[0], token);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        // Use the complete URL from the server response
        onImageInsert(response.data.url);
        onClose?.();
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className="w-full">
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={currentImageUrl}
                alt="Current image"
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-xs text-gray-600 truncate max-w-[200px]">
                {currentImageUrl}
              </span>
            </div>
            <Button
              type="button"
              onClick={() => onImageInsert("")}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Image Section */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors ${
          dragActive ? "border-gray-400 bg-gray-50" : "hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="mx-auto w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF, SVG up to 5MB
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Uploading...</div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-orange-500 h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {uploadProgress.toFixed(1)}% complete
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-1" />
            {isUploading ? "Uploading..." : "Select Image"}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default InsertImage;
