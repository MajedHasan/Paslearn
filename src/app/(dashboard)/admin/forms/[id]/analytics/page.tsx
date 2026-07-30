"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
import { ISubmission } from "@/types/forms/shared/submission";

export default function FormAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch form detail
        const formRes = await api.get(`/forms/admin/${params.id}`);
        setForm(formRes.data?.data);

        // Fetch all submissions for this form (backend should filter by form key)
        const subsRes = await api.get(`/submissions/admin?formKey=${formRes.data?.data?.key}`);
        setSubmissions(subsRes.data?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load data");
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  // Computed analytics
  const total = submissions.length;
  const todayDate = new Date().toDateString();
  const todaySubmissions = submissions.filter(
    (s) => new Date(s.createdAt).toDateString() === todayDate
  ).length;

  // Weekly trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();
  const dailyCounts = last7Days.map((day) =>
    submissions.filter((s) => new Date(s.createdAt).toDateString() === day).length
  );

  // Status breakdown
  const statusCounts = {
    new: submissions.filter((s) => s.status === "new").length,
    reviewed: submissions.filter((s) => s.status === "reviewed").length,
    processed: submissions.filter((s) => s.status === "processed").length,
    failed: submissions.filter((s) => s.status === "failed").length,
  };

  // Top fields (most filled non-empty)
  const fieldFrequency: Record<string, number> = {};
  submissions.forEach((s) => {
    Object.entries(s.values || {}).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        fieldFrequency[key] = (fieldFrequency[key] || 0) + 1;
      }
    });
  });
  const topFields = Object.entries(fieldFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-6 text-center">
        <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Form not found</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/admin/forms")} className="mt-4">
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/forms")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{form.key}</Badge>
            {form.enabled ? (
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900">{form.name} – Analytics</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaySubmissions}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {total > 0 ? ((statusCounts.processed / total) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Processed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {submissions.length > 0
                  ? new Date(submissions[0].createdAt).toLocaleDateString()
                  : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Last Submission</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            7‑Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {dailyCounts.map((count, i) => {
              const max = Math.max(...dailyCounts, 1);
              const height = (count / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold">{count}</span>
                  <div
                    className="w-full bg-amber-200 rounded-t-md transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {last7Days[i].split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown & Top Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Fields</CardTitle>
          </CardHeader>
          <CardContent>
            {topFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
            <div className="space-y-3">
              {topFields.map(([key, count]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{key}</span>
                  <span className="text-sm text-muted-foreground">{count} responses</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.slice(0, 10).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No submissions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Preview</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.slice(0, 10).map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === "new"
                            ? "default"
                            : sub.status === "reviewed"
                            ? "secondary"
                            : sub.status === "processed"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {Object.values(sub.values || {}).slice(0, 2).join(", ") || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/submissions/${sub?._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}