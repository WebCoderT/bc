"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readStoredAdminSession } from "@/app/lib/admin-api";
import { LoadingScreen } from "@/app/components/admin/ui/loading-screen";

export function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = readStoredAdminSession();
    router.replace(session?.accessToken ? "/dashboard" : "/login");
  }, [router]);

  return <LoadingScreen title="正在进入后台..." />;
}
