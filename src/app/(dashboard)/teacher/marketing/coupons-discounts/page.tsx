"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Tag,
  Percent,
  DollarSign,
  Truck,
  Copy,
  Check,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Users,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
  Clock,
  TrendingUp,
  Gift,
  ShieldCheck,
  AlertCircle,
  Globe,
  Target,
  Layers,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ---------- Types ----------
type CouponType = "percentage" | "fixed" | "free_shipping" | "free" | "bogo";
type CouponStatus = "active" | "scheduled" | "expired" | "disabled";
type ApplicableItem = "courses" | "digital" | "coaching";
type SelectionMode = "all" | "selected" | "category";
type UserTargetMode = "all" | "selected" | "group";

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  appliesTo: {
    items: ApplicableItem[];
    mode: SelectionMode;
    selectedIds: string[];
    categories: string[];
  };
  targetUsers: {
    mode: UserTargetMode;
    userIds: string[];
    groupIds: string[];
  };
  countries: string[];
  campaign?: string;
  stackable: boolean;
  firstPurchaseOnly: boolean;
  excludeDiscountedItems: boolean;
  status: CouponStatus;
  createdAt: string;
}

// ---------- Mock Data ----------
const initialCoupons: Coupon[] = [
  {
    id: "cpn-001",
    code: "WELCOME20",
    description: "20% off for new students",
    type: "percentage",
    value: 20,
    minSpend: 50,
    maxDiscount: 100,
    startDate: "2024-05-01",
    endDate: "2024-12-31",
    usageLimit: 500,
    usedCount: 145,
    perUserLimit: 1,
    appliesTo: {
      items: ["courses"],
      mode: "all",
      selectedIds: [],
      categories: [],
    },
    targetUsers: { mode: "all", userIds: [], groupIds: [] },
    countries: [],
    campaign: "Welcome Campaign",
    stackable: false,
    firstPurchaseOnly: true,
    excludeDiscountedItems: true,
    status: "active",
    createdAt: "2024-04-25",
  },
  {
    id: "cpn-002",
    code: "SAVE10",
    description: "$10 off on any course",
    type: "fixed",
    value: 10,
    minSpend: 0,
    maxDiscount: undefined,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    usageLimit: 1000,
    usedCount: 320,
    perUserLimit: 2,
    appliesTo: {
      items: ["courses", "digital"],
      mode: "selected",
      selectedIds: ["course-101", "course-102", "digital-201"],
      categories: [],
    },
    targetUsers: { mode: "selected", userIds: ["student-001", "student-002"], groupIds: [] },
    countries: ["US", "CA", "GB"],
    campaign: "Summer Sale",
    stackable: true,
    firstPurchaseOnly: false,
    excludeDiscountedItems: false,
    status: "active",
    createdAt: "2024-05-20",
  },
  {
    id: "cpn-003",
    code: "FREESHIP",
    description: "Free shipping on digital files",
    type: "free_shipping",
    value: 0,
    minSpend: 30,
    maxDiscount: undefined,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    usageLimit: 300,
    usedCount: 0,
    perUserLimit: 1,
    appliesTo: {
      items: ["digital"],
      mode: "category",
      selectedIds: [],
      categories: ["templates", "ebooks"],
    },
    targetUsers: { mode: "all", userIds: [], groupIds: [] },
    countries: ["US", "CA"],
    campaign: undefined,
    stackable: false,
    firstPurchaseOnly: false,
    excludeDiscountedItems: false,
    status: "scheduled",
    createdAt: "2024-06-15",
  },
  {
    id: "cpn-004",
    code: "SUMMER25",
    description: "25% off summer sale",
    type: "percentage",
    value: 25,
    minSpend: 75,
    maxDiscount: 200,
    startDate: "2024-06-01",
    endDate: "2024-07-15",
    usageLimit: 200,
    usedCount: 198,
    perUserLimit: 1,
    appliesTo: {
      items: ["courses", "coaching"],
      mode: "all",
      selectedIds: [],
      categories: [],
    },
    targetUsers: { mode: "all", userIds: [], groupIds: [] },
    countries: [],
    campaign: "Summer Promo",
    stackable: false,
    firstPurchaseOnly: false,
    excludeDiscountedItems: true,
    status: "expired",
    createdAt: "2024-05-10",
  },
  {
    id: "cpn-005",
    code: "FREE100",
    description: "100% off on selected course",
    type: "free",
    value: 100,
    minSpend: 0,
    maxDiscount: undefined,
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    usageLimit: 100,
    usedCount: 50,
    perUserLimit: 1,
    appliesTo: {
      items: ["courses"],
      mode: "selected",
      selectedIds: ["course-500"],
      categories: [],
    },
    targetUsers: { mode: "group", userIds: [], groupIds: ["group-premium"] },
    countries: [],
    campaign: "Giveaway",
    stackable: false,
    firstPurchaseOnly: true,
    excludeDiscountedItems: true,
    status: "active",
    createdAt: "2024-04-28",
  },
];

// Mock data for selections
const allCourses = [
  { id: "course-101", name: "Web Development Bootcamp", category: "Tech" },
  { id: "course-102", name: "UI/UX Design", category: "Design" },
  { id: "course-103", name: "Digital Marketing", category: "Marketing" },
  { id: "course-500", name: "AI for Beginners", category: "Tech" },
];
const allDigital = [
  { id: "digital-201", name: "E-book: Web Dev Guide", category: "ebooks" },
  { id: "digital-202", name: "Design Templates Pack", category: "templates" },
];
const allCoaching = [
  { id: "coach-301", name: "1-on-1 Career Coaching", category: "career" },
  { id: "coach-302", name: "Group Mentorship", category: "mentorship" },
];
const allCategories = ["Tech", "Design", "Marketing", "ebooks", "templates", "career", "mentorship"];
const allUsers = [
  { id: "student-001", name: "Alice Johnson" },
  { id: "student-002", name: "Bob Smith" },
  { id: "student-003", name: "Charlie Brown" },
];
const userGroups = [
  { id: "group-premium", name: "Premium Students" },
  { id: "group-new", name: "New Signups" },
];
const countriesList = ["US", "CA", "GB", "AU", "DE", "FR", "IN", "BD", "NP", "PK"];

// Analytics data
const redemptionTrend = [
  { month: "Jan", redemptions: 120 },
  { month: "Feb", redemptions: 180 },
  { month: "Mar", redemptions: 250 },
  { month: "Apr", redemptions: 300 },
  { month: "May", redemptions: 420 },
  { month: "Jun", redemptions: 380 },
  { month: "Jul", redemptions: 450 },
];

const couponTypeDistribution = [
  { name: "Percentage", value: 45, color: "#3b82f6" },
  { name: "Fixed", value: 25, color: "#10b981" },
  { name: "Free Shipping", value: 15, color: "#f59e0b" },
  { name: "100% Off", value: 10, color: "#8b5cf6" },
  { name: "BOGO", value: 5, color: "#ec4899" },
];

// ---------- Helper Components ----------
function CouponTypeIcon({ type }: { type: CouponType }) {
  switch (type) {
    case "percentage": return <Percent className="h-5 w-5 text-blue-500" />;
    case "fixed": return <DollarSign className="h-5 w-5 text-green-500" />;
    case "free_shipping": return <Truck className="h-5 w-5 text-orange-500" />;
    case "free": return <Gift className="h-5 w-5 text-purple-500" />;
    case "bogo": return <Layers className="h-5 w-5 text-pink-500" />;
    default: return <Tag className="h-5 w-5 text-gray-500" />;
  }
}

function StatusBadge({ status }: { status: CouponStatus }) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><ShieldCheck className="mr-1 h-3 w-3" /> Active</Badge>;
    case "scheduled": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="mr-1 h-3 w-3" /> Scheduled</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="mr-1 h-3 w-3" /> Expired</Badge>;
    case "disabled": return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"><EyeOff className="mr-1 h-3 w-3" /> Disabled</Badge>;
    default: return null;
  }
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ToggleSwitch({ defaultChecked = false, onChange }: { defaultChecked?: boolean; onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => {
        setChecked(!checked);
        onChange?.(!checked);
      }}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        checked ? "bg-indigo-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ---------- Coupon Modal ----------
function CouponModal({
  open,
  onOpenChange,
  coupon,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSave: (coupon: Coupon) => void;
}) {
  const [formData, setFormData] = useState<Partial<Coupon>>(
    coupon || {
      code: "",
      description: "",
      type: "percentage",
      value: 10,
      minSpend: 0,
      maxDiscount: undefined,
      startDate: "",
      endDate: "",
      usageLimit: 100,
      perUserLimit: 1,
      appliesTo: {
        items: [],
        mode: "all" as SelectionMode,
        selectedIds: [],
        categories: [],
      },
      targetUsers: {
        mode: "all" as UserTargetMode,
        userIds: [],
        groupIds: [],
      },
      countries: [],
      campaign: "",
      stackable: false,
      firstPurchaseOnly: false,
      excludeDiscountedItems: false,
      status: "active" as CouponStatus,
    }
  );

  // Reset form when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: "",
        description: "",
        type: "percentage",
        value: 10,
        minSpend: 0,
        maxDiscount: undefined,
        startDate: "",
        endDate: "",
        usageLimit: 100,
        perUserLimit: 1,
        appliesTo: {
          items: [],
          mode: "all",
          selectedIds: [],
          categories: [],
        },
        targetUsers: {
          mode: "all",
          userIds: [],
          groupIds: [],
        },
        countries: [],
        campaign: "",
        stackable: false,
        firstPurchaseOnly: false,
        excludeDiscountedItems: false,
        status: "active",
      });
    }
  }, [coupon, open]);

  const handleSubmit = () => {
    const newCoupon: Coupon = {
      id: coupon?.id || `cpn-${Date.now()}`,
      code: formData.code || "NEWCODE",
      description: formData.description || "",
      type: formData.type as CouponType,
      value: formData.value || 0,
      minSpend: formData.minSpend || 0,
      maxDiscount: formData.maxDiscount,
      startDate: formData.startDate || new Date().toISOString().slice(0, 10),
      endDate: formData.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      usageLimit: formData.usageLimit || 100,
      usedCount: coupon?.usedCount || 0,
      perUserLimit: formData.perUserLimit || 1,
      appliesTo: {
        items: formData.appliesTo?.items || [],
        mode: (formData.appliesTo?.mode as SelectionMode) || "all",
        selectedIds: formData.appliesTo?.selectedIds || [],
        categories: formData.appliesTo?.categories || [],
      },
      targetUsers: {
        mode: (formData.targetUsers?.mode as UserTargetMode) || "all",
        userIds: formData.targetUsers?.userIds || [],
        groupIds: formData.targetUsers?.groupIds || [],
      },
      countries: formData.countries || [],
      campaign: formData.campaign,
      stackable: formData.stackable || false,
      firstPurchaseOnly: formData.firstPurchaseOnly || false,
      excludeDiscountedItems: formData.excludeDiscountedItems || false,
      status: formData.status as CouponStatus,
      createdAt: coupon?.createdAt || new Date().toISOString().slice(0, 10),
    };
    onSave(newCoupon);
    onOpenChange(false);
  };

  // Toggle functions for nested arrays
  const toggleAppliesToItem = (item: ApplicableItem) => {
    setFormData((prev) => {
      const currentItems = prev.appliesTo?.items || [];
      const newItems = currentItems.includes(item)
        ? currentItems.filter((i) => i !== item)
        : [...currentItems, item];
      return {
        ...prev,
        appliesTo: {
          items: newItems,
          mode: prev.appliesTo?.mode || "all",
          selectedIds: prev.appliesTo?.selectedIds || [],
          categories: prev.appliesTo?.categories || [],
        },
      };
    });
  };

  const toggleSelectedId = (id: string) => {
    setFormData((prev) => {
      const currentIds = prev.appliesTo?.selectedIds || [];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((i) => i !== id)
        : [...currentIds, id];
      return {
        ...prev,
        appliesTo: {
          items: prev.appliesTo?.items || [],
          mode: prev.appliesTo?.mode || "all",
          selectedIds: newIds,
          categories: prev.appliesTo?.categories || [],
        },
      };
    });
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => {
      const currentCats = prev.appliesTo?.categories || [];
      const newCats = currentCats.includes(cat)
        ? currentCats.filter((c) => c !== cat)
        : [...currentCats, cat];
      return {
        ...prev,
        appliesTo: {
          items: prev.appliesTo?.items || [],
          mode: prev.appliesTo?.mode || "all",
          selectedIds: prev.appliesTo?.selectedIds || [],
          categories: newCats,
        },
      };
    });
  };

  const toggleUserId = (id: string) => {
    setFormData((prev) => {
      const currentUsers = prev.targetUsers?.userIds || [];
      const newUsers = currentUsers.includes(id)
        ? currentUsers.filter((u) => u !== id)
        : [...currentUsers, id];
      return {
        ...prev,
        targetUsers: {
          mode: prev.targetUsers?.mode || "all",
          userIds: newUsers,
          groupIds: prev.targetUsers?.groupIds || [],
        },
      };
    });
  };

  const toggleGroupId = (id: string) => {
    setFormData((prev) => {
      const currentGroups = prev.targetUsers?.groupIds || [];
      const newGroups = currentGroups.includes(id)
        ? currentGroups.filter((g) => g !== id)
        : [...currentGroups, id];
      return {
        ...prev,
        targetUsers: {
          mode: prev.targetUsers?.mode || "all",
          userIds: prev.targetUsers?.userIds || [],
          groupIds: newGroups,
        },
      };
    });
  };

  const toggleCountry = (country: string) => {
    setFormData((prev) => {
      const currentCountries = prev.countries || [];
      const newCountries = currentCountries.includes(country)
        ? currentCountries.filter((c) => c !== country)
        : [...currentCountries, country];
      return { ...prev, countries: newCountries };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "Edit Coupon" : "Create Advanced Coupon"}</DialogTitle>
          <DialogDescription>Configure discount rules, applicability, and targeting.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-500" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as CouponType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    <SelectItem value="free">100% Off (Free)</SelectItem>
                    <SelectItem value="bogo">Buy X Get Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., 20% off for new students" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{formData.type === "percentage" ? "Discount (%)" : formData.type === "fixed" ? "Discount ($)" : formData.type === "free" ? "Discount (100%)" : "Value"}</label>
                <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} disabled={formData.type === "free"} />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Spend ($)</label>
                <Input type="number" value={formData.minSpend} onChange={(e) => setFormData({ ...formData, minSpend: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            {formData.type === "percentage" && (
              <div>
                <label className="text-sm font-medium">Maximum Discount ($)</label>
                <Input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || undefined })} />
              </div>
            )}
          </div>

          {/* Applicability */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" /> Applicability
            </h3>
            <div>
              <label className="text-sm font-medium">Apply To</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["courses", "digital", "coaching"] as ApplicableItem[]).map((item) => (
                  <Button
                    key={item}
                    variant={formData.appliesTo?.items?.includes(item) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleAppliesToItem(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Selection Mode</label>
              <Select
                value={formData.appliesTo?.mode}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    appliesTo: {
                      items: formData.appliesTo?.items || [],
                      mode: v as SelectionMode,
                      selectedIds: formData.appliesTo?.selectedIds || [],
                      categories: formData.appliesTo?.categories || [],
                    },
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="selected">Selected Items</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.appliesTo?.mode === "selected" && (
              <div>
                <label className="text-sm font-medium">Select Specific Items</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {formData.appliesTo?.items?.includes("courses") && allCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.appliesTo?.selectedIds?.includes(course.id)} onChange={() => toggleSelectedId(course.id)} className="h-4 w-4" />
                      <span>{course.name}</span>
                    </div>
                  ))}
                  {formData.appliesTo?.items?.includes("digital") && allDigital.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.appliesTo?.selectedIds?.includes(item.id)} onChange={() => toggleSelectedId(item.id)} className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {formData.appliesTo?.items?.includes("coaching") && allCoaching.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.appliesTo?.selectedIds?.includes(item.id)} onChange={() => toggleSelectedId(item.id)} className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {formData.appliesTo?.mode === "category" && (
              <div>
                <label className="text-sm font-medium">Select Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allCategories.map((cat) => (
                    <Button key={cat} variant={formData.appliesTo?.categories?.includes(cat) ? "secondary" : "outline"} size="sm" onClick={() => toggleCategory(cat)}>
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" /> Target Audience
            </h3>
            <div>
              <label className="text-sm font-medium">User Targeting Mode</label>
              <Select
                value={formData.targetUsers?.mode}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    targetUsers: {
                      mode: v as UserTargetMode,
                      userIds: formData.targetUsers?.userIds || [],
                      groupIds: formData.targetUsers?.groupIds || [],
                    },
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="selected">Selected Users</SelectItem>
                  <SelectItem value="group">User Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.targetUsers?.mode === "selected" && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.targetUsers?.userIds?.includes(user.id)} onChange={() => toggleUserId(user.id)} className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
            {formData.targetUsers?.mode === "group" && (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {userGroups.map((group) => (
                  <div key={group.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.targetUsers?.groupIds?.includes(group.id)} onChange={() => toggleGroupId(group.id)} className="h-4 w-4" />
                    <span>{group.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Geographic Targeting */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500" /> Geographic Targeting
            </h3>
            <label className="text-sm font-medium">Countries (leave empty for all)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {countriesList.map((country) => (
                <Button key={country} variant={formData.countries?.includes(country) ? "secondary" : "outline"} size="sm" onClick={() => toggleCountry(country)}>
                  {country}
                </Button>
              ))}
            </div>
          </div>

          {/* Campaign & Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Campaign (optional)</label>
              <Input value={formData.campaign} onChange={(e) => setFormData({ ...formData, campaign: e.target.value })} placeholder="e.g., Summer Sale" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Usage Restrictions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500" /> Usage Restrictions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Usage Limit (total)</label>
                <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Per User Limit</label>
                <Input type="number" value={formData.perUserLimit} onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.stackable} onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })} className="h-4 w-4" />
                Stackable with other coupons
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.firstPurchaseOnly} onChange={(e) => setFormData({ ...formData, firstPurchaseOnly: e.target.checked })} className="h-4 w-4" />
                First purchase only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={formData.excludeDiscountedItems} onChange={(e) => setFormData({ ...formData, excludeDiscountedItems: e.target.checked })} className="h-4 w-4" />
                Exclude already discounted items
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{coupon ? "Save Changes" : "Create Coupon"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Coupon Row Component ----------
function CouponRow({
  coupon,
  selected,
  copiedCode,
  onToggleSelect,
  onCopyCode,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  selected: boolean;
  copiedCode: string | null;
  onToggleSelect: (id: string) => void;
  onCopyCode: (code: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={cn("border-b hover:bg-muted/30 transition-colors", expanded && "bg-muted/20")}>
        <td className="p-3">
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect(coupon.id)} className="h-4 w-4" />
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <CouponTypeIcon type={coupon.type} />
            <div>
              <div className="font-medium flex items-center gap-2">
                {coupon.code}
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => onCopyCode(coupon.code)}>
                  {copiedCode === coupon.code ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">{coupon.description}</div>
            </div>
          </div>
        </td>
        <td className="p-3">
          {coupon.type === "percentage" && <span className="font-semibold">{coupon.value}% off</span>}
          {coupon.type === "fixed" && <span className="font-semibold">${coupon.value} off</span>}
          {coupon.type === "free_shipping" && <span className="font-semibold">Free Shipping</span>}
          {coupon.type === "free" && <span className="font-semibold">100% Off</span>}
          {coupon.type === "bogo" && <span className="font-semibold">Buy X Get Y</span>}
          {coupon.minSpend ? <div className="text-xs text-muted-foreground">Min spend ${coupon.minSpend}</div> : null}
        </td>
        <td className="p-3">
          <div className="text-xs">{coupon.appliesTo.mode === "all" ? "All items" : coupon.appliesTo.mode === "category" ? `Categories: ${coupon.appliesTo.categories.join(", ")}` : `Selected (${coupon.appliesTo.selectedIds.length})`}</div>
          <div className="text-xs text-muted-foreground">{coupon.appliesTo.items.join(", ")}</div>
        </td>
        <td className="p-3">
          <div className="text-xs">{coupon.targetUsers.mode === "all" ? "Everyone" : coupon.targetUsers.mode === "selected" ? `${coupon.targetUsers.userIds.length} users` : `${coupon.targetUsers.groupIds.length} groups`}</div>
          {coupon.countries.length > 0 && <div className="text-xs text-muted-foreground">{coupon.countries.join(", ")}</div>}
        </td>
        <td className="p-3">
          <div className="font-medium">{coupon.usedCount} / {coupon.usageLimit}</div>
          <div className="text-xs text-muted-foreground">Per user: {coupon.perUserLimit}</div>
        </td>
        <td className="p-3">
          <div className="text-xs">{coupon.startDate}</div>
          <div className="text-xs text-muted-foreground">to {coupon.endDate}</div>
        </td>
        <td className="p-3"><StatusBadge status={coupon.status} /></td>
        <td className="p-3 text-right">
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCopyCode(coupon.code)}><Copy className="mr-2 h-4 w-4" /> Copy Code</DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-muted/10">
          <td colSpan={9} className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Campaign</p>
                <p className="text-muted-foreground">{coupon.campaign || "None"}</p>
              </div>
              <div>
                <p className="font-medium">Stackable</p>
                <p className="text-muted-foreground">{coupon.stackable ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-medium">First Purchase Only</p>
                <p className="text-muted-foreground">{coupon.firstPurchaseOnly ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-medium">Exclude Discounted Items</p>
                <p className="text-muted-foreground">{coupon.excludeDiscountedItems ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-medium">Created At</p>
                <p className="text-muted-foreground">{coupon.createdAt}</p>
              </div>
              <div>
                <p className="font-medium">Applies To Details</p>
                <p className="text-muted-foreground">
                  {coupon.appliesTo.mode === "selected" ? `IDs: ${coupon.appliesTo.selectedIds.join(", ")}` : coupon.appliesTo.mode === "category" ? `Categories: ${coupon.appliesTo.categories.join(", ")}` : "All"}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---------- Main Component ----------
export default function CouponsDiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CouponType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [dateRange, setDateRange] = useState<"all" | "active" | "upcoming" | "past">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("coupons");

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const scheduledCoupons = coupons.filter((c) => c.status === "scheduled").length;
  const expiredCoupons = coupons.filter((c) => c.status === "expired").length;
  const redemptionRate = totalCoupons > 0 ? Math.round((coupons.reduce((sum, c) => sum + c.usedCount, 0) / coupons.reduce((sum, c) => sum + c.usageLimit, 0)) * 100) : 0;

  // Filter & search
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];
    if (searchQuery) {
      result = result.filter((c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (typeFilter !== "all") result = result.filter((c) => c.type === typeFilter);
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);

    const now = new Date();
    if (dateRange === "active") {
      result = result.filter((c) => new Date(c.startDate) <= now && new Date(c.endDate) >= now);
    } else if (dateRange === "upcoming") {
      result = result.filter((c) => new Date(c.startDate) > now);
    } else if (dateRange === "past") {
      result = result.filter((c) => new Date(c.endDate) < now);
    }

    return result;
  }, [coupons, searchQuery, typeFilter, statusFilter, dateRange]);

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSaveCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const exists = prev.find((c) => c.id === coupon.id);
      if (exists) return prev.map((c) => (c.id === coupon.id ? coupon : c));
      return [coupon, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((selId) => selId !== id));
  };

  const handleBulkDelete = () => {
    setCoupons((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCoupons.length) setSelectedIds([]);
    else setSelectedIds(paginatedCoupons.map((c) => c.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <Tag className="h-10 w-10 text-indigo-500" /> Coupons & Discounts
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Create sophisticated discount rules with advanced targeting.</p>
          </div>
          <Button size="lg" onClick={() => { setEditingCoupon(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-5 w-5" /> Create Coupon
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 gap-2 w-full md:w-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="coupons" className="flex items-center gap-2"><Tag className="h-4 w-4" /> Coupons</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Coupons" value={totalCoupons.toString()} icon={Tag} color="text-indigo-500" />
              <StatCard label="Active" value={activeCoupons.toString()} icon={ShieldCheck} color="text-green-500" />
              <StatCard label="Scheduled" value={scheduledCoupons.toString()} icon={Clock} color="text-blue-500" />
              <StatCard label="Redemption Rate" value={`${redemptionRate}%`} icon={TrendingUp} color="text-purple-500" />
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-auto flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search coupons..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    <SelectItem value="free">100% Off</SelectItem>
                    <SelectItem value="bogo">Buy X Get Y</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Date" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="active">Currently Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past/Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                <span className="text-sm font-medium">{selectedIds.length} selected</span>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete Selected</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Clear</Button>
              </div>
            )}

            {/* Coupons Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left"><input type="checkbox" checked={paginatedCoupons.length > 0 && selectedIds.length === paginatedCoupons.length} onChange={toggleSelectAll} className="h-4 w-4" /></th>
                        <th className="p-3 text-left font-medium">Code</th>
                        <th className="p-3 text-left font-medium">Discount</th>
                        <th className="p-3 text-left font-medium">Applies To</th>
                        <th className="p-3 text-left font-medium">Audience</th>
                        <th className="p-3 text-left font-medium">Usage</th>
                        <th className="p-3 text-left font-medium">Validity</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCoupons.map((coupon) => (
                        <CouponRow
                          key={coupon.id}
                          coupon={coupon}
                          selected={selectedIds.includes(coupon.id)}
                          copiedCode={copiedCode}
                          onToggleSelect={toggleSelect}
                          onCopyCode={handleCopyCode}
                          onEdit={() => { setEditingCoupon(coupon); setModalOpen(true); }}
                          onDelete={() => handleDelete(coupon.id)}
                        />
                      ))}
                      {paginatedCoupons.length === 0 && (
                        <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No coupons found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Redemption Trend</CardTitle>
                  <CardDescription>Number of coupon redemptions per month</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={redemptionTrend}>
                      <defs>
                        <linearGradient id="colorRedemptions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="redemptions" stroke="#6366f1" fillOpacity={1} fill="url(#colorRedemptions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Type Distribution</CardTitle>
                  <CardDescription>Distribution by discount type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={couponTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {couponTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Settings</CardTitle>
                <CardDescription>Configure default behavior for all coupons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Stacking Allowed</p>
                    <p className="text-sm text-muted-foreground">Allow coupons to be combined with other coupons</p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">First Purchase Only</p>
                    <p className="text-sm text-muted-foreground">Restrict coupons to first-time buyers</p>
                  </div>
                  <ToggleSwitch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-disable after limit</p>
                    <p className="text-sm text-muted-foreground">Disable coupon when usage limit reached</p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Coupon Modal */}
      <CouponModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        coupon={editingCoupon}
        onSave={handleSaveCoupon}
      />
    </div>
  );
}

// ---------- StatCard Component ----------
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}