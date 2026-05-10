// src/components/system/ExperienceLayout.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";

// import MaintenancePage from "@/components/experiences/MaintenancePage";
import WaitlistPage from "@/components/experiences/WaitlistPage";
// import ComingSoonPage from "@/components/experiences/ComingSoonPage";

const EXPERIENCE_COMPONENTS: Record<
  string,
  React.ComponentType<{ config?: Record<string, any> }>
> = {
  //   maintenance_v1: MaintenancePage,
  waitlist_v1: WaitlistPage,
  //   coming_soon_v1: ComingSoonPage,
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get("/experiences/public");
        const data = res?.data?.data || res?.data || [];

        if (mounted) {
          setExperiences(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const activeExperience = useMemo(() => {
    return experiences
      .filter((exp) => exp.type === "full_page" && exp.enabled)
      .sort((a, b) => b.priority - a.priority)
      .find((exp) => {
        const isGlobal = exp.target?.scope === "global";
        const matchRoute = exp.target?.routes?.includes(pathname);
        const excluded = exp.target?.excludeRoutes?.includes(pathname);

        if (excluded) return false;

        return isGlobal || matchRoute;
      });
  }, [experiences, pathname]);

  if (loading) {
    return <div className="min-h-screen" />;
  }

  if (activeExperience) {
    const Component = EXPERIENCE_COMPONENTS[activeExperience.componentKey];

    if (!Component) return <div className="min-h-screen" />;

    return <Component config={activeExperience.payload} />;
  }

  return <>{children}</>;
}
