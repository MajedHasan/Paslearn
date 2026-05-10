// src/hooks/useAuthGuard.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { roleAccess } from "@/lib/roleAccess";
import { useAppSelector } from "./useRedux";

export function useAuthGuard(hydrated: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated } = useAppSelector((s) => s.user);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !currentUser) {
      router.replace("/auth/sign-in");
      return;
    }

    const role = currentUser.role || "student";
    const accessConfig = roleAccess[role];

    if (!accessConfig) {
      router.replace("/auth/sign-in");
      return;
    }

    const canAccess = accessConfig.routes.some((regex) => regex.test(pathname));

    if (!canAccess) {
      // 🚀 redirect user to their default dashboard instead of sign-in
      router.replace(accessConfig.default);
      return;
    }

    // ✅ authorized
    setAuthChecked(true);
  }, [hydrated, currentUser, isAuthenticated, pathname, router]);

  return authChecked;
}
