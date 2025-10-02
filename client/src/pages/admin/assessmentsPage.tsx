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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AdminPageLayout from "@/pages/admin/adminPageLayout";
import AdminTableLayout from "@/components/adminTableLayout";
import { useAuth } from "@/hooks/useAuth";
import { MoreVert, Edit, Delete, Close, Quiz } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API object for assessment operations
const api = {
  async getAllTrainingAreas(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/training-areas`, {
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
      console.error("Failed to fetch training areas:", error);
      throw error;
    }
  },

  async getAllModules(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/modules`, {
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
      console.error("Failed to fetch modules:", error);
      throw error;
    }
  },

  async getAllCourses(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/courses`, {
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
      console.error("Failed to fetch courses:", error);
      throw error;
    }
  },

  async getAllUnits(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/units`, {
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
      console.error("Failed to fetch units:", error);
      throw error;
    }
  },

  async getAllAssessments(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
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

  async createAssessment(assessmentData: any, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log("Creating assessment with data:", assessmentData);
      console.log("Using token:", token ? "Token present" : "No token");

      const response = await fetch(`${baseUrl}/api/assessments/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assessmentData),
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
      console.error("Failed to create assessment:", error);
      throw error;
    }
  },

  async updateAssessment(
    assessmentId: number,
    assessmentData: any,
    token: string
  ) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/assessments/${assessmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assessmentData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to update assessment:", error);
      throw error;
    }
  },

  async deleteAssessment(assessmentId: number, token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/assessments/assessments/${assessmentId}`,
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
      console.error("Failed to delete assessment:", error);
      throw error;
    }
  },

  // Questions API functions
  async getAllQuestions(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/assessments/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      const baseUrl = import.meta.env.VITE_API_URL;
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
      const baseUrl = import.meta.env.VITE_API_URL;
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

// Type for assessment data
interface AssessmentData
  extends Record<string, string | number | boolean | null | React.ReactNode> {
  id: number;
  title: string;
  placement: string;
  passing_score: number;
  unit_name: string;
  course_name: string;
  module_name: string;
  training_area_name: string;
  actions: React.ReactNode;
}

// Type for question data
interface QuestionData
  extends Record<string, string | number | string[] | null | React.ReactNode> {
  id: number;
  question_type: string;
  question_text: string;
  correct_answer: string;
  order: number;
  actions: React.ReactNode;
}

const AssessmentsPage = () => {
  const { token } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<
    AssessmentData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Questions state
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>(
    []
  );
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // Dropdown data states
  const [trainingAreas, setTrainingAreas] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!token) return;

      try {
        const [trainingAreasRes, modulesRes, coursesRes, unitsRes] =
          await Promise.all([
            api.getAllTrainingAreas(token),
            api.getAllModules(token),
            api.getAllCourses(token),
            api.getAllUnits(token),
          ]);

        setTrainingAreas(trainingAreasRes.data || []);
        setModules(modulesRes.data || []);
        setCourses(coursesRes.data || []);
        setUnits(unitsRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, [token]);

  // Fetch assessments from database on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getAllAssessments(token);

        // Transform data to match our display format
        const transformedAssessments =
          response.data?.map((assessment: any) => {
            // Find related entities
            const trainingArea = trainingAreas.find(
              (ta: any) => ta.id === assessment.trainingAreaId
            );
            const module = modules.find(
              (m: any) => m.id === assessment.moduleId
            );
            const course = courses.find(
              (c: any) => c.id === assessment.courseId
            );
            const unit = units.find((u: any) => u.id === assessment.unitId);

            return {
              id: assessment.id,
              title: assessment.title,
              placement: assessment.placement || "N/A",
              passing_score:
                assessment.passing_score || assessment.passingScore || 0,
              unitId: assessment.unitId, // Keep for filtering
              courseId: assessment.courseId, // Keep for filtering
              moduleId: assessment.moduleId, // Keep for filtering
              trainingAreaId: assessment.trainingAreaId, // Keep for filtering
              actions: (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                    onClick={() => handleEditAssessment(assessment)}
                    title="Edit"
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-blue-400 hover:bg-blue-400/10"
                    onClick={() => handleOpenQuestionsModal(assessment)}
                    title="Questions"
                  >
                    <Quiz sx={{ fontSize: 16 }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteAssessment(assessment.id)}
                    title="Delete"
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </Button>
                </div>
              ),
            };
          }) || [];

        setAssessments(transformedAssessments);
        setFilteredAssessments(transformedAssessments);
        setError("");
      } catch (error) {
        console.error("Error fetching assessments:", error);
        setError("Failed to load assessments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [token]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredAssessments(assessments);
    } else {
      const filtered = assessments.filter(
        (assessment) =>
          assessment.id.toString().includes(query) ||
          assessment.title.toLowerCase().includes(query.toLowerCase()) ||
          assessment.placement.toLowerCase().includes(query.toLowerCase()) ||
          assessment.passing_score.toString().includes(query)
      );
      setFilteredAssessments(filtered);
    }
  };

  const handleCreateAssessment = async (formData: any) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Form data received:", formData);

      // Prepare data for API
      const assessmentData: any = {
        trainingAreaId: parseInt(formData.training_area_id),
        title: formData.title,
        description: formData.description || null,
        placement: formData.placement || "end",
        isGraded: formData.is_graded,
        showCorrectAnswers: formData.show_correct_answers,
        hasTimeLimit: formData.has_time_limit,
        maxRetakes: parseInt(formData.max_retakes) || 3,
        hasCertificate: formData.has_certificate,
        xpPoints: parseInt(formData.xp_points) || 50,
      };

      // Only add optional fields if they have values
      if (formData.module_id) {
        assessmentData.moduleId = parseInt(formData.module_id);
      }
      if (formData.unit_id) {
        assessmentData.unitId = parseInt(formData.unit_id);
      }
      if (formData.course_id) {
        assessmentData.courseId = parseInt(formData.course_id);
      }
      if (formData.passing_score) {
        assessmentData.passingScore = parseInt(formData.passing_score);
      }
      if (formData.time_limit && formData.has_time_limit) {
        assessmentData.timeLimit = parseInt(formData.time_limit);
      }
      if (formData.certificate_template && formData.has_certificate) {
        assessmentData.certificateTemplate = formData.certificate_template;
      }

      console.log("Prepared assessment data:", assessmentData);
      const response = await api.createAssessment(assessmentData, token);

      if (response.success) {
        // Refresh the assessment list
        await refreshAssessmentList();
        setError("");
        setSuccessMessage("Assessment created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.message || "Failed to create assessment");
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      setError("Failed to create assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAssessment = async (formData: any) => {
    if (!token || !selectedAssessment) {
      setError("Authentication required or no assessment selected");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const assessmentData: any = {
        trainingAreaId: parseInt(formData.training_area_id),
        title: formData.title,
        description: formData.description || null,
        placement: formData.placement || "end",
        isGraded: formData.is_graded,
        showCorrectAnswers: formData.show_correct_answers,
        hasTimeLimit: formData.has_time_limit,
        maxRetakes: parseInt(formData.max_retakes) || 3,
        hasCertificate: formData.has_certificate,
        xpPoints: parseInt(formData.xp_points) || 50,
      };

      // Only add optional fields if they have values
      if (formData.module_id) {
        assessmentData.moduleId = parseInt(formData.module_id);
      }
      if (formData.unit_id) {
        assessmentData.unitId = parseInt(formData.unit_id);
      }
      if (formData.course_id) {
        assessmentData.courseId = parseInt(formData.course_id);
      }
      if (formData.passing_score) {
        assessmentData.passingScore = parseInt(formData.passing_score);
      }
      if (formData.time_limit && formData.has_time_limit) {
        assessmentData.timeLimit = parseInt(formData.time_limit);
      }
      if (formData.certificate_template && formData.has_certificate) {
        assessmentData.certificateTemplate = formData.certificate_template;
      }

      const response = await api.updateAssessment(
        selectedAssessment.id,
        assessmentData,
        token
      );

      if (response.success) {
        // Refresh the assessment list
        await refreshAssessmentList();
        setIsEditModalOpen(false);
        setSelectedAssessment(null);
        setError("");
        setSuccessMessage("Assessment updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.message || "Failed to update assessment");
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
      setError("Failed to update assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.deleteAssessment(assessmentId, token);

      if (response.success) {
        // Refresh the assessment list
        await refreshAssessmentList();
        setError("");
      } else {
        setError(response.message || "Failed to delete assessment");
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setError("Failed to delete assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsEditModalOpen(true);
  };

  // Questions handlers
  const handleOpenQuestionsModal = async (assessment: any) => {
    setSelectedAssessment(assessment);
    setIsQuestionsModalOpen(true);
    await fetchQuestionsForAssessment(assessment.id);
  };

  const fetchQuestionsForAssessment = async (assessmentId: number) => {
    if (!token) return;

    try {
      const response = await api.getAllQuestions(token);
      const assessmentQuestions =
        response.data?.filter(
          (question: any) =>
            question.assessmentId === assessmentId ||
            question.assessment_id === assessmentId
        ) || [];

      const transformedQuestions = assessmentQuestions.map((question: any) => ({
        id: question.id,
        question_type: question.question_type || question.questionType || "N/A",
        question_text: question.questionText || question.question_text || "N/A",
        correct_answer:
          question.correct_answer || question.correctAnswer || "N/A",
        order: question.order || 1,
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditQuestion(question)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteQuestion(question.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      }));

      setQuestions(transformedQuestions);
      setFilteredQuestions(transformedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again.");
    }
  };

  const handleCreateQuestion = async (formData: any) => {
    if (!token || !selectedAssessment) {
      setError("Authentication required or no assessment selected");
      return;
    }

    try {
      setIsLoading(true);

      const questionData: any = {
        assessmentId: selectedAssessment.id,
        questionText: formData.question_text,
        questionType: formData.question_type,
        order: parseInt(formData.order),
      };

      if (formData.question_type === "mcq") {
        questionData.options = formData.options || [];
        questionData.correctAnswer = formData.correct_answer || "";
      } else if (formData.question_type === "true_false") {
        questionData.options = ["True", "False"];
        questionData.correctAnswer = formData.correct_answer || "";
      }

      const response = await api.createQuestion(questionData, token);

      if (response.success) {
        await fetchQuestionsForAssessment(selectedAssessment.id);
        setError("");
        setSuccessMessage("Question created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
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

      const questionData: any = {
        assessmentId: selectedAssessment.id,
        questionText: formData.question_text,
        questionType: formData.question_type,
        order: parseInt(formData.order),
      };

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
        await fetchQuestionsForAssessment(selectedAssessment.id);
        setIsEditQuestionModalOpen(false);
        setSelectedQuestion(null);
        setError("");
        setSuccessMessage("Question updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
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
        await fetchQuestionsForAssessment(selectedAssessment.id);
        setError("");
        setSuccessMessage("Question deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
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
    setIsEditQuestionModalOpen(true);
  };

  const refreshAssessmentList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllAssessments(token);

    const transformedAssessments =
      updatedResponse.data?.map((assessment: any) => {
        // Find related entities
        const trainingArea = trainingAreas.find(
          (ta: any) => ta.id === assessment.trainingAreaId
        );
        const module = modules.find((m: any) => m.id === assessment.moduleId);
        const course = courses.find((c: any) => c.id === assessment.courseId);
        const unit = units.find((u: any) => u.id === assessment.unitId);

        return {
          id: assessment.id,
          title: assessment.title,
          placement: assessment.placement || "N/A",
          passing_score:
            assessment.passing_score || assessment.passingScore || 0,
          unitId: assessment.unitId, // Keep for filtering
          courseId: assessment.courseId, // Keep for filtering
          moduleId: assessment.moduleId, // Keep for filtering
          trainingAreaId: assessment.trainingAreaId, // Keep for filtering
          actions: (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                onClick={() => handleEditAssessment(assessment)}
                title="Edit"
              >
                <Edit sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#2C2C2C] hover:text-red-400 hover:bg-red-400/10"
                onClick={() => handleDeleteAssessment(assessment.id)}
                title="Delete"
              >
                <Delete sx={{ fontSize: 16 }} />
              </Button>
            </div>
          ),
        };
      }) || [];

    setAssessments(transformedAssessments);
    setFilteredAssessments(transformedAssessments);
  };

  const CreateAssessmentForm = () => {
    const [formData, setFormData] = useState({
      training_area_id: "",
      module_id: "",
      unit_id: "",
      course_id: "",
      title: "",
      description: "",
      placement: "end",
      is_graded: true,
      show_correct_answers: false,
      passing_score: "",
      has_time_limit: false,
      time_limit: "",
      max_retakes: "3",
      has_certificate: false,
      certificate_template: "",
      xp_points: "50",
    });
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);

    // Filter modules based on selected training area
    useEffect(() => {
      if (formData.training_area_id) {
        const filtered = modules.filter(
          (module) =>
            module.trainingAreaId === parseInt(formData.training_area_id)
        );
        setFilteredModules(filtered);
        // Reset module, course, and unit selections
        setFormData((prev) => ({
          ...prev,
          module_id: "",
          course_id: "",
          unit_id: "",
        }));
      } else {
        setFilteredModules([]);
        setFormData((prev) => ({
          ...prev,
          module_id: "",
          course_id: "",
          unit_id: "",
        }));
      }
    }, [formData.training_area_id, modules]);

    // Filter courses based on selected module
    useEffect(() => {
      if (formData.module_id) {
        const filtered = courses.filter(
          (course) => course.moduleId === parseInt(formData.module_id)
        );
        setFilteredCourses(filtered);
        // Reset course and unit selections
        setFormData((prev) => ({ ...prev, course_id: "", unit_id: "" }));
      } else {
        setFilteredCourses([]);
        setFormData((prev) => ({ ...prev, course_id: "", unit_id: "" }));
      }
    }, [formData.module_id, courses]);

    // Filter units based on selected course
    useEffect(() => {
      if (formData.course_id) {
        // Get course-units for the selected course
        const fetchCourseUnits = async () => {
          try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(
              `${baseUrl}/api/training/course-units/course/${formData.course_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const courseUnitsData = await response.json();
              const unitIds =
                courseUnitsData.data?.map((cu: any) => cu.unitId) || [];
              const filtered = units.filter((unit) =>
                unitIds.includes(unit.id)
              );
              setFilteredUnits(filtered);
            } else {
              setFilteredUnits([]);
            }
          } catch (error) {
            console.error("Error fetching course units:", error);
            setFilteredUnits([]);
          }
        };

        fetchCourseUnits();
        // Reset unit selection
        setFormData((prev) => ({ ...prev, unit_id: "" }));
      } else {
        setFilteredUnits([]);
        setFormData((prev) => ({ ...prev, unit_id: "" }));
      }
    }, [formData.course_id, units, token]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleCreateAssessment(formData);
      setFormData({
        training_area_id: "",
        module_id: "",
        unit_id: "",
        course_id: "",
        title: "",
        description: "",
        placement: "end",
        is_graded: true,
        show_correct_answers: false,
        passing_score: "",
        has_time_limit: false,
        time_limit: "",
        max_retakes: "3",
        has_certificate: false,
        certificate_template: "",
        xp_points: "50",
      });
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Type your Assessment Title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Add a description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_area_id">Training Area *</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                setFormData({ ...formData, training_area_id: value })
              }
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select training area" />
              </SelectTrigger>
              <SelectContent>
                {trainingAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module_id">Module *</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) =>
                setFormData({ ...formData, module_id: value })
              }
              disabled={!formData.training_area_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {filteredModules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_id">Course *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) =>
                setFormData({ ...formData, course_id: value })
              }
              disabled={!formData.module_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_id">Unit *</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) =>
                setFormData({ ...formData, unit_id: value })
              }
              disabled={!formData.course_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement">Placement *</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) =>
                setFormData({ ...formData, placement: value })
              }
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_graded"
                checked={formData.is_graded}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_graded: checked })
                }
              />
              <Label htmlFor="is_graded">Is Graded</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show_correct_answers"
                checked={formData.show_correct_answers}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_correct_answers: checked })
                }
              />
              <Label htmlFor="show_correct_answers">Show Correct Answers</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has_time_limit"
                checked={formData.has_time_limit}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, has_time_limit: checked })
                }
              />
              <Label htmlFor="has_time_limit">Has Time Limit</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has_certificate"
                checked={formData.has_certificate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, has_certificate: checked })
                }
              />
              <Label htmlFor="has_certificate">Has Certificate</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passing_score">Passing Score (%)</Label>
              <Input
                id="passing_score"
                type="number"
                min="0"
                max="100"
                value={formData.passing_score}
                onChange={(e) =>
                  setFormData({ ...formData, passing_score: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Add a passing score out of 100"
                disabled={!formData.is_graded}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_limit">Time Limit (minutes)</Label>
              <Input
                id="time_limit"
                type="number"
                min="1"
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({ ...formData, time_limit: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Add time limit in minutes"
                disabled={!formData.has_time_limit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_retakes">Max Retakes</Label>
              <Input
                id="max_retakes"
                type="number"
                min="0"
                value={formData.max_retakes}
                onChange={(e) =>
                  setFormData({ ...formData, max_retakes: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp_points">VX Points</Label>
              <Input
                id="xp_points"
                type="number"
                min="0"
                value={formData.xp_points}
                onChange={(e) =>
                  setFormData({ ...formData, xp_points: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              />
            </div>
          </div>

          {formData.has_certificate && (
            <div className="space-y-2">
              <Label htmlFor="certificate_template">Certificate Template</Label>
              <Input
                id="certificate_template"
                value={formData.certificate_template}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    certificate_template: e.target.value,
                  })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Paste certificate template URL"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Questions Forms
  const CreateQuestionForm = () => {
    const [formData, setFormData] = useState({
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
        question_text: "",
        question_type: "mcq",
        options: [],
        correct_answer: "",
        order: "",
      });
      setMcqOptions(["", "", "", ""]);
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text *</Label>
            <Input
              id="question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Type your question text"
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
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
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
                    onChange={(e) =>
                      handleMcqOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                  />
                  {mcqOptions.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMcqOption(index)}
                      className="rounded-full hover:bg-accent/30 hover:text-black"
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
                className="rounded-full hover:bg-accent/30 hover:text-black"
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
            <Label htmlFor="order">Order in Assessment *</Label>
            <Input
              id="order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Add order in assessment"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Creating..." : "Create Question"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditQuestionForm = () => {
    const [formData, setFormData] = useState({
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
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_question_text">Question Text *</Label>
            <Input
              id="edit_question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Type your question text"
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
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
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
                    onChange={(e) =>
                      handleMcqOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                  />
                  {mcqOptions.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMcqOption(index)}
                      className="rounded-full hover:bg-accent/30 hover:text-black"
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
                className="rounded-full hover:bg-accent/30 hover:text-black"
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
            <Label htmlFor="edit_order">Order in Assessment *</Label>
            <Input
              id="edit_order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Add order in assessment"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditQuestionModalOpen(false);
                setSelectedQuestion(null);
              }}
              className="rounded-full hover:bg-accent/30 hover:text-black"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Question"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const EditAssessmentForm = () => {
    const [formData, setFormData] = useState({
      training_area_id: selectedAssessment?.trainingAreaId?.toString() || "",
      module_id: selectedAssessment?.moduleId?.toString() || "",
      unit_id: selectedAssessment?.unitId?.toString() || "",
      course_id: selectedAssessment?.courseId?.toString() || "",
      title: selectedAssessment?.title || "",
      description: selectedAssessment?.description || "",
      placement: selectedAssessment?.placement || "end",
      is_graded: selectedAssessment?.isGraded ?? true,
      show_correct_answers: selectedAssessment?.showCorrectAnswers ?? false,
      passing_score: selectedAssessment?.passingScore?.toString() || "",
      has_time_limit: selectedAssessment?.hasTimeLimit ?? false,
      time_limit: selectedAssessment?.timeLimit?.toString(),
      max_retakes: selectedAssessment?.maxRetakes?.toString() || "3",
      has_certificate: selectedAssessment?.hasCertificate ?? false,
      certificate_template: selectedAssessment?.certificateTemplate || "",
      xp_points: selectedAssessment?.xpPoints?.toString() || "50",
    });
    const [filteredModules, setFilteredModules] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<any[]>([]);

    // Filter modules based on selected training area
    useEffect(() => {
      if (formData.training_area_id) {
        const filtered = modules.filter(
          (module) =>
            module.trainingAreaId === parseInt(formData.training_area_id)
        );
        setFilteredModules(filtered);
      } else {
        setFilteredModules([]);
      }
    }, [formData.training_area_id, modules]);

    // Filter courses based on selected module
    useEffect(() => {
      if (formData.module_id) {
        const filtered = courses.filter(
          (course) => course.moduleId === parseInt(formData.module_id)
        );
        setFilteredCourses(filtered);
      } else {
        setFilteredCourses([]);
      }
    }, [formData.module_id, courses]);

    // Filter units based on selected course
    useEffect(() => {
      if (formData.course_id) {
        // Get course-units for the selected course
        const fetchCourseUnits = async () => {
          try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(
              `${baseUrl}/api/training/course-units/course/${formData.course_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const courseUnitsData = await response.json();
              const unitIds =
                courseUnitsData.data?.map((cu: any) => cu.unitId) || [];
              const filtered = units.filter((unit) =>
                unitIds.includes(unit.id)
              );
              setFilteredUnits(filtered);
            } else {
              setFilteredUnits([]);
            }
          } catch (error) {
            console.error("Error fetching course units:", error);
            setFilteredUnits([]);
          }
        };

        fetchCourseUnits();
      } else {
        setFilteredUnits([]);
      }
    }, [formData.course_id, units, token]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateAssessment(formData);
    };

    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">Assessment Title *</Label>
            <Input
              id="edit_title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Type your Assessment Title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              placeholder="Add a description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_training_area_id">Training Area *</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                setFormData({ ...formData, training_area_id: value })
              }
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select training area" />
              </SelectTrigger>
              <SelectContent>
                {trainingAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_module_id">Module *</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) =>
                setFormData({ ...formData, module_id: value })
              }
              disabled={!formData.training_area_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {filteredModules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_course_id">Course *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) =>
                setFormData({ ...formData, course_id: value })
              }
              disabled={!formData.module_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_unit_id">Unit *</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) =>
                setFormData({ ...formData, unit_id: value })
              }
              disabled={!formData.course_id}
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_placement">Placement *</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) =>
                setFormData({ ...formData, placement: value })
              }
              required
            >
              <SelectTrigger className="w-full bg-white border-2 border-sandstone text-[#2C2C2C] focus:border-dawn hover:border-dawn transition-all duration-300 py-4 lg:py-5 text-base rounded-full">
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="middle">Middle</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_graded"
                checked={formData.is_graded}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_graded: checked })
                }
              />
              <Label htmlFor="edit_is_graded">Is Graded</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_show_correct_answers"
                checked={formData.show_correct_answers}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_correct_answers: checked })
                }
              />
              <Label htmlFor="edit_show_correct_answers">
                Show Correct Answers
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_has_time_limit"
                checked={formData.has_time_limit}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, has_time_limit: checked })
                }
              />
              <Label htmlFor="edit_has_time_limit">Has Time Limit</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_has_certificate"
                checked={formData.has_certificate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, has_certificate: checked })
                }
              />
              <Label htmlFor="edit_has_certificate">Has Certificate</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_passing_score">Passing Score (%)</Label>
              <Input
                id="edit_passing_score"
                type="number"
                min="0"
                max="100"
                value={formData.passing_score}
                onChange={(e) =>
                  setFormData({ ...formData, passing_score: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Add a passing score out of 100"
                disabled={!formData.is_graded}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_time_limit">Time Limit (minutes)</Label>
              <Input
                id="edit_time_limit"
                type="number"
                min="1"
                value={formData.time_limit}
                onChange={(e) =>
                  setFormData({ ...formData, time_limit: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Add time limit in minutes"
                disabled={!formData.has_time_limit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_max_retakes">Max Retakes</Label>
              <Input
                id="edit_max_retakes"
                type="number"
                min="0"
                value={formData.max_retakes}
                onChange={(e) =>
                  setFormData({ ...formData, max_retakes: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_xp_points">VX Points</Label>
              <Input
                id="edit_xp_points"
                type="number"
                min="0"
                value={formData.xp_points}
                onChange={(e) =>
                  setFormData({ ...formData, xp_points: e.target.value })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
              />
            </div>
          </div>

          {formData.has_certificate && (
            <div className="space-y-2">
              <Label htmlFor="edit_certificate_template">
                Certificate Template
              </Label>
              <Input
                id="edit_certificate_template"
                value={formData.certificate_template}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    certificate_template: e.target.value,
                  })
                }
                className="bg-white border-sandstone text-[#2C2C2C] placeholder:text-[#666666] focus:bg-white focus:border-dawn transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-dawn rounded-full"
                placeholder="Paste certificate template URL"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedAssessment(null);
              }}
              className="rounded-full hover:bg-accent/30 hover:text-black"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? "Updating..." : "Update Assessment"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const columns = [
    "ID",
    "Assessment",
    "Placement",
    "Passing Score",
    "Learning Unit",
    "Course",
    "Module",
    "Training Area",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Assessments"
      description="Manage your Assessments and Quizzes"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <AdminTableLayout
        searchPlaceholder="Search by ID, title, placement, or passing score..."
        createButtonText="Create Assessment"
        createForm={<CreateAssessmentForm />}
        tableData={filteredAssessments}
        columns={columns}
        onSearch={handleSearch}
        enableColumnFiltering={true}
        columnFilterConfig={{
          trainingAreaId: "trainingAreaId",
          moduleId: "moduleId",
          courseId: "courseId",
          unitId: "unitId",
        }}
        dropdownConfig={{
          showTrainingArea: true,
          showModule: true,
          showCourse: true,
          showUnit: true,
        }}
      />

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl bg-sandstone border-white/20 text-[#2C2C2C] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              Edit Assessment
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsEditModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            <EditAssessmentForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Questions Modal */}
      <Dialog
        open={isQuestionsModalOpen}
        onOpenChange={setIsQuestionsModalOpen}
      >
        <DialogContent className="max-w-6xl bg-sandstone border-white/20 text-[#2C2C2C] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              Questions for: {selectedAssessment?.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsQuestionsModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button
                onClick={() => {
                  setSelectedQuestion(null);
                  setIsEditQuestionModalOpen(true);
                }}
                className="rounded-full"
              >
                Add Question
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Question Type</th>
                    <th className="text-left p-2">Question Text</th>
                    <th className="text-left p-2">Correct Answer</th>
                    <th className="text-left p-2">Order</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className="border-b border-white/10">
                      <td className="p-2">{question.id}</td>
                      <td className="p-2">{question.question_type}</td>
                      <td className="p-2 max-w-xs truncate">
                        {question.question_text}
                      </td>
                      <td className="p-2">{question.correct_answer}</td>
                      <td className="p-2">{question.order}</td>
                      <td className="p-2">{question.actions}</td>
                    </tr>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">
                        No questions found for this assessment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Modal */}
      <Dialog
        open={isEditQuestionModalOpen}
        onOpenChange={setIsEditQuestionModalOpen}
      >
        <DialogContent className="max-w-2xl bg-sandstone border-white/20 text-[#2C2C2C] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2C2C2C]">
              {selectedQuestion ? "Edit Question" : "Create Question"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-[#2C2C2C] hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => setIsEditQuestionModalOpen(false)}
            >
              <Close sx={{ fontSize: 16 }} />
            </Button>
          </DialogHeader>
          <div className="mt-4">
            {selectedQuestion ? <EditQuestionForm /> : <CreateQuestionForm />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AssessmentsPage;
