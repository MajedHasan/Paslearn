"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Star,
  CheckCircle2,
  Sparkles,
  Trophy,
  ExternalLink,
  BookOpen,
  Loader2,
  MessageSquare,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: any;
  focusSection?: "certificate" | "review" | null;
  onReviewSubmitted: () => void;
  onCertificateIssued: () => void;
}

function fmtHours(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CompletionModal({
  open,
  onOpenChange,
  view,
  focusSection,
  onReviewSubmitted,
  onCertificateIssued,
}: CompletionModalProps) {
  const { course, enrollment, certificate, review } = view;

  const [certIssued, setCertIssued] = useState(certificate?.issued || false);
  const [certSlug, setCertSlug] = useState<string | null>(
    certificate?.verificationSlug || null
  );
  const [certNumber, setCertNumber] = useState<string | null>(
    certificate?.certificateNumber || null
  );
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(review?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState(review?.title || "");
  const [reviewComment, setReviewComment] = useState(review?.comment || "");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewExists, setReviewExists] = useState(review?.exists || false);

  // ── Sync parent state ─────────────────────────────────
  useEffect(() => {
    setCertIssued(certificate?.issued || false);
    setCertSlug(certificate?.verificationSlug || null);
    setCertNumber(certificate?.certificateNumber || null);
    setReviewExists(review?.exists || false);
    if (review?.rating) setRating(review.rating);
    if (review?.title) setReviewTitle(review.title);
    if (review?.comment) setReviewComment(review.comment);
  }, [certificate, review]);

  // ── Scroll to focused section on open ─────────────────
  useEffect(() => {
    if (!open || !focusSection) return;
    const id = `completion-section-${focusSection}`;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [open, focusSection]);

  const claimCertificate = async () => {
    setClaiming(true);
    setClaimError(null);
    try {
      const r = await api.post(`/certificates/courses/${course._id}/request`);
      const cert = r.data?.data;
      if (cert) {
        setCertIssued(true);
        setCertSlug(cert.verificationSlug);
        setCertNumber(cert.certificateNumber);
        toast.success("🎉 Certificate claimed!");
        onCertificateIssued();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to claim certificate";
      setClaimError(msg);
      toast.error(msg);
    } finally {
      setClaiming(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/courses/${course._id}/reviews`, {
        rating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim() || undefined,
      });
      setReviewExists(true);
      toast.success("Thanks for the review! 💙");
      onReviewSubmitted();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const canClaim =
    !certIssued && certificate?.canClaim && course.certificateEnabled;
  const canReview = !reviewExists && review?.canReview;


  // ⭐ Half-star support
  const handleStarHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const handleStarClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    // Enforce minimum 1 star (matches backend `min: 1`)
    setRating(Math.max(1, newRating));
  };
    

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-lg [&>button]:hidden">
        <DialogTitle className="sr-only">
          You completed {course.title}
        </DialogTitle>

        {/* ── Celebration hero ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0177FB] via-[#0156C7] to-[#014bb0] p-8 text-center text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FF7E02]/20 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20 backdrop-blur-sm">
              <Trophy className="h-10 w-10 text-yellow-300" />
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              You did it! 🎉
            </h2>
            <p className="mt-2 text-sm text-white/85">
              You finished <strong className="font-bold">{course.title}</strong>
            </p>

            <div className="mt-5 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-black tabular-nums">
                  {enrollment.lessonsCompleted}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Lessons
                </p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black tabular-nums">
                  {fmtHours(course.totalDurationSec)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Content
                </p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black tabular-nums">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="space-y-4 p-6">
          {/* ═══ CERTIFICATE SECTION ═══ */}
          {course.certificateEnabled && (
            <div
              id="completion-section-certificate"
              className="scroll-mt-4 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-yellow-50/40 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-md shadow-amber-500/30">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-slate-900">
                      Certificate of completion
                    </p>
                    {certIssued && (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {certIssued
                      ? "Download or share your achievement"
                      : "Claim your official certificate"}
                  </p>

                  {certNumber && (
                    <p className="mt-1 font-mono text-[10px] text-slate-500">
                      #{certNumber}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {certIssued && certSlug ? (
                      <>
                        <Link
                          href={`/student/certificates/${certSlug}`}
                          target="_blank"
                        >
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600"
                          >
                            <ExternalLink className="mr-1.5 h-3 w-3" />
                            View certificate
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg border-amber-300 text-xs font-bold text-amber-700 hover:bg-amber-50"
                          onClick={() => {
                            const url = `${window.location.origin}/student/certificates/${certSlug}`;
                            if (navigator.share) {
                              navigator.share({
                                title: "My certificate",
                                url,
                              });
                            } else {
                              navigator.clipboard.writeText(url);
                              toast.success("Link copied!");
                            }
                          }}
                        >
                          <Share2 className="mr-1.5 h-3 w-3" />
                          Share
                        </Button>
                      </>
                    ) : canClaim ? (
                      <Button
                        size="sm"
                        onClick={claimCertificate}
                        disabled={claiming}
                        className="h-8 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Award className="mr-1.5 h-3 w-3" />
                            Claim certificate
                          </>
                        )}
                      </Button>
                    ) : (
                      <p className="text-[11px] font-medium text-amber-700">
                        {claimError ||
                          "Certificate will be available shortly"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ REVIEW SECTION ═══ */}
          {reviewExists ? (
            <div
                id="completion-section-review"
                className="scroll-mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
            >
                <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-black text-slate-900">
                    Your review is live
                </p>
                </div>

                <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                    const r = review?.rating || rating;
                    return (
                    <div key={s} className="relative h-4 w-4">
                        <Star
                        className="absolute inset-0 h-4 w-4 text-slate-200"
                        strokeWidth={1.5}
                        />
                        <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                            width: r >= s ? "100%" : r >= s - 0.5 ? "50%" : "0%",
                        }}
                        >
                        <Star
                            className="h-4 w-4 fill-amber-500 text-amber-500"
                            strokeWidth={1.5}
                        />
                        </div>
                    </div>
                    );
                })}
                <span className="ml-1 text-xs font-bold text-slate-600">
                    {(review?.rating || rating)}/5
                </span>
                </div>

                {(review?.comment || reviewComment) && (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {review?.comment || reviewComment}
                </p>
                )}
                <p className="mt-2 text-[11px] text-slate-500">
                Thanks for helping others discover this course 💙
                </p>
            </div>
            ) : canReview ? (
            <div
                id="completion-section-review"
                className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
                <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0177FB]" />
                <p className="text-sm font-black text-slate-900">
                    Rate this course
                </p>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                Hover and click the left half of a star for ½ point
                </p>

                {/* ⭐ Half-star picker */}
                <div
                className="mt-3 flex items-center gap-1.5"
                onMouseLeave={() => setHoverRating(0)}
                >
                {[1, 2, 3, 4, 5].map((s) => {
                    const current = hoverRating || rating;
                    return (
                    <button
                        key={s}
                        type="button"
                        onMouseMove={(e) => handleStarHover(e, s)}
                        onClick={(e) => handleStarClick(e, s)}
                        className="relative h-9 w-9 transition-transform hover:scale-110"
                        aria-label={`Rate ${s} stars`}
                    >
                        {/* Empty star base */}
                        <Star
                        className="absolute inset-0 h-9 w-9 text-slate-300"
                        strokeWidth={1.5}
                        />
                        {/* Filled overlay — clipped to 0%, 50%, or 100% */}
                        <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                            width:
                            current >= s
                                ? "100%"
                                : current >= s - 0.5
                                ? "50%"
                                : "0%",
                        }}
                        >
                        <Star
                            className="h-9 w-9 fill-amber-500 text-amber-500 drop-shadow-sm"
                            strokeWidth={1.5}
                        />
                        </div>
                    </button>
                    );
                })}
                {(hoverRating || rating) > 0 && (
                    <span className="ml-2 text-base font-black text-slate-700 tabular-nums">
                    {hoverRating || rating}/5
                    </span>
                )}
                </div>

                <Input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience (optional)"
                className="mt-3 rounded-lg text-xs"
                />
                <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you like? What could be better? (optional)"
                rows={2}
                className="mt-2 rounded-lg text-xs"
                />

                <Button
                onClick={submitReview}
                disabled={submittingReview || rating === 0}
                className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-xs font-bold shadow-md"
                >
                {submittingReview ? (
                    <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                    </>
                ) : (
                    <>
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Submit review
                    </>
                )}
                </Button>
            </div>
            ) : null}

          {/* ═══ WHAT'S NEXT ═══ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0177FB]" />
              <p className="text-sm font-black text-slate-900">{`What's next?`}</p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-slate-200 text-xs font-semibold hover:border-[#0177FB] hover:bg-[#0177FB]/5"
                >
                  <BookOpen className="mr-2 h-4 w-4 text-[#0177FB]" />
                  Browse more courses
                </Button>
              </Link>
              <Link href="/student/courses">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg border-slate-200 text-xs font-semibold hover:border-[#0177FB] hover:bg-[#0177FB]/5"
                >
                  <Trophy className="mr-2 h-4 w-4 text-[#0177FB]" />
                  View my library
                </Button>
              </Link>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-lg bg-slate-900 font-bold text-white hover:bg-slate-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}