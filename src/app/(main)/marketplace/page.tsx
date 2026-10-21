"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
  Star,
  Users,
  Clock,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import CourseCard from "./_components/course-card";
import Sidebar from "./_components/sidebar";
import { cn } from "@/lib/utils";

// Types matching backend
type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";
type SortOption = "-createdAt" | "title" | "price" | "-students" | "-rating";

interface OneTimePricing {
  price: number;
  currency: string;
  discountPercent?: number;
}

interface SubscriptionTier {
  id: string;
  interval: "weekly" | "monthly" | "yearly";
  price: number;
  discountPercent?: number;
  isActive: boolean;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnailMediaId?: string | { url?: string };
  priceModel: "free" | "onetime" | "subscription";
  oneTimePricing?: OneTimePricing;
  subscriptionTiers?: SubscriptionTier[];
  students?: number;
  rating?: number;
  lessonsCount?: number;
  teacher?: { name: string };
  createdAt: string;
  category?: string;
  level?: CourseLevel;
}

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function MarketplacePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [level, setLevel] = useState<CourseLevel>("all");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("-createdAt");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit,
        sort: sortBy,
        q: search || undefined,
        category: category !== "all" ? category : undefined,
        level: level !== "all" ? level : undefined,
        minPrice,
        maxPrice,
        minRating,
      };
      Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

      const response = await api.get("/courses", { params });
      setCourses(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load courses");
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, search, category, level, minPrice, maxPrice, minRating]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCourses();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, level, minPrice, maxPrice, minRating, sortBy, fetchCourses]);

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setLevel("all");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setSortBy("-createdAt");
    setPage(1);
  };

  const getThumbnailUrl = (course: Course): string => {
    if (!course.thumbnailMediaId) return "";
    if (typeof course.thumbnailMediaId === "object") {
      const url = course.thumbnailMediaId.url;
      if (url) return url.startsWith("/") ? `${BACKEND_ORIGIN}${url}` : url;
    } else if (typeof course.thumbnailMediaId === "string") {
      return `${BACKEND_ORIGIN}/api/media/${course.thumbnailMediaId}/presigned-url`;
    }
    return "";
  };

  // Helper to compute display price string
  const getPriceDisplay = (course: Course): string => {
    if (course.priceModel === "free") return "Free";
    if (course.priceModel === "onetime" && course.oneTimePricing) {
      const { price, currency, discountPercent } = course.oneTimePricing;
      const finalPrice = discountPercent ? price * (1 - discountPercent / 100) : price;
      return `${"$"}${finalPrice.toFixed(2)}`;
    }
    if (course.priceModel === "subscription" && course.subscriptionTiers?.length) {
      const activeTiers = course.subscriptionTiers.filter((t) => t.isActive);
      if (activeTiers.length === 0) return "Subscription";
      const minTier = activeTiers.reduce((min, t) => (t.price < min.price ? t : min));
      return `From $${minTier.price}/${minTier.interval}`;
    }
    return "Price not set";
  };

  const hasActiveFilters =
    search || category !== "all" || level !== "all" || minPrice || maxPrice || minRating;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          {/* Decorative pattern */}
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-20 md:py-28">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Learn from industry experts</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Find Your Perfect Course
            </h1>
            <p className="mt-4 text-lg text-white/80 md:text-xl">
              Explore a wide range of courses taught by world‑class instructors.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for courses, skills, or topics..."
                className="h-14 rounded-full bg-white pl-12 pr-12 text-slate-900 shadow-2xl outline-none ring-0 focus-visible:ring-4 focus-visible:ring-white/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["all", "development", "design", "marketing", "business", "data-science"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    category === cat
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  )}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-0 z-50 flex w-72 flex-col bg-white p-6 shadow-2xl transition-transform lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:rounded-2xl lg:shadow-none lg:border lg:border-slate-200",
              mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar
              category={category}
              setCategory={setCategory}
              level={level}
              setLevel={setLevel}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              clearFilters={clearFilters}
            />
            {mobileFiltersOpen && (
              <div className="mt-auto lg:hidden">
                <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            )}
          </aside>

          {/* Overlay */}
          {mobileFiltersOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Courses */}
          <section className="flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">All Courses</h2>
                <p className="text-sm text-slate-500">
                  {total} {total === 1 ? "course" : "courses"} available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-createdAt">Newest</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="-students">Most Popular</SelectItem>
                    <SelectItem value="-rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="relative"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading / Error / Empty */}
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-6 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center">
                <BookOpen className="mx-auto h-16 w-16 text-slate-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">No courses found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try adjusting your search or filters.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                {/* Course grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      getThumbnailUrl={getThumbnailUrl}
                      getPriceDisplay={getPriceDisplay}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((prev) => Math.max(1, prev - 1));
                            }}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={p === page}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage((prev) => Math.min(totalPages, prev + 1));
                            }}
                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}