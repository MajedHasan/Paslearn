"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Menu,
  PlayCircle,
  FileText,
  FileQuestion,
  ClipboardList,
  File,
  Award,
  Clock,
  Star,
  Sparkles,
  ListChecks,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { LessonViewer } from "./_components/lesson-viewer";
import { QaPanel } from "./_components/qa-panel";
import { CompletionModal } from "./_components/completion-modal";

type LessonType = "video" | "text" | "quiz" | "exam" | "assignment" | "file";

interface LearningLesson {
  id: string;
  order: number;
  title: string;
  type: LessonType;
  duration?: number;
  freePreview: boolean;
  dripDays: number;
  quizId?: string | null;
  locked: boolean;
  dripLocked: boolean;
  unlocksAt?: string | null;
  textContent?: string;
  assignmentInstructions?: string;
  progress?: {
    isCompleted: boolean;
    lastPositionSec?: number;
    watchedSeconds?: number;
  } | null;
}

interface LearningSection {
  id: string;
  order: number;
  title: string;
  description?: string;
  lessons: LearningLesson[];
}

interface Certificate {
  issued: boolean;
  canClaim: boolean;
  certificateId: string | null;
  certificateNumber: string | null;
  verificationSlug: string | null;
  issuedAt: string | null;
}

interface Review {
  exists: boolean;
  canReview: boolean;
  rating: number | null;
  title: string | null;
  comment: string | null;
}

interface LearningView {
  course: {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    thumbnailUrl?: string | null;
    sectionsCount: number;
    lessonsCount: number;
    totalDurationSec: number;
    certificateEnabled: boolean;
    certificateAutoIssue: boolean;
    completionCriteria: string;
    category?: string;
    difficulty?: string;
    ratingAvg?: number;
    ratingCount?: number;
    teacher?: { _id: string; name: string; profileImageUrl?: string } | null;
  };
  enrollment: {
    progressPercent: number;
    lessonsCompleted: number;
    completedAt?: string | null;
    enrolledAt?: string | null;
  };
  certificate: Certificate;
  review: Review;
  sections: LearningSection[];
}

interface ActiveLesson {
  sectionId: string;
  lesson: LearningLesson;
}

const TYPE_ICONS: Record<LessonType, any> = {
  video: PlayCircle,
  text: FileText,
  quiz: FileQuestion,
  exam: ListChecks,
  assignment: ClipboardList,
  file: File,
};

function ProgressRing({
  percent,
  size = 44,
  stroke = 4,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0177FB" />
            <stop offset="100%" stopColor="#0156C7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0177FB] tabular-nums">
        {percent}%
      </span>
    </div>
  );
}

export default function LearningPlayerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const [view, setView] = useState<LearningView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [modalFocus, setModalFocus] = useState<"certificate" | "review" | null>(
    null
  );

  const openCompletionModal = useCallback(
    (focus: "certificate" | "review" | null = null) => {
      setModalFocus(focus);
      setCompletionOpen(true);
    },
    []
  );

  // ── Flattened lessons ─────────────────────────────────
  const flatLessons = useMemo(() => {
    if (!view) return [];
    const list: ActiveLesson[] = [];
    for (const section of view.sections) {
      for (const lesson of section.lessons) {
        list.push({ sectionId: section.id, lesson });
      }
    }
    return list;
  }, [view]);

  const activeIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return flatLessons.findIndex(
      (l) =>
        l.sectionId === activeLesson.sectionId &&
        l.lesson.id === activeLesson.lesson.id
    );
  }, [flatLessons, activeLesson]);

  // ── Navigation ───────────────────────────────────────
  const goNextWith = useCallback(
    (customView: LearningView) => {
      if (!activeLesson) return;
      const list: ActiveLesson[] = [];
      for (const s of customView.sections) {
        for (const l of s.lessons) list.push({ sectionId: s.id, lesson: l });
      }
      const idx = list.findIndex(
        (l) =>
          l.sectionId === activeLesson.sectionId &&
          l.lesson.id === activeLesson.lesson.id
      );
      if (idx >= 0 && idx < list.length - 1) {
        const next = list[idx + 1];
        if (next.lesson.locked || next.lesson.dripLocked) {
          toast.error("Next lesson is locked");
          return;
        }
        setActiveLesson(next);
        setMobileSidebarOpen(false);
      }
    },
    [activeLesson]
  );

  const goNext = useCallback(() => {
    if (!view) return;
    goNextWith(view);
  }, [view, goNextWith]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      const prev = flatLessons[activeIndex - 1];
      setActiveLesson(prev);
      setMobileSidebarOpen(false);
    }
  }, [flatLessons, activeIndex]);

  const selectLesson = (sectionId: string, lesson: LearningLesson) => {
    if (lesson.locked) {
      toast.error("This lesson is locked");
      return;
    }
    if (lesson.dripLocked) {
      const msg = lesson.unlocksAt
        ? `Unlocks ${new Date(lesson.unlocksAt).toLocaleDateString()}`
        : `Unlocks ${lesson.dripDays} days after enrollment`;
      toast.error(msg);
      return;
    }
    setActiveLesson({ sectionId, lesson });
    setMobileSidebarOpen(false);
  };

  // ── Mark complete ─────────────────────────────────────
  const markComplete = useCallback(
    async (opts: { advance?: boolean } = {}) => {
      if (!activeLesson || !view) return;
      if (activeLesson.lesson.progress?.isCompleted) {
        if (opts.advance) goNext();
        return;
      }

      setMarkingComplete(true);
      try {
        await api.post(
          `/learning/courses/${view.course._id}/sections/${activeLesson.sectionId}/lessons/${activeLesson.lesson.id}/progress`,
          { isCompleted: true }
        );

        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 2500);

        const r = await api.get(`/learning/courses/${slug}`);
        const fresh: LearningView = r.data.data;
        setView(fresh);

        const freshSection = fresh.sections.find(
          (s) => s.id === activeLesson.sectionId
        );
        const freshLesson = freshSection?.lessons.find(
          (l) => l.id === activeLesson.lesson.id
        );
        if (freshLesson) {
          setActiveLesson({ ...activeLesson, lesson: freshLesson });
        }

        if (fresh.enrollment.progressPercent >= 100 && !hasShownCompletion) {
          setHasShownCompletion(true);
          setTimeout(() => openCompletionModal(null), 500);
          toast.success("🎉 Course complete! Incredible work!");
        } else {
          toast.success("Lesson complete!");
        }

        if (opts.advance) {
          goNextWith(fresh);
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to mark complete");
      } finally {
        setMarkingComplete(false);
      }
    },
    [
      activeLesson,
      view,
      slug,
      hasShownCompletion,
      goNext,
      goNextWith,
      openCompletionModal,
    ]
  );

  // ── Load ─────────────────────────────────────────────
  const load = useCallback(
    async (opts: { preserveActive?: boolean } = {}) => {
      setError(null);
      try {
        const r = await api.get(`/learning/courses/${slug}`);
        const v: LearningView = r.data.data;
        setView(v);

        if (opts.preserveActive && activeLesson) {
          // keep current
        } else if (!activeLesson) {
          let picked: ActiveLesson | null = null;
          for (const section of v.sections) {
            for (const lesson of section.lessons) {
              if (!lesson.progress?.isCompleted) {
                picked = { sectionId: section.id, lesson };
                break;
              }
            }
            if (picked) break;
          }
          if (!picked && v.sections[0]?.lessons[0]) {
            picked = {
              sectionId: v.sections[0].id,
              lesson: v.sections[0].lessons[0],
            };
          }
          if (picked) setActiveLesson(picked);
        }

        if (v.enrollment.progressPercent >= 100 && !hasShownCompletion) {
          setHasShownCompletion(true);
          openCompletionModal(null);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "Course not found");
      } finally {
        setLoading(false);
      }
    },
    [slug, activeLesson, hasShownCompletion, openCompletionModal]
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ═══════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
          <p className="text-sm text-slate-500">Preparing your lesson...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════
  if (error || !view) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <Lock className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          {error || "Course not found"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          You need to enroll in this course to access the lessons.
        </p>
        <Link href="/student/courses" className="mt-6">
          <Button className="rounded-lg bg-[#0177FB] hover:bg-[#0156C7]">
            <ArrowLeft className="mr-2 h-4 w-4" /> My courses
          </Button>
        </Link>
      </div>
    );
  }

  const { course, enrollment, sections, certificate, review } = view;
  const isComplete = enrollment.progressPercent >= 100;
  const activeLessonMeta = activeLesson?.lesson;

  // ═══════════════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════════════
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Progress header */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Progress
            </p>
            <p className="mt-0.5 text-2xl font-black text-slate-900 tabular-nums">
              {enrollment.progressPercent}%
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {enrollment.lessonsCompleted} / {course.lessonsCount} lessons
            </p>
          </div>
          <ProgressRing percent={enrollment.progressPercent} size={56} />
        </div>
      </div>

      {/* Sections list */}
      <div className="flex-1 overflow-y-auto bg-slate-50/40 p-3">
        {sections.map((section, si) => {
          const sectionCompleted = section.lessons.every(
            (l) => l.progress?.isCompleted
          );
          return (
            <div key={section.id} className="mb-3">
              <div className="mb-1.5 flex items-center gap-2 px-2">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-black ${
                    sectionCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {sectionCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    si + 1
                  )}
                </span>
                <p className="min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {section.title}
                </p>
              </div>
              <div className="space-y-0.5">
                {section.lessons.map((lesson) => {
                  const Icon = TYPE_ICONS[lesson.type] || BookOpen;
                  const isActive =
                    activeLesson?.lesson.id === lesson.id &&
                    activeLesson?.sectionId === section.id;
                  const isCompleted = lesson.progress?.isCompleted;
                  const isLocked = lesson.locked || lesson.dripLocked;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => selectLesson(section.id, lesson)}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-[#0177FB]/25"
                          : isLocked
                          ? "cursor-not-allowed text-slate-400"
                          : "text-slate-700 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isActive
                            ? "bg-white/25"
                            : isCompleted
                            ? "bg-emerald-100"
                            : "bg-slate-100"
                        }`}
                      >
                        {isLocked ? (
                          <Lock
                            className={`h-3 w-3 ${
                              isActive ? "text-white" : "text-slate-400"
                            }`}
                          />
                        ) : isCompleted ? (
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              isActive ? "text-white" : "text-emerald-600"
                            }`}
                          />
                        ) : (
                          <Icon
                            className={`h-3 w-3 ${
                              isActive ? "text-white" : "text-slate-500"
                            }`}
                          />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {lesson.title}
                      </span>
                      {lesson.duration ? (
                        <span
                          className={`shrink-0 text-[10px] font-bold tabular-nums ${
                            isActive ? "text-white/80" : "text-slate-400"
                          }`}
                        >
                          {lesson.duration}m
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── RICH COMPLETION SECTION ─── */}
      {isComplete && (
        <div className="space-y-2 border-t border-slate-200 bg-white p-3">
          {/* Header */}
          <div className="flex items-center gap-2 px-1">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Course complete 🎉
            </p>
          </div>

          {/* Review block */}
          {review.exists ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2 ring-1 ring-inset ring-amber-200">
              <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-amber-900">
                  You rated {review.rating}/5
                </p>
                <p className="text-[10px] text-amber-700">Thanks for reviewing</p>
              </div>
            </div>
          ) : review.canReview ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start rounded-lg border-amber-300 text-xs font-bold text-amber-700 hover:bg-amber-50"
              onClick={() => openCompletionModal("review")}
            >
              <Star className="mr-1.5 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              Rate this course
            </Button>
          ) : null}

          {/* Certificate block */}
          {course.certificateEnabled && (
            <>
              {certificate.issued && certificate.verificationSlug ? (
                <Link
                  href={`/student/certificates/${certificate.verificationSlug}`}
                  target="_blank"
                  className="block"
                >
                  <Button
                    size="sm"
                    className="w-full justify-start rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700"
                  >
                    <Award className="mr-1.5 h-3.5 w-3.5" />
                    View certificate
                  </Button>
                </Link>
              ) : certificate.canClaim ? (
                <Button
                  size="sm"
                  className="w-full justify-start rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-yellow-600"
                  onClick={() => openCompletionModal("certificate")}
                >
                  <Award className="mr-1.5 h-3.5 w-3.5" />
                  Claim certificate
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
          {/* Mobile menu */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b border-slate-200 bg-white p-4 text-left">
                <SheetTitle className="line-clamp-2 text-sm font-black text-slate-900">
                  {course.title}
                </SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          {/* Back */}
          <Link href="/student/courses">
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-lg text-slate-600 sm:flex"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              My courses
            </Button>
          </Link>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-black text-slate-900">
              {course.title}
            </p>
            <p className="line-clamp-1 text-[11px] text-slate-500">
              {activeIndex >= 0 &&
                `Lesson ${activeIndex + 1} of ${flatLessons.length}`}
              {isComplete && " · Course complete 🎉"}
            </p>
          </div>

          {/* Progress ring */}
          <div className="hidden sm:block">
            <ProgressRing
              percent={enrollment.progressPercent}
              size={40}
              stroke={3}
            />
          </div>

          {/* Header CTA — smart: uses focus */}
          {isComplete && course.certificateEnabled && (
            <Button
              size="sm"
              onClick={() =>
                openCompletionModal(
                  certificate.issued ? null : "certificate"
                )
              }
              className="hidden rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-black text-white hover:from-amber-600 hover:to-yellow-600 sm:flex"
            >
              <Award className="mr-1.5 h-3.5 w-3.5" />
              {certificate.issued ? "View" : "Claim"} certificate
            </Button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 border-r border-slate-200 bg-white lg:block">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6">
          {!activeLessonMeta ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <BookOpen className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-lg font-black text-slate-900">
                This course has no lessons yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                The instructor is still preparing content.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {/* Lesson header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#0177FB]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0177FB]">
                    {activeLessonMeta.type === "video" && "Video"}
                    {activeLessonMeta.type === "text" && "Article"}
                    {activeLessonMeta.type === "file" && "Resource"}
                    {activeLessonMeta.type === "assignment" && "Assignment"}
                    {activeLessonMeta.type === "quiz" && "Quiz"}
                    {activeLessonMeta.type === "exam" && "Exam"}
                  </span>
                  {activeLessonMeta.progress?.isCompleted && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Completed
                    </span>
                  )}
                  {activeLessonMeta.freePreview && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                      <Sparkles className="h-2.5 w-2.5" /> Preview
                    </span>
                  )}
                  {activeLessonMeta.duration && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {activeLessonMeta.duration}m
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                  {activeLessonMeta.title}
                </h1>
              </div>

              {/* Content */}
              <LessonViewer
                slug={slug}
                courseId={course._id}
                lesson={activeLessonMeta}
                onAutoComplete={() => markComplete({ advance: false })}
                thumbnailUrl={course.thumbnailUrl}
              />

              {/* Footer nav */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={goPrev}
                    disabled={activeIndex <= 0}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {activeIndex + 1} / {flatLessons.length}
                    </span>
                    {activeLessonMeta.progress?.isCompleted ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                    ) : (
                      <Button
                        onClick={() => markComplete({ advance: false })}
                        disabled={markingComplete}
                        className="rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25"
                      >
                        {markingComplete ? (
                          <>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={goNext}
                    disabled={activeIndex >= flatLessons.length - 1}
                    className="rounded-lg bg-slate-900 font-bold text-white hover:bg-slate-800 disabled:opacity-40"
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                {justCompleted && (
                  <div className="mt-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3 text-center text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    🎉 Lesson complete — keep the momentum!
                  </div>
                )}
              </div>

              {/* Q&A */}
              <QaPanel
                courseId={course._id}
                lessonId={activeLessonMeta.id}
                lessonTitle={activeLessonMeta.title}
              />
            </div>
          )}
        </main>
      </div>

      {/* ══ Completion modal ══ */}
      {completionOpen && (
        <CompletionModal
          open={completionOpen}
          onOpenChange={(o) => {
            setCompletionOpen(o);
            if (!o) setModalFocus(null);
          }}
          view={view}
          focusSection={modalFocus}
          onReviewSubmitted={() => load({ preserveActive: true })}
          onCertificateIssued={() => load({ preserveActive: true })}
        />
      )}
    </div>
  );
}