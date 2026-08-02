"use client";

import { useCallback } from "react";
import api from "@/lib/api";

export function useTrackImpression() {
  const track = useCallback(
    async (
      experienceId: string,
      action: "view" | "click" | "close" | "convert",
      extra?: { metadata?: Record<string, any> }
    ) => {
      try {
        const device = /Mobi|Android/i.test(navigator.userAgent)
          ? "mobile"
          : /Tablet|iPad/i.test(navigator.userAgent)
          ? "tablet"
          : "desktop";
        const referrer = document.referrer || "";

        // Get or create a session ID
        let sessionId = localStorage.getItem("exp_session_id");
        if (!sessionId) {
          sessionId = (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
          localStorage.setItem("exp_session_id", sessionId);
        }

        const payload = {
          experienceId,
          action,
          device,
          referrer,
          sessionId,
          metadata: extra?.metadata,
        };

        const res = await api.post("/experiences/public/impression", payload);
        console.log(`[Analytics] ${action} tracked for ${experienceId}`, res.status);
      } catch (err: any) {
        // Log the real error so you can debug it
        console.error(`[Analytics] Failed to track ${action}:`, err?.response?.data || err.message);
      }
    },
    []
  );

  return track;
}