"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Receipt,
  BookOpen,
  PlayCircle,
  Download,
} from "lucide-react";
import api from "@/lib/api";

interface OrderItem {
  _id: string;
  productType: string;
  refId: string;
  product?: any;
  finalPrice: number;
  priceSnapshot: number;
  discountShare: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  subtotal: number;
  discountTotal: number;
  createdAt: string;
  paidAt?: string;
  items: OrderItem[];
  coupon?: {
    code: string;
    appliedAmount: number;
  };
}

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    icon: Receipt,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    icon: XCircle,
  },
};

export default function StudentOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/orders/${id}`);
        setOrder(r.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Order not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
          <XCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
          {error || "Order not found"}
        </h1>
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          onClick={() => router.push("/student/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
        </Button>
      </div>
    );
  }

  const status = STATUS_META[order.status] || STATUS_META.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.push("/student/orders")}
          className="mb-4 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Order details
            </p>
            <h1 className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {new Date(order.paidAt || order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>

        {/* Items */}
        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Items
            </p>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <OrderItemRow key={item._id} item={item} orderStatus={order.status} />
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex items-center justify-between">
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
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
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
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push("/student/courses")}
          >
            <BookOpen className="mr-2 h-4 w-4" /> My courses
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl"
            onClick={() => router.push("/courses")}
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderItemRow({
  item,
  orderStatus,
}: {
  item: OrderItem;
  orderStatus: string;
}) {
  const [product, setProduct] = useState<any>(null);

  // For courses, fetch slug from public API
  useEffect(() => {
    if (item.productType !== "course") return;
    (async () => {
      try {
        // Try to fetch course by ID — falls back to generic title
        const r = await api.get(`/public/courses/${item.refId}`).catch(() => null);
        if (r?.data?.data) {
          setProduct(r.data.data);
        }
      } catch {}
    })();
  }, [item.productType, item.refId]);

  const isCourse = item.productType === "course";
  const title = product?.title || `${item.productType.replace("_", " ")}`;
  const slug = product?.slug;

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
          {isCourse ? (
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
            {item.productType.replace("_", " ")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          ${item.finalPrice.toFixed(2)}
        </p>
        {isCourse && slug && orderStatus === "paid" && (
          <Link href={`/student/learn/${slug}`}>
            <Button size="sm" className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600">
              <PlayCircle className="mr-1 h-3.5 w-3.5" /> Start
            </Button>
          </Link>
        )}
      </div>
    </li>
  );
}