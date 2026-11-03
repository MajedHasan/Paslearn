// app/admin/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Users, DollarSign, ShoppingBag, TrendingUp, TrendingDown, Wallet,
  BookOpen, ArrowRight, AlertCircle, Sparkles, ShieldCheck, Star,
  Receipt, GraduationCap, FileText, ChevronRight, RefreshCw, Zap,
  ArrowUpRight, ArrowDownRight, Minus, Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface AdminDashboard {
  admin: { name?: string; email?: string; profileImageUrl?: string } | null;
  totals: {
    users: { total: number; teachers: number; students: number; admins: number; banned: number };
    courses: { total: number; published: number; underReview: number; draft: number; archived: number };
    orders: { total: number; last30: number; byStatus: Record<string, number> };
    revenue: { total: number; paidOrders: number; last30: number; last7: number; platformFees30: number };
    payouts: { requested: number; approved: number; paid: number; rejected: number; pendingAmount: number; paidAmount: number };
  };
  charts: {
    revenue: Array<{ date: string; revenue: number }>;
    signups: Array<{ date: string; count: number }>;
  };
  recent: {
    users: Array<{ _id: string; name?: string; email?: string; role: string; createdAt: string }>;
    orders: Array<{ _id: string; orderNumber: string; total: number; currency: string; status: string; createdAt: string }>;
    payouts: Array<{ _id: string; teacher: any; amount: number; status: string; method: string; createdAt: string }>;
  };
  top: {
    teachers: Array<{ teacherId: string; revenue: number; sales: number; name?: string; email?: string }>;
    courses: Array<{ courseId: string; revenue: number; sales: number; title?: string; slug?: string }>;
  };
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n || 0);
}

function compactMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

/** Compare last 7 days vs previous 7 days from a 30-day series. */
function computeTrend(
  series: Array<{ value: number }>
): { pct: number; dir: "up" | "down" | "flat" } | null {
  if (series.length < 14) return null;
  const recent = series.slice(-7).reduce((a, s) => a + s.value, 0);
  const prev = series.slice(-14, -7).reduce((a, s) => a + s.value, 0);
  if (prev === 0 && recent === 0) return null;
  if (prev === 0) return { pct: 100, dir: "up" };
  const change = ((recent - prev) / prev) * 100;
  if (Math.abs(change) < 0.5) return { pct: 0, dir: "flat" };
  return { pct: Math.abs(change), dir: change > 0 ? "up" : "down" };
}

// ═══════════════════════════════════════════════════════════════
// Trend badge
// ═══════════════════════════════════════════════════════════════

function TrendBadge({ trend }: { trend: ReturnType<typeof computeTrend> }) {
  if (!trend) return null;
  const { pct, dir } = trend;
  if (dir === "flat") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
        <Minus className="h-2.5 w-2.5" /> 0%
      </span>
    );
  }
  const isUp = dir === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black",
        isUp ? "bg-[#E7F6EC] text-[#036B26]" : "bg-[#FEF3F2] text-[#9E0A05]"
      )}
    >
      {isUp ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {pct.toFixed(0)}%
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stat card
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon, label, value, hint, bg, fg, href, trend,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  bg: string;
  fg: string;
  href?: string;
  trend?: ReturnType<typeof computeTrend>;
}) {
  const inner = (
    <div className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105", bg)}>
        <Icon className={cn("h-6 w-6", fg)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-2xl font-black tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
          {trend && <TrendBadge trend={trend} />}
        </div>
        <p className="mt-0.5 text-xs font-bold text-[#667185]">{label}</p>
        {hint && <p className="mt-0.5 text-[10px] text-[#98A2B3]">{hint}</p>}
      </div>
      {href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ═══════════════════════════════════════════════════════════════
// Pending card
// ═══════════════════════════════════════════════════════════════

function PendingCard({
  icon: Icon, label, count, amount, href, tone,
}: {
  icon: any;
  label: string;
  count: number;
  amount?: number;
  href: string;
  tone: "amber" | "rose" | "violet" | "blue";
}) {
  const palette = {
    amber: "border-[#FFE1C7] bg-gradient-to-br from-[#FFF7EE] to-[#FEF3EE] hover:border-[#FFD5A8] hover:shadow-[#EB5017]/10",
    rose: "border-[#FEE4E2] bg-gradient-to-br from-[#FEF3F2] to-[#FFF1F0] hover:border-[#FECACA] hover:shadow-[#9E0A05]/10",
    violet: "border-[#F3E8FF] bg-gradient-to-br from-[#FAF5FF] to-[#F5EBFF] hover:border-[#E9D5FF] hover:shadow-[#7C3AED]/10",
    blue: "border-[#E0EAFF] bg-gradient-to-br from-[#F2F7FF] to-[#EFF4FE] hover:border-[#C7D7FE] hover:shadow-[#0177FB]/10",
  }[tone];
  const iconBg = {
    amber: "bg-[#FFE1C7] text-[#E66400]",
    rose: "bg-[#FEE4E2] text-[#9E0A05]",
    violet: "bg-[#F3E8FF] text-[#7C3AED]",
    blue: "bg-[#E0EAFF] text-[#0177FB]",
  }[tone];

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        palette
      )}
    >
      <div className={cn("relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm", iconBg)}>
        <Icon className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EB5017] px-1 text-[9px] font-black text-white shadow-md">
          {count > 99 ? "99+" : count}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-[#667185]">{label}</p>
        <p className="mt-0.5 text-lg font-black tabular-nums text-slate-900">
          {count}
          {amount !== undefined && amount > 0 && (
            <span className="ml-1.5 text-xs font-bold text-[#475367]">
              ({compactMoney(amount)})
            </span>
          )}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#98A2B3] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// Status pill
// ═══════════════════════════════════════════════════════════════

const ORDER_STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  paid: { label: "Paid", bg: "bg-[#E7F6EC]", text: "text-[#036B26]", dot: "bg-[#036B26]" },
  pending: { label: "Pending", bg: "bg-[#FFF6E5]", text: "text-[#B54708]", dot: "bg-[#B54708]" },
  failed: { label: "Failed", bg: "bg-[#FEF3F2]", text: "text-[#9E0A05]", dot: "bg-[#9E0A05]" },
  refunded: { label: "Refunded", bg: "bg-[#F4F3FF]", text: "text-[#5925DC]", dot: "bg-[#5925DC]" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100", text: "text-[#475367]", dot: "bg-[#475367]" },
  partially_refunded: { label: "Partial", bg: "bg-[#F4F3FF]", text: "text-[#5925DC]", dot: "bg-[#5925DC]" },
};

function StatusPill({ status }: { status: string }) {
  const m = ORDER_STATUS_META[status] || { label: status, bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", m.bg, m.text)}>
      <span className={cn("h-1 w-1 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Range selector (for charts)
// ═══════════════════════════════════════════════════════════════

const RANGES = [
  { v: 7, label: "7d" },
  { v: 14, label: "14d" },
  { v: 30, label: "30d" },
] as const;

function RangeSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.v}
          onClick={() => onChange(r.v)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
            value === r.v
              ? "bg-white text-[#EB5017] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Skeleton — premium branded loader
// ═══════════════════════════════════════════════════════════════

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .admin-shimmer {
          background: linear-gradient(
            90deg,
            #FEE9DE 0%,
            #FFF5EE 50%,
            #FEE9DE 100%
          );
          background-size: 1000px 100%;
          animation: adminShimmer 2s infinite linear;
        }
      `}</style>

      {/* Loading indicator */}
      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading dashboard…</p>
      </div>

      {/* Hero skeleton */}
      <div className="admin-shimmer h-32 rounded-2xl" />

      {/* Primary stats */}
      <div>
        <div className="admin-shimmer mb-2 h-3 w-32 rounded" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-shimmer h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="admin-shimmer h-[340px] rounded-2xl" />
        <div className="admin-shimmer h-[340px] rounded-2xl" />
      </div>

      {/* Recent + top */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="admin-shimmer h-[280px] rounded-2xl" />
        <div className="admin-shimmer h-[280px] rounded-2xl" />
      </div>

      {/* Snapshot */}
      <div>
        <div className="admin-shimmer mb-2 h-3 w-24 rounded" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-shimmer h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="admin-shimmer h-[140px] rounded-2xl" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Error state
// ═══════════════════════════════════════════════════════════════

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
        <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
      </div>
      <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">
        {`Couldn't load the dashboard`}
      </h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
      <Button
        className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
        onClick={onRetry}
      >
        <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Recharts SSR safety
  useEffect(() => setMounted(true), []);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const r = await api.get("/admin/dashboard");
      setData(r.data.data);
      setLastUpdated(new Date());
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data) return <ErrorState error={error} onRetry={() => load()} />;
  if (!data) return null;

  const totals = data.totals;
  const pendingPayouts = totals.payouts.requested;
  const pendingAmount = totals.payouts.pendingAmount;
  const underReview = totals.courses.underReview;
  const failedOrders = totals.orders.byStatus.failed || 0;
  const hasPending = pendingPayouts > 0 || underReview > 0 || failedOrders > 0;
  const totalPending = pendingPayouts + underReview + failedOrders;

  return (
    <DashboardContent
      data={data}
      refreshing={refreshing}
      mounted={mounted}
      lastUpdated={lastUpdated}
      hasPending={hasPending}
      totalPending={totalPending}
      pendingPayouts={pendingPayouts}
      pendingAmount={pendingAmount}
      underReview={underReview}
      failedOrders={failedOrders}
      onRefresh={() => load(true)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// Content
// ═══════════════════════════════════════════════════════════════

function DashboardContent({
  data, refreshing, mounted, lastUpdated, hasPending, totalPending,
  pendingPayouts, pendingAmount, underReview, failedOrders, onRefresh,
}: {
  data: AdminDashboard;
  refreshing: boolean;
  mounted: boolean;
  lastUpdated: Date | null;
  hasPending: boolean;
  totalPending: number;
  pendingPayouts: number;
  pendingAmount: number;
  underReview: number;
  failedOrders: number;
  onRefresh: () => void;
}) {
  const totals = data.totals;
  const [revenueRange, setRevenueRange] = useState<7 | 14 | 30>(30);
  const [signupsRange, setSignupsRange] = useState<7 | 14 | 30>(30);

  const revenueTrend = useMemo(
    () => computeTrend(data.charts.revenue.map((d) => ({ value: d.revenue }))),
    [data.charts.revenue]
  );
  const signupsTrend = useMemo(
    () => computeTrend(data.charts.signups.map((d) => ({ value: d.count }))),
    [data.charts.signups]
  );

  const revenueSliced = useMemo(
    () => data.charts.revenue.slice(-revenueRange),
    [data.charts.revenue, revenueRange]
  );
  const signupsSliced = useMemo(
    () => data.charts.signups.slice(-signupsRange),
    [data.charts.signups, signupsRange]
  );

  const revenueRangeTotal = revenueSliced.reduce((a, s) => a + s.revenue, 0);
  const signupsRangeTotal = signupsSliced.reduce((a, s) => a + s.count, 0);

  const medals = ["🥇", "🥈", "🥉", "4", "5"];

  return (
    <div className="relative flex flex-col gap-5 py-2">
      {/* Silent refresh spinner */}
      {refreshing && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-full border border-[#FFE1C7] bg-white px-3 py-1.5 shadow-lg">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#EB5017]" />
          <span className="text-xs font-bold text-[#EB5017]">Refreshing…</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO                                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EB5017] via-[#D94512] to-[#B33A0F] p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute right-8 top-8 hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-sm sm:flex">
          <ShieldCheck className="h-3 w-3" /> SaaS Owner Console
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {data.admin?.profileImageUrl ? (
              <img
                src={data.admin.profileImageUrl}
                alt=""
                className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white shadow-lg backdrop-blur">
                {(data.admin?.name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                Welcome back
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {data.admin?.name || "Admin"} 👋
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/80">
                {data.admin?.email && <span>{data.admin.email}</span>}
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                  </span>
                )}
                {hasPending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-black text-white backdrop-blur">
                    <AlertCircle className="h-3 w-3" />
                    {totalPending} pending
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              className="h-11 rounded-lg bg-white/15 font-bold text-white backdrop-blur hover:bg-white/25"
            >
              <RefreshCw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Link href="/admin/users">
              <Button className="h-11 rounded-lg bg-white font-bold text-[#EB5017] shadow-md hover:bg-white/90">
                <Users className="mr-1.5 h-4 w-4" />
                Users
              </Button>
            </Link>
            <Link href="/admin/teacher-payouts">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-white/30 bg-white/10 font-bold text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Wallet className="mr-1.5 h-4 w-4" />
                Payouts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* PRIMARY STATS                                   */}
      {/* ═══════════════════════════════════════════════ */}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
          Platform overview
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Total revenue"
            value={compactMoney(totals.revenue.total)}
            hint={`${totals.revenue.paidOrders} paid orders · all time`}
            bg="bg-[#E7F6EC]"
            fg="text-[#036B26]"
            trend={revenueTrend}
          />
          <StatCard
            icon={TrendingUp}
            label="Platform fees (30d)"
            value={compactMoney(totals.revenue.platformFees30)}
            hint={`From ${compactMoney(totals.revenue.last30)} in the last 30 days`}
            bg="bg-[#FEE9DE]"
            fg="text-[#EB5017]"
          />
          <StatCard
            icon={Users}
            label="Users"
            value={compact(totals.users.total)}
            hint={`${totals.users.teachers} teachers · ${totals.users.students} students`}
            bg="bg-[#E0EAFF]"
            fg="text-[#0177FB]"
            href="/admin/users"
            trend={signupsTrend}
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders (30d)"
            value={compact(totals.orders.last30)}
            hint={`${compact(totals.orders.total)} all-time`}
            bg="bg-[#F4F3FF]"
            fg="text-[#5925DC]"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* NEEDS ATTENTION                                 */}
      {/* ═══════════════════════════════════════════════ */}
      {hasPending && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EB5017]" />
            </span>
            Needs your attention · {totalPending} item{totalPending === 1 ? "" : "s"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPayouts > 0 && (
              <PendingCard
                icon={Wallet}
                label="Payouts awaiting approval"
                count={pendingPayouts}
                amount={pendingAmount}
                href="/admin/teacher-payouts?status=requested"
                tone="amber"
              />
            )}
            {underReview > 0 && (
              <PendingCard
                icon={BookOpen}
                label="Courses under review"
                count={underReview}
                href="/admin/courses?status=under_review"
                tone="blue"
              />
            )}
            {failedOrders > 0 && (
              <PendingCard
                icon={AlertCircle}
                label="Failed orders"
                count={failedOrders}
                href="/admin/orders?status=failed"
                tone="rose"
              />
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* CHARTS                                          */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Revenue */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#475367]">
                  <span className="h-2 w-2 rounded-full bg-[#EB5017]" />
                  Revenue
                </h2>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  Gross merchandise value · paid orders only
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                    {revenueRange}d total
                  </p>
                  <p className="text-lg font-black tabular-nums text-slate-900">
                    {compactMoney(revenueRangeTotal)}
                  </p>
                </div>
                <RangeSelector value={revenueRange} onChange={(v) => setRevenueRange(v as any)} />
              </div>
            </div>
          </div>
          <div className="p-2">
            {!mounted ? (
              <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-50" />
            ) : revenueRangeTotal === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE9DE]">
                  <TrendingUp className="h-6 w-6 text-[#EB5017]" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">
                  No revenue in this period
                </p>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  Sales will appear here as they come in.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueSliced} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EB5017" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#EB5017" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#98A2B3" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#98A2B3" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                    width={48}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                            {label}
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {money(payload[0].value)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EB5017"
                    strokeWidth={2.5}
                    fill="url(#revGradAdmin)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Signups */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#475367]">
                  <span className="h-2 w-2 rounded-full bg-[#F77A4A]" />
                  Signups
                </h2>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  {compact(signupsRangeTotal)} in {signupsRange}d
                </p>
              </div>
              <RangeSelector value={signupsRange} onChange={(v) => setSignupsRange(v as any)} />
            </div>
          </div>
          <div className="p-2">
            {!mounted ? (
              <div className="h-[260px] w-full animate-pulse rounded-xl bg-slate-50" />
            ) : signupsRangeTotal === 0 ? (
              <div className="flex h-[260px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE9DE]">
                  <Users className="h-6 w-6 text-[#F77A4A]" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">No signups yet</p>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  New users will show up here.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={signupsSliced} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#98A2B3" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#98A2B3" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={32}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-[#98A2B3]">
                            {label}
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {payload[0].value} signup{payload[0].value === 1 ? "" : "s"}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" fill="#F77A4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* RECENT ORDERS + TOP TEACHERS                    */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Recent orders */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#475367]">
                  <Receipt className="h-4 w-4 text-[#EB5017]" />
                  Recent orders
                </h2>
                <p className="mt-0.5 text-xs text-[#98A2B3]">Latest platform activity</p>
              </div>
              <Link
                href="/admin/orders"
                className="group inline-flex items-center gap-1 text-xs font-bold text-[#EB5017] hover:underline"
              >
                View all
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {data.recent.orders.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE9DE]">
                  <Receipt className="h-6 w-6 text-[#EB5017]" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">No orders yet</p>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  Orders will show up here as they come in.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-[#667185]">
                  <tr>
                    <th className="px-6 py-2.5 text-left">Order</th>
                    <th className="px-6 py-2.5 text-left">Amount</th>
                    <th className="px-6 py-2.5 text-left">Status</th>
                    <th className="px-6 py-2.5 text-left">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent.orders.map((o) => (
                    <tr
                      key={o._id}
                      className="group cursor-pointer transition-colors hover:bg-[#FEF3EE]"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${o._id}`}
                          className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#EB5017]"
                        >
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3 font-black tabular-nums text-slate-900">
                        {money(o.total)}
                      </td>
                      <td className="px-6 py-3">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-6 py-3 text-xs text-[#98A2B3]">
                        {formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top teachers */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#475367]">
              <Star className="h-4 w-4 text-[#EB5017]" />
              Top teachers
            </h2>
            <p className="mt-0.5 text-xs text-[#98A2B3]">By net revenue</p>
          </div>
          <div className="divide-y divide-slate-100">
            {data.top.teachers.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE9DE]">
                  <Star className="h-6 w-6 text-[#EB5017]" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">No sales yet</p>
                <p className="mt-0.5 text-xs text-[#98A2B3]">
                  Top sellers will appear here.
                </p>
              </div>
            ) : (
              data.top.teachers.map((t, i) => (
                <div
                  key={t.teacherId}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FEF3EE]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEE9DE] text-sm font-black text-[#EB5017]">
                    {medals[i] || i + 1}
                  </span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EB5017] to-[#B33A0F] text-[11px] font-black text-white shadow-sm">
                    {(t.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {t.name || "Unknown teacher"}
                    </p>
                    <p className="text-[10px] text-[#98A2B3]">
                      {t.sales} sale{t.sales === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black tabular-nums text-[#036B26]">
                    {compactMoney(t.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* SNAPSHOT                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
          Snapshot
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={GraduationCap}
            label="Courses"
            value={compact(totals.courses.total)}
            hint={`${totals.courses.published} published`}
            bg="bg-[#E7F6EC]"
            fg="text-[#036B26]"
            href="/admin/courses"
          />
          <StatCard
            icon={FileText}
            label="Pending moderation"
            value={compact(totals.courses.underReview)}
            hint={
              totals.courses.underReview > 0 ? "Awaiting your review" : "All clear"
            }
            bg="bg-[#FEE9DE]"
            fg="text-[#EB5017]"
            href="/admin/courses?status=under_review"
          />
          <StatCard
            icon={Wallet}
            label="Payouts paid"
            value={compactMoney(totals.payouts.paidAmount)}
            hint={`${totals.payouts.paid} completed`}
            bg="bg-[#E0EAFF]"
            fg="text-[#0177FB]"
            href="/admin/teacher-payouts?status=paid"
          />
          <StatCard
            icon={Sparkles}
            label="Top courses"
            value={String(data.top.courses.length)}
            hint="By revenue"
            bg="bg-[#F4F3FF]"
            fg="text-[#5925DC]"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* QUICK ACTIONS                                   */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#475367]">
                <Zap className="h-4 w-4 text-[#EB5017]" />
                Quick actions
              </h2>
              <p className="mt-0.5 text-xs text-[#98A2B3]">
                Jump to what needs doing
              </p>
            </div>
            {hasPending && (
              <span className="rounded-full bg-[#FEF3EE] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#EB5017]">
                {totalPending} pending
              </span>
            )}
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Manage users",
              desc: "Search, ban, change roles",
              href: "/admin/users",
              icon: Users,
              gradient: "from-[#0177FB] to-[#0156C7]",
              badge: 0,
            },
            {
              label: "Approve payouts",
              desc: "Release teacher funds",
              href: "/admin/teacher-payouts",
              icon: Wallet,
              gradient: "from-[#EB5017] to-[#B33A0F]",
              badge: pendingPayouts,
            },
            {
              label: "Moderate courses",
              desc: "Review pending submissions",
              href: "/admin/courses",
              icon: ShieldCheck,
              gradient: "from-[#7C3AED] to-[#5B21B6]",
              badge: underReview,
            },
            {
              label: "Refund orders",
              desc: "Process customer refunds",
              href: "/admin/orders",
              icon: Receipt,
              gradient: "from-emerald-500 to-teal-600",
              badge: failedOrders,
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#EB5017]/40 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                    a.gradient
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900">{a.label}</p>
                    {a.badge > 0 && (
                      <span className="rounded-full bg-[#FEF3EE] px-1.5 py-0.5 text-[9px] font-black text-[#EB5017]">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#98A2B3]">{a.desc}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}