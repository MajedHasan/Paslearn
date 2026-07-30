"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileText,
  Layers,
  MessageSquare,
  TrendingUp,
  BarChart3,
} from "lucide-react";

type Submission = {
  _id: string;
  form: any;
  formKey: string;
  values: Record<string, any>;
  status: "new" | "reviewed" | "processed" | "failed";
  createdAt: string;
};

type FormOption = {
  _id: string;
  name: string;
  key: string;
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [formFilter, setFormFilter] = useState<string>("all");
  const [forms, setForms] = useState<FormOption[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, formsRes] = await Promise.all([
        api.get("/submissions/admin"),
        api.get("/forms/admin"),
      ]);
      setSubmissions(subsRes.data?.data || []);
      const rawForms = formsRes.data?.data || [];
      setForms(
        rawForms.map((f: any) => ({ _id: f._id, name: f.name, key: f.key }))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Analytics
  const totalSubmissions = submissions.length;
  const todayDate = new Date().toDateString();
  const todaySubmissions = submissions.filter(
    (s) => new Date(s.createdAt).toDateString() === todayDate
  ).length;

  // Filtering (fixed: use form.key)
  const filtered =
    formFilter === "all"
      ? submissions
      : submissions.filter((s) => s.formKey === formFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Monitor all form responses and analytics.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSubmissions}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{forms.length}</p>
              <p className="text-sm text-muted-foreground">Forms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Responses</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {forms.map((f) => (
                  <SelectItem key={f._id} value={f.key}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-4 opacity-30" />
              <p className="text-lg font-medium">No submissions yet</p>
              <p className="text-sm">
                Once your forms receive responses, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Data Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-amber-600" />
                          </div>
                          {sub.formKey}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {Object.values(sub.values || {})
                            .slice(0, 2)
                            .map((v) => String(v))
                            .join(", ") || "—"}
                        </div>
                      </TableCell>
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/submissions/${sub._id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {/* Link to per-form analytics */}
                          {sub.form?._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/forms/${sub.form._id}/analytics`)
                              }
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}