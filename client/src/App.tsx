import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/homePage";
import AuthPage from "@/pages/authPage";
import ForgotPasswordPage from "@/pages/forgotPasswordPage";
import ResetPasswordPage from "@/pages/resetPasswordPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
