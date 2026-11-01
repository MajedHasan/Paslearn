"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Globe,
  Smartphone,
  Shield,
  Loader2,
  ArrowLeft,
  X,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  MessageSquare,
  ShoppingCart,
  Award,
  Zap,
  Heart,
  Share2,
  Infinity as InfinityIcon,
  FileText,
  File,
  ClipboardList,
  FileQuestion,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import VideoPlayer from "@/components/global/video/player/video-player";
import { CourseCard, PublicCourse } from "@/components/public/course-card";
import { useCartStatus } from "@/hooks/use-cart-status";


const FAQ = [
  {
    q: "Can I preview the course before buying?",
    a: "Yes. Every lesson marked 'Free preview' — video, text, quiz, or file — is available to explore before purchase.",
  },
  {
    q: "How long do I have access?",
    a: "Once enrolled, you get lifetime access. Learn at your own pace on any device.",
  },
  {
    q: "Is there a certificate of completion?",
    a: "If this course includes a certificate, you'll receive one automatically after completing the requirements.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "Most courses offer a money-back guarantee. Check the purchase card for this course's policy.",
  },
  {
    q: "Can I access this on my phone?",
    a: "Yes. All content works seamlessly on desktop, tablet, and mobile.",
  },
];

const LESSON_ICONS: Record<string, any> = {
  video: PlayCircle,
  text: FileText,
  quiz: FileQuestion,
  exam: FileQuestion,
  assignment: ClipboardList,
  file: File,
};

function fmtShort(sec?: number): string {
  if (!sec || sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function fmtLong(sec?: number): string {
  if (!sec || sec <= 0) return "0 minutes";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} minute${m > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { inCart, setInCart } = useCartStatus(course?.productId);

  // Preview state — now supports all lesson types
  const [previewLesson, setPreviewLesson] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [showMobileCta, setShowMobileCta] = useState(false);

  // ═══════════════════ LOAD DATA ═══════════════════
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/public/courses/${slug}`);
      const c = r.data.data;
      setCourse(c);

      try {
        const rev = await api.get(`/reviews/courses/${c._id}/reviews`, {
          params: { page: 1, limit: 10, sort: "recent" },
        });
        setReviews(rev.data.data || []);
      } catch {}

      try {
        const rel = await api.get("/public/courses", {
          params: { category: c.category, limit: 4 },
        });
        setRelated(
          (rel.data.data || []).filter((x: any) => x._id !== c._id).slice(0, 3)
        );
      } catch {}
    } catch (e: any) {
      setError(e?.response?.data?.message || "Course not found");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!course?.productId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;
    (async () => {
      try {
        const r = await api.get("/entitlements/my");
        const products = (r.data.data || []).map((e: any) => String(e.product?._id || e.product));
        setIsEnrolled(products.includes(String(course.productId)));
      } catch {}
    })();
  }, [course?.productId]);

  useEffect(() => {
    const onScroll = () => setShowMobileCta(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ═══════════════════ PREVIEW — works for all lesson types ═══════════════════
  const openPreview = async (lessonId: string, title: string) => {
    setPreviewLesson({ id: lessonId, title });
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const r = await api.get(`/public/courses/${slug}/lessons/${lessonId}/preview`);
      setPreviewData(r.data.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Preview unavailable");
      setPreviewLesson(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ═══════════════════ PURCHASE ═══════════════════
  const handlePrimaryAction = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push(`/auth/sign-in?redirect=/courses/${slug}`);
      return;
    }
    if (!course?.productId) {
      toast.error("This course is not available for purchase");
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/cart/items", { productId: String(course.productId) });
      setInCart(true);
      window.dispatchEvent(new CustomEvent("cart:updated"));   // ⭐ NEW
      if (course.priceModel === "free") {
        try {
          await api.post("/orders");
          setIsEnrolled(true);
          toast.success("Enrolled! Enjoy the course 🎉", { duration: 5000 });
        } catch {
          toast.success("Added to cart — complete checkout to enroll");
        }
      } else {
        toast.success("Added to your cart", {
          action: { label: "View cart →", onClick: () => router.push("/cart") },
          duration: 6000,
        });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // ═══════════════════ LOADING ═══════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="h-64 animate-pulse bg-slate-900 dark:bg-slate-800" />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="aspect-video animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════ ERROR ═══════════════════
  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 dark:bg-slate-950">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <X className="h-8 w-8 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">
          {error || "Course not found"}
        </h1>
        <p className="mt-2 max-w-md text-center text-sm text-slate-500 dark:text-slate-400">
          {`The course you're looking for doesn't exist or has been removed.`}
        </p>
        <Link href="/courses" className="mt-8">
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse courses
          </Button>
        </Link>
      </div>
    );
  }

  // ═══════════════════ DATA ═══════════════════
  const isFree = course.priceModel === "free";
  const price = isFree
    ? "Free"
    : course.priceModel === "onetime"
    ? `$${(course.oneTimePricing?.price || 0).toFixed(2)}`
    : course.subscriptionTiers?.length
    ? `$${course.subscriptionTiers[0].price.toFixed(2)}`
    : "—";

  const originalPrice =
    course.oneTimePricing?.originalPrice &&
    course.oneTimePricing.originalPrice > (course.oneTimePricing?.price || 0)
      ? `$${course.oneTimePricing.originalPrice.toFixed(2)}`
      : null;

  const discountPct = originalPrice
    ? Math.round(
        ((course.oneTimePricing.originalPrice - course.oneTimePricing.price) /
          course.oneTimePricing.originalPrice) *
          100
      )
    : 0;

  const previewLessons = (course.sections || []).flatMap((s: any) =>
    (s.lessons || []).filter((l: any) => l.freePreview)
  );
  const firstPreviewLesson = previewLessons[0] || null;

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));
  const totalRated = ratingDist.reduce((a, b) => a + b.count, 0);

  // ═══════════════════ RENDER ═══════════════════
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ══════════════════════════════════════════════════ */}
      {/* HERO HEADER — dark band, title/rating left, video right */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-900">
        {/* Blurred thumbnail backdrop */}
        {course.thumbnailUrl && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              backgroundImage: `url(${course.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/95" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 overflow-x-auto text-xs text-white/60">
            <Link href="/courses" className="hover:text-white">
              Courses
            </Link>
            {course.category && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <Link
                  href={`/courses?category=${course.category}`}
                  className="capitalize hover:text-white"
                >
                  {course.category.replace("-", " ")}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate text-white/90">{course.title}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 lg:items-start">
            {/* ── LEFT: Title block ── */}
            <div className="min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {course.badge && (
                  <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {course.badge}
                  </span>
                )}
                {isFree && (
                  <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    Free
                  </span>
                )}
                {course.category && (
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                    {course.category.replace("-", " ")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {course.title}
              </h1>

              {/* Subtitle */}
              {course.subtitle && (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {course.subtitle}
                </p>
              )}

              {/* Rating row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-amber-400">
                    {(course.ratingAvg || 0).toFixed(1)}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(course.ratingAvg || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60">
                    ({(course.ratingCount || 0).toLocaleString()} ratings)
                  </span>
                </div>
                <div className="h-3.5 w-px bg-white/20" />
                <div className="flex items-center gap-1.5 text-white/70">
                  <Users className="h-4 w-4" />
                  <span>
                    {(course.enrollmentCount || 0).toLocaleString()} students
                  </span>
                </div>
              </div>

              {/* Instructor */}
              {course.teacher?.name && (
                <div className="mt-5 flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">
                    {course.teacher.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      Created by
                    </p>
                    <p className="text-sm font-bold text-white">
                      {course.teacher.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Meta pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  {fmtShort(course.totalDurationSec)} of video
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                  <BookOpen className="h-3 w-3 text-indigo-400" />
                  {course.lessonsCount || 0} lessons
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white/90 backdrop-blur-sm">
                  <GraduationCap className="h-3 w-3 text-indigo-400" />
                  {course.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                  <Globe className="h-3 w-3 text-indigo-400" />
                  {course.language}
                </span>
                {course.certificateEnabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                    <Award className="h-3 w-3 text-indigo-400" />
                    Certificate
                  </span>
                )}
              </div>
            </div>

            {/* ── RIGHT: Video preview card ── */}
            <div className="lg:-mb-40 lg:mt-0">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-slate-900">
                {/* Video */}
                <div className="relative aspect-video bg-slate-900">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800">
                      <BookOpen className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                  {firstPreviewLesson && (
                    <button
                      onClick={() =>
                        openPreview(
                          firstPreviewLesson.id,
                          firstPreviewLesson.title
                        )
                      }
                      className="group absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/55"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
                          <PlayCircle className="h-9 w-9 text-indigo-600" />
                        </div>
                        <span className="text-sm font-bold text-white drop-shadow-lg">
                          Preview this course
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="p-5">
                  {isEnrolled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                            {`You're enrolled`}
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            Continue from where you left off
                          </p>
                        </div>
                      </div>
                      <Button
                        className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold shadow-md shadow-emerald-500/25"
                        onClick={() => router.push(`/student/learn/${slug}`)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue learning
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                          {price}
                        </span>
                        {originalPrice && (
                          <span className="text-base text-slate-400 line-through">
                            {originalPrice}
                          </span>
                        )}
                        {discountPct > 0 && (
                          <span className="ml-auto rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                      {originalPrice && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          ⚡ Limited time offer
                        </p>
                      )}

                      <div className="mt-4 space-y-2">
                        {inCart ? (
                          <Button
                            className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            onClick={() => router.push("/cart")}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Added — View cart
                          </Button>
                        ) : (
                          <Button
                            className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
                            onClick={handlePrimaryAction}
                            disabled={addingToCart}
                          >
                            {addingToCart ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isFree ? (
                              <Zap className="mr-2 h-4 w-4" />
                            ) : (
                              <ShoppingCart className="mr-2 h-4 w-4" />
                            )}
                            {isFree ? "Enroll free" : "Buy now"}
                          </Button>
                        )}
                      </div>

                      <p className="mt-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                        <Shield className="mr-1 inline h-3 w-3" />
                        30-day money-back guarantee
                      </p>
                    </>
                  )}

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      This course includes
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <PlayCircle className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        {fmtLong(course.totalDurationSec)} of video
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        {course.lessonsCount || 0} lessons
                      </li>
                      {course.certificateEnabled && (
                        <li className="flex items-center gap-2">
                          <Award className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          Certificate of completion
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <InfinityIcon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        Lifetime access
                      </li>
                      <li className="flex items-center gap-2">
                        <Smartphone className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        Mobile & desktop access
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <button className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400">
                      <Heart className="h-3 w-3" /> Save
                    </button>
                    <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                      <Share2 className="h-3 w-3" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* BODY — 2-col with sticky sidebar                  */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* ════════════════════════════════════════════ */}
          {/* LEFT: Main content                          */}
          {/* ════════════════════════════════════════════ */}
          <div className="min-w-0 space-y-10">
            {/* What you'll learn */}
            {course.learningObjectives?.length > 0 && (
              <section>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50">
                  <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {`What you'll learn`}
                  </h2>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {course.learningObjectives.map((obj: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Course content */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Course content
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {course.sectionsCount || 0} sections · {course.lessonsCount || 0} lessons · {fmtShort(course.totalDurationSec)}
                </p>
              </div>

              {/* Preview hint */}
              {previewLessons.length > 0 && (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <PlayCircle className="mr-1 inline h-3 w-3 text-indigo-500" />
                  {previewLessons.length} lesson
                  {previewLessons.length === 1 ? "" : "s"} available as free
                  preview
                </p>
              )}

              <Accordion
                type="multiple"
                defaultValue={(course.sections || []).map((s: any) => s.id)}
                className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                {(course.sections || []).map((section: any, si: number) => {
                  const sd = (section.lessons || []).reduce(
                    (a: number, l: any) => a + (l.duration || 0),
                    0
                  );
                  return (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      <AccordionTrigger className="px-4 py-3.5 text-left hover:no-underline">
                        <div className="flex flex-1 items-center gap-3 pr-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {si + 1}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {section.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {(section.lessons || []).length} lessons · {sd} min
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <ul className="divide-y divide-slate-100 px-2 dark:divide-slate-800">
                          {(section.lessons || []).map((lesson: any) => {
                            const Icon =
                              LESSON_ICONS[lesson.type] || BookOpen;
                            return (
                              <li
                                key={lesson.id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <Icon
                                    className={`h-4 w-4 shrink-0 ${
                                      lesson.freePreview
                                        ? "text-indigo-500"
                                        : "text-slate-400"
                                    }`}
                                  />
                                  <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                                    {lesson.title}
                                  </span>
                                  {lesson.freePreview && (
                                    <button
                                      onClick={() =>
                                        openPreview(lesson.id, lesson.title)
                                      }
                                      className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                                    >
                                      Preview
                                    </button>
                                  )}
                                </div>
                                <span className="shrink-0 text-xs text-slate-400">
                                  {lesson.type === "video" ||
                                  lesson.type === "text"
                                    ? lesson.duration
                                      ? `${lesson.duration}m`
                                      : ""
                                    : lesson.type === "quiz"
                                    ? "Quiz"
                                    : lesson.type === "assignment"
                                    ? "Assignment"
                                    : lesson.type === "file"
                                    ? "File"
                                    : ""}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </section>

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <section>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Requirements
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {course.requirements.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {course.description && (
              <section>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Description
                </h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {course.description}
                </div>
              </section>
            )}

            {/* Instructor */}
            {course.teacher?.name && (
              <section>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Instructor
                </h2>
                <div className="mt-3 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-black text-white shadow-lg">
                    {course.teacher.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {course.teacher.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Expert Instructor
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {(course.ratingAvg || 0).toFixed(1)} rating
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(course.enrollmentCount || 0).toLocaleString()} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessonsCount || 0} lessons
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Student feedback */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Student feedback
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(course.ratingAvg || 0).toFixed(1)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ({totalRated} reviews)
                    </span>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <>
                  <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[180px_1fr] dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-4 sm:border-b-0 sm:border-r sm:border-slate-100 sm:pb-0 sm:pr-4 dark:border-slate-800">
                      <p className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        {(course.ratingAvg || 0).toFixed(1)}
                      </p>
                      <div className="mt-1.5 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(course.ratingAvg || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Course rating
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {ratingDist.map((r) => {
                        const pct =
                          totalRated > 0 ? (r.count / totalRated) * 100 : 0;
                        return (
                          <div
                            key={r.stars}
                            className="flex items-center gap-2.5"
                          >
                            <span className="flex w-10 items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {r.stars}
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs text-slate-500 dark:text-slate-400">
                              {r.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviews.map((r) => (
                      <div
                        key={r._id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                            {r.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {r.user?.name || "Student"}
                            </p>
                            <div className="mt-0.5 flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 ${
                                    i < r.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200 dark:text-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.title && (
                          <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                            {r.title}
                          </p>
                        )}
                        {r.comment && (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {r.comment}
                          </p>
                        )}
                        {r.teacherReply && (
                          <div className="mt-3 rounded-lg border-l-2 border-indigo-500 bg-indigo-50/60 p-2.5 dark:bg-indigo-500/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                              Instructor reply
                            </p>
                            <p className="mt-0.5 text-sm text-indigo-800 dark:text-indigo-400">
                              {r.teacherReply.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-center dark:border-slate-800 dark:bg-slate-900/50">
                  <MessageSquare className="h-6 w-6 text-amber-500" />
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    No reviews yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Be the first to review this course after enrolling.
                  </p>
                </div>
              )}
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="mt-3">
                {FAQ.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-slate-200 dark:border-slate-800"
                  >
                    <AccordionTrigger className="py-3 text-left text-sm font-bold text-slate-900 hover:no-underline dark:text-white">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* RIGHT: Sticky sidebar — empty at bottom     */}
          {/* ════════════════════════════════════════════ */}
          <aside className="hidden lg:block">
            {/* Sticky CTA card below the video card */}
            {!isEnrolled && (
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {price}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {originalPrice}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  ⚡ Limited time
                </p>

                <div className="mt-3 space-y-2">
                  {inCart ? (
                    <Button
                      className="h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                      onClick={() => router.push("/cart")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      View cart
                    </Button>
                  ) : (
                    <Button
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold shadow-md shadow-indigo-500/25"
                      onClick={handlePrimaryAction}
                      disabled={addingToCart}
                    >
                      {addingToCart ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      Buy now
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
                  <Shield className="mr-1 inline h-2.5 w-2.5" />
                  30-day guarantee
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Students also viewed
              </h2>
              <Link
                href="/courses"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Browse all →
              </Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      {showMobileCta && !isEnrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {price}
              </p>
            </div>
            <Button
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 font-semibold shadow-lg shadow-indigo-500/25"
              onClick={handlePrimaryAction}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : inCart ? (
                "View cart"
              ) : isFree ? (
                "Enroll free"
              ) : (
                "Buy now"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* PREVIEW MODAL — handles every lesson type         */}
      {/* ══════════════════════════════════════════════════ */}
      <Dialog
        open={!!previewLesson}
        onOpenChange={(o) => {
          if (!o) {
            setPreviewLesson(null);
            setPreviewData(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {previewLesson?.title || "Preview"}
          </DialogTitle>

          {previewLoading ? (
            <div className="flex aspect-video items-center justify-center bg-slate-900">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          ) : !previewData ? (
            <div className="flex aspect-video items-center justify-center bg-slate-900 text-white">
              <p className="text-sm">Preview unavailable</p>
            </div>
          ) : (
            <>
              {/* VIDEO */}
              {previewData.type === "video" && previewData.url && (
                <VideoPlayer
                  src={previewData.url}
                  className="aspect-video w-full"
                  autoPlay
                />
              )}

              {/* FILE */}
              {previewData.type === "file" && previewData.url && (
                <div className="p-6">
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                      <File className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {previewData.name || previewData.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {previewData.mimeType}
                        {previewData.size
                          ? ` · ${(previewData.size / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </p>
                      <a
                        href={previewData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download file
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TEXT */}
              {previewData.type === "text" && (
                <div className="max-h-[70vh] overflow-y-auto p-6">
                  <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-700 dark:prose-invert dark:text-slate-300">
                    {previewData.textContent}
                  </div>
                </div>
              )}

              {/* ASSIGNMENT */}
              {previewData.type === "assignment" && (
                <div className="p-6">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                    <p className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
                      <ClipboardList className="h-4 w-4" />
                      Assignment preview
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm text-amber-800 dark:text-amber-400">
                      {previewData.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* QUIZ */}
              {previewData.type === "quiz" && (
                <div className="p-6">
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 dark:border-violet-500/30 dark:bg-violet-500/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
                        <FileQuestion className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="font-bold text-violet-900 dark:text-violet-200">
                          {previewData.quiz?.title || previewData.title}
                        </p>
                        <p className="mt-0.5 text-xs text-violet-700 dark:text-violet-400">
                          {previewData.quiz?.questionCount || 0} questions ·{" "}
                          {previewData.quiz?.passingScore || 70}% to pass
                          {previewData.quiz?.timeLimitSec
                            ? ` · ${Math.round(
                                previewData.quiz.timeLimitSec / 60
                              )} min`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white/70 p-3 dark:bg-slate-900/70">
                      <p className="text-xs text-violet-800 dark:text-violet-400">
                        {previewData.note ||
                          "Enroll to take this quiz and see your results."}
                      </p>
                    </div>
                    <Button
                      className="mt-4 w-full rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700"
                      onClick={() => {
                        setPreviewLesson(null);
                        setPreviewData(null);
                        handlePrimaryAction();
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Enroll to take this quiz
                    </Button>
                  </div>
                </div>
              )}

              {/* Header for non-video types */}
              {previewData.type !== "video" && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {previewData.type === "text" && <FileText className="h-4 w-4" />}
                    {previewData.type === "file" && <File className="h-4 w-4" />}
                    {previewData.type === "quiz" && (
                      <FileQuestion className="h-4 w-4" />
                    )}
                    {previewData.type === "assignment" && (
                      <ClipboardList className="h-4 w-4" />
                    )}
                    <span className="font-semibold capitalize">
                      {previewData.type} preview
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewLesson(null);
                      setPreviewData(null);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}