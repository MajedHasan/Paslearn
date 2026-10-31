"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Receipt,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: Array<{ productType: string }>;
}

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: any }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: Receipt,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: XCircle,
  },
};

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/orders");
        setOrders(r.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    return {
      total: orders.length,
      paid: paid.length,
      spent: paid.reduce((a, o) => a + o.total, 0),
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
          Purchase history
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {orders.length === 0
            ? "Your purchases will appear here"
            : `${stats.paid} completed · $${stats.spent.toFixed(2)} spent`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50/50 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-black text-slate-900">No orders yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            When you enroll in a course, your purchase will show up here.
          </p>
          <Link href="/courses">
            <Button className="mt-6 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-lg shadow-[#0177FB]/25">
              <Sparkles className="mr-2 h-4 w-4" /> Explore courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.pending;
            const StatusIcon = status.icon;
            return (
              <Link
                key={order._id}
                href={`/student/orders/${order._id}`}
                className="group block overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0177FB]/40 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs font-black text-slate-900">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${status.className}`}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 tabular-nums">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {order.currency}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}