// app/admin/review-moderation/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Star, Search, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  EyeOff, Eye, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MessageSquare, Flag, ShieldCheck, ExternalLink, PartyPopper, Clock,
  User, BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type ReviewTab = "all" | "visible" | "hidden" | "flagged" | "pending";

interface Reviewer {
  _id: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
}

interface CourseBrief {
  _id: string;
  title: string;
  slug: string;
  thumbnailMediaId?: any;
}

interface TeacherBrief {
  _id: string;
  name?: string;
  email?: string;
}

interface Review {
  _id: string;
  user: Reviewer | string;
  course: CourseBrief | string;
  teacher?: TeacherBrief | string;
  rating: number;
  title?: string;
  comment?: string;
  status: "visible" | "hidden" | "flagged" | "pending";
  flagReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  teacherReply?: { text: string; createdAt?: string } | null;
  createdAt: string;
  updatedAt?: string;
}

type ActionDialog =
  | { action: "hide"; review: Review }
  | { action: "show"; review: Review }
  | { action: "delete"; review: Review }
  | null;

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const TAB_LABEL: Record<ReviewTab, string> = {
  all: "All",
  visible: "Visible",
  hidden: "Hidden",
  flagged: "Flagged",
  pending: "Pending",
};

function getReviewer(r: Review): Reviewer {
  if (r.user && typeof r.user === "object") return r.user as Reviewer;
  return { _id: String(r.user) };
}

function getCourse(r: Review): CourseBrief | null {
  if (r.course && typeof r.course === "object") return r.course as CourseBrief;
  return null;
}

function getTeacher(r: Review): TeacherBrief | null {
  if (r.teacher && typeof r.teacher === "object") return r.teacher as TeacherBrief;
  return null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half = !filled && rating >= n - 0.5;
        return (
          <span key={n} className="relative inline-block h-3.5 w-3.5">
            <Star className="absolute inset-0 h-3.5 w-3.5 text-slate-200" />
            {filled && (
              <Star className="absolute inset-0 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            )}
            {half && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </span>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-[10px] font-bold tabular-nums text-slate-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════

function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
        .admin-shimmer { background: linear-gradient(90deg,#FEE9DE 0%,#FFF5EE 50%,#FEE9DE 100%); background-size: 1000px 100%; animation: adminShimmer 2s infinite linear; }
      `}</style>
      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading reviews…</p>
      </div>
      <div className="admin-shimmer h-28 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="admin-shimmer h-20 rounded-2xl" />)}
      </div>
      <div className="admin-shimmer h-14 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="admin-shimmer h-24 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminReviewModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ReviewTab>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasLoadedOnce = useRef(false);

  const [counts, setCounts] = useState({ all: 0, visible: 0, hidden: 0, flagged: 0, pending: 0 });

  const [actionDialog, setActionDialog] = useState<ActionDialog>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit, status: tab };
      if (debouncedSearch) params.search = debouncedSearch;

      const r = await api.get("/admin/review-moderation", {
        params,
        headers: { "Cache-Control": "no-store" },
      });
      setReviews(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, [tab, page, debouncedSearch, refreshKey]);

  const loadCounts = useCallback(async () => {
    try {
      const r = await api.get("/admin/review-moderation/counts", {
        headers: { "Cache-Control": "no-store" },
      });
      setCounts(r.data.data);
    } catch (e) {
      console.warn("[admin.review-moderation] counts failed:", e);
    }
  }, [refreshKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  useEffect(() => {
    if (page > totalPages && total > 0) setPage(totalPages);
  }, [page, totalPages, total]);

  const changeTab = (next: ReviewTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setExpandedId(null);
  };

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    loadCounts();
  };

  const openAction = (action: "hide" | "show" | "delete", review: Review) => {
    setActionDialog({ action, review });
    setActionReason("");
    setActionError(null);
  };

  const closeAction = () => {
    setActionDialog(null);
    setActionReason("");
    setActionError(null);
  };

  const executeAction = async () => {
    if (!actionDialog) return;
    const { action, review } = actionDialog;
    setActionError(null);
    setProcessing(true);

    try {
      if (action === "hide") {
        await api.patch(`/admin/review-moderation/${review._id}/hide`, {
          reason: actionReason.trim() || undefined,
        });
        toast.success("Review hidden from public view");
      } else if (action === "show") {
        await api.patch(`/admin/review-moderation/${review._id}/show`);
        toast.success("Review is now visible");
      } else {
        await api.delete(`/admin/review-moderation/${review._id}`);
        toast.success("Review permanently deleted");
      }
      closeAction();
      refreshAll();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Action failed";
      setActionError(msg);
      toast.error("Action failed", { description: msg });
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !hasLoadedOnce.current) return <ReviewsSkeleton />;

  if (error && !hasLoadedOnce.current) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
          <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
        </div>
        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">Couldn&apos;t load reviews</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
          onClick={refreshAll}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-5 py-2">
      {refreshing && (
        <div className="fixed right-6 top-20 z-50 flex items-center gap-2 rounded-full border border-[#FFE1C7] bg-white px-3 py-1.5 shadow-lg">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#EB5017]" />
          <span className="text-xs font-bold text-[#EB5017]">Refreshing…</span>
        </div>
      )}

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EB5017] via-[#D94512] to-[#B33A0F] p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Trust & safety</p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">Review moderation</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span>{counts.all} total reviews</span>
                {counts.flagged > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-black text-white backdrop-blur">
                    <Flag className="h-3 w-3" />
                    {counts.flagged} flagged
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={refreshAll}
            disabled={refreshing}
            className="h-11 rounded-lg bg-white/15 font-bold text-white backdrop-blur hover:bg-white/25"
          >
            <RefreshCw className={cn("mr-1.5 h-4 w-4", refreshing && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#EB5017]">
          Overview
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatMini icon={MessageSquare} label="All" count={counts.all} bg="bg-slate-100" fg="text-slate-600" active={tab === "all"} onClick={() => changeTab("all")} />
          <StatMini icon={Eye} label="Visible" count={counts.visible} bg="bg-[#E7F6EC]" fg="text-[#036B26]" active={tab === "visible"} onClick={() => changeTab("visible")} />
          <StatMini icon={EyeOff} label="Hidden" count={counts.hidden} bg="bg-[#FEF3F2]" fg="text-[#9E0A05]" active={tab === "hidden"} onClick={() => changeTab("hidden")} />
          <StatMini icon={Flag} label="Flagged" count={counts.flagged} bg="bg-[#FFF6E5]" fg="text-[#B54708]" active={tab === "flagged"} onClick={() => changeTab("flagged")} />
          <StatMini icon={Clock} label="Pending" count={counts.pending} bg="bg-[#E0EAFF]" fg="text-[#0177FB]" active={tab === "pending"} onClick={() => changeTab("pending")} />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by review text, course, or student…"
            className="h-10 rounded-lg pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
          {(["all", "visible", "hidden", "flagged", "pending"] as ReviewTab[]).map((k) => (
            <button
              key={k}
              onClick={() => changeTab(k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                tab === k
                  ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F] text-white shadow-md shadow-[#EB5017]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {TAB_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      {error && hasLoadedOnce.current && (
        <div className="flex items-center gap-2 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-2.5 text-xs text-[#9E0A05]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="outline" onClick={refreshAll} className="h-7 rounded-md border-[#FEE4E2]">
            Retry
          </Button>
        </div>
      )}

      {/* LIST */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEE9DE] to-[#FFD5A8] shadow-lg">
            <PartyPopper className="h-8 w-8 text-[#EB5017]" />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-900">
            {debouncedSearch ? "No reviews match your search" : `No ${TAB_LABEL[tab].toLowerCase()} reviews`}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {debouncedSearch
              ? "Try a different keyword or clear the search."
              : tab === "hidden"
              ? "Hidden reviews will appear here. Hide a review to remove it from public view."
              : tab === "flagged"
              ? "Flagged reviews will appear here. Nothing is flagged right now."
              : "Reviews will appear here as students submit them."}
          </p>
        </div>
      ) : (
        <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
          {reviews.map((r) => (
            <ReviewRow
              key={r._id}
              review={r}
              expanded={expandedId === r._id}
              onToggle={() => setExpandedId(expandedId === r._id ? null : r._id)}
              onHide={() => openAction("hide", r)}
              onShow={() => openAction("show", r)}
              onDelete={() => openAction("delete", r)}
            />
          ))}
        </div>
      )}

      {/* STICKY PAGINATION */}
      {total > 0 && (
        <div className="sticky bottom-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{startIdx}–{endIdx}</span> of{" "}
            <span className="font-bold text-slate-900">{total}</span> review{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || totalPages === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-bold tabular-nums text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 1}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ACTION DIALOG */}
      <ActionDialogModal
        dialog={actionDialog}
        onClose={closeAction}
        onConfirm={executeAction}
        reason={actionReason}
        setReason={setActionReason}
        error={actionError}
        processing={processing}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Stat mini
// ═══════════════════════════════════════════════════════════════

function StatMini({
  icon: Icon, label, count, bg, fg, active, onClick,
}: {
  icon: any; label: string; count: number; bg: string; fg: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
        active ? "border-[#EB5017]/50 ring-2 ring-[#EB5017]/15" : "border-slate-200/80"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", fg)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-black tabular-nums text-slate-900">{count}</p>
        <p className="text-xs font-bold text-[#667185]">{label}</p>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Review row
// ═══════════════════════════════════════════════════════════════

function ReviewRow({
  review, expanded, onToggle, onHide, onShow, onDelete,
}: {
  review: Review;
  expanded: boolean;
  onToggle: () => void;
  onHide: () => void;
  onShow: () => void;
  onDelete: () => void;
}) {
  const reviewer = getReviewer(review);
  const course = getCourse(review);
  const teacher = getTeacher(review);
  const hidden = review.status === "hidden";
  const flagged = review.status === "flagged";
  const pending = review.status === "pending";

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md",
      hidden ? "border-slate-300 bg-slate-50/50" : "border-slate-200/80 hover:border-slate-300"
    )}>
      <div className="flex flex-wrap items-start gap-3 p-4">
        {/* Reviewer */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-sm font-black text-white shadow-md">
          {(reviewer.name || "?").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-slate-900">{reviewer.name || "Anonymous"}</p>
            {hidden && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#9E0A05]">
                <EyeOff className="h-2.5 w-2.5" /> Hidden
            </span>
            )}
            {flagged && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E5] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#B54708]">
                <Flag className="h-2.5 w-2.5" /> Flagged
            </span>
            )}
            {pending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E0EAFF] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0177FB]">
                <Clock className="h-2.5 w-2.5" /> Pending
            </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#667185]">
            <Stars rating={review.rating} />
            {course && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <BookOpen className="h-3 w-3" /> {course.title}
                </span>
              </>
            )}
          </div>
          {(review.title || review.comment) && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-600">
              {review.title && <span className="font-bold text-slate-900">{review.title}: </span>}
              {review.comment || "(no comment)"}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {review.status === "visible" ? (
            <Button onClick={onHide} size="sm" variant="outline" className="h-9 rounded-lg border-[#FEE4E2] font-bold text-[#9E0A05] hover:bg-[#FEF3F2]">
                <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
            </Button>
            ) : (
            <Button onClick={onShow} size="sm" className="h-9 rounded-lg bg-[#E7F6EC] font-bold text-[#036B26] hover:bg-[#D3EEDD]">
                <Eye className="mr-1 h-3.5 w-3.5" /> Show
            </Button>
          )}
          <Button onClick={onDelete} size="sm" variant="ghost" className="h-9 rounded-lg text-slate-400 hover:bg-[#FEF3F2] hover:text-[#9E0A05]">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={onToggle}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50/50 to-white p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Review content
              </p>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                {review.title && (
                  <p className="text-sm font-black text-slate-900">{review.title}</p>
                )}
                <p className="whitespace-pre-line text-xs text-slate-700">
                  {review.comment || "(no comment)"}
                </p>
                {review.flagReason && (
                  <div className="rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2 text-[11px] text-[#9E0A05]">
                    <span className="font-black uppercase tracking-wider">Flag reason: </span>
                    {review.flagReason}
                  </div>
                )}
                {review.teacherReply?.text && (
                  <div className="rounded-lg border-l-2 border-[#0177FB] bg-[#0177FB]/5 p-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#0177FB]">
                      Teacher reply
                    </p>
                    <p className="mt-0.5 text-xs text-slate-700">{review.teacherReply.text}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#98A2B3]">
                Context
              </p>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                <InfoRow icon={User} label="Reviewer" value={reviewer.email || reviewer.name || "—"} />
                {course && (
                  <InfoRow
                    icon={BookOpen}
                    label="Course"
                    value={
                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-bold text-[#0177FB] hover:underline"
                      >
                        {course.title} <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    }
                  />
                )}
                {teacher && (
                  <InfoRow icon={ShieldCheck} label="Teacher" value={teacher.name || "—"} />
                )}
                <InfoRow
                  icon={Clock}
                  label="Posted"
                  value={new Date(review.createdAt).toLocaleString()}
                />
                {review.moderatedAt && (
                  <InfoRow
                    icon={ShieldCheck}
                    label="Moderated"
                    value={new Date(review.moderatedAt).toLocaleString()}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1 text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Action dialog
// ═══════════════════════════════════════════════════════════════

function ActionDialogModal({
  dialog, onClose, onConfirm, reason, setReason, error, processing,
}: {
  dialog: ActionDialog;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (v: string) => void;
  error: string | null;
  processing: boolean;
}) {
  const open = !!dialog;
  if (!dialog) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Review action</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const { action, review } = dialog;
  const reviewer = getReviewer(review);
  const course = getCourse(review);

  const config = {
    hide: {
      title: "Hide review",
      description: "The review stays in the database but is removed from public view. The student will no longer see it.",
      icon: EyeOff,
      iconBg: "bg-[#FEF3F2] text-[#9E0A05]",
      confirmLabel: "Hide review",
      confirmClass: "bg-[#9E0A05] hover:bg-[#7A0704] text-white",
    },
    show: {
      title: "Show review",
      description: "The review becomes visible to everyone again. Flag status is cleared.",
      icon: Eye,
      iconBg: "bg-[#E7F6EC] text-[#036B26]",
      confirmLabel: "Show review",
      confirmClass: "bg-[#036B26] hover:bg-[#024D1B] text-white",
    },
    delete: {
      title: "Delete review",
      description: "Permanently removes this review from the database. This cannot be undone.",
      icon: Trash2,
      iconBg: "bg-[#FEF3F2] text-[#9E0A05]",
      confirmLabel: "Delete permanently",
      confirmClass: "bg-[#9E0A05] hover:bg-[#7A0704] text-white",
    },
  }[action];

  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", config.iconBg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">{config.title}</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-slate-500">{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">By</span>
            <span className="font-semibold text-slate-900">{reviewer.name || "Anonymous"}</span>
          </div>
          {course && (
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="text-slate-500">Course</span>
              <span className="line-clamp-1 text-right font-semibold text-slate-900">{course.title}</span>
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-slate-500">Rating</span>
            <Stars rating={review.rating} />
          </div>
        </div>

        {action === "hide" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Reason <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Internal note about why this review was hidden…"
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
              autoFocus
            />
          </div>
        )}

        {action === "delete" && (
          <div className="rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
            <p className="font-bold">This is permanent.</p>
            <p className="mt-0.5 text-[11px]">The review will be removed from the database and the course&apos;s rating will recalculate.</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[#FEE4E2] bg-[#FEF3F2] p-2.5 text-xs text-[#9E0A05]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="rounded-lg" onClick={onClose} disabled={processing}>Cancel</Button>
          <Button
            className={cn("rounded-lg font-bold shadow-md", config.confirmClass)}
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</> : <><Icon className="mr-1.5 h-4 w-4" /> {config.confirmLabel}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}