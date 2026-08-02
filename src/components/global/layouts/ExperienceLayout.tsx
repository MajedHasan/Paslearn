"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

import api from "@/lib/api";
import type {
  Experience,
  IFullPageOptions,
  IRedirectOptions,
  IPopupOptions,
  IBannerOptions,
} from "@/app/(dashboard)/admin/experiences/utils/experience.types";

import WaitlistPage from "@/components/experiences/WaitlistPage";
import PopupExperience from "@/components/experiences/PopupExperience";
import BannerExperience from "@/components/experiences/BannerExperience";
import ExperienceContent from "@/components/experiences/ExperienceContent";
import SystemExperience from "@/components/system/SystemExperience";
import { useTrackImpression } from "@/hooks/useTrackImpression";
import FullPageExperience from "@/components/experiences/FullPageExperience";

type SystemState = "loading" | "ready" | "offline" | "backend" | "blocked";

// ─── helpers ────────────────────────────────────────────────────
function isValidDateValue(value?: string) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function shouldRenderExperienceOnRoute(exp: Experience, pathname: string) {
  if (exp.target?.excludeRoutes?.includes(pathname)) return false;
  if (exp.target?.scope === "global") return true;
  return exp.target?.routes?.includes(pathname) ?? false;
}

function isExperienceWithinSchedule(exp: Experience) {
  const now = new Date();
  const start = isValidDateValue(exp.schedule?.startAt)
    ? new Date(exp.schedule!.startAt!)
    : null;
  const end = isValidDateValue(exp.schedule?.endAt)
    ? new Date(exp.schedule!.endAt!)
    : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

// ─── main layout ─────────────────────────────────────────────────
export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const track = useTrackImpression(); // <-- hook used for banners / redirects

  const [state, setState] = useState<SystemState>("loading");
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [activeIds, setActiveIds] = useState<{
    popup: string[];
    banner: string[];
    full_page: string[];
    redirect: string[];
  }>({
    popup: [],
    banner: [],
    full_page: [],
    redirect: [],
  });

  const loadExperiences = useCallback(async () => {
    setState("loading");
    try {
      const res = await api.get("/experiences/public", { timeout: 8000 });
      const data = res?.data?.data ?? res?.data;
      if (!Array.isArray(data)) throw new Error("Invalid payload");
      setExperiences(data);
      setState("ready");
    } catch (error) {
      console.error(error);
      if (!navigator.onLine) setState("offline");
      else if (axios.isAxiosError(error)) {
        if (!error.response) setState("offline");
        else if (error.response.status >= 500) setState("backend");
        else setState("blocked");
      } else setState("blocked");
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const availableExperiences = useMemo(() => {
    return experiences
      .filter((e) => e.enabled)
      .filter((e) => shouldRenderExperienceOnRoute(e, pathname))
      .filter(isExperienceWithinSchedule)
      .sort((a, b) => b.priority - a.priority);
  }, [experiences, pathname]);

  const fullPageExperience = useMemo(() => {
    return availableExperiences.find((e) => e.type === "full_page");
  }, [availableExperiences]);

  // ─── trigger activation (applies to ALL types) + track view ─────
  useEffect(() => {
    if (!availableExperiences.length) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const activate = (id: string, type: Experience["type"]) => {
      setActiveIds((prev) => ({
        ...prev,
        [type]: prev[type].includes(id) ? prev[type] : [...prev[type], id],
      }));
      // Track a "view" whenever the experience becomes active
      track(id, "view");
    };

    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type !== "scroll") return;
        const target = Number(exp.trigger?.value || 50);
        if (pct < target) return;
        activate(exp._id, exp.type);
      });
    };

    const onExit = (e: MouseEvent) => {
      if (e.clientY > 20) return;
      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type === "exit_intent") {
          activate(exp._id, exp.type);
        }
      });
    };

    availableExperiences.forEach((exp) => {
      const trigger = exp.trigger?.type || "always";
      if (trigger === "always") {
        activate(exp._id, exp.type);
      }
      if (trigger === "timer") {
        const delay = Number(exp.trigger?.value || 3000);
        const timer = setTimeout(() => activate(exp._id, exp.type), delay);
        timers.push(timer);
      }
    });

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mouseleave", onExit);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onExit);
    };
  }, [availableExperiences, track]);

  // ─── system states ────────────────────────────────────────────
  if (state === "loading") return <SystemExperience variant="loading" />;
  if (state === "offline") return <SystemExperience variant="offline" onRetry={loadExperiences} />;
  if (state === "backend") return <SystemExperience variant="backend" onRetry={loadExperiences} />;
  if (state === "blocked") return <SystemExperience variant="blocked" onRetry={loadExperiences} />;

  // ─── render an experience with the correct container + close tracking ──
  const renderExperience = (exp: Experience) => {
    const baseConfig = {
      ...exp.payload,
      titleOverride: exp.content?.titleOverride,
    };

    switch (exp.type) {
      case "full_page": {
        const fullPageOpts = exp.options as IFullPageOptions | undefined;
        return (
          <FullPageExperience
            key={exp._id}
            config={{ ...baseConfig, options: fullPageOpts }}
          >
            <ExperienceContent experience={exp} />
          </FullPageExperience>
        );
      }
      case "popup": {
        const popupOpts = exp.options as IPopupOptions | undefined;
        return (
          <PopupExperience
            key={exp._id}
            config={{ ...baseConfig, options: popupOpts }}
            onClose={() => track(exp._id, "close")}
          >
            <ExperienceContent experience={exp} />
          </PopupExperience>
        );}
      case "banner": {
        const bannerOpts = exp.options as IBannerOptions | undefined;
        return (
          <BannerExperience
            key={exp._id}
            config={{ ...baseConfig, options: bannerOpts }}
            onClose={() => track(exp._id, "close")}
          >
            <ExperienceContent experience={exp} />
          </BannerExperience>
        );
      }
      case "redirect":
        // Track view and then execute redirect
        track(exp._id, "view");
        const url = exp.content?.resourceKey || exp.content?.resourceId || "";
        if (url && typeof window !== "undefined") {
          const opts = exp.options as IRedirectOptions | undefined;
          const delay = opts?.delayMs ?? 0;
          const newTab = opts?.newTab ?? false;
          setTimeout(() => {
            if (newTab) window.open(url, "_blank");
            else window.location.href = url;
          }, delay);
        }
        return null;
      default:
        return null;
    }
  };

  // ─── full‑page takeover (highest priority) ────────────────────
  if (fullPageExperience && activeIds.full_page.includes(fullPageExperience._id)) {
    return renderExperience(fullPageExperience);
  }

  return (
    <>
      {/* Redirects (already tracked inside renderExperience, just execute) */}
      {availableExperiences
        .filter((e) => e.type === "redirect" && activeIds.redirect.includes(e._id))
        .map(renderExperience)}

      {/* Banners */}
      {availableExperiences
        .filter((e) => e.type === "banner" && activeIds.banner.includes(e._id))
        .map(renderExperience)}

      {/* Normal page content */}
      {children}

      {/* Popups */}
      {availableExperiences
        .filter((e) => e.type === "popup" && activeIds.popup.includes(e._id))
        .map(renderExperience)}
    </>
  );
}