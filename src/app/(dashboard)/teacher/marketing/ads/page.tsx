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
  Megaphone,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  BarChart3,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Target,
  Calendar,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Palette,
  Sparkles,
  Filter,
  Download,
  Share2,
  Video,
  FileText,
  Wand2,
  GraduationCap,
  Briefcase,
  Package,
  Rocket,
  Lightbulb,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  LineChart,
  Line,
} from "recharts";

// ---------- Types ----------
type CampaignStatus = "active" | "paused" | "ended" | "pending";
type AdObjective = "awareness" | "traffic" | "conversions" | "engagement";
type BidStrategy = "lowest_cost" | "target_cost" | "highest_value";
type AdCreativeType = "image" | "video" | "text" | "carousel";
type PromotionTarget = "course" | "coaching" | "digital";
type ItemStatus = "eligible" | "promoting" | "ineligible";

interface PromotableItem {
  id: string;
  name: string;
  type: PromotionTarget;
  price: number;
  thumbnail?: string;
  description: string;
  status: ItemStatus;
  campaignId?: string;
}

interface AdCreative {
  id: string;
  name: string;
  type: AdCreativeType;
  thumbnail?: string;
  content: string;
  createdAt: string;
}

interface AdCampaign {
  id: string;
  name: string;
  objective: AdObjective;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  startDate: string;
  endDate?: string;
  targetAudience: string[];
  bidStrategy: BidStrategy;
  creativeId?: string;
  promotionTarget: PromotionTarget;
  promotedItemId: string;
  createdAt: string;
}

// ---------- Mock Data ----------
const promotableItems: PromotableItem[] = [
  {
    id: "course-101",
    name: "Web Development Bootcamp",
    type: "course",
    price: 199,
    thumbnail: "https://via.placeholder.com/80x80.png?text=WD",
    description: "Full-stack web development with React and Node.",
    status: "eligible",
  },
  {
    id: "course-102",
    name: "UI/UX Design Mastery",
    type: "course",
    price: 149,
    thumbnail: "https://via.placeholder.com/80x80.png?text=UX",
    description: "Learn design thinking and prototyping.",
    status: "promoting",
    campaignId: "camp-001",
  },
  {
    id: "course-103",
    name: "Digital Marketing Pro",
    type: "course",
    price: 179,
    thumbnail: "https://via.placeholder.com/80x80.png?text=DM",
    description: "SEO, social media, and email marketing.",
    status: "eligible",
  },
  {
    id: "coach-301",
    name: "1-on-1 Career Coaching",
    type: "coaching",
    price: 250,
    thumbnail: "https://via.placeholder.com/80x80.png?text=CC",
    description: "Personalized career guidance session.",
    status: "eligible",
  },
  {
    id: "coach-302",
    name: "Group Mentorship Program",
    type: "coaching",
    price: 80,
    thumbnail: "https://via.placeholder.com/80x80.png?text=GM",
    description: "Monthly group mentoring for up to 5 people.",
    status: "promoting",
    campaignId: "camp-002",
  },
  {
    id: "digital-201",
    name: "E-book: Web Dev Guide",
    type: "digital",
    price: 29,
    thumbnail: "https://via.placeholder.com/80x80.png?text=EB",
    description: "Comprehensive guide to modern web development.",
    status: "eligible",
  },
  {
    id: "digital-202",
    name: "Design Templates Pack",
    type: "digital",
    price: 49,
    thumbnail: "https://via.placeholder.com/80x80.png?text=DT",
    description: "Figma and Sketch templates for designers.",
    status: "promoting",
    campaignId: "camp-003",
  },
];

const initialCampaigns: AdCampaign[] = [
  {
    id: "camp-001",
    name: "Summer Course Launch",
    objective: "conversions",
    status: "active",
    budget: 500,
    spent: 320,
    impressions: 54000,
    clicks: 2100,
    ctr: 3.89,
    conversions: 85,
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    targetAudience: ["United States", "Canada", "Age 18-34", "Interested in online learning"],
    bidStrategy: "lowest_cost",
    creativeId: "creative-001",
    promotionTarget: "course",
    promotedItemId: "course-102",
    createdAt: "2024-06-25",
  },
  {
    id: "camp-002",
    name: "Brand Awareness Pro",
    objective: "awareness",
    status: "active",
    budget: 300,
    spent: 120,
    impressions: 87000,
    clicks: 1300,
    ctr: 1.49,
    conversions: 0,
    startDate: "2024-07-05",
    targetAudience: ["United Kingdom", "Australia", "All ages"],
    bidStrategy: "target_cost",
    creativeId: "creative-002",
    promotionTarget: "coaching",
    promotedItemId: "coach-302",
    createdAt: "2024-07-01",
  },
  {
    id: "camp-003",
    name: "Digital Product Promo",
    objective: "traffic",
    status: "paused",
    budget: 200,
    spent: 80,
    impressions: 12000,
    clicks: 400,
    ctr: 3.33,
    conversions: 12,
    startDate: "2024-06-15",
    endDate: "2024-06-30",
    targetAudience: ["Germany", "France", "Age 25-44"],
    bidStrategy: "highest_value",
    creativeId: "creative-003",
    promotionTarget: "digital",
    promotedItemId: "digital-202",
    createdAt: "2024-06-10",
  },
];

const initialCreatives: AdCreative[] = [
  {
    id: "creative-001",
    name: "Summer Banner",
    type: "image",
    thumbnail: "https://via.placeholder.com/300x150.png?text=Summer+Sale",
    content: "Summer Course Sale - 20% Off",
    createdAt: "2024-06-20",
  },
  {
    id: "creative-002",
    name: "Brand Video",
    type: "video",
    thumbnail: "https://via.placeholder.com/300x150.png?text=Brand+Video",
    content: "Watch our story",
    createdAt: "2024-06-28",
  },
  {
    id: "creative-003",
    name: "Text Ad",
    type: "text",
    content: "Learn digital marketing today",
    createdAt: "2024-06-10",
  },
];

const performanceTrend = [
  { date: "Jul 01", impressions: 8500, clicks: 320, spend: 45 },
  { date: "Jul 02", impressions: 9200, clicks: 355, spend: 52 },
  { date: "Jul 03", impressions: 7800, clicks: 290, spend: 40 },
  { date: "Jul 04", impressions: 10200, clicks: 410, spend: 58 },
  { date: "Jul 05", impressions: 11500, clicks: 475, spend: 65 },
  { date: "Jul 06", impressions: 10800, clicks: 430, spend: 60 },
  { date: "Jul 07", impressions: 12100, clicks: 500, spend: 70 },
];

const objectiveDistribution = [
  { name: "Conversions", value: 45, color: "#3b82f6" },
  { name: "Awareness", value: 25, color: "#10b981" },
  { name: "Traffic", value: 20, color: "#f59e0b" },
  { name: "Engagement", value: 10, color: "#8b5cf6" },
];

const deviceBreakdown = [
  { device: "Mobile", impressions: 45000, clicks: 1800 },
  { device: "Desktop", impressions: 30000, clicks: 1200 },
  { device: "Tablet", impressions: 12000, clicks: 400 },
];

const aiRecommendations = [
  {
    id: "rec-001",
    icon: Lightbulb,
    title: "Increase budget for Summer Course Launch",
    description: "This campaign is performing well. Consider increasing daily budget by 20%.",
    impact: "High",
  },
  {
    id: "rec-002",
    icon: TrendingUp,
    title: "Try new audience segment",
    description: "Expand targeting to include ages 35-44 for better reach.",
    impact: "Medium",
  },
  {
    id: "rec-003",
    icon: AlertTriangle,
    title: "Pause underperforming ad",
    description: "Digital Product Promo has low CTR. Consider pausing and optimizing creative.",
    impact: "High",
  },
];

// ---------- Helper Components ----------
function StatusBadge({ status }: { status: CampaignStatus }) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Active</Badge>;
    case "paused": return <Badge className="bg-yellow-100 text-yellow-800"><PauseCircle className="mr-1 h-3 w-3" /> Paused</Badge>;
    case "ended": return <Badge className="bg-gray-100 text-gray-800"><XCircle className="mr-1 h-3 w-3" /> Ended</Badge>;
    case "pending": return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Pending</Badge>;
    default: return null;
  }
}

function TargetBadge({ target }: { target: PromotionTarget }) {
  switch (target) {
    case "course": return <Badge variant="outline"><GraduationCap className="mr-1 h-3 w-3" /> Course</Badge>;
    case "coaching": return <Badge variant="outline"><Briefcase className="mr-1 h-3 w-3" /> Coaching</Badge>;
    case "digital": return <Badge variant="outline"><Package className="mr-1 h-3 w-3" /> Digital</Badge>;
    default: return null;
  }
}

function ItemStatusBadge({ status }: { status: ItemStatus }) {
  switch (status) {
    case "eligible": return <Badge variant="outline">Eligible</Badge>;
    case "promoting": return <Badge className="bg-indigo-100 text-indigo-800">Promoting</Badge>;
    case "ineligible": return <Badge variant="outline" className="text-muted-foreground">Ineligible</Badge>;
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

// ---------- Campaign Wizard Modal ----------
function CampaignModal({
  open,
  onOpenChange,
  campaign,
  onSave,
  initialTarget,
  initialItemId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: AdCampaign | null;
  onSave: (campaign: AdCampaign) => void;
  initialTarget?: PromotionTarget;
  initialItemId?: string;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AdCampaign>>(
    campaign || {
      name: "",
      objective: "conversions",
      status: "pending",
      budget: 100,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      targetAudience: [],
      bidStrategy: "lowest_cost",
      promotionTarget: initialTarget || "course",
      promotedItemId: initialItemId || "",
    }
  );

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    const newCampaign: AdCampaign = {
      id: campaign?.id || `camp-${Date.now()}`,
      name: formData.name || "Untitled Campaign",
      objective: (formData.objective as AdObjective) || "conversions",
      status: (formData.status as CampaignStatus) || "pending",
      budget: formData.budget || 0,
      spent: campaign?.spent || 0,
      impressions: campaign?.impressions || 0,
      clicks: campaign?.clicks || 0,
      ctr: campaign?.ctr || 0,
      conversions: campaign?.conversions || 0,
      startDate: formData.startDate || new Date().toISOString().slice(0, 10),
      endDate: formData.endDate,
      targetAudience: formData.targetAudience || [],
      bidStrategy: (formData.bidStrategy as BidStrategy) || "lowest_cost",
      creativeId: formData.creativeId,
      promotionTarget: (formData.promotionTarget as PromotionTarget) || "course",
      promotedItemId: formData.promotedItemId || "",
      createdAt: campaign?.createdAt || new Date().toISOString().slice(0, 10),
    };
    onSave(newCampaign);
    onOpenChange(false);
    setStep(1);
  };

  // Filter promotable items based on selected target
  const availableItems = promotableItems.filter((item) => item.type === formData.promotionTarget && item.status !== "promoting" && item.status !== "ineligible");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
          <DialogDescription>Configure your advertising campaign in a few steps.</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium", step === s ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground")}>
                {s}
              </div>
              {s < 4 && <div className="w-8 h-px bg-muted-foreground/30" />}
            </div>
          ))}
        </div>

        <div className="space-y-6 py-4">
          {/* Step 1: Promotion Target & Item */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Target className="h-5 w-5 text-indigo-500" /> What do you want to promote?</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "course", label: "Course", icon: GraduationCap },
                  { value: "coaching", label: "Coaching", icon: Briefcase },
                  { value: "digital", label: "Digital File", icon: Package },
                ].map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all",
                      formData.promotionTarget === item.value ? "border-indigo-500 bg-indigo-50" : "hover:bg-muted/50"
                    )}
                    onClick={() => setFormData({ ...formData, promotionTarget: item.value as PromotionTarget, promotedItemId: "" })}
                  >
                    <item.icon className="h-8 w-8 text-indigo-500" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Item Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Specific Item</label>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                  {availableItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No eligible items of this type.</p>
                  ) : (
                    availableItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          formData.promotedItemId === item.id ? "border-indigo-500 bg-indigo-50" : "hover:bg-muted/50"
                        )}
                        onClick={() => setFormData({ ...formData, promotedItemId: item.id })}
                      >
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                          {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price}</p>
                        </div>
                        {formData.promotedItemId === item.id && <CheckCircle2 className="h-5 w-5 text-indigo-500" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campaign Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Megaphone className="h-5 w-5 text-indigo-500" /> Campaign Details</h3>
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Summer Sale Promotion" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Objective</label>
                  <Select value={formData.objective} onValueChange={(v) => setFormData({ ...formData, objective: v as AdObjective })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Bid Strategy</label>
                  <Select value={formData.bidStrategy} onValueChange={(v) => setFormData({ ...formData, bidStrategy: v as BidStrategy })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                      <SelectItem value="target_cost">Target Cost</SelectItem>
                      <SelectItem value="highest_value">Highest Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Schedule */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-indigo-500" /> Budget & Schedule</h3>
              <div>
                <label className="text-sm font-medium">Daily Budget ($)</label>
                <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date (optional)</label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Creative & Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-indigo-500" /> Ad Creative</h3>
              <div>
                <label className="text-sm font-medium">Select Creative</label>
                <Select value={formData.creativeId} onValueChange={(v) => setFormData({ ...formData, creativeId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose creative" /></SelectTrigger>
                  <SelectContent>
                    {initialCreatives.map((creative) => (
                      <SelectItem key={creative.id} value={creative.id}>{creative.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border p-4 bg-muted/30">
                <h4 className="font-medium mb-2">Review</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Promotion Target:</strong> {formData.promotionTarget}</div>
                  <div><strong>Selected Item:</strong> {promotableItems.find(i => i.id === formData.promotedItemId)?.name || "Not selected"}</div>
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Objective:</strong> {formData.objective}</div>
                  <div><strong>Daily Budget:</strong> ${formData.budget}</div>
                  <div><strong>Duration:</strong> {formData.startDate} to {formData.endDate || "ongoing"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && <Button variant="outline" onClick={handleBack}>Back</Button>}
            <div className="ml-auto flex gap-2">
              {step < 4 ? <Button onClick={handleNext}>Next</Button> : <Button onClick={handleSubmit}>{campaign ? "Save Changes" : "Create Campaign"}</Button>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Creative Library Modal ----------
function CreativeLibraryModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ad Creatives</DialogTitle>
          <DialogDescription>Manage your ad images, videos, and text.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button><Upload className="mr-2 h-4 w-4" /> Upload Creative</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialCreatives.map((creative) => (
              <Card key={creative.id} className="overflow-hidden">
                <div className="h-32 bg-muted flex items-center justify-center">
                  {creative.type === "image" ? <ImageIcon className="h-10 w-10 text-muted-foreground" /> : creative.type === "video" ? <Video className="h-10 w-10 text-muted-foreground" /> : <FileText className="h-10 w-10 text-muted-foreground" />}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm">{creative.name}</p>
                  <p className="text-xs text-muted-foreground">{creative.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(initialCampaigns);
  const [promotableItemsState, setPromotableItemsState] = useState<PromotableItem[]>(promotableItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CampaignStatus>("all");
  const [targetFilter, setTargetFilter] = useState<"all" | PromotionTarget>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [creativeModalOpen, setCreativeModalOpen] = useState(false);
  const [initialTarget, setInitialTarget] = useState<PromotionTarget | undefined>(undefined);
  const [initialItemId, setInitialItemId] = useState<string | undefined>(undefined);

  // Stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  // Filter & search
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];
    if (searchQuery) result = result.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    if (targetFilter !== "all") result = result.filter((c) => c.promotionTarget === targetFilter);
    return result;
  }, [campaigns, searchQuery, statusFilter, targetFilter]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSaveCampaign = (campaign: AdCampaign) => {
    setCampaigns((prev) => {
      const exists = prev.find((c) => c.id === campaign.id);
      if (exists) return prev.map((c) => (c.id === campaign.id ? campaign : c));
      return [campaign, ...prev];
    });
    // Update item status
    setPromotableItemsState(prev =>
      prev.map(item =>
        item.id === campaign.promotedItemId ? { ...item, status: "promoting", campaignId: campaign.id } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setPromotableItemsState(prev =>
        prev.map(item =>
          item.id === campaign.promotedItemId ? { ...item, status: "eligible", campaignId: undefined } : item
        )
      );
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePauseResume = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)));
  };

  const handleDuplicate = (id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      const duplicate = { ...campaign, id: `camp-${Date.now()}`, name: `${campaign.name} (Copy)`, status: "pending" as CampaignStatus };
      setCampaigns((prev) => [duplicate, ...prev]);
    }
  };

  const openCreateForItem = (target: PromotionTarget, itemId: string) => {
    setInitialTarget(target);
    setInitialItemId(itemId);
    setEditingCampaign(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <Megaphone className="h-10 w-10 text-indigo-500" /> Ads Manager
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Promote your courses, coaching, and digital files.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreativeModalOpen(true)}>
              <Palette className="mr-2 h-4 w-4" /> Creatives
            </Button>
            <Button size="lg" onClick={() => { setEditingCampaign(null); setInitialTarget(undefined); setInitialItemId(undefined); setModalOpen(true); }}>
              <Plus className="mr-2 h-5 w-5" /> New Campaign
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Campaigns</TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Items</TabsTrigger>
            <TabsTrigger value="creatives" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Creatives</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Campaigns" value={totalCampaigns.toString()} icon={Megaphone} color="text-indigo-500" />
              <StatCard label="Active" value={activeCampaigns.toString()} icon={CheckCircle2} color="text-green-500" />
              <StatCard label="Total Spend" value={`$${totalSpent.toFixed(2)}`} icon={DollarSign} color="text-blue-500" />
              <StatCard label="Avg. CTR" value={`${avgCTR}%`} icon={TrendingUp} color="text-purple-500" />
            </div>

            {/* Performance Chart + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Impressions, clicks, and spend over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrend}>
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="impressions" stroke="#6366f1" fillOpacity={1} fill="url(#colorImpressions)" />
                      <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-500" /> AI Recommendations</CardTitle>
                  <CardDescription>Smart suggestions to improve performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <rec.icon className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto flex-shrink-0">{rec.impact}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="relative w-full lg:w-auto flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search campaigns..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={targetFilter} onValueChange={(v) => setTargetFilter(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Target" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Targets</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                    <SelectItem value="digital">Digital File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campaign Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Campaign</th>
                        <th className="p-3 text-left font-medium">Promoted Item</th>
                        <th className="p-3 text-left font-medium">Target</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Budget</th>
                        <th className="p-3 text-left font-medium">Spend</th>
                        <th className="p-3 text-left font-medium">Impressions</th>
                        <th className="p-3 text-left font-medium">Clicks</th>
                        <th className="p-3 text-left font-medium">CTR</th>
                        <th className="p-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCampaigns.map((campaign) => {
                        const item = promotableItemsState.find(i => i.id === campaign.promotedItemId);
                        return (
                          <tr key={campaign.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-xs text-muted-foreground">Since {campaign.startDate}</p>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                                  {item?.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                                </div>
                                <span className="font-medium">{item?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="p-3"><TargetBadge target={campaign.promotionTarget} /></td>
                            <td className="p-3"><StatusBadge status={campaign.status} /></td>
                            <td className="p-3">${campaign.budget}</td>
                            <td className="p-3">${campaign.spent.toFixed(2)}</td>
                            <td className="p-3">{campaign.impressions.toLocaleString()}</td>
                            <td className="p-3">{campaign.clicks.toLocaleString()}</td>
                            <td className="p-3">{campaign.ctr}%</td>
                            <td className="p-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setEditingCampaign(campaign); setModalOpen(true); }}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  {campaign.status !== "ended" && (
                                    <DropdownMenuItem onClick={() => handlePauseResume(campaign.id)}>
                                      {campaign.status === "active" ? <><PauseCircle className="mr-2 h-4 w-4" /> Pause</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Resume</>}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDuplicate(campaign.id)}>
                                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(campaign.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedCampaigns.length === 0 && (
                        <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No campaigns found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotableItemsState.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.price}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TargetBadge target={item.type} />
                        <ItemStatusBadge status={item.status} />
                      </div>
                      {item.status === "eligible" && (
                        <Button size="sm" onClick={() => openCreateForItem(item.type, item.id)}>
                          <Megaphone className="mr-2 h-4 w-4" /> Promote
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <div className="flex justify-end">
              <Button><Upload className="mr-2 h-4 w-4" /> Upload Creative</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {initialCreatives.map((creative) => (
                <Card key={creative.id} className="overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    {creative.type === "image" ? <ImageIcon className="h-12 w-12 text-muted-foreground" /> : creative.type === "video" ? <Video className="h-12 w-12 text-muted-foreground" /> : <FileText className="h-12 w-12 text-muted-foreground" />}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{creative.name}</h3>
                    <p className="text-sm text-muted-foreground">{creative.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Objective Distribution</CardTitle>
                  <CardDescription>Campaigns by objective</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={objectiveDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {objectiveDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Performance by device type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="device" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" fill="#6366f1" />
                      <Bar dataKey="clicks" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Campaign Modal */}
      <CampaignModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
        initialTarget={initialTarget}
        initialItemId={initialItemId}
      />

      {/* Creative Library Modal */}
      <CreativeLibraryModal open={creativeModalOpen} onOpenChange={setCreativeModalOpen} />
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

// ---------- Toggle Switch Component ----------
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