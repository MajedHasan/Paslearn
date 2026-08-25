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
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  File,
  Upload,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Star,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  HardDrive,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type FileCategory = "ebook" | "template" | "audio" | "video" | "archive" | "other";
type FileStatus = "published" | "draft" | "archived";
type ViewMode = "grid" | "list";
type SortField = "name" | "price" | "downloads" | "revenue" | "createdAt";

interface DigitalFile {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FileCategory;
  downloads: number;
  sales: number;
  revenue: number;
  rating: number;
  status: FileStatus;
  createdAt: string;
  fileType: string;
  icon: React.ElementType;
  size: string; // only for files
}

interface FolderBundle {
  id: string;
  name: string;
  description: string;
  price: number;
  files: string[];
  downloads: number;
  sales: number;
  revenue: number;
  status: FileStatus;
  createdAt: string;
  icon: React.ElementType;
  fileType: string; // "bundle"
  rating: number;
}

type DisplayItem = DigitalFile | FolderBundle;

// ---------- Mock Data ----------
const allFiles: DigitalFile[] = [
  { id: "file-001", name: "Web Development eBook", description: "Comprehensive guide to modern web dev.", price: 29.99, category: "ebook", downloads: 154, sales: 120, revenue: 3598.80, rating: 4.8, status: "published", createdAt: "2024-05-01", fileType: "pdf", icon: FileText, size: "8.4 MB" },
  { id: "file-002", name: "UI/UX Design Templates", description: "Figma and Sketch templates for designers.", price: 49.99, category: "template", downloads: 88, sales: 76, revenue: 3799.24, rating: 4.6, status: "published", createdAt: "2024-05-05", fileType: "zip", icon: ImageIcon, size: "45.2 MB" },
  { id: "file-003", name: "Podcast Intro Music Pack", description: "10 royalty-free music tracks.", price: 19.99, category: "audio", downloads: 210, sales: 180, revenue: 3598.20, rating: 4.7, status: "published", createdAt: "2024-05-10", fileType: "mp3", icon: Music, size: "112 MB" },
  { id: "file-004", name: "Online Course Video Series", description: "5-hour video course on digital marketing.", price: 99.99, category: "video", downloads: 45, sales: 38, revenue: 3799.62, rating: 4.9, status: "published", createdAt: "2024-05-12", fileType: "mp4", icon: Video, size: "2.1 GB" },
  { id: "file-005", name: "Startup Pitch Deck Bundle", description: "10 pitch deck templates.", price: 39.99, category: "archive", downloads: 72, sales: 60, revenue: 2399.40, rating: 4.5, status: "draft", createdAt: "2024-05-15", fileType: "zip", icon: Archive, size: "30 MB" },
  { id: "file-006", name: "SEO Checklist Notion Template", description: "Complete SEO checklist.", price: 14.99, category: "template", downloads: 300, sales: 250, revenue: 3747.50, rating: 4.4, status: "published", createdAt: "2024-05-18", fileType: "pdf", icon: FileText, size: "2.3 MB" },
];

const bundles: FolderBundle[] = [
  { id: "bundle-001", name: "Web Dev Starter Pack", description: "eBook + Templates + Checklist", price: 79.99, files: ["file-001", "file-002", "file-006"], downloads: 55, sales: 40, revenue: 3199.60, status: "published", createdAt: "2024-05-25", icon: Folder, fileType: "bundle", rating: 4.8 },
  { id: "bundle-002", name: "Designer's Toolkit", description: "Templates + Photos + UI Kit", price: 99.99, files: ["file-002", "file-007"], downloads: 22, sales: 18, revenue: 1799.82, status: "draft", createdAt: "2024-05-26", icon: Folder, fileType: "bundle", rating: 4.5 },
];

const salesRecords = [
  { id: "sale-001", fileName: "Web Development eBook", buyerName: "Alice Johnson", buyerEmail: "alice@example.com", date: "2024-05-15", amount: 29.99, status: "completed" },
  { id: "sale-002", fileName: "UI/UX Design Templates", buyerName: "Bob Smith", buyerEmail: "bob@example.com", date: "2024-05-14", amount: 49.99, status: "completed" },
  { id: "sale-003", fileName: "Podcast Intro Music Pack", buyerName: "Charlie Brown", buyerEmail: "charlie@example.com", date: "2024-05-13", amount: 19.99, status: "pending" },
  { id: "sale-004", fileName: "Online Course Video Series", buyerName: "Diana White", buyerEmail: "diana@example.com", date: "2024-05-12", amount: 99.99, status: "refunded" },
];

const revenueByCategory = [
  { name: "Ebook", value: 35, color: "#6366f1" },
  { name: "Template", value: 30, color: "#8b5cf6" },
  { name: "Audio", value: 15, color: "#3b82f6" },
  { name: "Video", value: 12, color: "#ec4899" },
  { name: "Archive", value: 8, color: "#10b981" },
];

// ---------- Helper Components ----------
function StatusBadge({ status }: { status: FileStatus }) {
  switch (status) {
    case "published":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" /> Published</Badge>;
    case "draft":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="mr-1 h-3 w-3" /> Draft</Badge>;
    case "archived":
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Archived</Badge>;
    default:
      return null;
  }
}

function SaleStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" /> Completed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
    case "refunded":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="mr-1 h-3 w-3" /> Refunded</Badge>;
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

// ---------- Modals ----------
function UploadFileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [fileName, setFileName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<FileCategory>("ebook");
  const [fileType, setFileType] = useState("pdf");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>Add a new digital product.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ebook">Ebook</SelectItem>
              <SelectItem value="template">Template</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="archive">Archive</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger>
              <SelectValue placeholder="File type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="zip">ZIP</SelectItem>
              <SelectItem value="mp3">MP3</SelectItem>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="xlsx">XLSX</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateBundleModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [bundleName, setBundleName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Bundle</DialogTitle>
          <DialogDescription>Group files into a sellable bundle.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Bundle name" value={bundleName} onChange={(e) => setBundleName(e.target.value)} />
          <Input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {allFiles.filter(f => f.status === "published").map((file) => (
              <div key={file.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`file-${file.id}`}
                  checked={selectedFiles.includes(file.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedFiles([...selectedFiles, file.id]);
                    else setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor={`file-${file.id}`} className="text-sm flex items-center gap-2">
                  <file.icon className="h-4 w-4" />
                  {file.name}
                </label>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            <FolderPlus className="mr-2 h-4 w-4" /> Create Bundle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewModal({ item, onClose }: { item: DisplayItem | null; onClose: () => void }) {
  if (!item) return null;
  const isBundle = 'files' in item;
  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <item.icon className="h-6 w-6 text-indigo-500" />
            {item.name}
          </DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            {item.fileType === "mp4" ? (
              <Video className="h-16 w-16 text-muted-foreground" />
            ) : item.fileType === "mp3" ? (
              <Music className="h-16 w-16 text-muted-foreground" />
            ) : item.fileType === "zip" || item.fileType === "pdf" || item.fileType === "bundle" ? (
              <FileText className="h-16 w-16 text-muted-foreground" />
            ) : (
              <File className="h-16 w-16 text-muted-foreground" />
            )}
            <span className="ml-4 text-sm text-muted-foreground">Preview not available</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Downloads</p>
              <p className="text-lg font-bold">{item.downloads}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Revenue</p>
              <p className="text-lg font-bold">${item.revenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{item.rating}</span>
              </div>
            </div>
          </div>
          {isBundle && (
            <div>
              <p className="text-sm font-medium mb-2">Included Files</p>
              <div className="space-y-2">
                {(item as FolderBundle).files.map(fileId => {
                  const file = allFiles.find(f => f.id === fileId);
                  return file ? (
                    <div key={fileId} className="flex items-center gap-2 text-sm">
                      <file.icon className="h-4 w-4" />
                      {file.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download</Button>
            <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function DigitalFilesDashboard() {
  const [activeSection, setActiveSection] = useState<"files" | "bundles">("files");
  const [fileStatusFilter, setFileStatusFilter] = useState<"all" | FileStatus>("all");
  const [fileCategoryFilter, setFileCategoryFilter] = useState<"all" | FileCategory>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<DisplayItem | null>(null);

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (activeSection === "bundles") return bundles;
    let items: DigitalFile[] = allFiles;
    if (fileStatusFilter !== "all") items = items.filter(f => f.status === fileStatusFilter);
    if (fileCategoryFilter !== "all") items = items.filter(f => f.category === fileCategoryFilter);
    if (search) items = items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [activeSection, fileStatusFilter, fileCategoryFilter, search]);

  const sortedItems = useMemo(() => {
    const items = [...displayItems];
    items.sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      switch (sortField) {
        case "name": aVal = a.name; bVal = b.name; break;
        case "price": aVal = a.price; bVal = b.price; break;
        case "downloads": aVal = a.downloads; bVal = b.downloads; break;
        case "revenue": aVal = a.revenue; bVal = b.revenue; break;
        case "createdAt": aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); break;
        default: aVal = a.name; bVal = b.name;
      }
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return items;
  }, [displayItems, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="h-8 w-8 text-slate-700 dark:text-slate-300" />
            Digital Files
          </h1>
          <p className="text-muted-foreground">Organize, manage, and sell your digital products.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBundleModalOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Bundle
          </Button>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Button
                variant={activeSection === "files" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => { setActiveSection("files"); setPage(1); }}
              >
                <FileText className="mr-2 h-4 w-4" /> All Files
              </Button>
              <Button
                variant={activeSection === "bundles" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => { setActiveSection("bundles"); setPage(1); }}
              >
                <Folder className="mr-2 h-4 w-4" /> Bundles
              </Button>
              {activeSection === "files" && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                  <Button variant={fileStatusFilter === "all" ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setFileStatusFilter("all"); setPage(1); }}>All</Button>
                  <Button variant={fileStatusFilter === "published" ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setFileStatusFilter("published"); setPage(1); }}>Published</Button>
                  <Button variant={fileStatusFilter === "draft" ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setFileStatusFilter("draft"); setPage(1); }}>Drafts</Button>
                  <Button variant={fileStatusFilter === "archived" ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setFileStatusFilter("archived"); setPage(1); }}>Archived</Button>
                  <Separator className="my-2" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Category</p>
                  <Button variant={fileCategoryFilter === "all" ? "secondary" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setFileCategoryFilter("all"); setPage(1); }}>All</Button>
                  <Button variant={fileCategoryFilter === "ebook" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("ebook"); setPage(1); }}>Ebook</Button>
                  <Button variant={fileCategoryFilter === "template" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("template"); setPage(1); }}>Template</Button>
                  <Button variant={fileCategoryFilter === "audio" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("audio"); setPage(1); }}>Audio</Button>
                  <Button variant={fileCategoryFilter === "video" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("video"); setPage(1); }}>Video</Button>
                  <Button variant={fileCategoryFilter === "archive" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("archive"); setPage(1); }}>Archive</Button>
                  <Button variant={fileCategoryFilter === "other" ? "secondary" : "ghost"} size="sm" className="w-full justify-start capitalize" onClick={() => { setFileCategoryFilter("other"); setPage(1); }}>Other</Button>
                </>
              )}
            </CardContent>
          </Card>
          {/* Storage */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Storage</span>
                <span className="text-muted-foreground">2.4 GB / 10 GB</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "24%" }} />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="text-sm font-medium">{activeSection === "files" ? "All Files" : "Bundles"}</div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-8 w-full"
                />
              </div>
              <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="createdAt">Date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}>
                {sortDirection === "asc" ? <ChevronLeft className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4 rotate-90" />}
              </Button>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={cn(viewMode === "grid" && "bg-muted")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={cn(viewMode === "list" && "bg-muted")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Grid/List */}
          {paginatedItems.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No items found.</CardContent></Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setPreviewItem(item)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                        <item.icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="mt-3 font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.fileType.toUpperCase()}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{item.downloads} dl</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{item.rating}</span>
                      {'size' in item && <span className="ml-auto text-xs text-muted-foreground">{item.size}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {paginatedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={cn("flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer", idx !== 0 && "border-t border-slate-100 dark:border-slate-800")}
                    onClick={() => setPreviewItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.fileType.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">{item.downloads} downloads</span>
                      <StatusBadge status={item.status} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewItem(item)}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Sales & Analytics */}
      <Separator className="my-8" />
      <h2 className="text-2xl font-bold mb-4">Sales & Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {salesRecords.map((sale) => (
                <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <FileText className="h-8 w-8 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium">{sale.fileName}</p>
                      <p className="text-xs text-muted-foreground">{sale.buyerName} ({sale.buyerEmail})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{sale.date}</span>
                    <span className="font-semibold">${sale.amount.toFixed(2)}</span>
                    <SaleStatusBadge status={sale.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Distribution of earnings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueByCategory.map((entry, index) => (
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

      {/* Modals */}
      <UploadFileModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      <CreateBundleModal open={bundleModalOpen} onOpenChange={setBundleModalOpen} />
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}