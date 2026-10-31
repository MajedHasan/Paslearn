"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/global/video/player/video-player";
import {
  Loader2,
  FileText,
  File,
  ClipboardList,
  FileQuestion,
  Download,
  Lock,
  CheckCircle2,
  PlayCircle,
  Clock,
  ListChecks,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type LessonType = "video" | "text" | "quiz" | "exam" | "assignment" | "file";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: number;
  freePreview: boolean;
  quizId?: string | null;
  locked: boolean;
  dripLocked: boolean;
  unlocksAt?: string | null;
  textContent?: string;
  assignmentInstructions?: string;
  progress?: { isCompleted: boolean } | null;
}

export function LessonViewer({
  slug,
  courseId,
  lesson,
  onAutoComplete,
  thumbnailUrl,
}: {
  slug: string;
  courseId: string;
  lesson: Lesson;
  onAutoComplete: () => void;
  thumbnailUrl?: string | null;
}) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson.type !== "video" && lesson.type !== "file") return;
    if (lesson.locked || lesson.dripLocked) return;

    setPlaybackLoading(true);
    setPlaybackError(null);
    setPlaybackUrl(null);

    (async () => {
      try {
        const r = await api.get(
          `/learning/courses/${slug}/lessons/${lesson.id}/playback`
        );
        setPlaybackUrl(r.data.data.url);
      } catch (e: any) {
        setPlaybackError(
          e?.response?.data?.message || "Failed to load content"
        );
      } finally {
        setPlaybackLoading(false);
      }
    })();
  }, [lesson.id, lesson.type, lesson.locked, lesson.dripLocked, slug]);

  // Locked
  if (lesson.locked || lesson.dripLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-900">
          {lesson.dripLocked ? "Unlocks soon" : "Locked lesson"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {lesson.dripLocked && lesson.unlocksAt
            ? `Available on ${new Date(lesson.unlocksAt).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" }
              )}`
            : "Complete earlier lessons to unlock this one."}
        </p>
      </div>
    );
  }

  // Video
  if (lesson.type === "video") {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg">
        {playbackLoading ? (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-xs text-white/60">Loading video...</p>
            </div>
          </div>
        ) : playbackError ? (
          <div className="flex aspect-video flex-col items-center justify-center bg-slate-900 p-6 text-center">
            <p className="text-sm font-medium text-rose-400">{playbackError}</p>
          </div>
        ) : playbackUrl ? (
          <VideoPlayer
            src={playbackUrl}
            poster={thumbnailUrl || undefined}
            autoPlay
            className="aspect-video w-full"
            onEnded={onAutoComplete}
          />
        ) : null}
      </div>
    );
  }

  // Text
  if (lesson.type === "text") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#0177FB]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          <FileText className="h-3.5 w-3.5" /> Article
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-slate-700">
          {lesson.textContent || "No content yet."}
        </div>
      </div>
    );
  }

  // File
  if (lesson.type === "file") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#0177FB]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          <File className="h-3.5 w-3.5" /> Downloadable resource
        </div>
        {playbackLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing download...
          </div>
        ) : playbackError ? (
          <p className="text-sm text-rose-600">{playbackError}</p>
        ) : playbackUrl ? (
          <a
            href={playbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-[#0177FB] hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-md">
              <File className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 group-hover:text-[#0177FB]">
                Download resource
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Opens in new tab · Keep for offline
              </p>
            </div>
            <Download className="h-5 w-5 shrink-0 text-[#0177FB]" />
          </a>
        ) : null}
      </div>
    );
  }

  // Assignment
  if (lesson.type === "assignment") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#FF7E02]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#FF7E02]">
          <ClipboardList className="h-3.5 w-3.5" /> Assignment
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-slate-700">
          {lesson.assignmentInstructions || "No instructions yet."}
        </div>
      </div>
    );
  }

  // Quiz / exam
  if (lesson.type === "quiz" || lesson.type === "exam") {
    if (!lesson.quizId) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-900">
            Quiz not yet available
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {`The instructor hasn't added questions yet.`}
          </p>
        </div>
      );
    }
    return (
      <QuizPlayer
        quizId={lesson.quizId}
        title={lesson.title}
        onPassed={onAutoComplete}
      />
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────
// Inline Quiz Player
// ─────────────────────────────────────────────────────────
interface QuizQuestion {
  _id: string;
  type: "single_choice" | "multi_choice" | "true_false" | "short_text" | "long_text";
  prompt: string;
  points: number;
  options?: Array<{ id: string; text: string }>;
}

interface QuizData {
  quiz: {
    _id: string;
    title: string;
    instructions?: string;
    passingScore: number;
    timeLimitSec?: number;
    maxAttempts: number;
    questions: QuizQuestion[];
  };
  attempts: Array<{
    _id: string;
    attemptNumber: number;
    score: number;
    maxScore: number;
    passed: boolean;
    submittedAt?: string;
  }>;
  canStart: boolean;
}

function QuizPlayer({
  quizId,
  title,
  onPassed,
}: {
  quizId: string;
  title: string;
  onPassed: () => void;
}) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [attempt, setAttempt] = useState<{ _id: string; quiz: any } | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/quizzes/${quizId}`);
      setQuizData(r.data.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    load();
  }, [load]);

  const startAttempt = async () => {
    setStarting(true);
    try {
      const r = await api.post(`/quizzes/${quizId}/attempts`);
      const data = r.data.data;
      if (data.attempt) {
        setAttempt({ _id: data.attempt._id, quiz: data.quiz });
        setAnswers({});
        setResult(null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to start quiz");
    } finally {
      setStarting(false);
    }
  };

  const submitAttempt = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const r = await api.post(`/attempts/${attempt._id}/submit`, {
        answers: payload,
      });
      setResult(r.data.data);
      setAttempt(null);
      setAnswers({});
      await load();
      if (r.data.data.passed) {
        toast.success(`Passed with ${r.data.data.percent}%! 🎉`);
        onPassed();
      } else {
        toast.error(`Score: ${r.data.data.percent}% — try again`);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
      </div>
    );
  }

  if (!quizData) return null;

  const { quiz, attempts, canStart } = quizData;
  const bestAttempt = attempts.find((a) => a.passed);
  const lastAttempt = attempts[0];

  // Active attempt
  if (attempt) {
    const questions = attempt.quiz.questions || [];
    const allAnswered = questions.every((q: any) => {
      const a = answers[q._id];
      return a !== undefined && a !== "" && (!Array.isArray(a) || a.length > 0);
    });

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-violet-50 to-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
            In progress
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900">
            {attempt.quiz.title || title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {questions.length} questions · Pass at {quiz.passingScore}%
          </p>
        </div>
        <div className="space-y-4 p-5">
          {questions.map((q: any, i: number) => (
            <div key={q._id} className="rounded-xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-bold text-slate-900">
                {i + 1}. {q.prompt}
              </p>
              {(q.type === "single_choice" || q.type === "true_false") && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: any) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors ${
                        answers[q._id] === opt.id
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === opt.id}
                        onChange={() =>
                          setAnswers((p) => ({ ...p, [q._id]: opt.id }))
                        }
                        className="h-4 w-4 accent-violet-500"
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}
              {q.type === "multi_choice" && (
                <div className="space-y-2">
                  {(q.options || []).map((opt: any) => {
                    const current: string[] = answers[q._id] || [];
                    const checked = current.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors ${
                          checked
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setAnswers((p) => ({
                              ...p,
                              [q._id]: e.target.checked
                                ? [...current, opt.id]
                                : current.filter((id) => id !== opt.id),
                            }))
                          }
                          className="h-4 w-4 accent-violet-500"
                        />
                        {opt.text}
                      </label>
                    );
                  })}
                </div>
              )}
              {(q.type === "short_text" || q.type === "long_text") && (
                <textarea
                  value={answers[q._id] || ""}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [q._id]: e.target.value }))
                  }
                  rows={q.type === "long_text" ? 4 : 1}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Your answer..."
                />
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 p-5">
          <Button
            onClick={submitAttempt}
            disabled={submitting || !allAnswered}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 font-bold shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>Submit answers</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Result
  if (result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            result.passed ? "bg-emerald-100" : "bg-rose-100"
          }`}
        >
          {result.passed ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          ) : (
            <FileQuestion className="h-8 w-8 text-rose-600" />
          )}
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900">
          {result.passed ? "You passed! 🎉" : "Not quite there"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {result.score} of {result.maxScore} points ({result.percent}%)
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Passing: {quiz.passingScore}%
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {!result.passed && canStart && (
            <Button
              onClick={() => {
                setResult(null);
                startAttempt();
              }}
              className="rounded-lg bg-violet-500 hover:bg-violet-600"
            >
              Try again
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setResult(null)}
            className="rounded-lg"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Intro card
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-md">
          <FileQuestion className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
            Quiz
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900">{quiz.title}</h2>
          {quiz.instructions && (
            <p className="mt-1 text-sm text-slate-600">{quiz.instructions}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {quiz.questions.length} questions
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pass at {quiz.passingScore}%
            </span>
            {quiz.timeLimitSec && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {Math.round(quiz.timeLimitSec / 60)} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {quiz.maxAttempts === 0
                ? "Unlimited attempts"
                : `${quiz.maxAttempts} attempts`}
            </span>
          </div>

          {bestAttempt && (
            <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <CheckCircle2 className="mr-1 inline h-3 w-3" />
              Best: {bestAttempt.score}/{bestAttempt.maxScore} (
              {Math.round((bestAttempt.score / bestAttempt.maxScore) * 100)}%)
            </div>
          )}
          {!bestAttempt && lastAttempt && (
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
              Last attempt:{" "}
              {Math.round((lastAttempt.score / lastAttempt.maxScore) * 100)}%
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={startAttempt}
              disabled={starting || !canStart}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 font-bold shadow-md"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting...
                </>
              ) : !canStart ? (
                <>No attempts left</>
              ) : attempts.length > 0 ? (
                <>Retake quiz</>
              ) : (
                <>Start quiz</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}