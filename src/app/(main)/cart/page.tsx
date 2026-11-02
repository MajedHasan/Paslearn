// app/cart/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag, Trash2, ArrowRight, Loader2, Tag, X, BookOpen, Shield,
  Zap, ChevronLeft, Lock, Gift, AlertCircle, CheckCircle2, Sparkles,
  FileText, Video, GraduationCap, Clock, TrendingUp, PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface CartItem {
  _id: string;
  product: any;
  productType: string;
  priceSnapshot: number;
  tierId?: string;
}
interface CartData {
  items: CartItem[];
  subtotal: number;
  coupon: {
    couponId: string;
    code: string;
    discountTotal: number;
    discountByProduct?: Record<string, number>;
  } | null;
  total: number;
  currency: string;
}

const TYPE_META: Record<string, { label: string; icon: any; gradient: string }> = {
  course: { label: "Course", icon: GraduationCap, gradient: "from-[#0177FB] to-[#0156C7]" },
  digital_file: { label: "Digital file", icon: FileText, gradient: "from-emerald-500 to-teal-600" },
  coaching: { label: "Coaching", icon: Video, gradient: "from-violet-500 to-purple-600" },
  platform_subscription: { label: "Subscription", icon: Sparkles, gradient: "from-[#FF7E02] to-orange-600" },
  addon: { label: "Addon", icon: Gift, gradient: "from-slate-500 to-slate-700" },
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [justApplied, setJustApplied] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/cart", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      setCart(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onCartUpdate = () => load();
    window.addEventListener("cart:updated", onCartUpdate);
    return () => window.removeEventListener("cart:updated", onCartUpdate);
  }, [load]);
  useEffect(() => {
    const onCartCleared = () => load();
    window.addEventListener("cart:cleared", onCartCleared);
    return () => window.removeEventListener("cart:cleared", onCartCleared);
  }, [load]);

  const removeItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await api.delete(`/cart/items/${itemId}`);
      await load();
      toast.success("Removed from cart");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      await api.post("/cart/apply-coupon", { code });
      setCouponInput("");
      setJustApplied(true);
      await load();
      toast.success("Coupon applied 🎉", {
        description: `Code "${code}" is now active.`,
      });
      setTimeout(() => setJustApplied(false), 2500);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Coupon is invalid or not applicable to your cart";
      setCouponError(msg);
      setShakeKey((k) => k + 1);
      toast.error("Coupon couldn't be applied", { description: msg });
      inputRef.current?.focus();
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await api.delete("/cart/coupon");
      await load();
      setCouponError(null);
      toast.success("Coupon removed");
    } catch {
      toast.error("Failed to remove coupon");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
            <div className="h-[28rem] animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
          <X className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
          Couldn&apos;t load your cart
        </h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          onClick={load}
        >
          Try again
        </Button>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="relative mx-auto h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#0177FB]/20" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-xl shadow-[#0177FB]/30">
            <ShoppingBag className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Discover courses, digital files, and coaching from world-class instructors.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/courses">
            <Button className="h-11 rounded-xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <BookOpen className="mr-2 h-4 w-4" /> Browse courses
            </Button>
          </Link>
          <Link href="/my-courses">
            <Button variant="outline" className="h-11 rounded-xl">View my courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = (cart?.coupon?.discountTotal || 0) > 0;
  const isFree = (cart?.total || 0) === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50/60">
      <style jsx>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .coupon-shake { animation: shake 0.45s ease-in-out; }
        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .coupon-pop { animation: pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes slideDown {
          from { transform: translateY(-6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .savings-slide { animation: slideDown 0.35s ease-out; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Hero header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-3 -ml-3 rounded-lg text-slate-600 hover:text-slate-900"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Continue shopping
          </Button>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#0177FB]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
                  Step 1 of 3
                </span>
                {hasDiscount && (
                  <span className="savings-slide rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    Saving {cart?.currency} {cart?.coupon?.discountTotal.toFixed(2)}
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Your cart
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                {isFree ? "everything is free" : "ready when you are"}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                <Shield className="h-3.5 w-3.5" /> Secure checkout
              </span>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-[#0177FB]/10 px-3 text-xs font-bold text-[#0177FB]">
                <Zap className="h-3.5 w-3.5" /> Instant access
              </span>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-violet-50 px-3 text-xs font-bold text-violet-700">
                <Clock className="h-3.5 w-3.5" /> 30-day guarantee
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          {/* ══ Items ══ */}
          <div className="space-y-3">
            {items.map((item) => {
              const product = typeof item.product === "object" ? item.product : null;
              const title = product?.title || "Untitled item";
              const isItemFree = product?.priceModel === "free" || item.priceSnapshot === 0;
              const itemDiscount = cart?.coupon?.discountByProduct?.[String(product?._id || item.product)] || 0;
              const hasItemDiscount = itemDiscount > 0;
              const meta = TYPE_META[item.productType] || TYPE_META.course;
              const Icon = meta.icon;

              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                >
                  {hasItemDiscount && (
                    <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                      −{cart?.currency} {itemDiscount.toFixed(2)}
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} shadow-lg`}>
                      <Icon className="h-9 w-9 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 pr-16">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {meta.label}
                      </span>
                      <h3 className="mt-1.5 line-clamp-2 text-lg font-black leading-snug text-slate-900">
                        {title}
                      </h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        {isItemFree ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-700">
                            <Gift className="h-3.5 w-3.5" /> Free
                          </span>
                        ) : hasItemDiscount ? (
                          <>
                            <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
                              ${item.priceSnapshot.toFixed(2)}
                            </span>
                            <span className="text-xl font-black tabular-nums text-slate-900">
                              ${(item.priceSnapshot - itemDiscount).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-black tabular-nums text-slate-900">
                            ${item.priceSnapshot.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={removingId === item._id}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      aria-label="Remove from cart"
                    >
                      {removingId === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="pt-2">
              <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0177FB] hover:text-[#0156C7]">
                <ChevronLeft className="h-4 w-4" /> Keep shopping
              </Link>
            </div>
          </div>

          {/* ══ Summary ══ */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                  <ShoppingBag className="h-4 w-4 text-[#0177FB]" /> Order summary
                </h2>
              </div>

              <div className="p-6">
                {/* ── COUPON ── */}
                <div className="mb-5">
                  {cart?.coupon ? (
                    <div className={cn(
                      "relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4",
                      justApplied && "coupon-pop"
                    )}>
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
                      <div className="relative flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            Coupon active
                          </p>
                          <p className="font-mono text-sm font-black tracking-wider text-emerald-900">
                            {cart.coupon.code}
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="shrink-0 rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100"
                          aria-label="Remove coupon"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="relative mt-3 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2">
                        <span className="text-xs font-bold text-emerald-800">
                          <PartyPopper className="mr-1 inline h-3.5 w-3.5" />
                          You saved
                        </span>
                        <span className="text-lg font-black tabular-nums text-emerald-700">
                          {cart.currency} {cart.coupon.discountTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={cn("rounded-2xl border border-slate-200 bg-slate-50/60 p-4", couponError && "coupon-shake")} key={shakeKey}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#0177FB]" />
                        <p className="text-sm font-black text-slate-900">Have a coupon code?</p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Apply it now — you&apos;ll see the discount instantly.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <div className="relative flex-1">
                          <Tag className={cn(
                            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                            couponError ? "text-rose-500" : "text-slate-400"
                          )} />
                          <Input
                            ref={inputRef}
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              if (couponError) setCouponError(null);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                            placeholder="e.g. SAVE20"
                            className={cn(
                              "h-11 rounded-xl pl-10 font-mono uppercase tracking-wider",
                              couponError
                                ? "border-rose-400 bg-rose-50/50 text-rose-900 placeholder:text-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                : "border-slate-300 bg-white"
                            )}
                            aria-invalid={!!couponError}
                            aria-describedby={couponError ? "coupon-error" : undefined}
                          />
                        </div>
                        <Button
                          className="h-11 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 font-bold text-white hover:from-slate-800 hover:to-slate-600 disabled:opacity-50"
                          onClick={applyCoupon}
                          disabled={applyingCoupon || !couponInput.trim()}
                        >
                          {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                      {couponError && (
                        <div
                          id="coupon-error"
                          role="alert"
                          className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      ${(cart?.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <Tag className="h-3 w-3" /> Discount
                      </span>
                      <span className="font-bold tabular-nums text-emerald-600">
                        −${cart?.coupon?.discountTotal.toFixed(2)}
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
                        ${(cart?.total || 0).toFixed(2)}
                        <span className="ml-1 text-xs font-semibold text-slate-500">
                          {cart?.currency || "USD"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                {isFree ? (
                  <Button
                    className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-base font-black shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    onClick={() => router.push("/checkout")}
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Claim it for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-base font-black shadow-lg shadow-[#0177FB]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    onClick={() => router.push("/checkout")}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Continue to checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}

                {/* Trust */}
                <div className="mt-4 space-y-2">
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

                {!isFree && (
                  <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-100 pt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <span>Visa</span><span className="text-slate-300">·</span>
                    <span>Mastercard</span><span className="text-slate-300">·</span>
                    <span>PayPal</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}