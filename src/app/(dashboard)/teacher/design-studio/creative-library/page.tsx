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
  Upload,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  File,
  Star,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  Eye,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  HardDrive,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ---------- Types ----------
type AssetCategory = "image" | "video" | "audio" | "document" | "design" | "archive" | "other";
type AssetStatus = "active" | "draft" | "archived";
type ViewMode = "grid" | "list";

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  fileType: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  status: AssetStatus;
  thumbnail?: JSX.Element;
}

// ---------- Mock Data ----------
const allAssets: Asset[] = [
  {
    id: "asset-001",
    name: "Brand Logo Final",
    category: "design",
    fileType: "svg",
    size: "2.4 MB",
    createdAt: "2024-05-20",
    updatedAt: "2024-05-22",
    favorite: true,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#6366f1" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">L</text>
      </svg>
    ),
  },
  {
    id: "asset-002",
    name: "Course Banner",
    category: "image",
    fileType: "png",
    size: "5.1 MB",
    createdAt: "2024-05-18",
    updatedAt: "2024-05-19",
    favorite: false,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f59e0b" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18">Banner</text>
      </svg>
    ),
  },
  {
    id: "asset-003",
    name: "Intro Music Track",
    category: "audio",
    fileType: "mp3",
    size: "8.7 MB",
    createdAt: "2024-05-15",
    updatedAt: "2024-05-15",
    favorite: true,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#10b981" />
        <path d="M30 70 L30 30 L70 20 L70 60" stroke="white" strokeWidth="4" fill="none" />
      </svg>
    ),
  },
  {
    id: "asset-004",
    name: "Lecture Video 01",
    category: "video",
    fileType: "mp4",
    size: "120 MB",
    createdAt: "2024-05-10",
    updatedAt: "2024-05-12",
    favorite: false,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#0ea5e9" />
        <polygon points="40,30 70,50 40,70" fill="white" />
      </svg>
    ),
  },
  {
    id: "asset-005",
    name: "Lesson Plan Template",
    category: "document",
    fileType: "pdf",
    size: "1.2 MB",
    createdAt: "2024-05-08",
    updatedAt: "2024-05-09",
    favorite: false,
    status: "draft",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#8b5cf6" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18">PDF</text>
      </svg>
    ),
  },
  {
    id: "asset-006",
    name: "Icons Pack",
    category: "archive",
    fileType: "zip",
    size: "15 MB",
    createdAt: "2024-05-05",
    updatedAt: "2024-05-06",
    favorite: true,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f97316" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18">ZIP</text>
      </svg>
    ),
  },
  {
    id: "asset-007",
    name: "Marketing Infographic",
    category: "design",
    fileType: "ai",
    size: "7.8 MB",
    createdAt: "2024-05-02",
    updatedAt: "2024-05-03",
    favorite: false,
    status: "active",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#ec4899" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="16">AI</text>
      </svg>
    ),
  },
  {
    id: "asset-008",
    name: "Voiceover Sample",
    category: "audio",
    fileType: "wav",
    size: "25 MB",
    createdAt: "2024-04-28",
    updatedAt: "2024-04-30",
    favorite: false,
    status: "archived",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#14b8a6" />
        <path d="M30 70 L30 30 L70 20 L70 60" stroke="white" strokeWidth="4" fill="none" />
      </svg>
    ),
  },
];

const categories: { label: string; value: AssetCategory | "all" | "favorites" | "recent" | "trash" }[] = [
  { label: "All Assets", value: "all" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Audio", value: "audio" },
  { label: "Documents", value: "document" },
  { label: "Designs", value: "design" },
  { label: "Archives", value: "archive" },
  { label: "Favorites", value: "favorites" },
  { label: "Recent", value: "recent" },
  { label: "Trash", value: "trash" },
];

// ---------- Helper Components ----------
function AssetIcon({ category }: { category: AssetCategory }) {
  switch (category) {
    case "image": return <ImageIcon className="h-6 w-6 text-blue-500" />;
    case "video": return <Video className="h-6 w-6 text-purple-500" />;
    case "audio": return <Music className="h-6 w-6 text-green-500" />;
    case "document": return <FileText className="h-6 w-6 text-orange-500" />;
    case "design": return <ImageIcon className="h-6 w-6 text-pink-500" />;
    case "archive": return <Archive className="h-6 w-6 text-yellow-500" />;
    default: return <File className="h-6 w-6 text-gray-500" />;
  }
}

function StatusBadge({ status }: { status: AssetStatus }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "draft":
      return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
    case "archived":
      return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
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
function UploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("image");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    // Handle upload logic
    onOpenChange(false);
    setName("");
    setCategory("image");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <DialogDescription>Add a new file to your creative library.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>File Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button className="w-full" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewModal({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  if (!asset) return null;
  return (
    <Dialog open={!!asset} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AssetIcon category={asset.category} />
            {asset.name}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {asset.thumbnail || <File className="h-16 w-16 text-muted-foreground" />}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div><p className="text-sm font-medium">File Type</p><p className="text-sm">{asset.fileType.toUpperCase()}</p></div>
          <div><p className="text-sm font-medium">Size</p><p className="text-sm">{asset.size}</p></div>
          <div><p className="text-sm font-medium">Created</p><p className="text-sm">{asset.createdAt}</p></div>
          <div><p className="text-sm font-medium">Updated</p><p className="text-sm">{asset.updatedAt}</p></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download</Button>
          <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function CreativeLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>(allAssets);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "all" | "favorites" | "recent" | "trash">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "createdAt" | "updatedAt" | "size">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  // Filter assets based on category, search
  const filteredAssets = useMemo(() => {
    let result = [...assets];
    if (selectedCategory === "favorites") {
      result = result.filter(a => a.favorite);
    } else if (selectedCategory === "recent") {
      result = result.filter(a => {
        const date = new Date(a.updatedAt);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      });
    } else if (selectedCategory === "trash") {
      result = result.filter(a => a.status === "archived");
    } else if (selectedCategory !== "all") {
      result = result.filter(a => a.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.fileType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "name": aVal = a.name; bVal = b.name; break;
        case "createdAt": aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); break;
        case "updatedAt": aVal = new Date(a.updatedAt).getTime(); bVal = new Date(b.updatedAt).getTime(); break;
        case "size":
          const sizeA = parseFloat(a.size);
          const sizeB = parseFloat(b.size);
          aVal = sizeA; bVal = sizeB; break;
        default: aVal = a.name; bVal = b.name;
      }
      if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [assets, selectedCategory, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleFavorite = (id: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, favorite: !a.favorite } : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <FolderOpen className="h-10 w-10 text-indigo-500" /> Creative Library
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage all your creative assets in one place.</p>
          </div>
          <Button size="lg" onClick={() => setUploadModalOpen(true)}>
            <Upload className="mr-2 h-5 w-5" /> Upload Asset
          </Button>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortField} onValueChange={(v) => setSortField(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}>
              {sortDirection === "asc" ? <ChevronLeft className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4 rotate-90" />}
            </Button>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={cn(viewMode === "grid" && "bg-muted")}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={cn(viewMode === "list" && "bg-muted")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <Card>
              <CardContent className="p-4 space-y-1">
                {categories.map(cat => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => { setSelectedCategory(cat.value); setPage(1); }}
                  >
                    {cat.label}
                  </Button>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm px-2 py-1">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">2.4 GB / 10 GB</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mx-2">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Asset Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedAssets.map(asset => (
                  <Card key={asset.id} className="group hover:shadow-xl transition-shadow overflow-hidden">
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                      {asset.thumbnail}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.id); }}
                      >
                        <Star className={cn("h-4 w-4", asset.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium truncate">{asset.name}</h3>
                          <p className="text-xs text-muted-foreground">{asset.fileType.toUpperCase()} • {asset.size}</p>
                        </div>
                        <StatusBadge status={asset.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Updated {asset.updatedAt}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewAsset(asset)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewAsset(asset)}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteAsset(asset.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {paginatedAssets.map((asset, idx) => (
                    <div key={asset.id} className={cn("flex items-center justify-between p-4 hover:bg-muted/50 transition-colors", idx !== 0 && "border-t")}>
                      <div className="flex items-center gap-3">
                        <AssetIcon category={asset.category} />
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.fileType.toUpperCase()} • {asset.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={asset.status} />
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(asset.id)}>
                          <Star className={cn("h-4 w-4", asset.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setPreviewAsset(asset)}><Eye className="h-4 w-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewAsset(asset)}><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteAsset(asset.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
      </div>

      {/* Modals */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      <PreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </div>
  );
}