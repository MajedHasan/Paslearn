"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Lock,
  Loader2,
  Shield,
  ArrowLeft,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PreviewData {
  items: Array<{
    product: any;
    productType: string;
    refId: string;
    price: number;
    discount: number;
    finalPrice: number;
  }>;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  couponCode?: string | null;
}

// ─────────────────────────────────────────────────────────
// Stripe Elements form
// ─────────────────────────────────────────────────────────
function StripePaymentForm({
  orderId,
  onError,
}: {
  orderId: string;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      // Success — webhook fires async, /orders/:id will poll
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      onError(err?.message || "Payment failed");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement onReady={() => setReady(true)} />
      <Button
        type="submit"
        disabled={!stripe || !ready || processing}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-base font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay now
          </>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Shield className="h-3 w-3 text-emerald-500" />
        Secured by Stripe. Card info never touches our servers.
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────
// Main checkout
// ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "true";

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState<"stripe" | "paypal">("stripe");
  const [submitting, setSubmitting] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/orders/preview");
      setPreview(r.data.data);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        // empty cart
        router.replace("/cart");
        return;
      }
      setError(e?.response?.data?.message || "Failed to load checkout");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    if (cancelled) {
      toast.info("Payment was cancelled. Your cart is still here.");
    }
  }, [cancelled]);

  const handlePlaceOrder = async () => {
    if (!preview) return;
    setSubmitting(true);
    setPaymentError(null);

    try {
      // 1. Create order
      const orderRes = await api.post("/orders");
      const order = orderRes.data.data;
      setOrderId(order._id);

      // 2. Free order — backend already marked it paid
      if (order.total === 0) {
        toast.success("Enrolled — no payment needed");
        router.push(`/orders/${order._id}`);
        return;
      }

      // 3. Initiate payment
      const payRes = await api.post(`/orders/${order._id}/pay`, {
        provider,
        successUrl: `${window.location.origin}/orders/${order._id}`,
        cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
      });

      const payData = payRes.data.data;

      if (payData.clientSecret) {
        // Stripe Elements flow
        setClientSecret(payData.clientSecret);
      } else if (payData.approvalUrl) {
        // Redirect flow (PayPal or Stripe subscription)
        window.location.href = payData.approvalUrl;
      } else {
        throw new Error("Payment initiated but no redirect was provided");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to place order";
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════ LOADING ═══════════════
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // ═══════════════ ERROR ═══════════════
  if (error || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
          {`Couldn't start checkout`}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error || "Something went wrong"}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={loadPreview}>
            Try again
          </Button>
          <Link href="/cart">
            <Button variant="ghost" className="rounded-xl">
              Back to cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = preview.discountTotal > 0;
  const isFree = preview.total === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-3 -ml-3 rounded-lg text-slate-600"
            onClick={() => router.push("/cart")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to cart
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Complete your purchase in seconds
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Cart</span>
          </div>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
              2
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Checkout</span>
          </div>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              3
            </div>
            <span className="font-semibold text-slate-500 dark:text-slate-400">Complete</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* ══ Left: payment method ══ */}
          <div className="space-y-6">
            {cancelled && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-300">
                    Payment was cancelled
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                    {`No charge was made. Try again whenever you're ready.`}
                  </p>
                </div>
              </div>
            )}

            {!clientSecret && (
              <>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Payment method
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    All payments are encrypted and secure.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => setProvider("stripe")}
                      className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        provider === "stripe"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      {provider === "stripe" && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-indigo-600" />
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                        <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Card
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Visa, Mastercard, Amex
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setProvider("paypal")}
                      className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        provider === "paypal"
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      {provider === "paypal" && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-blue-600" />
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          PayPal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Redirect to PayPal
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div>
                      <p className="font-bold text-rose-900 dark:text-rose-300">
                        Payment failed
                      </p>
                      <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">
                        {paymentError}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-base font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Preparing...
                    </>
                  ) : isFree ? (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Enroll free
                    </>
                  ) : provider === "stripe" ? (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Continue to payment
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Continue with PayPal
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Stripe Elements form */}
            {clientSecret && orderId && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">
                  Card details
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#4f46e5",
                        borderRadius: "12px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    orderId={orderId}
                    onError={(msg) => setPaymentError(msg)}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* ══ Right: order summary ══ */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Order summary
              </h2>

              {/* Items */}
              <ul className="mt-4 space-y-2.5">
                {preview.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {typeof item.product === "object" && item.product?.title
                          ? item.product.title
                          : "Item"}
                      </p>
                      <p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
                        {item.productType.replace("_", " ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {item.discount > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        ${item.finalPrice.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${preview.subtotal.toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Discount
                      {preview.couponCode && ` (${preview.couponCode})`}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      −${preview.discountTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-base dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${preview.total.toFixed(2)}{" "}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {preview.currency}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  30-day money-back guarantee
                </p>
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Instant access after payment
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}