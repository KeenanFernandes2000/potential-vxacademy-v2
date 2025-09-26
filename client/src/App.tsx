import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import "react-international-phone/style.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/home/homePage";
import AuthPage from "@/pages/login/authPage";
import ForgotPasswordPage from "@/pages/login/forgotPasswordPage";
import ResetPasswordPage from "@/pages/login/resetPasswordPage";
import JoinPage from "@/pages/login/joinPage";
import ExistingUserTestPage from "@/pages/login/existingUserTestPage";
import ProfilePage from "@/pages/profile";
import NotFoundPage from "@/pages/errors/NotFoundPage";

// Admin Pages
import Dashboard from "@/pages/admin/dashboard";
import SubAdminPage from "@/pages/admin/subAdminPage";
import AssetsPage from "@/pages/admin/assetsPage";
import SubAssetsPage from "@/pages/admin/subAssetsPage";
import OrganizationPage from "@/pages/admin/organizationPage";
import SubOrganizationPage from "@/pages/admin/subOrganizationPage";
import TrainingAreaPage from "@/pages/admin/trainingAreaPage";
import ModulesPage from "@/pages/admin/modulesPage";
import CoursesPage from "@/pages/admin/coursesPage";
import UnitsPage from "@/pages/admin/unitsPage";
import LearningBlockPage from "@/pages/admin/learningBlockPage";
import AssessmentsPage from "@/pages/admin/assessmentsPage";
import RolesPage from "@/pages/admin/rolesPage";
import RoleCategoriesPage from "@/pages/admin/roleCategoriesPage";
import LearningPathPage from "@/pages/admin/learningPathPage";

// Sub-Admin Pages
import SubAdminLayout from "@/pages/sub-admin/subAdminLayout";
import SubAdminDashboard from "@/pages/sub-admin/dashboard";
import SubAdminUsers from "@/pages/sub-admin/users";
import SubAdminLinks from "@/pages/sub-admin/links";

// User Pages
import UserLayout from "@/pages/user/userLayout";
import UserDashboard from "@/pages/user/dashboard";
import UserCourses from "@/pages/user/courses";
import UserAchievements from "@/pages/user/achievements";
import CourseDetails from "@/pages/user/courseDetails";
import MediaPage from "./pages/admin/mediaPage";

// Report Pages
import {
  Analytics,
  AllUsers,
  Organizations,
  SubAdmins,
  Frontliners,
  CertificateReports,
} from "@/pages/admin/reports";

// Training Area Pages
import AlMidhyafCoc from "@/pages/admin/reports/training-areas/alMidhyafCoc";
import AdInformation from "@/pages/admin/reports/training-areas/adInformation";
import GeneralVxSoftSkills from "@/pages/admin/reports/training-areas/generalVxSoftSkills";
import GeneralVxHardSkills from "@/pages/admin/reports/training-areas/generalVxHardSkills";
import ManagerialCompetencies from "@/pages/admin/reports/training-areas/managerialCompetencies";

// Import SidebarProvider for persistent sidebar state
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/adminSidebar";
import SubAdminSidebar from "@/components/subAdminSidebar";
import UserSidebar from "@/components/userSidebar";

import { ThemeProvider } from "./context/themeContext";

// Create a wrapper component for admin routes with persistent sidebar
const AdminRoutesWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-sandstone">
        {/* Persistent Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <SidebarInset className="max-w-[100%]">
          <div className="flex flex-col h-full">
            <main className="flex-1 p-6">
              <div className="space-y-6">{children}</div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Create a wrapper component for sub-admin routes with persistent sidebar
const SubAdminRoutesWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-sandstone">
        {/* Persistent Sub-Admin Sidebar */}
        <SubAdminSidebar />

        {/* Main Content Area */}
        <SidebarInset className="max-w-[100%]">
          <div className="flex flex-col h-full">
            <main className="flex-1 p-6">
              <div className="space-y-6">{children}</div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

// Create a wrapper component for user routes with persistent sidebar
const UserRoutesWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#003451]">
        {/* Persistent User Sidebar */}
        <UserSidebar />

        {/* Main Content Area */}
        <SidebarInset className="max-w-[80%]">
          <div className="flex flex-col h-full">
            <main className="flex-1 p-6">
              <div className="space-y-6">{children}</div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <div>
            <Routes>
              {/* <Route path="/" element={<AuthRedirect />} /> */}

              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/join" element={<JoinPage />} />

              {/* Admin Routes - Wrapped with persistent SidebarProvider */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredUserType="admin">
                    <AdminRoutesWrapper>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="sub-admin" element={<SubAdminPage />} />
                        <Route path="assets" element={<AssetsPage />} />
                        <Route path="subassets" element={<SubAssetsPage />} />
                        <Route
                          path="organization"
                          element={<OrganizationPage />}
                        />
                        <Route
                          path="sub-organization"
                          element={<SubOrganizationPage />}
                        />
                        <Route
                          path="training-area"
                          element={<TrainingAreaPage />}
                        />
                        <Route path="modules" element={<ModulesPage />} />
                        <Route path="courses" element={<CoursesPage />} />
                        <Route path="units" element={<UnitsPage />} />
                        <Route
                          path="learning-block"
                          element={<LearningBlockPage />}
                        />
                        <Route
                          path="assessments"
                          element={<AssessmentsPage />}
                        />
                        <Route path="roles" element={<RolesPage />} />
                        <Route
                          path="role-categories"
                          element={<RoleCategoriesPage />}
                        />
                        <Route
                          path="learning-path"
                          element={<LearningPathPage />}
                        />
                        <Route path="media" element={<MediaPage />} />

                        {/* Report Routes */}
                        <Route
                          path="reports/analytics"
                          element={<Analytics />}
                        />
                        <Route
                          path="reports/all-users"
                          element={<AllUsers />}
                        />
                        <Route
                          path="reports/organizations"
                          element={<Organizations />}
                        />
                        <Route
                          path="reports/sub-admins"
                          element={<SubAdmins />}
                        />
                        <Route
                          path="reports/frontliners"
                          element={<Frontliners />}
                        />
                        {/* Training Area Routes */}
                        <Route
                          path="reports/training-areas/al-midhyaf-coc"
                          element={<AlMidhyafCoc />}
                        />
                        <Route
                          path="reports/training-areas/ad-information"
                          element={<AdInformation />}
                        />
                        <Route
                          path="reports/training-areas/general-vx-soft-skills"
                          element={<GeneralVxSoftSkills />}
                        />
                        <Route
                          path="reports/training-areas/general-vx-hard-skills"
                          element={<GeneralVxHardSkills />}
                        />
                        <Route
                          path="reports/training-areas/managerial-competencies"
                          element={<ManagerialCompetencies />}
                        />
                        <Route
                          path="reports/certificate-reports"
                          element={<CertificateReports />}
                        />
                      </Routes>
                    </AdminRoutesWrapper>
                  </ProtectedRoute>
                }
              />

              {/* Sub-Admin Routes - Wrapped with persistent SidebarProvider */}
              <Route
                path="/sub-admin/*"
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminRoutesWrapper>
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<SubAdminDashboard />}
                        />
                        <Route path="frontliners" element={<SubAdminUsers />} />
                        <Route path="invite" element={<SubAdminLinks />} />
                      </Routes>
                    </SubAdminRoutesWrapper>
                  </ProtectedRoute>
                }
              />

              {/* User Routes - Wrapped with persistent SidebarProvider */}
              <Route
                path="/user/*"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <UserRoutesWrapper>
                      <Routes>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="courses" element={<UserCourses />} />
                        <Route
                          path="achievements"
                          element={<UserAchievements />}
                        />
                        <Route path="courses/:id" element={<CourseDetails />} />
                      </Routes>
                    </UserRoutesWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/initial-assessment"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <ExistingUserTestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
