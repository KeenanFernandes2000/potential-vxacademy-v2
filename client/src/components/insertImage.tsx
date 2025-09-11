import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, Link, Image as ImageIcon, Plus } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
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
        // Get the full URL for the uploaded image
        const fullImageUrl = `${import.meta.env.VITE_API_URL}${
          response.data.url
        }`;
        onImageInsert(fullImageUrl);
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

  const handleUrlInsert = () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onImageInsert(imageUrl);
      onClose?.();
    } catch {
      setError("Please enter a valid URL");
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2  h-9">
          <TabsTrigger
            value="upload"
            className="flex items-center gap-1 text-sm data-[state=active]:bg-[#00d8cc] data-[state=active]:text-gray-900"
          >
            <CloudUpload className="w-3 h-3" />
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="flex items-center gap-1 text-sm data-[state=active]:bg-[#00d8cc] data-[state=active]:text-gray-900"
          >
            <Link className="w-3 h-3" />
            URL
          </TabsTrigger>
        </TabsList>

        {/* Upload Image Tab */}
        <TabsContent value="upload" className="mt-3">
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors ${
              dragActive
                ? "border-gray-400 bg-gray-50"
                : "hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <div className="mx-auto w-8 h-8 bg-[#00d8cc] rounded-full flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">
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
                      className="bg-[#00d8cc] h-1 rounded-full transition-all duration-300 ease-out"
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
                className="bg-[#00d8cc] text-black hover:bg-[#00c4b8] px-2 py-1 rounded-full text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
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
        </TabsContent>

        {/* Image URL Tab */}
        <TabsContent value="url" className="mt-3">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-full"
            />
            <Button
              type="button"
              onClick={handleUrlInsert}
              className="w-full bg-[#00d8cc] text-black hover:bg-[#00c4b8] rounded-full py-1 text-xs"
            >
              Insert Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsertImage;
