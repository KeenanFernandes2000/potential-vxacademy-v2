import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MenuBook as BookOpen,
  CheckCircle,
  PlayCircle,
  HelpOutline,
  Description,
  School,
  Article as Summary,
  VideoLibrary,
  Image,
  TextFields,
  Lock,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";

interface LearningBlock {
  id: number;
  type: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  xpPoints: number;
  status: string;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  placement: string;
  xpPoints: number;
  status: string;
  questions: number;
  passingScore: number;
  maxRetakes: number;
  attemptsUsed: number;
  order?: number;
}

interface AssessmentAttempt {
  id: number;
  userId: number;
  assessmentId: number;
  score: number;
  passed: boolean;
  answers: AssessmentAnswer[];
  startedAt: string;
  completedAt: string;
}

interface AssessmentAnswer {
  questionId: number;
  selectedOptionIndex: number;
  selectedOptionText: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface AssessmentQuestion {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

interface Unit {
  id: number;
  name: string;
  description: string;
  order: number;
  duration: number;
  xpPoints: number;
  learningBlocks: LearningBlock[];
  assessments: Assessment[];
}

interface CourseContentLayoutProps {
  units: Unit[];
  onCompleteLearningBlock?: (learningBlockId: number) => Promise<void>;
}

const CourseContentLayout: React.FC<CourseContentLayoutProps> = ({
  units,
  onCompleteLearningBlock,
}) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // State for selected content
  const [selectedContent, setSelectedContent] = useState<{
    type: "learningBlock" | "assessment";
    id: number;
    title: string;
    content: string;
    assessment?: Assessment;
  } | null>(null);

  // State for assessment results
  const [assessmentAttempts, setAssessmentAttempts] = useState<
    AssessmentAttempt[]
  >([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<
    AssessmentQuestion[]
  >([]);
  const [isLoadingAssessmentResults, setIsLoadingAssessmentResults] =
    useState(false);

  // API functions for assessment data
  const api = {
    async getAssessmentAttempts(
      assessmentId: number,
      userId: number,
      token: string
    ) {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(
          `${baseUrl}/api/assessments/users/${userId}/assessments/${assessmentId}/attempts`,
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
        console.error("Failed to fetch assessment attempts:", error);
        throw error;
      }
    },

    async getAssessmentQuestions(assessmentId: number, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(
          `${baseUrl}/api/assessments/assessments/${assessmentId}/questions`,
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
        console.error("Failed to fetch assessment questions:", error);
        throw error;
      }
    },
  };

  // Set initial selected content to first accessible learning block
  React.useEffect(() => {
    if (units.length > 0) {
      const allContent = getAllContentInOrder();
      const firstAccessibleContent = allContent.find((content) => {
        if (content.type === "learningBlock") {
          return isLearningBlockAccessible(content.item, content.unitOrder);
        } else if (content.type === "assessment") {
          return isAssessmentAccessible(content.item, content.unitOrder);
        }
        return false;
      });

      if (firstAccessibleContent) {
        setSelectedContent({
          type: firstAccessibleContent.type,
          id: firstAccessibleContent.item.id,
          title: firstAccessibleContent.item.title,
          content:
            firstAccessibleContent.item.content ||
            firstAccessibleContent.item.description,
          assessment:
            firstAccessibleContent.type === "assessment"
              ? firstAccessibleContent.item
              : undefined,
        });
      }
    }
  }, [units]);

  // Fetch assessment results when an assessment is selected
  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (
        selectedContent?.type === "assessment" &&
        selectedContent.assessment &&
        token &&
        user
      ) {
        setIsLoadingAssessmentResults(true);
        try {
          const [attemptsData, questionsData] = await Promise.all([
            api.getAssessmentAttempts(
              selectedContent.assessment.id,
              user.id,
              token
            ),
            api.getAssessmentQuestions(selectedContent.assessment.id, token),
          ]);

          console.log("Assessment attempts data:", attemptsData);
          console.log("Assessment questions data:", questionsData);
          console.log("First attempt passed:", attemptsData?.data?.[0]?.passed);
          console.log(
            "First attempt answers:",
            attemptsData?.data?.[0]?.answers
          );
          console.log("Answers type:", typeof attemptsData?.data?.[0]?.answers);
          console.log(
            "Is answers array:",
            Array.isArray(attemptsData?.data?.[0]?.answers)
          );

          setAssessmentAttempts(
            Array.isArray(attemptsData?.data) ? attemptsData.data : []
          );
          setAssessmentQuestions(
            Array.isArray(questionsData?.data) ? questionsData.data : []
          );
        } catch (error) {
          console.error("Failed to fetch assessment results:", error);
          setAssessmentAttempts([]);
          setAssessmentQuestions([]);
        } finally {
          setIsLoadingAssessmentResults(false);
        }
      } else {
        setAssessmentAttempts([]);
        setAssessmentQuestions([]);
      }
    };

    fetchAssessmentResults();
  }, [selectedContent, token, user]);

  const handleContentSelect = (
    type: "learningBlock" | "assessment",
    item: any
  ) => {
    setSelectedContent({
      type,
      id: item.id,
      title: item.title,
      content: item.content || item.description,
      assessment: type === "assessment" ? item : undefined,
    });
  };

  const handleStartAssessment = (assessmentId: number) => {
    navigate(`/user/assessment/${assessmentId}`);
  };

  const handleCompleteLearningBlock = async () => {
    if (selectedContent?.type === "learningBlock" && onCompleteLearningBlock) {
      try {
        await onCompleteLearningBlock(selectedContent.id);
        // Update the selected content status locally
        setSelectedContent((prev) =>
          prev ? { ...prev, status: "completed" } : null
        );
      } catch (error) {
        console.error("Failed to complete learning block:", error);
      }
    }
  };

  // Helper function to get the current learning block's completion status
  const getCurrentLearningBlockStatus = (): string => {
    if (selectedContent?.type === "learningBlock") {
      const learningBlock = units
        .flatMap((unit) => unit.learningBlocks)
        .find((block) => block.id === selectedContent.id);
      return learningBlock?.status || "not_started";
    }
    return "not_started";
  };

  // Helper function to check if the current learning block is completed
  const isCurrentLearningBlockCompleted = (): boolean => {
    return getCurrentLearningBlockStatus() === "completed";
  };

  // Helper function to get all content items (learning blocks and assessments) in order
  const getAllContentInOrder = (): Array<{
    type: "learningBlock" | "assessment";
    item: any;
    unitOrder: number;
    itemOrder: number;
  }> => {
    const allContent: Array<{
      type: "learningBlock" | "assessment";
      item: any;
      unitOrder: number;
      itemOrder: number;
    }> = [];

    units.forEach((unit) => {
      // Add learning blocks
      unit.learningBlocks.forEach((block) => {
        allContent.push({
          type: "learningBlock",
          item: block,
          unitOrder: unit.order,
          itemOrder: block.order,
        });
      });

      // Add assessments
      unit.assessments.forEach((assessment) => {
        allContent.push({
          type: "assessment",
          item: assessment,
          unitOrder: unit.order,
          itemOrder: assessment.order || 999, // Assessments without order go to end
        });
      });
    });

    // Sort by unit order first, then by item order
    return allContent.sort((a, b) => {
      if (a.unitOrder !== b.unitOrder) {
        return a.unitOrder - b.unitOrder;
      }
      return a.itemOrder - b.itemOrder;
    });
  };

  // Helper function to check if a learning block is accessible
  const isLearningBlockAccessible = (
    block: LearningBlock,
    unitOrder: number
  ): boolean => {
    const allContent = getAllContentInOrder();
    const currentIndex = allContent.findIndex(
      (content) =>
        content.type === "learningBlock" && content.item.id === block.id
    );

    // First item is always accessible
    if (currentIndex === 0) return true;

    // Check if previous item is completed
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevContent = allContent[i];

      if (prevContent.type === "learningBlock") {
        if (prevContent.item.status !== "completed") {
          return false;
        }
      } else if (prevContent.type === "assessment") {
        // For assessments, check if they have a passing attempt
        const hasPassingAttempt =
          prevContent.item.status === "passed" ||
          (prevContent.item.attemptsUsed > 0 &&
            prevContent.item.status === "completed");
        if (!hasPassingAttempt) {
          return false;
        }
      }
    }

    return true;
  };

  // Helper function to check if an assessment is accessible
  const isAssessmentAccessible = (
    assessment: Assessment,
    unitOrder: number
  ): boolean => {
    const allContent = getAllContentInOrder();
    const currentIndex = allContent.findIndex(
      (content) =>
        content.type === "assessment" && content.item.id === assessment.id
    );

    // First item is always accessible
    if (currentIndex === 0) return true;

    // Check if previous item is completed
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevContent = allContent[i];

      if (prevContent.type === "learningBlock") {
        if (prevContent.item.status !== "completed") {
          return false;
        }
      } else if (prevContent.type === "assessment") {
        // For assessments, check if they have a passing attempt
        const hasPassingAttempt =
          prevContent.item.status === "passed" ||
          (prevContent.item.attemptsUsed > 0 &&
            prevContent.item.status === "completed");
        if (!hasPassingAttempt) {
          return false;
        }
      }
    }

    return true;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "description":
        return <Description className="w-4 h-4" />;
      case "outcomes":
        return <School className="w-4 h-4" />;
      case "content":
        return <PlayCircle className="w-4 h-4" />;
      case "summary":
        return <Summary className="w-4 h-4" />;
      case "video":
        return <VideoLibrary className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      case "text":
        return <TextFields className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Function to parse Lexical editor JSON format and convert to HTML
  const parseLexicalContent = (content: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);

      if (parsed.root && parsed.root.children) {
        return parseLexicalNode(parsed.root);
      }
    } catch (error) {
      // If it's not JSON, return the content as is
      return content;
    }

    return content;
  };

  const parseLexicalNode = (node: any): string => {
    if (!node) return "";

    switch (node.type) {
      case "text":
        let text = node.text || "";

        // Apply formatting - handle multiple formats
        if (node.format) {
          // Bold (format 1)
          if (node.format & 1) text = `<strong>${text}</strong>`;
          // Italic (format 2)
          if (node.format & 2) text = `<em>${text}</em>`;
          // Strikethrough (format 4)
          if (node.format & 4) text = `<s>${text}</s>`;
          // Underline (format 8)
          if (node.format & 8) text = `<u>${text}</u>`;
          // Code (format 16)
          if (node.format & 16)
            text = `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">${text}</code>`;
          // Highlight (format 32)
          if (node.format & 32)
            text = `<mark class="bg-yellow-200">${text}</mark>`;
          // Subscript (format 64)
          if (node.format & 64) text = `<sub>${text}</sub>`;
          // Superscript (format 128)
          if (node.format & 128) text = `<sup>${text}</sup>`;
        }

        return text;

      case "paragraph":
        const paragraphContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";

        // If paragraph is empty (no children), render it as a line break
        if (!paragraphContent || paragraphContent.trim() === "") {
          return `<p class="mb-3"><br></p>`;
        }

        return `<p class="mb-3">${paragraphContent}</p>`;

      case "heading":
        const headingContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        const tag = node.tag || "h1";
        const headingClass =
          tag === "h1"
            ? "text-2xl font-bold mt-8 mb-4"
            : tag === "h2"
            ? "text-xl font-semibold mt-6 mb-3"
            : tag === "h3"
            ? "text-lg font-semibold mt-4 mb-2"
            : "text-base font-semibold mt-3 mb-2";
        return `<${tag} class="${headingClass}">${headingContent}</${tag}>`;

      case "list":
        const listContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        const listTag = node.listType === "number" ? "ol" : "ul";
        const listClass = "list-disc list-inside mb-4";
        return `<${listTag} class="${listClass}">${listContent}</${listTag}>`;

      case "listitem":
        const listItemContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        return `<li class="ml-4 mb-1">${listItemContent}</li>`;

      case "quote":
        const quoteContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${quoteContent}</blockquote>`;

      case "code":
        const codeContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        return `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">${codeContent}</code></pre>`;

      case "link":
        const linkContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        const url = node.url || "#";
        return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">${linkContent}</a>`;

      case "root":
        // Process children and handle consecutive empty paragraphs
        if (!node.children) return "";

        const processedChildren: string[] = [];
        let i = 0;

        while (i < node.children.length) {
          const child = node.children[i];

          if (child.type === "paragraph") {
            const paragraphContent =
              child.children
                ?.map((grandChild: any) => parseLexicalNode(grandChild))
                .join("") || "";

            if (!paragraphContent || paragraphContent.trim() === "") {
              // Count consecutive empty paragraphs
              let emptyCount = 0;
              let j = i;

              while (
                j < node.children.length &&
                node.children[j].type === "paragraph" &&
                (!node.children[j].children ||
                  node.children[j].children
                    .map((gc: any) => parseLexicalNode(gc))
                    .join("")
                    .trim() === "")
              ) {
                emptyCount++;
                j++;
              }

              // Render the appropriate number of line breaks
              if (emptyCount === 1) {
                processedChildren.push(`<p class="mb-3"><br></p>`);
              } else {
                // For multiple consecutive empty paragraphs, create multiple line breaks
                processedChildren.push(
                  `<p class="mb-3">${"<br>".repeat(emptyCount)}</p>`
                );
              }

              i = j; // Skip the processed empty paragraphs
            } else {
              // Regular paragraph with content
              processedChildren.push(`<p class="mb-3">${paragraphContent}</p>`);
              i++;
            }
          } else {
            // Non-paragraph child
            processedChildren.push(parseLexicalNode(child));
            i++;
          }
        }

        return processedChildren.join("");

      case "linebreak":
        return "<br>";

      case "tab":
        return "&nbsp;&nbsp;&nbsp;&nbsp;";

      case "table":
        const tableContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        return `<table class="border-collapse border border-gray-300 w-full my-4">${tableContent}</table>`;

      case "tablerow":
        const rowContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        return `<tr class="border border-gray-300">${rowContent}</tr>`;

      case "tablecell":
        const cellContent =
          node.children
            ?.map((child: any) => parseLexicalNode(child))
            .join("") || "";
        const cellTag = node.headerState ? "th" : "td";
        const cellClass = node.headerState
          ? "border border-gray-300 px-4 py-2 bg-gray-50 font-semibold"
          : "border border-gray-300 px-4 py-2";
        return `<${cellTag} class="${cellClass}">${cellContent}</${cellTag}>`;

      default:
        // For unknown node types, try to render children
        if (node.children) {
          return node.children
            .map((child: any) => parseLexicalNode(child))
            .join("");
        }
        return "";
    }
  };

  // Helper function to check if URL is a YouTube video
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Helper function to convert YouTube watch URL to embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = "";

    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }

    return `https://www.youtube.com/embed/${videoId}`;
  };

  const renderContent = (content: string, type: string, videoUrl?: string) => {
    switch (type) {
      case "video":
        if (videoUrl) {
          // Check if it's a YouTube URL
          if (isYouTubeUrl(videoUrl)) {
            const embedUrl = getYouTubeEmbedUrl(videoUrl);
            return (
              <div className="w-full">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                  />
                </div>
                {content && (
                  <div className="mt-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  </div>
                )}
              </div>
            );
          } else {
            // Handle direct video file URLs
            const encodedUrl = encodeURI(videoUrl);
            return (
              <div className="w-full">
                <video
                  controls
                  className="w-full max-w-full h-auto rounded-lg shadow-md"
                  preload="metadata"
                >
                  <source src={encodedUrl} type="video/mp4" />
                  <source src={encodedUrl} type="video/webm" />
                  <source src={encodedUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
                {content && (
                  <div className="mt-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  </div>
                )}
              </div>
            );
          }
        }
        return (
          <div className="text-center py-8">
            <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Video content not available</p>
          </div>
        );

      case "image":
        if (content) {
          // Handle URL encoding for image URLs
          const encodedUrl = encodeURI(content);
          return (
            <div className="w-full">
              <img
                src={encodedUrl}
                alt="Course content"
                className="w-full max-w-full h-auto rounded-lg shadow-md object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-center py-8">
                        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <p class="text-gray-500">Image could not be loaded</p>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          );
        }
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-500">Image content not available</p>
          </div>
        );

      case "text":
      default:
        return (
          <div className="w-full">
            <div
              className="text-gray-900 leading-relaxed text-base whitespace-pre-wrap break-words overflow-wrap-anywhere prose prose-gray max-w-none"
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{
                __html: parseLexicalContent(content),
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Course Content (Left Accordion) */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 text-blue-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Course Content
            </h2>
          </div>

          <Accordion type="multiple" className="w-full">
            {units.map((unit, index) => (
              <AccordionItem
                key={unit.id}
                value={`unit-${unit.id}`}
                className={
                  index === 0
                    ? "border border-teal-200 mb-2"
                    : "border border-gray-200 mb-2"
                }
              >
                <AccordionTrigger className="text-left text-gray-900 hover:text-gray-900 px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {unit.name}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2 pl-4">
                    {/* Learning Blocks */}
                    {unit.learningBlocks.map((block) => {
                      const isAccessible = isLearningBlockAccessible(
                        block,
                        unit.order
                      );
                      return (
                        <div
                          key={block.id}
                          className={`flex items-center justify-between p-2 transition-colors ${
                            !isAccessible
                              ? "opacity-50 cursor-not-allowed"
                              : selectedContent?.id === block.id &&
                                selectedContent?.type === "learningBlock"
                              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                              : "hover:bg-gray-50 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (isAccessible) {
                              handleContentSelect("learningBlock", block);
                            }
                          }}
                        >
                          <div className="flex items-center text-gray-700">
                            {!isAccessible ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              getContentIcon(block.type)
                            )}
                            <span
                              className={`ml-2 text-sm ${
                                !isAccessible
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }`}
                            >
                              {block.title}
                            </span>
                          </div>
                          {!isAccessible ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            getStatusIcon(block.status)
                          )}
                        </div>
                      );
                    })}

                    {/* Assessments */}
                    {unit.assessments.map((assessment) => {
                      const isAccessible = isAssessmentAccessible(
                        assessment,
                        unit.order
                      );
                      return (
                        <div
                          key={assessment.id}
                          className={`flex items-center justify-between p-2 transition-colors ${
                            !isAccessible
                              ? "opacity-50 cursor-not-allowed"
                              : selectedContent?.id === assessment.id &&
                                selectedContent?.type === "assessment"
                              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                              : "hover:bg-gray-50 cursor-pointer"
                          }`}
                          onClick={() => {
                            if (isAccessible) {
                              handleContentSelect("assessment", assessment);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            {!isAccessible ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : (
                              <HelpOutline className="w-4 h-4 text-gray-700" />
                            )}
                            <span
                              className={`ml-2 text-sm ${
                                !isAccessible
                                  ? "text-gray-400"
                                  : "text-gray-700"
                              }`}
                            >
                              {assessment.title}
                            </span>
                          </div>
                          {!isAccessible ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            getStatusIcon(assessment.status)
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Content Area (Right) */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow-sm p-6">
          {selectedContent ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {selectedContent.type === "learningBlock" ? (
                    <Description className="w-5 h-5 text-green-700 mr-2" />
                  ) : (
                    <HelpOutline className="w-5 h-5 text-green-700 mr-2" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedContent.title}
                  </h2>
                </div>
                {selectedContent.type === "learningBlock" &&
                  isCurrentLearningBlockCompleted() && (
                    <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </div>
                  )}
              </div>

              {selectedContent.type === "assessment" &&
              selectedContent.assessment ? (
                <>
                  <div className="max-w-none mb-6">
                    <p className="text-gray-900 leading-relaxed text-base mb-6">
                      {selectedContent.content}
                    </p>

                    {/* Assessment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Assessment Details:
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Passing Score:
                            </span>
                            <span className="font-medium text-gray-900">
                              {selectedContent.assessment.passingScore}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">XP Points:</span>
                            <span className="font-medium text-gray-900">
                              {selectedContent.assessment.xpPoints}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Attempt Information:
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Attempts used:
                            </span>
                            <span className="font-medium text-gray-900">
                              <span className="text-gray-900">
                                {selectedContent.assessment.attemptsUsed}
                              </span>
                              <span className="text-gray-500">
                                {" "}
                                / {selectedContent.assessment.maxRetakes}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">
                              Attempts remaining:
                            </span>
                            <span className="font-medium text-gray-900">
                              {selectedContent.assessment.maxRetakes -
                                selectedContent.assessment.attemptsUsed}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Results Tabs - Only show if there are passed attempts */}
                  {Array.isArray(assessmentAttempts) &&
                    assessmentAttempts.length > 0 &&
                    Array.isArray(assessmentQuestions) &&
                    assessmentQuestions.length > 0 &&
                    assessmentAttempts[0]?.passed === true && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Assessment Results:
                        </h3>
                        {isLoadingAssessmentResults ? (
                          <div className="text-center py-8">
                            <div className="text-gray-500">
                              Loading assessment results...
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-full">
                            <Carousel className="w-full">
                              <CarouselContent className="-ml-2">
                                {assessmentQuestions
                                  .sort((a, b) => a.order - b.order)
                                  .map((question, questionIndex) => (
                                    <CarouselItem
                                      key={question.id}
                                      className="pl-2"
                                    >
                                      <div className="p-4 border rounded-lg bg-gray-50 h-full">
                                        <div className="space-y-4">
                                          <div className="p-4 border rounded-lg bg-white">
                                            <div className="mb-3">
                                              <h5 className="font-medium text-gray-900 mb-2">
                                                Question {questionIndex + 1}
                                              </h5>
                                              <p className="text-gray-700 mb-3">
                                                {question.questionText}
                                              </p>
                                            </div>

                                            <div className="mb-3">
                                              <h6 className="font-medium text-gray-900 mb-2">
                                                Answer:
                                              </h6>
                                              <p className="text-gray-700">
                                                {question.correctAnswer}
                                              </p>
                                            </div>

                                            {/* <div className="mb-3">
                                              <h6 className="font-medium text-gray-900 mb-2">
                                                Description:
                                              </h6>
                                              <p className="text-gray-700">
                                                This is a dummy description for the
                                                question. It will be replaced with
                                                actual content later.
                                              </p>
                                            </div> */}
                                          </div>
                                        </div>
                                      </div>
                                    </CarouselItem>
                                  ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-0" />
                              <CarouselNext className="right-0" />
                            </Carousel>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Show passed message if assessment is completed */}
                  {Array.isArray(assessmentAttempts) &&
                    assessmentAttempts.length > 0 &&
                    assessmentAttempts[0]?.passed === true && (
                      <div className="mt-6">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="text-green-600 mr-2" />
                            <span className="font-semibold">
                              Assessment Completed!
                            </span>
                          </div>
                          <p>You have successfully passed this assessment.</p>
                        </div>
                      </div>
                    )}

                  {/* Start Assessment Button - Hide if there are passed attempts or if not accessible */}
                  {(!Array.isArray(assessmentAttempts) ||
                    assessmentAttempts.length === 0 ||
                    assessmentAttempts[0]?.passed !== true) && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() =>
                          handleStartAssessment(selectedContent.assessment!.id)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                        disabled={
                          selectedContent.assessment.maxRetakes -
                            selectedContent.assessment.attemptsUsed ===
                            0 ||
                          !isAssessmentAccessible(
                            selectedContent.assessment!,
                            units.find((unit) =>
                              unit.assessments.some(
                                (a) => a.id === selectedContent.assessment!.id
                              )
                            )?.order || 1
                          )
                        }
                      >
                        {selectedContent.assessment.maxRetakes -
                          selectedContent.assessment.attemptsUsed ===
                        0
                          ? "No Attempts Remaining"
                          : !isAssessmentAccessible(
                              selectedContent.assessment!,
                              units.find((unit) =>
                                unit.assessments.some(
                                  (a) => a.id === selectedContent.assessment!.id
                                )
                              )?.order || 1
                            )
                          ? "Complete Previous Content First"
                          : "Start Assessment"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="max-w-none">
                    {(() => {
                      if (selectedContent.type === "learningBlock") {
                        const learningBlock = units
                          .flatMap((unit) => unit.learningBlocks)
                          .find((block) => block.id === selectedContent.id);
                        return renderContent(
                          selectedContent.content,
                          learningBlock?.type || "text",
                          learningBlock?.videoUrl
                        );
                      }
                      return renderContent(selectedContent.content, "text");
                    })()}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      className={
                        selectedContent?.type === "learningBlock" &&
                        isCurrentLearningBlockCompleted()
                          ? "bg-gray-400 hover:bg-gray-400 text-white px-6 py-2 cursor-not-allowed"
                          : "bg-blue-700 hover:bg-blue-800 text-white px-6 py-2"
                      }
                      onClick={handleCompleteLearningBlock}
                      disabled={
                        selectedContent?.type === "learningBlock" &&
                        isCurrentLearningBlockCompleted()
                      }
                    >
                      {selectedContent?.type === "learningBlock"
                        ? isCurrentLearningBlockCompleted()
                          ? "Completed"
                          : "Mark Complete"
                        : "Next"}
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a content item to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseContentLayout;
