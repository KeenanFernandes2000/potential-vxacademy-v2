import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import CertificateDialog from "../../components/CertificateDialog";

// Dummy MCQ data
const quizData = [
    {
      id: 1,
      question: "What is the Al Midhyaf Code of Conduct?",
      options: [
        "To give discounts to visitors",
        "To guide only airline staff",
        "A guide for all frontliners to demonstrate the best Emirati values and behaviours",
        "A set of rules only for international tourists",
      ],
      correctAnswer: 2, // A guide for all frontliners...
    },
    {
      id: 2,
      question: "What does Al Midhyaf mean?",
      options: [
        "The guest who is welcomed",
        "The one who serves only food",
        "The one who guides tourists",
        "The one who hosts - representing warmth, generosity, and dignity - values deeply rooted in Emirati tradition",
      ],
      correctAnswer: 3, // The one who hosts...
    },
    {
      id: 3,
      question: "What do the letters GEM stand for?",
      options: [
        "Growth, Energy, Motivation",
        "Genuine, Enriching, Memorable",
        "Gratitude, Empathy, Mindful",
        "Global, Easy, Modern",
      ],
      correctAnswer: 1, // Genuine, Enriching, Memorable
    },
    {
      id: 4,
      question: "How can frontliners influence the sensory environment?",
      options: [
        "By focusing only on security",
        "Through small, intentional choices like music, smiles, and traditional treats",
        "By reducing guest interaction",
        "By directing guests away from sensory elements",
      ],
      correctAnswer: 1, // Through small, intentional choices...
    },
    {
      id: 5,
      question:
        "Which Emirati words should be used to welcome, bid farewell, and thank a guest?",
      options: [
        "Hayyakum, Famaanilla, and Shukran",
        "Famaanilla, Inshallah, Shukran",
        "Marhaba, Hayyakum, Inshallah",
        "As-salamu alaykum, Inshallah, Famaanilla",
      ],
      correctAnswer: 0, // Hayyakum, Famaanilla, and Shukran
    },
    {
      id: 6,
      question: "How can frontliners demonstrate tolerance towards guests?",
      options: [
        "Ignore cultural differences",
        "Respect and celebrate all backgrounds",
        "Avoid eye contact with guests",
        "Serve only familiar cultures",
      ],
      correctAnswer: 1, // Respect and celebrate all backgrounds
    },
    {
      id: 7,
      question: "How can frontliners share knowledge?",
      options: [
        "Share interesting stories and facts about Abu Dhabi",
        "Only talk about international brands",
        "Avoid questions from guests",
        "Say the same thing to every guest",
      ],
      correctAnswer: 0, // Share interesting stories and facts about Abu Dhabi
    },
    {
      id: 8,
      question: "What is adaptability in service?",
      options: [
        "Adjust communication and offer alternatives when needed",
        "Give the same answer to everyone",
        "Ignore feedback",
        "Stay rigid in communication",
      ],
      correctAnswer: 0, // Adjust communication and offer alternatives when needed
    },
    {
      id: 9,
      question:
        "What is the best way for frontliners to show integrity in their service?",
      options: [
        "Hide mistakes from guests",
        "Always be honest with guests, admit mistakes, and correct them quickly",
        "Promise services that are not available",
        "Recommend personal contacts secretly",
      ],
      correctAnswer: 1, // Always be honest...
    },
  ];

const ExistingUserTestPage = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quizData.length).fill(-1)
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quizData[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      const correctAnswers = selectedAnswers.filter(
        (answer, index) => answer === quizData[index].correctAnswer
      ).length;
      setScore(correctAnswers);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quizData.length).fill(-1));
    setShowResults(false);
    setScore(0);
  };

  const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== -1;
  const isLastQuestion = currentQuestionIndex === quizData.length - 1;

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-600">
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#00d8cc] mb-2">
                {score}/{quizData.length}
              </div>
              <div className="text-xl text-muted-foreground mb-4">
                {Math.round((score / quizData.length) * 100)}% Correct
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                <div
                  className="bg-[#00d8cc] h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(score / quizData.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Review Your Answers:</h3>
              {quizData.map((question, index) => (
                <div key={question.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">{question.question}</div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span
                      className={
                        selectedAnswers[index] === question.correctAnswer
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {selectedAnswers[index] !== -1
                        ? question.options[selectedAnswers[index]]
                        : "Not answered"}
                    </span>
                    {selectedAnswers[index] !== question.correctAnswer && (
                      <>
                        <br />
                        <span className="text-muted-foreground">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-600 font-medium">
                          {question.options[question.correctAnswer]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={() => navigate("/user/dashboard")}
                className="px-8 py-2 bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-black rounded-full"
              >
                Go to Dashboard
              </Button>

              <CertificateDialog
                courseName="Al Midhyaf Code of Conduct Training"
                completionDate={new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                certificateId={`VX-${Date.now()}`}
                triggerText="View Certificate"
                triggerClassName="px-8 py-2 bg-[#00d8cc] hover:bg-[#00d8cc]/80 text-black"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">MCQ Quiz</h1>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quizData.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-[#00d8cc] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex justify-center space-x-2">
            {quizData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                disabled={selectedAnswers[index] === -1}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-[#00d8cc] text-black"
                    : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-[#00d8cc] hover:text-black transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isAnswerSelected}
            className="px-8"
          >
            {isLastQuestion ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExistingUserTestPage;
