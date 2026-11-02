// app/(dashboard)/marketing/coupons-discounts/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  TicketPercent,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { CouponStats } from "./_components/coupon-stats";
import { CouponRow } from "./_components/coupon-row";
import { CouponModal } from "./_components/coupon-modal";
import { RedemptionsTab } from "./_components/redemptions-tab";
import { computeEffectiveStatus } from "./_components/utils";
import type { Coupon } from "./_components/utils";

type Tab = "coupons" | "redemptions";

export default function TeacherCouponsPage() {
  const [tab, setTab] = useState<Tab>("coupons");

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // ── Load courses for the modal ──
  useEffect(() => {
    (async () => {
      setCoursesLoading(true);
      try {
        const r = await api.get("/teacher/courses", {
          params: { limit: 200, state: "active" },
        });
        setCourses(r.data.data || []);
      } catch {
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    })();
  }, []);

  // ── Load ALL coupons once (needed for accurate stats) ──
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/coupons", { params: { limit: 500 } });
      setCoupons(r.data.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Client-side filter + paginate ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      if (statusFilter !== "all" && computeEffectiveStatus(c) !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (
        q &&
        !c.code.toLowerCase().includes(q) &&
        !(c.description || "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  // Clamp page if it becomes out of range
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // ── Stats ──
  const stats = useMemo(() => {
    const all = coupons.map((c) => ({
      status: computeEffectiveStatus(c),
      used: c.usedCount,
      limit: c.usageLimit,
    }));
    const totalUses = all.reduce((a, b) => a + b.used, 0);
    const totalCapacity = all.reduce(
      (a, b) => a + (b.limit > 0 ? b.limit : b.used),
      0
    );
    return {
      total: coupons.length,
      active: all.filter((c) => c.status === "active").length,
      scheduled: all.filter((c) => c.status === "scheduled").length,
      expired: all.filter(
        (c) => c.status === "expired" || c.status === "exhausted"
      ).length,
      redemptionRate:
        totalCapacity > 0 ? Math.round((totalUses / totalCapacity) * 100) : 0,
      totalUses,
    };
  }, [coupons]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/coupons/${deleting._id}`);
      toast.success("Coupon deleted — code freed for reuse");
      setDeleting(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0177FB]">
            Grow sales
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Coupons & Discounts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create promo codes your students can apply at checkout
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25 hover:from-[#0156C7] hover:to-[#014bb0]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create coupon
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
          <TabsTrigger value="coupons" className="gap-1.5">
            <TicketPercent className="h-3.5 w-3.5" />
            Coupons
            {coupons.length > 0 && (
              <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-700">
                {coupons.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Redemptions
          </TabsTrigger>
        </TabsList>

        {/* ═════════════ COUPONS TAB ═════════════ */}
        <TabsContent value="coupons" className="mt-4 space-y-4">
          <CouponStats
            total={stats.total}
            active={stats.active}
            scheduled={stats.scheduled}
            expired={stats.expired}
            redemptionRate={stats.redemptionRate}
            totalUses={stats.totalUses}
          />

          {/* Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupon codes..."
                className="h-10 rounded-lg pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="exhausted">Exhausted</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-full rounded-lg sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
                <SelectItem value="free">Free (100%)</SelectItem>
                <SelectItem value="bogo">Buy one get one</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
                  <AlertCircle className="h-7 w-7 text-rose-600" />
                </div>
                <p className="mt-3 text-sm font-bold text-rose-900">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-lg"
                  onClick={load}
                >
                  Try again
                </Button>
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState
                onCreate={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                hasAny={coupons.length > 0}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {paginated.map((c) => (
                  <CouponRow
                    key={c._id}
                    coupon={c}
                    courses={courses}
                    onEdit={() => {
                      setEditing(c);
                      setModalOpen(true);
                    }}
                    onDelete={() => setDeleting(c)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-4">
                <p className="text-xs text-slate-500">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)}{" "}
                  of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-8 rounded-lg px-2"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 rounded-lg px-2"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═════════════ REDEMPTIONS TAB ═════════════ */}
        <TabsContent value="redemptions" className="mt-4">
          <RedemptionsTab coupons={coupons} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <CouponModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setEditing(null);
        }}
        coupon={editing}
        courses={courses}
        coursesLoading={coursesLoading}
        onSaved={() => {
          load();
          setModalOpen(false);
          setEditing(null);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" />
              Delete coupon &ldquo;{deleting?.code}&rdquo;?
            </DialogTitle>
            <DialogDescription>
              Students who already used this coupon keep their discount. The
              code will be freed up so you can reuse it in a new coupon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setDeleting(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-lg"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({
  onCreate,
  hasAny,
}: {
  onCreate: () => void;
  hasAny: boolean;
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
        <TicketPercent className="h-8 w-8 text-white" />
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        {hasAny ? "No coupons match your filters" : "Create your first coupon"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {hasAny
          ? "Try a different status, type, or search term."
          : "Give students a reason to buy — run a launch sale, reward loyal customers, or partner with affiliates."}
      </p>
      {!hasAny && (
        <Button
          onClick={onCreate}
          className="mt-6 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-lg shadow-[#0177FB]/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create your first coupon
        </Button>
      )}
    </div>
  );
}