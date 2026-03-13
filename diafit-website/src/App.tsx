import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginModalProvider } from "@/contexts/LoginModalContext";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  return (
    <div className="min-h-screen antialiased flex flex-col relative font-sans">
      <LoginModalProvider>
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </LoginModalProvider>
    </div>
  );
}
