import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/home/homePage";
import AuthPage from "@/pages/login/authPage";
import ForgotPasswordPage from "@/pages/login/forgotPasswordPage";
import ResetPasswordPage from "@/pages/login/resetPasswordPage";
import JoinPage from "./pages/login/joinPage";

// Admin Pages
import SubAdminPage from "./pages/admin/subAdminPage";
import AssetsPage from "./pages/admin/assetsPage";
import SubAssetsPage from "./pages/admin/subAssetsPage";
import OrganizationPage from "./pages/admin/organizationPage";
import SubOrganizationPage from "./pages/admin/subOrganizationPage";
import TrainingAreaPage from "./pages/admin/trainingAreaPage";
import ModulesPage from "./pages/admin/modulesPage";
import CoursesPage from "./pages/admin/coursesPage";
import UnitsPage from "./pages/admin/unitsPage";
import LearningBlockPage from "./pages/admin/learningBlockPage";
import AssessmentsPage from "./pages/admin/assessmentsPage";
import QuestionsPage from "./pages/admin/questionsPage";

// Sub-Admin Pages
import SubAdminLayout from "./pages/sub-admin/subAdminLayout";
import SubAdminDashboard from "./pages/sub-admin/dashboard";
import SubAdminUsers from "./pages/sub-admin/users";
import SubAdminLinks from "./pages/sub-admin/links";

// User Pages
import UserLayout from "./pages/user/userLayout";
import UserDashboard from "./pages/user/dashboard";
import UserCourses from "./pages/user/courses";
import UserAchievements from "./pages/user/achievements";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/join" element={<JoinPage />} />

          {/* Admin Routes */}
          <Route path="/admin/sub-admin" element={<SubAdminPage />} />
          <Route path="/admin/assets" element={<AssetsPage />} />
          <Route path="/admin/subassets" element={<SubAssetsPage />} />
          <Route path="/admin/organization" element={<OrganizationPage />} />
          <Route
            path="/admin/sub-organization"
            element={<SubOrganizationPage />}
          />
          <Route path="/admin/training-area" element={<TrainingAreaPage />} />
          <Route path="/admin/modules" element={<ModulesPage />} />
          <Route path="/admin/courses" element={<CoursesPage />} />
          <Route path="/admin/units" element={<UnitsPage />} />
          <Route path="/admin/learning-block" element={<LearningBlockPage />} />
          <Route path="/admin/assessments" element={<AssessmentsPage />} />
          <Route path="/admin/questions" element={<QuestionsPage />} />

          {/* Sub-Admin Routes */}
          <Route path="/sub-admin" element={<SubAdminLayout />}>
            <Route index element={<SubAdminDashboard />} />
            <Route path="dashboard" element={<SubAdminDashboard />} />
            <Route path="users" element={<SubAdminUsers />} />
            <Route path="links" element={<SubAdminLinks />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="courses" element={<UserCourses />} />
            <Route path="achievements" element={<UserAchievements />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
