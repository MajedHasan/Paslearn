"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { ChartSkeleton } from "./skeletons";

export interface ActivityPoint {
  month: string;
  enrollments: number;
  completions: number;
}

export function ActivityChart({
  data,
  loading = false,
}: {
  data: ActivityPoint[];
  loading?: boolean;
}) {
  const hasData = data.some((d) => d.enrollments > 0 || d.completions > 0);

  // Compare last month to previous
  const lastTwo = data.slice(-2);
  const current = lastTwo[1]?.enrollments || 0;
  const previous = lastTwo[0]?.enrollments || 0;
  const trendPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  const isUp = trendPct >= 0;

  const totalEnrollments = data.reduce((a, d) => a + d.enrollments, 0);
  const totalCompletions = data.reduce((a, d) => a + d.completions, 0);

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
              <BarChart3 className="h-4 w-4 text-white" />
            </span>
            Learning Activity
          </CardTitle>
          <CardDescription className="mt-1 text-xs font-medium text-slate-500">
            Your enrollments and completions over the last 6 months
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#0177FB]" />
            <span className="text-[11px] font-bold text-slate-700">
              {totalEnrollments} enrolled
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#FF7E02]" />
            <span className="text-[11px] font-bold text-slate-700">
              {totalCompletions} completed
            </span>
          </div>
          {previous > 0 && (
            <div
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-sm ${
                isUp
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isUp ? "+" : ""}{trendPct}% vs last month
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <ChartSkeleton height="h-72" />
        ) : !hasData ? (
          <EmptyActivity />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0177FB" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0177FB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  labelStyle={{ fontWeight: 800, color: "#1E293B", marginBottom: 4 }}
                  cursor={{ stroke: "#CBD5E1", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  name="Enrolled"
                  stroke="#0177FB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0177FB", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#0177FB", strokeWidth: 3, stroke: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  name="Completed"
                  stroke="#FF7E02"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FF7E02", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#FF7E02", strokeWidth: 3, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyActivity() {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB]/10 to-[#0177FB]/5">
        <Activity className="h-7 w-7 text-[#0177FB]" />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-900">Your activity chart starts here</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">
        Every enrollment and completion will be tracked as you learn.
      </p>
    </div>
  );
}