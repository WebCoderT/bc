"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearStoredAdminSession,
  isAdminTokenExpired,
  readStoredAdminSession,
  validateAdminSession,
  writeStoredAdminSession,
} from "@/app/lib/admin-api";
import { AdminSessionProvider } from "@/app/components/admin/admin-session-context";
import { AdminShell } from "@/app/components/admin/admin-shell";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";
import type { AdminSession } from "@/app/lib/admin-api";

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
  const storedSession = isClient ? readStoredAdminSession() : null;
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      if (!isClient) {
        return;
      }

      if (
        !storedSession?.accessToken ||
        isAdminTokenExpired(storedSession.accessToken)
      ) {
        clearStoredAdminSession();
        if (!cancelled) {
          setSession(null);
          setIsChecking(false);
          router.replace("/login");
        }
        return;
      }

      try {
        const validatedSession = await validateAdminSession(
          storedSession.accessToken,
        );

        if (cancelled) {
          return;
        }

        writeStoredAdminSession(validatedSession);
        setSession(validatedSession);
      } catch {
        if (cancelled) {
          return;
        }

        clearStoredAdminSession();
        setSession(null);
        router.replace("/login");
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [isClient, pathname, router, storedSession?.accessToken]);

  const handleLogout = () => {
    clearStoredAdminSession();
    setSession(null);
    router.replace("/login");
  };

  if (!isClient || isChecking) {
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
