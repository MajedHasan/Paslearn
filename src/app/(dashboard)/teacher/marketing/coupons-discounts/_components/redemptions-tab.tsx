// app/(dashboard)/marketing/coupons-discounts/_components/redemptions-tab.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Users,
  TrendingDown,
  Activity,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  Filter,
} from "lucide-react";
import api from "@/lib/api";
import type { Coupon } from "./utils";

type RedemptionStatus = "reserved" | "committed" | "reversed";

interface RedemptionStats {
  totalRedemptions: number;
  totalDiscountGiven: number;
  uniqueUsers: number;
  byStatus: { reserved: number; committed: number; reversed: number };
  topCoupons: Array<{ code: string; redemptions: number; discountGiven: number }>;
}

interface RedemptionItem {
  _id: string;
  coupon: any;
  couponCode: string;
  user: any;
  userEmail: string;
  order?: any;
  orderNumber?: string;
  discountAmount: number;
  currency: string;
  status: RedemptionStatus;
  createdAt: string;
}

const STATUS_META: Record<RedemptionStatus, { label: string; cls: string; dot: string }> = {
  reserved: {
    label: "Reserved",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  committed: {
    label: "Committed",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  reversed: {
    label: "Reversed",
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n || 0);
}

export function RedemptionsTab({ coupons }: { coupons: Coupon[] }) {
  const [stats, setStats] = useState<RedemptionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RedemptionStatus>("all");
  const [couponFilter, setCouponFilter] = useState<string>("all");

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // load stats (only depends on coupon filter — for now)
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const r = await api.get("/coupons/redemptions/stats", {
        params: {
          couponId: couponFilter !== "all" ? couponFilter : undefined,
        },
      });
      setStats(r.data.data);
    } catch (e: any) {
      setStatsError(e?.response?.data?.message || "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, [couponFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // load page of redemptions
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/coupons/redemptions", {
        params: {
          page,
          limit,
          q: debouncedSearch || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          couponId: couponFilter !== "all" ? couponFilter : undefined,
        },
      });
      setItems(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load redemptions");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, couponFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const statCards = [
    {
      label: "Total redemptions",
      value: stats?.totalRedemptions ?? 0,
      icon: Receipt,
      gradient: "from-[#0177FB] to-[#0156C7]",
    },
    {
      label: "Discount given",
      value: fmtMoney(stats?.totalDiscountGiven ?? 0),
      icon: TrendingDown,
      gradient: "from-[#FF7E02] to-[#E66400]",
    },
    {
      label: "Unique students",
      value: stats?.uniqueUsers ?? 0,
      icon: Users,
      gradient: "from-violet-500 to-violet-600",
    },
    {
      label: "Committed",
      value: stats?.byStatus.committed ?? 0,
      icon: Activity,
      gradient: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} shadow-md`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              {statsLoading ? (
                <div className="mt-3 h-8 w-20 rounded bg-slate-100 animate-pulse" />
              ) : (
                <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
                  {c.value}
                </p>
              )}
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      {statsError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {statsError}
        </div>
      )}

      {/* Top coupons */}
      {stats && stats.topCoupons.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Trophy className="h-4 w-4 text-[#FF7E02]" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-700">
              Top performing coupons
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.topCoupons.slice(0, 6).map((t, i) => (
              <div
                key={t.code}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[10px] font-black text-white">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs font-black text-slate-900">
                    {t.code}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {t.redemptions} use{t.redemptions === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-xs font-black tabular-nums text-emerald-600">
                  {fmtMoney(t.discountGiven)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, email, order #"
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <Select
          value={couponFilter}
          onValueChange={(v) => {
            setCouponFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All coupons</SelectItem>
            {coupons.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as any);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="committed">Committed</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 flex-1 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <p className="mt-3 text-sm font-bold text-rose-900">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg"
              onClick={load}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
              <Filter className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No redemptions yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              When students use your coupon codes at checkout, they&apos;ll
              appear here with order details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Coupon</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((r) => {
                  const user =
                    r.user && typeof r.user === "object" ? r.user : null;
                  const order =
                    r.order && typeof r.order === "object" ? r.order : null;
                  const meta = STATUS_META[r.status] || STATUS_META.reserved;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[10px] font-black text-white">
                            {(user?.name || r.userEmail || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {user?.name || "Student"}
                            </p>
                            <p className="truncate text-[10px] text-slate-500">
                              {user?.email || r.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
                          {r.couponCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order?.orderNumber ? (
                          <span className="font-mono text-[11px] font-semibold text-slate-700">
                            #{order.orderNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-black tabular-nums text-slate-900">
                        {fmtMoney(r.discountAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${meta.cls}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                          />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4">
            <p className="text-xs text-slate-500">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 rounded-lg px-2"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-lg px-2"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}