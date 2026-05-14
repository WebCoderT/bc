"use client";

import { createContext, useContext } from "react";
import type { AdminSession } from "@/app/lib/admin-api";

type AdminSessionContextValue = {
  session: AdminSession;
  logout: () => void;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(
  null,
);

export function AdminSessionProvider({
  value,
  children,
}: {
  value: AdminSessionContextValue;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error("useAdminSession 必须在 AdminSessionProvider 中使用");
  }

  return context;
}
