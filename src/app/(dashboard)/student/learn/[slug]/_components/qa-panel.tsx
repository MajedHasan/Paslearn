"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  HelpCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

interface Answer {
  _id: string;
  user?: { name: string };
  body: string;
  isInstructorAnswer: boolean;
  createdAt: string;
}

interface Thread {
  _id: string;
  title: string;
  body: string;
  user?: { name: string };
  isResolved: boolean;
  answers: Answer[];
  createdAt: string;
}

export function QaPanel({
  courseId,
  lessonId,
  lessonTitle,
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/qa/courses/${courseId}/qa`, {
        params: { lessonId, limit: 20 },
      });
      setThreads(r.data.data || []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const ask = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error("Add a title and your question");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/qa/courses/${courseId}/qa`, {
        title: newTitle.trim(),
        body: newBody.trim(),
        lessonId,
      });
      toast.success("Question posted!");
      setNewTitle("");
      setNewBody("");
      setShowAsk(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const reply = async (threadId: string) => {
    const body = replyDraft[threadId]?.trim();
    if (!body) return;
    setReplying(threadId);
    try {
      await api.post(`/qa/qa/${threadId}/answers`, { body });
      setReplyDraft((p) => ({ ...p, [threadId]: "" }));
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to reply");
    } finally {
      setReplying(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0177FB]/10">
            <MessageSquare className="h-4 w-4 text-[#0177FB]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Questions about this lesson
            </h3>
            <p className="text-[11px] text-slate-500">
              {threads.length} question{threads.length === 1 ? "" : "s"} ·{" "}
              {lessonTitle}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={showAsk ? "outline" : "default"}
          onClick={() => setShowAsk((v) => !v)}
          className={
            showAsk
              ? "rounded-lg"
              : "rounded-lg bg-[#0177FB] hover:bg-[#0156C7]"
          }
        >
          {showAsk ? "Cancel" : "Ask a question"}
        </Button>
      </div>

      {showAsk && (
        <div className="border-b border-slate-100 bg-slate-50/40 p-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Short title for your question"
            className="mb-2 rounded-lg bg-white"
          />
          <Textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="mb-2 rounded-lg bg-white"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={ask}
              disabled={submitting || !newTitle.trim() || !newBody.trim()}
              className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
            >
              {submitting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-3.5 w-3.5" />
              )}
              Post question
            </Button>
          </div>
        </div>
      )}

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#0177FB]" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <HelpCircle className="h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-900">
              No questions yet
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Be the first to ask about this lesson
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((t) => {
              const isOpen = expanded[t._id];
              return (
                <div
                  key={t._id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <button
                    onClick={() =>
                      setExpanded((p) => ({ ...p, [t._id]: !p[t._id] }))
                    }
                    className="flex w-full items-start gap-2.5 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[10px] font-black text-white">
                      {t.user?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-black text-slate-900">
                        {t.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                        {t.user?.name || "Student"} ·{" "}
                        {formatDistanceToNow(new Date(t.createdAt))} ago
                      </p>
                    </div>
                    {t.isResolved && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="mr-0.5 inline h-2.5 w-2.5" />
                        Resolved
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {isOpen && (
                    <>
                      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-slate-700">
                        {t.body}
                      </p>

                      {t.answers.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {t.answers.map((a) => (
                            <div
                              key={a._id}
                              className={`rounded-lg p-2.5 ${
                                a.isInstructorAnswer
                                  ? "border-l-2 border-[#0177FB] bg-[#0177FB]/5"
                                  : "bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                <User className="h-3 w-3 text-slate-400" />
                                {a.user?.name || "User"}
                                {a.isInstructorAnswer && (
                                  <span className="rounded-full bg-[#0177FB] px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-white">
                                    Instructor
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-700">
                                {a.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Textarea
                          value={replyDraft[t._id] || ""}
                          onChange={(e) =>
                            setReplyDraft((p) => ({
                              ...p,
                              [t._id]: e.target.value,
                            }))
                          }
                          placeholder="Add your answer..."
                          rows={2}
                          className="flex-1 rounded-lg text-xs"
                        />
                        <Button
                          size="icon"
                          onClick={() => reply(t._id)}
                          disabled={
                            replying === t._id || !replyDraft[t._id]?.trim()
                          }
                          className="shrink-0 rounded-lg bg-[#0177FB] hover:bg-[#0156C7]"
                        >
                          {replying === t._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}