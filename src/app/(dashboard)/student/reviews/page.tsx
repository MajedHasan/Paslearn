"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  MessageSquare,
  Edit3,
  Trash2,
  Loader2,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  teacherReply?: {
    text: string;
    repliedAt: string;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string | null;
  } | null;
}

// ─────────────────────────────────────────────────────────
// Half-star picker
// ─────────────────────────────────────────────────────────
function HalfStarPicker({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const current = hover || value;

  const handleMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHover(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    const v = isLeftHalf ? starIndex - 0.5 : starIndex;
    onChange(Math.max(1, v));
    setHover(0);
  };

  return (
    <div
      className="flex items-center gap-1.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseMove={(e) => handleMove(e, s)}
          onClick={(e) => handleClick(e, s)}
          className="relative transition-transform hover:scale-110"
          style={{ width: size, height: size }}
          aria-label={`Rate ${s} stars`}
        >
          <Star
            className="absolute inset-0 text-slate-300"
            style={{ width: size, height: size }}
            strokeWidth={1.5}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              width:
                current >= s ? "100%" : current >= s - 0.5 ? "50%" : "0%",
            }}
          >
            <Star
              className="fill-amber-500 text-amber-500 drop-shadow-sm"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
          </div>
        </button>
      ))}
      {current > 0 && (
        <span className="ml-2 text-base font-black text-slate-700 tabular-nums">
          {current}/5
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Display-only stars (supports half)
// ─────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className="relative"
          style={{ width: size, height: size }}
        >
          <Star
            className="absolute inset-0 text-slate-200"
            style={{ width: size, height: size }}
            strokeWidth={1.5}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              width: rating >= s ? "100%" : rating >= s - 0.5 ? "50%" : "0%",
            }}
          >
            <Star
              className="fill-amber-500 text-amber-500"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [editReview, setEditReview] = useState<Review | null>(null);
  const [deleteReview, setDeleteReview] = useState<Review | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/reviews/my", { params: { page, limit } });
      setReviews(r.data.data || []);
      setTotal(r.data.total || 0);
      setTotalPages(r.data.totalPages || 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteReview) return;
    try {
      await api.delete(`/reviews/${deleteReview._id}`);
      toast.success("Review deleted");
      setDeleteReview(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  const handleUpdate = async (updated: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    if (!editReview) return;
    try {
      await api.patch(`/reviews/${editReview._id}`, updated);
      toast.success("Review updated");
      setEditReview(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          Your feedback
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          My Reviews
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {total === 0
            ? "Reviews you leave on completed courses appear here"
            : `${total} review${total === 1 ? "" : "s"} written · helping others learn`}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={() => setEditReview(review)}
                onDelete={() => setDeleteReview(review)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
                {total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium text-slate-700">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      <EditReviewModal
        review={editReview}
        onClose={() => setEditReview(null)}
        onSave={handleUpdate}
      />

      {/* Delete confirm modal */}
      <Dialog
        open={!!deleteReview}
        onOpenChange={(o) => !o && setDeleteReview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Delete this review?
            </DialogTitle>
            <DialogDescription>
              Your review of{" "}
              <strong className="text-slate-900">
                {deleteReview?.course?.title || "this course"}
              </strong>{" "}
              will be permanently removed. You can write a new review later if
              you change your mind.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setDeleteReview(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg"
              onClick={handleDelete}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Review card
// ─────────────────────────────────────────────────────────
function ReviewCard({
  review,
  onEdit,
  onDelete,
}: {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
        {/* Course thumbnail */}
        {review.course && (
          <Link
            href={`/student/learn/${review.course.slug}`}
            className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 sm:w-40"
          >
            {review.course.thumbnailUrl ? (
              <img
                src={review.course.thumbnailUrl}
                alt={review.course.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-8 w-8 text-slate-300" />
              </div>
            )}
          </Link>
        )}

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {review.course && (
                <Link
                  href={`/student/learn/${review.course.slug}`}
                  className="line-clamp-1 text-sm font-black text-slate-900 transition-colors hover:text-[#0177FB]"
                >
                  {review.course.title}
                </Link>
              )}
              <div className="mt-1.5 flex items-center gap-2">
                <StarDisplay rating={review.rating} size={14} />
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {review.rating}/5
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDistanceToNow(new Date(review.createdAt))} ago
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-500 hover:bg-[#0177FB]/10 hover:text-[#0177FB]"
                onClick={onEdit}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {review.title && (
            <p className="mt-3 text-sm font-bold text-slate-900">
              {review.title}
            </p>
          )}
          {review.comment && (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {review.comment}
            </p>
          )}

          {review.teacherReply && (
            <div className="mt-3 rounded-lg border-l-2 border-[#0177FB] bg-[#0177FB]/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#0177FB]">
                Instructor replied
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                {review.teacherReply.text}
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Verified purchase
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Edit modal
// ─────────────────────────────────────────────────────────
function EditReviewModal({
  review,
  onClose,
  onSave,
}: {
  review: Review | null;
  onClose: () => void;
  onSave: (updated: {
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setTitle(review.title || "");
      setComment(review.comment || "");
    }
  }, [review]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSaving(true);
    try {
      await onSave({ rating, title, comment });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!review} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit review</DialogTitle>
          <DialogDescription>
            {review?.course?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Rating
            </p>
            <HalfStarPicker
              value={rating}
              onChange={setRating}
              size={36}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Click the left half of a star for ½ point
            </p>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="mt-1 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Review (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you like? What could be better?"
              className="mt-1 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
              onClick={handleSubmit}
              disabled={saving || rating === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────
function EmptyReviews() {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
        <MessageSquare className="h-8 w-8 text-white" />
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        No reviews yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        Complete a course and share your honest feedback. It helps other
        students pick the right course.
      </p>
      <Link href="/student/courses">
        <Button className="mt-6 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-lg shadow-[#0177FB]/25">
          <Sparkles className="mr-2 h-4 w-4" /> Go to my courses
        </Button>
      </Link>
    </div>
  );
}