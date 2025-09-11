import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthRedirect from "@/components/AuthRedirect";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/home/homePage";
import AuthPage from "@/pages/login/authPage";
import ForgotPasswordPage from "@/pages/login/forgotPasswordPage";
import ResetPasswordPage from "@/pages/login/resetPasswordPage";
import JoinPage from "@/pages/login/joinPage";
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
import AssessmentPage from "@/pages/user/assessmentPage";
import MediaPage from "./pages/admin/mediaPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/join" element={<JoinPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sub-admin"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <SubAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assets"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subassets"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <SubAssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organization"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <OrganizationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sub-organization"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <SubOrganizationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/training-area"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <TrainingAreaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/modules"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <ModulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/units"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <UnitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/learning-block"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <LearningBlockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AssessmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <QuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/role-categories"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <RoleCategoriesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/media"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <MediaPage />
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
                path="users"
                element={
                  <ProtectedRoute requiredUserType="sub_admin">
                    <SubAdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="links"
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
              <Route
                path="assessment/:id"
                element={
                  <ProtectedRoute requiredUserType="user">
                    <AssessmentPage />
                  </ProtectedRoute>
                }
              />
            </Route>
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
