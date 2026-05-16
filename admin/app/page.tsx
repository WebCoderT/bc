"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";
import {
  clearStoredAdminSession,
  isAdminTokenExpired,
  readStoredAdminSession,
} from "@/app/lib/admin-api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = readStoredAdminSession();

    if (!session?.accessToken || isAdminTokenExpired(session.accessToken)) {
      clearStoredAdminSession();
      router.replace("/login");
      return;
    }

    router.replace("/dashboard");
  }, [router]);
  return <LoadingScreen title="正在进入后台..." />;
}
