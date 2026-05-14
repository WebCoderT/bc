"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearStoredAdminSession,
  readStoredAdminSession,
} from "@/app/lib/admin-api";
import { AdminSessionProvider } from "@/app/components/admin/admin-session-context";
import { AdminShell } from "@/app/components/admin/admin-shell";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";

export function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const session = isClient ? readStoredAdminSession() : null;

  useEffect(() => {
    if (isClient && !session?.accessToken) {
      router.replace("/login");
    }
  }, [isClient, pathname, router, session?.accessToken]);

  const handleLogout = () => {
    clearStoredAdminSession();
    router.replace("/login");
  };

  if (!isClient) {
    return <LoadingScreen title="正在校验登录状态..." />;
  }

  if (!session?.accessToken) {
    return <LoadingScreen title="正在跳转登录页..." />;
  }

  return (
    <AdminSessionProvider value={{ session, logout: handleLogout }}>
      <AdminShell session={session} onLogout={handleLogout}>
        {children}
      </AdminShell>
    </AdminSessionProvider>
  );
}
