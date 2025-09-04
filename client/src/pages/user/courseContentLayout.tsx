import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MenuBook as BookOpen,
  CheckCircle,
  PlayCircle,
  HelpOutline,
  Description,
  School,
  Article as Summary,
} from "@mui/icons-material";

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
}

const CourseContentLayout: React.FC<CourseContentLayoutProps> = ({ units }) => {
  const navigate = useNavigate();

  // State for selected content
  const [selectedContent, setSelectedContent] = useState<{
    type: "learningBlock" | "assessment";
    id: number;
    title: string;
    content: string;
    assessment?: Assessment;
  } | null>(null);

  // Set initial selected content to first learning block
  React.useEffect(() => {
    if (units.length > 0 && units[0].learningBlocks.length > 0) {
      const firstBlock = units[0].learningBlocks[0];
      setSelectedContent({
        type: "learningBlock",
        id: firstBlock.id,
        title: firstBlock.title,
        content: firstBlock.content,
      });
    }
  }, [units]);

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
      default:
        return <BookOpen className="w-4 h-4" />;
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
                    {unit.learningBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                          selectedContent?.id === block.id &&
                          selectedContent?.type === "learningBlock"
                            ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleContentSelect("learningBlock", block)
                        }
                      >
                        <div className="flex items-center text-gray-700">
                          {getContentIcon(block.type)}
                          <span className="ml-2 text-sm text-gray-700">
                            {block.title}
                          </span>
                        </div>
                        {getStatusIcon(block.status)}
                      </div>
                    ))}

                    {/* Assessments */}
                    {unit.assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                          selectedContent?.id === assessment.id &&
                          selectedContent?.type === "assessment"
                            ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          handleContentSelect("assessment", assessment)
                        }
                      >
                        <div className="flex items-center">
                          <HelpOutline className="w-4 h-4 text-gray-700" />
                          <span className="ml-2 text-sm text-gray-700">
                            {assessment.title}
                          </span>
                        </div>
                        {getStatusIcon(assessment.status)}
                      </div>
                    ))}
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
              <div className="flex items-center mb-4">
                {selectedContent.type === "learningBlock" ? (
                  <Description className="w-5 h-5 text-green-700 mr-2" />
                ) : (
                  <HelpOutline className="w-5 h-5 text-green-700 mr-2" />
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedContent.title}
                </h2>
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
                            <span className="text-gray-700">Questions:</span>
                            <span className="font-medium text-gray-900">
                              {selectedContent.assessment.questions}
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

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() =>
                        handleStartAssessment(selectedContent.assessment!.id)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
                      disabled={
                        selectedContent.assessment.maxRetakes -
                          selectedContent.assessment.attemptsUsed ===
                        0
                      }
                    >
                      {selectedContent.assessment.maxRetakes -
                        selectedContent.assessment.attemptsUsed ===
                      0
                        ? "No Attempts Remaining"
                        : "Start Assessment"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="max-w-none">
                    <p className="text-gray-900 leading-relaxed text-base">
                      {selectedContent.content}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2">
                      Next
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
