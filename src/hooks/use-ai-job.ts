"use client";

import { useCallback, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

/**
 * Placeholder ObjectId for pre-creation jobs (description / tags / outline).
 * These don't need a real course — just a valid ObjectId format for the DB schema.
 */
export const FAKE_REF_ID = "000000000000000000000000";

export type AiJobType =
  | "course.auto_quiz"
  | "course.summary"
  | "course.transcript"
  | "course.chatbot"
  | "course.translate"
  | "course.personalized_path"
  | "course.outline"
  | "course.description_suggest"
  | "course.tag_suggest";

export interface RunAiJobInput {
  type: AiJobType;
  refType: "course" | "lesson";
  refId: string;
  courseId?: string;
  input?: Record<string, any>;
}

export function useAiJob() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (payload: RunAiJobInput) => {
    setLoading(true);
    try {
      const r = await api.post("/course-ai/jobs/run", payload);
      return r.data.data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || "AI request failed";
      toast.error(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading };
}