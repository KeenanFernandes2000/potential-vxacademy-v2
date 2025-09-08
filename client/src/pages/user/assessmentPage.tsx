import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmojiEvents as Trophy } from "@mui/icons-material";

// Mock assessment data - matches the image design
const mockAssessmentData = {
  1: {
    id: 1,
    title: "Importance of the Code of Conduct Assessment",
    description: "Test your understanding of the Code of Conduct principles.",
    questions: 3,
    passingScore: 70,
    xpPoints: 50,
    maxRetakes: 3,
    attemptsUsed: 0,
    questionList: [
      {
        id: 1,
        question: "Why is the Code of Conduct important for Abu Dhabi?",
        options: [
          "It increases tourism taxes",
          "It ensures tourists follow local laws",
          "It enhances Abu Dhabi's global reputation in service excellence",
          "It reduces the need for staff training",
        ],
        correctAnswer: 2,
      },
      {
        id: 2,
        question: "What is the primary purpose of the Code of Conduct?",
        options: [
          "To increase revenue",
          "To ensure service excellence and professional behavior",
          "To reduce staff workload",
          "To limit tourist access",
        ],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: "How does the Code of Conduct benefit visitors?",
        options: [
          "By reducing service costs",
          "By providing consistent, high-quality experiences",
          "By limiting their choices",
          "By increasing wait times",
        ],
        correctAnswer: 1,
      },
    ],
  },
};

const AssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const assessmentId = parseInt(id || "1");
  const assessment =
    mockAssessmentData[assessmentId as keyof typeof mockAssessmentData];

  // State for assessment
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const currentQuestion = assessment.questionList[currentQuestionIndex];
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer,
      }));

      if (currentQuestionIndex < assessment.questionList.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(
          answers[assessment.questionList[currentQuestionIndex + 1]?.id] || null
        );
      } else {
        // Assessment completed
        
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

            {/* Start Assessment Button */}
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
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
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
