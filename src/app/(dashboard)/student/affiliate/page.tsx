"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Copy,
  Check,
  Wallet,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  Share2,
  Sparkles,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Gift,
  Package,
  ChevronLeft,
  ChevronRight,
  Lock,
  Info,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { WithdrawModal } from "./_components/withdraw-modal";
import { PayoutHistory } from "./_components/payout-history";

interface AffiliateOverview {
  profile: {
    referralCode: string;
    referralLink: string;
    status: string;
    totalEarned: number;
    totalPending: number;
    totalAvailable: number;
    totalPaid: number;
    conversions: number;
    holdDays: number;
  };
  monthlyEarnings: Array<{ month: string; earnings: number; count: number }>;
  byProgram: Record<string, { totalEarned: number; count: number }>;
}

interface Referral {
  _id: string;
  affiliateCode: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "paid" | "reversed";
  type: "one_time" | "recurring";
  occurrenceNumber?: number;
  holdUntil?: string;
  createdAt: string;
  order?: { _id: string; orderNumber: string; total: number };
  product?: { _id: string; title: string; type: string };
}

const PROGRAM_META: Record<
  string,
  { label: string; icon: any; color: string; gradient: string }
> = {
  platform_subscription: {
    label: "Platform",
    icon: GraduationCap,
    color: "#8B5CF6",
    gradient: "from-violet-500 to-violet-600",
  },
  course: {
    label: "Courses",
    icon: BookOpen,
    color: "#0177FB",
    gradient: "from-[#0177FB] to-[#0156C7]",
  },
  digital_file: {
    label: "Digital Files",
    icon: Package,
    color: "#EC4899",
    gradient: "from-pink-500 to-pink-600",
  },
  coaching: {
    label: "Coaching",
    icon: Users,
    color: "#FF7E02",
    gradient: "from-[#FF7E02] to-[#E66400]",
  },
  addon: {
    label: "Addons",
    icon: Gift,
    color: "#10B981",
    gradient: "from-emerald-500 to-emerald-600",
  },
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: {
    label: "In escrow",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  reversed: {
    label: "Reversed",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

const MIN_WITHDRAW = 50;

export default function AffiliatePage() {
  const [overview, setOverview] = useState<AffiliateOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/affiliate/overview");
      setOverview(r.data.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load affiliate");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyLink = async () => {
    if (!overview?.profile.referralLink) return;
    try {
      await navigator.clipboard.writeText(overview.profile.referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareLink = async () => {
    if (!overview?.profile.referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Learn with me on Paslearn",
          text: "Join me on Paslearn and start learning today",
          url: overview.profile.referralLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  const chartData = useMemo(() => {
    if (!overview) return [];
    return (overview.monthlyEarnings || []).map((m) => ({
      month: new Date(`${m.month}-01`).toLocaleString("en-US", {
        month: "short",
      }),
      earnings: m.earnings,
    }));
  }, [overview]);

  const pieData = useMemo(() => {
    if (!overview) return [];
    return Object.entries(overview.byProgram)
      .filter(([, v]) => v.totalEarned > 0)
      .map(([key, v]) => ({
        name: PROGRAM_META[key]?.label || key,
        value: Math.round(v.totalEarned * 100) / 100,
        color: PROGRAM_META[key]?.color || "#94A3B8",
      }));
  }, [overview]);

  const hasEarnings = chartData.some((d) => d.earnings > 0);

  // ── Balance values ──
  const totalEarned = overview?.profile.totalEarned || 0;
  const totalPending = overview?.profile.totalPending || 0;
  const totalAvailable = overview?.profile.totalAvailable || 0;
  const totalPaid = overview?.profile.totalPaid || 0;
  const holdDays = overview?.profile.holdDays || 7;
  const conversions = overview?.profile.conversions || 0;

  // ⭐ Withdraw is based on AVAILABLE, not pending
  const canWithdraw = totalAvailable >= MIN_WITHDRAW;
  const remainingToWithdraw = Math.max(0, MIN_WITHDRAW - totalAvailable);
  const progressToMin = Math.min(100, (totalAvailable / MIN_WITHDRAW) * 100);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
      </div>
    );
  }

  // ─── Error ───
  if (!overview) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-sm text-slate-500">Failed to load affiliate data</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
            Earn while you learn
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Affiliate Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Share courses with friends and earn commission on every purchase
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => setShowInfo(true)}
        >
          <Info className="mr-1.5 h-3.5 w-3.5" />
          How it works
        </Button>
      </div>

      {/* ─── Referral hero ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0177FB] via-[#0166d9] to-[#014bb0] p-6 text-white shadow-lg shadow-[#0177FB]/25">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FF7E02]/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-sm">
            <Link2 className="h-3 w-3" />
            Your referral link
          </div>

          <p className="mt-3 text-sm text-white/75">
            Share this link anywhere. Every purchase through it earns you a
            commission.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-xl bg-white/10 p-3 backdrop-blur-sm ring-1 ring-inset ring-white/20">
              <Link2 className="h-4 w-4 shrink-0 text-white/60" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-white">
                {overview.profile.referralLink}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyLink}
                className="flex-1 rounded-xl bg-white font-bold text-[#0177FB] hover:bg-white/95 sm:flex-initial"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={shareLink}
                className="rounded-xl border-white/30 bg-white/10 font-bold text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-white/60">
            Your code:{" "}
            <strong className="font-black">
              {overview.profile.referralCode}
            </strong>
            {" · "}
            Anyone with this link gets attributed to you for 30 days
          </p>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBox
          icon={Wallet}
          label="Available now"
          value={`$${totalAvailable.toFixed(2)}`}
          gradient="from-emerald-500 to-emerald-600"
          hint={
            canWithdraw
              ? "Ready to withdraw"
              : `$${remainingToWithdraw.toFixed(2)} to withdraw`
          }
        />
        <StatBox
          icon={DollarSign}
          label="Total earned"
          value={`$${totalEarned.toFixed(2)}`}
          gradient="from-[#0177FB] to-[#0156C7]"
          hint="Lifetime"
        />
        <StatBox
          icon={Clock}
          label="In escrow"
          value={`$${totalPending.toFixed(2)}`}
          gradient="from-[#FF7E02] to-[#E66400]"
          hint={`Releases ${holdDays}d after sale`}
        />
        <StatBox
          icon={TrendingUp}
          label="Paid out"
          value={`$${totalPaid.toFixed(2)}`}
          gradient="from-violet-500 to-violet-600"
          hint="Lifetime withdrawals"
        />
      </div>

      {/* ─── Withdraw card — always visible ─── */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 ${
          canWithdraw
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
            : "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md ${
                canWithdraw
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"
              }`}
            >
              {canWithdraw ? (
                <Wallet className="h-6 w-6 text-white" />
              ) : (
                <Lock className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-base font-black ${
                  canWithdraw ? "text-emerald-900" : "text-slate-900"
                }`}
              >
                {canWithdraw
                  ? `Withdraw $${totalAvailable.toFixed(2)}`
                  : "Withdraw commissions"}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  canWithdraw ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {canWithdraw
                  ? `Minimum $${MIN_WITHDRAW} · Fast payouts via PayPal or Bank`
                  : totalAvailable > 0
                  ? `You need $${remainingToWithdraw.toFixed(
                      2
                    )} more available to withdraw`
                  : totalPending > 0
                  ? `$${totalPending.toFixed(
                      2
                    )} in escrow — becomes available ${holdDays} days after each sale`
                  : `Share your referral link to earn. Withdraw once you reach $${MIN_WITHDRAW} available.`}
              </p>

              {totalAvailable > 0 && !canWithdraw && (
                <div className="mt-2 max-w-xs">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF7E02] to-[#E66400] transition-all duration-700"
                      style={{ width: `${progressToMin}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    ${totalAvailable.toFixed(2)} / ${MIN_WITHDRAW.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => setWithdrawOpen(true)}
            disabled={!canWithdraw}
            className={`rounded-lg font-bold shadow-md ${
              canWithdraw
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700"
                : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
            }`}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {canWithdraw ? "Withdraw now" : "Withdraw"}
          </Button>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Earnings over time */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Earnings over time
                </p>
                <p className="text-[11px] text-slate-500">
                  Monthly commission
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {!hasEarnings ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="max-w-xs text-xs font-medium text-slate-500">
                  No earnings yet — share your referral link to start earning
                  commission
                </p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="earningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0177FB"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0177FB"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#F1F5F9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E2E8F0",
                        fontSize: 11,
                      }}
                      formatter={(v: any) => [
                        `$${Number(v).toFixed(2)}`,
                        "Earnings",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#0177FB"
                      strokeWidth={3}
                      fill="url(#earningsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* By product type */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  By product type
                </p>
                <p className="text-[11px] text-slate-500">
                  Where your earnings come from
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {pieData.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="text-xs font-medium text-slate-500">
                  No commission data yet
                </p>
              </div>
            ) : (
              <div className="flex h-56 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #E2E8F0",
                          fontSize: 11,
                        }}
                        formatter={(v: any) => [
                          `$${Number(v).toFixed(2)}`,
                          "Earned",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-col sm:items-start sm:justify-center">
                  {pieData.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}{" "}
                      <span className="font-black">${p.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Referrals list ─── */}
      <ReferralsSection holdDays={holdDays} />

      {/* ─── Withdrawal history ─── */}
      <PayoutHistory />

      {/* ─── Modals ─── */}
      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        availableAmount={totalAvailable}
        pendingAmount={totalPending}
        holdDays={holdDays}
        onSuccess={load}
      />

      <HowItWorksModal
        open={showInfo}
        onOpenChange={setShowInfo}
        holdDays={holdDays}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════

function StatBox({
  icon: Icon,
  label,
  value,
  gradient,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  gradient: string;
  hint?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-md`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ReferralsSection({ holdDays }: { holdDays: number }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/affiliate/referrals", {
        params: { status: statusFilter, page, limit },
      });
      setReferrals(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">
              Referral history
            </p>
            <p className="text-[11px] text-slate-500">
              {total} commission{total === 1 ? "" : "s"} earned
            </p>
          </div>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-36 rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">In escrow</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0177FB]" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-900">
              No referrals yet
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Share your link on social media, in emails, or with friends.
              Every purchase through it earns you commission.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref) => {
              const meta = PROGRAM_META[ref.product?.type || ""] || {
                label: "Product",
                icon: ShoppingBag,
                color: "#94A3B8",
                gradient: "from-slate-400 to-slate-500",
              };
              const Icon = meta.icon;
              const statusMeta =
                STATUS_META[ref.status] || STATUS_META.pending;

              // Compute days until release for pending commissions
              let releaseLabel: string | null = null;
              if (ref.status === "pending" && ref.holdUntil) {
                const ms = new Date(ref.holdUntil).getTime() - Date.now();
                const days = Math.ceil(ms / 86_400_000);
                if (days > 0) releaseLabel = `Releases in ${days}d`;
                else releaseLabel = "Releasing soon";
              } else if (ref.status === "pending" && !ref.holdUntil) {
                releaseLabel = `Releases ${holdDays}d after sale`;
              }

              return (
                <div
                  key={ref._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} shadow-sm`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-bold text-slate-900">
                      {ref.product?.title || "Product"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {meta.label}
                      {ref.type === "recurring" &&
                        ref.occurrenceNumber &&
                        ` · recurring #${ref.occurrenceNumber}`}
                      {" · "}
                      {formatDistanceToNow(new Date(ref.createdAt))} ago
                    </p>
                    {releaseLabel && (
                      <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                        {releaseLabel}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-slate-900 tabular-nums">
                      ${ref.amount.toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
              {total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 rounded-lg px-2"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 rounded-lg px-2"
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

function HowItWorksModal({
  open,
  onOpenChange,
  holdDays,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  holdDays: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How the affiliate program works</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0177FB] text-xs font-black text-white">
              1
            </div>
            <div>
              <p className="font-bold text-slate-900">Share your link</p>
              <p className="mt-0.5 text-xs">
                Post it on social media, send it in emails, or share with
                friends. Anyone who clicks is tracked for 30 days.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0177FB] text-xs font-black text-white">
              2
            </div>
            <div>
              <p className="font-bold text-slate-900">They make a purchase</p>
              <p className="mt-0.5 text-xs">
                When someone buys any product through your link, a commission
                is recorded in your account.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF7E02] text-xs font-black text-white">
              3
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {holdDays}-day hold period
              </p>
              <p className="mt-0.5 text-xs">
                Your commission sits in <strong>escrow for {holdDays} days</strong>{" "}
                {`to protect against refunds and chargebacks. It's not
                withdrawable yet, but it's already counted as earned.`}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
              4
            </div>
            <div>
              <p className="font-bold text-slate-900">Ready to withdraw</p>
              <p className="mt-0.5 text-xs">
                After the hold, commissions move to your{" "}
                <strong>Available balance</strong>. Once you have $50+ there,
                request a payout via PayPal or bank transfer.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-black text-white">
              5
            </div>
            <div>
              <p className="font-bold text-slate-900">Get paid</p>
              <p className="mt-0.5 text-xs">
                {`Admin reviews your request and sends payment within 1-2
                business days. You'll see it appear as "Paid" in your
                withdrawal history.`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}