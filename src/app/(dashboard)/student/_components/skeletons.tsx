"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton({ height = "h-72" }: { height?: string }) {
  return (
    <div className={`${height} w-full animate-pulse rounded-xl bg-gradient-to-br from-slate-100 to-slate-50`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-slate-100" />
      <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <div className="aspect-video animate-pulse bg-slate-100" />
      <CardContent className="p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-slate-100" />
      </CardContent>
    </Card>
  );
}

export function ProgressRowSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}