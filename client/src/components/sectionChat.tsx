"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import CourseCard from "@/components/CourseCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Mic,
  MicOff,
  Send,
  Plus,
  MessageSquare,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Sparkles,
  User,
  Bot,
  Trash2,
  X,
  Sun,
  Moon,
  Paperclip,
  Upload,
  Image,
  FileText,
  File,
  Cloud,
  HardDrive,
  Camera,
  Video,
  Music,
  Archive,
  Code,
} from "lucide-react";

interface ToolCall {
  name: string;
  args: any;
  id: string;
  type: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
  isVoice?: boolean;
  isStreaming?: boolean;
  attachments?: FileAttachment[];
  audioBlob?: Blob;
  audioUrl?: string;
  audioDuration?: number;
  toolCalls?: ToolCall[];
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  serverFilename?: string;
}

interface UploadOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface BotConfig {
  _id: string;
  system: string;
  name: string;
  greeting: string;
  audiotts: boolean;
  audiostt: boolean;
  rag: boolean;
  prePrompt?: string[];
  collectLead: boolean;
  active: boolean;
  botColor?: string;
  imageName?: string;
  description?: string;
}

interface SectionChatProps {
  className?: string;
  botId: string;
  pdfId?: string;
}

const SectionChat: React.FC<SectionChatProps> = ({
  className = "",
  botId,
  pdfId,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Get auth context for user ID and token
  const { user, token } = useAuth();
  const isMobile = useIsMobile();

  const apiUrl = "https://ai.potential.com";
  // console.log(apiUrl);
  const [sessionId] = useState(
    `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [recordingMode, setRecordingMode] = useState<
    "normal" | "recording" | "playback"
  >("normal");
  const [recordingTime, setRecordingTime] = useState(0);
  const [finalRecordingTime, setFinalRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null
  );
  const [recordingAudioLevels, setRecordingAudioLevels] = useState<number[]>(
    new Array(50).fill(0)
  );
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioDuration, setRecordedAudioDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [playbackWaveformBars, setPlaybackWaveformBars] = useState<number[]>(
    new Array(50).fill(2)
  );
  const [chatAudioStates, setChatAudioStates] = useState<{
    [messageId: string]: {
      isPlaying: boolean;
      currentTime: number;
      progress: number;
    };
  }>({});
  const [chatWaveformBars, setChatWaveformBars] = useState<{
    [messageId: string]: number[];
  }>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const isPdfUploadingRef = useRef(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(20).fill(0)
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Lead collection modal state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error" as "success" | "error" | "warning",
  });

  // Translations - English only
  const t = {
    helloBeforeContinue:
      "Hello! Before we continue, please provide your details",
    name: "Name",
    enterName: "Enter your name",
    nameRequired: "Name is required",
    email: "Email",
    enterEmail: "Enter your email",
    emailRequired: "Email is required",
    invalidEmail: "Invalid email address",
    getStarted: "Get Started",
    welcomeMessage: "Welcome! How can I assist you today?",
  };

  // Toast helper function
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" = "error") => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
    },
    []
  );

  // Helper function to get valid ice breaker questions
  const getIceBreakerQuestions = useCallback(() => {
    if (!botConfig?.prePrompt || !Array.isArray(botConfig.prePrompt)) {
      return [];
    }

    return botConfig.prePrompt
      .filter((question) => question && question.trim() !== "")
      .map((question) => question.trim());
  }, [botConfig?.prePrompt]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const recordingAnalyserRef = useRef<AnalyserNode | null>(null);
  const recordingAnimationFrameRef = useRef<number | null>(null);
  const recordingMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingAudioChunksRef = useRef<Blob[]>([]);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatAudioRefs = useRef<{ [messageId: string]: HTMLAudioElement }>({});
  const recordedAudioBlobRef = useRef<Blob | null>(null);

  // Utility functions
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const copyMessage = useCallback((text: string, messageId: string) => {
    navigator.clipboard.writeText(text.replace(/[#*`]/g, ""));
    setCopiedMessageId(messageId);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  }, []);

  // Fetch bot configuration
  useEffect(() => {
    const fetchBotConfig = async () => {
      try {
        setIsLoadingConfig(true);
        // Use API server proxy instead of calling AI backend directly
        const response = await fetch(`${apiUrl}/api/ai/bot/${botId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch bot configuration");
        }
        const config: BotConfig = await response.json();
        setBotConfig(config);

        // Set initial greeting message
        setMessages([
          {
            id: "1",
            text: config.greeting,
            timestamp: new Date(),
            isUser: false,
          },
        ]);

        // Show lead collection modal if enabled
        if (config.collectLead) {
          setShowLeadModal(true);
        }
      } catch (error) {
        console.error("Error fetching bot config:", error);
        // Use fallback configuration
        setBotConfig({
          _id: botId,
          system: "You are a helpful AI assistant.",
          name: "AI Assistant",
          greeting: "Hello! How can I help you today?",
          audiotts: false,
          audiostt: false,
          rag: false,
          collectLead: false,
          active: true,
        });
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchBotConfig();
  }, [botId, apiUrl, token]);

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  const sendMessage = useCallback(
    async (messageText: string, isVoice = false) => {
      if ((!messageText.trim() && attachments.length === 0) || !botConfig)
        return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        timestamp: new Date(),
        isUser: true,
        isVoice,
        attachments: attachments.length > 0 ? [...attachments] : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
      const currentAttachments = [...attachments];
      setAttachments([]);
      setIsTyping(true);

      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        timestamp: new Date(),
        isUser: false,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMessage]);

      try {
        // Prepare request body for API server proxy with SSE format
        const requestBody = {
          message: messageText,
          sessionId: sessionId,
          systemPrompt: botConfig.system,
          botName: botConfig.name,
        };

        // Call API server SSE endpoint (which will handle training context automatically)
        const response = await fetch(
          `${apiUrl}/api/ai/chatbot/${botConfig._id}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }

        // Handle SSE streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body reader available");
        }

        let fullResponse = "";
        let toolCalls: ToolCall[] = [];
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsTyping(false);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      isStreaming: false,
                      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                    }
                  : msg
              )
            );
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process SSE format: data: {json}\n\n
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const outerData = JSON.parse(line.slice(6));

                // Handle nested data: content field
                if (outerData.content) {
                  // The content might have nested SSE data
                  const contentStr = outerData.content;

                  // Check if it's a nested SSE message
                  if (contentStr.startsWith("data: ")) {
                    const nestedLines = contentStr
                      .split("\n")
                      .filter((l: string) => l.trim());

                    for (const nestedLine of nestedLines) {
                      if (nestedLine.startsWith("data: ")) {
                        try {
                          const nestedData = JSON.parse(nestedLine.slice(6));

                          // Handle tool calls
                          if (nestedData.toolCall) {
                            // Don't add to toolCalls yet, wait for final success message
                          }

                          // Handle tool responses
                          if (nestedData.toolResponse) {
                            // Tool response received
                          }

                          // Handle content
                          if (nestedData.content) {
                            fullResponse = nestedData.content;

                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === botMessageId
                                  ? { ...msg, text: fullResponse }
                                  : msg
                              )
                            );
                          }

                          // Handle final success with tool calls
                          if (nestedData.success && nestedData.response) {
                            fullResponse = nestedData.response;
                            if (
                              nestedData.toolCalls &&
                              Array.isArray(nestedData.toolCalls)
                            ) {
                              toolCalls = nestedData.toolCalls;
                            }

                            setMessages((prev) =>
                              prev.map((msg) =>
                                msg.id === botMessageId
                                  ? {
                                      ...msg,
                                      text: fullResponse,
                                      toolCalls:
                                        toolCalls.length > 0
                                          ? toolCalls
                                          : undefined,
                                    }
                                  : msg
                              )
                            );
                          }
                        } catch (nestedParseError) {
                          // Ignore nested parsing errors
                        }
                      }
                    }
                  } else {
                    // Simple content without nested SSE
                    fullResponse += contentStr;

                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === botMessageId
                          ? { ...msg, text: fullResponse }
                          : msg
                      )
                    );
                  }
                }

                if (outerData.error) {
                  throw new Error(outerData.error);
                }

                if (outerData.done) {
                  setIsTyping(false);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? {
                            ...msg,
                            isStreaming: false,
                            toolCalls:
                              toolCalls.length > 0 ? toolCalls : undefined,
                          }
                        : msg
                    )
                  );
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }

          // Small delay for smooth streaming effect
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setIsTyping(false);

        // Show error message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  text: "Sorry, an error occurred while processing your request. Please try again.",
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    },
    [attachments, botConfig, apiUrl, token]
  );

  const handleSendMessage = useCallback(() => {
    sendMessage(newMessage);
  }, [newMessage, sendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Show loading state while fetching configuration
  if (isLoadingConfig || !botConfig) {
    return (
      <div
        className={`flex h-full bg-gray-100 dark:bg-gray-900 items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#F77860" }}
          ></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading chatbot configuration...
          </p>
        </div>
      </div>
    );
  }

  // Show disabled state if bot is not active
  if (!botConfig.active) {
    return (
      <div
        className={`flex h-full bg-gray-100 dark:bg-gray-900 items-center justify-center ${className}`}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {botConfig.name} is Disabled
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            This bot is currently disabled and needs to be activated from the
            dashboard before it can be used.
          </p>

          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors font-medium"
              type="button"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                : toast.type === "warning"
                ? "bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
                : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            }`}
          >
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex h-full bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
          <header
            className="sticky top-0 z-30 rounded-t-lg"
            style={{ backgroundColor: "rgb(247, 120, 96)" }}
          >
            <div className="px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="flex items-center justify-between h-12 sm:h-16 md:h-14 lg:border-b border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center gap-1 sm:gap-3 md:gap-2">
                  {/* Show bot image if available, otherwise show bot icon */}
                  {botConfig?.imageName ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center">
                      <img
                        src="https://api.potential.com/static/mentors/Nouf-VXAIConcierge-1758872636661-3.png"
                        alt={botConfig.name}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-9 md:h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 text-white" />
                    </div>
                  )}

                  <div>
                    <h2 className="text-xs sm:text-lg md:text-sm font-semibold text-white">
                      {botConfig?.name || "AI Assistant"}
                    </h2>
                    <div className="flex items-center gap-2">
                      {!isTyping && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                      <p className="text-[10px] sm:text-xs md:text-[10px] text-white">
                        {isTyping ? "⚡ Thinking..." : "Online"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div
            className="flex-1 overflow-y-auto"
            style={{ backgroundColor: "#F5F0EB" }}
          >
            {messages.length > 0 ? (
              <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 w-full">
                <div className="space-y-2 sm:space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="w-full">
                      <div
                        className={`flex gap-2 sm:gap-3 ${
                          message.isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!message.isUser && (
                          <div
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ border: "1px solid #F77860" }}
                          >
                            <img
                              src="https://api.potential.com/static/mentors/Nouf-VXAIConcierge-1758872636661-3.png"
                              alt={botConfig?.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={`group max-w-[200px] min-[345px]:max-w-[240px] min-[400px]:max-w-[280px] min-[430px]:max-w-[320px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-xl ${
                            message.isUser ? "order-first" : ""
                          }`}
                        >
                          <div
                            className={`relative px-2 py-1.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm ${
                              message.isUser
                                ? "text-white"
                                : "bg-transparent text-gray-900 dark:text-gray-100"
                            }`}
                            style={
                              message.isUser
                                ? { backgroundColor: "#F77860" }
                                : { border: "2px solid #F77860" }
                            }
                          >
                            <div className="prose prose-xs sm:prose-sm max-w-none">
                              {message.isUser ? (
                                <p className="text-white m-0 leading-relaxed text-xs sm:text-sm">
                                  {message.text}
                                </p>
                              ) : (
                                <div className="text-gray-900 dark:text-gray-100 prose prose-xs sm:prose-sm max-w-none text-xs sm:text-sm">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    skipHtml={false}
                                    components={{
                                      // Style links
                                      a: ({ ...props }) => (
                                        <a
                                          {...props}
                                          className="text-blue-600 hover:text-blue-800 underline break-words"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        />
                                      ),
                                      // Style lists with proper spacing
                                      ul: ({ ...props }) => (
                                        <ul
                                          {...props}
                                          className="list-disc list-outside my-3 space-y-2 pl-6"
                                        />
                                      ),
                                      ol: ({ ...props }) => (
                                        <ol
                                          {...props}
                                          className="list-decimal list-outside my-3 space-y-2 pl-6"
                                        />
                                      ),
                                      li: ({ ...props }) => (
                                        <li
                                          {...props}
                                          className="leading-relaxed mb-2"
                                        />
                                      ),
                                      // Style headings with proper spacing
                                      h1: ({ ...props }) => (
                                        <h1
                                          {...props}
                                          className="text-2xl font-bold mt-4 mb-3 first:mt-0"
                                        />
                                      ),
                                      h2: ({ ...props }) => (
                                        <h2
                                          {...props}
                                          className="text-xl font-bold mt-4 mb-3 first:mt-0"
                                        />
                                      ),
                                      h3: ({ ...props }) => (
                                        <h3
                                          {...props}
                                          className="text-lg font-bold mt-3 mb-2 first:mt-0"
                                        />
                                      ),
                                      // Style paragraphs with proper spacing and line breaks
                                      p: ({ ...props }) => (
                                        <p
                                          {...props}
                                          className="mb-4 leading-relaxed first:mt-0 last:mb-0"
                                        />
                                      ),
                                      // Style code blocks
                                      code: ({ inline, ...props }: any) =>
                                        inline ? (
                                          <code
                                            {...props}
                                            className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                                          />
                                        ) : (
                                          <code
                                            {...props}
                                            className="block bg-gray-100 dark:bg-gray-800 p-3 rounded my-3 text-sm font-mono overflow-x-auto"
                                          />
                                        ),
                                      // Style blockquotes
                                      blockquote: ({ ...props }) => (
                                        <blockquote
                                          {...props}
                                          className="border-l-4 border-gray-300 pl-4 italic my-3"
                                        />
                                      ),
                                      // Style line breaks - force visible breaks
                                      br: () => <br className="block h-4" />,
                                      // Style strong/bold
                                      strong: ({ ...props }) => (
                                        <strong
                                          {...props}
                                          className="font-bold"
                                        />
                                      ),
                                      // Style emphasis/italic
                                      em: ({ ...props }) => (
                                        <em {...props} className="italic" />
                                      ),
                                      // Style horizontal rules
                                      hr: () => (
                                        <hr className="my-4 border-gray-300" />
                                      ),
                                      // Remove images from rendering since we handle them in tool calls
                                      img: () => null,
                                    }}
                                  >
                                    {/* Preprocess text for better formatting */}
                                    {message.text
                                      // Add line breaks before numbered items
                                      .replace(/(\d+)\.\s+/g, "\n\n$1. ")
                                      // Add line breaks after sentences that end with periods followed by capital letters
                                      .replace(/\.\s+([A-Z])/g, ".\n\n$1")
                                      // Ensure proper spacing after colons followed by capital letters
                                      .replace(/:\s+([A-Z])/g, ":\n\n$1")
                                      .trim()}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>

                            {message.isStreaming && (
                              <div className="flex items-center mt-3">
                                <div className="flex space-x-1">
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                                    style={{ backgroundColor: "#F77860" }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                                    style={{
                                      backgroundColor: "#F77860",
                                      animationDelay: "0.1s",
                                    }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                                    style={{
                                      backgroundColor: "#F77860",
                                      animationDelay: "0.2s",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {!message.isStreaming && !message.isUser && (
                              <div className="absolute left-full bottom-0 ml-2 opacity-100 sm:opacity-0 md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() =>
                                      copyMessage(message.text, message.id)
                                    }
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors"
                                    title="Copy"
                                  >
                                    {copiedMessageId === message.id ? (
                                      <Check className="w-3 h-3 text-gray-800 dark:text-gray-200" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className={`mt-1 text-[10px] sm:text-xs ${
                              message.isUser
                                ? "text-right text-gray-500 dark:text-gray-400"
                                : "text-left text-black"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>

                        {message.isUser && (
                          <div
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: "#F5D5D0",
                              border: "1px solid #F77860",
                            }}
                          >
                            <User
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              style={{ color: "#F77860" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Render course cards outside the message border */}
                      {!message.isUser &&
                        message.toolCalls &&
                        message.toolCalls.length > 0 && (
                          <div className="w-full mt-4 px-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {message.toolCalls
                                .filter(
                                  (tc: ToolCall) =>
                                    tc.name === "display_course_card"
                                )
                                .map((toolCall: ToolCall, idx: number) => {
                                  const args = toolCall.args;
                                  // Parse duration to match CourseCard format
                                  const duration = args.duration || "";
                                  const courseId = args.link
                                    ? parseInt(
                                        args.link.split("/").pop() || "0"
                                      )
                                    : undefined;

                                  return (
                                    <div
                                      key={toolCall.id || idx}
                                      className="w-full flex justify-center"
                                    >
                                      <CourseCard
                                        title={args.name || "Untitled Course"}
                                        description={
                                          args.description || "No description"
                                        }
                                        duration={duration}
                                        difficulty="beginner"
                                        progress={args.percentage || 0}
                                        image={
                                          args.image &&
                                          args.image !== "No image"
                                            ? args.image
                                            : undefined
                                        }
                                        courseId={courseId}
                                        isMobile={isMobile}
                                        onStart={() => {
                                          // Open in new tab when in chat
                                          if (courseId) {
                                            window.open(
                                              `/user/courses/${courseId}`,
                                              "_blank"
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center h-full px-2 sm:px-4 md:px-6 lg:px-8">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-4">
                    Welcome to AI Assistant
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                    Start a conversation to begin exploring what AI can do for
                    you.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ice Breaker Questions Bubbles */}
          {messages.length === 1 && getIceBreakerQuestions().length > 0 && (
            <div className="" style={{ backgroundColor: "#F5F0EB" }}>
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-w-4xl mx-auto">
                {getIceBreakerQuestions().map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setNewMessage(question);
                      setTimeout(() => {
                        sendMessage(question);
                      }, 100);
                    }}
                    className="px-2 py-1 sm:px-4 sm:py-2 md:px-3 md:py-1.5 text-xs sm:text-sm md:text-xs font-medium rounded-md sm:rounded-lg md:rounded-md hover:scale-105 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(246, 238, 229) 0%, rgb(237, 220, 203) 100%)",
                      color: "#F77860",
                      border: "1px solid #F77860",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F77860";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, rgb(245, 240, 235) 0%, rgb(235, 225, 215) 100%)";
                      e.currentTarget.style.color = "#F77860";
                    }}
                    type="button"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className="shadow-sm rounded-b-lg"
            style={{ backgroundColor: "#F5F0EB" }}
          >
            <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
              <div className="w-full max-w-full min-w-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message AI Assistant..."
                    rows={1}
                    className="flex-1 px-4 py-2 border-0 rounded-2xl focus:ring-0 focus:outline-none bg-white text-gray-900 resize-none max-h-48 transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                    style={{
                      minHeight: "36px",
                      boxShadow:
                        "0 0 0 1px rgba(247, 120, 96, 0.2), 0 0 8px rgba(247, 120, 96, 0.1)",
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(247, 120, 96, 0.4), 0 0 20px rgba(247, 120, 96, 0.3), 0 0 40px rgba(247, 120, 96, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(247, 120, 96, 0.2), 0 0 8px rgba(247, 120, 96, 0.1)";
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLTextAreaElement).style.boxShadow =
                          "0 0 0 1px rgba(247, 120, 96, 0.3), 0 0 12px rgba(247, 120, 96, 0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLTextAreaElement).style.boxShadow =
                          "0 0 0 1px rgba(247, 120, 96, 0.2), 0 0 8px rgba(247, 120, 96, 0.1)";
                      }
                    }}
                  />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    disabled={!newMessage.trim()}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white rounded-full transition-colors disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: "#F77860" }}
                    title="Send message"
                    type="button"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-2 sm:px-4 md:px-6 lg:px-8 pb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
                AI can make mistakes. Verify important information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionChat;
