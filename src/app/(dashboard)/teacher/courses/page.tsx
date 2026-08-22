"use client";

import { useMemo, useState } from "react";
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
  ChevronDown,
  ArrowUpDown,
  CheckSquare,
  Square,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type CourseStatus = "draft" | "published" | "archived";

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: CourseStatus;
  price: number;
  students: number;
  rating: number;
  lessonsCount: number;
  completionRate: number; // %
  updatedAt: string; // ISO date
};

// ─── Fake Data (replace with API) ────────────────────────
const FAKE_COURSES: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, Node.js, and React.",
    thumbnail: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&auto=format&fit=crop",
    status: "published",
    price: 89.99,
    students: 1240,
    rating: 4.8,
    lessonsCount: 84,
    completionRate: 78,
    updatedAt: "2026-08-14T09:00:00Z",
  },
  {
    id: "2",
    title: "Advanced React & Redux Masterclass",
    description: "Build scalable frontends with Redux Toolkit and Hooks.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop",
    status: "published",
    price: 74.99,
    students: 856,
    rating: 4.7,
    lessonsCount: 62,
    completionRate: 64,
    updatedAt: "2026-08-09T14:30:00Z",
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    description: "Learn design thinking and prototyping in Figma.",
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&auto=format&fit=crop",
    status: "draft",
    price: 49.99,
    students: 0,
    rating: 0,
    lessonsCount: 35,
    completionRate: 0,
    updatedAt: "2026-08-13T11:15:00Z",
  },
  {
    id: "4",
    title: "Machine Learning A-Z",
    description: "Hands-on Python & R for Data Science and ML.",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop",
    status: "published",
    price: 99.99,
    students: 2145,
    rating: 4.9,
    lessonsCount: 102,
    completionRate: 82,
    updatedAt: "2026-08-16T07:45:00Z",
  },
  {
    id: "5",
    title: "Digital Marketing Strategy",
    description: "SEO, social media, and content marketing.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop",
    status: "archived",
    price: 59.99,
    students: 430,
    rating: 4.5,
    lessonsCount: 41,
    completionRate: 45,
    updatedAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "6",
    title: "Python for Data Science",
    description: "Data analysis, visualization, and machine learning.",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop",
    status: "published",
    price: 69.99,
    students: 1780,
    rating: 4.6,
    lessonsCount: 78,
    completionRate: 71,
    updatedAt: "2026-08-15T16:20:00Z",
  },
];

const STATUS_STYLES: Record<CourseStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};

// ─── Component ───────────────────────────────────────────
export default function Courses() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const courses = FAKE_COURSES; // replace with state/fetch

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [courses, search, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "title":
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "students":
        arr.sort((a, b) => b.students - a.students);
        break;
      case "price":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        arr.sort((a, b) => b.rating - a.rating);
        break;
      default:
        arr.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return arr;
  }, [filtered, sortBy]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page]);

  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((c) => c.id));
    }
  };

  const isAllSelected = paginated.length > 0 && selected.length === paginated.length;

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
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Published" value="4" color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Students" value="6,451" color="bg-blue-100 text-blue-600" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Revenue" value="$124,582" color="bg-purple-100 text-purple-600" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Avg Rating" value="4.7" color="bg-amber-100 text-amber-600" />
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
            </SelectContent>
          </Select>
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
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
          <Button size="sm" variant="outline"><Copy className="mr-1 h-4 w-4" /> Duplicate</Button>
          <Button size="sm" variant="outline"><BarChart3 className="mr-1 h-4 w-4" /> Export</Button>
          <Button size="sm" variant="destructive"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
        </div>
      )}

      {/* Content */}
      {view === "grid" ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((course) => (
            <CourseCard key={course.id} course={course} selected={selected.includes(course.id)} onSelect={toggleSelect} />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <button onClick={toggleAll}>
                    {isAllSelected ? (
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
              {paginated.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <button onClick={() => toggleSelect(course.id)}>
                      {selected.includes(course.id) ? (
                        <CheckSquare className="h-4 w-4 text-slate-900" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail} alt={course.title} className="h-10 w-14 rounded-md object-cover" />
                      <div>
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.lessonsCount} lessons</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[course.status]}>{course.status}</Badge>
                  </TableCell>
                  <TableCell>{course.students.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>${course.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 hover:bg-slate-100"><Edit className="h-4 w-4 text-slate-500" /></button>
                      <button className="rounded-lg p-2 hover:bg-slate-100"><BarChart3 className="h-4 w-4 text-slate-500" /></button>
                      <button className="rounded-lg p-2 hover:bg-slate-100"><Copy className="h-4 w-4 text-slate-500" /></button>
                      <button className="rounded-lg p-2 hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
function CourseCard({ course, selected, onSelect }: { course: Course; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <button onClick={() => onSelect(course.id)} className="rounded-md bg-white/90 p-1.5 shadow-sm">
            {selected ? <CheckSquare className="h-4 w-4 text-slate-900" /> : <Square className="h-4 w-4 text-slate-400" />}
          </button>
          <Badge variant="outline" className={STATUS_STYLES[course.status]}>{course.status}</Badge>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm"><Edit className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm"><BarChart3 className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm"><Copy className="h-3.5 w-3.5 text-slate-700" /></button>
          <button className="rounded-lg bg-white/90 p-1.5 shadow-sm"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.students.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.rating.toFixed(1)}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.lessonsCount}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-slate-900">${course.price.toFixed(2)}</span>
          <span className="text-xs text-slate-400">Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}