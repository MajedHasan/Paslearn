"use client";

import { useState, useMemo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Link2,
  Mail,
  Share2,
  Gift,
  Settings,
  ChevronRight,
  Wallet,
  Package,
  ShoppingCart,
  Award,
  MoreHorizontal,
  ExternalLink,
  Image as ImageIcon,
  GraduationCap,
  FileText,
  Video,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Megaphone,
  Palette,
  FileCode,
  MousePointerClick,
  Search,
  X,
  Filter,
  Layers,
  Puzzle,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subMonths, subYears } from "date-fns";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type ProgramTab = "platform" | "courses" | "digital" | "coaching" | "addons";
type ReferralStatus = "pending" | "completed" | "cancelled";
type DateRange = "3m" | "6m" | "12m" | "all";

interface Referral {
  id: string;
  name: string;
  email: string;
  date: string;
  status: ReferralStatus;
  commission: string;
  avatar?: string;
  program: ProgramTab;
}

interface PromoAsset {
  title: string;
  description: string;
  type: "banner" | "email" | "social" | "logo" | "adcopy" | "leadmagnet";
  icon: React.ElementType;
  color: string;
  code: string;
  actionLabel: string;
}

interface ProgramData {
  id: ProgramTab;
  label: string;
  icon: React.ElementType;
  description: string;
  commissionRate: string;
  earningsData: { month: string; earnings: number }[];
  topItems?: {
    rank: number;
    name: string;
    commission: string;
    affiliates: string;
    totalSales: string;
    tone: string;
  }[];
}

// ---------- Mock Data ----------
const overallEarningsData = [
  { month: "Jan", earnings: 900 },
  { month: "Feb", earnings: 1200 },
  { month: "Mar", earnings: 1400 },
  { month: "Apr", earnings: 1800 },
  { month: "May", earnings: 2200 },
  { month: "Jun", earnings: 2600 },
  { month: "Jul", earnings: 3100 },
];

const categoryBreakdownData = [
  { name: "Platform", value: 35, color: "#3b82f6" },
  { name: "Courses", value: 30, color: "#8b5cf6" },
  { name: "Digital", value: 20, color: "#ec4899" },
  { name: "Coaching", value: 15, color: "#f59e0b" },
  { name: "Addons", value: 10, color: "#10b981" },
];

const monthlyComparisonData = [
  { month: "Jan", Platform: 320, Courses: 280, Digital: 150, Coaching: 150, Addons: 80 },
  { month: "Feb", Platform: 450, Courses: 350, Digital: 180, Coaching: 180, Addons: 100 },
  { month: "Mar", Platform: 380, Courses: 400, Digital: 220, Coaching: 220, Addons: 120 },
  { month: "Apr", Platform: 550, Courses: 480, Digital: 260, Coaching: 260, Addons: 140 },
  { month: "May", Platform: 620, Courses: 550, Digital: 300, Coaching: 300, Addons: 160 },
  { month: "Jun", Platform: 710, Courses: 620, Digital: 340, Coaching: 340, Addons: 180 },
  { month: "Jul", Platform: 800, Courses: 700, Digital: 380, Coaching: 380, Addons: 200 },
];

const programs: ProgramData[] = [
  {
    id: "platform",
    label: "Platform",
    icon: GraduationCap,
    description: "Earn 30% when you refer new teachers to Paslearn.",
    commissionRate: "30%",
    earningsData: [
      { month: "Jan", earnings: 320 },
      { month: "Feb", earnings: 450 },
      { month: "Mar", earnings: 380 },
      { month: "Apr", earnings: 550 },
      { month: "May", earnings: 620 },
      { month: "Jun", earnings: 710 },
      { month: "Jul", earnings: 800 },
    ],
  },
  {
    id: "courses",
    label: "Courses",
    icon: FileText,
    description: "Promote courses and earn 10% commission per sale.",
    commissionRate: "10%",
    earningsData: [
      { month: "Jan", earnings: 150 },
      { month: "Feb", earnings: 180 },
      { month: "Mar", earnings: 220 },
      { month: "Apr", earnings: 260 },
      { month: "May", earnings: 300 },
      { month: "Jun", earnings: 340 },
      { month: "Jul", earnings: 380 },
    ],
    topItems: [
      { rank: 1, name: "Digital Marketing Mastery", commission: "$10", affiliates: "34", totalSales: "$3,46,660", tone: "bg-orange-200" },
      { rank: 2, name: "UI/UX Design Course", commission: "$15", affiliates: "34", totalSales: "$3,00,000", tone: "bg-purple-200" },
      { rank: 3, name: "AI for Beginners", commission: "$12", affiliates: "34", totalSales: "$1,20,000", tone: "bg-gray-200" },
      { rank: 4, name: "Mobile App Development", commission: "$14", affiliates: "22", totalSales: "$98,500", tone: "bg-green-200" },
    ],
  },
  {
    id: "digital",
    label: "Digital Products",
    icon: Package,
    description: "Earn 15% on every digital file purchase.",
    commissionRate: "15%",
    earningsData: [
      { month: "Jan", earnings: 90 },
      { month: "Feb", earnings: 110 },
      { month: "Mar", earnings: 130 },
      { month: "Apr", earnings: 150 },
      { month: "May", earnings: 170 },
      { month: "Jun", earnings: 190 },
      { month: "Jul", earnings: 210 },
    ],
    topItems: [
      { rank: 1, name: "E-book: Web Dev Guide", commission: "$8", affiliates: "28", totalSales: "$1,50,000", tone: "bg-pink-200" },
      { rank: 2, name: "Design Templates Pack", commission: "$12", affiliates: "20", totalSales: "$80,000", tone: "bg-blue-200" },
      { rank: 3, name: "Notion Productivity System", commission: "$10", affiliates: "15", totalSales: "$45,000", tone: "bg-yellow-200" },
    ],
  },
  {
    id: "coaching",
    label: "Online Coaching",
    icon: Video,
    description: "Earn 20% on every coaching session booked.",
    commissionRate: "20%",
    earningsData: [
      { month: "Jan", earnings: 120 },
      { month: "Feb", earnings: 150 },
      { month: "Mar", earnings: 180 },
      { month: "Apr", earnings: 220 },
      { month: "May", earnings: 260 },
      { month: "Jun", earnings: 300 },
      { month: "Jul", earnings: 340 },
    ],
    topItems: [
      { rank: 1, name: "1-on-1 Career Coaching", commission: "$25", affiliates: "18", totalSales: "$90,000", tone: "bg-blue-200" },
      { rank: 2, name: "Group Mentorship", commission: "$30", affiliates: "12", totalSales: "$60,000", tone: "bg-green-200" },
    ],
  },
  {
    id: "addons",
    label: "Addons",
    icon: Puzzle,
    description: "Earn 18% on add-on services like website builder, logo design, etc.",
    commissionRate: "18%",
    earningsData: [
      { month: "Jan", earnings: 80 },
      { month: "Feb", earnings: 100 },
      { month: "Mar", earnings: 120 },
      { month: "Apr", earnings: 140 },
      { month: "May", earnings: 160 },
      { month: "Jun", earnings: 180 },
      { month: "Jul", earnings: 200 },
    ],
    topItems: [
      { rank: 1, name: "Website Builder Pro", commission: "$20", affiliates: "10", totalSales: "$45,000", tone: "bg-teal-200" },
      { rank: 2, name: "Logo Design Package", commission: "$15", affiliates: "8", totalSales: "$30,000", tone: "bg-indigo-200" },
      { rank: 3, name: "Email Marketing Setup", commission: "$18", affiliates: "6", totalSales: "$22,000", tone: "bg-amber-200" },
    ],
  },
];

const allReferrals: Referral[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@x.com", date: "2024-05-12", status: "completed", commission: "$45.00", avatar: "https://i.pravatar.cc/150?img=1", program: "platform" },
  { id: "2", name: "Michael Chen", email: "michael@x.com", date: "2024-05-11", status: "pending", commission: "$30.00", avatar: "https://i.pravatar.cc/150?img=3", program: "courses" },
  { id: "3", name: "Emily Davis", email: "emily@x.com", date: "2024-05-10", status: "completed", commission: "$75.00", avatar: "https://i.pravatar.cc/150?img=5", program: "platform" },
  { id: "4", name: "James Wilson", email: "james@x.com", date: "2024-05-09", status: "cancelled", commission: "$0.00", avatar: "https://i.pravatar.cc/150?img=7", program: "digital" },
  { id: "5", name: "Linda Martinez", email: "linda@x.com", date: "2024-05-08", status: "completed", commission: "$52.50", avatar: "https://i.pravatar.cc/150?img=9", program: "coaching" },
  { id: "6", name: "Robert Brown", email: "robert@x.com", date: "2024-05-07", status: "completed", commission: "$28.00", avatar: "https://i.pravatar.cc/150?img=11", program: "addons" },
];

const promoAssets: PromoAsset[] = [
  {
    title: "Website Banner",
    description: "Eye-catching banner for your website or blog.",
    type: "banner",
    icon: ImageIcon,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    code: '<a href="https://paslearn.com/ref/teacher123"><img src="https://paslearn.com/banner.png" alt="Join Paslearn"/></a>',
    actionLabel: "Copy HTML",
  },
  {
    title: "Email Template",
    description: "Ready-to-send email to your subscribers.",
    type: "email",
    icon: Mail,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    code: "Subject: Learn with Paslearn!\n\nHi [Name],\n\nI've been using Paslearn for my online courses and it's amazing. Sign up with my link and get 20% off: https://paslearn.com/ref/teacher123",
    actionLabel: "Copy Email",
  },
  {
    title: "Social Media Posts",
    description: "Pre-written posts for Twitter, LinkedIn, etc.",
    type: "social",
    icon: Share2,
    color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    code: "🚀 Ready to level up your teaching? Join @Paslearn and get access to world-class tools. Use my link: https://paslearn.com/ref/teacher123 #edtech #onlinecourses",
    actionLabel: "View Posts",
  },
  {
    title: "Logo Pack",
    description: "Official Paslearn logos in various sizes.",
    type: "logo",
    icon: Palette,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    code: "Download link: https://paslearn.com/assets/logo-pack.zip",
    actionLabel: "Download",
  },
  {
    title: "Ad Copy Library",
    description: "High-converting ad copy for paid campaigns.",
    type: "adcopy",
    icon: FileCode,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    code: "Headline: Transform Your Teaching with Paslearn\nBody: Join thousands of educators...",
    actionLabel: "Copy Ad Copy",
  },
  {
    title: "Lead Magnet",
    description: "Free guide to attract potential referrals.",
    type: "leadmagnet",
    icon: Megaphone,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    code: "Download our free guide: https://paslearn.com/lead-magnet.pdf",
    actionLabel: "Get PDF",
  },
];

// ---------- Helper Components ----------
function useCopyToClipboard() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock3 className="mr-1 h-3 w-3" /> Pending</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>;
    default:
      return null;
  }
}

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="3m">Last 3 months</SelectItem>
        <SelectItem value="6m">Last 6 months</SelectItem>
        <SelectItem value="12m">Last 12 months</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ---------- Referral Link Modal ----------
function ReferralLinkModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { copied, copy } = useCopyToClipboard();
  const referralLink = "https://paslearn.com/ref/teacher123";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Your Referral Link
          </DialogTitle>
          <DialogDescription>
            Share this link anywhere. When someone signs up and buys within 30 days, you earn commission.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={() => copy(referralLink, "referral-link")}>
              {copied === "referral-link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === "referral-link" ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="mr-2 h-4 w-4" /> Email
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
          <div className="text-center">
            <Button variant="ghost" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" /> Preview Landing Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Withdraw Modal ----------
function WithdrawModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [method, setMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      alert("Withdrawal requested successfully!");
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Select a payment method and enter the amount you wish to withdraw.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Payment Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer (min $100)</SelectItem>
                <SelectItem value="paypal">PayPal (min $50)</SelectItem>
                <SelectItem value="gift">Gift Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Amount (USD)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available balance: $6,405.00
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleWithdraw}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isProcessing ? "Processing..." : "Request Withdrawal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function AffiliateDashboard() {
  const [activeTab, setActiveTab] = useState<ProgramTab>("platform");
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [showAllReferrals, setShowAllReferrals] = useState(false);
  const [referralStatusFilter, setReferralStatusFilter] = useState<"all" | ReferralStatus>("all");
  const [referralSearch, setReferralSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("6m");
  const [visiblePrograms, setVisiblePrograms] = useState<ProgramTab[]>(["platform", "courses", "digital", "coaching", "addons"]);

  const { copied, copy } = useCopyToClipboard();

  const currentProgram = programs.find((p) => p.id === activeTab)!;

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    let result = allReferrals;
    if (referralStatusFilter !== "all") {
      result = result.filter((r) => r.status === referralStatusFilter);
    }
    if (referralSearch) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(referralSearch.toLowerCase()) ||
        r.email.toLowerCase().includes(referralSearch.toLowerCase())
      );
    }
    return result;
  }, [referralStatusFilter, referralSearch]);

  const visibleReferrals = showAllReferrals ? filteredReferrals : filteredReferrals.slice(0, 5);

  // Filter chart data based on dateRange
  const filteredOverallEarnings = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    let startIndex = 0;
    if (dateRange === "3m") startIndex = months.length - 3;
    else if (dateRange === "6m") startIndex = months.length - 6;
    else if (dateRange === "12m") startIndex = months.length - 12;
    return overallEarningsData.slice(Math.max(0, startIndex));
  }, [dateRange]);

  const filteredMonthlyComparison = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    let startIndex = 0;
    if (dateRange === "3m") startIndex = months.length - 3;
    else if (dateRange === "6m") startIndex = months.length - 6;
    else if (dateRange === "12m") startIndex = months.length - 12;
    return monthlyComparisonData.slice(Math.max(0, startIndex));
  }, [dateRange]);

  const filteredProgramEarnings = (programId: ProgramTab) => {
    const data = programs.find(p => p.id === programId)?.earningsData || [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    let startIndex = 0;
    if (dateRange === "3m") startIndex = months.length - 3;
    else if (dateRange === "6m") startIndex = months.length - 6;
    else if (dateRange === "12m") startIndex = months.length - 12;
    return data.slice(Math.max(0, startIndex));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              Affiliate Dashboard
              <Sparkles className="h-7 w-7 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Earn up to <span className="font-semibold text-primary">30% commission</span> by sharing your unique link.{" "}
              <span className="hidden sm:inline">Your referrals get lifetime value, you get lifetime rewards.</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setReferralModalOpen(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Get Your Link
            </Button>
            <Button
              size="sm"
              onClick={() => setWithdrawModalOpen(true)}
              className="min-w-[130px] bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {[
            { label: "Total Earnings", value: "$6,405.00", sub: "+18% this month", icon: DollarSign, color: "text-emerald-500" },
            { label: "Pending", value: "$1,040.50", sub: "Payout on 15th", icon: Clock, color: "text-amber-500" },
            { label: "Referrals", value: "272", sub: "34 new this week", icon: Users, color: "text-blue-500" },
            { label: "Conversion", value: "5.2%", sub: "Industry avg 2.1%", icon: TrendingUp, color: "text-purple-500" },
          ].map((stat, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by:</span>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProgramTab)} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto bg-muted/50 p-1 rounded-xl">
            {programs.map((program) => (
              <TabsTrigger
                key={program.id}
                value={program.id}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <program.icon className="h-4 w-4" />
                {program.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {programs.map((program) => (
            <TabsContent key={program.id} value={program.id} className="space-y-6">
              {/* Program header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <program.icon className="h-6 w-6 text-primary" />
                    {program.label} Affiliate
                  </h3>
                  <p className="text-muted-foreground mt-1">{program.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {program.commissionRate} Commission
                  </Badge>
                </div>
              </div>

              {/* Program specific charts and stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Line Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Earnings Over Time</CardTitle>
                    <CardDescription>Monthly commission for {program.label.toLowerCase()}</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredProgramEarnings(program.id)}>
                        <defs>
                          <linearGradient id={`grad-${program.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill={`url(#grad-${program.id})`}
                          strokeWidth={2}
                          animationDuration={800}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Items or Quick Info */}
                {program.topItems ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Top {program.label}</CardTitle>
                      <CardDescription>Best performing items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                        {program.topItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block h-8 w-8 rounded-full ${item.tone}`} />
                              <div>
                                <p className="text-sm font-medium leading-none">{item.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">Commission: {item.commission}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold">{item.totalSales}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Program Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referrals</span>
                        <span className="font-semibold">128</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion</span>
                        <span className="font-semibold">4.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Commission</span>
                        <span className="font-semibold">$22.50</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Overall Analytics Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Programs
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Toggle Programs</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {programs.map((p) => (
                  <DropdownMenuCheckboxItem
                    key={p.id}
                    checked={visiblePrograms.includes(p.id)}
                    onCheckedChange={(checked) => {
                      setVisiblePrograms(prev =>
                        checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                      );
                    }}
                  >
                    <p.icon className="mr-2 h-4 w-4" />
                    {p.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Earnings Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Earnings</CardTitle>
                <CardDescription>Total commission across all programs</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredOverallEarnings}>
                    <defs>
                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorOverall)"
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Earnings Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Distribution by program</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdownData.filter(d => visiblePrograms.includes(d.name.toLowerCase() as ProgramTab) || d.name === "Platform" && visiblePrograms.includes("platform") || d.name === "Courses" && visiblePrograms.includes("courses") || d.name === "Digital" && visiblePrograms.includes("digital") || d.name === "Coaching" && visiblePrograms.includes("coaching") || d.name === "Addons" && visiblePrograms.includes("addons"))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Comparison Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Earnings per program per month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredMonthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {visiblePrograms.includes("platform") && <Bar dataKey="Platform" fill="#3b82f6" animationDuration={800} />}
                    {visiblePrograms.includes("courses") && <Bar dataKey="Courses" fill="#8b5cf6" animationDuration={800} />}
                    {visiblePrograms.includes("digital") && <Bar dataKey="Digital" fill="#ec4899" animationDuration={800} />}
                    {visiblePrograms.includes("coaching") && <Bar dataKey="Coaching" fill="#f59e0b" animationDuration={800} />}
                    {visiblePrograms.includes("addons") && <Bar dataKey="Addons" fill="#10b981" animationDuration={800} />}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Referrals with Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>People who signed up or purchased via your link</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search referrals..."
                    value={referralSearch}
                    onChange={(e) => setReferralSearch(e.target.value)}
                    className="pl-8 w-full sm:w-auto"
                  />
                </div>
                <Select value={referralStatusFilter} onValueChange={(value) => setReferralStatusFilter(value as any)}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            {visibleReferrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No referrals found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {visibleReferrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={ref.avatar} alt={ref.name} />
                        <AvatarFallback>{ref.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{ref.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ref.date}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {programs.find(p => p.id === ref.program)?.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold">{ref.commission}</span>
                      <StatusBadge status={ref.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-3" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAllReferrals(!showAllReferrals)}
            >
              {showAllReferrals ? "Show less" : "View all referrals"}
              <ChevronRight className={`h-4 w-4 transition-transform ${showAllReferrals ? "rotate-90" : ""}`} />
            </Button>
          </CardContent>
        </Card>

        {/* Promotional Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Promotional Arsenal</CardTitle>
            <CardDescription>Everything you need to spread the word and earn more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoAssets.map((asset, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-shadow group"
                >
                  <div className={`p-3 rounded-lg ${asset.color} group-hover:scale-110 transition-transform`}>
                    <asset.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{asset.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{asset.description}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-primary"
                      onClick={() => copy(asset.code, `asset-${idx}`)}
                    >
                      {copied === `asset-${idx}` ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          {asset.actionLabel}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Methods</CardTitle>
            <CardDescription>Choose how you want to get paid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Minimum $100</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Minimum $50</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Gift Card</p>
                    <p className="text-sm text-muted-foreground">Amazon, etc.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ReferralLinkModal open={referralModalOpen} onOpenChange={setReferralModalOpen} />
      <WithdrawModal open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} />
    </div>
  );
}