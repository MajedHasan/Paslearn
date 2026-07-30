"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  Clock,
  User,
  Globe,
} from "lucide-react";
import { ISubmission } from "@/types/forms/shared/submission";

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<ISubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/submissions/admin/${params.id}`);
      setSubmission(res.data?.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Submission not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) loadSubmission();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/submissions/admin/${params.id}/status`, {
        status: newStatus,
        notes: "",
      });
      toast.success("Status updated");
      loadSubmission();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Submission not found</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button
          onClick={() => router.push("/admin/submissions")}
          className="mt-4"
        >
          Back to Submissions
        </Button>
      </div>
    );
  }

  const meta = submission.meta || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/submissions")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {submission.formKey}
            </Badge>
            <Badge
              variant={
                submission.status === "new"
                  ? "default"
                  : submission.status === "reviewed"
                  ? "secondary"
                  : submission.status === "processed"
                  ? "outline"
                  : "destructive"
              }
            >
              {submission.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold mt-1">Submission Detail</h1>
        </div>
      </div>

      {/* Status update */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={submission.status}
              onValueChange={updateStatus}
              disabled={updating}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {updating && <span className="text-sm text-muted-foreground">Updating...</span>}
          </div>
        </CardContent>
      </Card>

      {/* Values */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Submitted Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(submission.values || {}).map(([key, value]) => (
              <div key={key} className="space-y-1 border-b pb-2">
                <p className="text-sm font-semibold text-slate-700">{key}</p>
                <p className="text-sm text-slate-600 break-words">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
            {Object.keys(submission.values || {}).length === 0 && (
              <p className="text-muted-foreground col-span-2">No field data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      {submission.files && submission.files.length > 0 && (
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submission.files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 border rounded-lg p-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">{file.fieldKey} – {file.mimeType}</p>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">URL:</span>
            <span>{meta.url || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Referrer:</span>
            <span>{meta.referrer || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">User Agent:</span>
            <span className="text-xs">{meta.userAgent || "—"}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Submitted: {new Date(submission.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Form Snapshot */}
      {submission.formSnapshot && (
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Form Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-semibold">Form Name</p>
                <p>{submission.formSnapshot.name}</p>
              </div>
              <div>
                <p className="font-semibold">Key</p>
                <p className="font-mono text-xs">{submission.formSnapshot.key}</p>
              </div>
              <div>
                <p className="font-semibold">Submit Button</p>
                <p>{submission.formSnapshot.meta?.submitButtonText || "Submit"}</p>
              </div>
              <div>
                <p className="font-semibold">Fields</p>
                <p>{submission.formSnapshot.fields?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}