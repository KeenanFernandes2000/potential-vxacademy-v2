import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";

// Mock data for questions
const mockQuestions = [
  {
    id: 1,
    questionText: "What is the purpose of React hooks?",
    questionType: "mcq",
    assessmentId: 1,
    options: [
      "To manage state and side effects",
      "To create components",
      "To handle events",
      "To style components",
    ],
    correctAnswer: "To manage state and side effects in functional components",
    order: 1,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    questionText: "Explain the difference between props and state in React.",
    questionType: "essay",
    assessmentId: 1,
    options: null,
    correctAnswer:
      "Props are read-only data passed down from parent components, while state is mutable data managed within a component.",
    order: 2,
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    questionText:
      "Which Python library is commonly used for data manipulation?",
    questionType: "mcq",
    assessmentId: 2,
    options: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"],
    correctAnswer: "Pandas",
    order: 1,
    createdAt: "2024-01-10",
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
          question.questionText.toLowerCase().includes(query.toLowerCase()) ||
          question.questionType.toLowerCase().includes(query.toLowerCase()) ||
          question.assessmentId.toString().includes(query.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  };

  const handleCreateQuestion = (formData: any) => {
    const newQuestion = {
      id: questions.length + 1,
      questionText: formData.questionText,
      questionType: formData.questionType,
      assessmentId: parseInt(formData.assessmentId),
      options: formData.options ? JSON.parse(formData.options) : null,
      correctAnswer: formData.correctAnswer,
      order: parseInt(formData.order),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuestions([...questions, newQuestion]);
    setFilteredQuestions([...questions, newQuestion]);
  };

  const CreateQuestionForm = () => {
    const [formData, setFormData] = useState({
      questionText: "",
      questionType: "",
      assessmentId: "",
      options: "",
      correctAnswer: "",
      order: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateQuestion(formData);
      setFormData({
        questionText: "",
        questionType: "",
        assessmentId: "",
        options: "",
        correctAnswer: "",
        order: "",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionText">Question Text</Label>
          <Input
            id="questionText"
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionType">Question Type</Label>
          <Input
            id="questionType"
            value={formData.questionType}
            onChange={(e) =>
              setFormData({ ...formData, questionType: e.target.value })
            }
            placeholder="mcq, essay, etc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessmentId">Assessment ID</Label>
          <Input
            id="assessmentId"
            type="number"
            value={formData.assessmentId}
            onChange={(e) =>
              setFormData({ ...formData, assessmentId: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="options">Options (JSON array for MCQ)</Label>
          <Input
            id="options"
            value={formData.options}
            onChange={(e) =>
              setFormData({ ...formData, options: e.target.value })
            }
            placeholder='["Option 1", "Option 2", "Option 3", "Option 4"]'
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
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
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
    "Question Text",
    "Question Type",
    "Assessment ID",
    "Options",
    "Correct Answer",
    "Order",
    "Created At",
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
