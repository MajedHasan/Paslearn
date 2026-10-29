"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, Send, CheckCircle2, Pin, Loader2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import {
  EmptyState, ErrorState, LoadingState,
} from "../../_components/ui";
import { CourseNav } from "../../_components/course-nav";

export default function CourseQAPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/qa/courses/${courseId}/qa`, {
        params: { page, limit },
      });
      setThreads(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load Q&A");
    } finally {
      setLoading(false);
    }
  }, [courseId, page]);

  useEffect(() => { load(); }, [load]);

  const answer = async (threadId: string) => {
    const body = answerDraft[threadId]?.trim();
    if (!body) return;
    setBusy(threadId);
    try {
      await api.post(`/qa/qa/${threadId}/answers`, { body });
      toast.success("Answer posted");
      setAnswerDraft((d) => ({ ...d, [threadId]: "" }));
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to post");
    } finally {
      setBusy(null);
    }
  };

  const toggleResolve = async (threadId: string, current: boolean) => {
    setBusy(threadId);
    try {
      await api.post(`/qa/qa/${threadId}/resolve`, { resolved: !current });
      load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setBusy(null);
    }
  };

  const togglePin = async (threadId: string, current: boolean) => {
    setBusy(threadId);
    try {
      await api.post(`/qa/qa/${threadId}/pin`, { pinned: !current });
      load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Course Studio
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Q&A
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Answer student questions and mark resolutions.
            </p>
          </div>
        </div>

        <CourseNav courseId={courseId} counts={{ qa: total }} />

        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading questions..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : threads.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No questions yet"
              description="Once students start asking questions, you'll see them here."
            />
          ) : (
            <div className="space-y-4">
              {threads.map((t) => (
                <div
                  key={t._id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.isPinned && (
                          <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </h3>
                        {t.isResolved && (
                          <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t.body}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Asked by {t.user?.name || "Student"} ·{" "}
                        {formatDistanceToNow(new Date(t.createdAt))} ago
                      </p>
                    </div>
                  </div>

                  {t.answers?.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {t.answers.map((a: any) => (
                        <div
                          key={a._id}
                          className={`rounded-xl p-3 ${
                            a.isInstructorAnswer
                              ? "border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                              : "bg-slate-50 dark:bg-slate-800/50"
                          }`}
                        >
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {a.user?.name || "Student"}
                            {a.isInstructorAnswer && (
                              <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                                · Instructor
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {a.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <Textarea
                      rows={2}
                      className="rounded-xl"
                      placeholder="Write your answer..."
                      value={answerDraft[t._id] || ""}
                      onChange={(e) =>
                        setAnswerDraft((d) => ({ ...d, [t._id]: e.target.value }))
                      }
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => togglePin(t._id, !!t.isPinned)}
                        disabled={busy === t._id}
                      >
                        <Pin className="mr-1 h-3.5 w-3.5" />
                        {t.isPinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => toggleResolve(t._id, !!t.isResolved)}
                        disabled={busy === t._id}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        {t.isResolved ? "Reopen" : "Resolve"}
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => answer(t._id)}
                        disabled={busy === t._id || !answerDraft[t._id]?.trim()}
                      >
                        {busy === t._id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3.5 w-3.5" />
                        )}
                        Answer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Page {page} of {totalPages} · {total} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}