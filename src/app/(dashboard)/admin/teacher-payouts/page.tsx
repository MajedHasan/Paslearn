// app/admin/teacher-payouts/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet, Loader2, RefreshCw, Search, AlertCircle, CheckCircle2,
  XCircle, Clock, CreditCard, ChevronDown, ChevronUp, Zap, Sparkles,
  PartyPopper, BadgeCheck, Send, ShieldCheck, Landmark, ArrowRight, Mail,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type PayoutStatus = "requested" | "approved" | "paid" | "rejected";
type PayoutMethod = "stripe" | "paypal" | "manual";
type Tab = "all" | PayoutStatus;
type DialogAction = "approve" | "reject" | "paid";

interface MethodDetails {
  paypalEmail?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  country?: string;
  swiftCode?: string;
  additionalNote?: string;
}

interface TeacherInfo {
  _id?: string;
  name?: string;
  email?: string;
}

interface Payout {
  _id: string;
  teacher: TeacherInfo | string;
  amount: number;
  method: PayoutMethod;
  methodDetails?: MethodDetails;
  status: PayoutStatus;
  reason?: string;
  externalRef?: string;
  requestedBy?: "teacher" | "auto";
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ⭐ FIX 1: type not interface (interface can't be `| null`)
type DialogState =
  | { type: DialogAction; payout: Payout }
  | null;

// ═══════════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════════

const STATUS_META: Record<
  PayoutStatus,
  { label: string; bg: string; text: string; dot: string; icon: any }
> = {
  requested: {
    label: "Requested",
    bg: "bg-[#FFF6E5]",
    text: "text-[#B54708]",
    dot: "bg-[#B54708]",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    bg: "bg-[#E0EAFF]",
    text: "text-[#0177FB]",
    dot: "bg-[#0177FB]",
    icon: ShieldCheck,
  },
  paid: {
    label: "Paid",
    bg: "bg-[#E7F6EC]",
    text: "text-[#036B26]",
    dot: "bg-[#036B26]",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#FEF3F2]",
    text: "text-[#9E0A05]",
    dot: "bg-[#9E0A05]",
    icon: XCircle,
  },
};

const METHOD_META: Record<
  PayoutMethod,
  { label: string; icon: any; description: string }
> = {
  stripe: { label: "Stripe", icon: CreditCard, description: "Paid via Stripe transfer" },
  paypal: { label: "PayPal", icon: Send, description: "Paid to PayPal account" },
  manual: { label: "Bank transfer", icon: Landmark, description: "Manual bank transfer" },
};

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function compactMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function maskAccount(acct?: string): string {
  if (!acct) return "—";
  const clean = acct.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `•••• ${clean.slice(-4)}`;
}

// ⭐ FIX 2: null-safe — typeof null === "object" was passing through
function getTeacher(p: Payout): TeacherInfo {
  if (p.teacher && typeof p.teacher === "object") {
    return p.teacher as TeacherInfo;
  }
  return { _id: String(p.teacher) };
}

// ⭐ FIX 3: explicit type — `{}` didn't have `.paypalEmail` etc
function getDetails(p: Payout): MethodDetails {
  return p.methodDetails || {};
}

// ═══════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════

function PayoutsSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .admin-shimmer {
          background: linear-gradient(90deg, #FEE9DE 0%, #FFF5EE 50%, #FEE9DE 100%);
          background-size: 1000px 100%;
          animation: adminShimmer 2s infinite linear;
        }
      `}</style>

      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading payouts…</p>
      </div>

      <div className="admin-shimmer h-28 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-shimmer h-24 rounded-2xl" />
        ))}
      </div>
      <div className="admin-shimmer h-14 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="admin-shimmer h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("requested");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [autoCreating, setAutoCreating] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [externalRef, setExternalRef] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const r = await api.get("/admin/teacher-payouts", {
        params: { limit: 500, page: 1, status: "all" },
      });
      setPayouts((r.data.data || []) as Payout[]);
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const sum = (s: PayoutStatus) =>
      payouts.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
    const count = (s: PayoutStatus) => payouts.filter((p) => p.status === s).length;
    return {
      requested: { amount: sum("requested"), count: count("requested") },
      approved: { amount: sum("approved"), count: count("approved") },
      paid: { amount: sum("paid"), count: count("paid") },
      rejected: { amount: sum("rejected"), count: count("rejected") },
    };
  }, [payouts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payouts.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (!q) return true;
      const t = getTeacher(p);
      return (
        (t.name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        p._id.toLowerCase().includes(q)
      );
    });
  }, [payouts, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openDialog = (type: DialogAction, payout: Payout) => {
    setDialog({ type, payout });
    setDialogError(null);
    setRejectReason("");
    setExternalRef("");
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError(null);
    setRejectReason("");
    setExternalRef("");
  };

  const executeAction = async () => {
    if (!dialog) return;
    const { type, payout } = dialog;

    if (type === "reject" && !rejectReason.trim()) {
      setDialogError("Reason is required when rejecting");
      return;
    }

    setDialogError(null);
    setProcessingId(payout._id);

    try {
      const body: any = { action: type };
      if (type === "reject") body.reason = rejectReason.trim();
      if (type === "paid" && externalRef.trim()) body.externalRef = externalRef.trim();

      await api.post(`/admin/teacher-payouts/${payout._id}/process`, body);

      const msg =
        type === "approve" ? "Payout approved" :
        type === "reject" ? "Payout rejected" : "Payout marked as paid";
      toast.success(msg, {
        description: `${money(payout.amount)} → ${getTeacher(payout).name || "teacher"}`,
      });

      closeDialog();
      await load(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to process payout";
      setDialogError(msg);
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAutoCreate = async () => {
    setAutoCreating(true);
    try {
      const r = await api.post("/admin/teacher-payouts/auto-create");
      const created = r.data.data?.created ?? 0;
      if (created === 0) {
        toast.info("No teachers are due a payout right now", {
          description: "Only teachers with ≥ $50 available and no pending request qualify.",
        });
      } else {
        toast.success(`Created ${created} payout${created === 1 ? "" : "s"}`, {
          description: "Teachers with available balances were auto-queued.",
        });
        await load(true);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Auto-create failed");
    } finally {
      setAutoCreating(false);
    }
  };

  if (loading && payouts.length === 0) return <PayoutsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
          <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
        </div>
        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">
          {`Couldn't load payouts`}
        </h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
          onClick={() => load()}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "requested", label: "Requested", count: stats.requested.count },
    { value: "approved", label: "Approved", count: stats.approved.count },
    { value: "paid", label: "Paid", count: stats.paid.count },
    { value: "rejected", label: "Rejected", count: stats.rejected.count },
    { value: "all", label: "All", count: payouts.length },
  ];

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
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                Finance
              </p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Teacher payouts
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span>{stats.requested.count + stats.approved.count} awaiting action</span>
                {stats.requested.count > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-black text-white backdrop-blur">
                    <AlertCircle className="h-3 w-3" />
                    {money(stats.requested.amount)} requested
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => load(true)}
              disabled={refreshing}
              className="h-11 rounded-lg bg-white/15 font-bold text-white backdrop-blur hover:bg-white/25"
            >
              <RefreshCw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={handleAutoCreate}
              disabled={autoCreating}
              className="h-11 rounded-lg bg-white font-bold text-[#EB5017] shadow-md hover:bg-white/90"
            >
              {autoCreating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-1.5 h-4 w-4" />
              )}
              Auto-create payouts
            </Button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
          Overview
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatMini
            icon={Clock} label="Requested"
            amount={stats.requested.amount} count={stats.requested.count}
            bg="bg-[#FFF6E5]" fg="text-[#B54708]"
            onClick={() => setTab("requested")}
          />
          <StatMini
            icon={ShieldCheck} label="Approved"
            amount={stats.approved.amount} count={stats.approved.count}
            bg="bg-[#E0EAFF]" fg="text-[#0177FB]"
            onClick={() => setTab("approved")}
          />
          <StatMini
            icon={CheckCircle2} label="Paid"
            amount={stats.paid.amount} count={stats.paid.count}
            bg="bg-[#E7F6EC]" fg="text-[#036B26]"
            onClick={() => setTab("paid")}
          />
          <StatMini
            icon={XCircle} label="Rejected"
            amount={stats.rejected.amount} count={stats.rejected.count}
            bg="bg-[#FEF3F2]" fg="text-[#9E0A05]"
            onClick={() => setTab("rejected")}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by teacher name, email, or payout ID…"
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                tab === t.value
                  ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F] text-white shadow-md shadow-[#EB5017]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                    tab === t.value ? "bg-white/20 text-white" : "bg-white text-slate-600"
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEE9DE] to-[#FFD5A8] shadow-lg">
            <PartyPopper className="h-8 w-8 text-[#EB5017]" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">
            {search ? "No payouts match your search" : `No ${tab === "all" ? "" : tab} payouts`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try a different keyword or clear the search."
              : tab === "requested"
              ? "Teachers have not requested any payouts yet."
              : `No payouts are currently ${tab}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((p) => (
            <PayoutRow
              key={p._id}
              payout={p}
              expanded={expandedId === p._id}
              onToggle={() => setExpandedId(expandedId === p._id ? null : p._id)}
              onAction={(type) => openDialog(type, p)}
              processing={processingId === p._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-lg px-2"
            >
              Prev
            </Button>
            <span className="px-2 text-xs font-bold tabular-nums text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline" size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-lg px-2"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DIALOG */}
      <ActionDialog
        dialog={dialog}
        onClose={closeDialog}
        onConfirm={executeAction}
        processing={!!processingId}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        externalRef={externalRef}
        setExternalRef={setExternalRef}
        dialogError={dialogError}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stat mini
// ═══════════════════════════════════════════════════════════════

function StatMini({
  icon: Icon, label, amount, count, bg, fg, onClick,
}: {
  icon: any;
  label: string;
  amount: number;
  count: number;
  bg: string;
  fg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", fg)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-black tabular-nums text-slate-900">{compactMoney(amount)}</p>
        <p className="text-xs font-bold text-[#667185]">
          {label} · {count}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Payout row
// ═══════════════════════════════════════════════════════════════

function PayoutRow({
  payout, expanded, onToggle, onAction, processing,
}: {
  payout: Payout;
  expanded: boolean;
  onToggle: () => void;
  onAction: (type: DialogAction) => void;
  processing: boolean;
}) {
  const meta = STATUS_META[payout.status];
  const Icon = meta.icon;
  const method = METHOD_META[payout.method] || METHOD_META.manual;
  const MethodIcon = method.icon;
  const teacher = getTeacher(payout);
  const d = getDetails(payout);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EB5017] to-[#B33A0F] text-white shadow-md">
          <span className="text-sm font-black">
            {(teacher.name || "?").charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-900">
              {teacher.name || "Unknown teacher"}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                meta.bg, meta.text
              )}
            >
              <span className={cn("h-1 w-1 rounded-full", meta.dot)} />
              {meta.label}
            </span>
            {payout.requestedBy === "auto" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                <Sparkles className="h-2.5 w-2.5" /> Auto
              </span>
            )}
          </div>
          {teacher.email && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#667185]">
              <Mail className="h-3 w-3" /> {teacher.email}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-black tabular-nums text-slate-900">
            {money(payout.amount)}
          </p>
          <p className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            <MethodIcon className="h-3 w-3" /> {method.label}
          </p>
        </div>

        {payout.status === "requested" && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              onClick={() => onAction("approve")}
              disabled={processing}
              size="sm"
              className="h-9 rounded-lg bg-[#E7F6EC] font-bold text-[#036B26] hover:bg-[#D3EEDD]"
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              onClick={() => onAction("reject")}
              disabled={processing}
              size="sm"
              variant="outline"
              className="h-9 rounded-lg border-[#FEE4E2] font-bold text-[#9E0A05] hover:bg-[#FEF3F2]"
            >
              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        )}

        {payout.status === "approved" && (
          <Button
            onClick={() => onAction("paid")}
            disabled={processing}
            size="sm"
            className="h-9 shrink-0 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold text-white shadow-md shadow-[#0177FB]/25"
          >
            <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Mark as paid
          </Button>
        )}

        {processing && <Loader2 className="h-4 w-4 animate-spin text-[#EB5017]" />}

        <button
          onClick={onToggle}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2 text-[11px] text-[#98A2B3]">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Requested {formatDistanceToNow(new Date(payout.createdAt), { addSuffix: true })}
        </span>
        {payout.processedAt && (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {payout.status === "paid" ? "Paid" : payout.status === "rejected" ? "Rejected" : "Approved"}{" "}
            {formatDistanceToNow(new Date(payout.processedAt), { addSuffix: true })}
          </span>
        )}
        {payout.externalRef && (
          <span className="inline-flex items-center gap-1 font-mono">
            Ref: {payout.externalRef}
          </span>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50/50 to-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Payout details
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <DetailRow label="Payout ID" value={<span className="font-mono">{payout._id}</span>} />
                <DetailRow
                  label="Amount"
                  value={<span className="font-black text-slate-900">{money(payout.amount)}</span>}
                />
                <DetailRow label="Method" value={`${method.label} — ${method.description}`} />
                <DetailRow label="Requested" value={format(new Date(payout.createdAt), "PPpp")} />
                {payout.processedAt && (
                  <DetailRow label="Processed" value={format(new Date(payout.processedAt), "PPpp")} />
                )}
                {payout.externalRef && (
                  <DetailRow
                    label="Transaction ref"
                    value={<span className="font-mono text-slate-900">{payout.externalRef}</span>}
                  />
                )}
                {payout.reason && (
                  <DetailRow
                    label="Rejection reason"
                    value={<span className="text-[#9E0A05]">{payout.reason}</span>}
                  />
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                {method.label} details
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                {payout.method === "paypal" && (
                  <>
                    <DetailRow label="PayPal email" value={d.paypalEmail || "—"} />
                    <DetailRow label="Account holder" value={d.accountHolderName || "—"} />
                  </>
                )}
                {payout.method === "manual" && (
                  <>
                    <DetailRow label="Account holder" value={d.accountHolderName || "—"} />
                    <DetailRow label="Bank" value={d.bankName || "—"} />
                    <DetailRow label="Account #" value={maskAccount(d.accountNumber)} />
                    <DetailRow label="SWIFT" value={d.swiftCode || "—"} />
                    <DetailRow label="Country" value={d.country || "—"} />
                  </>
                )}
                {payout.method === "stripe" && (
                  <p className="text-[#98A2B3]">
                    Payout will be sent to the teacher&apos;s connected Stripe account.
                  </p>
                )}
                {d.additionalNote && <DetailRow label="Note" value={d.additionalNote} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-[#98A2B3]">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Action dialog
// ═══════════════════════════════════════════════════════════════

function ActionDialog({
  dialog, onClose, onConfirm, processing,
  rejectReason, setRejectReason, externalRef, setExternalRef, dialogError,
}: {
  dialog: DialogState;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  externalRef: string;
  setExternalRef: (v: string) => void;
  dialogError: string | null;
}) {
  const open = !!dialog;
  const type = dialog?.type;
  const payout = dialog?.payout;

  const config: Record<DialogAction, {
    title: string;
    description: string;
    icon: any;
    iconBg: string;
    confirmLabel: string;
    confirmClass: string;
  }> = {
    approve: {
      title: "Approve payout",
      description: "You're approving this payout. It moves to the ready-to-pay queue.",
      icon: CheckCircle2,
      iconBg: "bg-[#E7F6EC] text-[#036B26]",
      confirmLabel: "Approve payout",
      confirmClass: "bg-[#036B26] hover:bg-[#024D1B] text-white",
    },
    reject: {
      title: "Reject payout",
      description: "The teacher will be notified. Their balance is restored.",
      icon: XCircle,
      iconBg: "bg-[#FEF3F2] text-[#9E0A05]",
      confirmLabel: "Reject payout",
      confirmClass: "bg-[#9E0A05] hover:bg-[#7A0704] text-white",
    },
    paid: {
      title: "Mark as paid",
      description: "Confirm that the funds have been transferred to the teacher.",
      icon: BadgeCheck,
      iconBg: "bg-[#E0EAFF] text-[#0177FB]",
      confirmLabel: "Mark as paid",
      confirmClass: "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white",
    },
  };

  if (!type || !payout) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Payout action</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const cfg = config[type];
  const Icon = cfg.icon;
  const teacher = getTeacher(payout);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", cfg.iconBg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">
                {cfg.title}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-slate-500">
                {cfg.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Teacher</span>
            <span className="font-bold text-slate-900">{teacher.name || "—"}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="text-lg font-black tabular-nums text-slate-900">
              {money(payout.amount)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500">Method</span>
            <span className="font-semibold text-slate-900">
              {METHOD_META[payout.method]?.label || payout.method}
            </span>
          </div>
        </div>

        {type === "reject" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Rejection reason <span className="text-[#9E0A05]">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this payout was rejected (visible to teacher)…"
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
              autoFocus
            />
          </div>
        )}

        {type === "paid" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Transaction reference <span className="text-slate-400">(optional)</span>
            </label>
            <Input
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              placeholder="e.g. Stripe transfer ID, wire reference, PayPal transaction ID"
              className="mt-1.5 rounded-lg"
              autoFocus
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Stored for your records and the teacher&apos;s payout history.
            </p>
          </div>
        )}

        {dialogError && (
          <div className="flex items-start gap-2 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {dialogError}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            className={cn("rounded-lg font-bold shadow-md", cfg.confirmClass)}
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Icon className="mr-1.5 h-4 w-4" />
                {cfg.confirmLabel}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}