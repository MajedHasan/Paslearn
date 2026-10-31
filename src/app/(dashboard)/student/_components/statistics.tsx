"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Zap } from "lucide-react";
import { ActivityPoint } from "./activityChart";
import { ChartSkeleton } from "./skeletons";

export function Statistics({
  data,
  loading = false,
}: {
  data: ActivityPoint[];
  loading?: boolean;
}) {
  const hasData = data.some((d) => d.enrollments > 0);
  const currentMonth = data[data.length - 1]?.enrollments || 0;
  const peak = Math.max(...data.map((d) => d.enrollments), 0);

  return (
    <Card className="flex-1 overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF7E02] to-[#E66400] shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </span>
          Monthly Enrollments
        </CardTitle>
        <CardDescription className="mt-1 text-xs font-medium text-slate-500">
          Courses started each month
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <ChartSkeleton height="h-48" />
        ) : !hasData ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <p className="text-xs font-medium text-slate-500">No enrollments yet</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  This month
                </p>
                <p className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">
                  {currentMonth}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Peak
                </p>
                <p className="text-lg font-black text-slate-700 tabular-nums">{peak}</p>
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      fontSize: 11,
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                    cursor={{ fill: "#F1F5F9" }}
                  />
                  <Bar
                    dataKey="enrollments"
                    name="Enrolled"
                    fill="#0177FB"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}