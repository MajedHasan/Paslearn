"use client";

import { useState, useEffect, useMemo } from "react";
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
  Search,
  CreditCard,
  Plus,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Landmark,
  Wallet,
  FileText,
  Sparkles,
  Trash2,
  Star,
  Crown,
  Zap,
  TrendingUp,
  Check,
  X,
  Loader2,
  Rocket,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Plan } from "@/types/plan/plan";

// ---------- Types ----------
type PlanStatus = "active" | "trialing" | "past_due" | "canceled" | "expired" | "pending";
type PaymentMethodStatus = "active" | "default" | "inactive" | "expired";
type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";
type PaymentMethodType = "card" | "paypal" | "bank";

interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiry?: string;
  name: string;
  email?: string;
  bankName?: string;
  status: PaymentMethodStatus;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  planName: string;
  period: string;
  lineItems: { description: string; amount: number }[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
}

interface ActiveSubscription {
  _id: string;
  plan: Plan;
  status: PlanStatus;
  nextBillingDate?: string;
  billingCycle: "monthly" | "yearly" | "lifetime";
  addons?: string[];
  createdAt?: string;
}

// ---------- Mock data for payment methods and invoices ----------
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-001",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiry: "12/26",
    name: "John Doe",
    status: "default",
    isDefault: true,
  },
  {
    id: "pm-002",
    type: "paypal",
    email: "john@example.com",
    name: "John Doe",
    status: "active",
    isDefault: false,
  },
  {
    id: "pm-003",
    type: "bank",
    bankName: "Bank of America",
    last4: "9876",
    name: "John Doe",
    status: "inactive",
    isDefault: false,
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2024-001",
    date: "2024-07-01",
    dueDate: "2024-07-15",
    amount: 79.0,
    status: "paid",
    planName: "Pro",
    period: "Jul 2024",
    lineItems: [{ description: "Pro Plan Subscription", amount: 79.0 }],
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2024-002",
    date: "2024-06-01",
    dueDate: "2024-06-15",
    amount: 79.0,
    status: "paid",
    planName: "Pro",
    period: "Jun 2024",
    lineItems: [{ description: "Pro Plan Subscription", amount: 79.0 }],
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2024-003",
    date: "2024-05-01",
    dueDate: "2024-05-15",
    amount: 79.0,
    status: "paid",
    planName: "Pro",
    period: "May 2024",
    lineItems: [{ description: "Pro Plan Subscription", amount: 79.0 }],
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2024-004",
    date: "2024-04-01",
    dueDate: "2024-04-15",
    amount: 29.0,
    status: "paid",
    planName: "Basic",
    period: "Apr 2024",
    lineItems: [{ description: "Basic Plan Subscription", amount: 29.0 }],
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2024-005",
    date: "2024-03-01",
    dueDate: "2024-03-15",
    amount: 29.0,
    status: "refunded",
    planName: "Basic",
    period: "Mar 2024",
    lineItems: [{ description: "Basic Plan Subscription", amount: 29.0 }],
  },
];

const availableAddons: Addon[] = [
  {
    id: "addon-001",
    name: "Extra Storage 50GB",
    description: "Additional cloud storage for your files",
    price: 5,
    billingCycle: "monthly",
  },
  {
    id: "addon-002",
    name: "Priority Chat Support",
    description: "Get faster responses from our support team",
    price: 10,
    billingCycle: "monthly",
  },
  {
    id: "addon-003",
    name: "Advanced Analytics",
    description: "Detailed insights into your courses and students",
    price: 15,
    billingCycle: "monthly",
  },
];

// ---------- Helper Components ----------
function PlanStatusBadge({ status }: { status: PlanStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" /> Active</Badge>;
    case "trialing":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="mr-1 h-3 w-3" /> Trialing</Badge>;
    case "past_due":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="mr-1 h-3 w-3" /> Past Due</Badge>;
    case "canceled":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"><XCircle className="mr-1 h-3 w-3" /> Canceled</Badge>;
    case "expired":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"><XCircle className="mr-1 h-3 w-3" /> Expired</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    default:
      return null;
  }
}

function PaymentMethodStatusBadge({ status }: { status: PaymentMethodStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
    case "default":
      return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"><ShieldCheck className="mr-1 h-3 w-3" /> Default</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Inactive</Badge>;
    case "expired":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Expired</Badge>;
    default:
      return null;
  }
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>;
    case "refunded":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Refunded</Badge>;
    default:
      return null;
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

// ---------- Plan Card ----------
const PLAN_COLORS = [
  { gradient: "from-green-500 to-emerald-600", border: "border-green-500", bg: "bg-green-50", iconColor: "text-green-600", ring: "ring-green-500" },
  { gradient: "from-orange-500 to-amber-600", border: "border-orange-500", bg: "bg-orange-50", iconColor: "text-orange-600", ring: "ring-orange-500" },
  { gradient: "from-[#0177fb] to-[#0156c7]", border: "border-[#0177fb]", bg: "bg-blue-50", iconColor: "text-[#0177fb]", ring: "ring-[#0177fb]" },
  { gradient: "from-yellow-500 to-amber-600", border: "border-yellow-500", bg: "bg-yellow-50", iconColor: "text-yellow-600", ring: "ring-yellow-500" },
  { gradient: "from-purple-500 to-violet-600", border: "border-purple-500", bg: "bg-purple-50", iconColor: "text-purple-600", ring: "ring-purple-500" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Star,
  Crown,
  TrendingUp,
  Sparkles,
  Rocket,
};

function PlanCard({ plan, isSelected, onSelect, colorIndex }: { plan: Plan; isSelected: boolean; onSelect: (planId: string) => void; colorIndex: number }) {
  const [hovered, setHovered] = useState(false);
  const colors = PLAN_COLORS[colorIndex % PLAN_COLORS.length];
  const Icon = plan.icon ? ICON_MAP[plan.icon] || Star : Star;
  const badge = plan.badge?.toLowerCase();
  const isPopular = badge === "popular" || plan.isFeatured;
  const isPremium = badge === "premium";

  const renderFeatureValue = (feature: Plan["features"][0]) => {
    if (feature.type === "boolean") return null;
    if (feature.type === "number") return `${feature.value}${feature.icon ? " " + feature.icon : ""}`;
    return `${feature.value}`;
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative rounded-3xl border-[3px] p-7 transition-all duration-300 cursor-pointer bg-white",
        isSelected ? `${colors.border} shadow-2xl scale-105 ring-4 ring-opacity-20 ${colors.bg}` : "border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl",
        isPopular && "ring-4 ring-blue-100 ring-opacity-50",
        hovered && !isSelected && "scale-105"
      )}
      onClick={() => onSelect(plan._id)}
    >
      {isPremium && (
        <div className="absolute -top-5 -right-5 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 shadow-2xl animate-bounce">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
      )}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-xl">
            <Sparkles className="w-4 h-4" />
            MOST POPULAR
          </div>
        </div>
      )}
      <div className="text-center mb-7 pt-4">
        <div className={cn("w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-transform", colors.gradient, hovered && "scale-110 rotate-6")}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black mb-2 text-gray-900">{plan.name}</h3>
        <div className={cn("h-2 w-24 mx-auto mb-4 rounded-full bg-gradient-to-r", colors.gradient)} />
        <div className="mb-2">
          <span className="text-gray-500 text-sm font-bold">{plan.price.currency} </span>
          <span className={cn("text-5xl font-black bg-gradient-to-r bg-clip-text text-transparent", colors.gradient)}>
            {plan.price.amount}
          </span>
        </div>
        <p className="text-sm text-gray-600 font-semibold capitalize">{plan.price.billingCycle}</p>
        {plan.description && <p className={cn("text-sm font-medium mt-1", colors.iconColor)}>{plan.description}</p>}
      </div>
      <div className="space-y-3 mb-6 min-h-[180px]">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center", feature.type === "boolean" ? (feature.value ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gray-200") : "bg-gradient-to-br from-blue-400 to-blue-600")}>
              {feature.type === "boolean" ? (feature.value ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : <X className="w-4 h-4 text-gray-400" />) : <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className={cn("text-sm font-medium leading-relaxed", feature.type === "boolean" && !feature.value ? "text-gray-400" : "text-gray-800")}>
                {feature.label}
                {feature.type !== "boolean" && <span className="ml-1 font-bold text-blue-700">{renderFeatureValue(feature)}</span>}
              </p>
              {feature.tooltip && <p className="text-xs text-gray-400 mt-0.5">{feature.tooltip}</p>}
            </div>
          </div>
        ))}
      </div>
      <Button
        className={cn("w-full py-6 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-105", `bg-gradient-to-r ${colors.gradient} text-white`)}
        onClick={(e) => { e.stopPropagation(); onSelect(plan._id); }}
      >
        {isSelected ? "✓ CURRENT PLAN" : plan.ctaText || `GET ${plan.name.toUpperCase()}`}
      </Button>
    </div>
  );
}

// ---------- Main Billing Page ----------
export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);
  const [errorSubscription, setErrorSubscription] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showAddonModal, setShowAddonModal] = useState(false);

  const [changingPlan, setChangingPlan] = useState(false);
  const [planChangeDialogOpen, setPlanChangeDialogOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState<Plan | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPlans(true);
        setErrorPlans(null);
        const plansRes = await api.get("/plans?role=teacher");
        const fetchedPlans: Plan[] = plansRes?.data?.data || [];
        fetchedPlans.sort((a, b) => a.sortOrder - b.sortOrder);
        setPlans(fetchedPlans);
      } catch (err: any) {
        setErrorPlans(err?.response?.data?.message || "Failed to load plans");
      } finally {
        setLoadingPlans(false);
      }

      try {
        setLoadingSubscription(true);
        setErrorSubscription(null);
        // Fetch all user subscriptions and pick the most recent one
        const subsRes = await api.get("/subscriptions/my");
        const subscriptions: ActiveSubscription[] = subsRes?.data?.data || [];
        if (subscriptions.length > 0) {
          // Sort by createdAt descending
          subscriptions.sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
          );
          const latestSubscription = subscriptions[0];
          setActiveSubscription(latestSubscription);
          setSelectedAddons(latestSubscription.addons || []);
        } else {
          // Fallback: use teacher profile selectedPlan
          const profileRes = await api.get("/teacher-profile");
          const selectedPlan = profileRes?.data?.data?.selectedPlan;
          if (selectedPlan) {
            setActiveSubscription({
              _id: "no-subscription",
              plan: selectedPlan,
              status: "active",
              billingCycle: selectedPlan.price.billingCycle,
              addons: [],
              createdAt: new Date().toISOString(),
            });
            setSelectedAddons([]);
          } else {
            setErrorSubscription("No subscription found");
          }
        }
      } catch (err: any) {
        setErrorSubscription(err?.response?.data?.message || "Failed to load subscription");
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchData();
  }, []);

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (searchInvoice) result = result.filter((inv) => inv.invoiceNumber.toLowerCase().includes(searchInvoice.toLowerCase()));
    if (invoiceStatusFilter !== "all") result = result.filter((inv) => inv.status === invoiceStatusFilter);
    return result;
  }, [invoices, searchInvoice, invoiceStatusFilter]);

  const totalInvoicePages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.map((pm) => ({
      ...pm,
      isDefault: pm.id === id,
      status: pm.id === id ? "default" : pm.status === "default" ? "active" : pm.status,
    })));
    toast.success("Default payment method updated");
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    toast.success("Payment method removed");
  };

  const handlePlanSelect = (planId: string) => {
    if (planId === activeSubscription?.plan?._id) return;
    const plan = plans.find((p) => p._id === planId);
    if (plan) {
      setPlanToChange(plan);
      setPlanChangeDialogOpen(true);
    }
  };

  const confirmPlanChange = async () => {
    if (!planToChange || !activeSubscription) return;
    setChangingPlan(true);
    try {
      // 1. Create subscription
      const res = await api.post("/subscriptions", {
        planId: planToChange._id,
        billingCycle: planToChange.price.billingCycle || "monthly",
      });
      const newSub = res?.data?.data;

      // 2. Update teacher profile selectedPlan
      await api.patch("/teacher-profile", {
        selectedPlan: planToChange._id,
      });

      // 3. Update local state
      if (newSub) {
        setActiveSubscription(newSub);
        setSelectedAddons(newSub.addons || []);
      } else {
        setActiveSubscription((prev) => prev ? {
          ...prev,
          plan: planToChange,
          status: "active",
          billingCycle: planToChange.price.billingCycle,
        } : null);
      }

      toast.success(`Successfully switched to ${planToChange.name} plan!`);
      setPlanChangeDialogOpen(false);
      setPlanToChange(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const confirmCancelSubscription = async () => {
    if (!activeSubscription?._id) return;
    setChangingPlan(true);
    try {
      await api.patch(`/subscriptions/${activeSubscription._id}/cancel`);
      setActiveSubscription((prev) => prev ? { ...prev, status: "canceled" } : prev);
      toast.success("Subscription canceled");
      setCancelDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setChangingPlan(false);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const saveAddons = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (activeSubscription) {
      setActiveSubscription({ ...activeSubscription, addons: selectedAddons });
    }
    toast.success("Add-ons updated");
    setShowAddonModal(false);
  };

  const currentPlan = plans.find((p) => p._id === activeSubscription?.plan?._id) || activeSubscription?.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <CreditCard className="h-10 w-10 text-indigo-500" /> Billing
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage your plan, payment methods, and invoices.</p>
          </div>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <Card className="border-2 border-indigo-100 dark:border-indigo-900/50">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /><span className="ml-2">Loading plan...</span></div>
                ) : errorSubscription ? (
                  <div className="text-center py-8 text-red-500">{errorSubscription}</div>
                ) : currentPlan ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                        <p className="text-muted-foreground">{currentPlan?.price?.currency}{currentPlan?.price?.amount}/{activeSubscription?.billingCycle}</p>
                      </div>
                      <PlanStatusBadge status={activeSubscription?.status || "active"} />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Start Date</p>
                        <p className="text-muted-foreground">{activeSubscription?.createdAt ? new Date(activeSubscription.createdAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-medium">Billing Cycle</p>
                        <p className="text-muted-foreground">{activeSubscription?.billingCycle}</p>
                      </div>
                    </div>
                    {/* Add-ons */}
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Add-ons</p>
                        <Button variant="outline" size="sm" onClick={() => setShowAddonModal(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Manage Add-ons
                        </Button>
                      </div>
                      {activeSubscription?.addons && activeSubscription.addons.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeSubscription.addons.map((addonId) => {
                            const addon = availableAddons.find((a) => a.id === addonId);
                            return addon ? <Badge key={addonId} variant="outline">{addon.name}</Badge> : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">No add-ons selected.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCancelDialogOpen(true)} className="text-red-600">Cancel Subscription</Button>
                    </div>
                  </>
                ) : (
                  <p>No plan information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </div>
                <Button onClick={() => setShowAddPayment(true)}><Plus className="mr-2 h-4 w-4" /> Add Method</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className={cn("flex items-start justify-between p-4 rounded-lg border transition-colors", pm.isDefault ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-muted/50")}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {pm.type === "card" ? <CreditCard className="h-6 w-6" /> : pm.type === "paypal" ? <Wallet className="h-6 w-6" /> : <Landmark className="h-6 w-6" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{pm.type === "card" ? pm.brand : pm.type === "paypal" ? "PayPal" : pm.bankName}</h3>
                          <p className="text-sm text-muted-foreground">{pm.type === "card" ? `•••• ${pm.last4}` : pm.type === "paypal" ? pm.email : pm.bankName}{pm.expiry && ` · Exp ${pm.expiry}`}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <PaymentMethodStatusBadge status={pm.status} />
                        <div className="flex gap-2">
                          {!pm.isDefault && <Button variant="ghost" size="sm" onClick={() => setDefaultPaymentMethod(pm.id)}>Set Default</Button>}
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removePaymentMethod(pm.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Invoices */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>View and download your billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoices..." value={searchInvoice} onChange={(e) => { setSearchInvoice(e.target.value); setPage(1); }} className="pl-10" />
                  </div>
                  <Select value={invoiceStatusFilter} onValueChange={(v) => setInvoiceStatusFilter(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {paginatedInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                      <div>
                        <p className="font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{inv.date} · {inv.planName} ({inv.period})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${inv.amount.toFixed(2)}</span>
                        <InvoiceStatusBadge status={inv.status} />
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  {paginatedInvoices.length === 0 && <div className="text-center py-8 text-muted-foreground">No invoices found.</div>}
                </div>
                <Pagination currentPage={page} totalPages={totalInvoicePages} onPageChange={setPage} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing & Plans Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Plans & Pricing</h2>
          {loadingPlans ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#0177fb] animate-spin" /><span className="ml-3 text-lg text-gray-500">Loading plans...</span></div>
          ) : errorPlans ? (
            <div className="text-center py-20"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-red-600 font-semibold mb-2">Failed to load plans</p><p className="text-gray-500">{errorPlans}</p></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20"><Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-600 font-semibold">No plans available</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, idx) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  isSelected={plan._id === activeSubscription?.plan?._id}
                  onSelect={handlePlanSelect}
                  colorIndex={idx}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal open={showAddPayment} onOpenChange={setShowAddPayment} />
      {/* Invoice Details Modal */}
      <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />

      {/* Plan Change Dialog */}
      <Dialog open={planChangeDialogOpen} onOpenChange={setPlanChangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>You are switching to {planToChange?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <span>Current Plan</span>
                <span>{currentPlan?.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>New Plan</span>
                <span className="font-bold">{planToChange?.name}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm">
                <span>Price Difference</span>
                <span className="font-bold">
                  {planToChange && currentPlan ? `$${(planToChange.price.amount - currentPlan.price.amount).toFixed(2)}` : ""}
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPlanChangeDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmPlanChange} disabled={changingPlan}>
                {changingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Change
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>Are you sure you want to cancel your subscription? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end py-4">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
            <Button variant="destructive" onClick={confirmCancelSubscription} disabled={changingPlan}>
              {changingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cancel Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add-ons Management Dialog */}
      <Dialog open={showAddonModal} onOpenChange={setShowAddonModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Add-ons</DialogTitle>
            <DialogDescription>Select add-ons to include with your plan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableAddons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium">{addon.name}</h4>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                  <p className="text-xs text-muted-foreground">${addon.price}/{addon.billingCycle}</p>
                </div>
                <Button
                  variant={selectedAddons.includes(addon.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleAddon(addon.id)}
                >
                  {selectedAddons.includes(addon.id) ? <><MinusCircle className="mr-1 h-4 w-4" /> Remove</> : <><PlusCircle className="mr-1 h-4 w-4" /> Add</>}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddonModal(false)}>Cancel</Button>
            <Button onClick={saveAddons}>Save Add-ons</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Add Payment Method Modal ----------
function AddPaymentMethodModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [methodType, setMethodType] = useState<PaymentMethodType>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");

  const handleSubmit = () => {
    onOpenChange(false);
    toast.success("Payment method added successfully");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    setName("");
    setEmail("");
    setBankName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>Add a new card, PayPal, or bank account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Method Type</label>
            <Select value={methodType} onValueChange={(v) => setMethodType(v as PaymentMethodType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank">Bank Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {methodType === "card" && (
            <>
              <div>
                <label className="text-sm font-medium">Card Number</label>
                <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Expiry</label>
                  <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
                <div>
                  <label className="text-sm font-medium">CVC</label>
                  <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
                </div>
              </div>
            </>
          )}
          {methodType === "paypal" && (
            <div>
              <label className="text-sm font-medium">PayPal Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          )}
          {methodType === "bank" && (
            <>
              <div>
                <label className="text-sm font-medium">Account Holder Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium">Bank Name</label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank of America" />
              </div>
            </>
          )}
          <Button className="w-full" onClick={handleSubmit}>Add Method</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Invoice Details Modal ----------
function InvoiceDetailsModal({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  if (!invoice) return null;
  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>Detailed view of your billing invoice.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{invoice.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span>{invoice.dueDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span>{invoice.planName} ({invoice.period})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Line Items</h4>
            <div className="space-y-2">
              {invoice.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}