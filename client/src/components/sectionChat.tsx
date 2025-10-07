import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send as SendIcon,
  Plus as PlusIcon,
  User as UserIcon,
  Bot as BotIcon,
  Upload as UploadIcon,
  Camera as CameraIcon,
  X as CloseIcon,
  Copy as CopyIcon,
  RotateCcw as RegenerateIcon,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: "user" | "assistant";
}

interface SectionChatProps {
  className?: string;
}

const SectionChat: React.FC<SectionChatProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey",
      timestamp: "10:52 AM",
      sender: "assistant",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  // Dummy bot responses
  const botResponses = [
    "That's an interesting question! Let me help you with that.",
    "I understand what you're asking. Here's what I think...",
    "Great point! Based on my knowledge, I would suggest...",
    "I'm here to help! Could you provide more details about that?",
    "That's a common concern. Let me explain how we can approach this...",
    "I appreciate you sharing that. Here's my perspective...",
    "Excellent question! This is something many people wonder about.",
    "I'd be happy to assist you with that. Let me break it down...",
  ];

  const getRandomBotResponse = () => {
    return botResponses[Math.floor(Math.random() * botResponses.length)];
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  const openFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreviewFile = (file: File) => {
    if (isImageFile(file)) {
      setPreviewFile(file);
    } else {
      openFile(file);
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log("Message copied to clipboard");
    });
  };

  const regenerateMessage = (messageId: string) => {
    // Remove the current message and generate a new one
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Generate a new bot response
    setTimeout(() => {
      const newBotMessage: Message = {
        id: Date.now().toString(),
        text: getRandomBotResponse(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "assistant",
      };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getRandomBotResponse(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sender: "assistant",
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
  };

  const handleFileUpload = (type: "computer" | "camera") => {
    if (type === "computer") {
      // Create a file input element
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt";
      fileInput.multiple = true;

      fileInput.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          setUploadedFiles((prev) => [...prev, ...files]);

          // Add a message about the uploaded files
          const fileMessage: Message = {
            id: Date.now().toString(),
            text: `Uploaded ${files.length} file(s): ${files
              .map((f) => `${f.name} (${Math.round(f.size / 1024)} KB)`)
              .join(", ")}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sender: "user",
          };
          setMessages((prev) => [...prev, fileMessage]);
        }
      };

      fileInput.click();
    } else if (type === "camera") {
      // Access camera for photo capture
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          // Create a video element to capture the photo
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          // Create a canvas to capture the photo
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          video.addEventListener("loadedmetadata", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the video frame to canvas
            context?.drawImage(video, 0, 0);

            // Convert canvas to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const file = new File([blob], `photo-${Date.now()}.jpg`, {
                    type: "image/jpeg",
                  });
                  setUploadedFiles((prev) => [...prev, file]);

                  // Add a message about the captured photo
                  const photoMessage: Message = {
                    id: Date.now().toString(),
                    text: `Captured photo: ${file.name} (${Math.round(
                      file.size / 1024
                    )} KB)`,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    sender: "user",
                  };
                  setMessages((prev) => [...prev, photoMessage]);
                }

                // Stop the camera stream
                stream.getTracks().forEach((track) => track.stop());
              },
              "image/jpeg",
              0.8
            );
          });
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
          alert("Unable to access camera. Please check your permissions.");
        });
    }

    setShowFilePopup(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-2 border-primary/20">
            <UserIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Prod</h3>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
      </div>

      {/* Chat Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 group ${
                message.sender === "user"
                  ? "flex-row-reverse space-x-reverse max-w-xs"
                  : "max-w-2xl"
              }`}
            >
              {/* Message Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {message.sender === "assistant" ? (
                  <BotIcon className="w-3 h-3" />
                ) : (
                  <UserIcon className="w-3 h-3" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-lg border ${
                  message.sender === "assistant"
                    ? "bg-muted text-muted-foreground border-border"
                    : "bg-primary text-primary-foreground border-primary/20"
                }`}
              >
                <p className="text-sm">
                  {message.text.includes("Uploaded") ||
                  message.text.includes("Captured") ? (
                    <span>
                      {message.text.split(": ")[0]}:{" "}
                      <span
                        className="underline cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => {
                          // Find the file by name from the message (remove size info)
                          const fileNameWithSize = message.text.split(": ")[1];
                          const fileName = fileNameWithSize.split(" (")[0];
                          const file = uploadedFiles.find(
                            (f) => f.name === fileName
                          );
                          if (file) {
                            handlePreviewFile(file);
                          }
                        }}
                      >
                        {message.text.split(": ")[1]}
                      </span>
                    </span>
                  ) : (
                    message.text
                  )}
                </p>
              </div>

              {/* Copy and Regenerate Icons for Assistant Messages */}
              {message.sender === "assistant" && (
                <div className="flex flex-col space-y-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-muted/50"
                    onClick={() => copyMessage(message.text)}
                    title="Copy message"
                  >
                    <CopyIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-muted/50"
                    onClick={() => regenerateMessage(message.id)}
                    title="Regenerate response"
                  >
                    <RegenerateIcon className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <p
              className={`text-xs text-muted-foreground mt-1 ${
                message.sender === "assistant" ? "ml-8" : "mr-8"
              }`}
            >
              {message.timestamp}
            </p>
          </div>
        ))}
      </div>

      {/* Message Input and Footer Section */}
      <div className="p-4 border-t border-border bg-card relative">
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowFilePopup(!showFilePopup)}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>

            {/* File Upload Popup */}
            {showFilePopup && (
              <div className="absolute bottom-12 left-0 bg-card border border-border rounded-lg shadow-lg p-4 w-64 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Add file</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowFilePopup(false)}
                  >
                    <CloseIcon className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload or take a photo.
                </p>

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-muted/50"
                    onClick={() => handleFileUpload("computer")}
                  >
                    <div className="flex items-center space-x-3">
                      <UploadIcon className="w-5 h-5 text-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          Upload from Computer
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Browse files on your device.
                        </p>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-muted/50"
                    onClick={() => handleFileUpload("camera")}
                  >
                    <div className="flex items-center space-x-3">
                      <CameraIcon className="w-5 h-5 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          Take Photo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Capture with camera.
                        </p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message AI Assistant..."
              className="pr-12 bg-input border-border"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="h-8 w-8 bg-primary hover:bg-primary/90"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {previewFile.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewFile(null)}
              >
                <CloseIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={URL.createObjectURL(previewFile)}
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
                onLoad={() =>
                  URL.revokeObjectURL(URL.createObjectURL(previewFile))
                }
              />
            </div>
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
              <Button variant="outline" onClick={() => setPreviewFile(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  openFile(previewFile);
                  setPreviewFile(null);
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionChat;
