// src/components/ProtectedLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppLoader1, AppLoader2 } from "../loader/AppLoader";
import DashboardLoader from "../loader/DashboardLoader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);

  // Wait until client has mounted
  useEffect(() => {
    setHydrated(true);
  }, []);

  const authChecked = useAuthGuard(hydrated);

  if (!hydrated || !authChecked) {
    return <DashboardLoader />; // 👈 always show loader until authorized
  }

  return <>{children}</>;
}
