"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, CheckCircle2, XCircle, Clock, RefreshCw,
  FileQuestion, FileText, Tags, MessageSquare, Languages,
  BrainCircuit, Wand2, ListChecks, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import {
  EmptyState, ErrorState, LoadingState, StatCard,
} from "../../_components/ui";
import { CourseNav } from "../../_components/course-nav";

const JOB_META: Record<string, { label: string; icon: any; color: string }> = {
  "course.auto_quiz": { label: "Quiz Generation", icon: FileQuestion, color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10" },
  "course.summary": { label: "Summary", icon: FileText, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
  "course.transcript": { label: "Transcript", icon: FileText, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  "course.chatbot": { label: "Chatbot", icon: MessageSquare, color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10" },
  "course.translate": { label: "Translation", icon: Languages, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  "course.personalized_path": { label: "Learning Path", icon: BrainCircuit, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" },
  "course.outline": { label: "Course Outline", icon: ListChecks, color: "text-teal-600 bg-teal-50 dark:bg-teal-500/10" },
  "course.description_suggest": { label: "Description", icon: Wand2, color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
  "course.tag_suggest": { label: "Tags", icon: Tags, color: "text-lime-600 bg-lime-50 dark:bg-lime-500/10" },
};

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  queued: { label: "Queued", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", icon: Loader2 },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: XCircle },
};

export default function CourseAiPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, jobsRes] = await Promise.all([
        api.get("/course-ai/provider").catch(() => ({ data: { data: null } })),
        api.get("/course-ai/jobs", { params: { courseId, limit: 50 } }),
      ]);
      setProvider(provRes.data.data);
      setJobs(jobsRes.data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load AI jobs");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const retry = async (jobId: string) => {
    setRetrying(jobId);
    try {
      await api.post(`/course-ai/jobs/${jobId}/retry`);
      toast.success("Retried");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Retry failed");
    } finally {
      setRetrying(null);
    }
  };

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const stats = {
    total: jobs.length,
    done: jobs.filter((j) => j.status === "done").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    running: jobs.filter((j) => j.status === "queued" || j.status === "processing").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Course Studio
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Studio
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Everything AI-generated for this course — quiz questions, summaries, transcripts, and more.
            </p>
          </div>
        </div>

        <CourseNav courseId={courseId} counts={{ aiJobs: stats.running }} />

        {provider && (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm ${
              provider.isStub
                ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <Sparkles
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  provider.isStub ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              />
              <div>
                <p className={`font-semibold ${provider.isStub ? "text-amber-900 dark:text-amber-300" : "text-emerald-900 dark:text-emerald-300"}`}>
                  Provider: {provider.name}{provider.isStub && " (stub)"}
                </p>
                <p className={`mt-0.5 text-xs ${provider.isStub ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                  {provider.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total jobs" value={stats.total} icon={Sparkles} color="violet" />
          <StatCard label="Completed" value={stats.done} icon={CheckCircle2} color="emerald" />
          <StatCard label="Running" value={stats.running} icon={Clock} color="blue" />
          <StatCard label="Failed" value={stats.failed} icon={XCircle} color="rose" />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/60 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900">
          {[
            { key: "all", label: "All" },
            { key: "done", label: "Done" },
            { key: "queued", label: "Queued" },
            { key: "failed", label: "Failed" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState label="Loading AI jobs..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={filter === "all" ? "No AI jobs yet" : `No ${filter} jobs`}
              description={
                filter === "all"
                  ? "Use AI in the course editor — generate quiz questions, descriptions, tags, and outlines."
                  : "Try changing the filter or create a new AI job from the editor."
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((job) => {
                const meta = JOB_META[job.type] || { label: job.type, icon: Sparkles, color: "text-slate-600 bg-slate-100" };
                const statusMeta = STATUS_META[job.status] || STATUS_META.queued;
                const Icon = meta.icon;
                const StatusIcon = statusMeta.icon;
                const open = expandedJob === job._id;

                return (
                  <div
                    key={job._id}
                    className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{meta.label}</p>
                          <Badge className={`rounded-full text-[10px] ${statusMeta.className}`}>
                            <StatusIcon className={`mr-1 h-2.5 w-2.5 ${job.status === "processing" ? "animate-spin" : ""}`} />
                            {statusMeta.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDistanceToNow(new Date(job.createdAt))} ago
                          {job.provider && ` · ${job.provider}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {job.status === "failed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg"
                            onClick={() => retry(job._id)}
                            disabled={retrying === job._id}
                          >
                            {retrying === job._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => setExpandedJob(open ? null : job._id)}
                        >
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {open && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        {job.error && (
                          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                            <strong>Error:</strong> {job.error}
                          </div>
                        )}
                        {job.input && (
                          <div className="mb-3">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Input</p>
                            <pre className="overflow-x-auto rounded-lg bg-white p-2 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                              {JSON.stringify(job.input, null, 2)}
                            </pre>
                          </div>
                        )}
                        {job.output && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Output</p>
                            <pre className="max-h-[300px] overflow-auto rounded-lg bg-white p-2 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                              {JSON.stringify(job.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}