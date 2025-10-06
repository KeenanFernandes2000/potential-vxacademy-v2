import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CertificateFormFiller from "@/components/generatePDF";
import CertificatePopup from "@/components/CertificatePopup";
import {
  Trophy,
  Star,
  Award,
  Download,
  Eye,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Types
interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  trainingAreaId: number;
  trainingAreaName: string;
  trainingAreaDescription?: string;
  trainingAreaImageUrl?: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
}

interface TrainingAreaProgress {
  id: number;
  trainingAreaId: number;
  trainingAreaName: string;
  status: "not_started" | "in_progress" | "completed";
  completionPercentage: number;
  startedAt: string;
  completedAt: string | null;
  totalModules: number;
  completedModules: number;
}

interface UserStats {
  totalXp: number;
  certificatesEarned: number;
  trainingAreasCompleted: number;
  trainingAreasInProgress: number;
}

const Achievements = () => {
  const { user, token } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [trainingAreaProgress, setTrainingAreaProgress] = useState<
    TrainingAreaProgress[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCertificatePopup, setShowCertificatePopup] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  // API service functions
  const api = {
    async getUserStats(userId: number, token: string): Promise<UserStats> {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/users/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.success) throw new Error("Failed to fetch user stats");

      return {
        totalXp: data.data.xp || 0,
        certificatesEarned: 0, // Will be calculated from certificates
        trainingAreasCompleted: 0, // Will be calculated from progress
        trainingAreasInProgress: 0, // Will be calculated from progress
      };
    },

    async getCertificates(
      userId: number,
      token: string
    ): Promise<Certificate[]> {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/users/users/${userId}/certificates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        // If endpoint doesn't exist, return empty array
        return [];
      }

      const data = await response.json();
      return data.success ? data.data : [];
    },

    async getTrainingAreaProgress(
      userId: number,
      token: string
    ): Promise<TrainingAreaProgress[]> {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${baseUrl}/api/progress/training-areas/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch training area progress");
      }

      const data = await response.json();
      return data.success ? data.data : [];
    },

    async getAllTrainingAreas(): Promise<any[]> {
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/api/training/training-areas`);
      const data = await response.json();
      return data.success ? data.data : [];
    },
  };

  // Fetch all achievements data
  useEffect(() => {
    const fetchAchievementsData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [stats, certificatesData, progressData, trainingAreasData] =
          await Promise.all([
            api.getUserStats(user.id, token),
            api.getCertificates(user.id, token).catch(() => []), // Graceful fallback
            api.getTrainingAreaProgress(user.id, token),
            api.getAllTrainingAreas(),
          ]);

        // Process certificates
        const processedCertificates: Certificate[] = certificatesData.map(
          (cert: any) => ({
            id: cert.id,
            userId: cert.userId,
            courseId: cert.trainingAreaId, // Using trainingAreaId as courseId for compatibility
            trainingAreaId: cert.trainingAreaId,
            trainingAreaName:
              cert.trainingAreaName || "Training Area Certificate",
            trainingAreaDescription: cert.trainingAreaDescription,
            trainingAreaImageUrl: cert.trainingAreaImageUrl,
            certificateNumber: cert.certificateNumber,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            status:
              new Date(cert.expiryDate) > new Date() ? "active" : "expired",
          })
        );

        // Process training area progress
        const processedProgress: TrainingAreaProgress[] = progressData.map(
          (progress: any) => ({
            id: progress.id,
            trainingAreaId: progress.trainingAreaId,
            trainingAreaName:
              trainingAreasData.find((ta) => ta.id === progress.trainingAreaId)
                ?.name || "Training Area",
            status: progress.status,
            completionPercentage:
              parseFloat(progress.completionPercentage) || 0,
            startedAt: progress.startedAt,
            completedAt: progress.completedAt,
            totalModules: 0, // Will be calculated
            completedModules: 0, // Will be calculated
          })
        );

        // Update stats with calculated values
        const updatedStats: UserStats = {
          ...stats,
          certificatesEarned: processedCertificates.length,
          trainingAreasCompleted: processedProgress.filter(
            (p) => p.status === "completed"
          ).length,
          trainingAreasInProgress: processedProgress.filter(
            (p) => p.status === "in_progress"
          ).length,
        };

        setUserStats(updatedStats);
        setCertificates(processedCertificates);
        setTrainingAreaProgress(processedProgress);
      } catch (err: any) {
        console.error("Error fetching achievements data:", err);
        setError(err.message || "Failed to load achievements data");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementsData();
  }, [user, token]);

  // Debug: Log certificates whenever they change
  useEffect(() => {
    console.log("Certificates state updated:", certificates);
  }, [certificates]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // VX Points component
  // const VXPointsCard = () => (
  //   <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
  //     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //       <CardTitle className="text-sm font-medium text-blue-700">
  //         VX Points
  //       </CardTitle>
  //       <Star className="h-4 w-4 text-blue-600" />
  //     </CardHeader>
  //     <CardContent>
  //       <div className="text-2xl font-bold text-blue-900">
  //         {userStats?.totalXp.toLocaleString()}
  //       </div>
  //       <p className="text-xs text-blue-600">Total points earned</p>
  //       <div className="mt-2 flex items-center text-xs text-blue-600">
  //         <TrendingUp className="h-3 w-3 mr-1" />
  //         Keep learning to earn more points
  //       </div>
  //     </CardContent>
  //   </Card>
  // );

  // Certificates component
  const CertificatesSection = () => {
    if (certificates.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-amber-600" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Certificates Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Complete a full training area to earn your first certificate!
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-600" />
            Certificates ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {cert.trainingAreaImageUrl && (
                  <div className="mb-3">
                    <img
                      src={cert.trainingAreaImageUrl}
                      alt={cert.trainingAreaName}
                      className="w-full h-24 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm ">
                      {cert.trainingAreaName}
                    </h4>
                    {cert.trainingAreaDescription && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {cert.trainingAreaDescription}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ml-2 ${
                      cert.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  #{cert.certificateNumber}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  {cert.trainingAreaName.toLowerCase().includes("midhyaf") ? (
                    <CertificateFormFiller
                      userName={`${user?.firstName || ""} ${
                        user?.lastName || ""
                      }`.trim()}
                      className="flex-1"
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#B85A1A] text-[#B85A1A] hover:bg-[#B85A1A] hover:text-white"
                      onClick={() => {
                        console.log(
                          "Certificate download not implemented for:",
                          cert.trainingAreaName
                        );
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Achievements</h1>
          <p className="text-muted-foreground">
            Celebrate your learning milestones and earned certificates.
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Error Loading Achievements
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Achievements</h1>
        <p className="text-muted-foreground">
          Celebrate your learning milestones and earned certificates.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <VXPointsCard /> */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">
                  Certificates
                </CardTitle>
                <Award className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">
                  {userStats?.certificatesEarned}
                </div>
                <p className="text-xs text-amber-600">Certificates earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Progress
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {userStats?.trainingAreasCompleted}
                </div>
                <p className="text-xs text-green-600">
                  Training areas completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Section */}
          <CertificatesSection />
        </div>
      )}
    </div>
  );
};

export default Achievements;
