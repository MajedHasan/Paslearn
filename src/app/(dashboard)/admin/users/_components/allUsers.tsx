"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Users,
  Mail,
  Shield,
  BadgeCheck,
  UserRound,
  CalendarDays,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRole = "student" | "teacher" | "admin";

type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiResponse = {
  success: boolean;
  meta: Meta;
  data: User[];
};

function buildPageNumbers(current: number, total: number) {
  const pages: Array<number | "..."> = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

function roleBadge(role: UserRole) {
  if (role === "admin") {
    return (
      <Badge className="rounded-full bg-[#D4A017]/10 text-[#8a6500] hover:bg-[#D4A017]/15">
        Admin
      </Badge>
    );
  }

  if (role === "teacher") {
    return (
      <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
        Teacher
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
      Student
    </Badge>
  );
}

function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>
            Complete profile information for this account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Role
              </p>
              <div className="mt-2">{roleBadge(user.role)}</div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Verification
              </p>
              <div className="mt-2">
                {user.emailVerified ? (
                  <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-amber-50 text-amber-700">
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Created
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Updated
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setRole(user.role || "student");
    setEmailVerified(!!user.emailVerified);
  }, [user, open]);

  if (!user) return null;

  const submit = async () => {
    try {
      setLoading(true);

      await api.patch(`/users/${user._id}`, {
        name: name.trim(),
        role,
        emailVerified,
      });

      toast.success("User updated successfully");
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Update account details and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input value={user.email} disabled className="rounded-2xl" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email verified
              </label>
              <Select
                value={emailVerified ? "true" : "false"}
                onValueChange={(v) => setEmailVerified(v === "true")}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className="rounded-2xl bg-[#D4A017] text-white hover:bg-[#bf910f]"
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AllUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const emailVerified = searchParams.get("emailVerified") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page,
    limit,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (emailVerified) params.set("emailVerified", emailVerified);

    return params.toString();
  }, [page, limit, search, role, emailVerified]);

  const loadUsers = async (withSpinner = true) => {
    try {
      if (withSpinner) setLoading(true);
      else setRefreshing(true);

      const res = await api.get<ApiResponse>(`/users?${queryString}`);
      const data = res?.data;

      setUsers(data?.data || []);
      setMeta(
        data?.meta || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`${pathname}?page=1&limit=${limit}`);
  };

  const pages = buildPageNumbers(meta.page, meta.totalPages);

  const handleDeleted = () => {
    setDeleteUser(null);
    loadUsers(false);
  };

  const submitDelete = async () => {
    if (!deleteUser) return;

    try {
      await api.delete(`/users/${deleteUser._id}`);
      toast.success("User deleted successfully");
      handleDeleted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage students, teachers, and admins from one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadUsers(false)}
            disabled={refreshing}
            className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => updateQuery("search", e.target.value)}
                  placeholder="Search name or email"
                  className="h-11 rounded-2xl border-slate-200 pl-9 shadow-sm focus-visible:ring-[#D4A017]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <Select
                value={role || "all"}
                onValueChange={(value) =>
                  updateQuery("role", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 shadow-sm focus:ring-[#D4A017]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email verification
              </label>
              <Select
                value={emailVerified || "all"}
                onValueChange={(value) =>
                  updateQuery("emailVerified", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="h-11 rounded-2xl border-slate-200 shadow-sm focus:ring-[#D4A017]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Actions
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-11 w-full rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <Users className="h-4 w-4 text-[#D4A017]" />
            Users list
          </CardTitle>

          <div className="text-sm text-slate-500">
            {meta.total} total user{meta.total === 1 ? "" : "s"}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={5}>
                        <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#D4A017]/10 text-[#D4A017]">
                          <UserRound className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            No users found
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Try changing your filters or search term.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFilters}
                          className="rounded-2xl border-slate-200 bg-white"
                        >
                          Reset filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {user.name}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{roleBadge(user.role)}</TableCell>

                      <TableCell>
                        {user.emailVerified ? (
                          <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                            <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100">
                            <Shield className="mr-1 h-3.5 w-3.5" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-2xl border-slate-200 bg-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-44 rounded-2xl"
                          >
                            <DropdownMenuItem onClick={() => setViewUser(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setEditUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && meta.totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Page {meta.page} of {meta.totalPages}
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (meta.page > 1) setPage(meta.page - 1);
                      }}
                      className={
                        meta.page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {pages.map((item, index) =>
                    item === "..." ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === meta.page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (meta.page < meta.totalPages) {
                          setPage(meta.page + 1);
                        }
                      }}
                      className={
                        meta.page >= meta.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <ViewUserDialog
        user={viewUser}
        open={!!viewUser}
        onOpenChange={(open) => {
          if (!open) setViewUser(null);
        }}
      />

      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onSaved={() => loadUsers(false)}
      />

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-slate-900">
                {deleteUser?.name}
              </span>{" "}
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDelete}
              className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
