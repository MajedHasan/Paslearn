"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  BookOpen,
  Users,
  Star,
  DollarSign,
  Clock,
  Edit,
  BarChart3,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

// Types matching backend
type CourseStatus = "draft" | "published" | "archived" | "under_review";
type PriceModel = "free" | "onetime" | "subscription";

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnailMediaId?: string | { url?: string };
  status: CourseStatus;
  priceModel: PriceModel;
  price?: number;
  students?: number;
  rating?: number;
  lessonsCount?: number;
  updatedAt: string;
}

interface Stats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  avgRating: number;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
  under_review: "bg-blue-50 text-blue-700 border-blue-200",
};

// Backend origin WITHOUT /api
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function CoursesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("-updatedAt");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit,
        sort: sortBy,
        q: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };
      Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

      const response = await api.get("/courses", { params });
      setCourses(response.data.data);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load courses");
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/courses/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Stats error", err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCourses();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy, fetchCourses]);

  const totalPages = Math.ceil(total / limit);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === courses.length) {
      setSelected([]);
    } else {
      setSelected(courses.map((c) => c._id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchCourses();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/courses/${id}/duplicate`);
      toast.success("Course duplicated");
      fetchCourses();
      fetchStats();
    } catch (err: any) {
      toast.error("Duplicate failed");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} courses?`)) return;
    try {
      await api.post("/courses/bulk-delete", { ids: selected });
      setSelected([]);
      toast.success("Courses deleted");
      fetchCourses();
      fetchStats();
    } catch (err: any) {
      toast.error("Bulk delete failed");
    }
  };

  const displayedCountStart = (page - 1) * limit + 1;
  const displayedCountEnd = Math.min(page * limit, total);

  // Fix: Use BACKEND_ORIGIN (without /api) for media URLs
  const getThumbnailUrl = (course: Course): string => {
    if (!course.thumbnailMediaId) return "";
    if (typeof course.thumbnailMediaId === "object") {
      const url = course.thumbnailMediaId.url;
      if (url) {
        return url.startsWith("/") ? `${BACKEND_ORIGIN}${url}` : url;
      }
    } else if (typeof course.thumbnailMediaId === "string") {
      return `${BACKEND_ORIGIN}/api/media/${course.thumbnailMediaId}/presigned-url`;
    }
    return "";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your course catalog, track performance, and grow your business.
          </p>
        </div>
        <Link href="/teacher/courses/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Published" value={stats?.publishedCourses.toString() || "0"} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Students" value={stats?.totalStudents.toLocaleString() || "0"} color="bg-blue-100 text-blue-600" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenue" value={`$${stats?.totalRevenue.toFixed(2) || "0.00"}`} color="bg-purple-100 text-purple-600" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Avg Rating" value={stats?.avgRating.toFixed(1) || "0.0"} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-updatedAt">Recently Updated</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="-students">Most Students</SelectItem>
              <SelectItem value="price">Price: High to Low</SelectItem>
              <SelectItem value="-rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`rounded-lg p-2 ${view === "grid" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg p-2 ${view === "list" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <span className="text-sm text-slate-600">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => {}}><Copy className="mr-1 h-4 w-4" /> Duplicate</Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Content */}
          {view === "grid" ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  selected={selected.includes(course._id)}
                  onSelect={toggleSelect}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  getThumbnailUrl={getThumbnailUrl}
                />
              ))}
              {courses.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-12 text-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">No courses found</h3>
                  <p className="text-sm text-slate-500">Try adjusting your filters or create a new course.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <button onClick={toggleAll}>
                        {selected.length === courses.length && courses.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-slate-900" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <button onClick={() => toggleSelect(course._id)}>
                          {selected.includes(course._id) ? (
                            <CheckSquare className="h-4 w-4 text-slate-900" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getThumbnailUrl(course) ? (
                            <img src={getThumbnailUrl(course)} alt={course.title} className="h-10 w-14 rounded-md object-cover" />
                          ) : (
                            <div className="h-10 w-14 rounded-md bg-slate-100 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.lessonsCount ?? 0} lessons</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[course.status]}>{course.status}</Badge>
                      </TableCell>
                      <TableCell>{(course.students || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{(course.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.priceModel === "free" ? "Free" : `$${(course.price || 0).toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => window.location.href = `/teacher/courses/${course._id}/edit`}><Edit className="h-4 w-4 text-slate-500" /></button>
                          <button className="rounded-lg p-2 hover:bg-slate-100"><BarChart3 className="h-4 w-4 text-slate-500" /></button>
                          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => handleDuplicate(course._id)}><Copy className="h-4 w-4 text-slate-500" /></button>
                          <button className="rounded-lg p-2 hover:bg-red-50" onClick={() => handleDelete(course._id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {courses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">No courses found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Showing {displayedCountStart}–{displayedCountEnd} of {total} courses
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Stat Card Helper ────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Course Card Helper ──────────────────────────────────
function CourseCard({
  course,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  getThumbnailUrl,
}: {
  course: Course;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  getThumbnailUrl: (course: Course) => string;
}) {
  const thumbnailUrl = getThumbnailUrl(course);

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <button onClick={() => onSelect(course._id)} className="rounded-md bg-white/90 p-1.5 shadow-sm">
            {selected ? <CheckSquare className="h-4 w-4 text-slate-900" /> : <Square className="h-4 w-4 text-slate-400" />}
          </button>
          <Badge variant="outline" className={STATUS_STYLES[course.status]}>{course.status}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm" onClick={() => window.location.href = `/teacher/courses/${course._id}/edit`}><Edit className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm"><BarChart3 className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm" onClick={() => onDuplicate(course._id)}><Copy className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm" onClick={() => onDelete(course._id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description || "No description"}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students?.toLocaleString() || 0}</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.rating?.toFixed(1) || "0.0"}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.lessonsCount || 0}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-slate-900">{course.priceModel === "free" ? "Free" : `$${course.price?.toFixed(2) || "0.00"}`}</span>
          <span className="text-xs text-slate-400">Updated {formatDistanceToNow(new Date(course.updatedAt))} ago</span>
        </div>
      </div>
    </div>
  );
}