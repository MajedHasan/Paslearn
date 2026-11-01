"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Loader2,
  TrendingUp,
  Users,
  Percent,
  TicketPercent,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings2,
  Pencil,
  BadgeCheck,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { WithdrawTeacherModal } from "./_components/withdraw-teacher-modal";
import { TeacherPayoutHistory } from "./_components/teacher-payout-history";

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════
interface Transaction {
  orderId: string;
  orderNumber: string;
  paidAt: string;
  productType: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  thumbnailUrl?: string | null;
  grossAmount: number;
  couponDiscount: number;
  paidAmount: number;
  platformFee: number;
  affiliateCommission: number;
  netEarning: number;
  buyerName?: string;
  buyerEmail?: string;
}

interface Summary {
  grossRevenue: number;
  totalCoupons: number;
  totalPaid: number;
  totalPlatformFees: number;
  totalAffiliateCommissions: number;
  netEarnings: number;
  totalTransactions: number;
}

interface ProductBreakdown {
  productId: string;
  productType: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  ratingAvg?: number;
  enrollmentCount?: number;
  grossRevenue: number;
  totalCoupons: number;
  totalPaid: number;
  totalPlatformFees: number;
  totalAffiliateCommissions: number;
  netEarnings: number;
  sales: number;
}

interface ProductWithCommission {
  productId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  status: string;
  ratingAvg: number;
  enrollmentCount: number;
  priceModel: string;
  oneTimePrice?: number;
  commissionPolicy: {
    enabled: boolean;
    type: "one_time" | "recurring";
    valueType: "percent" | "flat";
    value: number;
    duration: "lifetime" | "fixed_months";
    durationMonths?: number;
  };
}

interface PayoutBalance {
  available: number;
  netEarned: number;
  alreadyAllocated: number;
}

type Tab = "transactions" | "per-product" | "commission";

const MIN_WITHDRAW = 50;

// ═══════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════
export default function TeacherEarningsPage() {
  const [tab, setTab] = useState<Tab>("transactions");

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(true);

  // Per product
  const [perProduct, setPerProduct] = useState<ProductBreakdown[]>([]);
  const [ppLoading, setPpLoading] = useState(false);

  // Commission settings
  const [products, setProducts] = useState<ProductWithCommission[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [editing, setEditing] = useState<ProductWithCommission | null>(null);

  // Payout
  const [payoutBalance, setPayoutBalance] = useState<PayoutBalance | null>(
    null
  );
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutRefreshKey, setPayoutRefreshKey] = useState(0);

  // ─── Loaders ──────────────────────────────────────
  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const r = await api.get("/teacher/earnings/transactions", {
        params: {
          from: fromDate || undefined,
          to: toDate || undefined,
          page,
          limit: 20,
        },
      });
      setTransactions(r.data.data || []);
      setSummary(r.data.summary || null);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load transactions");
    } finally {
      setTxLoading(false);
    }
  }, [fromDate, toDate, page]);

  const loadPerProduct = useCallback(async () => {
    setPpLoading(true);
    try {
      const r = await api.get("/teacher/earnings/per-product", {
        params: { from: fromDate || undefined, to: toDate || undefined },
      });
      setPerProduct(r.data.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load breakdown");
    } finally {
      setPpLoading(false);
    }
  }, [fromDate, toDate]);

  const loadProducts = useCallback(async () => {
    setProdLoading(true);
    try {
      const r = await api.get("/teacher/earnings/products");
      setProducts(r.data.data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load products");
    } finally {
      setProdLoading(false);
    }
  }, []);

  const loadPayoutBalance = useCallback(async () => {
    try {
      const r = await api.get("/teacher/payouts/balance");
      setPayoutBalance(r.data.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadPayoutBalance();
  }, [loadPayoutBalance, payoutRefreshKey]);

  useEffect(() => {
    if (tab === "transactions") loadTransactions();
    else if (tab === "per-product") loadPerProduct();
    else if (tab === "commission") loadProducts();
  }, [tab, loadTransactions, loadPerProduct, loadProducts]);

  const applyFilters = () => {
    setPage(1);
    if (tab === "transactions") loadTransactions();
    else if (tab === "per-product") loadPerProduct();
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
    setTimeout(() => {
      if (tab === "transactions") loadTransactions();
      else if (tab === "per-product") loadPerProduct();
    }, 0);
  };

  const canWithdraw = (payoutBalance?.available || 0) >= MIN_WITHDRAW;
  const remainingToMin = Math.max(
    0,
    MIN_WITHDRAW - (payoutBalance?.available || 0)
  );

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          Money & payouts
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          Earnings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          See exactly what you earn — after coupons, platform fees, and
          affiliate commissions
        </p>
      </div>

      {/* ── Payout balance card ── */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 ${
          canWithdraw
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
            : "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md ${
                canWithdraw
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"
              }`}
            >
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p
                className={`text-base font-black ${
                  canWithdraw ? "text-emerald-900" : "text-slate-900"
                }`}
              >
                {canWithdraw
                  ? `Withdraw $${payoutBalance!.available.toFixed(2)}`
                  : "Available balance"}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  canWithdraw ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {canWithdraw
                  ? `Minimum $${MIN_WITHDRAW} · Paid within 1–3 business days`
                  : payoutBalance
                  ? `$${payoutBalance.available.toFixed(
                      2
                    )} available · $${remainingToMin.toFixed(
                      2
                    )} more to withdraw`
                  : "Loading..."}
              </p>
              {payoutBalance &&
                payoutBalance.alreadyAllocated > 0 && (
                  <p className="mt-1 text-[10px] text-slate-500">
                    ${payoutBalance.alreadyAllocated.toFixed(2)} already
                    requested or paid
                  </p>
                )}
            </div>
          </div>
          <Button
            onClick={() => setPayoutOpen(true)}
            disabled={!canWithdraw}
            className={`rounded-lg font-bold shadow-md ${
              canWithdraw
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700"
                : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
            }`}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Request payout
          </Button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <SummaryCard
            icon={DollarSign}
            label="Gross sales"
            value={`$${summary.grossRevenue.toFixed(2)}`}
            hint="Before discounts"
            gradient="from-slate-500 to-slate-600"
          />
          <SummaryCard
            icon={TicketPercent}
            label="Coupons"
            value={`-$${summary.totalCoupons.toFixed(2)}`}
            hint="Student savings"
            gradient="from-pink-500 to-rose-600"
          />
          <SummaryCard
            icon={Users}
            label="Paid by students"
            value={`$${summary.totalPaid.toFixed(2)}`}
            hint="After coupons"
            gradient="from-[#0177FB] to-[#0156C7]"
          />
          <SummaryCard
            icon={Percent}
            label="Platform fee"
            value={`-$${summary.totalPlatformFees.toFixed(2)}`}
            hint="10% of paid"
            gradient="from-slate-500 to-slate-600"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Affiliate"
            value={`-$${summary.totalAffiliateCommissions.toFixed(2)}`}
            hint="Paid to affiliates"
            gradient="from-violet-500 to-violet-600"
          />
          <SummaryCard
            icon={Wallet}
            label="You earn"
            value={`$${summary.netEarnings.toFixed(2)}`}
            hint="Net after all fees"
            gradient="from-emerald-500 to-emerald-600"
            highlight
          />
        </div>
      )}

      {/* ── Filters ── */}
      {tab !== "commission" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 rounded-lg"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={applyFilters}
                className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
              >
                Apply
              </Button>
              {(fromDate || toDate) && (
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {[
          { key: "transactions" as Tab, label: "Transactions", icon: DollarSign },
          { key: "per-product" as Tab, label: "Per product", icon: TrendingUp },
          { key: "commission" as Tab, label: "Commission", icon: Settings2 },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Transactions tab ── */}
      {tab === "transactions" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {txLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No transactions yet"
              desc="When students buy your courses, sales will appear here with the full earnings breakdown."
            />
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const key = `${tx.orderId}-${tx.productId}`;
                  const isExpanded = expandedRow === key;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : key)}
                        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50/50"
                      >
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {tx.thumbnailUrl ? (
                            <img
                              src={tx.thumbnailUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <DollarSign className="h-4 w-4 text-slate-300" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-bold text-slate-900">
                            {tx.productTitle}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {tx.buyerName || "Customer"} ·{" "}
                            {new Date(tx.paidAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-base font-black text-emerald-600 tabular-nums">
                            +${tx.netEarning.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            from ${tx.paidAmount.toFixed(2)}
                          </p>
                        </div>

                        <div className="shrink-0 text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                          <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Earnings breakdown
                          </p>
                          <div className="space-y-1.5 text-[12px]">
                            <BreakdownRow
                              label="List price"
                              value={`$${tx.grossAmount.toFixed(2)}`}
                            />
                            {tx.couponDiscount > 0 && (
                              <BreakdownRow
                                label="Coupon applied"
                                value={`-$${tx.couponDiscount.toFixed(2)}`}
                                negative
                              />
                            )}
                            <BreakdownRow
                              label="Student paid"
                              value={`$${tx.paidAmount.toFixed(2)}`}
                              bold
                              divider
                            />
                            <BreakdownRow
                              label="Platform fee (10%)"
                              value={`-$${tx.platformFee.toFixed(2)}`}
                              negative
                            />
                            {tx.affiliateCommission > 0 && (
                              <BreakdownRow
                                label="Affiliate commission"
                                value={`-$${tx.affiliateCommission.toFixed(2)}`}
                                negative
                              />
                            )}
                            <BreakdownRow
                              label="Your net earning"
                              value={`$${tx.netEarning.toFixed(2)}`}
                              bold
                              highlight
                              divider
                            />
                          </div>
                          <div className="mt-3">
                            <Link href={`/teacher/courses/${tx.productId}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg text-xs"
                              >
                                View course
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                    {total}
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
            </>
          )}
        </div>
      )}

      {/* ── Per product tab ── */}
      {tab === "per-product" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {ppLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
            </div>
          ) : perProduct.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No sales yet"
              desc="Per-product breakdown appears once you have sales."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/60">
                  <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Coupons</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Platform</th>
                    <th className="px-4 py-3 text-right">Affiliate</th>
                    <th className="px-4 py-3 text-right">You earn</th>
                  </tr>
                </thead>
                <tbody>
                  {perProduct.map((p) => (
                    <tr
                      key={p.productId}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                            {p.thumbnailUrl ? (
                              <img
                                src={p.thumbnailUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <DollarSign className="h-3 w-3 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-bold text-slate-900">
                              {p.title}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              ⭐ {(p.ratingAvg || 0).toFixed(1)} ·{" "}
                              {p.enrollmentCount || 0} students
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {p.sales}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        ${p.grossRevenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-rose-500">
                        -${p.totalCoupons.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        ${p.totalPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                        -${p.totalPlatformFees.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-violet-500">
                        -${p.totalAffiliateCommissions.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 tabular-nums">
                        ${p.netEarnings.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Commission tab ── */}
      {tab === "commission" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-start gap-2 border-b border-slate-100 bg-gradient-to-br from-amber-50/40 to-white p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Control how much affiliates earn
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {`Higher commission = more affiliates promoting your product.
                You keep 90% minus the affiliate's cut.`}
              </p>
            </div>
          </div>

          {prodLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Settings2}
              title="No products to configure"
              desc="Publish a course to make it promotable by affiliates."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {products.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50/50"
                >
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {p.thumbnailUrl ? (
                      <img
                        src={p.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <DollarSign className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">
                        {p.title}
                      </p>
                      {p.status === "published" && (
                        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      {p.commissionPolicy.enabled ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          {p.commissionPolicy.valueType === "percent"
                            ? `${p.commissionPolicy.value}% commission`
                            : `$${p.commissionPolicy.value} commission`}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                          Affiliate disabled
                        </span>
                      )}
                      {p.commissionPolicy.type === "recurring" && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 font-bold text-violet-700 ring-1 ring-inset ring-violet-200">
                          Recurring
                        </span>
                      )}
                      {p.oneTimePrice !== undefined && p.oneTimePrice > 0 && (
                        <span className="text-slate-500">
                          List price: ${p.oneTimePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-lg"
                    onClick={() => setEditing(p)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payout history ── */}
      <TeacherPayoutHistory refreshKey={payoutRefreshKey} />

      {/* ── Modals ── */}
      <CommissionEditModal
        product={editing}
        onClose={() => setEditing(null)}
        onSave={async (payload) => {
          if (!editing) return;
          try {
            await api.patch(
              `/teacher/earnings/products/${editing.productId}/commission`,
              payload
            );
            toast.success("Commission updated");
            setEditing(null);
            loadProducts();
          } catch (e: any) {
            toast.error(e?.response?.data?.message || "Failed to update");
          }
        }}
      />

      <WithdrawTeacherModal
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        availableAmount={payoutBalance?.available || 0}
        onSuccess={() => {
          setPayoutRefreshKey((k) => k + 1);
          loadPayoutBalance();
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════
function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
  gradient,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  gradient: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm ${
        highlight ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-200/80"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="mt-2 text-lg font-black tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {hint && <p className="mt-0.5 text-[9px] text-slate-400">{hint}</p>}
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  negative,
  bold,
  highlight,
  divider,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
  highlight?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        divider ? "border-t border-slate-200 pt-1.5" : ""
      } ${bold ? "font-bold" : ""}`}
    >
      <span className={highlight ? "text-emerald-700" : "text-slate-600"}>
        {label}
      </span>
      <span
        className={
          highlight
            ? "text-emerald-700 tabular-nums"
            : negative
            ? "text-rose-600 tabular-nums"
            : "text-slate-900 tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-3 text-base font-black text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{desc}</p>
    </div>
  );
}

function CommissionEditModal({
  product,
  onClose,
  onSave,
}: {
  product: ProductWithCommission | null;
  onClose: () => void;
  onSave: (payload: {
    enabled: boolean;
    type: "one_time" | "recurring";
    valueType: "percent" | "flat";
    value: number;
    duration: "lifetime" | "fixed_months";
    durationMonths?: number;
  }) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<"one_time" | "recurring">("one_time");
  const [valueType, setValueType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState(20);
  const [duration, setDuration] = useState<"lifetime" | "fixed_months">(
    "lifetime"
  );
  const [durationMonths, setDurationMonths] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!product) return;
    setEnabled(product.commissionPolicy.enabled);
    setType(product.commissionPolicy.type);
    setValueType(product.commissionPolicy.valueType);
    setValue(product.commissionPolicy.value);
    setDuration(product.commissionPolicy.duration);
    setDurationMonths(product.commissionPolicy.durationMonths || 3);
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        enabled,
        type,
        valueType,
        value,
        duration,
        ...(duration === "fixed_months" && { durationMonths }),
      });
    } finally {
      setSaving(false);
    }
  };

  const listPrice = product?.oneTimePrice || 0;
  const affiliateEarning =
    valueType === "percent" ? (listPrice * value) / 100 : value;
  const teacherEarning = listPrice - listPrice * 0.1 - affiliateEarning;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[#0177FB]" />
            Commission settings
          </DialogTitle>
          <DialogDescription>{product?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Enable affiliate program
              </p>
              <p className="text-[11px] text-slate-500">
                Let affiliates promote this product
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div>
                <Label className="text-xs">Commission type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger className="mt-1.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">
                      One-time (single sale)
                    </SelectItem>
                    <SelectItem value="recurring">
                      Recurring (subscription)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Value type</Label>
                  <Select
                    value={valueType}
                    onValueChange={(v) => setValueType(v as any)}
                  >
                    <SelectTrigger className="mt-1.5 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage</SelectItem>
                      <SelectItem value="flat">Flat amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">
                    {valueType === "percent" ? "Percent (%)" : "Amount ($)"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={valueType === "percent" ? 50 : undefined}
                    step={valueType === "percent" ? 1 : 0.01}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="mt-1.5 rounded-lg"
                  />
                </div>
              </div>

              {type === "recurring" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Duration</Label>
                    <Select
                      value={duration}
                      onValueChange={(v) => setDuration(v as any)}
                    >
                      <SelectTrigger className="mt-1.5 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lifetime">
                          Lifetime (until cancelled)
                        </SelectItem>
                        <SelectItem value="fixed_months">
                          Fixed months
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {duration === "fixed_months" && (
                    <div>
                      <Label className="text-xs">Months</Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={durationMonths}
                        onChange={(e) =>
                          setDurationMonths(Number(e.target.value))
                        }
                        className="mt-1.5 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {listPrice > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Per sale breakdown
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">List price</span>
                      <span className="font-semibold">
                        ${listPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Platform fee (10%)</span>
                      <span className="text-slate-600">
                        -${(listPrice * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Affiliate (
                        {valueType === "percent" ? `${value}%` : `$${value}`})
                      </span>
                      <span className="text-violet-600">
                        -${affiliateEarning.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                      <span className="text-emerald-700">You earn</span>
                      <span className="text-emerald-700">
                        ${Math.max(0, teacherEarning).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}