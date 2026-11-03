// app/(dashboard)/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, DollarSign, Star, Wallet, TrendingUp, Ticket,
  ArrowRight, Plus, Sparkles, Clock, AlertCircle, CheckCircle2,
  GraduationCap, MessageSquare, ChevronRight, Loader2, PartyPopper,
  FileText, Video, Package, Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface TeacherProfile {
  user?: { _id: string; name: string; email: string; profileImageUrl?: string };
  photo?: string;
  status: "pending_payment" | "active" | "inactive" | "rejected";
  domain?: string;
  selectedPlan?: { name?: string };
}

interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  avgRating: number;
}

interface EarningsSummary {
  grossRevenue: number;
  totalCoupons: number;
  totalPaid: number;
  totalPlatformFees: number;
  totalAffiliateCommissions: number;
  netEarnings: number;
  totalTransactions: number;
}

interface Transaction {
  orderId: string;
  orderNumber: string;
  paidAt: string;
  productType: string;
  productTitle: string;
  productSlug: string;
  thumbnailUrl: string | null;
  netEarning: number;
  buyerName: string;
  buyerEmail: string;
}

interface PayoutBalance {
  netEarned: number;
  alreadyAllocated: number;
  available: number;
}

interface Payout {
  _id: string;
  amount: number;
  status: "requested" | "approved" | "paid" | "rejected";
  method: string;
  createdAt: string;
}

interface CouponStats {
  totalRedemptions: number;
  totalDiscountGiven: number;
  uniqueUsers: number;
  byStatus: { reserved: number; committed: number; reversed: number };
  topCoupons: Array<{ code: string; redemptions: number; discountGiven: number }>;
}

interface PerProduct {
  productId: string;
  productType: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  ratingAvg: number;
  enrollmentCount: number;
  netEarnings: number;
  sales: number;
}

interface Review {
  _id: string;
  teacherReply?: { text: string };
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function money(n: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n || 0);
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ═══════════════════════════════════════════════════════════════
// Stat card — mockup style, one accent color per metric
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  bg,
  fg,
  href,
  loading,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  bg: string;
  fg: string;
  href?: string;
  loading?: boolean;
}) {
  const inner = (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-6 w-6", fg)} />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <div className="h-7 w-20 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="text-2xl font-black tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        )}
        <p className="mt-0.5 text-xs font-bold text-slate-500">{label}</p>
        {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
      </div>
      {href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ═══════════════════════════════════════════════════════════════
// Custom tooltips for Recharts
// ═══════════════════════════════════════════════════════════════

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm font-black text-slate-900">
        {typeof item.value === "number" ? money(item.value) : item.value}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {p.name}
      </p>
      <p className="text-sm font-black text-slate-900">
        {p.value} sale{p.value === 1 ? "" : "s"} · {money(p.payload.revenue)}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Product type icon helper
// ═══════════════════════════════════════════════════════════════

function typeIcon(type: string) {
  if (type === "course") return GraduationCap;
  if (type === "digital_file") return FileText;
  if (type === "coaching") return Video;
  return Package;
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null);
  const [products, setProducts] = useState<PerProduct[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profileRes,
        statsRes,
        earningsRes,
        balanceRes,
        payoutsRes,
        couponRes,
        perProductRes,
        reviewsRes,
      ] = await Promise.allSettled([
        api.get("/teacher-profile"),
        api.get("/teacher/courses/stats"),
        api.get("/teacher/earnings/transactions", { params: { limit: 100 } }),
        api.get("/teacher/payouts/balance"),
        api.get("/teacher/payouts", { params: { limit: 50 } }),
        api.get("/coupons/redemptions/stats"),
        api.get("/teacher/earnings/per-product"),
        api.get("/teacher/reviews", { params: { limit: 100 } }),
      ]);

      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data.data);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (earningsRes.status === "fulfilled") {
        setSummary(earningsRes.value.data.summary);
        setTransactions(earningsRes.value.data.data || []);
      }
      if (balanceRes.status === "fulfilled") setBalance(balanceRes.value.data.data);
      if (payoutsRes.status === "fulfilled") {
        setPayouts(payoutsRes.value.data.data || []);
      }
      if (couponRes.status === "fulfilled") setCouponStats(couponRes.value.data.data);
      if (perProductRes.status === "fulfilled") setProducts(perProductRes.value.data.data || []);
      if (reviewsRes.status === "fulfilled") {
        const items: Review[] = reviewsRes.value.data.data || [];
        setPendingReviews(items.filter((r) => !r.teacherReply).length);
      }

      if (statsRes.status === "rejected" && earningsRes.status === "rejected") {
        setError("Couldn't load your dashboard. Please try again.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived ────────────────────────────────────────────
  const fullName = profile?.user?.name || "Teacher";
  const teacherName = fullName.split(" ")[0];
  const email = profile?.user?.email || "";
  const avatarUrl = profile?.photo || profile?.user?.profileImageUrl || "";
  const initial = (fullName || "T").charAt(0).toUpperCase();

  const pendingPayoutAmount = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "requested" || p.status === "approved")
        .reduce((a, p) => a + (p.amount || 0), 0),
    [payouts]
  );

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.netEarnings - a.netEarnings).slice(0, 5),
    [products]
  );

  const topCoupons = useMemo(
    () => (couponStats?.topCoupons || []).slice(0, 3),
    [couponStats]
  );

  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  // ── Chart data: revenue over last 30 days ──────────────
  const revenueSeries = useMemo(() => {
    const byDay = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    transactions.forEach((t) => {
      if (!t.paidAt) return;
      const key = new Date(t.paidAt).toISOString().slice(0, 10);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + (t.netEarning || 0));
    });
    return Array.from(byDay.entries()).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(value * 100) / 100,
    }));
  }, [transactions]);

  const revenueTotal = useMemo(
    () => revenueSeries.reduce((a, s) => a + s.value, 0),
    [revenueSeries]
  );

  // ── Chart data: product mix donut ──────────────────────
  const productMix = useMemo(() => {
    const map = new Map<string, { sales: number; revenue: number }>();
    transactions.forEach((t) => {
      const cur = map.get(t.productType) || { sales: 0, revenue: 0 };
      cur.sales += 1;
      cur.revenue += t.netEarning || 0;
      map.set(t.productType, cur);
    });
    const LABELS: Record<string, string> = {
      course: "Courses",
      digital_file: "Digital files",
      coaching: "Coaching",
      platform_subscription: "Subscriptions",
      addon: "Addons",
    };
    const COLORS: Record<string, string> = {
      course: "#EAB308",
      digital_file: "#F97316",
      coaching: "#8B5CF6",
      platform_subscription: "#3B82F6",
      addon: "#64748B",
    };
    return Array.from(map.entries())
      .map(([type, d]) => ({
        name: LABELS[type] || type,
        value: d.sales,
        revenue: Math.round(d.revenue * 100) / 100,
        color: COLORS[type] || "#94A3B8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const attentionItems = useMemo(() => {
    const items: Array<{ label: string; href: string; icon: any; tone: string }> = [];
    if (pendingReviews > 0) {
      items.push({
        label: `${pendingReviews} review${pendingReviews === 1 ? "" : "s"} awaiting reply`,
        href: "/teacher/reviews",
        icon: MessageSquare,
        tone: "amber",
      });
    }
    if (pendingPayoutAmount > 0) {
      items.push({
        label: `Pending payout: ${money(pendingPayoutAmount)}`,
        href: "/teacher/billing-payments",
        icon: Wallet,
        tone: "blue",
      });
    }
    if (balance && balance.available >= 50 && pendingPayoutAmount === 0) {
      items.push({
        label: `${money(balance.available)} ready to withdraw`,
        href: "/teacher/billing-payments",
        icon: DollarSign,
        tone: "emerald",
      });
    }
    return items;
  }, [pendingReviews, pendingPayoutAmount, balance]);

  const isNewTeacher =
    !loading &&
    stats &&
    stats.totalCourses === 0 &&
    (summary?.totalTransactions || 0) === 0;

  // ═══════════════════════════════════════════════════════
  // Loading
  // ═══════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex flex-col gap-5 py-4">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
          <AlertCircle className="h-7 w-7 text-rose-600" />
        </div>
        <p className="mt-4 text-sm font-bold text-rose-900">{error}</p>
        <Button
          className="mt-4 rounded-lg bg-yellow-400 font-bold text-gray-900 hover:bg-yellow-500"
          onClick={load}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* ═══════════════════════════════════════════ */}
      {/* HERO — amber gradient                       */}
      {/* ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-16 w-16 rounded-2xl border-2 border-white/40 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/30 text-2xl font-black text-gray-900 shadow-lg backdrop-blur">
                {initial}
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-900/70">
                Welcome back
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                Hi, {teacherName} 👋
              </h1>
              {email && <p className="mt-0.5 text-xs text-gray-900/70">{email}</p>}
              {profile?.status === "pending_payment" && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800 shadow-sm">
                  <AlertCircle className="h-2.5 w-2.5" /> Plan payment pending
                </span>
              )}
              {profile?.status === "active" && profile?.selectedPlan && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-900/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  <Sparkles className="h-2.5 w-2.5 text-yellow-400" />
                  {profile.selectedPlan.name || "Active plan"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/teacher/courses/new">
              <Button className="h-11 rounded-lg bg-gray-900 font-bold text-white shadow-md hover:bg-gray-800">
                <Plus className="mr-1.5 h-4 w-4" />
                New course
              </Button>
            </Link>
            <Link href="/teacher/earnings">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-gray-900/20 bg-white/90 font-bold text-gray-900 hover:bg-white"
              >
                <DollarSign className="mr-1.5 h-4 w-4" />
                Earnings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* NEW TEACHER EMPTY STATE                     */}
      {/* ═══════════════════════════════════════════ */}
      {isNewTeacher && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/30">
            <PartyPopper className="h-9 w-9 text-gray-900" />
          </div>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-gray-900">
            Let&apos;s build something great
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Create your first course, digital file, or coaching offer and start
            earning. It only takes a few minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/teacher/courses/new">
              <Button className="h-11 rounded-lg bg-yellow-400 font-bold text-gray-900 shadow-md hover:bg-yellow-500">
                <Plus className="mr-2 h-4 w-4" /> Create a course
              </Button>
            </Link>
            <Link href="/teacher/digital-files">
              <Button variant="outline" className="h-11 rounded-lg">
                <FileText className="mr-2 h-4 w-4" /> Upload a digital file
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!isNewTeacher && (
        <>
          {/* ═══════════════════════════════════════════ */}
          {/* PRIMARY STATS                               */}
          {/* ═══════════════════════════════════════════ */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
              Your academy
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total students"
                value={compact(stats?.totalStudents || 0)}
                hint="All-time enrollments"
                bg="bg-red-100"
                fg="text-red-500"
                href="/teacher/student"
              />
              <StatCard
                icon={BookOpen}
                label="Published courses"
                value={String(stats?.publishedCourses || 0)}
                hint={`${stats?.totalCourses || 0} total`}
                bg="bg-blue-100"
                fg="text-blue-500"
                href="/teacher/courses"
              />
              <StatCard
                icon={Star}
                label="Avg. rating"
                value={(stats?.avgRating || 0).toFixed(1)}
                hint="Across all courses"
                bg="bg-amber-100"
                fg="text-amber-600"
                href="/teacher/courses"
              />
              <StatCard
                icon={TrendingUp}
                label="Total revenue"
                value={money(stats?.totalRevenue || 0)}
                hint="Gross, before fees"
                bg="bg-green-100"
                fg="text-green-600"
                href="/teacher/earnings"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* FINANCIAL STATS                             */}
          {/* ═══════════════════════════════════════════ */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
              Money
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={DollarSign}
                label="Lifetime earnings"
                value={money(balance?.netEarned || 0)}
                hint="After platform + affiliate"
                bg="bg-slate-100"
                fg="text-slate-600"
                href="/teacher/earnings"
              />
              <StatCard
                icon={Wallet}
                label="Available to withdraw"
                value={money(balance?.available || 0)}
                hint={
                  (balance?.available || 0) > 0
                    ? "Ready to request a payout"
                    : "Min $50 to withdraw"
                }
                bg="bg-emerald-100"
                fg="text-emerald-600"
                href="/teacher/billing-payments"
              />
              <StatCard
                icon={Clock}
                label="Pending payouts"
                value={money(pendingPayoutAmount)}
                hint={
                  pendingPayoutAmount > 0
                    ? "Awaiting admin approval"
                    : "No pending requests"
                }
                bg="bg-orange-100"
                fg="text-orange-500"
                href="/teacher/billing-payments"
              />
              <StatCard
                icon={Ticket}
                label="Coupon discounts given"
                value={money(couponStats?.totalDiscountGiven || 0)}
                hint={`${couponStats?.totalRedemptions || 0} redemption${(couponStats?.totalRedemptions || 0) === 1 ? "" : "s"}`}
                bg="bg-purple-100"
                fg="text-purple-600"
                href="/teacher/marketing/coupons-discounts"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* REVENUE CHART + TOP PRODUCTS                */}
          {/* ═══════════════════════════════════════════ */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Revenue AreaChart */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Revenue · last 30 days
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Net earnings after fees &amp; commissions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total
                    </p>
                    <p className="text-lg font-black tabular-nums text-slate-900">
                      {money(revenueTotal)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {revenueTotal === 0 ? (
                  <div className="flex h-[240px] flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      No revenue yet
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Your earnings will show up here after your first sale.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={revenueSeries}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EAB308" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E7EB"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#94A3B8" }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#94A3B8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                        width={48}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#EAB308"
                        strokeWidth={2.5}
                        fill="url(#revGrad)"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top products */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Top products
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">By net earnings</p>
              </div>
              <div className="divide-y divide-slate-100">
                {topProducts.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-slate-500">No sales yet.</p>
                  </div>
                ) : (
                  topProducts.map((p, i) => {
                    const Icon = typeIcon(p.productType);
                    return (
                      <Link
                        key={p.productId}
                        href={`/teacher/courses/${p.productId}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-amber-50/40"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-700">
                          {i + 1}
                        </span>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                          {p.thumbnailUrl ? (
                            <img
                              src={p.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Icon className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {p.sales} sale{p.sales === 1 ? "" : "s"} ·{" "}
                            {p.enrollmentCount} enrolled
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-black tabular-nums text-slate-900">
                          {money(p.netEarnings)}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* PRODUCT MIX DONUT + RECENT SALES            */}
          {/* ═══════════════════════════════════════════ */}
          <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* PieChart — product mix */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                  <Package className="h-4 w-4 text-orange-500" />
                  Sales by product type
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  What&apos;s actually selling
                </p>
              </div>
              <div className="p-4">
                {productMix.length === 0 ? (
                  <div className="flex h-[240px] flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <Package className="h-6 w-6 text-orange-500" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      No sales data yet
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Make your first sale to see the breakdown.
                    </p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={productMix}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {productMix.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {productMix.map((row) => (
                        <div
                          key={row.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{ background: row.color }}
                            />
                            <span className="font-semibold text-slate-700">
                              {row.name}
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-slate-900">
                            {row.value} · {money(row.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent sales */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Recent sales
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Latest transactions
                    </p>
                  </div>
                  <Link
                    href="/teacher/earnings"
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    View all →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-slate-500">No transactions yet.</p>
                  </div>
                ) : (
                  recentTransactions.map((t) => (
                    <div
                      key={t.orderId + t.productTitle}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-[11px] font-black text-gray-900">
                        {(t.buyerName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {t.buyerName || "Student"}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {t.productTitle || "Product"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black tabular-nums text-emerald-600">
                          +{money(t.netEarning)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.paidAt
                            ? formatDistanceToNow(new Date(t.paidAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* NEEDS ATTENTION + COUPON PERFORMANCE        */}
          {/* ═══════════════════════════════════════════ */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Needs attention */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Needs attention
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Things waiting on you
                </p>
              </div>
              <div className="p-4">
                {attentionItems.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      All caught up
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      No pending reviews or payouts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attentionItems.map((item, i) => {
                      const Icon = item.icon;
                      const tone =
                        item.tone === "amber"
                          ? "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
                          : item.tone === "emerald"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300"
                          : "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300";
                      return (
                        <Link
                          key={i}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                            tone
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-xs font-bold">
                            {item.label}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Coupon performance */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
                      <Ticket className="h-4 w-4 text-purple-500" />
                      Coupon performance
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {couponStats?.totalRedemptions || 0} redemptions ·{" "}
                      {couponStats?.uniqueUsers || 0} students
                    </p>
                  </div>
                  <Link
                    href="/teacher/marketing/coupons-discounts"
                    className="text-xs font-bold text-amber-600 hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {topCoupons.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                      <Ticket className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      No coupons used yet
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Create a coupon to boost sales.
                    </p>
                    <Link href="/teacher/marketing/coupons-discounts">
                      <Button
                        className="mt-3 h-9 rounded-lg bg-yellow-400 px-3 text-xs font-bold text-gray-900 hover:bg-yellow-500"
                        size="sm"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Create coupon
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topCoupons.map((c, i) => (
                      <div
                        key={c.code}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-[10px] font-black text-white">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-black text-slate-900">
                            {c.code}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {c.redemptions} use{c.redemptions === 1 ? "" : "s"}
                          </p>
                        </div>
                        <p className="text-xs font-black tabular-nums text-emerald-600">
                          −{money(c.discountGiven)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}