"use client";

import { useRouter } from "next/navigation";
import { LoginModal } from "@/components/LoginModal";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginModal
      isOpen
      onClose={() => router.push("/")}
    />
  );
}
