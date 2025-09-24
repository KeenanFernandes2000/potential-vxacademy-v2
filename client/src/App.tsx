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
import QuestionsPage from "@/pages/admin/questionsPage";
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
// import AssessmentPage from "@/pages/user/assessmentPage";
import MediaPage from "./pages/admin/mediaPage";

// Import SidebarProvider for persistent sidebar state
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/adminSidebar";

// Create a wrapper component for admin routes with persistent sidebar
const AdminRoutesWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#003451]">
        {/* Persistent Admin Sidebar */}
        <AdminSidebar />

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
                      <Route path="assessments" element={<AssessmentsPage />} />
                      <Route path="questions" element={<QuestionsPage />} />
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
                    </Routes>
                  </AdminRoutesWrapper>
                </ProtectedRoute>
              }
            />

            {/* Sub-Admin Routes */}
            <Route
              path="/sub-admin"
              element={
                <ProtectedRoute requiredUserType="sub_admin">
                  <SubAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="frontliners"
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invite"
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminLinks />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute requiredUserType="user">
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute requiredUserType="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <UserCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="achievements"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <UserAchievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses/:id"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <CourseDetails />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="assessment/:id"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              /> */}
            </Route>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
