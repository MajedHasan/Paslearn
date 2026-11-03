// app/admin/orders/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Receipt, Search, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  XCircle, Clock, RotateCcw, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, ShoppingBag, Mail, Tag, CreditCard, ExternalLink,
  PartyPopper, TrendingUp, User, ArrowRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type OrderStatus =
  | "pending" | "paid" | "failed"
  | "refunded" | "partially_refunded" | "cancelled";

type OrderTab = "all" | "paid" | "pending" | "failed" | "refunded" | "cancelled";

interface OrderItem {
  _id: string;
  product:
    | { _id: string; title: string; type: string; thumbnailUrl?: string }
    | string;
  productType: string;
  refId: string;
  teacher: { _id: string; name: string; email: string } | string;
  priceSnapshot: number;
  discountShare: number;
  finalPrice: number;
  platformFee: number;
  teacherEarning: number;
  entitlementGranted: boolean;
}

interface Buyer {
  _id: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
}

interface Payment {
  _id: string;
  provider: "stripe" | "paypal";
  status: string;
  amount: number;
  refundedAmount?: number;
  providerRef: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: Buyer | string;
  currency: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  coupon?: {
    couponId: string;
    code: string;
    type: string;
    value: number;
    appliedAmount: number;
  };
  affiliateCode?: string;
  status: OrderStatus;
  paidAt?: string;
  createdAt: string;
  payment?: Payment | null;
}

interface Counts {
  all: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  cancelled: number;
  totalRevenue: number;
}

type RefundDialogState = Order | null;

// ═══════════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════════

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending:            { label: "Pending",    bg: "bg-[#FFF6E5]", text: "text-[#B54708]", dot: "bg-[#B54708]" },
  paid:               { label: "Paid",       bg: "bg-[#E7F6EC]", text: "text-[#036B26]", dot: "bg-[#036B26]" },
  failed:             { label: "Failed",     bg: "bg-[#FEF3F2]", text: "text-[#9E0A05]", dot: "bg-[#9E0A05]" },
  refunded:           { label: "Refunded",   bg: "bg-[#F4F3FF]", text: "text-[#5925DC]", dot: "bg-[#5925DC]" },
  partially_refunded: { label: "Partial",    bg: "bg-[#F4F3FF]", text: "text-[#5925DC]", dot: "bg-[#5925DC]" },
  cancelled:          { label: "Cancelled",  bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

const TAB_ORDER: OrderTab[] = ["all", "paid", "pending", "failed", "refunded", "cancelled"];

const TAB_LABEL: Record<OrderTab, string> = {
  all: "All", paid: "Paid", pending: "Pending",
  failed: "Failed", refunded: "Refunded", cancelled: "Cancelled",
};

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  course: "Course",
  digital_file: "Digital file",
  coaching: "Coaching",
  platform_subscription: "Subscription",
  addon: "Addon",
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n || 0);
}

function compactMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function getBuyer(o: Order): Buyer {
  if (o.user && typeof o.user === "object") return o.user as Buyer;
  return { _id: String(o.user) };
}

function getProductTitle(item: OrderItem): string {
  if (item.product && typeof item.product === "object" && item.product.title) {
    return item.product.title;
  }
  return "Deleted product";
}

function getTeacherName(item: OrderItem): string {
  if (item.teacher && typeof item.teacher === "object" && item.teacher.name) {
    return item.teacher.name;
  }
  return "—";
}

// ═══════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
        .admin-shimmer { background: linear-gradient(90deg,#FEE9DE 0%,#FFF5EE 50%,#FEE9DE 100%); background-size: 1000px 100%; animation: adminShimmer 2s infinite linear; }
      `}</style>
      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading orders…</p>
      </div>
      <div className="admin-shimmer h-28 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="admin-shimmer h-20 rounded-2xl" />)}
      </div>
      <div className="admin-shimmer h-14 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="admin-shimmer h-24 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<OrderTab>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnce = useRef(false);

  const [counts, setCounts] = useState<Counts>({
    all: 0, paid: 0, pending: 0, failed: 0, refunded: 0, cancelled: 0, totalRevenue: 0,
  });

  const [refundTarget, setRefundTarget] = useState<RefundDialogState>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (tab !== "all") params.status = tab;
      if (debouncedSearch) params.search = debouncedSearch;

      const r = await api.get("/admin/orders", {
        params,
        headers: { "Cache-Control": "no-store" },
      });

      setOrders(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, [tab, page, debouncedSearch, refreshKey]);

  const loadCounts = useCallback(async () => {
    try {
      const r = await api.get("/admin/orders/counts", {
        headers: { "Cache-Control": "no-store" },
      });
      setCounts(r.data.data);
    } catch (e) {
      console.warn("[admin.orders] counts failed:", e);
    }
  }, [refreshKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  useEffect(() => {
    if (page > totalPages && total > 0) setPage(totalPages);
  }, [page, totalPages, total]);

  const changeTab = (next: OrderTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setExpandedId(null);
  };

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    loadCounts();
  };

  const openRefund = (order: Order) => {
    setRefundTarget(order);
    setRefundReason("");
    setRefundError(null);
  };

  const closeRefund = () => {
    setRefundTarget(null);
    setRefundReason("");
    setRefundError(null);
  };

  const executeRefund = async () => {
    if (!refundTarget) return;
    setRefundError(null);
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${refundTarget._id}/refund`, {
        reason: refundReason.trim() || undefined,
      });
      toast.success("Order refunded", {
        description: `${refundTarget.orderNumber} · ${money(refundTarget.total, refundTarget.currency)}`,
      });
      closeRefund();
      refreshAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Refund failed";
      setRefundError(msg);
      toast.error("Refund failed", { description: msg });
    } finally {
      setRefunding(false);
    }
  };

  if (loading && !hasLoadedOnce.current) return <OrdersSkeleton />;

  if (error && !hasLoadedOnce.current) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
          <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
        </div>
        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">Couldn&apos;t load orders</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
          onClick={refreshAll}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-5 py-2">
      {refreshing && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-full border border-[#FFE1C7] bg-white px-3 py-1.5 shadow-lg">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#EB5017]" />
          <span className="text-xs font-bold text-[#EB5017]">Refreshing…</span>
        </div>
      )}

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EB5017] via-[#D94512] to-[#B33A0F] p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur">
              <Receipt className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Commerce</p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">Orders & refunds</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span>{counts.all} total orders</span>
                {counts.totalRevenue > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-black text-white backdrop-blur">
                    <TrendingUp className="h-3 w-3" />
                    {compactMoney(counts.totalRevenue)} revenue
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={refreshAll}
            disabled={refreshing}
            className="h-11 rounded-lg bg-white/15 font-bold text-white backdrop-blur hover:bg-white/25"
          >
            <RefreshCw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
          Breakdown
        </p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatMini icon={ShoppingBag} label="All" count={counts.all} bg="bg-slate-100" fg="text-slate-600" active={tab === "all"} onClick={() => changeTab("all")} />
          <StatMini icon={CheckCircle2} label="Paid" count={counts.paid} bg="bg-[#E7F6EC]" fg="text-[#036B26]" active={tab === "paid"} onClick={() => changeTab("paid")} />
          <StatMini icon={Clock} label="Pending" count={counts.pending} bg="bg-[#FFF6E5]" fg="text-[#B54708]" active={tab === "pending"} onClick={() => changeTab("pending")} />
          <StatMini icon={XCircle} label="Failed" count={counts.failed} bg="bg-[#FEF3F2]" fg="text-[#9E0A05]" active={tab === "failed"} onClick={() => changeTab("failed")} />
          <StatMini icon={RotateCcw} label="Refunded" count={counts.refunded} bg="bg-[#F4F3FF]" fg="text-[#5925DC]" active={tab === "refunded"} onClick={() => changeTab("refunded")} />
          <StatMini icon={XCircle} label="Cancelled" count={counts.cancelled} bg="bg-slate-100" fg="text-slate-600" active={tab === "cancelled"} onClick={() => changeTab("cancelled")} />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, buyer name, or email…"
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
          {TAB_ORDER.map((k) => (
            <button
              key={k}
              onClick={() => changeTab(k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                tab === k
                  ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F] text-white shadow-md shadow-[#EB5017]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {TAB_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {error && hasLoadedOnce.current && (
        <div className="flex items-center gap-2 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-2.5 text-xs text-[#9E0A05]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={refreshAll} className="h-7 rounded-md border-[#FEE4E2]">
            Retry
          </Button>
        </div>
      )}

      {/* LIST */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEE9DE] to-[#FFD5A8] shadow-lg">
            <PartyPopper className="h-8 w-8 text-[#EB5017]" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">
            {debouncedSearch ? "No orders match your search" : `No ${TAB_LABEL[tab].toLowerCase()} orders`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {debouncedSearch
              ? "Try a different keyword or clear the search."
              : tab === "refunded"
              ? "Refunded orders will appear here."
              : `There are no ${TAB_LABEL[tab].toLowerCase()} orders right now.`}
          </p>
        </div>
      ) : (
        <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
          {orders.map((o) => (
            <OrderRow
              key={o._id}
              order={o}
              expanded={expandedId === o._id}
              onToggle={() => setExpandedId(expandedId === o._id ? null : o._id)}
              onRefund={() => openRefund(o)}
            />
          ))}
        </div>
      )}

      {/* STICKY PAGINATION */}
      {total > 0 && (
        <div className="sticky bottom-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{startIdx}–{endIdx}</span> of{" "}
            <span className="font-bold text-slate-900">{total}</span> order{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || totalPages === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-bold tabular-nums text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 1}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* REFUND DIALOG */}
      <RefundDialog
        order={refundTarget}
        onClose={closeRefund}
        onConfirm={executeRefund}
        reason={refundReason}
        setReason={setRefundReason}
        error={refundError}
        processing={refunding}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stat mini
// ═══════════════════════════════════════════════════════════════

function StatMini({
  icon: Icon, label, count, bg, fg, active, onClick,
}: {
  icon: any;
  label: string;
  count: number;
  bg: string;
  fg: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
        active ? "border-[#EB5017]/50 ring-2 ring-[#EB5017]/15" : "border-slate-200/80"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", fg)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-black tabular-nums text-slate-900">{count}</p>
        <p className="text-xs font-bold text-[#667185]">{label}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Order row
// ═══════════════════════════════════════════════════════════════

function OrderRow({
  order, expanded, onToggle, onRefund,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onRefund: () => void;
}) {
  const meta = STATUS_META[order.status];
  const buyer = getBuyer(order);
  const isPaid = order.status === "paid";
  const itemCount = order.items?.length || 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Row */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EB5017] to-[#B33A0F] text-white shadow-md">
          <Receipt className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-black text-slate-900">{order.orderNumber}</p>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", meta.bg, meta.text)}>
              <span className={cn("h-1 w-1 rounded-full", meta.dot)} /> {meta.label}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#667185]">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              {buyer.name || "Unknown buyer"}
            </span>
            {buyer.email && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {buyer.email}
                </span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-black tabular-nums text-slate-900">
            {money(order.total, order.currency)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isPaid && (
            <Button
              onClick={onRefund}
              size="sm"
              variant="outline"
              className="h-9 rounded-lg border-[#FEE4E2] font-bold text-[#9E0A05] hover:bg-[#FEF3F2]"
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Refund
            </Button>
          )}
          <button
            onClick={onToggle}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50/50 to-white p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Items */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Order items
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3">
                {order.items.map((it) => (
                  <div key={it._id} className="flex items-start gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0177FB]/10">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#0177FB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {getProductTitle(it)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {PRODUCT_TYPE_LABEL[it.productType] || it.productType}
                        {" · "}
                        {getTeacherName(it)}
                      </p>
                      {it.discountShare > 0 && (
                        <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                          −{money(it.discountShare, order.currency)} discount
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black tabular-nums text-slate-900">
                        {money(it.finalPrice, order.currency)}
                      </p>
                      {it.discountShare > 0 && (
                        <p className="text-[10px] text-slate-400 line-through tabular-nums">
                          {money(it.priceSnapshot, order.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="mt-3 space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <SumRow label="Subtotal" value={money(order.subtotal, order.currency)} />
                {order.discountTotal > 0 && (
                  <SumRow
                    label={order.coupon ? `Discount (${order.coupon.code})` : "Discount"}
                    value={`−${money(order.discountTotal, order.currency)}`}
                    color="text-emerald-600"
                  />
                )}
                {order.taxTotal > 0 && (
                  <SumRow label="Tax" value={money(order.taxTotal, order.currency)} />
                )}
                <div className="border-t border-slate-100 pt-1">
                  <SumRow
                    label="Total"
                    value={money(order.total, order.currency)}
                    bold
                  />
                </div>
              </div>
            </div>

            {/* Buyer + payment + timeline */}
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Buyer & payment
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <InfoRow
                  icon={User}
                  label="Buyer"
                  value={buyer.name || "—"}
                />
                {buyer.email && (
                  <InfoRow icon={Mail} label="Email" value={buyer.email} />
                )}
                {order.affiliateCode && (
                  <InfoRow
                    icon={Tag}
                    label="Affiliate"
                    value={
                      <span className="font-mono text-slate-900">{order.affiliateCode}</span>
                    }
                  />
                )}
                <InfoRow
                  icon={CreditCard}
                  label="Payment"
                  value={
                    order.payment
                      ? `${order.payment.provider.toUpperCase()} · ${order.payment.status}`
                      : "No payment (free)"
                  }
                />
                {order.payment?.providerRef && (
                  <InfoRow
                    icon={Receipt}
                    label="Reference"
                    value={
                      <span className="font-mono text-slate-900 text-[10px]">
                        {order.payment.providerRef}
                      </span>
                    }
                  />
                )}
              </div>

              <p className="mb-2 mt-4 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Timeline
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <InfoRow
                  icon={Clock}
                  label="Created"
                  value={format(new Date(order.createdAt), "PPpp")}
                />
                {order.paidAt && (
                  <InfoRow
                    icon={CheckCircle2}
                    label="Paid"
                    value={format(new Date(order.paidAt), "PPpp")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SumRow({
  label, value, color, bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(bold ? "font-bold text-slate-900" : "text-slate-500", color)}>{label}</span>
      <span className={cn("tabular-nums", bold ? "font-black text-slate-900" : "font-semibold text-slate-900", color)}>
        {value}
      </span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Refund dialog
// ═══════════════════════════════════════════════════════════════

function RefundDialog({
  order, onClose, onConfirm, reason, setReason, error, processing,
}: {
  order: RefundDialogState;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (v: string) => void;
  error: string | null;
  processing: boolean;
}) {
  const open = !!order;
  if (!order) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Refund order</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const buyer = getBuyer(order);
  const hasPayment = !!order.payment;
  const providerLabel = order.payment?.provider === "stripe"
    ? "Stripe"
    : order.payment?.provider === "paypal"
    ? "PayPal"
    : "no payment provider";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3F2] text-[#9E0A05]">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">Refund order</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-slate-500">
                This refunds the full amount{hasPayment ? ` via ${providerLabel}` : ""} and revokes all entitlements. Cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Order</span>
            <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Buyer</span>
            <span className="font-semibold text-slate-900">{buyer.name || "—"}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Items</span>
            <span className="font-semibold text-slate-900">{order.items.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="font-bold text-slate-900">Refund amount</span>
            <span className="text-lg font-black tabular-nums text-slate-900">
              {money(order.total, order.currency)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
          <p className="font-bold">This will:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-[11px]">
            <li>Refund {money(order.total, order.currency)} to the buyer{hasPayment ? ` via ${providerLabel}` : " (no payment record)"}</li>
            <li>Revoke all course / product access for this buyer</li>
            <li>Reverse any coupon redemption and affiliate commission</li>
            <li>Mark this order as refunded</li>
          </ul>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Reason <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer request, duplicate charge…"
            rows={2}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            className="rounded-lg bg-[#9E0A05] font-bold text-white shadow-md hover:bg-[#7A0704]"
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Refunding…</>
            ) : (
              <><RotateCcw className="mr-1.5 h-4 w-4" /> Confirm refund</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}