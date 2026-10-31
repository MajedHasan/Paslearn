"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { ChartSkeleton } from "./skeletons";

export interface StatusCounts {
  notStarted: number;
  inProgress: number;
  completed: number;
}

const COLORS = {
  notStarted: "#CBD5E1",
  inProgress: "#0177FB",
  completed: "#10B981",
};

export function CourseActivities({
  counts,
  loading = false,
}: {
  counts: StatusCounts;
  loading?: boolean;
}) {
  const total = counts.notStarted + counts.inProgress + counts.completed;
  const hasData = total > 0;
  const completionPct = total > 0 ? Math.round((counts.completed / total) * 100) : 0;

  const data = [
    { name: "Not started", value: counts.notStarted, color: COLORS.notStarted },
    { name: "In progress", value: counts.inProgress, color: COLORS.inProgress },
    { name: "Completed", value: counts.completed, color: COLORS.completed },
  ].filter((d) => d.value > 0);

  return (
    <Card className="flex-1 overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <CardTitle className="flex items-center gap-2 text-base font-black text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
            <PieIcon className="h-4 w-4 text-white" />
          </span>
          Course Status
        </CardTitle>
        <CardDescription className="mt-1 text-xs font-medium text-slate-500">
          Distribution of your {total} course{total === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <ChartSkeleton height="h-48" />
        ) : !hasData ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <p className="text-xs font-medium text-slate-500">No courses yet</p>
          </div>
        ) : (
          <div className="flex h-48 flex-col">
            <div className="relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={48}
                    dataKey="value"
                    strokeWidth={3}
                    stroke="#fff"
                    paddingAngle={3}
                    cornerRadius={4}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      fontSize: 11,
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-slate-900 tabular-nums">
                  {completionPct}%
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Complete
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {data.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700"
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name} <span className="font-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}