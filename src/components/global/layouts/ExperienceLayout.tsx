"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import axios from "axios";
import { usePathname } from "next/navigation";

import api from "@/lib/api";

import type { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";

import WaitlistPage from "@/components/experiences/WaitlistPage";

import SystemExperience from "@/components/system/SystemExperience";

const EXPERIENCE_COMPONENTS: Record<
  string,
  React.ComponentType<{
    config?: Record<string, any>;
  }>
> = {
  waitlist_v1: WaitlistPage,
};

type SystemState = "loading" | "ready" | "offline" | "backend" | "blocked";

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [state, setState] = useState<SystemState>("loading");

  const loadExperiences = useCallback(async () => {
    setState("loading");

    try {
      const response = await api.get("/experiences/public", {
        timeout: 8000,
      });

      const data = response?.data?.data ?? response?.data;

      /**
       * Backend must explicitly return an array.
       * [] = allow app
       * Anything else = block
       */
      if (!Array.isArray(data)) {
        throw new Error("Invalid experience payload");
      }

      setExperiences(data);

      /**
       * Backend explicitly approved rendering.
       */
      setState("ready");
    } catch (error) {
      console.error("Experience bootstrap failed:", error);

      /**
       * Browser offline
       */
      if (!navigator.onLine) {
        setState("offline");
        return;
      }

      /**
       * Axios-specific classification
       */
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        /**
         * No response:
         * timeout / DNS / connection refused
         */
        if (!error.response) {
          setState("offline");
          return;
        }

        /**
         * Backend infra failure
         */
        if (status && status >= 500) {
          setState("backend");
          return;
        }

        /**
         * Unauthorized / bad request /
         * corrupted response etc
         */
        setState("blocked");
        return;
      }

      /**
       * Unknown parsing/runtime issue
       */
      setState("blocked");
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const activeExperience = useMemo(() => {
    return experiences
      .filter(
        (experience) => experience.enabled && experience.type === "full_page",
      )
      .sort((a, b) => b.priority - a.priority)
      .find((experience) => {
        const isGlobal = experience.target?.scope === "global";

        const routeMatched = experience.target?.routes?.includes(pathname);

        const excluded = experience.target?.excludeRoutes?.includes(pathname);

        if (excluded) {
          return false;
        }

        return isGlobal || routeMatched;
      });
  }, [experiences, pathname]);

  /**
   * Loading state
   */
  if (state === "loading") {
    return <SystemExperience variant="loading" />;
  }

  /**
   * User connectivity issue
   */
  if (state === "offline") {
    return <SystemExperience variant="offline" onRetry={loadExperiences} />;
  }

  /**
   * Backend/server issue
   */
  if (state === "backend") {
    return <SystemExperience variant="backend" onRetry={loadExperiences} />;
  }

  /**
   * Payload/security issue
   */
  if (state === "blocked") {
    return <SystemExperience variant="blocked" onRetry={loadExperiences} />;
  }

  /**
   * Active system experience
   */
  if (activeExperience) {
    const Component = EXPERIENCE_COMPONENTS[activeExperience.componentKey];

    /**
     * Unknown component registration
     * Safer to block.
     */
    if (!Component) {
      return <SystemExperience variant="blocked" onRetry={loadExperiences} />;
    }

    return <Component config={activeExperience.payload} />;
  }

  /**
   * Backend explicitly returned []
   * Safe to render app
   */
  return <>{children}</>;
}
