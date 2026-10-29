"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Star, MessageSquare, Eye, EyeOff, Send, Loader2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import {
  EmptyState, ErrorState, LoadingState,
} from "../../_components/ui";
import { CourseNav } from "../../_components/course-nav";

export default function CourseReviewsPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/teacher/reviews", {
        params: { courseId, page, limit },
      });
      const list = r.data.data || [];
      setReviews(list);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);

      if (page === 1) {
        const avg = list.length
          ? list.reduce((a: number, b: any) => a + b.rating, 0) / list.length
          : 0;
        setStats({
          avg: Math.round(avg * 10) / 10,
          total: r.data.total || 0,
          awaiting: list.filter((r: any) => !r.teacherReply).length,
        });
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [courseId, page]);

  useEffect(() => { load(); }, [load]);

  const submitReply = async (reviewId: string) => {
    const text = replyDraft[reviewId]?.trim();
    if (!text) return;
    setBusy(reviewId);
    try {
      await api.post(`/teacher/reviews/${reviewId}/reply`, { text });
      toast.success("Reply posted");
      setReplyDraft((d) => ({ ...d, [reviewId]: "" }));
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to reply");
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = async (reviewId: string, current: string) => {
    setBusy(reviewId);
    try {
      await api.patch(`/teacher/reviews/${reviewId}/status`, {
        status: current === "hidden" ? "visible" : "hidden",
      });
      toast.success(current === "hidden" ? "Review shown" : "Review hidden");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Course Studio
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Reviews & Ratings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Reply to students and manage feedback.
            </p>
          </div>
        </div>

        <CourseNav courseId={courseId} counts={{ reviews: total }} />

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Total reviews</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Average rating</p>
              <div className="mt-1 flex items-center gap-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.avg.toFixed(1)}
                </p>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Awaiting reply</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.awaiting}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading reviews..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Once students complete your course and leave a review, it will appear here."
            />
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                        {r.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {r.user?.name || "Student"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(r.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      {r.status === "hidden" && (
                        <Badge className="rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>

                  {r.title && (
                    <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                      {r.title}
                    </p>
                  )}
                  {r.comment && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {r.comment}
                    </p>
                  )}

                  {r.teacherReply ? (
                    <div className="mt-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-3 dark:bg-indigo-500/10">
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                        Your reply
                      </p>
                      <p className="mt-1 text-sm text-indigo-800 dark:text-indigo-400">
                        {r.teacherReply.text}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        rows={2}
                        className="rounded-xl"
                        placeholder="Write a thoughtful reply..."
                        value={replyDraft[r._id] || ""}
                        onChange={(e) =>
                          setReplyDraft((d) => ({ ...d, [r._id]: e.target.value }))
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => toggleStatus(r._id, r.status)}
                          disabled={busy === r._id}
                        >
                          {r.status === "hidden" ? (
                            <>
                              <Eye className="mr-1 h-3.5 w-3.5" /> Show
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => submitReply(r._id)}
                          disabled={busy === r._id || !replyDraft[r._id]?.trim()}
                        >
                          {busy === r._id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-1 h-3.5 w-3.5" />
                          )}
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
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