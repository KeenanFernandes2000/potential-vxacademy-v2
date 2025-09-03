import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/home/homePage";
import AuthPage from "@/pages/login/authPage";
import ForgotPasswordPage from "@/pages/login/forgotPasswordPage";
import ResetPasswordPage from "@/pages/login/resetPasswordPage";
import JoinPage from "./pages/login/joinPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/join" element={<JoinPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
