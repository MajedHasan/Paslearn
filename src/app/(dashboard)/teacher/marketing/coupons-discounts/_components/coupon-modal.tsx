// app/(dashboard)/marketing/coupons-discounts/_components/coupon-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Percent, DollarSign, Gift, Loader2, CheckCircle2, Wand2, BookOpen,
  Search, AlertCircle, Package, Layers, Globe, Users, Mail, X, FileText,
  Video, Zap, Sparkles, Calendar, Clock, Users2, Tag, Eye,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Coupon } from "./utils";

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const TYPES = [
  { value: "percentage", label: "Percentage", icon: Percent, hint: "20% off", color: "from-[#0177FB] to-[#0156C7]" },
  { value: "fixed", label: "Fixed amount", icon: DollarSign, hint: "$10 off", color: "from-emerald-500 to-teal-600" },
  { value: "free", label: "Free", icon: Gift, hint: "100% off", color: "from-violet-500 to-purple-600" },
  { value: "bogo", label: "Buy 1, get 1", icon: Package, hint: "Cheapest free", color: "from-[#FF7E02] to-orange-600" },
] as const;

type FormType = (typeof TYPES)[number]["value"];
type ItemType = "courses" | "digital" | "coaching";

const ITEM_TYPES: { value: ItemType; label: string; icon: any; productType: string }[] = [
  { value: "courses", label: "Courses", icon: BookOpen, productType: "course" },
  { value: "digital", label: "Digital files", icon: FileText, productType: "digital_file" },
  { value: "coaching", label: "Coaching", icon: Video, productType: "coaching" },
];

// ⭐ Country list — flag emoji derived from code
const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" }, { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" }, { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" }, { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }, { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" }, { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" }, { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" }, { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" }, { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" }, { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" }, { code: "PL", name: "Poland" },
  { code: "GR", name: "Greece" }, { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" }, { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" }, { code: "CO", name: "Colombia" },
  { code: "IN", name: "India" }, { code: "BD", name: "Bangladesh" },
  { code: "PK", name: "Pakistan" }, { code: "NP", name: "Nepal" },
  { code: "LK", name: "Sri Lanka" }, { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" }, { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" }, { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" }, { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" }, { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" }, { code: "TW", name: "Taiwan" },
  { code: "AE", name: "United Arab Emirates" }, { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" }, { code: "KW", name: "Kuwait" },
  { code: "IL", name: "Israel" }, { code: "TR", name: "Turkey" },
  { code: "EG", name: "Egypt" }, { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" }, { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
];

const POPULAR_COUNTRIES = ["US", "GB", "CA", "AU", "IN", "DE", "FR", "BR", "JP", "AE"];

// ⭐ Convert ISO code → emoji flag (no images needed)
function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function today(): string { return new Date().toISOString().slice(0, 10); }
function addDays(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
}
function startOfDay(d: string): Date { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d: string): Date { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

// ⭐ Presets — quick start templates
const PRESETS = [
  {
    id: "flash", icon: Zap, label: "Flash Sale", desc: "20% off · 3 days",
    gradient: "from-[#FF7E02] to-orange-600",
    build: () => ({
      code: randomCode(), type: "percentage" as FormType, value: 20,
      startDate: today(), endDate: addDays(3),
      itemTypes: ["courses", "digital", "coaching"] as ItemType[],
      selectionMode: "all" as const, firstPurchaseOnly: false,
    }),
  },
  {
    id: "freebie", icon: Gift, label: "Free Course", desc: "Give one away",
    gradient: "from-emerald-500 to-teal-600",
    build: () => ({
      code: randomCode(), type: "free" as FormType, value: 100,
      startDate: today(), endDate: addDays(30),
      itemTypes: ["courses"] as ItemType[],
      selectionMode: "all" as const, firstPurchaseOnly: false,
    }),
  },
  {
    id: "bogo", icon: Package, label: "Buy 1 Get 1", desc: "Cheapest is free",
    gradient: "from-violet-500 to-purple-600",
    build: () => ({
      code: randomCode(), type: "bogo" as FormType, value: 0,
      startDate: today(), endDate: addDays(14),
      itemTypes: ["courses"] as ItemType[],
      selectionMode: "all" as const, firstPurchaseOnly: false,
    }),
  },
  {
    id: "newbuyer", icon: Sparkles, label: "New Students", desc: "10% · first order",
    gradient: "from-[#0177FB] to-[#0156C7]",
    build: () => ({
      code: randomCode(), type: "percentage" as FormType, value: 10,
      startDate: today(), endDate: addDays(30),
      itemTypes: ["courses"] as ItemType[],
      selectionMode: "all" as const, firstPurchaseOnly: true,
    }),
  },
] as const;

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function CouponModal({
  open, onOpenChange, coupon, courses, coursesLoading, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  coupon: Coupon | null;
  courses: any[];
  coursesLoading: boolean;
  onSaved: () => void;
}) {
  // ── Basic ──
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<FormType>("percentage");
  const [value, setValue] = useState(20);
  const [minSpend, setMinSpend] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);

  // ── Validity ──
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(0);
  const [perUserLimit, setPerUserLimit] = useState(1);

  // ── Applies to ──
  const [itemTypes, setItemTypes] = useState<ItemType[]>(["courses"]);
  const [selectionMode, setSelectionMode] = useState<"all" | "selected" | "category">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // ── Audience ──
  const [audienceMode, setAudienceMode] = useState<"all" | "emails">("all");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  // ── Countries ──
  const [countries, setCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState("");

  // ── Rules ──
  const [firstPurchaseOnly, setFirstPurchaseOnly] = useState(false);
  const [excludeDiscountedItems, setExcludeDiscountedItems] = useState(false);

  // ── State ──
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!coupon;

  // Load products
  useEffect(() => {
    if (!open) return;
    setProductsLoading(true);
    api.get("/teacher/products", { params: { limit: 200 } })
      .then((r) => setProducts(r.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [open]);

  // Hydrate form
  useEffect(() => {
    if (!open) return;
    if (coupon) {
      setCode(coupon.code);
      setDescription(coupon.description || "");
      setType(
        ["percentage", "fixed", "free", "bogo"].includes(coupon.type)
          ? (coupon.type as FormType)
          : "percentage"
      );
      setValue(coupon.value || 0);
      setMinSpend(coupon.minSpend || 0);
      setMaxDiscount(coupon.maxDiscount || 0);
      setStartDate(toDateInputValue(coupon.startDate));
      setEndDate(toDateInputValue(coupon.endDate));
      setUsageLimit(coupon.usageLimit || 0);
      setPerUserLimit(coupon.perUserLimit || 1);
      setItemTypes(
        (coupon.appliesTo.items?.filter((t) =>
          ["courses", "digital", "coaching"].includes(t)
        ) as ItemType[]) || ["courses"]
      );
      setSelectionMode(
        coupon.appliesTo.mode === "selected" ? "selected" :
        coupon.appliesTo.mode === "category" ? "category" : "all"
      );
      setSelectedProductIds(coupon.appliesTo.selectedIds || []);
      setSelectedCategories(coupon.appliesTo.categories || []);
      setAudienceMode(coupon.targetUsers.mode === "selected" ? "emails" : "all");
      setInvitedEmails(coupon.targetUsers.userEmails || []);
      setCountries(coupon.countries || []);
      setFirstPurchaseOnly(!!coupon.firstPurchaseOnly);
      setExcludeDiscountedItems(!!coupon.excludeDiscountedItems);
    } else {
      setCode("");
      setDescription("");
      setType("percentage");
      setValue(20);
      setMinSpend(0);
      setMaxDiscount(0);
      setStartDate(today());
      setEndDate(addDays(30));
      setUsageLimit(0);
      setPerUserLimit(1);
      setItemTypes(["courses"]);
      setSelectionMode("all");
      setSelectedProductIds([]);
      setSelectedCategories([]);
      setAudienceMode("all");
      setInvitedEmails([]);
      setCountries([]);
      setFirstPurchaseOnly(false);
      setExcludeDiscountedItems(false);
    }
    setEmailInput("");
    setProductSearch("");
    setCountrySearch("");
    setError(null);
    setSaving(false);
  }, [open, coupon]);

  // Derived
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ITEM_TYPES.forEach((t) => {
      counts[t.value] = products.filter(
        (p) => p.type === t.productType && p.status === "published"
      ).length;
    });
    return counts;
  }, [products]);

  const availableCategories = useMemo(() => {
    const s = new Set<string>();
    (courses || []).forEach((c: any) => { if (c.category) s.add(c.category); });
    return Array.from(s).sort();
  }, [courses]);

  const filteredProducts = useMemo(() => {
    const wanted = ITEM_TYPES.filter((t) => itemTypes.includes(t.value)).map((t) => t.productType);
    let r = products.filter((p) => wanted.includes(p.type) && p.status === "published");
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      r = r.filter((p) => p.title?.toLowerCase().includes(q));
    }
    return r;
  }, [products, itemTypes, productSearch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Live previews
  const previewType = TYPES.find((t) => t.value === type)!;
  const previewValue =
    type === "percentage" ? `${value}% off` :
    type === "fixed" ? `$${value} off` :
    type === "free" ? "100% off" : "Buy 1 get 1 free";

  const previewApplies =
    selectionMode === "all"
      ? `All ${itemTypes.map((t) => ITEM_TYPES.find((x) => x.value === t)?.label.toLowerCase()).join(" & ")}`
      : selectionMode === "selected"
      ? `${selectedProductIds.length} specific item${selectedProductIds.length === 1 ? "" : "s"}`
      : `${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"}`;

  const previewAudience =
    audienceMode === "all" ? "All students" :
    `${invitedEmails.length} invited email${invitedEmails.length === 1 ? "" : "s"}`;

  const previewCountries =
    countries.length === 0 ? "🌍 Worldwide" :
    countries.length <= 3
      ? countries.map((c) => `${flagEmoji(c)} ${c}`).join(" · ")
      : `${countries.slice(0, 3).map((c) => flagEmoji(c)).join(" ")} +${countries.length - 3}`;

  const previewDates =
    startDate && endDate
      ? `${new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "Not set";

  const previewStatus =
    !startDate || !endDate ? "Draft" :
    new Date() < new Date(startDate) ? "Scheduled" :
    new Date() > new Date(endDate) ? "Expired" : "Active";

  const statusColor =
    previewStatus === "Active" ? "emerald" :
    previewStatus === "Scheduled" ? "blue" :
    previewStatus === "Expired" ? "rose" : "slate";

  // ── Mutations ──
  const toggleItemType = (t: ItemType) => {
    setItemTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      return next.length === 0 ? prev : next;
    });
  };
  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleCountry = (c: string) =>
    setCountries((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const addEmail = () => {
    const raw = emailInput.trim().toLowerCase();
    if (!raw) return;
    const parts = raw.split(/[,\s;]+/).filter(Boolean);
    const valid: string[] = [], invalid: string[] = [];
    parts.forEach((e) => (isValidEmail(e) ? valid.push(e) : invalid.push(e)));
    if (invalid.length > 0) toast.error(`Invalid: ${invalid.join(", ")}`);
    if (valid.length > 0) {
      setInvitedEmails((prev) => {
        const next = [...prev];
        valid.forEach((e) => { if (!next.includes(e)) next.push(e); });
        return next;
      });
    }
    setEmailInput("");
  };
  const removeEmail = (e: string) => setInvitedEmails((prev) => prev.filter((x) => x !== e));

  const handleTypeChange = (next: FormType) => {
    const prev = type;
    setType(next);
    if (next === "free") setValue(100);
    else if (next === "bogo") setValue(0);
    else if (prev === "free" || prev === "bogo") setValue(next === "fixed" ? 10 : 20);
    else if (next === "percentage" && value > 100) setValue(100);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    const p = preset.build();
    setCode(p.code);
    setType(p.type);
    setValue(p.value);
    setStartDate(p.startDate);
    setEndDate(p.endDate);
    setItemTypes(p.itemTypes);
    setSelectionMode(p.selectionMode);
    setFirstPurchaseOnly(p.firstPurchaseOnly);
    toast.success(`${preset.label} preset applied`);
  };

  const validate = (): string | null => {
    if (!code.trim()) return "Coupon code is required";
    if (!/^[A-Z0-9_-]{3,30}$/i.test(code.trim()))
      return "Code must be 3–30 characters (letters, numbers, _ and - only)";
    if (type === "percentage" || type === "fixed") {
      if (!value || value <= 0) return "Discount value must be greater than 0";
      if (type === "percentage" && value > 100) return "Percentage cannot exceed 100%";
    }
    if (!startDate) return "Start date is required";
    if (!endDate) return "End date is required";
    if (new Date(endDate) < new Date(startDate)) return "End date must be after start date";
    if (itemTypes.length === 0) return "Select at least one item type";
    if (selectionMode === "selected" && selectedProductIds.length === 0) return "Pick at least one product";
    if (selectionMode === "category" && selectedCategories.length === 0) return "Pick at least one category";
    if (audienceMode === "emails" && invitedEmails.length === 0) return "Add at least one email, or switch to All students";
    return null;
  };

  const submit = async () => {
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        type,
        value: type === "free" ? 100 : type === "bogo" ? 0 : value,
        minSpend: minSpend > 0 ? minSpend : 0,
        maxDiscount: type === "percentage" && maxDiscount > 0 ? maxDiscount : undefined,
        startDate: startOfDay(startDate).toISOString(),
        endDate: endOfDay(endDate).toISOString(),
        usageLimit: usageLimit > 0 ? usageLimit : 0,
        perUserLimit: perUserLimit > 0 ? perUserLimit : 1,
        appliesTo: {
          items: itemTypes,
          mode: selectionMode,
          selectedIds: selectionMode === "selected" ? selectedProductIds : [],
          categories: selectionMode === "category" ? selectedCategories : [],
        },
        targetUsers:
          audienceMode === "emails"
            ? { mode: "selected", userIds: [], groupIds: [], userEmails: invitedEmails }
            : { mode: "all", userIds: [], groupIds: [], userEmails: [] },
        countries,
        currency: "USD",
        stackable: false,
        firstPurchaseOnly,
        excludeDiscountedItems,
        status: "active",
      };

      if (isEdit && coupon) {
        if (!coupon._id) throw new Error("Coupon ID missing — reload the page");
        await api.put(`/coupons/${coupon._id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success(`Coupon "${payload.code}" created`);
      }
      onSaved();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save coupon";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
        {/* Header */}
        <DialogHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-[#0177FB]/25">
              <Tag className="h-4 w-4" />
            </span>
            {isEdit ? "Edit coupon" : "Create coupon"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes apply to future uses. Past redemptions aren't affected."
              : "Give students a discount that converts. Fine-tune who, what, and where."}
          </DialogDescription>
        </DialogHeader>

        {/* Body — split layout */}
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ══ FORM COLUMN ══ */}
          <div className="space-y-5">
            {/* Presets */}
            {!isEdit && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Quick start
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        disabled={saving}
                        className="group flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${p.gradient} text-white shadow-sm`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-slate-900">{p.label}</span>
                          <span className="block text-[10px] text-slate-500">{p.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 1: Basics */}
            <Section n={1} icon={Tag} title="The basics" subtitle="How students will recognize it">
              <div>
                <Label>Coupon code *</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                    placeholder="e.g. SUMMER20"
                    className="rounded-lg font-mono uppercase tracking-wider"
                    maxLength={30}
                    disabled={saving}
                  />
                  <Button
                    type="button" variant="outline" size="icon"
                    className="shrink-0 rounded-lg"
                    onClick={() => setCode(randomCode())}
                    disabled={saving}
                    title="Generate random code"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Summer sale — 20% off all courses"
                  className="mt-1.5 rounded-lg"
                  disabled={saving}
                  maxLength={200}
                />
              </div>

              <div>
                <Label>Discount type *</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleTypeChange(t.value)}
                        disabled={saving}
                        className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                          active
                            ? "border-[#0177FB] bg-[#0177FB]/5 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        {active && (
                          <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-[#0177FB]" />
                        )}
                        <Icon className={`h-4 w-4 ${active ? "text-[#0177FB]" : "text-slate-400"}`} />
                        <span className={`text-xs font-black ${active ? "text-[#0177FB]" : "text-slate-900"}`}>
                          {t.label}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Section>

            {/* Section 2: Value & dates */}
            <Section n={2} icon={Calendar} title="Value & timing" subtitle="When and how much">
              {(type === "percentage" || type === "fixed") && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>{type === "percentage" ? "Percent off *" : "Amount off ($) *"}</Label>
                    <div className="relative mt-1.5">
                      {type === "percentage" ? (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                      ) : (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      )}
                      <Input
                        type="number" min={1} max={type === "percentage" ? 100 : undefined}
                        value={value} onChange={(e) => setValue(Number(e.target.value))}
                        className={type === "fixed" ? "rounded-lg pl-7" : "rounded-lg pr-7"}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Min spend ($)</Label>
                    <Input
                      type="number" min={0} value={minSpend}
                      onChange={(e) => setMinSpend(Number(e.target.value))}
                      placeholder="0 = none"
                      className="mt-1.5 rounded-lg" disabled={saving}
                    />
                  </div>
                  {type === "percentage" && (
                    <div>
                      <Label>Max discount ($)</Label>
                      <Input
                        type="number" min={0} value={maxDiscount}
                        onChange={(e) => setMaxDiscount(Number(e.target.value))}
                        placeholder="0 = no cap"
                        className="mt-1.5 rounded-lg" disabled={saving}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Start date *</Label>
                  <Input type="date" value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 rounded-lg" disabled={saving} />
                </div>
                <div>
                  <Label>End date *</Label>
                  <Input type="date" value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 rounded-lg" disabled={saving} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Total uses limit</Label>
                  <Input type="number" min={0} value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder="0 = unlimited" className="mt-1.5 rounded-lg" disabled={saving} />
                </div>
                <div>
                  <Label>Per student limit</Label>
                  <Input type="number" min={1} value={perUserLimit}
                    onChange={(e) => setPerUserLimit(Number(e.target.value))}
                    className="mt-1.5 rounded-lg" disabled={saving} />
                </div>
              </div>
            </Section>

            {/* Section 3: Applies to */}
            <Section n={3} icon={Layers} title="What it applies to" subtitle="Which products get discounted">
              <div className="grid grid-cols-3 gap-2">
                {ITEM_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = itemTypes.includes(t.value);
                  const count = productCounts[t.value] ?? 0;
                  return (
                    <button
                      key={t.value} type="button"
                      onClick={() => toggleItemType(t.value)}
                      disabled={saving}
                      className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition ${
                        active
                          ? "border-[#0177FB] bg-[#0177FB]/5"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon className={`h-4 w-4 ${active ? "text-[#0177FB]" : "text-slate-400"}`} />
                        <span className={`text-[10px] font-bold ${active ? "text-[#0177FB]" : "text-slate-400"}`}>
                          {count} live
                        </span>
                      </div>
                      <p className={`mt-1.5 text-[11px] font-black ${active ? "text-[#0177FB]" : "text-slate-900"}`}>
                        {t.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  { v: "all" as const, label: "Everything" },
                  { v: "selected" as const, label: "Specific items" },
                  { v: "category" as const, label: "By category" },
                ].map((m) => (
                  <button
                    key={m.v} type="button"
                    onClick={() => setSelectionMode(m.v)}
                    disabled={saving}
                    className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                      selectionMode === m.v
                        ? "bg-white text-[#0177FB] shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {selectionMode === "selected" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search your products..."
                      className="h-8 rounded-md bg-white pl-7 text-xs"
                      disabled={saving}
                    />
                  </div>
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0177FB]" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="py-3 text-center text-[11px] text-slate-500">
                      {products.length === 0
                        ? "You have no published products yet"
                        : "No products match the selected types"}
                    </p>
                  ) : (
                    <div className="max-h-52 space-y-1 overflow-y-auto">
                      {filteredProducts.map((p) => {
                        const checked = selectedProductIds.includes(p._id);
                        const TypeIcon = ITEM_TYPES.find((x) => x.productType === p.type)?.icon || BookOpen;
                        return (
                          <label
                            key={p._id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border p-1.5 transition-colors ${
                              checked
                                ? "border-[#0177FB] bg-[#0177FB]/5"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox" checked={checked}
                              onChange={() => toggleProduct(p._id)}
                              className="h-3.5 w-3.5 accent-[#0177FB]"
                              disabled={saving}
                            />
                            <TypeIcon className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-900">
                              {p.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {selectedProductIds.length > 0 && (
                    <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                      {selectedProductIds.length} selected
                    </p>
                  )}
                </div>
              )}

              {selectionMode === "category" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2">
                  {availableCategories.length === 0 ? (
                    <p className="py-2 text-center text-[11px] text-slate-500">
                      You have no courses with categories yet
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {availableCategories.map((c) => {
                          const active = selectedCategories.includes(c);
                          return (
                            <button
                              key={c} type="button"
                              onClick={() => toggleCategory(c)}
                              disabled={saving}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                active
                                  ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-sm"
                                  : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      {selectedCategories.length > 0 && (
                        <p className="mt-1.5 text-[10px] font-bold text-slate-600">
                          {selectedCategories.length} categor
                          {selectedCategories.length === 1 ? "y" : "ies"} selected
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </Section>

            {/* Section 4: Audience */}
            <Section n={4} icon={Users} title="Who can use it" subtitle="Everyone, or invite specific people">
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  { v: "all" as const, label: "All students", icon: Users2 },
                  { v: "emails" as const, label: "Invited emails", icon: Mail },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.v} type="button"
                      onClick={() => setAudienceMode(m.v)}
                      disabled={saving}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                        audienceMode === m.v
                          ? "bg-white text-[#0177FB] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {audienceMode === "emails" && (
                <>
                  <p className="text-[10px] text-slate-500">
                    Works for students who sign up later — anyone whose email is in this list gets the discount.
                  </p>

                  {invitedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {invitedEmails.map((e) => (
                        <span
                          key={e}
                          className="inline-flex items-center gap-1 rounded-full bg-[#0177FB]/10 px-2 py-0.5 text-[10px] font-bold text-[#0177FB]"
                        >
                          <Mail className="h-2.5 w-2.5" />
                          {e}
                          {!saving && (
                            <button
                              type="button" onClick={() => removeEmail(e)}
                              className="ml-0.5 hover:text-rose-600"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addEmail();
                        }
                      }}
                      placeholder="student@example.com — Enter to add"
                      className="h-8 rounded-md text-xs"
                      disabled={saving}
                    />
                    <Button
                      type="button" variant="outline" size="sm"
                      className="h-8 rounded-md"
                      onClick={addEmail}
                      disabled={saving || !emailInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </>
              )}
            </Section>

            {/* Section 5: Countries */}
            <Section n={5} icon={Globe} title="Where it works" subtitle="Worldwide or specific countries">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                <span className="text-xs text-slate-700">
                  {countries.length === 0
                    ? "🌍 Worldwide — available everywhere"
                    : `${countries.length} countr${countries.length === 1 ? "y" : "ies"} selected`}
                </span>
                {countries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCountries([])}
                    disabled={saving}
                    className="text-[10px] font-bold text-[#0177FB] hover:underline"
                  >
                    Reset to worldwide
                  </button>
                )}
              </div>

              {countries.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {countries.map((code) => {
                    const country = COUNTRIES.find((c) => c.code === code);
                    return (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 rounded-full bg-[#0177FB]/10 py-0.5 pl-1.5 pr-2 text-[11px] font-bold text-[#0177FB]"
                      >
                        <span className="text-sm leading-none">{flagEmoji(code)}</span>
                        <span className="text-[9px] font-black opacity-70">{code}</span>
                        <span>{country?.name || code}</span>
                        {!saving && (
                          <button
                            type="button" onClick={() => toggleCountry(code)}
                            className="ml-0.5 hover:text-rose-600"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries..."
                  className="h-8 rounded-md pl-7 text-xs"
                  disabled={saving}
                />
              </div>

              {!countrySearch && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Popular
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_COUNTRIES.map((code) => {
                      const country = COUNTRIES.find((c) => c.code === code);
                      const active = countries.includes(code);
                      return (
                        <button
                          key={code} type="button"
                          onClick={() => toggleCountry(code)}
                          disabled={saving}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                            active
                              ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-[#0177FB]/25"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className="text-sm leading-none">{flagEmoji(code)}</span>
                          {country?.name || code}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
                {filteredCountries.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">No countries match</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    {filteredCountries.map((c) => {
                      const active = countries.includes(c.code);
                      return (
                        <button
                          key={c.code} type="button"
                          onClick={() => toggleCountry(c.code)}
                          disabled={saving}
                          className={`flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs font-semibold transition ${
                            active
                              ? "bg-[#0177FB]/10 text-[#0177FB]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-sm leading-none">{flagEmoji(c.code)}</span>
                          <span className="text-[9px] font-black opacity-60">{c.code}</span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {countries.length > 0 && (
                <p className="text-[10px] text-slate-500">
                  Country is detected automatically in production (Cloudflare/Vercel). Local dev = soft no-op.
                </p>
              )}
            </Section>

            {/* Section 6: Rules */}
            <Section n={6} icon={Clock} title="Extra rules" subtitle="Optional guardrails">
              <div className="space-y-2">
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">First purchase only</p>
                    <p className="text-[10px] text-slate-500">Only students with no prior paid orders</p>
                  </div>
                  <Switch checked={firstPurchaseOnly} onCheckedChange={setFirstPurchaseOnly} disabled={saving} />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Exclude discounted items</p>
                    <p className="text-[10px] text-slate-500">Won&apos;t stack on top of sale prices</p>
                  </div>
                  <Switch checked={excludeDiscountedItems} onCheckedChange={setExcludeDiscountedItems} disabled={saving} />
                </label>
              </div>
            </Section>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* ══ PREVIEW COLUMN ══ */}
          <div className="hidden lg:block">
            <div className="sticky top-2 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Live preview
              </p>

              {/* Coupon card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 shadow-xl">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#0177FB]/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative">
                  {/* Ticket */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/70">
                        <Tag className="h-2.5 w-2.5" />
                        Coupon
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                          statusColor === "emerald" ? "bg-emerald-500/20 text-emerald-300" :
                          statusColor === "blue" ? "bg-[#0177FB]/30 text-[#7EB8FF]" :
                          statusColor === "rose" ? "bg-rose-500/20 text-rose-300" :
                          "bg-white/10 text-white/60"
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${
                          statusColor === "emerald" ? "bg-emerald-400" :
                          statusColor === "blue" ? "bg-[#0177FB]" :
                          statusColor === "rose" ? "bg-rose-400" : "bg-white/40"
                        }`} />
                        {previewStatus}
                      </span>
                    </div>

                    <p className="mt-3 break-all font-mono text-xl font-black tracking-wider text-white">
                      {code || "YOURCODE"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-white/90">{previewValue}</p>
                    {description && (
                      <p className="mt-0.5 text-[11px] text-white/50">{description}</p>
                    )}

                    <div className="my-3 border-t border-dashed border-white/15" />

                    <div className="space-y-1.5 text-[11px]">
                      <PreviewRow icon={<BookOpen className="h-3 w-3" />} label={previewApplies} />
                      <PreviewRow icon={<Users className="h-3 w-3" />} label={previewAudience} />
                      <PreviewRow icon={<Globe className="h-3 w-3" />} label={previewCountries} />
                      <PreviewRow icon={<Calendar className="h-3 w-3" />} label={previewDates} />
                    </div>
                  </div>

                  {/* Checkout mockup */}
                  <div className="mt-3 rounded-xl bg-white/5 p-3 backdrop-blur">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      Student checkout view
                    </p>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-white/60">
                        <span>Subtotal</span>
                        <span className="tabular-nums">$50.00</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5" />
                          {code || "YOURCODE"}
                        </span>
                        <span className="tabular-nums">
                          {type === "percentage" ? `−$${((50 * value) / 100).toFixed(2)}` :
                           type === "fixed" ? `−$${Math.min(value, 50).toFixed(2)}` :
                           type === "free" ? "−$50.00" : "−$0.00"}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-1 flex justify-between font-black text-white">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {type === "percentage" ? `$${(50 - (50 * value) / 100).toFixed(2)}` :
                           type === "fixed" ? `$${Math.max(0, 50 - value).toFixed(2)}` :
                           type === "free" ? "$0.00" : "$50.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-800">
                  <Sparkles className="h-3 w-3" /> Pro tip
                </p>
                <p className="mt-1 text-[11px] text-amber-900">
                  {type === "percentage" && !maxDiscount && value >= 50
                    ? "Add a max discount cap so a large single order doesn't wipe your margin."
                    : audienceMode === "all"
                    ? "Invite-only codes convert 3–4× better than open codes — try inviting your top 20 students."
                    : countries.length === 0
                    ? "Restricting to specific countries can boost conversion in your strongest market."
                    : "Looks great! Share this code in your next email or on social."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="hidden text-[10px] text-slate-500 sm:block">
            <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" />
            You can edit or delete this coupon anytime
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" className="rounded-lg"
              onClick={() => onOpenChange(false)} disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25 hover:from-[#0156C7] hover:to-[#014bb0]"
              onClick={submit} disabled={saving}
            >
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              ) : isEdit ? "Save changes" : "Create coupon →"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// Small subcomponents
// ═══════════════════════════════════════════════════════════════

function Section({
  n, icon: Icon, title, subtitle, children,
}: {
  n: number;
  icon: any;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-[11px] font-black text-white shadow-sm">
          {n}
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-black text-slate-900">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
            {title}
          </h3>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PreviewRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/70">
      <span className="text-white/40">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}