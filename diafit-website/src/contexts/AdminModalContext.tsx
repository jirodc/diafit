"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
};

type AdminModalContextValue = {
  confirm: (options: ConfirmOptions) => void;
};

const AdminModalContext = createContext<AdminModalContextValue | null>(null);

export function AdminModalProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions | null;
  }>({ open: false, options: null });

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({ open: true, options });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.options?.onConfirm();
    setConfirmState({ open: false, options: null });
  }, [confirmState.options]);

  return (
    <AdminModalContext.Provider value={{ confirm }}>
      {children}
      {confirmState.options && (
        <ConfirmModal
          isOpen={confirmState.open}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          title={confirmState.options.title}
          message={confirmState.options.message}
          confirmLabel={confirmState.options.confirmLabel}
          cancelLabel={confirmState.options.cancelLabel}
          variant={confirmState.options.variant}
        />
      )}
    </AdminModalContext.Provider>
  );
}

export function useAdminConfirm() {
  const ctx = useContext(AdminModalContext);
  if (!ctx) {
    throw new Error("useAdminConfirm must be used within AdminModalProvider");
  }
  return ctx;
}
