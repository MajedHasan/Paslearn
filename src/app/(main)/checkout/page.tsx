// app/checkout/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Gift,
  Sparkles,
  PartyPopper,
  GraduationCap,
  FileText,
  Video,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getStoredReferralCode, clearReferralCode } from "@/lib/affiliate-tracking";

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

const TYPE_ICON: Record<string, any> = {
  course: GraduationCap,
  digital_file: FileText,
  coaching: Video,
  platform_subscription: Sparkles,
  addon: Gift,
};

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
        confirmParams: { return_url: `${window.location.origin}/orders/${orderId}` },
        redirect: "if_required",
      });
      if (error) {
        onError(error.message || "Payment failed");
        setProcessing(false);
        return;
      }
      try {
        await api.post(`/orders/${orderId}/verify`);
      } catch (e: any) {
        console.warn("Post-payment verify failed:", e?.message);
      }
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
        className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-base font-black shadow-lg shadow-[#0177FB]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay now
          </>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Shield className="h-3 w-3 text-emerald-500" />
        Secured by Stripe. Card info never touches our servers.
      </p>
    </form>
  );
}

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

  useEffect(() => {
    if (!cancelled) return;
    (async () => {
      try {
        const r = await api.get("/orders");
        const pending = (r.data.data || []).find((o: any) => o.status === "pending");
        if (pending) {
          await api.post(`/orders/${pending._id}/cancel`);
        }
      } catch (e: any) {
        console.warn("Could not clean up pending order:", e?.message);
      }
    })();
  }, [cancelled]);

  const handlePlaceOrder = async () => {
    if (!preview) return;
    setSubmitting(true);
    setPaymentError(null);
    try {
      const affiliateCode = getStoredReferralCode();
      const orderRes = await api.post("/orders", {
        affiliateCode: affiliateCode || undefined,
      });
      const order = orderRes.data.data;
      setOrderId(order._id);

      if (order.total === 0) {
        toast.success(
          preview.couponCode
            ? `Coupon ${preview.couponCode} applied — enrolled for free! 🎉`
            : "Enrolled — no payment needed 🎉",
          { duration: 4000 }
        );
        router.push(`/orders/${order._id}`);
        return;
      }

      const payRes = await api.post(`/orders/${order._id}/pay`, {
        provider,
        successUrl: `${window.location.origin}/orders/${order._id}`,
        cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
      });
      const payData = payRes.data.data;

      if (affiliateCode) clearReferralCode();
      window.dispatchEvent(new CustomEvent("cart:updated"));

      if (payData.clientSecret) {
        setClientSecret(payData.clientSecret);
      } else if (payData.approvalUrl) {
        window.location.href = payData.approvalUrl;
      } else {
        throw new Error("Payment initiated but no redirect was provided");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to place order";
      setPaymentError(msg);
      toast.error("Order couldn't be placed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════ LOADING ═══════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ ERROR ═══════════════
  if (error || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
          {`Couldn't start checkout`}
        </h1>
        <p className="mt-2 text-slate-500">{error || "Something went wrong"}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button
            className="rounded-xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25"
            onClick={loadPreview}
          >
            Try again
          </Button>
          <Link href="/cart">
            <Button variant="outline" className="rounded-xl">
              Back to cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = preview.discountTotal > 0;
  const isFree = preview.total === 0;
  const hasCoupon = !!preview.couponCode;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-3 -ml-3 rounded-lg text-slate-600 hover:text-slate-900"
            onClick={() => router.push("/cart")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to cart
          </Button>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#0177FB]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
                  Step 2 of 3
                </span>
                {hasDiscount && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    You&apos;re saving {preview.currency} {preview.discountTotal.toFixed(2)}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {isFree ? "Almost yours 🎉" : "Checkout"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isFree
                  ? "No payment needed — confirm and you're in."
                  : "Complete your purchase in under 30 seconds"}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                <Shield className="h-3.5 w-3.5" /> SSL secured
              </span>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-[#0177FB]/10 px-3 text-xs font-bold text-[#0177FB]">
                <Zap className="h-3.5 w-3.5" /> Instant access
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-700">Cart</span>
          </div>
          <div className="h-px flex-1 bg-emerald-300" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0177FB] text-[11px] font-bold text-white shadow-md shadow-[#0177FB]/25">
              2
            </div>
            <span className="font-bold text-slate-900">
              {isFree ? "Review" : "Checkout"}
            </span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-500">
              3
            </div>
            <span className="font-bold text-slate-500">Complete</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          {/* ══ LEFT ══ */}
          <div className="space-y-4">
            {cancelled && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-900">Payment was cancelled</p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {`No charge was made. Try again whenever you're ready.`}
                  </p>
                </div>
              </div>
            )}

            {/* ── FREE ORDER PANEL ── */}
            {!clientSecret && isFree && (
              <>
                <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-xl">
                  <div className="absolute -right-16 -top-16 h-56 w-56 animate-pulse rounded-full bg-emerald-400/20 blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 h-56 w-56 animate-pulse rounded-full bg-[#0177FB]/10 blur-3xl" />

                  <div className="relative text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40">
                      {hasCoupon ? <Gift className="h-10 w-10" /> : <PartyPopper className="h-10 w-10" />}
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-emerald-900">
                      {hasCoupon ? "100% off — fully covered" : "It's on the house"}
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800">
                      {hasCoupon ? (
                        <>
                          Coupon{" "}
                          <span className="rounded-md bg-white px-2 py-0.5 font-mono font-black text-emerald-700 shadow-sm">
                            {preview.couponCode}
                          </span>{" "}
                          covers the full amount. One click and you&apos;re in.
                        </>
                      ) : (
                        <>Your cart has no cost — everything in it is free. One click and you&apos;re in.</>
                      )}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Instant access
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                        <Shield className="h-3.5 w-3.5" /> No card required
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5" /> $0.00 due
                      </span>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold text-rose-900">Couldn&apos;t complete</p>
                      <p className="mt-0.5 text-xs text-rose-700">{paymentError}</p>
                    </div>
                  </div>
                )}

                <Button
                  className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-black shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enrolling…</>
                  ) : (
                    <><Gift className="mr-2 h-5 w-5" /> Claim it now<ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                <p className="text-center text-[11px] text-slate-500">
                  By completing, you agree to our{" "}
                  <Link href="/terms" className="font-semibold text-[#0177FB] hover:underline">Terms</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-semibold text-[#0177FB] hover:underline">Privacy Policy</Link>.
                </p>
              </>
            )}

            {/* ── PAID ORDER PANEL ── */}
            {!clientSecret && !isFree && (
              <>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900">
                    How would you like to pay?
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose a method below. All payments are encrypted.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setProvider("stripe")}
                      className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                        provider === "stripe"
                          ? "border-[#0177FB] bg-gradient-to-br from-[#0177FB]/5 to-white shadow-md shadow-[#0177FB]/10"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {provider === "stripe" && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[#0177FB]" />
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Card</p>
                        <p className="text-[11px] text-slate-500">
                          Visa, Mastercard, Amex
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setProvider("paypal")}
                      className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                        provider === "paypal"
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-md shadow-blue-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {provider === "paypal" && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-blue-600" />
                      )}
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">PayPal</p>
                        <p className="text-[11px] text-slate-500">Redirect to PayPal</p>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold text-rose-900">Payment failed</p>
                      <p className="mt-0.5 text-xs text-rose-700">{paymentError}</p>
                    </div>
                  </div>
                )}

                <Button
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-base font-black shadow-lg shadow-[#0177FB]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Preparing…
                    </>
                  ) : provider === "stripe" ? (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Continue to payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Continue with PayPal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}

            {/* ── Stripe Elements ── */}
            {clientSecret && orderId && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
                  <Lock className="h-4 w-4 text-[#0177FB]" />
                  Card details
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0177FB",
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

          {/* ══ RIGHT: Order summary ══ */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                  <BookOpen className="h-4 w-4 text-[#0177FB]" /> Order summary
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {preview.items.map((item, i) => {
                    const Icon = TYPE_ICON[item.productType] || BookOpen;
                    const title = typeof item.product === "object" && item.product?.title
                      ? item.product.title : "Item";
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB]/10 to-violet-500/10">
                          <Icon className="h-5 w-5 text-[#0177FB]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                          <p className="text-[11px] capitalize text-slate-500">
                            {item.productType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {item.discount > 0 && (
                            <p className="text-[10px] tabular-nums text-slate-400 line-through">
                              ${item.price.toFixed(2)}
                            </p>
                          )}
                          <p className={`text-sm font-black tabular-nums ${
                            item.finalPrice === 0 ? "text-emerald-600" : "text-slate-900"
                          }`}>
                            {item.finalPrice === 0 ? "Free" : `$${item.finalPrice.toFixed(2)}`}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ${preview.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2 py-1.5 text-sm">
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <TagIcon />
                        {preview.couponCode ? `Coupon ${preview.couponCode}` : "Discount"}
                      </span>
                      <span className="font-black tabular-nums text-emerald-700">
                        −${preview.discountTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-base font-black text-slate-900">Total</span>
                    {isFree ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 text-xl font-black text-white shadow-md shadow-emerald-500/25">
                        <Gift className="h-4 w-4" /> Free
                      </span>
                    ) : (
                      <span className="text-2xl font-black tabular-nums text-slate-900">
                        ${preview.total.toFixed(2)}
                        <span className="ml-1 text-xs font-semibold text-slate-500">{preview.currency}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    {isFree ? "No card required" : "30-day money-back guarantee"}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Instant access after checkout
                  </p>
                  <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-[#0177FB]" />
                    Takes less than 30 seconds
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    </svg>
  );
}