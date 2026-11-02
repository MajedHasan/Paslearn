// app/(dashboard)/marketing/coupons-discounts/_components/coupon-stats.tsx
"use client";

import {
  TicketPercent,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

export function CouponStats({
  total,
  active,
  scheduled,
  expired,
  redemptionRate,
  totalUses,
}: {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  redemptionRate: number;
  totalUses: number;
}) {
  const cards = [
    {
      icon: TicketPercent,
      label: "Total coupons",
      value: total.toString(),
      hint: `${totalUses} total redemption${totalUses === 1 ? "" : "s"}`,
      gradient: "from-[#0177FB] to-[#0156C7]",
    },
    {
      icon: CheckCircle2,
      label: "Active",
      value: active.toString(),
      hint: "Ready to use now",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Clock,
      label: "Scheduled",
      value: scheduled.toString(),
      hint: "Starts in the future",
      gradient: "from-[#FF7E02] to-[#E66400]",
    },
    {
      icon: TrendingUp,
      label: "Redemption rate",
      value: `${redemptionRate}%`,
      hint: expired > 0 ? `${expired} expired` : "Uses / capacity",
      gradient: "from-violet-500 to-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} shadow-md`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {c.value}
            </p>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {c.label}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{c.hint}</p>
          </div>
        );
      })}
    </div>
  );
}