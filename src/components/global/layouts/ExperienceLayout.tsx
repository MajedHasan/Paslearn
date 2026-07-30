"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

import api from "@/lib/api";
import type { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";

import WaitlistPage from "@/components/experiences/WaitlistPage";
import PopupExperience from "@/components/experiences/PopupExperience";
import BannerExperience from "@/components/experiences/BannerExperience";
import DynamicFormExperience from "@/components/experiences/DynamicFormExperience";
import SystemExperience from "@/components/system/SystemExperience";

const COMPONENTS: Record<
  string,
  React.ComponentType<{ config?: Record<string, any> }>
> = {
  waitlist_v1: WaitlistPage,
  popup_v1: PopupExperience,
  banner_v1: BannerExperience,
  dynamic_form_v1: DynamicFormExperience,
};

type SystemState = "loading" | "ready" | "offline" | "backend" | "blocked";

function getFormResourceKey(experience: Experience): string {
  console.log(
    "formModule: ",
    experience.modules?.find((m) => m.type === "form"),
  );

  const formModule = experience.modules?.find(
    (module) => module.type === "form",
  );

  const raw =
    formModule?.config?.resourceKey ??
    formModule?.config?.formKey ??
    formModule?.config?.formId ??
    formModule?.config?.key ??
    formModule?.key ??
    experience.payload?.resourceKey ??
    experience.payload?.formKey ??
    experience.payload?.formId ??
    experience.payload?.key;

  return typeof raw === "string" ? raw.trim() : "";
}

function isValidDateValue(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function shouldRenderExperienceOnRoute(
  experience: Experience,
  pathname: string,
) {
  const excluded = experience.target?.excludeRoutes?.includes(pathname);
  if (excluded) return false;

  if (experience.target?.scope === "global") {
    return true;
  }

  return experience.target?.routes?.includes(pathname) ?? false;
}

function isExperienceWithinSchedule(experience: Experience) {
  const now = new Date();

  const startAt = isValidDateValue(experience.schedule?.startAt)
    ? new Date(experience.schedule!.startAt!)
    : null;

  const endAt = isValidDateValue(experience.schedule?.endAt)
    ? new Date(experience.schedule!.endAt!)
    : null;

  if (startAt && now < startAt) return false;
  if (endAt && now > endAt) return false;

  return true;
}

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
        setState("offline");
        return;
      }

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setState("offline");
          return;
        }

        if (error.response.status >= 500) {
          setState("backend");
          return;
        }
      }

      setState("blocked");
    }
  }, []);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const availableExperiences = useMemo(() => {
    return experiences
      .filter((exp) => exp.enabled)
      .filter((exp) => shouldRenderExperienceOnRoute(exp, pathname))
      .filter(isExperienceWithinSchedule)
      .sort((a, b) => b.priority - a.priority);
  }, [experiences, pathname]);

  const fullPageExperience = useMemo(() => {
    return availableExperiences.find((exp) => exp.type === "full_page");
  }, [availableExperiences]);

  const renderExperience = useCallback((experience: Experience) => {
    const Component = COMPONENTS[experience.componentKey];

    if (!Component) {
      return null;
    }

    // Dynamic form is a standalone renderer, not embedded into other shells.
    if (experience.componentKey === "dynamic_form_v1") {
      const formResourceKey = getFormResourceKey(experience);

      console.log("Component: ", formResourceKey);

      if (!formResourceKey) {
        return null;
      }

      return (
        <DynamicFormExperience
          key={experience._id}
          config={{
            resourceKey: formResourceKey,
            embedded: experience.type !== "full_page",
          }}
        />
      );
    }

    return <Component key={experience._id} config={experience.payload ?? {}} />;
  }, []);

  useEffect(() => {
    if (!availableExperiences.length) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const activatePopup = (id: string) => {
      setActivePopupIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const activateBanner = (id: string) => {
      setActiveBannerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const onScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent =
        totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;

      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type !== "scroll") return;

        const target = Number(exp.trigger?.value || 50);

        if (scrollPercent < target) return;

        if (exp.type === "popup") {
          activatePopup(exp._id);
        }

        if (exp.type === "banner") {
          activateBanner(exp._id);
        }
      });
    };

    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY > 20) return;

      availableExperiences.forEach((exp) => {
        if (exp.trigger?.type !== "exit_intent") return;

        if (exp.type === "popup") {
          activatePopup(exp._id);
        }
      });
    };

    availableExperiences.forEach((exp) => {
      const triggerType = exp.trigger?.type || "always";

      if (triggerType === "always") {
        if (exp.type === "popup") {
          activatePopup(exp._id);
        }

        if (exp.type === "banner") {
          activateBanner(exp._id);
        }
      }

      if (triggerType === "timer") {
        const delay = Number(exp.trigger?.value || 3000);

        const timer = setTimeout(() => {
          if (exp.type === "popup") {
            activatePopup(exp._id);
          }

          if (exp.type === "banner") {
            activateBanner(exp._id);
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

  if (fullPageExperience) {
    const rendered = renderExperience(fullPageExperience);

    if (!rendered) {
      return <SystemExperience variant="blocked" onRetry={loadExperiences} />;
    }

    return rendered;
  }

  return (
    <>
      {availableExperiences
        .filter(
          (exp) => exp.type === "banner" && activeBannerIds.includes(exp._id),
        )
        .map((exp) => renderExperience(exp))}

      {children}

      {availableExperiences
        .filter(
          (exp) => exp.type === "popup" && activePopupIds.includes(exp._id),
        )
        .map((exp) => renderExperience(exp))}
    </>
  );
}
