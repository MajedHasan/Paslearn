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
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Video,
  Plus,
  Search,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Check,
  Link2,
  Mail,
  Share2,
  Gift,
  Wallet,
  Settings,
  Package,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  PlayCircle,
  BookOpen,
  GraduationCap,
  Sparkles,
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
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending";
type PackageType = "1-on-1" | "group" | "mentorship";

interface CoachingSession {
  id: string;
  studentName: string;
  studentAvatar?: string;
  date: string; // ISO date
  time: string;
  duration: number; // minutes
  topic: string;
  status: SessionStatus;
  earnings: string;
  packageType: PackageType;
}

interface CoachingPackage {
  id: string;
  name: string;
  type: PackageType;
  price: number;
  duration: number; // minutes
  description: string;
  sessionsIncluded: number;
  active: boolean;
}

interface Review {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

// ---------- Mock Data ----------
// Generate more sessions for pagination demo
const allSessions: CoachingSession[] = [
  { id: "sess-001", studentName: "Sarah Johnson", studentAvatar: "https://i.pravatar.cc/150?img=1", date: "2024-05-20", time: "10:00 AM", duration: 60, topic: "Career Transition Strategy", status: "upcoming", earnings: "$150", packageType: "1-on-1" },
  { id: "sess-002", studentName: "Michael Chen", studentAvatar: "https://i.pravatar.cc/150?img=3", date: "2024-05-21", time: "2:00 PM", duration: 90, topic: "UX Portfolio Review", status: "upcoming", earnings: "$225", packageType: "mentorship" },
  { id: "sess-003", studentName: "Emily Davis", studentAvatar: "https://i.pravatar.cc/150?img=5", date: "2024-05-18", time: "11:00 AM", duration: 45, topic: "Interview Preparation", status: "completed", earnings: "$112.50", packageType: "1-on-1" },
  { id: "sess-004", studentName: "James Wilson", studentAvatar: "https://i.pravatar.cc/150?img=7", date: "2024-05-19", time: "3:30 PM", duration: 60, topic: "Startup Consulting", status: "cancelled", earnings: "$0", packageType: "group" },
  { id: "sess-005", studentName: "Linda Martinez", studentAvatar: "https://i.pravatar.cc/150?img=9", date: "2024-05-22", time: "9:00 AM", duration: 30, topic: "Quick Q&A", status: "pending", earnings: "$75", packageType: "1-on-1" },
  { id: "sess-006", studentName: "Robert Brown", studentAvatar: "https://i.pravatar.cc/150?img=11", date: "2024-05-23", time: "1:00 PM", duration: 60, topic: "Leadership Coaching", status: "upcoming", earnings: "$180", packageType: "mentorship" },
  { id: "sess-007", studentName: "Sophia Lee", studentAvatar: "https://i.pravatar.cc/150?img=13", date: "2024-05-24", time: "4:00 PM", duration: 45, topic: "Public Speaking", status: "upcoming", earnings: "$120", packageType: "1-on-1" },
  { id: "sess-008", studentName: "Daniel Kim", studentAvatar: "https://i.pravatar.cc/150?img=15", date: "2024-05-17", time: "10:30 AM", duration: 60, topic: "Time Management", status: "completed", earnings: "$150", packageType: "group" },
  { id: "sess-009", studentName: "Olivia Garcia", studentAvatar: "https://i.pravatar.cc/150?img=17", date: "2024-05-16", time: "2:30 PM", duration: 30, topic: "Resume Review", status: "cancelled", earnings: "$0", packageType: "1-on-1" },
  { id: "sess-010", studentName: "William Taylor", studentAvatar: "https://i.pravatar.cc/150?img=19", date: "2024-05-15", time: "11:30 AM", duration: 90, topic: "Business Strategy", status: "completed", earnings: "$225", packageType: "mentorship" },
  { id: "sess-011", studentName: "Ava Anderson", studentAvatar: "https://i.pravatar.cc/150?img=21", date: "2024-05-14", time: "9:30 AM", duration: 45, topic: "Mock Interview", status: "completed", earnings: "$112.50", packageType: "1-on-1" },
  { id: "sess-012", studentName: "Noah Martinez", studentAvatar: "https://i.pravatar.cc/150?img=23", date: "2024-05-13", time: "3:00 PM", duration: 60, topic: "Career Planning", status: "pending", earnings: "$150", packageType: "group" },
];

const packages: CoachingPackage[] = [
  { id: "pkg-001", name: "1-on-1 Career Coaching", type: "1-on-1", price: 150, duration: 60, description: "Personalized career guidance session.", sessionsIncluded: 1, active: true },
  { id: "pkg-002", name: "Group Mentorship Program", type: "group", price: 80, duration: 90, description: "Monthly group mentoring for up to 5 people.", sessionsIncluded: 4, active: true },
  { id: "pkg-003", name: "Executive Coaching Package", type: "mentorship", price: 500, duration: 120, description: "High-level coaching for executives.", sessionsIncluded: 6, active: false },
];

const reviews: Review[] = [
  { id: "rev-001", studentName: "Sarah Johnson", studentAvatar: "https://i.pravatar.cc/150?img=1", rating: 5, comment: "Amazing session! Very helpful and actionable advice.", date: "2024-05-15" },
  { id: "rev-002", studentName: "Michael Chen", studentAvatar: "https://i.pravatar.cc/150?img=3", rating: 4, comment: "Great portfolio review. Would recommend.", date: "2024-05-14" },
  { id: "rev-003", studentName: "Emily Davis", studentAvatar: "https://i.pravatar.cc/150?img=5", rating: 5, comment: "Helped me land my dream job!", date: "2024-05-12" },
  { id: "rev-004", studentName: "James Wilson", studentAvatar: "https://i.pravatar.cc/150?img=7", rating: 3, comment: "Good, but session started late.", date: "2024-05-10" },
];

const earningsData = [
  { month: "Jan", earnings: 1200, sessions: 20 },
  { month: "Feb", earnings: 1800, sessions: 25 },
  { month: "Mar", earnings: 1500, sessions: 22 },
  { month: "Apr", earnings: 2200, sessions: 30 },
  { month: "May", earnings: 2600, sessions: 35 },
  { month: "Jun", earnings: 2400, sessions: 32 },
  { month: "Jul", earnings: 3100, sessions: 40 },
];

// ---------- Helper Components ----------
function StatusBadge({ status }: { status: SessionStatus }) {
  switch (status) {
    case "upcoming":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Clock3 className="mr-1 h-3 w-3" /> Upcoming</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock3 className="mr-1 h-3 w-3" /> Pending</Badge>;
    default:
      return null;
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          )}
        />
      ))}
    </div>
  );
}

function DateRangePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ---------- Modals ----------
function NewSessionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [studentName, setStudentName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [topic, setTopic] = useState("");
  const [packageType, setPackageType] = useState<PackageType>("1-on-1");

  const handleCreate = () => {
    // Add session logic here
    alert("Session created (mock)");
    onOpenChange(false);
    // Reset form
    setStudentName("");
    setDate("");
    setTime("");
    setDuration("60");
    setTopic("");
    setPackageType("1-on-1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>Schedule a new coaching session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Student Name</label>
            <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (min)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Package Type</label>
              <Select value={packageType} onValueChange={(v) => setPackageType(v as PackageType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-on-1">1-on-1</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Topic</label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What will you cover?" />
          </div>
          <Button className="w-full" onClick={handleCreate}>Create Session</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewPackageModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PackageType>("1-on-1");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  const [sessionsIncluded, setSessionsIncluded] = useState("1");

  const handleCreate = () => {
    alert("Package created (mock)");
    onOpenChange(false);
    // Reset
    setName("");
    setType("1-on-1");
    setPrice("");
    setDuration("60");
    setDescription("");
    setSessionsIncluded("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Coaching Package</DialogTitle>
          <DialogDescription>Define a new coaching package for clients.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Package Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Career Boost Package" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as PackageType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-on-1">1-on-1</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Price ($)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Duration (min)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sessions Included</label>
              <Input type="number" value={sessionsIncluded} onChange={(e) => setSessionsIncluded(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </div>
          <Button className="w-full" onClick={handleCreate}>Create Package</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function CoachingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"all" | SessionStatus>("all");
  const [sessionSearch, setSessionSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let result = allSessions;
    if (sessionStatusFilter !== "all") {
      result = result.filter((s) => s.status === sessionStatusFilter);
    }
    if (sessionSearch) {
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
          s.topic.toLowerCase().includes(sessionSearch.toLowerCase())
      );
    }
    return result;
  }, [sessionStatusFilter, sessionSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(start, start + itemsPerPage);
  }, [filteredSessions, currentPage]);

  // Filter earnings data based on dateRange (mock)
  const filteredEarningsData = useMemo(() => {
    if (dateRange === "all") return earningsData;
    const cutoff = dateRange === "7d" ? 5 : dateRange === "30d" ? 4 : 1;
    return earningsData.slice(Math.max(0, earningsData.length - cutoff));
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              Online Coaching
              <Video className="h-8 w-8 text-teal-500" />
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage your coaching sessions, packages, and earnings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setPackageModalOpen(true)}>
              <Package className="mr-2 h-4 w-4" />
              New Package
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setSessionModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {/* Quick Stats - distinct coaching metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {[
            { label: "Total Sessions", value: "128", sub: "+12 this month", icon: CalendarDays, color: "text-teal-500" },
            { label: "Hours Coached", value: "96", sub: "8.5 hrs this week", icon: Clock, color: "text-emerald-500" },
            { label: "Total Earnings", value: "$12,480", sub: "+18% this month", icon: DollarSign, color: "text-green-500" },
            { label: "Avg Rating", value: "4.8", sub: "Based on 56 reviews", icon: Star, color: "text-yellow-500" },
          ].map((stat, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-teal-100 dark:border-teal-900/50">
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

        {/* Main Tabs - horizontal scroll on mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-nowrap gap-2 overflow-x-auto w-full md:w-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Sessions</TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Calendar</TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-1"><Package className="h-4 w-4" /> Packages</TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-1"><Star className="h-4 w-4" /> Reviews</TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earnings Chart */}
              <Card className="lg:col-span-2 border-teal-100 dark:border-teal-900/50">
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>Your coaching income over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredEarningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke="#0d9488"
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                        strokeWidth={2}
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="border-teal-100 dark:border-teal-900/50">
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your next coaching appointments</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                    {allSessions.filter((s) => s.status === "upcoming" || s.status === "pending").slice(0, 4).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={session.studentAvatar} alt={session.studentName} />
                            <AvatarFallback>{session.studentName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{session.studentName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.date} at {session.time} • {session.duration} min
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={session.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab with Search, Filter, Pagination */}
          <TabsContent value="sessions" className="space-y-4">
            <Card className="border-teal-100 dark:border-teal-900/50">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <CardTitle>All Sessions</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sessions..."
                        value={sessionSearch}
                        onChange={(e) => { setSessionSearch(e.target.value); setCurrentPage(1); }}
                        className="pl-8 w-full sm:w-auto"
                      />
                    </div>
                    <Select value={sessionStatusFilter} onValueChange={(v) => { setSessionStatusFilter(v as any); setCurrentPage(1); }}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2">
                {paginatedSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No sessions found.</div>
                ) : (
                  <div className="space-y-3">
                    {paginatedSessions.map((session) => (
                      <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={session.studentAvatar} alt={session.studentName} />
                            <AvatarFallback>{session.studentName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{session.studentName}</p>
                            <p className="text-xs text-muted-foreground">{session.topic}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {session.date} at {session.time}
                          </div>
                          <div className="text-sm font-semibold">{session.earnings}</div>
                          <StatusBadge status={session.status} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Cancel</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="border-teal-100 dark:border-teal-900/50">
              <CardHeader>
                <CardTitle>Session Calendar</CardTitle>
                <CardDescription>Your coaching schedule at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                    <h3 className="text-lg font-semibold">May 2024</h3>
                    <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                      <div key={day} className="font-medium py-2">{day}</div>
                    ))}
                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      const dayStr = `2024-05-${String(day).padStart(2, '0')}`;
                      const sessionsOnDay = allSessions.filter(s => s.date === dayStr);
                      return (
                        <div
                          key={day}
                          className={cn(
                            "h-14 rounded-md border p-1 relative",
                            sessionsOnDay.length > 0
                              ? "bg-teal-50 border-teal-200 hover:bg-teal-100 cursor-pointer dark:bg-teal-900/20 dark:border-teal-800"
                              : "border-border"
                          )}
                        >
                          <span className="text-xs">{day}</span>
                          {sessionsOnDay.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {sessionsOnDay.slice(0, 3).map((s, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    s.status === "completed" ? "bg-green-500" :
                                    s.status === "upcoming" ? "bg-blue-500" :
                                    s.status === "cancelled" ? "bg-red-500" : "bg-yellow-500"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card className="border-teal-100 dark:border-teal-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Coaching Packages</CardTitle>
                  <CardDescription>Manage your offerings and pricing</CardDescription>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setPackageModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Package
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className="hover:shadow-md transition-shadow border-teal-50 dark:border-teal-900/30">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{pkg.name}</h3>
                            <p className="text-sm text-muted-foreground">{pkg.type}</p>
                          </div>
                          <Badge variant={pkg.active ? "default" : "secondary"}>
                            {pkg.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-bold">${pkg.price}</span>
                          <span className="text-sm text-muted-foreground">/ session</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {pkg.duration} min
                          <span className="mx-1">•</span>
                          {pkg.sessionsIncluded} sessions
                        </div>
                        <p className="mt-2 text-sm">{pkg.description}</p>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <Card className="border-teal-100 dark:border-teal-900/50">
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
                <CardDescription>What your students are saying</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.studentAvatar} alt={review.studentName} />
                        <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.studentName}</p>
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className="text-sm mt-1">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-teal-100 dark:border-teal-900/50">
                <CardHeader>
                  <CardTitle>Earnings Analytics</CardTitle>
                  <CardDescription>Detailed breakdown of your coaching income</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredEarningsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="earnings" fill="#0d9488" animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-teal-100 dark:border-teal-900/50">
                <CardHeader>
                  <CardTitle>Sessions per Month</CardTitle>
                  <CardDescription>Number of coaching sessions conducted</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredEarningsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#f59e0b" animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewSessionModal open={sessionModalOpen} onOpenChange={setSessionModalOpen} />
      <NewPackageModal open={packageModalOpen} onOpenChange={setPackageModalOpen} />
    </div>
  );
}