"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { StudentSidebarItems } from "@/lib/constants";
import {
  ChevronDown,
  Clock,
  GraduationCap,
  Lock,
  LogOut,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/store/slices/userSlice";
import { toast } from "sonner";
import type { SidebarItem } from "@/lib/types";

interface Props {
  collapsed?: boolean;
}

const PLAN_TIERS: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

const StudentSidebar = ({ collapsed = false }: Props) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // For now, derive current plan from user object; later integrate subscription system
  const currentPlan = (user as any)?.plan || "free";
  const currentTier = PLAN_TIERS[currentPlan] ?? 0;

  const isLocked = (item: SidebarItem) => {
    if (!item.minPlan) return false;
    return currentTier < (PLAN_TIERS[item.minPlan] ?? 0);
  };

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/student" || pathname === "/student/";
    return (
      pathname === `/student${url}` ||
      pathname.startsWith(`/student${url}/`)
    );
  };

  const isItemActive = (item: SidebarItem) => {
    if (isActive(item.url)) return true;
    if (item.subItems?.some((sub) => isActive(sub.url))) return true;
    return false;
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return StudentSidebarItems;
    return StudentSidebarItems.map((item) => {
      const parentMatch = item.name.toLowerCase().includes(q);
      const matchingSubItems = item.subItems?.filter((sub) =>
        sub.name.toLowerCase().includes(q)
      );
      if (parentMatch || matchingSubItems?.length) {
        return { ...item, subItems: matchingSubItems || item.subItems };
      }
      return null;
    }).filter(Boolean) as SidebarItem[];
  }, [StudentSidebarItems, searchQuery]);

  const toggleExpand = (itemName: string) =>
    setExpandedItems((prev) => ({ ...prev, [itemName]: !prev[itemName] }));

  const handleComingSoon = (itemName: string) => {
    toast.info(`${itemName} is coming soon! Stay tuned.`);
  };

  const handleLocked = () => {
    setUpgradeOpen(true);
  };

  const renderStatusBadge = (status?: "coming_soon" | "beta") => {
    if (status === "beta") {
      return (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm shadow-amber-200/70">
          <Sparkles className="h-3 w-3" />
          Beta
        </span>
      );
    }
    if (status === "coming_soon") {
      return (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
          <Clock className="h-3 w-3" />
          Soon
        </span>
      );
    }
    return null;
  };

  const renderLockBadge = (item: SidebarItem) => {
    return (
      <span className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-sm">
        <Lock size={10} />
      </span>
    );
  };

  // Expanded mode
  const renderNavItem = (item: SidebarItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = isItemActive(item);
    const isExpanded = expandedItems[item.name] ?? active;
    const locked = isLocked(item);

    if (hasSubItems) {
      return (
        <div key={item.name}>
          <button
            onClick={() => {
              if (locked) handleLocked();
              else toggleExpand(item.name);
            }}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-blue-100"
                : "text-slate-600 hover:bg-[#E8F1FF]"
            )}
          >
            <item.icon
              size={20}
              className={cn(
                "shrink-0 transition-colors",
                active ? "text-white" : "text-slate-400 group-hover:text-[#0177FB]"
              )}
            />
            <span className="flex-1 text-left truncate">{item.name}</span>
            {locked && renderLockBadge(item)}
            {!locked && renderStatusBadge(item.status)}
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 transition-transform duration-200",
                isExpanded ? "rotate-180" : "",
                active ? "text-white" : "text-slate-400"
              )}
            />
          </button>

          {isExpanded && !locked && (
            <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-2 animate-in slide-in-from-left-1">
              {item.subItems!.map((subItem) => (
                <SubNavItem
                  key={subItem.name}
                  item={subItem}
                  isActive={isActive}
                  isLocked={isLocked}
                  handleComingSoon={handleComingSoon}
                  handleLocked={handleLocked}
                  renderStatusBadge={renderStatusBadge}
                  renderLockBadge={renderLockBadge}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // No subitems
    if (locked) {
      return (
        <button
          key={item.name}
          onClick={handleLocked}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-100 transition-all"
        >
          <item.icon size={20} className="shrink-0 text-slate-400" />
          <span className="flex-1 text-left truncate">{item.name}</span>
          {renderLockBadge(item)}
        </button>
      );
    }

    if (item.status === "coming_soon") {
      return (
        <button
          key={item.name}
          onClick={() => handleComingSoon(item.name)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-100 transition-all"
        >
          <item.icon size={20} className="shrink-0 text-slate-400" />
          <span className="flex-1 text-left truncate">{item.name}</span>
          {renderStatusBadge("coming_soon")}
        </button>
      );
    }

    return (
      <Link
        key={item.name}
        href={`/student${item.url}`}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-blue-100"
            : "text-slate-600 hover:bg-[#E8F1FF]"
        )}
      >
        <item.icon
          size={20}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-white" : "text-slate-400 group-hover:text-[#0177FB]"
          )}
        />
        <span className="truncate">{item.name}</span>
        {renderStatusBadge(item.status)}
        {active && !item.status && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-inner" />
        )}
      </Link>
    );
  };

  // Collapsed mode
  const renderCollapsedItem = (item: SidebarItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = isItemActive(item);
    const locked = isLocked(item);

    if (hasSubItems) {
      return (
        <Popover key={item.name}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
                active
                  ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-blue-100"
                  : "text-slate-600 hover:bg-[#E8F1FF]"
              )}
            >
              <item.icon size={20} className={active ? "text-white" : "text-slate-400"} />
              <span className="sr-only">{item.name}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-56 p-2">
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {item.name}
            </p>
            {item.subItems!.map((subItem) => (
              <SubNavItem
                key={subItem.name}
                item={subItem}
                isActive={isActive}
                isLocked={isLocked}
                handleComingSoon={handleComingSoon}
                handleLocked={handleLocked}
                renderStatusBadge={renderStatusBadge}
                renderLockBadge={renderLockBadge}
                collapsed
              />
            ))}
          </PopoverContent>
        </Popover>
      );
    }

    if (locked || item.status === "coming_soon") {
      return (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                if (locked) handleLocked();
                else handleComingSoon(item.name);
              }}
              className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-400 hover:bg-slate-100 transition-all"
            >
              <item.icon size={20} className="text-slate-400" />
              <span className="sr-only">{item.name}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.name} – {locked ? "Upgrade required" : "Coming soon"}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={item.name}>
        <TooltipTrigger asChild>
          <Link
            href={`/student${item.url}`}
            className={cn(
              "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
              active
                ? "bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white shadow-md shadow-blue-100"
                : "text-slate-600 hover:bg-[#E8F1FF]"
            )}
          >
            <item.icon size={20} className={active ? "text-white" : "text-slate-400"} />
            <span className="sr-only">{item.name}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex h-full flex-col gap-4 p-3 transition-all duration-300 ease-in-out",
          collapsed ? "w-[80px]" : "w-[270px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-md shadow-blue-100">
            <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.2} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Paslearn
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Student
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="relative px-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className="h-9 rounded-lg border-slate-200 bg-slate-50/80 pl-9 pr-7 text-sm focus:bg-white focus:border-[#0177FB] focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-200"
              >
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <nav className="space-y-0.5">
            {filteredItems.map((item) =>
              collapsed ? renderCollapsedItem(item) : renderNavItem(item)
            )}
          </nav>
        </div>

        {/* Invite card */}
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-b from-[#F0F7FF] to-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#0177FB]" />
              <span className="text-sm font-semibold text-slate-900">
                Invite a Friend
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Get 5% off when they join.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full bg-[#0177FB] text-white hover:bg-[#0156C7]"
            >
              Send Invite
            </Button>
          </div>
        )}

        {/* Profile mini card */}
        <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user?.profileImageUrl} alt="Profile" />
            <AvatarFallback className="bg-blue-100 text-[#0177FB] font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Student"}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-red-500"
                onClick={() => dispatch(logoutUser())}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Logout</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {/* Upgrade Modal */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Lock className="h-6 w-6 text-[#0177FB]" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              This feature is available on higher plans. Upgrade your subscription to unlock everything.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>
              Maybe Later
            </Button>
            <Link href="/pricing" className="w-full">
              <Button className="w-full bg-gradient-to-r from-[#0177FB] to-[#0156C7] text-white">
                View Pricing Plans
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

// SubNavItem helper component (used inside StudentSidebar)
const SubNavItem = ({
  item,
  isActive,
  isLocked,
  handleComingSoon,
  handleLocked,
  renderStatusBadge,
  renderLockBadge,
  collapsed = false,
}: any) => {
  const active = isActive(item.url);
  const locked = isLocked(item);

  if (locked) {
    return (
      <button
        onClick={handleLocked}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-50 transition-all"
      >
        <item.icon size={16} className="text-slate-400" />
        <span className="flex-1 text-left truncate">{item.name}</span>
        {renderLockBadge(item)}
      </button>
    );
  }

  if (item.status === "coming_soon") {
    return (
      <button
        onClick={() => handleComingSoon(item.name)}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-50 transition-all"
      >
        <item.icon size={16} className="text-slate-400" />
        <span className="flex-1 text-left truncate">{item.name}</span>
        {renderStatusBadge("coming_soon")}
      </button>
    );
  }

  const linkClass = collapsed
    ? "flex items-center gap-2 rounded-lg px-2 py-2 text-sm"
    : "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all";

  return (
    <Link
      href={`/student${item.url}`}
      className={cn(
        linkClass,
        active
          ? "bg-[#E8F1FF] text-[#0177FB] font-semibold"
          : "text-slate-600 hover:bg-[#E8F1FF]"
      )}
    >
      <item.icon size={16} className={active ? "text-[#0177FB]" : "text-slate-400"} />
      <span className="truncate">{item.name}</span>
      {renderStatusBadge(item.status)}
      {active && !item.status && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0177FB]" />
      )}
    </Link>
  );
};

export default StudentSidebar;