"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, BookOpen, Layers, DollarSign, Settings, Save,
  PencilRuler, Sparkles, LayoutTemplate, Plus, Trash2, Upload, Image as Img,
  ChevronDown, Video, FileText, FileQuestion, ClipboardList, File,
  CheckCircle2, Circle, Loader2, X, Wand2, Zap, Users,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { QuizBuilder } from "./quiz-builder";
import { LessonMediaPreview } from "./lesson-media-preview";
import { AiDescriptionSuggest, AiTagSuggest, AiGenerateOutline } from "./ai-actions";

// ─── Types ─────────────────────────────────────────────
type LessonType = "video" | "text" | "quiz" | "assignment" | "file";
type PriceModel = "free" | "onetime" | "subscription";
type Interval = "weekly" | "monthly" | "yearly";
type Completion = "watch_all" | "pass_quiz" | "manual";

interface DraftLessonContent {
  textContent?: string;
  assignmentInstructions?: string;
  videoMediaId?: string;
  fileMediaId?: string;
  videoMediaName?: string;
  fileMediaName?: string;
  videoFile?: File;
  fileFile?: File;
}

interface DraftLesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: number;
  freePreview: boolean;
  dripDays: number;
  content: DraftLessonContent;
}

interface DraftSection {
  id: string;
  title: string;
  description?: string;
  lessons: DraftLesson[];
}

interface Tier {
  id: string;
  interval: Interval;
  price: number;
  discountPercent: number;
  isActive: boolean;
}

type Draft = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  difficulty: string;
  language: string;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  badge: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  learningObjectives: string[];
  requirements: string[];
  audience: string[];
  sections: DraftSection[];
  priceModel: PriceModel;
  oneTimePricing: { price: number; discountPercent: number };
  subscriptionTiers: Tier[];
  enrollmentLimit: number;
  certificateEnabled: boolean;
  certificateTemplate: string;
  completionCriteria: Completion;
  accessDuration: number;
  instructorBio: string;
  courseLevel: string;
};

const LESSON_META: Record<LessonType, { icon: typeof Video; color: string; label: string }> = {
  video: { icon: Video, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", label: "Video" },
  text: { icon: FileText, color: "text-slate-600 bg-slate-100 dark:bg-slate-800", label: "Article" },
  quiz: { icon: FileQuestion, color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10", label: "Quiz" },
  assignment: { icon: ClipboardList, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", label: "Assignment" },
  file: { icon: File, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", label: "Resource" },
};

const STEPS = [
  { key: "overview", label: "Overview", icon: BookOpen, desc: "Title, description, media" },
  { key: "curriculum", label: "Curriculum", icon: Layers, desc: "Sections & lessons" },
  { key: "pricing", label: "Pricing", icon: DollarSign, desc: "Free, one-time, subscription" },
  { key: "settings", label: "Settings", icon: Settings, desc: "Certificate, access" },
  { key: "publish", label: "Publish", icon: Save, desc: "Review & go live" },
] as const;
type StepKey = typeof STEPS[number]["key"];

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${BACKEND_ORIGIN}${url}`;
  return url;
}

function emptyDraft(): Draft {
  return {
    title: "", subtitle: "", description: "", category: "", subcategory: "",
    tags: [], difficulty: "beginner", language: "English",
    thumbnailFile: null, thumbnailPreview: null,
    badge: "", slug: "", seoTitle: "", seoDescription: "",
    learningObjectives: [], requirements: [], audience: [],
    sections: [],
    priceModel: "onetime",
    oneTimePricing: { price: 0, discountPercent: 0 },
    subscriptionTiers: [],
    enrollmentLimit: 0,
    certificateEnabled: false,
    certificateTemplate: "default",
    completionCriteria: "watch_all",
    accessDuration: 0,
    instructorBio: "",
    courseLevel: "all",
  };
}

function draftFromCourse(c: any): Draft {
  return {
    title: c.title || "",
    subtitle: c.subtitle || "",
    description: c.description || "",
    category: c.category || "",
    subcategory: c.subcategory || "",
    tags: c.tags || [],
    difficulty: c.difficulty || "beginner",
    language: c.language || "English",
    thumbnailFile: null,
    thumbnailPreview: resolveMediaUrl(c.thumbnailMediaId?.url),
    badge: c.badge || "",
    slug: c.slug || "",
    seoTitle: c.seoTitle || "",
    seoDescription: c.seoDescription || "",
    learningObjectives: c.learningObjectives || [],
    requirements: c.requirements || [],
    audience: c.audience || [],
    sections: (c.sections || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      lessons: (s.lessons || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration || 0,
        freePreview: !!l.freePreview,
        dripDays: l.dripDays || 0,
        content: {
          textContent: l.content?.textContent,
          assignmentInstructions: l.content?.assignmentInstructions,
          videoMediaId: l.content?.videoMediaId?._id || l.content?.videoMediaId || undefined,
          fileMediaId: l.content?.fileMediaId?._id || l.content?.fileMediaId || undefined,
          videoMediaName: l.content?.videoMediaName,
          fileMediaName: l.content?.fileMediaName,
        },
      })),
    })),
    priceModel: c.priceModel || "onetime",
    oneTimePricing: {
      price: c.oneTimePricing?.price || 0,
      discountPercent: c.oneTimePricing?.discountPercent || 0,
    },
    subscriptionTiers: (c.subscriptionTiers || []).map((t: any) => ({
      id: t.id,
      interval: t.interval,
      price: t.price,
      discountPercent: t.discountPercent || 0,
      isActive: t.isActive !== false,
    })),
    enrollmentLimit: c.enrollmentLimit || 0,
    certificateEnabled: !!c.certificateEnabled,
    certificateTemplate: c.certificateTemplate || "default",
    completionCriteria: c.completionCriteria || "watch_all",
    accessDuration: c.accessDuration || 0,
    instructorBio: c.instructorBio || "",
    courseLevel: c.courseLevel || "all",
  };
}

// ═════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════
export function CourseBuilder({
  courseId: initialCourseId,
  initialData,
}: {
  courseId?: string;
  initialData?: any;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [method, setMethod] = useState<"manual" | null>(initialCourseId ? "manual" : null);
  const [step, setStep] = useState<StepKey>("overview");
  const [draft, setDraft] = useState<Draft>(initialData ? draftFromCourse(initialData) : emptyDraft());
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(initialData?.status === "published");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [objInput, setObjInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [audInput, setAudInput] = useState("");

  const [quizCtx, setQuizCtx] = useState<
    { sectionId: string; lessonId: string; title: string } | null
  >(null);

  const openQuizBuilder = (
    _courseId: string,
    sectionId: string,
    lessonId: string,
    title: string
  ) => {
    setQuizCtx({ sectionId, lessonId, title });
  };

  const update = (patch: Partial<Draft>) => setDraft((p) => ({ ...p, ...patch }));

  const pushTo = (key: "tags" | "learningObjectives" | "requirements" | "audience", value: string) => {
    const v = value.trim();
    if (v && !(draft[key] as string[]).includes(v)) {
      update({ [key]: [...(draft[key] as string[]), v] } as any);
    }
  };
  const removeFrom = (key: "tags" | "learningObjectives" | "requirements" | "audience", value: string) => {
    update({ [key]: (draft[key] as string[]).filter((x) => x !== value) } as any);
  };

  const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setDraft((p) => ({ ...p, thumbnailFile: f, thumbnailPreview: r.result as string }));
    r.readAsDataURL(f);
  };

  const addSection = () =>
    update({
      sections: [...draft.sections, { id: `sec_${Date.now()}`, title: "New Section", lessons: [] }],
    });
  const removeSection = (id: string) => update({ sections: draft.sections.filter((s) => s.id !== id) });
  const updateSection = (id: string, patch: Partial<DraftSection>) =>
    update({ sections: draft.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const addLesson = (sectionId: string) => {
    const l: DraftLesson = {
      id: `les_${Date.now()}`,
      title: "New Lesson",
      type: "video",
      freePreview: false,
      dripDays: 0,
      content: {},
    };
    update({
      sections: draft.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, l] } : s
      ),
    });
    setExpandedLesson(l.id);
  };
  const updateLesson = (sectionId: string, lessonId: string, patch: Partial<DraftLesson>) =>
    update({
      sections: draft.sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)) }
          : s
      ),
    });
  const removeLesson = (sectionId: string, lessonId: string) =>
    update({
      sections: draft.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      ),
    });

  const addTier = (interval: Interval) => {
    if (draft.subscriptionTiers.some((t) => t.interval === interval)) {
      toast.error(`A ${interval} tier already exists`);
      return;
    }
    update({
      subscriptionTiers: [
        ...draft.subscriptionTiers,
        { id: `tier_${Date.now()}`, interval, price: 0, discountPercent: 0, isActive: true },
      ],
    });
  };
  const updateTier = (id: string, patch: Partial<Tier>) =>
    update({
      subscriptionTiers: draft.subscriptionTiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  const removeTier = (id: string) =>
    update({ subscriptionTiers: draft.subscriptionTiers.filter((t) => t.id !== id) });

  const buildPayload = () => {
    const sections = draft.sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        duration: l.duration || 0,
        freePreview: l.freePreview,
        dripDays: l.dripDays || 0,
        content: {
          videoMediaId: l.type === "video" ? (l.content.videoMediaId || null) : null,
          fileMediaId: l.type === "file" ? (l.content.fileMediaId || null) : null,
          ...(l.content.textContent && { textContent: l.content.textContent }),
          ...(l.content.assignmentInstructions && {
            assignmentInstructions: l.content.assignmentInstructions,
          }),
        },
      })),
    }));

    const payload: any = {
      title: draft.title,
      subtitle: draft.subtitle,
      description: draft.description,
      category: draft.category,
      subcategory: draft.subcategory,
      tags: draft.tags,
      difficulty: draft.difficulty,
      language: draft.language,
      badge: draft.badge,
      slug: draft.slug || undefined,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      learningObjectives: draft.learningObjectives,
      requirements: draft.requirements,
      audience: draft.audience,
      sections,
      priceModel: draft.priceModel,
      enrollmentLimit: draft.enrollmentLimit,
      certificateEnabled: draft.certificateEnabled,
      certificateTemplate: draft.certificateTemplate,
      completionCriteria: draft.completionCriteria,
      accessDuration: draft.accessDuration,
      instructorBio: draft.instructorBio,
      courseLevel: draft.courseLevel,
      ...(!courseId && { status: "draft" }),
    };

    if (draft.priceModel === "onetime") {
      payload.oneTimePricing = {
        price: draft.oneTimePricing.price,
        currency: "USD",
        discountPercent: draft.oneTimePricing.discountPercent,
      };
    } else if (draft.priceModel === "subscription") {
      payload.subscriptionTiers = draft.subscriptionTiers
        .filter((t) => t.isActive)
        .map((t) => ({
          id: t.id,
          interval: t.interval,
          price: t.price,
          discountPercent: t.discountPercent,
          isActive: t.isActive,
        }));
    }
    return payload;
  };

  const uploadAll = async (id: string) => {
    const failures: string[] = [];

    if (draft.thumbnailFile) {
      try {
        const fd = new FormData();
        fd.append("file", draft.thumbnailFile);
        await api.post(`/teacher/courses/${id}/thumbnail`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (e: any) {
        failures.push(`Thumbnail: ${e?.response?.data?.message || "upload failed"}`);
      }
    }

    for (const s of draft.sections) {
      for (const l of s.lessons) {
        if (l.type === "video" && l.content.videoFile) {
          try {
            const fd = new FormData();
            fd.append("file", l.content.videoFile);
            await api.post(
              `/teacher/courses/${id}/sections/${s.id}/lessons/${l.id}/video`,
              fd,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
          } catch (e: any) {
            failures.push(`Video "${l.title}": ${e?.response?.data?.message || "upload failed"}`);
          }
        }
        if (l.type === "file" && l.content.fileFile) {
          try {
            const fd = new FormData();
            fd.append("file", l.content.fileFile);
            await api.post(
              `/teacher/courses/${id}/sections/${s.id}/lessons/${l.id}/file`,
              fd,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
          } catch (e: any) {
            failures.push(`File "${l.title}": ${e?.response?.data?.message || "upload failed"}`);
          }
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(failures.join("\n"));
    }
  };

  const save = async (publish = false) => {
    if (!draft.title.trim() || !draft.description.trim() || !draft.category) {
      toast.error("Title, description and category are required");
      setStep("overview");
      return;
    }

    setSaving(true);
    let savedId: string | undefined = courseId;

    try {
      const payload = buildPayload();
      if (!savedId) {
        const r = await api.post("/teacher/courses", payload);
        savedId = r.data.data._id;
        setCourseId(savedId);
      } else {
        await api.put(`/teacher/courses/${savedId}`, payload);
      }
        
      // ⭐ Narrowing guard — TS now knows savedId is string
      if (!savedId) {
          throw new Error("Failed to determine course ID");
      }

      try {
        await uploadAll(savedId);
      } catch (uploadErr: any) {
        toast.error(`Some uploads failed — fix and retry:\n${uploadErr.message}`, {
          duration: 10000,
        });
        return; // stay on page so user can retry
      }

      if (publish) {
        try {
          await api.post(`/teacher/courses/${savedId}/publish`);
          setIsPublished(true);
          toast.success("Published successfully");
        } catch (pubErr: any) {
          toast.warning(
            "Saved but publish failed: " +
              (pubErr?.response?.data?.message || "check requirements")
          );
        }
      } else {
        toast.success(courseId ? "Changes saved" : "Draft created");
      }

      router.push(`/teacher/courses/${savedId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Method picker (create only) ──
  if (!method) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_60%)]" />
        <div className="relative w-full max-w-5xl">
          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm dark:border-indigo-500/30 dark:bg-slate-900 dark:text-indigo-400">
              <Zap className="h-3.5 w-3.5" /> Course Studio
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              How would you like to create<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {" "}your next course?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400">
              Start building in minutes. Refine it forever.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <button
              onClick={() => setMethod("manual")}
              className="group relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-white p-8 text-left shadow-xl shadow-indigo-500/10 transition-all hover:-translate-y-1 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/25 dark:border-indigo-500/40 dark:bg-slate-900"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                  <PencilRuler className="h-7 w-7" />
                </div>
                <Badge className="mt-4 rounded-full bg-indigo-600 text-white">Recommended</Badge>
                <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Build Manually</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Full control. Design every lesson, quiz and pricing detail exactly as you imagine.
                </p>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Start building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
            <div className="relative rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-8 opacity-60 dark:border-slate-800 dark:bg-slate-900/50">
              <Badge className="absolute right-4 top-4 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Soon</Badge>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <LayoutTemplate className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-slate-500 dark:text-slate-400">Use Templates</h2>
              <p className="mt-2 text-sm text-slate-400">Pre-designed outlines from top educators.</p>
            </div>
            <div className="relative rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-8 opacity-60 dark:border-slate-800 dark:bg-slate-900/50">
              <Badge className="absolute right-4 top-4 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Soon</Badge>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-black text-slate-500 dark:text-slate-400">Generate with AI</h2>
              <p className="mt-2 text-sm text-slate-400">Let AI draft your outline, quizzes and summaries.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Builder ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Course Studio
              </p>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {draft.title || "Untitled course"}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => save(false)} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {courseId ? "Save changes" : "Save draft"}
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
              onClick={() => save(true)}
              disabled={saving}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isPublished ? "Update published" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-8">
        {/* Step rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {STEPS.map((s, i) => {
              const active = step === s.key;
              const done = STEPS.findIndex((x) => x.key === step) > i;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(s.key)}
                  className={`group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors ${
                    active
                      ? "bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm dark:from-indigo-500/10 dark:to-violet-500/10"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-indigo-900 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 space-y-6">
          {step === "overview" && (
            <StepOverview
              draft={draft}
              courseId={courseId}
              update={update}
              tagInput={tagInput}
              setTagInput={setTagInput}
              pushTo={pushTo}
              removeFrom={removeFrom}
              objInput={objInput}
              setObjInput={setObjInput}
              reqInput={reqInput}
              setReqInput={setReqInput}
              audInput={audInput}
              setAudInput={setAudInput}
              onThumb={handleThumb}
            />
          )}
          {step === "curriculum" && (
            <StepCurriculum
                draft={draft}
                courseId={courseId}
                update={update}
                addSection={addSection}
                removeSection={removeSection}
                updateSection={updateSection}
                addLesson={addLesson}
                updateLesson={updateLesson}
                removeLesson={removeLesson}
                expandedLesson={expandedLesson}
                setExpandedLesson={setExpandedLesson}
                openQuizBuilder={openQuizBuilder}
            />
           )}
          {step === "pricing" && (
            <StepPricing
              draft={draft}
              update={update}
              addTier={addTier}
              updateTier={updateTier}
              removeTier={removeTier}
            />
          )}
          {step === "settings" && <StepSettings draft={draft} update={update} />}
          {step === "publish" && <StepPublish draft={draft} onSave={save} saving={saving} />}

          {/* Nav */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={STEPS.findIndex((s) => s.key === step) === 0}
              onClick={() => {
                const i = STEPS.findIndex((s) => s.key === step);
                setStep(STEPS[Math.max(0, i - 1)].key);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              disabled={STEPS.findIndex((s) => s.key === step) === STEPS.length - 1}
              onClick={() => {
                const i = STEPS.findIndex((s) => s.key === step);
                setStep(STEPS[Math.min(STEPS.length - 1, i + 1)].key);
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>

        {/* Live preview */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Live preview
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xl shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-slate-800 dark:to-slate-700">
                {draft.thumbnailPreview ? (
                  <img src={draft.thumbnailPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Img className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                {draft.badge && (
                  <Badge className="absolute right-3 top-3 rounded-full bg-amber-500 text-white">
                    {draft.badge}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-bold text-slate-900 dark:text-white">
                  {draft.title || "Course title"}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {draft.subtitle || draft.description || "A short, punchy subtitle appears here."}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{draft.sections.reduce((a, s) => a + s.lessons.length, 0)} lessons</span>
                  <span>·</span>
                  <span>{draft.difficulty}</span>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {draft.priceModel === "free"
                      ? "Free"
                      : draft.priceModel === "onetime"
                      ? `$${draft.oneTimePricing.price.toFixed(2)}`
                      : draft.subscriptionTiers.length
                      ? `$${draft.subscriptionTiers[0].price.toFixed(2)}/${draft.subscriptionTiers[0].interval[0]}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              This is how students will see your course in the marketplace.
            </p>
          </div>
        </aside>
      </div>

      {quizCtx && courseId && (
        <QuizBuilder
          open={!!quizCtx}
          onClose={() => setQuizCtx(null)}
          courseId={courseId}
          sectionId={quizCtx.sectionId}
          lessonId={quizCtx.lessonId}
          lessonTitle={quizCtx.title}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// Step components
// ═════════════════════════════════════════════════════════

function Card({
  children, title, description, icon: Icon,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function PillList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((v) => (
        <Badge key={v} variant="secondary" className="gap-1 rounded-full pr-1 text-xs">
          {v}
          <button
            onClick={() => onRemove(v)}
            className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function StepOverview({
  draft, courseId, update, tagInput, setTagInput, pushTo, removeFrom,
  objInput, setObjInput, reqInput, setReqInput, audInput, setAudInput, onThumb,
}: any) {
  return (
    <>
      <Card title="Course basics" description="The foundation of your course" icon={BookOpen}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title <span className="text-rose-500">*</span></Label>
            <Input
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Complete Web Development Bootcamp"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Subtitle</Label>
            <Input
              value={draft.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              placeholder="A crisp one-liner that sells the course"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
                <Label>Description <span className="text-rose-500">*</span></Label>
                <AiDescriptionSuggest
                title={draft.title}
                category={draft.category}
                courseId={courseId}
                onApply={(description) => update({ description })}
                />
            </div>
            <Textarea
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={5}
                placeholder="What will students achieve? Who is it for? Why is it different?"
                className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label>Category <span className="text-rose-500">*</span></Label>
            <Select value={draft.category} onValueChange={(v) => update({ category: v })}>
              <SelectTrigger className="mt-1.5 rounded-xl">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={draft.difficulty} onValueChange={(v) => update({ difficulty: v })}>
              <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card title="Media" description="A great thumbnail can double your enrollment rate" icon={Img}>
        <input type="file" accept="image/*" onChange={onThumb} className="hidden" id="thumb-upload" />
        <label
          htmlFor="thumb-upload"
          className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 transition-colors hover:border-indigo-400 hover:from-indigo-50 hover:to-violet-50 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:hover:border-indigo-500"
        >
          {draft.thumbnailPreview ? (
            <>
              <img src={draft.thumbnailPreview} alt="Thumbnail" className="absolute inset-0 h-full w-full object-cover" />
              <div className="relative rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Replace image
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Upload className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Upload thumbnail</p>
              <p className="mt-1 text-xs text-slate-500">1280×720 · JPG or PNG · up to 5MB</p>
            </>
          )}
        </label>
      </Card>

      <Card title="Tags & badge" description="Help students find you" icon={BookOpen}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <AiTagSuggest
                title={draft.title}
                description={draft.description}
                existingTags={draft.tags}
                courseId={courseId}
                onApply={(newTags) => update({ tags: [...draft.tags, ...newTags] })}
                />
            </div>
            <div className="mt-1.5 flex gap-2">
                <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), pushTo("tags", tagInput), setTagInput(""))
                }
                placeholder="Add a tag and press Enter"
                className="rounded-xl"
                />
                <Button variant="outline" className="rounded-xl" onClick={() => (pushTo("tags", tagInput), setTagInput(""))}>
                Add
                </Button>
            </div>
            <PillList items={draft.tags} onRemove={(v) => removeFrom("tags", v)} />
          </div>
          <div>
            <Label>Badge</Label>
            <Input
              value={draft.badge}
              onChange={(e) => update({ badge: e.target.value })}
              placeholder="e.g. Bestseller, New, Hot"
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>
      </Card>

      <Card title="Learning outcomes" description="What will students walk away with?" icon={CheckCircle2}>
        <div className="space-y-5">
          <div>
            <Label>Learning objectives</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={objInput}
                onChange={(e) => setObjInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), pushTo("learningObjectives", objInput), setObjInput(""))
                }
                placeholder="e.g. Build a full-stack app from scratch"
                className="rounded-xl"
              />
              <Button variant="outline" className="rounded-xl" onClick={() => (pushTo("learningObjectives", objInput), setObjInput(""))}>
                Add
              </Button>
            </div>
            <PillList items={draft.learningObjectives} onRemove={(v) => removeFrom("learningObjectives", v)} />
          </div>
          <div>
            <Label>Requirements</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), pushTo("requirements", reqInput), setReqInput(""))
                }
                placeholder="e.g. Basic JavaScript knowledge"
                className="rounded-xl"
              />
              <Button variant="outline" className="rounded-xl" onClick={() => (pushTo("requirements", reqInput), setReqInput(""))}>
                Add
              </Button>
            </div>
            <PillList items={draft.requirements} onRemove={(v) => removeFrom("requirements", v)} />
          </div>
          <div>
            <Label>Who is this for?</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={audInput}
                onChange={(e) => setAudInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), pushTo("audience", audInput), setAudInput(""))
                }
                placeholder="e.g. Beginner developers"
                className="rounded-xl"
              />
              <Button variant="outline" className="rounded-xl" onClick={() => (pushTo("audience", audInput), setAudInput(""))}>
                Add
              </Button>
            </div>
            <PillList items={draft.audience} onRemove={(v) => removeFrom("audience", v)} />
          </div>
        </div>
      </Card>

      <Card title="SEO" description="How your course shows up in search engines" icon={BookOpen}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>URL slug</Label>
            <Input
              value={draft.slug}
              onChange={(e) => update({ slug: e.target.value })}
              placeholder="auto-generated from title"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label>Meta title</Label>
            <Input
              value={draft.seoTitle}
              onChange={(e) => update({ seoTitle: e.target.value })}
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Meta description</Label>
            <Textarea
              value={draft.seoDescription}
              onChange={(e) => update({ seoDescription: e.target.value })}
              rows={2}
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>
      </Card>
    </>
  );
}

function StepCurriculum({
  draft, courseId, update, addSection, removeSection, updateSection,
  addLesson, updateLesson, removeLesson, expandedLesson, setExpandedLesson, openQuizBuilder,
}: any) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Curriculum</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
            Group lessons into sections. Reorder coming soon.
            </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <AiGenerateOutline
            topic={draft.title}
            level={draft.difficulty}
            courseId={courseId}
            onApply={(sections) => {
                const mapped = sections.map((s: any, i: number) => ({
                id: `sec_${Date.now()}_${i}`,
                title: s.title || `Section ${i + 1}`,
                description: s.description,
                lessons: (s.lessons || []).map((l: any, j: number) => ({
                    id: `les_${Date.now()}_${i}_${j}`,
                    title: l.title || `Lesson ${j + 1}`,
                    type: (l.type || "video") as LessonType,
                    duration: l.duration || 0,
                    freePreview: false,
                    dripDays: 0,
                    content: {},
                })),
                }));
                update({ sections: [...draft.sections, ...mapped] });
            }}
            />
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={addSection}>
            <Plus className="mr-2 h-4 w-4" /> Add section
            </Button>
        </div>
      </div>

      {draft.sections.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <Layers className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">No sections yet</p>
          <p className="mt-1 text-xs text-slate-500">Add your first section to start building the curriculum.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draft.sections.map((section: DraftSection, si: number) => (
            <div
              key={section.id}
              className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50 p-4 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {si + 1}
                </div>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="Section title"
                  className="flex-1 rounded-lg border-0 bg-transparent text-base font-semibold focus-visible:ring-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                  className="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                {section.lessons.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No lessons yet</p>
                ) : (
                  <div className="space-y-2">
                    {section.lessons.map((l: DraftLesson) => {
                      const meta = LESSON_META[l.type] || LESSON_META.video;
                      const Icon = meta.icon;
                      const open = expandedLesson === l.id;
                      return (
                        <div
                          key={l.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 transition-all dark:border-slate-700 dark:bg-slate-800/30"
                        >
                          <div className="flex items-center gap-2 p-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <Input
                              value={l.title}
                              onChange={(e) => updateLesson(section.id, l.id, { title: e.target.value })}
                              className="h-9 flex-1 rounded-lg border-slate-200 bg-white text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
                            />
                            <Select
                              value={l.type}
                              onValueChange={(v) => updateLesson(section.id, l.id, { type: v as LessonType })}
                            >
                              <SelectTrigger className="h-9 w-32 rounded-lg"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="text">Article</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="file">Resource</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg"
                              onClick={() => setExpandedLesson(open ? null : l.id)}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                              onClick={() => removeLesson(section.id, l.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {open && (
                            <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700">
                              {l.type === "video" && (
                                <div>
                                    <Label className="text-xs">Video</Label>

                                    {l.content.videoMediaId && !l.content.videoFile && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                        Saved: <span className="font-semibold">{l.content.videoMediaName || "existing file"}</span>
                                        </span>
                                    </div>
                                    )}

                                    {l.content.videoMediaId && !l.content.videoFile && courseId && (
                                    <LessonMediaPreview
                                        courseId={courseId}
                                        sectionId={section.id}
                                        lessonId={l.id}
                                        kind="video"
                                        poster={draft.thumbnailPreview || undefined}

                                    />
                                    )}

                                    {l.content.videoFile && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span className="truncate font-semibold">{l.content.videoFile.name}</span>
                                        <span>— Save changes to upload</span>
                                    </div>
                                    )}

                                    {!l.content.videoMediaId && !l.content.videoFile && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                                        <X className="h-3.5 w-3.5" /> No video uploaded
                                    </div>
                                    )}

                                    <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    id={`v-${l.id}`}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) updateLesson(section.id, l.id, { content: { ...l.content, videoFile: f } });
                                    }}
                                    />
                                    <label
                                    htmlFor={`v-${l.id}`}
                                    className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                    >
                                    <Upload className="h-4 w-4" />
                                    {l.content.videoMediaId ? "Replace video" : "Choose video file"}
                                    </label>
                                </div>
                                )}

                              {l.type === "text" && (
                                <div>
                                  <Label className="text-xs">Content</Label>
                                  <Textarea
                                    rows={4}
                                    className="mt-1.5 rounded-lg"
                                    value={l.content.textContent || ""}
                                    onChange={(e) =>
                                      updateLesson(section.id, l.id, {
                                        content: { ...l.content, textContent: e.target.value },
                                      })
                                    }
                                  />
                                </div>
                              )}

                              {l.type === "quiz" && (
                                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
                                  <p className="flex items-center gap-2">
                                    <FileQuestion className="h-4 w-4" /> Questions live in the Quiz builder.
                                  </p>
                                  <Button
                                    size="sm"
                                    className="mt-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                                    disabled={!courseId}
                                    onClick={() => courseId && openQuizBuilder(courseId, section.id, l.id, l.title)}
                                  >
                                    {courseId ? "Manage quiz questions" : "Save draft first to add questions"}
                                  </Button>
                                </div>
                              )}

                              {l.type === "assignment" && (
                                <div>
                                  <Label className="text-xs">Instructions</Label>
                                  <Textarea
                                    rows={4}
                                    className="mt-1.5 rounded-lg"
                                    value={l.content.assignmentInstructions || ""}
                                    onChange={(e) =>
                                      updateLesson(section.id, l.id, {
                                        content: { ...l.content, assignmentInstructions: e.target.value },
                                      })
                                    }
                                  />
                                </div>
                              )}

                              {l.type === "file" && (
                                <div>
                                    <Label className="text-xs">Resource file</Label>

                                    {l.content.fileMediaId && !l.content.fileFile && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                        Saved: <span className="font-semibold">{l.content.fileMediaName || "existing file"}</span>
                                        </span>
                                    </div>
                                    )}

                                    {l.content.fileMediaId && !l.content.fileFile && courseId && (
                                    <LessonMediaPreview
                                        courseId={courseId}
                                        sectionId={section.id}
                                        lessonId={l.id}
                                        kind="file"
                                    />
                                    )}

                                    {l.content.fileFile && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span className="truncate font-semibold">{l.content.fileFile.name}</span>
                                        <span>— Save changes to upload</span>
                                    </div>
                                    )}

                                    <input
                                    type="file"
                                    className="hidden"
                                    id={`f-${l.id}`}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) updateLesson(section.id, l.id, { content: { ...l.content, fileFile: f } });
                                    }}
                                    />
                                    <label
                                    htmlFor={`f-${l.id}`}
                                    className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                    >
                                    <Upload className="h-4 w-4" />
                                    {l.content.fileMediaId ? "Replace file" : "Choose file"}
                                    </label>
                                </div>
                                )}

                              <div className="flex flex-wrap items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                  <Switch
                                    checked={l.freePreview}
                                    onCheckedChange={(c) => updateLesson(section.id, l.id, { freePreview: c })}
                                  />
                                  Free preview
                                </label>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Drip (days)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={l.dripDays}
                                    onChange={(e) =>
                                      updateLesson(section.id, l.id, { dripDays: Number(e.target.value) })
                                    }
                                    className="w-20 rounded-lg"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Duration (min)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={l.duration || 0}
                                    onChange={(e) =>
                                      updateLesson(section.id, l.id, { duration: Number(e.target.value) })
                                    }
                                    className="w-20 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  onClick={() => addLesson(section.id)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add lesson
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StepPricing({ draft, update, addTier, updateTier, removeTier }: any) {
  return (
    <>
      <Card title="Pricing model" description="How students pay for your course" icon={DollarSign}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { key: "free", label: "Free", icon: Wand2, desc: "Build an audience first" },
            { key: "onetime", label: "One-time", icon: DollarSign, desc: "Pay once, access forever" },
            { key: "subscription", label: "Subscription", icon: Sparkles, desc: "Recurring monthly or yearly" },
          ].map((opt) => {
            const active = draft.priceModel === opt.key;
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => update({ priceModel: opt.key })}
                className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  active
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-500/10 dark:from-indigo-500/10 dark:to-violet-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-indigo-600" />}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-bold text-slate-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        {draft.priceModel === "onetime" && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Price (USD)</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <Input
                    type="number"
                    min={0}
                    value={draft.oneTimePricing.price}
                    onChange={(e) =>
                      update({
                        oneTimePricing: { ...draft.oneTimePricing, price: Number(e.target.value) },
                      })
                    }
                    className="rounded-xl pl-7"
                  />
                </div>
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.oneTimePricing.discountPercent}
                  onChange={(e) =>
                    update({
                      oneTimePricing: {
                        ...draft.oneTimePricing,
                        discountPercent: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>
            {draft.oneTimePricing.discountPercent > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                Students pay{" "}
                <strong>
                  ${(draft.oneTimePricing.price * (1 - draft.oneTimePricing.discountPercent / 100)).toFixed(2)}
                </strong>{" "}
                · Save {draft.oneTimePricing.discountPercent}%
              </div>
            )}
          </div>
        )}

        {draft.priceModel === "subscription" && (
          <div className="mt-6 space-y-3">
            {draft.subscriptionTiers.map((t: Tier) => (
              <div
                key={t.id}
                className="grid grid-cols-2 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30"
              >
                <Select value={t.interval} onValueChange={(v) => updateTier(t.id, { interval: v as Interval })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={t.price}
                      onChange={(e) => updateTier(t.id, { price: Number(e.target.value) })}
                      className="rounded-lg pl-7"
                    />
                  </div>
                  <Switch checked={t.isActive} onCheckedChange={(c) => updateTier(t.id, { isActive: c })} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg text-rose-500"
                    onClick={() => removeTier(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => addTier("weekly")}>
                <Plus className="mr-1 h-3 w-3" /> Weekly
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => addTier("monthly")}>
                <Plus className="mr-1 h-3 w-3" /> Monthly
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => addTier("yearly")}>
                <Plus className="mr-1 h-3 w-3" /> Yearly
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Enrollment limits" description="Optional restrictions" icon={Users}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Enrollment limit</Label>
            <Input
              type="number"
              min={0}
              value={draft.enrollmentLimit}
              onChange={(e) => update({ enrollmentLimit: Number(e.target.value) })}
              className="mt-1.5 rounded-xl"
              placeholder="0 = unlimited"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Coupons are managed from the <strong>Coupons</strong> page — apply them at checkout.
        </p>
      </Card>
    </>
  );
}

function StepSettings({ draft, update }: any) {
  return (
    <>
      <Card title="Certificate" description="Reward students on completion" icon={Sparkles}>
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Enable certificate</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically issue a certificate on completion
              </p>
            </div>
            <Switch
              checked={draft.certificateEnabled}
              onCheckedChange={(c) => update({ certificateEnabled: c })}
            />
          </label>
          {draft.certificateEnabled && (
            <>
              <div>
                <Label>Template</Label>
                <Select
                  value={draft.certificateTemplate}
                  onValueChange={(v) => update({ certificateTemplate: v })}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Completion criteria</Label>
                <Select
                  value={draft.completionCriteria}
                  onValueChange={(v) => update({ completionCriteria: v as Completion })}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watch_all">Complete all lessons</SelectItem>
                    <SelectItem value="pass_quiz">Pass all quizzes</SelectItem>
                    <SelectItem value="manual">Teacher review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card title="Access" description="How long students can reach your content" icon={Settings}>
        <div>
          <Label>Access duration (days)</Label>
          <Input
            type="number"
            min={0}
            value={draft.accessDuration}
            onChange={(e) => update({ accessDuration: Number(e.target.value) })}
            className="mt-1.5 rounded-xl"
            placeholder="0 = lifetime"
          />
        </div>
      </Card>

      <Card title="Instructor bio" description="Build trust with your students" icon={BookOpen}>
        <Textarea
          rows={4}
          value={draft.instructorBio}
          onChange={(e) => update({ instructorBio: e.target.value })}
          placeholder="Share your background, expertise, and teaching style..."
          className="rounded-xl"
        />
      </Card>
    </>
  );
}

function StepPublish({ draft, onSave, saving }: any) {
  const checks = [
    { label: "Title & description", ok: !!draft.title && !!draft.description },
    { label: "Category selected", ok: !!draft.category },
    { label: "Thumbnail uploaded", ok: !!draft.thumbnailPreview },
    { label: "At least one section", ok: draft.sections.length > 0 },
    { label: "At least one lesson", ok: draft.sections.some((s: DraftSection) => s.lessons.length > 0) },
    {
      label: "Pricing configured",
      ok:
        draft.priceModel === "free" ||
        (draft.priceModel === "onetime"
          ? draft.oneTimePricing.price > 0
          : draft.subscriptionTiers.some((t: Tier) => t.isActive && t.price > 0)),
    },
  ];
  const ready = checks.every((c) => c.ok);

  return (
    <>
      <Card title="Ready for launch?" description="Review the checklist before publishing" icon={CheckCircle2}>
        <div className="space-y-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              {c.ok ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span className={`text-sm ${c.ok ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-violet-500/10">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
            {ready ? "✨ You're ready to publish!" : "Complete the checks above to publish"}
          </p>
          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
            {draft.sections.reduce((a: number, s: DraftSection) => a + s.lessons.length, 0)} lessons across{" "}
            {draft.sections.length} sections
          </p>
        </div>
      </Card>

      <Card title="Summary" description="What students will see" icon={BookOpen}>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-400">Title</p>
            <p className="font-semibold text-slate-900 dark:text-white">{draft.title || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Difficulty</p>
            <p className="font-semibold capitalize text-slate-900 dark:text-white">{draft.difficulty}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Price</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              {draft.priceModel === "free"
                ? "Free"
                : draft.priceModel === "onetime"
                ? `$${draft.oneTimePricing.price.toFixed(2)}`
                : draft.subscriptionTiers.map((t: Tier) => `${t.interval}: $${t.price}`).join(", ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Sections</p>
            <p className="font-semibold text-slate-900 dark:text-white">{draft.sections.length}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => onSave(false)} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
            onClick={() => onSave(true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </Card>
    </>
  );
}