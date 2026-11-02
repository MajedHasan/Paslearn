// app/(dashboard)/marketing/coupons-discounts/_components/coupon-row.tsx
"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, ChevronUp, Copy, Check, Edit3, Trash2, TicketPercent,
  Percent, DollarSign, Gift, Loader2, Receipt, Mail, Globe, Layers,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { computeEffectiveStatus } from "./utils";
import type { Coupon, EffectiveStatus } from "./utils";

export type { Coupon, EffectiveStatus };

const STATUS_META: Record<EffectiveStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  scheduled: { label: "Scheduled", className: "bg-[#FF7E02]/10 text-[#E66400] ring-[#FF7E02]/30", dot: "bg-[#FF7E02]" },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  exhausted: { label: "Exhausted", className: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  disabled: { label: "Disabled", className: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
};

const TYPE_META: Record<string, { icon: any; label: string }> = {
  percentage: { icon: Percent, label: "Percentage" },
  fixed: { icon: DollarSign, label: "Fixed amount" },
  free: { icon: Gift, label: "Free (100%)" },
  free_shipping: { icon: TicketPercent, label: "Free shipping" },
  bogo: { icon: Gift, label: "Buy one get one" },
};

const ITEM_LABEL: Record<string, string> = {
  courses: "courses", digital: "digital files", coaching: "coaching",
};

function valueLabel(c: Coupon): string {
  if (c.type === "percentage") return `${c.value}% off`;
  if (c.type === "fixed") return `$${c.value.toFixed(2)} off`;
  if (c.type === "free") return "100% off";
  if (c.type === "free_shipping") return "Free shipping";
  if (c.type === "bogo") return "Buy 1 get 1 free";
  return "—";
}

function describeItems(c: Coupon): string {
  return (c.appliesTo.items || []).map((t) => ITEM_LABEL[t] || t).join(" & ") || "items";
}

function describeAppliesTo(c: Coupon): string {
  if (c.appliesTo.mode === "all") return `All ${describeItems(c)}`;
  if (c.appliesTo.mode === "selected") {
    const n = c.appliesTo.selectedIds.length;
    return `${n} specific item${n === 1 ? "" : "s"}`;
  }
  const n = c.appliesTo.categories.length;
  return `${n} categor${n === 1 ? "y" : "ies"}`;
}

function describeAudience(c: Coupon): string {
  if (c.targetUsers.mode === "selected") {
    const emails = c.targetUsers.userEmails || [];
    if (emails.length > 0) return `${emails.length} invited email${emails.length === 1 ? "" : "s"}`;
    const uids = c.targetUsers.userIds || [];
    return `${uids.length} selected user${uids.length === 1 ? "" : "s"}`;
  }
  if (c.targetUsers.mode === "group") return "Specific groups";
  return "All students";
}

function describeCountries(c: Coupon): string {
  if (!c.countries || c.countries.length === 0) return "Worldwide";
  if (c.countries.length <= 3) return c.countries.join(", ");
  return `${c.countries.slice(0, 3).join(", ")} +${c.countries.length - 3}`;
}

export function CouponRow({
  coupon, courses, onEdit, onDelete,
}: {
  coupon: Coupon;
  courses: any[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsLoaded, setRedemptionsLoaded] = useState(false);

  const effStatus = computeEffectiveStatus(coupon);
  const statusMeta = STATUS_META[effStatus];
  const typeMeta = TYPE_META[coupon.type] || TYPE_META.percentage;
  const TypeIcon = typeMeta.icon;

  const progress =
    coupon.usageLimit > 0 ? Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100) :
    coupon.usedCount > 0 ? 100 : 0;

  const loadRedemptions = useCallback(async () => {
    setRedemptionsLoading(true);
    try {
      const r = await api.get(`/coupons/${coupon._id}/redemptions`, { params: { limit: 5, page: 1 } });
      setRedemptions(r.data.data || []);
      setRedemptionsLoaded(true);
    } catch {
      setRedemptions([]);
    } finally {
      setRedemptionsLoading(false);
    }
  }, [coupon._id]);

  const handleToggle = () => {
    setExpanded((e) => {
      if (!e && !redemptionsLoaded) loadRedemptions();
      return !e;
    });
  };

  const copyCode = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(`"${coupon.code}" copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); onEdit(); };
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDelete(); };

  return (
    <div className="overflow-hidden">
      {/* ── MAIN ROW ── */}
      <div className="flex items-center gap-3 p-4 transition-colors hover:bg-slate-50/50">
        <button onClick={handleToggle} className="flex shrink-0 focus:outline-none" aria-label={expanded ? "Collapse" : "Expand"}>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${
              effStatus === "active" ? "from-emerald-500 to-emerald-600" :
              effStatus === "scheduled" ? "from-[#FF7E02] to-[#E66400]" :
              "from-slate-400 to-slate-500"
            } shadow-md`}
          >
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
        </button>

        <button onClick={handleToggle} className="min-w-0 flex-1 text-left focus:outline-none">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-black tracking-wide text-slate-900">
              {coupon.code}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${statusMeta.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
            {coupon.targetUsers.mode === "selected" && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                <Mail className="h-2.5 w-2.5" /> Invite only
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {coupon.description || `${valueLabel(coupon)} · ${describeAppliesTo(coupon)}`}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">{valueLabel(coupon)}</span>
            <span className="text-slate-300">·</span>
            <span>{describeAppliesTo(coupon)}</span>
            {coupon.minSpend && coupon.minSpend > 0 && (
              <><span className="text-slate-300">·</span><span>Min ${coupon.minSpend}</span></>
            )}
            {coupon.countries && coupon.countries.length > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Globe className="h-2.5 w-2.5" /> {describeCountries(coupon)}
                </span>
              </>
            )}
          </div>
        </button>

        <div className="hidden shrink-0 flex-col items-end sm:flex">
          <p className="text-sm font-black text-slate-900 tabular-nums">
            {coupon.usedCount}
            {coupon.usageLimit > 0 && (
              <span className="text-xs font-semibold text-slate-400"> / {coupon.usageLimit}</span>
            )}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            {coupon.usageLimit > 0 ? "Uses" : "Redemptions"}
          </p>
          {coupon.usageLimit > 0 && (
            <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${progress >= 100 ? "bg-violet-500" : "bg-gradient-to-r from-[#0177FB] to-[#0156C7]"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <div className="hidden shrink-0 text-right md:block">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Valid</p>
          <p className="text-[11px] font-semibold text-slate-700">
            {new Date(coupon.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} →{" "}
            {new Date(coupon.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>

        {/* ── INLINE ACTIONS — always visible ── */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={copyCode}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleEdit}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-[#0177FB]/10 hover:text-[#0177FB]"
            title="Edit coupon"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            title="Delete coupon"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleToggle}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title={expanded ? "Collapse" : "Expand details"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── EXPANDED DETAILS ── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => copyCode()}>
                  {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy code"}
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onEdit()}>
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => onDelete()}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <InfoRow label="Type" value={typeMeta.label} />
                <InfoRow label="Value" value={valueLabel(coupon)} />
                <InfoRow label="Items" value={<span className="inline-flex items-center gap-1"><Layers className="h-3 w-3 text-slate-400" />{describeAppliesTo(coupon)}</span>} />
                <InfoRow label="Audience" value={<span className="inline-flex items-center gap-1">{coupon.targetUsers.mode === "selected" && <Mail className="h-3 w-3 text-slate-400" />}{describeAudience(coupon)}</span>} />
                <InfoRow label="Countries" value={<span className="inline-flex items-center gap-1"><Globe className="h-3 w-3 text-slate-400" />{describeCountries(coupon)}</span>} />
                {coupon.minSpend && coupon.minSpend > 0 && <InfoRow label="Min spend" value={`$${coupon.minSpend}`} />}
                {coupon.maxDiscount && <InfoRow label="Max discount" value={`$${coupon.maxDiscount}`} />}
                <InfoRow
                  label="Per user limit"
                  value={coupon.perUserLimit > 0 ? `${coupon.perUserLimit} use${coupon.perUserLimit === 1 ? "" : "s"}` : "Unlimited"}
                />
                <InfoRow label="Created" value={`${formatDistanceToNow(new Date(coupon.createdAt))} ago`} />
              </div>

              {coupon.targetUsers.mode === "selected" && (coupon.targetUsers.userEmails?.length ?? 0) > 0 && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Invited emails</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {coupon.targetUsers.userEmails.slice(0, 8).map((e) => (
                      <span key={e} className="rounded-full bg-[#0177FB]/10 px-2 py-0.5 text-[10px] font-bold text-[#0177FB]">
                        {e}
                      </span>
                    ))}
                    {coupon.targetUsers.userEmails.length > 8 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        +{coupon.targetUsers.userEmails.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Recent redemptions</p>
              {redemptionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-[#0177FB]" />
                </div>
              ) : redemptions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white py-6 text-center">
                  <Receipt className="mx-auto h-6 w-6 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">No redemptions yet</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Share the code — uses will appear here</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {redemptions.map((r: any) => (
                    <div key={r._id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[10px] font-black text-white">
                        {(r.user?.name || r.userEmail || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-bold text-slate-900">
                          {r.user?.name || r.userEmail || "Student"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {r.order?.orderNumber || "—"} · {formatDistanceToNow(new Date(r.createdAt))} ago
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-black text-emerald-600 tabular-nums">−${r.discountAmount.toFixed(2)}</p>
                        {r.status === "reversed" && (
                          <p className="text-[9px] font-bold uppercase text-rose-500">Reversed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}