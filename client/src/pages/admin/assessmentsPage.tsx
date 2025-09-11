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
};

// Type for assessment data
interface AssessmentData
  extends Record<string, string | number | boolean | null | React.ReactNode> {
  id: number;
  title: string;
  placement: string;
  passing_score: number;
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
          response.data?.map((assessment: any) => ({
            id: assessment.id,
            title: assessment.title,
            placement: assessment.placement || "N/A",
            passing_score:
              assessment.passing_score || assessment.passingScore || 0,
            trainingAreaId: assessment.trainingAreaId, // Keep for filtering
            moduleId: assessment.moduleId, // Keep for filtering
            courseId: assessment.courseId, // Keep for filtering
            unitId: assessment.unitId, // Keep for filtering
            actions: (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
                  onClick={() => handleEditAssessment(assessment)}
                  title="Edit"
                >
                  <Edit sx={{ fontSize: 16 }} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDeleteAssessment(assessment.id)}
                  title="Delete"
                >
                  <Delete sx={{ fontSize: 16 }} />
                </Button>
              </div>
            ),
          })) || [];

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

  const refreshAssessmentList = async () => {
    if (!token) return;
    const updatedResponse = await api.getAllAssessments(token);

    const transformedAssessments =
      updatedResponse.data?.map((assessment: any) => ({
        id: assessment.id,
        title: assessment.title,
        placement: assessment.placement || "N/A",
        passing_score: assessment.passing_score || assessment.passingScore || 0,
        trainingAreaId: assessment.trainingAreaId, // Keep for filtering
        moduleId: assessment.moduleId, // Keep for filtering
        courseId: assessment.courseId, // Keep for filtering
        unitId: assessment.unitId, // Keep for filtering
        actions: (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-[#00d8cc] hover:bg-[#00d8cc]/10"
              onClick={() => handleEditAssessment(assessment)}
              title="Edit"
            >
              <Edit sx={{ fontSize: 16 }} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-red-400 hover:bg-red-400/10"
              onClick={() => handleDeleteAssessment(assessment.id)}
              title="Delete"
            >
              <Delete sx={{ fontSize: 16 }} />
            </Button>
          </div>
        ),
      })) || [];

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="training_area_id">Training Area *</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                setFormData({ ...formData, training_area_id: value })
              }
              required
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
            <Label htmlFor="module_id">Module</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) =>
                setFormData({ ...formData, module_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_id">Unit</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) =>
                setFormData({ ...formData, unit_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_id">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) =>
                setFormData({ ...formData, course_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
          />
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
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xp_points">XP Points</Label>
            <Input
              id="xp_points"
              type="number"
              min="0"
              value={formData.xp_points}
              onChange={(e) =>
                setFormData({ ...formData, xp_points: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Creating..." : "Create Assessment"}
          </Button>
        </div>
      </form>
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

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdateAssessment(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit_training_area_id">Training Area *</Label>
            <Select
              value={formData.training_area_id}
              onValueChange={(value) =>
                setFormData({ ...formData, training_area_id: value })
              }
              required
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
            <Label htmlFor="edit_module_id">Module</Label>
            <Select
              value={formData.module_id}
              onValueChange={(value) =>
                setFormData({ ...formData, module_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id.toString()}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_unit_id">Unit</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) =>
                setFormData({ ...formData, unit_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_course_id">Course</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) =>
                setFormData({ ...formData, course_id: value })
              }
            >
              <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit_title">Title *</Label>
          <Input
            id="edit_title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
          />
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
            <SelectTrigger className="rounded-full w-full bg-[#00d8cc]/30">
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
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_xp_points">XP Points</Label>
            <Input
              id="edit_xp_points"
              type="number"
              min="0"
              value={formData.xp_points}
              onChange={(e) =>
                setFormData({ ...formData, xp_points: e.target.value })
              }
              className="rounded-full bg-[#00d8cc]/30"
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
              className="rounded-full bg-[#00d8cc]/30"
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
            className="rounded-full bg-[#00d8cc]/30"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            {isLoading ? "Updating..." : "Update Assessment"}
          </Button>
        </div>
      </form>
    );
  };

  const columns = [
    "ID",
    "Title",
    "Placement",
    "Passing Score",
    "Training Area ID",
    "Module ID",
    "Course ID",
    "Unit ID",
    "Actions",
  ];

  return (
    <AdminPageLayout
      title="Assessments"
      description="Manage assessments, quizzes, and evaluation tools"
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
        <DialogContent className="max-w-4xl bg-[#003451] border-white/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Assessment</DialogTitle>
          </DialogHeader>
          <EditAssessmentForm />
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default AssessmentsPage;
