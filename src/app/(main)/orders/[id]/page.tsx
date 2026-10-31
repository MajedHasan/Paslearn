"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Loader2,
  X,
  XCircle,
  ArrowRight,
  BookOpen,
  PlayCircle,
  Receipt,
  Home,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 45; // 90 seconds

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [manualRefresh, setManualRefresh] = useState(0);

  const fetchOrder = useCallback(async () => {
    try {
      const r = await api.get(`/orders/${id}`);
      const o = r.data.data;
      setOrder(o);
      return o;
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load order");
      return null;
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    (async () => {
      const o = await fetchOrder();
      setLoading(false);
      if (o?.status === "paid") {
        // Fetch enrollments to build learning links
        try {
          const er = await api.get("/enrollments/my");
          setEnrollments(er.data.data || []);
        } catch {}
      }
    })();
  }, [fetchOrder, manualRefresh]);

  // Poll while pending
  useEffect(() => {
    if (!order || order.status !== "pending") return;
    if (pollTimedOut) return;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      while (!cancelled && attempts < POLL_MAX_ATTEMPTS) {
        attempts++;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (cancelled) return;

        // ⭐ Active verify — queries Stripe directly
        try {
          const vr = await api.post(`/orders/${id}/verify`);
          if (vr.data.data) {
            setOrder(vr.data.data);
            if (vr.data.data.status === "paid") {
              try {
                const er = await api.get("/enrollments/my");
                setEnrollments(er.data.data || []);
              } catch {}
              return;
            }
            if (vr.data.data.status !== "pending") return;
          }
        } catch {}

        // Fallback to GET
        const updated = await fetchOrder();
        if (updated && updated.status !== "pending") return;
      }
      if (!cancelled) setPollTimedOut(true);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [order?._id, order?.status, pollTimedOut, fetchOrder]);


  // Inside the paid branch, add a small effect
  useEffect(() => {
    if (order?.status === "paid") {
      // Notify other tabs/pages that cart has changed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart:cleared"));
      }
    }
  }, [order?.status]);


  // ═══════════════ LOADING ═══════════════
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // ═══════════════ NOT FOUND ═══════════════
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <XCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
          Order not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {`We couldn't find this order in your account.`}
        </p>
        <Link href="/student" className="mt-6 inline-block">
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
            My courses
          </Button>
        </Link>
      </div>
    );
  }

  // ═══════════════ PENDING ═══════════════
  if (order.status === "pending" && !pollTimedOut) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
            <Loader2 className="h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Confirming your payment
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {`This usually takes a few seconds. Please don't close this page.`}
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Order
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
            {order.orderNumber}
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════ TIMEOUT ═══════════════
  if (order.status === "pending" && pollTimedOut) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
          <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Still processing
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your payment is taking longer than usual. It will complete in the
          background — refresh in a minute to check.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
            onClick={async () => {
              try {
                const r = await api.post(`/orders/${id}/verify`);
                setOrder(r.data.data);
                if (r.data.data?.status === "paid") {
                  try {
                    const er = await api.get("/enrollments/my");
                    setEnrollments(er.data.data || []);
                  } catch {}
                }
                setPollTimedOut(false);
              } catch (e: any) {
                toast.error(e?.response?.data?.message || "Still pending");
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Verify now
          </Button>
          <Link href="/student">
            <Button variant="outline" className="rounded-xl">
              My courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════ FAILED ═══════════════
  if (order.status === "failed" || order.status === "cancelled") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <XCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Payment was {order.status}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {`You weren't charged. Your cart is still intact — try again whenever you're ready.`}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/checkout">
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              Try again
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" className="rounded-xl">
              Back to cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════ PAID ═══════════════
  // Build list of learning links for course items
  const learningLinks = (order.items || [])
    .filter((it: any) => it.productType === "course")
    .map((it: any) => {
      const enrollment = enrollments.find(
        (e) => String(e.course?._id) === String(it.refId)
      );
      return {
        item: it,
        slug: enrollment?.course?.slug,
        title: enrollment?.course?.title || "Course",
      };
    });

  const successEmoji = "🎉";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Success hero */}
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            You&apos;re in! {successEmoji}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Your payment was successful. Start learning immediately.
          </p>
        </div>

        {/* Order details */}
        <div className="mt-10 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Order number
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Date
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                {new Date(order.paidAt || order.createdAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" }
                )}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Purchased
            </p>
            <ul className="mt-3 space-y-2">
              {learningLinks.map((l: any, i:any) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {l.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Course
                      </p>
                    </div>
                  </div>
                  {l.slug && (
                    <Link href={`/student/learn/${l.slug}`}>
                      <Button
                        size="sm"
                        className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-md shadow-indigo-500/20"
                      >
                        <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                        Start
                      </Button>
                    </Link>
                  )}
                </li>
              ))}

              {/* Non-course items */}
              {order.items
                .filter((it: any) => it.productType !== "course")
                .map((it: any, i: number) => (
                  <li
                    key={`other-${i}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                        <Receipt className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {it.productType.replace("_", " ")}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Available in your library
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          {/* Total */}
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">
                  Discount
                  {order.coupon?.code && ` (${order.coupon.code})`}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  −${order.discountTotal.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Total paid</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${order.total.toFixed(2)}{" "}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {order.currency}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/student">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25">
              <BookOpen className="mr-2 h-4 w-4" />
              Go to my courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="rounded-xl">
              Continue shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="rounded-xl">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
        </div>

        {/* Support */}
        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          A receipt has been sent to your email. Questions? Contact support.
        </p>
      </div>
    </div>
  );
}