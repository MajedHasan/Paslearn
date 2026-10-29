"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, BookOpen, ChevronLeft, ChevronRight, X,
  SlidersHorizontal, Sparkles, TrendingUp, Users, Layers,
  ArrowRight, Star, Trophy, CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import {
  CourseCard,
  CourseCardSkeleton,
  PublicCourse,
} from "@/components/public/course-card";

const CATEGORIES = [
  { value: "all", label: "All", icon: Sparkles },
  { value: "development", label: "Development", icon: Layers },
  { value: "design", label: "Design", icon: Star },
  { value: "marketing", label: "Marketing", icon: TrendingUp },
  { value: "business", label: "Business", icon: Users },
  { value: "data-science", label: "Data Science", icon: Trophy },
];

const DIFFICULTIES = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const PRICES = [
  { value: "all", label: "Any price" },
  { value: "free", label: "Free" },
  { value: "onetime", label: "Paid" },
];

const SORTS = [
  { value: "-publishedAt", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function CatalogPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [priceModel, setPriceModel] = useState("all");
  const [sort, setSort] = useState("-publishedAt");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit, sort };
      if (search) params.q = search;
      if (category !== "all") params.category = category;
      if (difficulty !== "all") params.difficulty = difficulty;
      if (priceModel !== "all") params.priceModel = priceModel;

      const r = await api.get("/public/courses", { params });
      setCourses(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, difficulty, priceModel]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.ceil(total / limit);
  const hasActiveFilters =
    category !== "all" ||
    difficulty !== "all" ||
    priceModel !== "all" ||
    search !== "";

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("all");
    setDifficulty("all");
    setPriceModel("all");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ══════════════════════════════════════════════ */}
      {/* HERO — compact, tight                          */}
      {/* ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#fafaff] dark:bg-slate-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-400/20 via-violet-400/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-32 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-fuchsia-400/15 via-pink-400/10 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          {/* Eyebrow */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
              <span className="flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-slate-700 dark:text-slate-300">
                {total > 0
                  ? `${total.toLocaleString()} world-class courses`
                  : "World-class learning, on your terms"}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mx-auto mt-6 max-w-4xl text-center text-4xl font-black leading-[1.05] tracking-[-0.02em] text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]">
            Learn skills that
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                actually matter.
              </span>
              <svg
                className="absolute -bottom-3 left-0 w-full text-indigo-400/50"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8c60-6 130-6 210-3 25 1 55 3 86 1"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Search */}
          <div className="relative mx-auto mt-10 max-w-2xl">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-20 blur-lg" />
            <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <Search className="ml-5 h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="What do you want to learn today?"
                className="h-14 flex-1 bg-transparent px-3 text-base text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setSearch(searchInput.trim())}
                className="m-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium">Lifetime access</span>
            </div>
            <div className="hidden h-3 w-px bg-slate-300 sm:block dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">Verified reviews</span>
            </div>
            <div className="hidden h-3 w-px bg-slate-300 sm:block dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-medium">Expert instructors</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CATEGORY PILLS — sticky strip                 */}
      {/* ══════════════════════════════════════════════ */}
      <section className="sticky top-0 z-20 border-y border-slate-200/60 bg-white/95 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => {
                    setCategory(c.value);
                    setPage(1);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* MAIN GRID                                     */}
      {/* ══════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Refine
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Level
                  </p>
                  <div className="space-y-0.5">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => {
                          setDifficulty(d.value);
                          setPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          difficulty === d.value
                            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Price
                  </p>
                  <div className="space-y-0.5">
                    {PRICES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          setPriceModel(p.value);
                          setPage(1);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          priceModel === p.value
                            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl" />
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h4 className="mt-2 text-sm font-bold">Share what you know</h4>
                <p className="mt-0.5 text-[11px] text-white/70">
                  Create your first course in minutes.
                </p>
                <Link href="/teacher/courses/new">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full rounded-lg bg-white text-xs text-slate-900 hover:bg-white/90"
                  >
                    Start teaching <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg lg:hidden"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                  Filters
                </Button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {loading
                    ? "Loading..."
                    : (
                      <>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {total.toLocaleString()}
                        </span>{" "}
                        {total === 1 ? "course" : "courses"}
                      </>
                    )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
                  Sort
                </span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-8 w-36 rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chips */}
            {hasActiveFilters && (
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {search && (
                  <Badge variant="secondary" className="gap-1 rounded-full bg-slate-100 text-[11px] dark:bg-slate-800">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => { setSearchInput(""); setSearch(""); }}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {category !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-full capitalize text-[11px]">
                    {category}
                    <button onClick={() => setCategory("all")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {difficulty !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-full capitalize text-[11px]">
                    {difficulty}
                    <button onClick={() => setDifficulty("all")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {priceModel !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-full capitalize text-[11px]">
                    {priceModel === "onetime" ? "Paid" : priceModel}
                    <button onClick={() => setPriceModel("all")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-rose-200 bg-rose-50/50 py-16 text-center dark:border-rose-500/30 dark:bg-rose-500/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                  <X className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="mt-3 text-base font-bold text-rose-900 dark:text-rose-300">
                  Something went wrong
                </h3>
                <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400">{error}</p>
                <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={load}>
                  Try again
                </Button>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 py-16 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/50">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                  <BookOpen className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                  No courses match
                </h3>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Try a different search or clear filters to see all courses.
                </p>
                <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((c) => (
                    <CourseCard key={c._id} course={c} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => {
                          setPage((p) => p - 1);
                          window.scrollTo({ top: 500, behavior: "smooth" });
                        }}
                        className="rounded-lg"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => {
                          setPage((p) => p + 1);
                          window.scrollTo({ top: 500, behavior: "smooth" });
                        }}
                        className="rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Level</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => { setDifficulty(d.value); setPage(1); }}
                    className={`rounded-lg border-2 p-2.5 text-left text-xs font-semibold transition-all ${
                      difficulty === d.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Price</p>
              <div className="grid grid-cols-3 gap-1.5">
                {PRICES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setPriceModel(p.value); setPage(1); }}
                    className={`rounded-lg border-2 p-2.5 text-center text-xs font-semibold transition-all ${
                      priceModel === p.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-lg" onClick={clearFilters}>
                Clear
              </Button>
              <Button
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowMobileFilters(false)}
              >
                Show {total} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}