import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for question operations
const api = {
  async getAllAssessments(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/assessments/assessments`, {
        method: "GET",
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
      console.error("Failed to fetch assessments:", error);
      throw error;
    }
  },

  async getAllQuestions(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${baseUrl}/api/assessments/questions`, {
        method: "GET",
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
      console.error("Failed to fetch questions:", error);
      throw error;
    }
  },

  async createQuestion(questionData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      console.log("Creating question with data:", questionData);
      console.log("Using token:", token ? "Token present" : "No token");

      const response = await fetch(`${baseUrl}/api/assessments/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", response.status, errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to create question:", error);
      throw error;
    }
  },

  async updateQuestion(questionId: number, questionData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update question:", error);
      throw error;
    }
  },

  async deleteQuestion(questionId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/questions/${questionId}`,
        {
          method: "DELETE",
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
      console.error("Failed to delete question:", error);
      throw error;
    }
  },
};

// Type for question data
interface QuestionData
  extends Record<string, string | number | string[] | null | React.ReactNode> {
  id: number;
  question_text: string;
  question_type: string;
  assessment_id: number;
  options: string[] | null;
  correct_answer: string;
  order: number;
  created_at: string;
  actions: React.ReactNode;
}

const QuestionsPage = () => {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // Dropdown data states
  const [assessments, setAssessments] = useState<any[]>([]);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;

      try {
        const assessmentsRes = await api.getAllAssessments(token);
        setAssessments(assessmentsRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, [token]);

  // Fetch questions from database on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllQuestions(token);

        // Transform data to match our display format
        const transformedQuestions =
          response.data?.map((question: any) => ({
            id: question.id,
            question_text:
              question.question_text || question.questionText || "N/A",
            question_type:
              question.question_type || question.questionType || "N/A",
            assessment_id: question.assessment_id || question.assessmentId || 0,
            options: question.options || null,
            correct_answer:
              question.correct_answer || question.correctAnswer || "N/A",
            order: question.order || 0,
            created_at:
              question.created_at || question.createdAt
                ? new Date(question.created_at || question.createdAt)
                    .toISOString()
                    .split("T")[0]
                : "N/A",
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditQuestion(question)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteQuestion(question.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

        setQuestions(transformedQuestions);
        setFilteredQuestions(transformedQuestions);
        setError("");
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to load questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

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

  const handleCreateQuestion = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Form data received:", formData);

      // Prepare data for API
      const questionData: any = {
        assessmentId: parseInt(formData.assessment_id),
        questionText: formData.question_text,
        questionType: formData.question_type,
        order: parseInt(formData.order),
      };

      // Handle options and correct answer based on question type
      if (formData.question_type === "mcq") {
        questionData.options = formData.options || [];
        questionData.correctAnswer = formData.correct_answer || "";
      } else if (formData.question_type === "true_false") {
        questionData.options = ["True", "False"];
        questionData.correctAnswer = formData.correct_answer || "";
      }

      console.log("Prepared question data:", questionData);
      const response = await api.createQuestion(questionData, token);

      if (response.success) {
        // Refresh the question list
        await refreshQuestionList();
        setError("");
      } else {
        setError(response.message || "Failed to create question");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Failed to create question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuestion = async (formData: any) => {
    if (!token || !selectedQuestion) {
      setError("Authentication required or no question selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const questionData: any = {
        assessmentId: parseInt(formData.assessment_id),
        questionText: formData.question_text,
        questionType: formData.question_type,
        order: parseInt(formData.order),
      };

      // Handle options and correct answer based on question type
      if (formData.question_type === "mcq") {
        questionData.options = formData.options || [];
        questionData.correctAnswer = formData.correct_answer || "";
      } else if (formData.question_type === "true_false") {
        questionData.options = ["True", "False"];
        questionData.correctAnswer = formData.correct_answer || "";
      }

      const response = await api.updateQuestion(
        selectedQuestion.id,
        questionData,
        token
      );

      if (response.success) {
        // Refresh the question list
        await refreshQuestionList();
        setIsEditModalOpen(false);
        setSelectedQuestion(null);
        setError("");
      } else {
        setError(response.message || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      setError("Failed to update question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteQuestion(questionId, token);

      if (response.success) {
        // Refresh the question list
        await refreshQuestionList();
        setError("");
      } else {
        setError(response.message || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      setError("Failed to delete question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsEditModalOpen(true);
  };

  const refreshQuestionList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllQuestions(token);

    const transformedQuestions =
      updatedResponse.data?.map((question: any) => ({
        id: question.id,
        question_text: question.question_text || question.questionText || "N/A",
        question_type: question.question_type || question.questionType || "N/A",
        assessment_id: question.assessment_id || question.assessmentId || 0,
        options: question.options || null,
        correct_answer:
          question.correct_answer || question.correctAnswer || "N/A",
        order: question.order || 0,
        created_at:
          question.created_at || question.createdAt
            ? new Date(question.created_at || question.createdAt)
                .toISOString()
                .split("T")[0]
            : "N/A",
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditQuestion(question)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteQuestion(question.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

    setQuestions(transformedQuestions);
    setFilteredQuestions(transformedQuestions);
  };

  const CreateQuestionForm = () => {
    const [formData, setFormData] = useState({
      assessment_id: "",
      question_text: "",
      question_type: "mcq",
      options: [] as string[],
      correct_answer: "",
      order: "",
    });

    const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);

    const handleMcqOptionChange = (index: number, value: string) => {
      const newOptions = [...mcqOptions];
      newOptions[index] = value;
      setMcqOptions(newOptions);
      setFormData({
        ...formData,
        options: newOptions.filter((opt) => opt.trim() !== ""),
      });
    };

    const addMcqOption = () => {
      setMcqOptions([...mcqOptions, ""]);
    };

    const removeMcqOption = (index: number) => {
      if (mcqOptions.length > 2) {
        const newOptions = mcqOptions.filter((_, i) => i !== index);
        setMcqOptions(newOptions);
        setFormData({
          ...formData,
          options: newOptions.filter((opt) => opt.trim() !== ""),
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateQuestion(formData);
      setFormData({
        assessment_id: "",
        question_text: "",
        question_type: "mcq",
        options: [],
        correct_answer: "",
        order: "",
      });
      setMcqOptions(["", "", "", ""]);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assessment_id">Assessment *</Label>
          <Select
            value={formData.assessment_id}
            onValueChange={(value) =>
              setFormData({ ...formData, assessment_id: value })
            }
            required
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="Select assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem
                  key={assessment.id}
                  value={assessment.id.toString()}
                >
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question_text">Question Text *</Label>
          <Input
            id="question_text"
            value={formData.question_text}
            onChange={(e) =>
              setFormData({ ...formData, question_text: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question_type">Question Type *</Label>
          <Select
            value={formData.question_type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                question_type: value,
                correct_answer: "",
              })
            }
            required
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
              <SelectItem value="true_false">True or False</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.question_type === "mcq" && (
          <div className="space-y-2">
            <Label>MCQ Options *</Label>
            {mcqOptions.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option}
                  onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="rounded-full"
                />
                {mcqOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMcqOption(index)}
                    className="rounded-full"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addMcqOption}
              className="rounded-full"
            >
              Add Option
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          {formData.question_type === "mcq" ? (
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_answer: value })
              }
            >
              {mcqOptions
                .filter((opt) => opt.trim() !== "")
                .map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`mcq-${index}`} />
                    <Label htmlFor={`mcq-${index}`}>{option}</Label>
                  </div>
                ))}
            </RadioGroup>
          ) : formData.question_type === "true_false" ? (
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_answer: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Question"}
          </Button>
        </div>
      </form>
    );
  };

  const EditQuestionForm = () => {
    const [formData, setFormData] = useState({
      assessment_id: selectedQuestion?.assessmentId?.toString() || "",
      question_text: selectedQuestion?.questionText || "",
      question_type: selectedQuestion?.questionType || "mcq",
      options: selectedQuestion?.options || [],
      correct_answer: selectedQuestion?.correctAnswer || "",
      order: selectedQuestion?.order?.toString() || "",
    });

    const [mcqOptions, setMcqOptions] = useState(
      selectedQuestion?.questionType === "mcq" && selectedQuestion?.options
        ? [...selectedQuestion.options, "", ""].slice(0, 4)
        : ["", "", "", ""]
    );

    const handleMcqOptionChange = (index: number, value: string) => {
      const newOptions = [...mcqOptions];
      newOptions[index] = value;
      setMcqOptions(newOptions);
      setFormData({
        ...formData,
        options: newOptions.filter((opt) => opt.trim() !== ""),
      });
    };

    const addMcqOption = () => {
      setMcqOptions([...mcqOptions, ""]);
    };

    const removeMcqOption = (index: number) => {
      if (mcqOptions.length > 2) {
        const newOptions = mcqOptions.filter((_, i) => i !== index);
        setMcqOptions(newOptions);
        setFormData({
          ...formData,
          options: newOptions.filter((opt) => opt.trim() !== ""),
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateQuestion(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_assessment_id">Assessment *</Label>
          <Select
            value={formData.assessment_id}
            onValueChange={(value) =>
              setFormData({ ...formData, assessment_id: value })
            }
            required
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="Select assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem
                  key={assessment.id}
                  value={assessment.id.toString()}
                >
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_question_text">Question Text *</Label>
          <Input
            id="edit_question_text"
            value={formData.question_text}
            onChange={(e) =>
              setFormData({ ...formData, question_text: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_question_type">Question Type *</Label>
          <Select
            value={formData.question_type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                question_type: value,
                correct_answer: "",
              })
            }
            required
          >
            <SelectTrigger className="rounded-full">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
              <SelectItem value="true_false">True or False</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.question_type === "mcq" && (
          <div className="space-y-2">
            <Label>MCQ Options *</Label>
            {mcqOptions.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option}
                  onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="rounded-full"
                />
                {mcqOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMcqOption(index)}
                    className="rounded-full"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addMcqOption}
              className="rounded-full"
            >
              Add Option
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          {formData.question_type === "mcq" ? (
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_answer: value })
              }
            >
              {mcqOptions
                .filter((opt) => opt.trim() !== "")
                .map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`edit-mcq-${index}`} />
                    <Label htmlFor={`edit-mcq-${index}`}>{option}</Label>
                  </div>
                ))}
            </RadioGroup>
          ) : formData.question_type === "true_false" ? (
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_answer: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id="edit-true" />
                <Label htmlFor="edit-true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id="edit-false" />
                <Label htmlFor="edit-false">False</Label>
              </div>
            </RadioGroup>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_order">Order *</Label>
          <Input
            id="edit_order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="rounded-full"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(false);
              setSelectedQuestion(null);
            }}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Question"}
          </Button>
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
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search questions..."
        createButtonText="Create Question"
        createForm={<CreateQuestionForm />}
        tableData={filteredQuestions}
        columns={columns}
        onSearch={handleSearch}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Question</DialogTitle>
          </DialogHeader>
          <EditQuestionForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default QuestionsPage;
