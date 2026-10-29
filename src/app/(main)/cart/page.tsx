"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Loader2,
  Tag,
  X,
  BookOpen,
  Shield,
  Zap,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    type: string;
    priceModel: string;
    oneTimePrice?: number;
  } | string;
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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/cart");
      setCart(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
    try {
      await api.post("/cart/apply-coupon", { code });
      setCouponInput("");
      await load();
      toast.success("Coupon applied");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await api.delete("/cart/coupon");
      await load();
      toast.success("Coupon removed");
    } catch {
      toast.error("Failed to remove coupon");
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
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <X className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
          {`Couldn't load your cart`}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // ═══════════════ EMPTY ═══════════════
  if (isEmpty) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
          <ShoppingBag className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Discover courses, digital files, and coaching from world-class instructors.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/courses">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold shadow-lg shadow-indigo-500/25">
              <BookOpen className="mr-2 h-4 w-4" /> Browse courses
            </Button>
          </Link>
          <Link href="/my-courses">
            <Button variant="outline" className="rounded-xl">
              View my courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════ CART ═══════════════
  const hasDiscount = (cart?.coupon?.discountTotal || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-3 -ml-3 rounded-lg text-slate-600"
            onClick={() => router.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Shopping cart
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {items.length} {items.length === 1 ? "item" : "items"} · ready when you are
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* ══ Items column ══ */}
          <div className="space-y-3">
            {items.map((item) => {
              const product = typeof item.product === "object" ? item.product : null;
              const title = product?.title || "Untitled item";
              const typeLabel =
                item.productType === "course"
                  ? "Course"
                  : item.productType === "digital_file"
                  ? "Digital file"
                  : item.productType === "coaching"
                  ? "Coaching"
                  : item.productType === "platform_subscription"
                  ? "Subscription"
                  : "Addon";

              return (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20">
                      <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {typeLabel}
                          </span>
                          <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-white">
                            {title}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          disabled={removingId === item._id}
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                          aria-label="Remove from cart"
                        >
                          {removingId === item._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ${item.priceSnapshot.toFixed(2)}
                        </span>
                        {product?.priceModel === "free" && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <ChevronLeft className="h-4 w-4" /> Continue shopping
              </Link>
            </div>
          </div>

          {/* ══ Summary column ══ */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Order summary
              </h2>

              {/* Coupon */}
              <div className="mt-4">
                {cart?.coupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                        {cart.coupon.code}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">
                        −${cart.coupon.discountTotal.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      aria-label="Remove coupon"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      className="h-10 rounded-lg text-sm uppercase tracking-wide"
                    />
                    <Button
                      variant="outline"
                      className="h-10 rounded-lg px-4"
                      onClick={applyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                    >
                      {applyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${(cart?.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Discount
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      −${cart?.coupon?.discountTotal.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-base dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ${(cart?.total || 0).toFixed(2)}{" "}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {cart?.currency || "USD"}
                    </span>
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="mt-5 h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-base font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
                onClick={() => router.push("/checkout")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Proceed to checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Trust */}
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  30-day money-back guarantee
                </p>
                <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Instant access after payment
                </p>
              </div>

              {/* Payment methods */}
              <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-100 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <span>Visa</span>
                <span>·</span>
                <span>Mastercard</span>
                <span>·</span>
                <span>PayPal</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}