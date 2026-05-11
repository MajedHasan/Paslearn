"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";

import WaitlistPage from "@/components/experiences/WaitlistPage";
import SystemExperience from "@/components/system/SystemExperience";

const EXPERIENCE_COMPONENTS: Record<
  string,
  React.ComponentType<{ config?: Record<string, any> }>
> = {
  waitlist_v1: WaitlistPage,
};

type SystemState = "loading" | "ready" | "blocked";

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [state, setState] = useState<SystemState>("loading");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get("/experiences/public", {
          timeout: 8000,
        });

        const data = res?.data?.data ?? res?.data;

        // Invalid response → block
        if (!Array.isArray(data)) {
          throw new Error("Invalid experience response");
        }

        if (!mounted) return;

        // Backend explicitly responded
        setExperiences(data);

        // Only now allow app rendering
        setState("ready");
      } catch (error) {
        console.error("Experience check failed:", error);

        if (!mounted) return;

        // Fail closed
        setState("blocked");
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

  // Still checking backend
  if (state === "loading") {
    return <SystemExperience variant="loading" />;
  }

  // Network error / timeout / malformed response
  // Never expose app
  if (state === "blocked") {
    return (
      <SystemExperience
        variant="offline"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Active system experience
  if (activeExperience) {
    const Component = EXPERIENCE_COMPONENTS[activeExperience.componentKey];

    if (Component) {
      return <Component config={activeExperience.payload} />;
    }

    // Unknown component → safer to block
    return (
      <SystemExperience
        variant="backend"
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Backend explicitly returned []
  return <>{children}</>;
}
