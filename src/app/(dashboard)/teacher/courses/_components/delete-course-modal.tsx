"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle, Trash2, Archive, RotateCcw, Loader2, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface DeletionInfo {
  activeEnrollments: number;
  totalEnrollments: number;
  totalRevenue: number;
  status: string;
  deleted: boolean;
  deletedAt: string | null;
  mediaRetentionUntil: string | null;
  hardPurgedAt: string | null;
  canArchive: boolean;
  canDelete: boolean;
  canRestore: boolean;
  recommendedAction: "archive" | "delete" | "restore" | "none";
  retentionDays: number;
  message: string;
}

export function DeleteCourseModal({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  courseTitle: string;
  onDone: () => void;
}) {
  const [info, setInfo] = useState<DeletionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !courseId) return;
    setLoading(true);
    setInfo(null);
    (async () => {
      try {
        const r = await api.get(`/teacher/courses/${courseId}/deletion-info`);
        setInfo(r.data.data);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load");
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, courseId, onOpenChange]);

  const doAction = async (action: "archive" | "delete" | "restore") => {
    if (!courseId) return;
    setActionLoading(action);
    try {
      if (action === "archive") {
        await api.post(`/teacher/courses/${courseId}/archive`);
        toast.success("Course archived — students keep access");
      } else if (action === "delete") {
        const r = await api.post(`/teacher/courses/${courseId}/delete`, {
          reason: "Teacher requested",
        });
        const date = r.data?.data?.mediaRetentionUntil;
        toast.success(
          `Course deleted. Media retained until ${
            date ? new Date(date).toLocaleDateString() : "90 days from now"
          }.`,
          { duration: 8000 }
        );
      } else if (action === "restore") {
        await api.post(`/teacher/courses/${courseId}/restore`);
        toast.success("Course restored");
      }
      onOpenChange(false);
      onDone();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {info?.deleted ? "Course status" : `Delete "${courseTitle}"?`}
          </DialogTitle>
          <DialogDescription>
            {loading
              ? "Checking enrollment status..."
              : info?.message || "Choose what to do with this course."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : info ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs text-slate-500">Active students</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {info.activeEnrollments}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs text-slate-500">Lifetime revenue</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  ${info.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            {info.recommendedAction === "archive" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      {`Can't`} delete — {info.activeEnrollments} student
                      {info.activeEnrollments === 1 ? "" : "s"} still have access
                    </p>
                    <p className="mt-1 text-xs">
                      Deleting would break their access to content they paid for.
                      Archive instead — new sales stop, existing students keep access.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {info.recommendedAction === "delete" && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Permanent deletion after {info.retentionDays} days
                    </p>
                    <p className="mt-1 text-xs">
                      Course will be hidden immediately. All videos and files are
                      kept for {info.retentionDays} days so you can restore it.
                      After that, they are <strong>permanently deleted</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {info.recommendedAction === "restore" && info.mediaRetentionUntil && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      Media retention expires{" "}
                      {new Date(info.mediaRetentionUntil).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs">
                      Restore the course before this date to keep the videos and
                      files. After that, they are permanently removed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {info.canArchive && (
                <Button
                  className="rounded-xl bg-amber-600 hover:bg-amber-700"
                  onClick={() => doAction("archive")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "archive" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="mr-2 h-4 w-4" />
                  )}
                  Archive course {info.recommendedAction === "archive" ? "(recommended)" : ""}
                </Button>
              )}

              {info.canDelete && (
                <Button
                  variant="destructive"
                  className="rounded-xl"
                  onClick={() => doAction("delete")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "delete" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete course
                </Button>
              )}

              {info.canRestore && (
                <Button
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => doAction("restore")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "restore" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Restore course
                </Button>
              )}

              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}