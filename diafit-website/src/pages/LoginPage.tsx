import { useNavigate } from "react-router-dom";
import { LoginModal } from "@/components/LoginModal";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginModal
      isOpen
      onClose={() => navigate("/")}
    />
  );
}
