"use client";

import Link from "next/link";
import { Star, Users, Clock, BookOpen, ArrowUpRight } from "lucide-react";

export interface PublicCourse {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category?: string;
  difficulty?: string;
  language?: string;
  badge?: string;
  thumbnailUrl?: string | null;
  priceModel: "free" | "onetime" | "subscription";
  oneTimePricing?: { price: number; originalPrice?: number; discountPercent?: number };
  subscriptionTiers?: Array<{ interval: string; price: number; isActive?: boolean }>;
  ratingAvg?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  lessonsCount?: number;
  totalDurationSec?: number;
  teacher?: { name?: string; profileImageUrl?: string };
  publishedAt?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  development: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  design: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
  marketing: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  business: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "data-science": "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
};

function formatDuration(sec?: number): string {
  if (!sec || sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function priceInfo(c: PublicCourse): { primary: string; secondary?: string; strike?: string } {
  if (c.priceModel === "free") return { primary: "Free" };
  if (c.priceModel === "onetime" && c.oneTimePricing) {
    const p = c.oneTimePricing.price || 0;
    const op = c.oneTimePricing.originalPrice || 0;
    if (op > p) {
      return {
        primary: `$${p.toFixed(2)}`,
        strike: `$${op.toFixed(2)}`,
      };
    }
    return { primary: `$${p.toFixed(2)}` };
  }
  if (c.priceModel === "subscription" && c.subscriptionTiers?.length) {
    const t = c.subscriptionTiers.find((x) => x.isActive !== false) || c.subscriptionTiers[0];
    return { primary: `$${t.price.toFixed(2)}`, secondary: `/${t.interval.slice(0, 2)}` };
  }
  return { primary: "—" };
}

function detectBadges(c: PublicCourse): Array<{ label: string; className: string }> {
  const badges: Array<{ label: string; className: string }> = [];

  if (c.badge) {
    badges.push({
      label: c.badge,
      className: "bg-amber-500 text-white",
    });
  }

  if (c.priceModel === "free") {
    badges.push({
      label: "Free",
      className: "bg-emerald-500 text-white",
    });
  } else if (
    c.oneTimePricing?.originalPrice &&
    c.oneTimePricing.originalPrice > (c.oneTimePricing?.price || 0)
  ) {
    const pct = Math.round(
      ((c.oneTimePricing.originalPrice - c.oneTimePricing.price) /
        c.oneTimePricing.originalPrice) *
        100
    );
    if (pct > 0) {
      badges.push({
        label: `-${pct}%`,
        className: "bg-rose-500 text-white",
      });
    }
  }

  if ((c.enrollmentCount || 0) >= 100) {
    badges.push({
      label: "Bestseller",
      className: "bg-violet-600 text-white",
    });
  }

  if (c.publishedAt) {
    const days = (Date.now() - new Date(c.publishedAt).getTime()) / 86_400_000;
    if (days < 30) {
      badges.push({
        label: "New",
        className: "bg-indigo-600 text-white",
      });
    }
  }

  return badges.slice(0, 2);
}

export function CourseCard({ course }: { course: PublicCourse }) {
  const price = priceInfo(course);
  const badges = detectBadges(course);
  const catStyle =
    CATEGORY_STYLES[course.category || ""] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40"
    >
      {/* ── Thumbnail ── */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-14 w-14 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Gradient overlay — stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {badges.map((b, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-md ${b.className}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute right-3 top-3 flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full bg-white/95 text-slate-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>

        {/* Bottom price pill */}
        <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-sm font-black text-slate-900 shadow-lg backdrop-blur-sm">
          {price.primary}
          {price.secondary && (
            <span className="text-xs font-semibold text-slate-500">{price.secondary}</span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category pill */}
        <div className="flex items-center justify-between gap-2">
          {course.category && (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catStyle}`}
            >
              {course.category.replace("-", " ")}
            </span>
          )}
          {course.difficulty && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {course.difficulty}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {course.title}
        </h3>

        {/* Instructor */}
        {course.teacher?.name && (
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {course.teacher.name}
          </p>
        )}

        {/* Rating */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(course.ratingAvg || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {(course.ratingAvg || 0).toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">
            ({(course.ratingCount || 0).toLocaleString()})
          </span>
        </div>

        {/* Footer meta */}
        <div className="mt-auto flex items-center gap-3 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {(course.enrollmentCount || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(course.totalDurationSec)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessonsCount || 0}
          </span>
          {price.strike && (
            <span className="ml-auto text-xs font-semibold text-slate-400 line-through">
              {price.strike}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-video animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}