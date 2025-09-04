import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/AdminTableLayout";

// Mock data for questions
const mockQuestions = [
  {
    id: 1,
    question: "What is the purpose of React hooks?",
    type: "Multiple Choice",
    assessment: "React Fundamentals Quiz",
    difficulty: "Medium",
    points: 5,
    correctAnswer: "To manage state and side effects in functional components",
    createdDate: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    question: "Explain the difference between props and state in React.",
    type: "Essay",
    assessment: "React Fundamentals Quiz",
    difficulty: "Hard",
    points: 10,
    correctAnswer:
      "Props are read-only data passed down from parent components, while state is mutable data managed within a component.",
    createdDate: "2024-01-16",
    status: "Active",
  },
  {
    id: 3,
    question: "Which Python library is commonly used for data manipulation?",
    type: "Multiple Choice",
    assessment: "Python Data Analysis Project",
    difficulty: "Easy",
    points: 3,
    correctAnswer: "Pandas",
    createdDate: "2024-01-10",
    status: "Draft",
  },
];

const QuestionsPage = () => {
  const [questions, setQuestions] = useState(mockQuestions);
  const [filteredQuestions, setFilteredQuestions] = useState(mockQuestions);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(
        (question) =>
          question.question.toLowerCase().includes(query.toLowerCase()) ||
          question.type.toLowerCase().includes(query.toLowerCase()) ||
          question.assessment.toLowerCase().includes(query.toLowerCase()) ||
          question.difficulty.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  };

  const handleCreateQuestion = (formData: any) => {
    const newQuestion = {
      id: questions.length + 1,
      question: formData.question,
      type: formData.type,
      assessment: formData.assessment,
      difficulty: formData.difficulty,
      points: parseInt(formData.points),
      correctAnswer: formData.correctAnswer,
      createdDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setQuestions([...questions, newQuestion]);
    setFilteredQuestions([...questions, newQuestion]);
  };

  const CreateQuestionForm = () => {
    const [formData, setFormData] = useState({
      question: "",
      type: "",
      assessment: "",
      difficulty: "",
      points: "",
      correctAnswer: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateQuestion(formData);
      setFormData({
        question: "",
        type: "",
        assessment: "",
        difficulty: "",
        points: "",
        correctAnswer: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Question Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessment">Assessment</Label>
          <Input
            id="assessment"
            value={formData.assessment}
            onChange={(e) =>
              setFormData({ ...formData, assessment: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Input
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correctAnswer">Correct Answer</Label>
          <Input
            id="correctAnswer"
            value={formData.correctAnswer}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswer: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit">Create Question</Button>
        </div>
      </form>
    );
  };

  const columns = [
    "Question",
    "Type",
    "Assessment",
    "Difficulty",
    "Points",
    "Correct Answer",
    "Created Date",
    "Status",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Questions"
      description="Manage assessment questions and evaluation criteria"
    >
      <AdminTableLayout
        searchPlaceholder="Search questions..."
        createButtonText="Create Question"
        createForm={<CreateQuestionForm />}
        tableData={filteredQuestions}
        columns={columns}
        onSearch={handleSearch}
      />
    </AdminPageLayout>
  );
};

export default QuestionsPage;
