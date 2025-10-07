import React, { useState, useEffect, useRef } from "react";
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
import { lexicalToHtml } from "@/utils/lexicalToHtml";

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
  courseId?: number;
  courseProgress?: number;
  onUpdateCourseProgress?: (progress: number) => void;
  onUpdateAssessmentStatus?: (
    assessmentId: number,
    status: string,
    attemptsUsed: number
  ) => void;
}

const CourseContentLayout: React.FC<CourseContentLayoutProps> = ({
  units,
  onCompleteLearningBlock,
  courseId,
  courseProgress = 0,
  onUpdateCourseProgress,
  onUpdateAssessmentStatus,
}) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // Ref for the accordion container to enable scrolling
  const accordionRef = useRef<HTMLDivElement>(null);

  // State for selected content
  const [selectedContent, setSelectedContent] = useState<{
    type: "learningBlock" | "assessment";
    id: number;
    title: string;
    content: string;
    assessment?: Assessment;
  } | null>(null);

  // State to track if there's next content available
  const [hasNextContent, setHasNextContent] = useState(true);

  // State for assessment results
  const [assessmentAttempts, setAssessmentAttempts] = useState<
    AssessmentAttempt[]
  >([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<
    AssessmentQuestion[]
  >([]);
  const [isLoadingAssessmentResults, setIsLoadingAssessmentResults] =
    useState(false);

  // State for inline assessment
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [isCompletingLearningBlock, setIsCompletingLearningBlock] =
    useState(false);
  const [hasAttemptedAssessment, setHasAttemptedAssessment] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(
    new Set()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // API functions for assessment data
  const api = {
    async getAssessmentAttempts(
      assessmentId: number,
      userId: number,
      token: string
    ) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
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
        const baseUrl = import.meta.env.VITE_API_URL;
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

    async createAssessmentAttempt(attemptData: any, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/assessments/assessment-attempts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(attemptData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to create assessment attempt:", error);
        throw error;
      }
    },

    async recalculateUserProgress(userId: number, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/progress/user/${userId}/recalculate`,
          {
            method: "POST",
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
        console.error("Failed to recalculate user progress:", error);
        throw error;
      }
    },

    async getUserCourseProgress(userId: number, token: string) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${baseUrl}/api/progress/courses/${userId}`,
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
        console.error("Failed to fetch user course progress:", error);
        throw error;
      }
    },
  };

  // Set initial selected content to first accessible learning block
  React.useEffect(() => {
    if (units.length > 0 && !isInitialized) {
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
        const initialContent = {
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
        };

        setSelectedContent(initialContent);

        // Expand the unit that contains the initial content
        const containingUnit = units.find((unit) => {
          if (firstAccessibleContent.type === "learningBlock") {
            return unit.learningBlocks.some(
              (block) => block.id === firstAccessibleContent.item.id
            );
          } else {
            return unit.assessments.some(
              (assessment) => assessment.id === firstAccessibleContent.item.id
            );
          }
        });

        if (containingUnit) {
          setExpandedUnits([`unit-${containingUnit.id}`]);
        } else if (units.length > 0) {
          // Fallback to first unit if no containing unit found
          setExpandedUnits([`unit-${units[0].id}`]);
        }

        // Initialize completed assessments from units data
        const completedAssessmentsSet = new Set<number>();
        units.forEach((unit) => {
          unit.assessments.forEach((assessment) => {
            if (
              assessment.status === "passed" ||
              (assessment.attemptsUsed > 0 && assessment.status === "completed")
            ) {
              completedAssessmentsSet.add(assessment.id);
            }
          });
        });
        setCompletedAssessments(completedAssessmentsSet);

        // Check if there's next content available
        const nextContent = findNextAccessibleContent();
        setHasNextContent(!!nextContent);

        // Mark as initialized
        setIsInitialized(true);
      }
    }
  }, [units, isInitialized]);

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
    const newSelectedContent = {
      type,
      id: item.id,
      title: item.title,
      content: item.content || item.description,
      assessment: type === "assessment" ? item : undefined,
    };

    setSelectedContent(newSelectedContent);

    // Find and expand the unit that contains this content
    const containingUnit = units.find((unit) => {
      if (type === "learningBlock") {
        return unit.learningBlocks.some((block) => block.id === item.id);
      } else {
        return unit.assessments.some((assessment) => assessment.id === item.id);
      }
    });

    if (containingUnit) {
      const unitId = `unit-${containingUnit.id}`;
      setExpandedUnits([unitId]);
    }

    // Reset assessment state when selecting new content
    if (type === "assessment") {
      setHasAttemptedAssessment(false);
    }

    // Check if there's next content available after this item
    // We need to temporarily set selectedContent to check for next content
    const originalSelectedContent = selectedContent;
    setSelectedContent(newSelectedContent);

    // Check for next content
    const nextContent = findNextAccessibleContent();
    setHasNextContent(!!nextContent);
  };

  const handleStartAssessment = () => {
    if (selectedContent?.type === "assessment" && selectedContent.assessment) {
      // Check if user has exceeded attempt limit
      if (hasExceededAttemptLimit()) {
        alert(
          "You have exceeded the maximum number of attempts for this assessment."
        );
        return;
      }

      setIsAssessmentStarted(true);
      setCurrentQuestionIndex(0);
      setAssessmentAnswers({});
      setSelectedAnswer(null);
      setHasAttemptedAssessment(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null && selectedContent?.assessment) {
      const currentQuestion = assessmentQuestions[currentQuestionIndex];

      // Create updated answers object with current answer
      const updatedAnswers = {
        ...assessmentAnswers,
        [currentQuestion.id]: selectedAnswer,
      };

      // Always store the current answer first
      setAssessmentAnswers(updatedAnswers);

      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(
          updatedAnswers[assessmentQuestions[currentQuestionIndex + 1]?.id] ||
            null
        );
      } else {
        // Assessment completed - submit attempt with the updated answers
        console.log(
          "Assessment completed, submitting with answers:",
          updatedAnswers
        );
        handleSubmitAssessment(updatedAnswers);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestion = assessmentQuestions[currentQuestionIndex - 1];
      setSelectedAnswer(assessmentAnswers[prevQuestion.id] || null);
    }
  };

  const handleSubmitAssessment = async (answersToSubmit?: {
    [key: number]: string;
  }) => {
    if (!token || !user || !selectedContent?.assessment) return;

    // Use provided answers or fall back to state
    const answersToUse = answersToSubmit || assessmentAnswers;

    try {
      setIsSubmittingAssessment(true);

      // Calculate score using the provided answers
      console.log("Full answers object at submission:", answersToUse);
      console.log("Assessment questions:", assessmentQuestions);
      console.log(
        "Number of answers provided:",
        Object.keys(answersToUse).length
      );
      console.log("Expected number of questions:", assessmentQuestions.length);

      let correctAnswers = 0;
      assessmentQuestions.forEach((question) => {
        const selectedOptionText = answersToUse[question.id];
        console.log("Question ID:", question.id);
        console.log("Selected Option Text:", selectedOptionText);
        console.log("Correct Answer:", question.correctAnswer);
        console.log(
          "Are they equal?",
          selectedOptionText === question.correctAnswer
        );
        console.log("---");

        if (selectedOptionText === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round(
        (correctAnswers / assessmentQuestions.length) * 100
      );
      const passed = score >= selectedContent.assessment.passingScore;

      // Create attempt data
      const attemptData = {
        userId: user.id,
        assessmentId: selectedContent.assessment.id,
        score: score,
        passed: passed,
        answers: answersToUse,
        completedAt: new Date().toISOString(),
      };

      // Submit attempt
      await api.createAssessmentAttempt(attemptData, token);

      // Recalculate user progress after assessment completion
      try {
        await api.recalculateUserProgress(user.id, token);
        console.log("User progress recalculated successfully");

        // Fetch updated course progress after recalculation
        if (courseId && onUpdateCourseProgress) {
          try {
            const courseProgressResponse = await api.getUserCourseProgress(
              user.id,
              token
            );
            if (courseProgressResponse.success && courseProgressResponse.data) {
              const courseProgress = courseProgressResponse.data.find(
                (progress: any) => progress.courseId === courseId
              );
              if (
                courseProgress &&
                courseProgress.completionPercentage !== undefined
              ) {
                const updatedProgress =
                  parseFloat(courseProgress.completionPercentage) || 0;
                onUpdateCourseProgress(updatedProgress);
                console.log("Course progress updated:", updatedProgress);
              }
            }
          } catch (progressError) {
            console.warn(
              "Failed to fetch updated course progress:",
              progressError
            );
          }
        }
      } catch (recalculateError) {
        console.warn("Failed to recalculate user progress:", recalculateError);
        // Don't throw error here as assessment was already submitted successfully
      }

      // Refetch assessment data to get the latest results
      await refetchAssessmentData();

      // Mark assessment as attempted and completed
      setHasAttemptedAssessment(true);
      if (selectedContent.assessment) {
        setCompletedAssessments(
          (prev) => new Set([...prev, selectedContent.assessment!.id])
        );

        // Update assessment status in parent component to show green tick in sidebar
        if (onUpdateAssessmentStatus) {
          onUpdateAssessmentStatus(
            selectedContent.assessment.id,
            passed ? "passed" : "completed",
            selectedContent.assessment.attemptsUsed + 1
          );
        }
      }

      // Reset assessment state
      setIsAssessmentStarted(false);
      setCurrentQuestionIndex(0);
      setAssessmentAnswers({});
      setSelectedAnswer(null);

      // Automatically move to next content after assessment completion
      setTimeout(() => {
        handleCompleteAssessment();
      }, 1000); // Small delay to show the results
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(assessmentAnswers).length;
  };

  const getCompletionPercentage = () => {
    return Math.round((getAnsweredCount() / assessmentQuestions.length) * 100);
  };

  // Function to refetch assessment data after completion
  const refetchAssessmentData = async () => {
    if (
      selectedContent?.type === "assessment" &&
      selectedContent.assessment &&
      token &&
      user
    ) {
      try {
        const [attemptsData, questionsData] = await Promise.all([
          api.getAssessmentAttempts(
            selectedContent.assessment.id,
            user.id,
            token
          ),
          api.getAssessmentQuestions(selectedContent.assessment.id, token),
        ]);

        setAssessmentAttempts(
          Array.isArray(attemptsData?.data) ? attemptsData.data : []
        );
        setAssessmentQuestions(
          Array.isArray(questionsData?.data) ? questionsData.data : []
        );
      } catch (error) {
        console.error("Failed to refetch assessment data:", error);
      }
    }
  };

  // Function to get best score from all attempts
  const getBestScore = (): number => {
    if (!Array.isArray(assessmentAttempts) || assessmentAttempts.length === 0) {
      return 0;
    }

    const scores = assessmentAttempts.map((attempt) => attempt.score);
    return Math.max(...scores);
  };

  // Function to check if user has exceeded attempt limit
  const hasExceededAttemptLimit = (): boolean => {
    if (!selectedContent?.assessment) return false;

    const attemptsUsed = selectedContent.assessment.attemptsUsed || 0;
    const maxRetakes = selectedContent.assessment.maxRetakes || 0;

    return attemptsUsed >= maxRetakes;
  };

  // Function to scroll to a specific learning block or assessment in the accordion
  const scrollToContentItem = (
    contentId: number,
    contentType: "learningBlock" | "assessment"
  ) => {
    console.log("scrollToContentItem called with:", contentId, contentType);

    if (!accordionRef.current) {
      console.log("accordionRef.current is null");
      return;
    }

    // Find the target element
    const targetElement = accordionRef.current.querySelector(
      `[data-content-id="${contentId}"][data-content-type="${contentType}"]`
    );

    console.log("Target element found:", targetElement);

    if (targetElement) {
      console.log("Scrolling to element");
      // Scroll to the element with smooth behavior
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    } else {
      console.log("Target element not found in accordion");
    }
  };

  const handleCompleteLearningBlock = async () => {
    if (selectedContent?.type === "learningBlock" && onCompleteLearningBlock) {
      try {
        setIsCompletingLearningBlock(true);
        await onCompleteLearningBlock(selectedContent.id);

        // Find the next content item that should become accessible
        // We need to find the next item in the sequence, not based on current accessibility
        const nextContent = findNextContentAfterCompletion(selectedContent.id);

        if (nextContent) {
          // Navigate to the next content item
          setSelectedContent({
            type: nextContent.type,
            id: nextContent.item.id,
            title: nextContent.item.title,
            content: nextContent.item.content || nextContent.item.description,
            assessment:
              nextContent.type === "assessment" ? nextContent.item : undefined,
          });
          setHasNextContent(true);

          // Expand the unit that contains the next content
          const containingUnit = units.find((unit) => {
            if (nextContent.type === "learningBlock") {
              return unit.learningBlocks.some(
                (block) => block.id === nextContent.item.id
              );
            } else {
              return unit.assessments.some(
                (assessment) => assessment.id === nextContent.item.id
              );
            }
          });

          if (containingUnit) {
            setExpandedUnits([`unit-${containingUnit.id}`]);
          }

          // Auto-scroll to the newly unlocked content after a short delay
          setTimeout(() => {
            scrollToContentItem(nextContent.item.id, nextContent.type);
          }, 100);
        } else {
          // No more content available - course or unit completed
          console.log(
            "No more content available - course progression complete"
          );
          setHasNextContent(false);
        }
      } catch (error) {
        console.error("Failed to complete learning block:", error);
      } finally {
        setIsCompletingLearningBlock(false);
      }
    }
  };

  const handleCompleteAssessment = async () => {
    if (selectedContent?.type === "assessment") {
      try {
        console.log(
          "Completing assessment, current selectedContent:",
          selectedContent
        );

        // Find the next content item that should become accessible
        const nextContent = findNextContentAfterCompletionGeneric(
          selectedContent.id,
          selectedContent.type
        );

        console.log("Next content found:", nextContent);

        if (nextContent) {
          console.log("Setting new selected content:", {
            type: nextContent.type,
            id: nextContent.item.id,
            title: nextContent.item.title,
          });

          // Find which unit contains the next content
          const targetUnit = units.find((unit) => {
            if (nextContent.type === "learningBlock") {
              return unit.learningBlocks.some(
                (block) => block.id === nextContent.item.id
              );
            } else {
              return unit.assessments.some(
                (assessment) => assessment.id === nextContent.item.id
              );
            }
          });

          console.log("Target unit found:", targetUnit);

          // Navigate to the next content item
          setSelectedContent({
            type: nextContent.type,
            id: nextContent.item.id,
            title: nextContent.item.title,
            content: nextContent.item.content || nextContent.item.description,
            assessment:
              nextContent.type === "assessment" ? nextContent.item : undefined,
          });
          setHasNextContent(true);

          // Reset assessment state
          setHasAttemptedAssessment(false);

          // Expand the target unit if it exists
          if (targetUnit) {
            const unitId = `unit-${targetUnit.id}`;
            setExpandedUnits([unitId]);
          }

          // Auto-scroll to the newly unlocked content after a short delay
          setTimeout(() => {
            console.log(
              "Attempting to scroll to content:",
              nextContent.item.id,
              nextContent.type
            );
            scrollToContentItem(nextContent.item.id, nextContent.type);
          }, 300); // Increased delay to ensure accordion has expanded
        } else {
          // No more content available - course or unit completed
          console.log(
            "No more content available - course progression complete"
          );
          setHasNextContent(false);
        }
      } catch (error) {
        console.error("Failed to complete assessment:", error);
      }
    }
  };

  // Helper function to find the next content item after completing a specific learning block
  const findNextContentAfterCompletion = (
    completedLearningBlockId: number
  ): {
    type: "learningBlock" | "assessment";
    item: any;
    unitOrder: number;
    itemOrder: number;
  } | null => {
    const allContent = getAllContentInOrder();

    // Find the index of the completed learning block
    const completedIndex = allContent.findIndex(
      (content) =>
        content.type === "learningBlock" &&
        content.item.id === completedLearningBlockId
    );

    console.log("Completed learning block ID:", completedLearningBlockId);
    console.log("Completed index:", completedIndex);
    console.log(
      "All content:",
      allContent.map((c) => ({
        type: c.type,
        id: c.item.id,
        title: c.item.title,
      }))
    );

    if (completedIndex === -1) return null;

    // Look for the next content item in the sequence
    for (let i = completedIndex + 1; i < allContent.length; i++) {
      const content = allContent[i];
      console.log("Next content found:", {
        type: content.type,
        id: content.item.id,
        title: content.item.title,
      });
      return content; // Return the next item regardless of accessibility
    }

    console.log("No next content found");
    return null; // No more content found
  };

  // Generic helper function to find the next content item after completing any content
  const findNextContentAfterCompletionGeneric = (
    completedContentId: number,
    completedContentType: "learningBlock" | "assessment"
  ): {
    type: "learningBlock" | "assessment";
    item: any;
    unitOrder: number;
    itemOrder: number;
  } | null => {
    const allContent = getAllContentInOrder();

    // Find the index of the completed content
    const completedIndex = allContent.findIndex(
      (content) =>
        content.type === completedContentType &&
        content.item.id === completedContentId
    );

    if (completedIndex === -1) return null;

    // Look for the next content item in the sequence
    for (let i = completedIndex + 1; i < allContent.length; i++) {
      const content = allContent[i];
      return content; // Return the next item regardless of accessibility
    }

    return null; // No more content found
  };

  // Helper function to find the next accessible content item
  const findNextAccessibleContent = (): {
    type: "learningBlock" | "assessment";
    item: any;
    unitOrder: number;
    itemOrder: number;
  } | null => {
    if (!selectedContent) return null;

    const allContent = getAllContentInOrder();
    const currentIndex = allContent.findIndex(
      (content) =>
        content.type === selectedContent.type &&
        content.item.id === selectedContent.id
    );

    if (currentIndex === -1) return null;

    // Look for the next accessible content item
    for (let i = currentIndex + 1; i < allContent.length; i++) {
      const content = allContent[i];

      if (content.type === "learningBlock") {
        if (isLearningBlockAccessible(content.item, content.unitOrder)) {
          return content;
        }
      } else if (content.type === "assessment") {
        if (isAssessmentAccessible(content.item, content.unitOrder)) {
          return content;
        }
      }
    }

    return null; // No more accessible content found
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
        // For assessments, check if they have a passing attempt or are in our completed set
        const hasPassingAttempt =
          prevContent.item.status === "passed" ||
          (prevContent.item.attemptsUsed > 0 &&
            prevContent.item.status === "completed") ||
          completedAssessments.has(prevContent.item.id);
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
        // For assessments, check if they have a passing attempt or are in our completed set
        const hasPassingAttempt =
          prevContent.item.status === "passed" ||
          (prevContent.item.attemptsUsed > 0 &&
            prevContent.item.status === "completed") ||
          completedAssessments.has(prevContent.item.id);
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
              className="text-gray-900 leading-relaxed text-base prose prose-gray max-w-none prose-ul:ml-4 prose-ol:ml-4 prose-li:my-1 prose-p:mb-4 prose-headings:mt-6 prose-headings:mb-3"
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{
                __html: lexicalToHtml(content),
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

          <Accordion
            type="single"
            className="w-full"
            ref={accordionRef}
            value={expandedUnits[0] || ""}
            onValueChange={(value) => setExpandedUnits(value ? [value] : [])}
          >
            {units.map((unit, index) => (
              <AccordionItem
                key={unit.id}
                value={`unit-${unit.id}`}
                className="border border-gray-200 mb-2"
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
                          data-content-id={block.id}
                          data-content-type="learningBlock"
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
                          data-content-id={assessment.id}
                          data-content-type="assessment"
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

            {/* Course Completed Section - Only show when progress is 100% or greater */}
            {courseProgress >= 100 && (
              <AccordionItem
                value="course-completed"
                className="border border-green-200 mb-2 bg-green-50"
              >
                <AccordionTrigger className="text-left text-green-900 hover:text-green-900 px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Course Completed</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">
                          Congratulations!
                        </h3>
                      </div>
                      <p className="text-green-800 mb-4">
                        You have successfully completed all units and
                        assessments in this course.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {units.length}
                          </div>
                          <div className="text-sm text-green-700">
                            Units Completed
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {units.reduce(
                              (total, unit) =>
                                total + unit.learningBlocks.length,
                              0
                            )}
                          </div>
                          <div className="text-sm text-green-700">
                            Learning Blocks
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {units.reduce(
                              (total, unit) => total + unit.assessments.length,
                              0
                            )}
                          </div>
                          <div className="text-sm text-green-700">
                            Assessments
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Next Steps
                      </h4>
                      <ul className="space-y-2 text-green-800">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>
                            Certificate of completion will be generated
                          </span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Your progress has been recorded</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>
                            You can access this course anytime for review
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
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
                  {/* Assessment Interface - Show if assessment is started */}
                  {isAssessmentStarted && assessmentQuestions.length > 0 ? (
                    <>
                      {/* Header with Progress */}
                      <div className="mb-6 bg-gray-50 p-5">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-lg font-medium text-gray-900">
                            Question {currentQuestionIndex + 1} of{" "}
                            {assessmentQuestions.length}
                          </div>
                          <div className="text-lg font-medium text-gray-900">
                            {getAnsweredCount()} of {assessmentQuestions.length}{" "}
                            answered ({getCompletionPercentage()}% complete)
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${getCompletionPercentage()}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Separator Line */}
                      <div className="border-t border-gray-300 mb-8"></div>

                      {/* Question Card */}
                      <div className="bg-white shadow-sm p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                          {
                            assessmentQuestions[currentQuestionIndex]
                              ?.questionText
                          }
                        </h2>

                        <div className="space-y-4">
                          {assessmentQuestions[
                            currentQuestionIndex
                          ]?.options.map((option, index) => (
                            <label
                              key={index}
                              className={`flex items-center p-3 transition-colors ${
                                isSubmittingAssessment
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${assessmentQuestions[currentQuestionIndex]?.id}`}
                                value={option}
                                checked={selectedAnswer === option}
                                onChange={() => handleAnswerSelect(option)}
                                disabled={isSubmittingAssessment}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4 disabled:cursor-not-allowed"
                              />
                              <span
                                className={`text-gray-900 ${
                                  isSubmittingAssessment ? "opacity-50" : ""
                                }`}
                              >
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Footer */}
                      <div className="bg-white shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <Button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={handleNextQuestion}
                            disabled={
                              selectedAnswer === null || isSubmittingAssessment
                            }
                            className="px-6 py-2 bg-dawn hover:bg-[#B85A1A] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingAssessment
                              ? "Submitting..."
                              : currentQuestionIndex ===
                                assessmentQuestions.length - 1
                              ? "Submit"
                              : "Next"}
                          </Button>
                        </div>

                        {/* Instruction Message */}
                        {selectedAnswer === null && (
                          <div className="bg-blue-50 border border-blue-200 p-4">
                            <p className="text-blue-800 text-sm">
                              Please select an answer before proceeding to the
                              next question.
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Assessment Details - Show when not started */}
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
                                  Questions:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {assessmentQuestions.length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-700">
                                  Passing Score:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {selectedContent.assessment.passingScore}%
                                </span>
                              </div>
                              {/* <div className="flex justify-between">
                                <span className="text-gray-700">
                                  XP Points:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {selectedContent.assessment.xpPoints}
                                </span>
                              </div> */}
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
                                <span
                                  className={`font-medium ${
                                    hasExceededAttemptLimit()
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {hasExceededAttemptLimit()
                                    ? "0"
                                    : selectedContent.assessment.maxRetakes -
                                      selectedContent.assessment.attemptsUsed}
                                </span>
                              </div>
                              {assessmentAttempts.length > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-700">
                                    Best Score:
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {getBestScore()}%
                                  </span>
                                </div>
                              )}
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
                              <p>
                                You have successfully passed this assessment.
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Show completion message if assessment has been attempted */}
                      {hasAttemptedAssessment && (
                        <div className="mt-6">
                          {Array.isArray(assessmentAttempts) &&
                          assessmentAttempts.length > 0 &&
                          assessmentAttempts[0]?.passed === true ? (
                            // Passed assessment - show success message
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
                              <div className="flex items-center justify-center mb-2">
                                <CheckCircle className="text-green-600 mr-2" />
                                <span className="font-semibold">
                                  Assessment Passed!
                                </span>
                              </div>
                              <p>
                                Congratulations! You have successfully passed
                                this assessment.
                              </p>
                            </div>
                          ) : (
                            // Failed assessment - show completion message
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-center">
                              <div className="flex items-center justify-center mb-2">
                                <span className="text-orange-600 mr-2">⚠️</span>
                                <span className="font-semibold">
                                  Assessment Completed
                                </span>
                              </div>
                              <p>Assessment completed.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Start Assessment Button - Hide if there are passed attempts, attempted, or if not accessible */}
                      {(!Array.isArray(assessmentAttempts) ||
                        assessmentAttempts.length === 0 ||
                        assessmentAttempts[0]?.passed !== true) &&
                        !hasAttemptedAssessment && (
                          <div className="mt-6 flex justify-end">
                            <Button
                              onClick={handleStartAssessment}
                              className={`px-8 py-3 text-lg font-medium ${
                                hasExceededAttemptLimit()
                                  ? "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-dawn hover:bg-[#B85A1A] text-white"
                              }`}
                              disabled={
                                hasExceededAttemptLimit() ||
                                !isAssessmentAccessible(
                                  selectedContent.assessment!,
                                  units.find((unit) =>
                                    unit.assessments.some(
                                      (a) =>
                                        a.id === selectedContent.assessment!.id
                                    )
                                  )?.order || 1
                                )
                              }
                            >
                              {hasExceededAttemptLimit()
                                ? "No Attempts Remaining"
                                : !isAssessmentAccessible(
                                    selectedContent.assessment!,
                                    units.find((unit) =>
                                      unit.assessments.some(
                                        (a) =>
                                          a.id ===
                                          selectedContent.assessment!.id
                                      )
                                    )?.order || 1
                                  )
                                ? "Complete Previous Content First"
                                : "Start Assessment"}
                            </Button>
                          </div>
                        )}
                    </>
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
                          : selectedContent?.type === "learningBlock" &&
                            isCompletingLearningBlock
                          ? "bg-dawn/70 text-black px-6 py-2 cursor-wait"
                          : selectedContent?.type === "assessment" &&
                            isSubmittingAssessment
                          ? "bg-dawn/70 text-black px-6 py-2 cursor-wait"
                          : "bg-dawn hover:bg-[#B85A1A] text-white px-6 py-2"
                      }
                      onClick={handleCompleteLearningBlock}
                      disabled={
                        (selectedContent?.type === "learningBlock" &&
                          (isCurrentLearningBlockCompleted() ||
                            isCompletingLearningBlock)) ||
                        (selectedContent?.type === "assessment" &&
                          isSubmittingAssessment)
                      }
                    >
                      {selectedContent?.type === "learningBlock"
                        ? isCurrentLearningBlockCompleted()
                          ? "Completed"
                          : isCompletingLearningBlock
                          ? "Completing..."
                          : hasNextContent
                          ? "Mark Complete & Continue"
                          : "Mark Complete"
                        : isSubmittingAssessment
                        ? "Loading..."
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
