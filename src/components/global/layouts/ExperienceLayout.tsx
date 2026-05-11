"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

import api from "@/lib/api";
import type { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";

import WaitlistPage from "@/components/experiences/WaitlistPage";
import PopupExperience from "@/components/experiences/PopupExperience";
import BannerExperience from "@/components/experiences/BannerExperience";
import SystemExperience from "@/components/system/SystemExperience";

const COMPONENTS: Record<
  string,
  React.ComponentType<{ config?: Record<string, any> }>
> = {
  waitlist_v1: WaitlistPage,
  popup_v1: PopupExperience,
  banner_v1: BannerExperience,
};

type SystemState = "loading" | "ready" | "offline" | "backend" | "blocked";

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [state, setState] = useState<SystemState>("loading");

  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [activePopupIds, setActivePopupIds] = useState<string[]>([]);
  const [activeBannerIds, setActiveBannerIds] = useState<string[]>([]);

  /*
  ==========================================
  FETCH
  ==========================================
  */
  const loadExperiences = useCallback(async () => {
    setState("loading");

    try {
      const res = await api.get("/experiences/public", {
        timeout: 8000,
      });

      const data = res?.data?.data ?? res?.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid payload");
      }

      setExperiences(data);
      setState("ready");
    } catch (error) {
      console.error(error);

      if (!navigator.onLine) {
        return setState("offline");
      }

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          return setState("offline");
        }

        if (error.response.status >= 500) {
          return setState("backend");
        }
      }

      setState("blocked");
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  /*
  ==========================================
  HELPERS
  ==========================================
  */
  const isRouteMatched = useCallback(
    (experience: Experience) => {
      const excluded = experience.target?.excludeRoutes?.includes(pathname);

      if (excluded) return false;

      if (experience.target?.scope === "global") {
        return true;
      }

      return experience.target?.routes?.includes(pathname);
    },
    [pathname],
  );

  const isScheduleValid = (experience: Experience) => {
    const now = new Date();

    const startAt = experience.schedule?.startAt
      ? new Date(experience.schedule.startAt)
      : null;

    const endAt = experience.schedule?.endAt
      ? new Date(experience.schedule.endAt)
      : null;

    if (startAt && now < startAt) return false;

    if (endAt && now > endAt) return false;

    return true;
  };

  const availableExperiences = useMemo(() => {
    return experiences
      .filter((exp) => exp.enabled)
      .filter(isRouteMatched)
      .filter(isScheduleValid)
      .sort((a, b) => b.priority - a.priority);
  }, [experiences, isRouteMatched]);

  /*
  ==========================================
  FULL PAGE
  ==========================================
  */
  const fullPageExperience = useMemo(() => {
    return availableExperiences.find((exp) => exp.type === "full_page");
  }, [availableExperiences]);

  /*
  ==========================================
  REDIRECT
  ==========================================
  */
  useEffect(() => {
    const redirectExperience: any = availableExperiences.find(
      (exp) => exp.type === "redirect",
    );

    if (!redirectExperience?.payload?.url) return;

    const delay = Number(redirectExperience.trigger?.value) || 0;

    const timer = setTimeout(() => {
      window.location.href = redirectExperience.payload.url;
    }, delay);

    return () => clearTimeout(timer);
  }, [availableExperiences]);

  /*
  ==========================================
  POPUPS + BANNERS TRIGGERS
  ==========================================
  */
  useEffect(() => {
    if (!availableExperiences.length) return;

    const timers: NodeJS.Timeout[] = [];

    const onScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;

      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type !== "scroll") return;

        const target = Number(exp.trigger?.value || 50);

        if (scrollPercent < target) return;

        if (exp.type === "popup") {
          setActivePopupIds((prev) =>
            prev.includes(exp._id) ? prev : [...prev, exp._id],
          );
        }

        if (exp.type === "banner") {
          setActiveBannerIds((prev) =>
            prev.includes(exp._id) ? prev : [...prev, exp._id],
          );
        }
      });
    };

    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY > 20) return;

      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type !== "exit_intent") return;

        if (exp.type === "popup") {
          setActivePopupIds((prev) =>
            prev.includes(exp._id) ? prev : [...prev, exp._id],
          );
        }
      });
    };

    availableExperiences.forEach((exp) => {
      const triggerType = exp.trigger?.type || "always";

      if (triggerType === "always") {
        if (exp.type === "popup") {
          setActivePopupIds((prev) =>
            prev.includes(exp._id) ? prev : [...prev, exp._id],
          );
        }

        if (exp.type === "banner") {
          setActiveBannerIds((prev) =>
            prev.includes(exp._id) ? prev : [...prev, exp._id],
          );
        }
      }

      if (triggerType === "timer") {
        const delay = Number(exp.trigger?.value || 3000);

        const timer = setTimeout(() => {
          if (exp.type === "popup") {
            setActivePopupIds((prev) =>
              prev.includes(exp._id) ? prev : [...prev, exp._id],
            );
          }

          if (exp.type === "banner") {
            setActiveBannerIds((prev) =>
              prev.includes(exp._id) ? prev : [...prev, exp._id],
            );
          }
        }, delay);

        timers.push(timer);
      }
    });

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mouseleave", onExitIntent);

    return () => {
      timers.forEach(clearTimeout);

      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onExitIntent);
    };
  }, [availableExperiences]);

  /*
  ==========================================
  STATES
  ==========================================
  */
  if (state === "loading") {
    return <SystemExperience variant="loading" />;
  }

  if (state === "offline") {
    return <SystemExperience variant="offline" onRetry={loadExperiences} />;
  }

  if (state === "backend") {
    return <SystemExperience variant="backend" onRetry={loadExperiences} />;
  }

  if (state === "blocked") {
    return <SystemExperience variant="blocked" onRetry={loadExperiences} />;
  }

  /*
  ==========================================
  FULL PAGE OVERRIDE
  ==========================================
  */
  if (fullPageExperience) {
    const Component = COMPONENTS[fullPageExperience.componentKey];

    if (!Component) {
      return <SystemExperience variant="blocked" onRetry={loadExperiences} />;
    }

    return <Component config={fullPageExperience.payload} />;
  }

  /*
  ==========================================
  NORMAL APP
  ==========================================
  */
  return (
    <>
      {availableExperiences
        .filter(
          (exp) => exp.type === "banner" && activeBannerIds.includes(exp._id),
        )
        .map((exp) => {
          const Component = COMPONENTS[exp.componentKey];

          if (!Component) return null;

          return <Component key={exp._id} config={exp.payload} />;
        })}

      {children}

      {availableExperiences
        .filter(
          (exp) => exp.type === "popup" && activePopupIds.includes(exp._id),
        )
        .map((exp) => {
          const Component = COMPONENTS[exp.componentKey];

          if (!Component) return null;

          return <Component key={exp._id} config={exp.payload} />;
        })}
    </>
  );
}
