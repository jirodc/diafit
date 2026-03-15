import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginModalProvider } from "@/contexts/LoginModalContext";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import LoginPage from "@/pages/LoginPage";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminPlaceholder } from "@/pages/admin/AdminPlaceholder";
import { AdminUserManagement } from "@/pages/admin/AdminUserManagement";
import { AdminCreateAccount } from "@/pages/admin/AdminCreateAccount";
import { AdminExerciseMonitoring } from "@/pages/admin/AdminExerciseMonitoring";
import { AdminMealPlanMonitoring } from "@/pages/admin/AdminMealPlanMonitoring";
import { AdminMedicationMonitoring } from "@/pages/admin/AdminMedicationMonitoring";
import { AdminAnalytics } from "@/pages/admin/AdminAnalytics";
import { AdminHistoryLogs } from "@/pages/admin/AdminHistoryLogs";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin"); // Admin routes bypass website login; no auth required for /admin

  return (
    <div className="min-h-0 w-full antialiased flex flex-col relative font-sans">
      <LoginModalProvider bypass={isAdmin}>
        <div className="relative z-10 flex min-h-0 w-full flex-col">
          {!isAdmin && <Header />}
          <main className="flex-1">
            <Routes>
              <Route path="/admin" element={<AdminAuthProvider><AdminLayout /></AdminAuthProvider>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="create-account" element={<AdminCreateAccount />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="exercises" element={<AdminExerciseMonitoring />} />
                <Route path="meal-plans" element={<AdminMealPlanMonitoring />} />
                <Route path="medications" element={<AdminMedicationMonitoring />} />
                <Route path="history-logs" element={<AdminHistoryLogs />} />
              </Route>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
          {!isAdmin && <Footer />}
        </div>
      </LoginModalProvider>
    </div>
  );
}
