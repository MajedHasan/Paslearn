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
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { AdminSidebarItems } from "@/lib/constants";
import {
  ChevronDown,
  Headphones,
  LogOut,
  Search,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/store/slices/userSlice";
import Image from "next/image";
import type { SidebarItem } from "@/lib/types";

interface Props {
  collapsed: boolean;
}

const AdminSidebar = ({ collapsed }: Props) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const isActiveUrl = (url: string) => {
    if (url === "/") return pathname === "/admin" || pathname === "/admin/";
    return (
      pathname === `/admin${url}` ||
      pathname.startsWith(`/admin${url}/`)
    );
  };

  // Check if an item (or any of its children) is active
  const isItemActive = (item: SidebarItem): boolean => {
    if (isActiveUrl(item.url)) return true;
    if (item.subItems?.some((sub) => isActiveUrl(sub.url))) return true;
    return false;
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return AdminSidebarItems;

    return AdminSidebarItems.map((item) => {
      const parentMatch = item.name.toLowerCase().includes(q);
      const matchingSubItems = item.subItems?.filter((sub) =>
        sub.name.toLowerCase().includes(q)
      );
      if (parentMatch || matchingSubItems?.length) {
        return { ...item, subItems: matchingSubItems || item.subItems };
      }
      return null;
    }).filter(Boolean) as SidebarItem[];
  }, [AdminSidebarItems, searchQuery]);

  const toggleExpand = (itemName: string) =>
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));

  // Render a single item (expanded mode)
  const renderNavItem = (item: SidebarItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = isItemActive(item);
    const isExpanded = expandedItems[item.name] ?? active;

    if (hasSubItems) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpand(item.name)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-[#FF8A65] to-[#FF6B4A] text-white shadow-md shadow-orange-100"
                : "text-slate-600 hover:bg-[#FFECE5]"
            )}
          >
            <item.icon
              size={20}
              className={cn(
                "shrink-0 transition-colors",
                active ? "text-white" : "text-slate-400 group-hover:text-[#FF6B4A]"
              )}
            />
            <span className="flex-1 text-left truncate">{item.name}</span>
            <ChevronDown
              size={16}
              className={cn(
                "shrink-0 transition-transform duration-200",
                isExpanded ? "rotate-180" : "",
                active ? "text-white" : "text-slate-400"
              )}
            />
          </button>

          {isExpanded && (
            <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-slate-200 pl-2 animate-in slide-in-from-left-1">
              {item.subItems!.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={`/admin${subItem.url}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all",
                    isActiveUrl(subItem.url)
                      ? "bg-[#FFECE5] text-[#FF6B4A] font-semibold"
                      : "text-slate-500 hover:bg-[#FFECE5] hover:text-[#FF6B4A]"
                  )}
                >
                  <subItem.icon
                    size={16}
                    className={cn(
                      "shrink-0",
                      isActiveUrl(subItem.url) ? "text-[#FF6B4A]" : "text-slate-400"
                    )}
                  />
                  <span className="truncate">{subItem.name}</span>
                  {isActiveUrl(subItem.url) && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FF6B4A]" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // No subitems -> regular link
    return (
      <Link
        key={item.name}
        href={`/admin${item.url}`}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-[#FF8A65] to-[#FF6B4A] text-white shadow-md shadow-orange-100"
            : "text-slate-600 hover:bg-[#FFECE5]"
        )}
      >
        <item.icon
          size={20}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-white" : "text-slate-400 group-hover:text-[#FF6B4A]"
          )}
        />
        <span className="truncate">{item.name}</span>
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-inner" />
        )}
      </Link>
    );
  };

  // Render collapsed item with popover/tooltip
  const renderCollapsedItem = (item: SidebarItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const active = isItemActive(item);

    if (hasSubItems) {
      return (
        <Popover key={item.name}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
                active
                  ? "bg-gradient-to-r from-[#FF8A65] to-[#FF6B4A] text-white shadow-md shadow-orange-100"
                  : "text-slate-600 hover:bg-[#FFECE5]"
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
              <Link
                key={subItem.name}
                href={`/admin${subItem.url}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  isActiveUrl(subItem.url)
                    ? "bg-[#FFECE5] text-[#FF6B4A] font-semibold"
                    : "text-slate-600 hover:bg-[#FFECE5]"
                )}
              >
                <subItem.icon size={16} className={isActiveUrl(subItem.url) ? "text-[#FF6B4A]" : "text-slate-400"} />
                <span className="flex-1 text-left">{subItem.name}</span>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Tooltip key={item.name}>
        <TooltipTrigger asChild>
          <Link
            href={`/admin${item.url}`}
            className={cn(
              "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
              active
                ? "bg-gradient-to-r from-[#FF8A65] to-[#FF6B4A] text-white shadow-md shadow-orange-100"
                : "text-slate-600 hover:bg-[#FFECE5]"
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

  const renderBottomLink = (url: string, label: string, Icon: any) => {
    const active = isActiveUrl(url);
    if (collapsed) {
      return (
        <Tooltip key={url}>
          <TooltipTrigger asChild>
            <Link
              href={`/admin${url}`}
              className={cn(
                "flex w-full items-center justify-center rounded-lg p-2.5 transition-all",
                active ? "bg-[#FFECE5] text-[#FF6B4A]" : "text-slate-600 hover:bg-[#FFECE5]"
              )}
            >
              <Icon size={20} className={active ? "text-[#FF6B4A]" : "text-slate-400"} />
              <span className="sr-only">{label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={url}
        href={`/admin${url}`}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          active ? "bg-[#FFECE5] text-[#FF6B4A]" : "text-slate-600 hover:bg-[#FFECE5]"
        )}
      >
        <Icon
          size={20}
          className={cn("shrink-0", active ? "text-[#FF6B4A]" : "text-slate-400")}
        />
        <span className="truncate">{label}</span>
      </Link>
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
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md">
            <Image
              src="/img/Logo.png"
              alt="Paslearn Logo"
              className="h-full w-full object-cover"
              width={36}
              height={36}
            />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                Paslearn
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Panel
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
              placeholder="Search admin..."
              className="h-9 rounded-lg border-slate-200 bg-slate-50/80 pl-9 pr-7 text-sm focus:bg-white focus:border-[#FF8A65] focus:ring-2 focus:ring-[#FFECE5]"
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
            {collapsed
              ? filteredItems.map((item) => renderCollapsedItem(item))
              : filteredItems.map((item) => renderNavItem(item))}
          </nav>
        </div>

        {/* Bottom items */}
        <div className="space-y-0.5 border-t border-slate-100 pt-2">
          {renderBottomLink("/settings", "Settings", Settings)}
          {renderBottomLink("/help-center", "Help Center", Headphones)}
        </div>

        {/* Profile card */}
        <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={user?.profileImageUrl} alt="Profile" />
            <AvatarFallback className="bg-[#FFECE5] text-[#FF6B4A] font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Admin"}
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
    </TooltipProvider>
  );
};

export default AdminSidebar;