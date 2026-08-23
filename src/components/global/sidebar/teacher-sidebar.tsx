"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import {
  BookText,
  ChevronDown,
  CircleHelp,
  Clock,
  GraduationCap,
  Lock,
  LogOut,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { logoutUser } from "@/store/slices/userSlice";
import { TeacherSidebarItems } from "@/lib/constants";
import type { SidebarItem } from "@/lib/types";

interface Props {
  collapsed: boolean;
}

const PLAN_TIERS: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

const TeacherSidebar = ({ collapsed }: Props) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const teacherProfile = useAppSelector((state) => state.teacher.profile);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const profileCompletion = useMemo(() => {
    let filled = 0;
    const total = 4;
    if (teacherProfile?.fullName) filled++;
    if (teacherProfile?.bio) filled++;
    if (teacherProfile?.profileImageUrl) filled++;
    if (teacherProfile?.domain) filled++;
    return Math.round((filled / total) * 100);
  }, [teacherProfile]);

  const currentTier = useMemo(() => {
    const plan =
      teacherProfile?.selectedPlan?.slug ||
      teacherProfile?.selectedPlan?.name ||
      "free";
    const normalized = plan.toLowerCase() === "free_trial" ? "free" : plan.toLowerCase();
    return PLAN_TIERS[normalized] ?? 0;
  }, [teacherProfile]);

  const isLocked = (item: SidebarItem) => {
    if (!item.minPlan) return false;
    return currentTier < (PLAN_TIERS[item.minPlan] ?? 0);
  };

  const isParentActive = (url: string) => {
    if (url === "/") return pathname === "/teacher" || pathname === "/teacher/";
    return (
      pathname === `/teacher${url}` ||
      pathname.startsWith(`/teacher${url}/`)
    );
  };

  const isChildActive = (url: string) => {
    if (url === "/") return pathname === "/teacher" || pathname === "/teacher/";
    return pathname === `/teacher${url}`;
  };

  const toggleExpand = (itemName: string) =>
    setExpandedItems((prev) => ({ ...prev, [itemName]: !prev[itemName] }));

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TeacherSidebarItems;
    return TeacherSidebarItems.filter((item) => {
      const parentMatch = item.name.toLowerCase().includes(q);
      const childMatch = item.subItems?.some((sub) =>
        sub.name.toLowerCase().includes(q)
      );
      return parentMatch || childMatch;
    }).map((item) => {
      if (item.subItems && searchQuery) {
        const matchingSubItems = item.subItems.filter((sub) =>
          sub.name.toLowerCase().includes(q)
        );
        return { ...item, subItems: matchingSubItems };
      }
      return item;
    });
  }, [TeacherSidebarItems, searchQuery]);

  // Premium status badge (Beta / Soon)
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

  // Premium item icon with lock overlay
  const renderItemIcon = (item: SidebarItem, active: boolean) => (
    <div className="relative shrink-0">
      <item.icon
        size={20}
        className={cn(active ? "text-white" : "text-slate-400")}
      />
      {isLocked(item) && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200/70">
          <Lock size={8} />
        </span>
      )}
    </div>
  );

  // Compact lock badge with tooltip (fixes overlap / hidden submenu)
  const renderLockBadge = (item: SidebarItem) => {
    if (!item.minPlan) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-sm">
            <Lock size={10} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          Requires {item.minPlan.charAt(0).toUpperCase() + item.minPlan.slice(1)} plan
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderUpgradeModal = () => (
    <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Lock className="h-6 w-6 text-amber-500" />
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
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              View Pricing Plans
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex h-full flex-col p-2 transition-all duration-300 ease-in-out",
          collapsed ? "w-[80px]" : "w-[270px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200/50">
              <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.2} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                  Paslearn
                </h1>
                <Badge
                  variant="outline"
                  className="mt-0.5 rounded-full border-amber-200 bg-amber-50 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-amber-700"
                >
                  Teacher
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="relative mt-2 px-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search navigation..."
              className="h-9 rounded-lg border-slate-200 bg-slate-50/80 pl-9 pr-7 text-sm focus:bg-white focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
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
        <div className="mt-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <nav className="space-y-0.5">
            {filteredItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const parentActive = isParentActive(item.url);
              const isExpanded =
                expandedItems[item.name] ??
                (parentActive || searchQuery.trim() !== "");
              const locked = isLocked(item);

              // Collapsed with subitems
              if (collapsed && hasSubItems) {
                return (
                  <Popover key={item.name}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
                          parentActive
                            ? "bg-amber-500 text-white shadow-md shadow-amber-200/50"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {renderItemIcon(item, parentActive)}
                        <span className="sr-only">{item.name}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="w-56 p-2">
                      <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {item.name}
                      </p>
                      {item.subItems!.map((subItem) => {
                        const subLocked = isLocked(subItem);
                        const subActive = isChildActive(subItem.url);
                        if (subLocked) {
                          return (
                            <button
                              key={subItem.name}
                              onClick={() => setUpgradeOpen(true)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-50"
                            >
                              <subItem.icon size={16} className="text-slate-400" />
                              <span className="flex-1 text-left">{subItem.name}</span>
                              {renderLockBadge(subItem)}
                            </button>
                          );
                        }
                        if (subItem.status === "coming_soon") {
                          return (
                            <div
                              key={subItem.name}
                              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400"
                            >
                              <subItem.icon size={16} className="text-slate-300" />
                              <span className="flex-1 text-left">{subItem.name}</span>
                              {renderStatusBadge("coming_soon")}
                            </div>
                          );
                        }
                        return (
                          <Link
                            key={subItem.name}
                            href={`/teacher${subItem.url}`}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                              subActive
                                ? "bg-amber-100 text-amber-900 font-semibold"
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            <subItem.icon size={16} className={subActive ? "text-amber-600" : "text-slate-400"} />
                            <span className="flex-1 text-left">{subItem.name}</span>
                            {renderStatusBadge(subItem.status)}
                          </Link>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                );
              }

              // Collapsed without subitems
              if (collapsed && !hasSubItems) {
                if (locked) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setUpgradeOpen(true)}
                          className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-400 hover:bg-slate-100 transition-all"
                        >
                          {renderItemIcon(item, false)}
                          <span className="sr-only">{item.name} (locked)</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name} – Upgrade required</TooltipContent>
                    </Tooltip>
                  );
                }
                if (item.status === "coming_soon") {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <div className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-300">
                          {renderItemIcon(item, false)}
                          <span className="sr-only">{item.name} (coming soon)</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name} – Coming soon</TooltipContent>
                    </Tooltip>
                  );
                }
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/teacher${item.url}`}
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
                          parentActive
                            ? "bg-amber-500 text-white shadow-md shadow-amber-200/50"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {renderItemIcon(item, parentActive)}
                        <span className="sr-only">{item.name}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>
                );
              }

              // Expanded mode
              return (
                <div key={item.name}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        parentActive
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {renderItemIcon(item, parentActive)}
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      {renderStatusBadge(item.status)}
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200 shrink-0",
                          isExpanded ? "rotate-180" : "",
                          parentActive ? "text-white" : "text-slate-400"
                        )}
                      />
                    </button>
                  ) : locked ? (
                    <button
                      onClick={() => setUpgradeOpen(true)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-100 transition-all"
                    >
                      {renderItemIcon(item, false)}
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      {renderLockBadge(item)}
                    </button>
                  ) : item.status === "coming_soon" ? (
                    <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300">
                      {renderItemIcon(item, false)}
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      {renderStatusBadge("coming_soon")}
                    </div>
                  ) : (
                    <Link
                      href={`/teacher${item.url}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        parentActive
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {renderItemIcon(item, parentActive)}
                      <span className="truncate">{item.name}</span>
                      {renderStatusBadge(item.status)}
                      {parentActive && !item.status && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-inner" />
                      )}
                    </Link>
                  )}

                  {hasSubItems && isExpanded && (
                    <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-2 animate-in slide-in-from-left-1">
                      {item.subItems!.map((subItem) => {
                        const subLocked = isLocked(subItem);
                        const subActive = isChildActive(subItem.url);
                        if (subLocked) {
                          return (
                            <button
                              key={subItem.name}
                              onClick={() => setUpgradeOpen(true)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-50 transition-all"
                            >
                              <subItem.icon size={16} className="text-slate-400" />
                              <span className="flex-1 text-left truncate">{subItem.name}</span>
                              {renderLockBadge(subItem)}
                            </button>
                          );
                        }
                        if (subItem.status === "coming_soon") {
                          return (
                            <div
                              key={subItem.name}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-300"
                            >
                              <subItem.icon size={16} className="text-slate-300" />
                              <span className="flex-1 text-left truncate">{subItem.name}</span>
                              {renderStatusBadge("coming_soon")}
                            </div>
                          );
                        }
                        return (
                          <Link
                            key={subItem.name}
                            href={`/teacher${subItem.url}`}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all",
                              subActive
                                ? "bg-amber-100 text-amber-900 font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            )}
                          >
                            <subItem.icon
                              size={16}
                              className={cn(
                                subActive ? "text-amber-600" : "text-slate-400"
                              )}
                            />
                            <span className="truncate">{subItem.name}</span>
                            {renderStatusBadge(subItem.status)}
                            {subActive && !subItem.status && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Help Card */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/docs"
                className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all"
              >
                <CircleHelp size={16} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Need Help?</TooltipContent>
          </Tooltip>
        ) : (
          <div className="mt-2 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-white shadow-md">
            <div className="flex items-center gap-2">
              <CircleHelp size={16} className="text-amber-400" />
              <span className="text-sm font-semibold">Need Help?</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">Check our docs or contact support.</p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mt-2 w-full bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/docs" className="flex items-center justify-center gap-1">
                <BookText size={14} />
                <span>VIEW DOCS</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Free plan banner */}
        {currentTier === 0 && !collapsed && (
          <Link
            href="/pricing"
            className="mt-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-center text-xs font-semibold text-amber-700 hover:from-amber-100 hover:to-orange-100 transition-colors shadow-sm"
          >
            Upgrade to unlock all features
          </Link>
        )}

        {/* Profile mini card */}
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage
              src={teacherProfile?.profileImageUrl || user?.profileImageUrl || undefined}
            />
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {(teacherProfile?.fullName || user?.name || "T").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {teacherProfile?.fullName || user?.name || "Teacher"}
              </p>
              <div className="flex items-center gap-1.5">
                <Progress value={profileCompletion} className="h-1 w-20" />
                <span className="text-[10px] text-slate-500">{profileCompletion}%</span>
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={() => dispatch(logoutUser())}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </div>
      </aside>

      {renderUpgradeModal()}
    </TooltipProvider>
  );
};

export default TeacherSidebar;