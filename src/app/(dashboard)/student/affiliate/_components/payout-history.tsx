"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Mail,
  Building2,
  CreditCard,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

interface PayoutMethodDetails {
  paypalEmail?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  country?: string;
  swiftCode?: string;
  additionalNote?: string;
}

interface Payout {
  _id: string;
  method: "stripe" | "paypal" | "manual";
  amount: number;
  status: "requested" | "approved" | "paid" | "rejected";
  methodDetails?: PayoutMethodDetails;
  reason?: string;
  externalRef?: string;
  processedAt?: string;
  createdAt: string;
}

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: any }
> = {
  requested: {
    label: "Pending approval",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: XCircle,
  },
};

const METHOD_LABELS: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  manual: "Bank Transfer",
};

const METHOD_ICONS: Record<string, any> = {
  stripe: CreditCard,
  paypal: Mail,
  manual: Building2,
};

export function PayoutHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/affiliate/payouts", { params: { page, limit } });
      setPayouts(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch {
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (total === 0 && !loading) return null;

  const toggleRow = (id: string) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 shadow-sm">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">
              Withdrawal history
            </p>
            <p className="text-[11px] text-slate-500">
              {total} request{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#0177FB]" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {payouts.map((p) => {
                  const meta = STATUS_META[p.status] || STATUS_META.requested;
                  const StatusIcon = meta.icon;
                  const MethodIcon = METHOD_ICONS[p.method] || Wallet;
                  const rowOpen = !!expandedRows[p._id];
                  const d = p.methodDetails || {};
                  const hasDetails =
                    d.paypalEmail ||
                    d.bankName ||
                    d.accountNumber ||
                    d.country;

                  return (
                    <div
                      key={p._id}
                      className="overflow-hidden rounded-xl border border-slate-100 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => hasDetails && toggleRow(p._id)}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-slate-50/50"
                      >
                        {/* Status icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <StatusIcon className="h-4 w-4 text-slate-600" />
                        </div>

                        {/* Main info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <MethodIcon className="h-3 w-3 text-slate-400" />
                            <p className="text-xs font-bold text-slate-900">
                              {METHOD_LABELS[p.method] || p.method}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Requested{" "}
                            {formatDistanceToNow(new Date(p.createdAt))} ago
                            {p.processedAt && (
                              <>
                                {" "}
                                · Processed{" "}
                                {new Date(p.processedAt).toLocaleDateString()}
                              </>
                            )}
                          </p>
                          {p.reason && (
                            <p className="mt-0.5 text-[10px] italic text-rose-600">
                              {p.reason}
                            </p>
                          )}
                        </div>

                        {/* Amount + status */}
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black text-slate-900 tabular-nums">
                            ${p.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </div>

                        {hasDetails && (
                          <div className="shrink-0 text-slate-400">
                            {rowOpen ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Expanded details */}
                      {rowOpen && hasDetails && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                          <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Payout details
                          </p>
                          <div className="space-y-1.5 text-[11px]">
                            {d.accountHolderName && (
                              <DetailRow
                                label="Account holder"
                                value={d.accountHolderName}
                              />
                            )}
                            {d.paypalEmail && (
                              <DetailRow
                                label="PayPal email"
                                value={d.paypalEmail}
                              />
                            )}
                            {d.bankName && (
                              <DetailRow label="Bank" value={d.bankName} />
                            )}
                            {d.accountNumber && (
                              <DetailRow
                                label="Account"
                                value={`····${String(d.accountNumber).slice(
                                  -4
                                )}`}
                                mono
                              />
                            )}
                            {d.country && (
                              <DetailRow
                                label="Country"
                                value={d.country}
                                icon={Globe}
                              />
                            )}
                            {d.swiftCode && (
                              <DetailRow
                                label="SWIFT/BIC"
                                value={d.swiftCode}
                                mono
                              />
                            )}
                            {d.additionalNote && (
                              <DetailRow
                                label="Note"
                                value={d.additionalNote}
                                multiline
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">
                    Page {page} of {totalPages}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  multiline,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
  icon?: any;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-1 text-slate-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span
        className={`text-right font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        } ${multiline ? "max-w-[60%] whitespace-pre-line" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}