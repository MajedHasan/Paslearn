"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Mail,
  Bell,
  X,
  Trash2,
  Loader as Loader2,
  Filter,
  Search,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

/** Notifications page for student dashboard */
type Notification = {
  id: string;
  title: string;
  body?: string;
  time: string; // ISO string
  unread: boolean;
  mention?: boolean;
  avatarUrl?: string | null;
  meta?: string;
};

const fakeApiDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// Mocked server calls — replace these with your real API calls
async function apiFetchNotifications(
  page = 1,
  perPage = 10,
): Promise<Notification[]> {
  await fakeApiDelay();
  // produce dummy notifications
  const items: Notification[] = Array.from({ length: perPage }).map((_, i) => {
    const id = `n-${page}-${i}`;
    const minutesAgo = (page - 1) * perPage * 3 + i * 3;
    return {
      id,
      title:
        i % 4 === 0
          ? "New course available"
          : i % 4 === 1
            ? "Payment received"
            : i % 4 === 2
              ? "Mentioned in comment"
              : "System update",
      body:
        i % 4 === 2
          ? "John mentioned you in a comment on the 'React Basics' course."
          : "A quick summary of the notification content goes here. Click to view details.",
      time: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      unread: Math.random() > 0.5,
      mention: i % 4 === 2,
      avatarUrl: null,
      meta: i % 4 === 1 ? "MAD 12 credited" : undefined,
    };
  });
  return items;
}

async function apiMarkRead(ids: string[]) {
  await fakeApiDelay();
  return true;
}
async function apiMarkAllRead() {
  await fakeApiDelay();
  return true;
}
async function apiClearAll() {
  await fakeApiDelay();
  return true;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const perPage = 10;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // initial load
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPage(p = 1, replace = false) {
    setLoading(true);
    try {
      const items = await apiFetchNotifications(p, perPage);
      if (items.length < perPage) setHasMore(false);
      else setHasMore(true);

      setNotifications((prev) => (replace ? items : [...prev, ...items]));
      setPage(p);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  async function toggleRead(id: string) {
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
    );
    try {
      await apiMarkRead([id]);
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  }

  async function markAllRead() {
    if (notifications.length === 0) return;
    setBulkLoading(true);
    try {
      await apiMarkAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all read");
    } finally {
      setBulkLoading(false);
    }
  }

  async function clearAll() {
    if (!confirm("Clear all notifications? This cannot be undone.")) return;
    setBulkLoading(true);
    try {
      await apiClearAll();
      setNotifications([]);
      toast.success("Notifications cleared");
    } catch {
      toast.error("Failed to clear");
    } finally {
      setBulkLoading(false);
    }
  }

  async function loadMore() {
    if (!hasMore) return;
    await loadPage(page + 1, false);
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread" && !n.unread) return false;
    if (filter === "mentions" && !n.mention) return false;
    if (
      query &&
      !`${n.title} ${n.body ?? ""}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#0177fb]" />
              Notifications
              <Badge className="ml-2">{unreadCount}</Badge>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              All your notifications in one place. Manage, filter, and act
              quickly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Search notifications..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-[240px] h-12 bg-white"
              // icon={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
              }}
            >
              Clear
            </Button>
            <Button onClick={() => setCompact((c) => !c)} variant="ghost">
              {compact ? "Expanded" : "Compact"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              className="px-3 py-1"
            >
              <Layers className="w-4 h-4 mr-2" /> All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              onClick={() => setFilter("unread")}
              className="px-3 py-1"
            >
              <Mail className="w-4 h-4 mr-2" /> Unread
            </Button>
            <Button
              variant={filter === "mentions" ? "default" : "ghost"}
              onClick={() => setFilter("mentions")}
              className="px-3 py-1"
            >
              <Filter className="w-4 h-4 mr-2" /> Mentions
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={markAllRead}
              disabled={bulkLoading || unreadCount === 0}
              className="px-3"
            >
              <Check className="w-4 h-4 mr-2" /> Mark all read
            </Button>
            <Button
              variant="destructive"
              onClick={clearAll}
              disabled={bulkLoading || notifications.length === 0}
              className="px-3"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear all
            </Button>
          </div>
        </div>

        <Separator />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y">
            {filtered.length === 0 && !loading ? (
              <div className="p-14 text-center text-gray-500">
                <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="mt-2 text-sm">
                  You`&apos;`re all caught up — no new notifications right now.
                </p>
              </div>
            ) : (
              <>
                {filtered.map((n) => (
                  <NotificationRow
                    key={n.id}
                    n={n}
                    compact={compact}
                    onToggle={() => toggleRead(n.id)}
                  />
                ))}

                <div className="p-4 flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                    </div>
                  ) : hasMore ? (
                    <Button onClick={loadMore}>Load more</Button>
                  ) : (
                    <div className="text-sm text-gray-400">
                      No more notifications
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Notification row */
function NotificationRow({
  n,
  compact,
  onToggle,
}: {
  n: Notification;
  compact?: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`p-4 flex gap-4 items-start ${
        n.unread ? "bg-gradient-to-r from-white to-blue-50" : "bg-white"
      }`}
    >
      <div>
        <Avatar className="w-10 h-10">
          {n.avatarUrl ? (
            <AvatarImage src={n.avatarUrl} alt="avatar" />
          ) : (
            <AvatarFallback>{n.title.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {n.title}
              </h3>
              {n.mention && <Badge className="text-xs">Mention</Badge>}
              {n.meta && (
                <span className="text-xs text-gray-500 ml-2">{n.meta}</span>
              )}
            </div>
            {!compact && n.body && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {n.body}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-400">{timeAgo(n.time)}</div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={onToggle}
                aria-label={n.unread ? "Mark as read" : "Mark as unread"}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this notification?")) {
                    /* optimistic UI: remove */ toast.success("Deleted");
                  }
                }}
                aria-label="Delete"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
