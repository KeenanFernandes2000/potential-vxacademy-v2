import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmojiEvents as Trophy } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";

// API object for assessment operations
const api = {
  async getAssessmentById(assessmentId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/assessments/${assessmentId}`,
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
      console.error("Failed to fetch assessment:", error);
      throw error;
    }
  },

  async getQuestionsByAssessment(assessmentId: number, token: string) {
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
      console.error("Failed to fetch questions:", error);
      throw error;
    }
  },

  async getAssessmentAttemptsByUserAndAssessment(
    userId: number,
    assessmentId: number,
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
};

// Interface for assessment data
interface Assessment {
  id: number;
  title: string;
  description: string;
  questions: number;
  passingScore: number;
  xpPoints: number;
  maxRetakes: number;
  attemptsUsed: number;
  courseId: number;
  hasPassed: boolean;
  questionList: Question[];
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const AssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const assessmentId = parseInt(id || "1");

  // State for assessment
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!token || !user) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Fetch assessment details and questions in parallel
        const [assessmentResponse, questionsResponse, attemptsResponse] =
          await Promise.all([
            api.getAssessmentById(assessmentId, token),
            api.getQuestionsByAssessment(assessmentId, token),
            api.getAssessmentAttemptsByUserAndAssessment(
              user.id,
              assessmentId,
              token
            ),
          ]);

        const assessmentData = assessmentResponse.data;
        const questions = questionsResponse.data || [];
        const attempts = attemptsResponse.data || [];

        // Transform questions to match expected format
        const questionList = questions.map((q: any) => ({
          id: q.id,
          question: q.questionText || q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer, // Keep as string/text
        }));

        // Check if user has passed any attempt
        const hasPassed = attempts.some(
          (attempt: any) => attempt.passed === true
        );

        // Create assessment object
        const transformedAssessment: Assessment = {
          id: assessmentData.id,
          title: assessmentData.title,
          description: assessmentData.description,
          questions: questionList.length,
          passingScore: assessmentData.passingScore || 70,
          xpPoints: assessmentData.xpPoints || 0,
          maxRetakes: assessmentData.maxRetakes || 3,
          attemptsUsed: attempts.length,
          courseId: assessmentData.courseId,
          hasPassed: hasPassed,
          questionList: questionList,
        };

        setAssessment(transformedAssessment);
      } catch (error: any) {
        console.error("Error fetching assessment data:", error);
        setError(error.message || "Failed to load assessment data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId, token, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d8cc] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Assessment
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Assessment Not Found
          </h1>
        </div>
      </div>
    );
  }
  const attemptsRemaining = assessment.maxRetakes - assessment.attemptsUsed;

  const handleStartAssessment = () => {
    setIsAssessmentStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerIndex: string) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const currentQuestion = assessment.questionList[currentQuestionIndex];

      console.log("Storing answer for question ID:", currentQuestion.id);
      console.log("Selected answer index:", selectedAnswer);
      console.log("Current answers object:", answers);

      setAnswers((prev) => {
        const newAnswers = {
          ...prev,
          [currentQuestion.id]: selectedAnswer,
        };
        console.log("New answers object:", newAnswers);
        return newAnswers;
      });

      if (currentQuestionIndex < assessment.questionList.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(
          answers[assessment.questionList[currentQuestionIndex + 1]?.id] || null
        );
      } else {
        // Assessment completed - submit attempt
        handleSubmitAssessment();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestion = assessment.questionList[currentQuestionIndex - 1];
      setSelectedAnswer(answers[prevQuestion.id] || null);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!token || !user || !assessment) return;

    try {
      // Calculate score
      console.log("Full answers object at submission:", answers);
      console.log("Assessment questions:", assessment.questionList);

      let correctAnswers = 0;
      assessment.questionList.forEach((question) => {
        // Use selectedAnswer for current question, answers[question.id] for others
        const selectedOptionText =
          question.id === assessment.questionList[currentQuestionIndex]?.id
            ? selectedAnswer
            : answers[question.id];

        console.log("Question ID:", question.id);
        console.log("Selected Option Text:", selectedOptionText);
        console.log("Correct Answer:", question.correctAnswer);
        console.log(
          "Are they equal?",
          selectedOptionText == question.correctAnswer
        );
        console.log("---");

        if (selectedOptionText == question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / assessment.questions) * 100);
      const passed = score >= assessment.passingScore;

      // Create attempt data with both indices and text answers
      const detailedAnswers = assessment.questionList.map((question) => {
        const selectedOptionText = answers[question.id];
        const selectedOptionIndex = question.options.findIndex(
          (option) => option === selectedOptionText
        );

        return {
          questionId: question.id,
          selectedOptionIndex: selectedOptionIndex,
          selectedOptionText: selectedOptionText,
          correctAnswer: question.correctAnswer,
          isCorrect: selectedOptionText === question.correctAnswer,
        };
      });

      const attemptData = {
        userId: user.id,
        assessmentId: assessment.id,
        score: score,
        passed: passed,
        answers: answers, // Keep original format for compatibility
        detailedAnswers: detailedAnswers, // Add detailed answers
        completedAt: new Date().toISOString(),
      };

      // Submit attempt
      await api.createAssessmentAttempt(attemptData, token);

      // Show results (you can enhance this with a results page)
      alert(
        `Assessment completed! Score: ${score}% (${
          passed ? "Passed" : "Failed"
        })`
      );

      // If passed, redirect to course page
      if (passed && assessment.courseId) {
        navigate(`/user/course/${assessment.courseId}`);
        return;
      }

      // Update assessment state with new attempt data
      setAssessment((prevAssessment) => {
        if (!prevAssessment) return prevAssessment;

        return {
          ...prevAssessment,
          attemptsUsed: prevAssessment.attemptsUsed + 1,
          hasPassed: passed,
        };
      });

      // Reset assessment state
      setIsAssessmentStarted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setSelectedAnswer(null);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getCompletionPercentage = () => {
    return Math.round((getAnsweredCount() / assessment.questions) * 100);
  };

  if (!isAssessmentStarted) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Assessment Header */}
          <div className="bg-white shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <Trophy className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                {assessment.title}
              </h1>
            </div>

            {/* Assessment Details and Attempt Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Assessment Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Assessment Details:
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Questions:</span>
                    <span className="font-medium text-gray-900">
                      {assessment.questions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Passing Score:</span>
                    <span className="font-medium text-gray-900">
                      {assessment.passingScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">XP Points:</span>
                    <span className="font-medium text-gray-900">
                      {assessment.xpPoints}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attempt Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Attempt Information:
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Attempts used:</span>
                    <span className="font-medium text-gray-900">
                      <span className="text-gray-900">
                        {assessment.attemptsUsed}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        / {assessment.maxRetakes}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Attempts remaining:</span>
                    <span className="font-medium text-gray-900">
                      {attemptsRemaining}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Assessment Button - Hide if already passed */}
            {!assessment.hasPassed && (
              <div className="mt-8">
                <Button
                  onClick={handleStartAssessment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                  disabled={attemptsRemaining === 0}
                >
                  {attemptsRemaining === 0
                    ? "No Attempts Remaining"
                    : "Start Assessment"}
                </Button>
              </div>
            )}

            {/* Show passed message if assessment is completed */}
            {assessment.hasPassed && (
              <div className="mt-8">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="text-green-600 mr-2" />
                    <span className="font-semibold">Assessment Completed!</span>
                  </div>
                  <p>You have successfully passed this assessment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assessment Interface
  const currentQuestion = assessment.questionList[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === assessment.questionList.length - 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Progress */}
        <div className="flex justify-between items-center mb-6 bg-gray-50 p-5">
          <div className="text-lg font-medium text-gray-900">
            Question {currentQuestionIndex + 1} of {assessment.questions}
          </div>
          <div className="text-lg font-medium text-gray-900">
            {getAnsweredCount()} of {assessment.questions} answered (
            {getCompletionPercentage()}% complete)
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-300 mb-8"></div>

        {/* Question Card */}
        <div className="bg-white shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-3 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={() => handleAnswerSelect(option)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-4"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? "Submit" : "Next"}
            </Button>
          </div>

          {/* Instruction Message */}
          {selectedAnswer === null && (
            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-blue-800 text-sm">
                Please select an answer before proceeding to the next question.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
