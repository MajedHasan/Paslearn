"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  Clock3,
  Play,
  Share2,
  Star,
  X,
  ArrowLeft,
  Globe,
  Calendar,
  Tag,
  BookOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";
import VideoPlayer from "@/components/global/video/player/video-player";

// Types matching backend (extended)
interface Course {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailMediaId?: string | { url?: string };
  promoVideo?: string;
  priceModel: "free" | "onetime" | "subscription";
  oneTimePricing?: {
    price: number;
    currency: string;
    discountPercent?: number;
  };
  subscriptionTiers?: {
    id: string;
    interval: "weekly" | "monthly" | "yearly";
    price: number;
    discountPercent?: number;
    isActive: boolean;
  }[];
  sections?: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration?: number;
      freePreview: boolean;
      content?: {
        videoUrl?: string;
        videoMediaId?: string;
        textContent?: string;
      };
    }[];
  }[];
  learningObjectives?: string[];
  requirements?: string[];
  audience?: string[];
  students?: number;
  rating?: number;
  reviewsCount?: number;
  teacher?: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  category?: string;
  level?: string;
  language?: string;
  certificateEnabled?: boolean;
  accessDuration?: number;
  instructorBio?: string;
  integrations?: string[];
  tags?: string[];
  badge?: string;
}

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

function resolveUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_ORIGIN}${url}`;
}

function Stars({ size = 18, rating = 5 }: { size?: number; rating?: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < rating ? "#DAA520" : "#ddd"} strokeWidth={0} />
      ))}
    </span>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}?populate=thumbnailMediaId,teacher`);
        setCourse(res.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load course");
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const getThumbnailUrl = () => {
    if (!course?.thumbnailMediaId) return "";
    if (typeof course.thumbnailMediaId === "object") {
      return resolveUrl(course.thumbnailMediaId.url);
    } else if (typeof course.thumbnailMediaId === "string") {
      return `${BACKEND_ORIGIN}/api/media/${course.thumbnailMediaId}/presigned-url`;
    }
    return "";
  };

  const getPriceDisplay = () => {
    if (!course) return "";
    if (course.priceModel === "free") return "Free";
    if (course.priceModel === "onetime" && course.oneTimePricing) {
      const { price, currency, discountPercent } = course.oneTimePricing;
      const finalPrice = discountPercent ? price * (1 - discountPercent / 100) : price;
      return `${currency}${finalPrice.toFixed(2)}`;
    }
    if (course.priceModel === "subscription" && course.subscriptionTiers?.length) {
      const activeTiers = course.subscriptionTiers.filter((t) => t.isActive);
      if (activeTiers.length === 0) return "Subscription";
      const minTier = activeTiers.reduce((min, t) => (t.price < min.price ? t : min));
      return `From $${minTier.price}/${minTier.interval}`;
    }
    return "Price not set";
  };

  const getOriginalPrice = () => {
    if (course?.priceModel === "onetime" && course.oneTimePricing?.discountPercent) {
      return `${course.oneTimePricing.currency}${course.oneTimePricing.price.toFixed(2)}`;
    }
    return "";
  };

  const getDiscountPercent = () => {
    if (course?.priceModel === "onetime" && course.oneTimePricing?.discountPercent) {
      return `${course.oneTimePricing.discountPercent}% Off`;
    }
    return "";
  };

  const totalLessons = course?.sections?.reduce((acc, sec) => acc + sec.lessons.length, 0) || 0;
  const totalHours = Math.round(
    (course?.sections?.reduce(
      (acc, sec) => acc + sec.lessons.reduce((a, l) => a + (l.duration || 0), 0),
      0
    ) || 0) / 60
  );

  const getPreviewVideoUrl = (): string => {
    if (course?.promoVideo) return course.promoVideo;
    const freeLesson = course?.sections?.flatMap((s) => s.lessons).find((l) => l.freePreview && l.content?.videoUrl);
    return freeLesson?.content?.videoUrl ? resolveUrl(freeLesson.content.videoUrl) : "";
  };

  const openPreview = (videoUrl?: string) => {
    setPreviewUrl(videoUrl || getPreviewVideoUrl());
    setPreviewOpen(true);
  };

  const handleBuy = async () => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolled(true);
      toast.success("Successfully enrolled!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Enrollment failed");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: course?.title || "Course", url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (error) {}
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DAA520] border-t-transparent" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-xl font-bold">Course not found</h2>
        <Link href="/teacher/marketplace">
          <Button variant="outline" className="mt-4">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const includes = [
    { icon: Award, text: "Money Back Guarantee" },
    { icon: Camera, text: "Access on all devices" },
    { icon: Check, text: "Certification of completion" },
    { icon: BarChart3, text: `${course.sections?.length || 0} Modules` },
    { icon: Clock3, text: `${totalHours} hours on-demand video` },
    { icon: Globe, text: course.language || "English" },
    { icon: Users, text: `${course.students || 0} students` },
    ...(course.accessDuration
      ? [{ icon: Calendar, text: `${course.accessDuration} days access` }]
      : []),
  ];
  const social = [
    { label: "Share on Twitter", mark: "t" },
    { label: "Share on Facebook", mark: "f" },
    { label: "Share on YouTube", mark: "▶" },
    { label: "Share on Instagram", mark: "◎" },
    { label: "Share on LinkedIn", mark: "in" },
    { label: "Copy course link", mark: "↗" },
  ];

  return (
    <main style={{ backgroundColor: "#faf8f5" }}>
      {/* Hero */}
      <section className="relative overflow-visible bg-black px-5 pb-20 pt-12 text-white md:px-[6.3%] md:pt-20">
        <Link href="/teacher/marketplace" className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft size={18} /> Back to Marketplace
        </Link>
        <div className="mx-auto max-w-[1520px]">
          <div className="max-w-[700px]">
            <p className="mb-5 text-sm font-bold uppercase tracking-[.24em] text-[#DAA520]">
              {course.category} · Featured course
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] md:text-6xl">{course.title}</h1>
            <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/75 md:text-xl">
              {course.subtitle || course.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/85">
              <span className="flex items-center gap-2">
                <Stars size={16} rating={course.rating || 0} /> {course.rating?.toFixed(1)} rating
              </span>
              <span>{course.sections?.length || 0} Modules</span>
              <span>{totalHours} hours</span>
              <span>{course.language || "English"}</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
                {course.level || "All Levels"}
              </span>
              {course.certificateEnabled && (
                <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
                  Certificate included
                </span>
              )}
              {course.tags?.map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 px-4 py-2 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Preview button */}
          <button
            onClick={() => openPreview()}
            className="group relative mt-10 aspect-video w-full overflow-hidden rounded-2xl border-8 border-white bg-black shadow-[0_24px_60px_rgba(0,0,0,.3)] transition hover:-translate-y-1 lg:absolute lg:right-[7%] lg:top-[250px] lg:z-20 lg:w-[400px]"
          >
            {getThumbnailUrl() ? (
              <img src={getThumbnailUrl()} alt={course.title} className="h-full w-full object-cover opacity-60" />
            ) : (
              <div className="h-full w-full bg-slate-800" />
            )}
            <span className="absolute inset-0 bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-[#DAA520] text-black shadow-xl transition group-hover:scale-110">
                <Play size={30} fill="currentColor" />
              </span>
            </span>
            <span className="absolute bottom-4 left-5 text-left text-white">
              <span className="block text-xs font-bold uppercase tracking-[.2em] text-white/70">Preview this course</span>
              <span className="text-xl font-bold">Start learning today</span>
            </span>
          </button>
        </div>
      </section>

      {/* Main content and sidebar */}
      <div className="relative mx-auto grid max-w-[1520px] gap-10 px-5 pb-16 pt-8 md:px-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 lg:pt-24">
        <div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-2 gap-3 py-8 md:flex md:gap-4">
              {["Overview", "Curriculum", "Instructor", "Reviews"].map((tab) => (
                <TabsTrigger key={tab} value={tab.toLowerCase()} className="h-14 rounded-xl px-4 text-base font-bold transition md:w-[150px]">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-10">
              <h2 className="text-3xl font-bold text-black">About this course</h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b5b5b]">{course.description}</p>
              {course.learningObjectives?.length ? (
                <div className="mt-9">
                  <h3 className="font-bold text-black">What you’ll learn</h3>
                  <ul className="mt-4 grid gap-3 md:grid-cols-2 text-[#5b5b5b]">
                    {course.learningObjectives.map((obj) => (
                      <li key={obj} className="flex gap-3"><Check className="text-[#DAA520]" />{obj}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {course.requirements?.length ? (
                <div className="mt-8">
                  <h3 className="font-bold text-black">Requirements</h3>
                  <ul className="mt-3 list-disc pl-5 text-[#5b5b5b]">
                    {course.requirements.map((req) => <li key={req}>{req}</li>)}
                  </ul>
                </div>
              ) : null}
              {course.audience?.length ? (
                <div className="mt-8">
                  <h3 className="font-bold text-black">Who this course is for</h3>
                  <ul className="mt-3 list-disc pl-5 text-[#5b5b5b]">
                    {course.audience.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              ) : null}
            </TabsContent>

            {/* Curriculum */}
            <TabsContent value="curriculum" className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-10">
              <h2 className="text-3xl font-bold text-black">Course curriculum</h2>
              <p className="mt-4 leading-7 text-[#5b5b5b]">
                {course.sections?.length || 0} sections · {totalLessons} lectures · {totalHours} hours total
              </p>
              <Accordion type="single" collapsible className="mt-8">
                {course.sections?.map((section, idx) => (
                  <AccordionItem key={section.id} value={`section-${idx}`} className="border border-black/10 rounded-xl overflow-hidden mb-3">
                    <AccordionTrigger className="px-4 py-4 font-bold text-black hover:no-underline">
                      <span className="flex items-center gap-3">
                        <ChevronDown className="h-5 w-5" />
                        {section.title}
                      </span>
                      <span className="ml-auto text-sm font-normal text-muted-foreground">{section.lessons.length} lectures</span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-black/[.03] px-4 py-4">
                      <ul className="space-y-2">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {lesson.freePreview ? (
                                <button onClick={() => openPreview(resolveUrl(lesson.content?.videoUrl))} className="flex items-center gap-2 text-left">
                                  <Play className="h-4 w-4 text-[#DAA520]" />
                                  <span className="text-slate-900">{lesson.title} (Free Preview)</span>
                                </button>
                              ) : (
                                <>
                                  <BookOpen className="h-4 w-4 text-green-500" />
                                  {lesson.title}
                                </>
                              )}
                            </span>
                            <span className="text-muted-foreground">{lesson.duration || 0}min</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            {/* Instructor */}
            <TabsContent value="instructor" className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-10">
              <div className="flex flex-col gap-7 md:flex-row md:items-center">
                <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-black text-4xl font-bold text-[#DAA520]">
                  {course.teacher?.name?.charAt(0) || "T"}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.2em] text-[#DAA520]">Your instructor</p>
                  <h2 className="mt-2 text-3xl font-bold text-black">{course.teacher?.name || "Instructor"}</h2>
                  <p className="mt-2 text-[#5b5b5b]">{course.teacher?.bio || course.instructorBio || "Passionate educator"}</p>
                </div>
              </div>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews" className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-10">
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-black px-8 py-8 text-white md:w-[270px] md:shrink-0">
                  <p className="text-4xl font-semibold">{course.rating?.toFixed(1) || "0.0"}</p>
                  <Stars size={24} rating={course.rating || 0} />
                  <p className="mt-4 text-lg text-white/70">{course.reviewsCount || 0} reviews</p>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4 text-base text-muted-foreground">
                      <span className="w-[75px] shrink-0">{star} Stars</span>
                      <div className="h-2 flex-1 rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-[#DAA520]" style={{ width: `${Math.max(0, 82 - star * 15)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl border border-black/10 bg-white p-6 shadow-xl md:p-7 lg:sticky lg:top-6">
          <div className="flex flex-wrap items-baseline gap-x-4">
            <span className="text-5xl font-bold text-black">{getPriceDisplay()}</span>
            {getOriginalPrice() && <span className="text-xl font-semibold text-muted-foreground line-through">{getOriginalPrice()}</span>}
            {getDiscountPercent() && <span className="text-xl font-semibold text-black">{getDiscountPercent()}</span>}
          </div>
          <p className="mt-4 text-center font-bold text-[#b8860b]">11 hours left at this price</p>
          <Button onClick={handleBuy} className="mt-7 h-16 w-full rounded-xl text-lg font-bold bg-[#DAA520] text-black hover:bg-[#e6c65c]" disabled={enrolled}>
            {enrolled ? "Added to your plan" : "Buy Now"}
          </Button>
          <Separator className="my-7" />
          <h2 className="text-2xl font-bold text-black">This course includes</h2>
          <ul className="mt-6 flex flex-col gap-5">
            {includes.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 font-semibold text-muted-foreground">
                <Icon className="text-[#b8860b]" />{text}
              </li>
            ))}
          </ul>
          <Separator className="my-7" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-black">Share this course</h2>
            <Share2 className="text-[#b8860b]" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {social.map(({ label, mark }) => (
              <button key={label} onClick={handleShare} className="flex size-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white transition hover:bg-[#DAA520] hover:text-black" aria-label={label}>
                {mark}
              </button>
            ))}
          </div>
          {shared && <p className="mt-4 text-sm font-semibold text-[#b8860b]">Course link copied.</p>}
        </aside>
      </div>

      {/* Preview Dialog with custom player */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {previewUrl ? <VideoPlayer src={previewUrl} /> : <div className="flex h-full items-center justify-center">No preview available</div>}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}