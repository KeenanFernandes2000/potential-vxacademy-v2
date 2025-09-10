import React, { useState, useRef, useCallback, useEffect } from "react";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CloudUpload,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  X,
  Plus,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileType,
  Copy,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
  uploadedBy: number;
  createdAt: string;
}

// API object for media operations
const api = {
  async getAllMediaFiles(token: string, limit?: number, offset?: number) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await fetch(
        `${baseUrl}/api/media?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch media files:", error);
      throw error;
    }
  },

  async uploadMediaFile(file: File, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
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

  async uploadMultipleMediaFiles(files: FileList, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${baseUrl}/api/media/upload-multiple`, {
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
      console.error("Failed to upload media files:", error);
      throw error;
    }
  },

  async deleteMediaFile(id: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/media/${id}`, {
        method: "DELETE",
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
      console.error("Failed to delete media file:", error);
      throw error;
    }
  },

  async downloadMediaFile(id: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/media/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get media file:", error);
      throw error;
    }
  },
};

const MediaPage: React.FC = () => {
  const { user, token } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media files from API
  const fetchMediaFiles = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getAllMediaFiles(token);

      if (response.success && response.data) {
        setMediaFiles(response.data);
      } else {
        setError(response.message || "Failed to fetch media files");
      }
    } catch (error: any) {
      console.error("Error fetching media files:", error);
      setError("Failed to fetch media files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load media files on component mount
  useEffect(() => {
    fetchMediaFiles();
  }, [token]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <FileImage className="w-4 h-4" />;
    if (mimeType.startsWith("video/")) return <FileVideo className="w-4 h-4" />;
    if (mimeType.startsWith("audio/")) return <FileAudio className="w-4 h-4" />;
    if (mimeType === "application/pdf") return <FileText className="w-4 h-4" />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FileText className="w-4 h-4" />;
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return <FileSpreadsheet className="w-4 h-4" />;
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return <FileType className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileTypeColor = (mimeType: string): string => {
    if (mimeType.startsWith("image/"))
      return "bg-green-100 text-green-800 border-green-200";
    if (mimeType.startsWith("video/"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (mimeType.startsWith("audio/"))
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (mimeType === "application/pdf")
      return "bg-red-100 text-red-800 border-red-200";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "bg-green-100 text-green-800 border-green-200";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType.startsWith("video/")) return "Video";
    if (mimeType.startsWith("audio/")) return "Audio";
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "Document";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "Spreadsheet";
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
      return "Presentation";
    return "File";
  };

  const handleFileSelect = (fileId: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === mediaFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(mediaFiles.map((file) => file.id)));
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validate file sizes (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > maxSize
    );

    if (oversizedFiles.length > 0) {
      setError(
        `Files too large: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}. Maximum size is 50MB per file.`
      );
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Set uploading file names for display
    const fileNames = Array.from(files).map((file) => file.name);
    setUploadingFiles(fileNames);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev; // Don't go to 100% until upload is complete
          return prev + Math.random() * 10;
        });
      }, 200);

      let response;
      if (files.length === 1) {
        response = await api.uploadMediaFile(files[0], token);
      } else {
        response = await api.uploadMultipleMediaFiles(files, token);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Refresh the media files list
        await fetchMediaFiles();
        // Clear progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
          setUploadingFiles([]);
        }, 1000);
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadingFiles([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0 || !token) return;

    try {
      setError(null);
      const ids = Array.from(selectedFiles);
      let successful = 0;
      let failed = 0;

      // Delete each file individually
      for (const id of ids) {
        try {
          const response = await api.deleteMediaFile(id, token);
          if (response.success) {
            successful++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      // Refresh the media files list
      await fetchMediaFiles();
      setSelectedFiles(new Set());

      if (failed > 0) {
        setError(`Deleted ${successful} files, ${failed} failed`);
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      setError("Delete failed. Please try again.");
    }
  };

  const handleRefresh = async () => {
    await fetchMediaFiles();
  };

  const handleDownload = async (file: MediaFile) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Download failed. Please try again.");
    }
  };

  const handleCopyUrl = async (file: MediaFile) => {
    try {
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}${file.url}`;
      await navigator.clipboard.writeText(fullUrl);
      // You could add a toast notification here
      console.log("URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      setError("Failed to copy URL to clipboard");
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await api.deleteMediaFile(fileId, token);
      if (response.success) {
        // Remove the file from the local state
        setMediaFiles((prev) => prev.filter((file) => file.id !== fileId));
        // Remove from selected files if it was selected
        setSelectedFiles((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(fileId);
          return newSelected;
        });
      } else {
        setError(response.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("Delete failed:", error);
      setError("Delete failed. Please try again.");
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

  const openPreview = (file: MediaFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  return (
    <AdminPageLayout
      title="Media Library"
      description="Manage your images, videos, PDFs, and other media files"
    >
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-700 hover:text-black hover:bg-gray-100 rounded-full"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {selectedFiles.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 rounded-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedFiles.size})
              </Button>
            )}
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-black text-white hover:bg-gray-800 rounded-full"
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>

        {/* Upload Area */}
        <Card className="bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-none">
          <CardContent className="p-12 text-center">
            <div
              className={`space-y-4 ${dragActive ? "opacity-50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <CloudUpload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports images, PDFs, videos, and audio files up to 50MB
                </p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Uploading{" "}
                    {uploadingFiles.length > 1
                      ? `${uploadingFiles.length} files`
                      : uploadingFiles[0]}
                    ...
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#00d8cc] h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {uploadProgress.toFixed(1)}% complete
                  </div>
                </div>
              )}

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#00d8cc] text-white hover:bg-[#00c4b8] px-6 py-3 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose Files"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* File Selection */}
        {mediaFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-200 hover:text-white"
            >
              {selectedFiles.size === mediaFiles.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All ({mediaFiles.length} files)
            </button>
          </div>
        )}

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mediaFiles.map((file) => (
              <Card
                key={file.id}
                className={`bg-white border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedFiles.has(file.id) ? "ring-2 ring-[#00d8cc]" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="relative">
                    {/* Selection checkbox */}
                    <button
                      onClick={() => handleFileSelect(file.id)}
                      className="absolute top-2 left-2 z-10 bg-white rounded p-1 shadow-sm"
                    >
                      {selectedFiles.has(file.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#00d8cc]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* File type badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(
                          file.mimeType
                        )}`}
                      >
                        {getFileIcon(file.mimeType)}
                        {getFileTypeLabel(file.mimeType)}
                      </span>
                    </div>

                    {/* File preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer relative group">
                      {file.mimeType.startsWith("image/") ? (
                        <>
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}${
                              file.url
                            }`}
                            alt={file.originalName}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling!.classList.remove("hidden");
                            }}
                          />
                          <div className="hidden text-gray-400">
                            {getFileIcon(file.mimeType)}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                          <div className="w-12 h-12 mb-2 flex items-center justify-center">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <span className="text-xs text-center font-medium">
                            {getFileTypeLabel(file.mimeType)}
                          </span>
                        </div>
                      )}

                      {/* Hover overlay with action buttons */}
                      <div className="absolute inset-0 bg-black/60 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden group-hover:flex">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(file);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(file);
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy URL
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.id);
                            }}
                            className="bg-red-500/80 hover:bg-red-600/80 text-white border-red-400/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* File info */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {file.originalName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-white">
            {previewFile && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(previewFile.mimeType)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {previewFile.originalName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(
                            previewFile.mimeType
                          )}`}
                        >
                          {getFileIcon(previewFile.mimeType)}
                          {getFileTypeLabel(previewFile.mimeType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(previewFile.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Preview
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                      {previewFile.mimeType.startsWith("image/") ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${
                            previewFile.url
                          }`}
                          alt={previewFile.originalName}
                          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                            {getFileIcon(previewFile.mimeType)}
                          </div>
                          <p className="text-gray-600 font-medium">
                            {getFileTypeLabel(previewFile.mimeType)} Preview
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Preview not available for this file type
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      File Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">
                          File Name
                        </span>
                        <span className="text-gray-900 text-sm">
                          {previewFile.originalName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">
                          File Type
                        </span>
                        <span className="text-gray-900 text-sm">
                          {previewFile.mimeType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">
                          File Size
                        </span>
                        <span className="text-gray-900 text-sm">
                          {formatFileSize(previewFile.fileSize)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">
                          Upload Date
                        </span>
                        <span className="text-gray-900 text-sm">
                          {formatDate(previewFile.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-700">
                          File ID
                        </span>
                        <span className="text-gray-900 text-sm">
                          #{previewFile.id}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleDownload(previewFile)}
                        className="flex-1 bg-[#00d8cc] hover:bg-[#00c4b8] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsPreviewOpen(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageLayout>
  );
};

export default MediaPage;
