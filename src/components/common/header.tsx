"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  LogOut,
  MenuSquareIcon,
  MessageCircle,
  Settings,
  User,
  ShoppingCart,
  GraduationCap,
  Search,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logoutUser } from "@/store/slices/userSlice";
import api from "@/lib/api";

const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/courses", label: "Courses" },
  { href: "/about-us", label: "About Us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/wait-list", label: "Wait List" },
];

const Header = () => {
  const user = useAppSelector((state) => state.user.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ⭐ Fetch cart count with cache-buster
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setCartCount(0);
      return;
    }
    const fetchCart = async () => {
      try {
        const r = await api.get("/cart", {
          params: { _t: Date.now() },
          headers: { "Cache-Control": "no-cache" },
        });
        setCartCount(r.data.data?.items?.length || 0);
      } catch {
        setCartCount(0);
      }
    };
    fetchCart();
    const onUpdate = () => fetchCart();
    window.addEventListener("cart:updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("cart:updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [pathname]);

  // ⭐ Fix: user.role is lowercase ("admin"/"teacher"/"student")
  const dashboard =
    user?.role?.toLowerCase() === "admin"
      ? "/admin"
      : user?.role?.toLowerCase() === "teacher"
      ? "/teacher"
      : "/student";

  const handleLogout = async () => {
    await dispatch(logoutUser() as any);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ── Left: logo + nav ── */}
          <div className="flex items-center gap-6">
            {/* Mobile sheet */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                  <MenuSquareIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7]">
                      <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-black">Paslearn</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {PUBLIC_NAV.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-md shadow-[#0177FB]/25">
                <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="hidden text-lg font-black tracking-tight text-slate-900 sm:block">
                Paslearn
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {PUBLIC_NAV.slice(0, 7).map((n) => {
                const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Right: cart + auth ── */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-slate-600" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0177FB] px-1 text-[10px] font-black text-white shadow-md">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-slate-200 shadow-sm transition-all hover:border-[#0177FB]">
                    <AvatarImage src={user.profileImageUrl} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-[#0177FB] to-[#0156C7] text-sm font-black text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={dashboard} className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex cursor-pointer items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex cursor-pointer items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-rose-600 focus:text-rose-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/sign-in" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    size="sm"
                    className="rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-md shadow-[#0177FB]/25 hover:from-[#0156C7] hover:to-[#014bb0]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;