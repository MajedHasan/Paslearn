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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  LayoutTemplate,
  Wand2,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Copy,
  Eye,
  Star,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type LogoDesign = {
  id: string;
  name: string;
  thumbnail: React.ReactNode;
  updatedAt: string;
  isFavorite: boolean;
};

type Template = {
  id: string;
  name: string;
  preview: React.ReactNode;
  category: string;
  popularity: number;
  isNew?: boolean;
  isFeatured?: boolean;
};

// ---------- Mock Data ----------
const recentDesigns: LogoDesign[] = [
  {
    id: "d1",
    name: "Acme Corp",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#6366f1" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">A</text>
      </svg>
    ),
    updatedAt: "2024-05-22",
    isFavorite: true,
  },
  {
    id: "d2",
    name: "GreenLeaf",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#22c55e" />
        <path d="M50 30 Q70 50 50 70 Q30 50 50 30" fill="#16a34a" />
      </svg>
    ),
    updatedAt: "2024-05-20",
    isFavorite: false,
  },
  {
    id: "d3",
    name: "PixelPlay",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="30" height="30" fill="#f59e0b" />
        <rect x="35" width="30" height="30" fill="#ef4444" />
        <rect y="35" width="30" height="30" fill="#3b82f6" />
        <rect x="35" y="35" width="30" height="30" fill="#10b981" />
      </svg>
    ),
    updatedAt: "2024-05-18",
    isFavorite: true,
  },
  {
    id: "d4",
    name: "FoodieHub",
    thumbnail: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#f97316" />
        <text x="50" y="60" textAnchor="middle" fill="white" fontSize="30">F</text>
      </svg>
    ),
    updatedAt: "2024-05-15",
    isFavorite: false,
  },
];

const templates: Template[] = [
  {
    id: "t1",
    name: "Tech Minimal",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#1e293b"/>
        <polygon points="50,20 80,80 20,80" fill="#3b82f6"/>
        <text x="50" y="65" textAnchor="middle" fill="white" fontSize="18">T</text>
      </svg>
    ),
    category: "Tech",
    popularity: 98,
    isNew: false,
    isFeatured: true,
  },
  {
    id: "t2",
    name: "Nature Organic",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#84cc16"/>
        <path d="M50 30 Q70 50 50 70 Q30 50 50 30" fill="#4d7c0f"/>
        <rect x="48" y="20" width="4" height="10" fill="#78350f"/>
      </svg>
    ),
    category: "Nature",
    popularity: 87,
    isNew: true,
    isFeatured: false,
  },
  {
    id: "t3",
    name: "Bold Gaming",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#111827"/>
        <polygon points="50,10 90,80 10,80" fill="#ef4444"/>
        <text x="50" y="60" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">G</text>
      </svg>
    ),
    category: "Gaming",
    popularity: 92,
    isNew: false,
    isFeatured: true,
  },
  {
    id: "t4",
    name: "Elegant Fashion",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#fdf2f8"/>
        <text x="50" y="55" textAnchor="middle" fill="#9d174d" fontSize="24" fontStyle="italic">E</text>
        <path d="M30 70 Q50 85 70 70" stroke="#9d174d" fill="none" strokeWidth="2"/>
      </svg>
    ),
    category: "Fashion",
    popularity: 95,
    isNew: false,
    isFeatured: false,
  },
  {
    id: "t5",
    name: "Corporate Blue",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#1e3a8a"/>
        <rect x="30" y="30" width="40" height="40" fill="#3b82f6" rx="5"/>
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18">C</text>
      </svg>
    ),
    category: "Corporate",
    popularity: 90,
    isNew: false,
    isFeatured: true,
  },
  {
    id: "t6",
    name: "Food & Drink",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#fef3c7"/>
        <circle cx="50" cy="50" r="30" fill="#f97316"/>
        <path d="M50 35 Q65 50 50 65 Q35 50 50 35" fill="#fff7ed"/>
      </svg>
    ),
    category: "Food",
    popularity: 88,
    isNew: true,
    isFeatured: false,
  },
  {
    id: "t7",
    name: "Fitness Pro",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#0f172a"/>
        <path d="M20 70 L50 20 L80 70 Z" fill="#22d3ee"/>
        <text x="50" y="60" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">FP</text>
      </svg>
    ),
    category: "Fitness",
    popularity: 85,
    isNew: false,
    isFeatured: false,
  },
  {
    id: "t8",
    name: "Kids Play",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#fbbf24"/>
        <circle cx="35" cy="40" r="5" fill="#1e293b"/>
        <circle cx="65" cy="40" r="5" fill="#1e293b"/>
        <path d="M35 60 Q50 70 65 60" stroke="#1e293b" fill="none" strokeWidth="3"/>
      </svg>
    ),
    category: "Kids",
    popularity: 80,
    isNew: false,
    isFeatured: false,
  },
  {
    id: "t9",
    name: "Real Estate",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f0fdf4"/>
        <path d="M20 60 L50 30 L80 60 L80 80 L20 80 Z" fill="#16a34a"/>
        <rect x="40" y="50" width="20" height="30" fill="#facc15"/>
      </svg>
    ),
    category: "Real Estate",
    popularity: 82,
    isNew: false,
    isFeatured: false,
  },
  {
    id: "t10",
    name: "Music Beat",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#18181b"/>
        <path d="M30 70 L30 30 L70 20 L70 60" stroke="#a855f7" strokeWidth="4" fill="none"/>
        <circle cx="25" cy="70" r="6" fill="#a855f7"/>
        <circle cx="65" cy="60" r="6" fill="#a855f7"/>
      </svg>
    ),
    category: "Music",
    popularity: 86,
    isNew: true,
    isFeatured: false,
  },
  {
    id: "t11",
    name: "Education",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#e0f2fe"/>
        <path d="M20 30 L50 15 L80 30 L50 45 Z" fill="#0ea5e9"/>
        <rect x="35" y="45" width="30" height="25" fill="#fbbf24"/>
        <text x="50" y="62" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">E</text>
      </svg>
    ),
    category: "Education",
    popularity: 89,
    isNew: false,
    isFeatured: true,
  },
  {
    id: "t12",
    name: "Travel Adventure",
    preview: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#0ea5e9"/>
        <path d="M20 60 Q50 20 80 60" stroke="white" strokeWidth="3" fill="none"/>
        <circle cx="50" cy="45" r="5" fill="#f97316"/>
      </svg>
    ),
    category: "Travel",
    popularity: 91,
    isNew: false,
    isFeatured: false,
  },
];

const categories = ["All", "Tech", "Nature", "Gaming", "Fashion", "Corporate", "Food", "Fitness", "Kids", "Real Estate", "Music", "Education", "Travel"];

// ---------- Main Component ----------
export default function LogoMakerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewDesign, setPreviewDesign] = useState<LogoDesign | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filteredDesigns = recentDesigns.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-2">
              <Wand2 className="h-10 w-10 text-violet-500" /> Logo Maker
            </h1>
            <p className="text-muted-foreground text-lg">Create stunning logos for your brand.</p>
          </div>
          <Button size="lg" onClick={() => (window.location.href = "/teacher/design-studio/logo-maker/create")}>
            <Plus className="mr-2 h-5 w-5" /> Create New Logo
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates and designs..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "secondary" : "outline"}
                size="sm"
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={cn(activeCategory === cat && "bg-violet-100 text-violet-700 border-violet-300")}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent Designs</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {paginatedTemplates.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No templates found.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="group overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {template.preview}
                      {template.isNew && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white">New</Badge>
                      )}
                      {template.isFeatured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">Featured</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Popularity: {template.popularity}%</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between px-2 py-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Recent Designs Tab */}
          <TabsContent value="recent" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDesigns.map((design) => (
                <Card key={design.id} className="group overflow-hidden">
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {design.thumbnail}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{design.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewDesign(design)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => (window.location.href = `/teacher/design-studio/logo-maker/create?design=${design.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Updated {design.updatedAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {filteredDesigns.filter(d => d.isFavorite).length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No favorite designs yet.</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDesigns.filter(d => d.isFavorite).map((design) => (
                  <Card key={design.id} className="group overflow-hidden">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {design.thumbnail}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{design.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Designs" value="24" icon={Layers} color="text-blue-500" />
              <StatCard label="Templates Used" value="12" icon={LayoutTemplate} color="text-green-500" />
              <StatCard label="AI Generations" value="36" icon={Wand2} color="text-purple-500" />
              <StatCard label="Downloads" value="89" icon={Download} color="text-orange-500" />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Design Dialog */}
      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewDesign?.name}</DialogTitle>
          </DialogHeader>
          <div className="h-64 bg-slate-100 flex items-center justify-center">
            {previewDesign?.thumbnail}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>Use this template as a starting point.</DialogDescription>
          </DialogHeader>
          <div className="h-40 bg-slate-100 flex items-center justify-center">
            {selectedTemplate?.preview}
          </div>
          <Button className="w-full" onClick={() => (window.location.href = `/teacher/design-studio/logo-maker/create?template=${selectedTemplate?.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Use Template
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <Card>
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