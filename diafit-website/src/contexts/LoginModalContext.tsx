"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { LoginModal } from "@/components/LoginModal";

export type LoginModalMode = "login" | "signup";

interface LoginModalContextValue {
  openLoginModal: (options?: { mode?: LoginModalMode }) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({
  children,
  bypass,
}: {
  children: React.ReactNode;
  /** When true (e.g. on admin routes), login modal is not rendered and open is a no-op. */
  bypass?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<LoginModalMode>("login");
  const openLoginModal = useCallback(
    (options?: { mode?: LoginModalMode }) => {
      if (!bypass) {
        setInitialMode(options?.mode ?? "login");
        setIsOpen(true);
      }
    },
    [bypass]
  );
  const closeLoginModal = useCallback(() => setIsOpen(false), []);

  return (
    <LoginModalContext.Provider value={{ openLoginModal, closeLoginModal }}>
      {children}
      {!bypass && (
        <LoginModal isOpen={isOpen} onClose={closeLoginModal} initialMode={initialMode} />
      )}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return ctx;
}
