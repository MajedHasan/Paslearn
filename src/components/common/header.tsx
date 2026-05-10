"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  LogOut,
  MenuSquareIcon,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";
import { Separator } from "../ui/separator";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logoutUser } from "@/store/slices/userSlice";

type Props = {};

const Header = (props: Props) => {
  const user = useAppSelector((state) => state.user.currentUser);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  let dashboard = "student";
  if (user?.role === "ADMIN") {
    dashboard = "admin";
  } else if (user?.role === "TEACHER") {
    dashboard = "teacher";
  } else if (user?.role === "STUDENT") {
    dashboard = "student";
  }

  console.log("From User: ", user);

  return (
    <div className="py-3">
      <div className="container mx-auto">
        <header className="flex items-center justify-between gap-4">
          <div className="flex md:gap-10 gap-2 items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant={"ghost"} className="md:hidden block">
                  {/* <Button variant={"ghost"}> */}
                  <MenuSquareIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side={"left"}>
                <SheetHeader>
                  <div className="flex items-center gap-10">
                    <div className="w-10 h-10 rounded bg-black block"></div>
                    <span className="text-2xl font-bold italic">
                      Course Hub
                    </span>
                  </div>
                </SheetHeader>
                <Separator className="my-6" />
                <nav className="flex items-center gap-6 flex-col">
                  <Link href={"/"} className="hover:text-slate-400">
                    Home
                  </Link>
                  <Link href={"/marketplace"} className="hover:text-slate-400">
                    Courses
                  </Link>
                  <Link href={"/about-us"} className="hover:text-slate-400">
                    About Us
                  </Link>
                  <Link href={"/pricing"} className="hover:text-slate-400">
                    Pricing
                  </Link>
                  <Link href={"/contact"} className="hover:text-slate-400">
                    Contact
                  </Link>
                  <Link href={"/wait-list"} className="hover:text-slate-400">
                    Wait List
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link
              href={"/"}
              className="w-10 h-10 rounded bg-black block"
            ></Link>
            <nav className="md:flex items-center gap-6 hidden">
              <Link href={"/"} className="hover:text-slate-400">
                Home
              </Link>
              <Link href={"/marketplace"} className="hover:text-slate-400">
                Courses
              </Link>
              <Link href={"/about-us"} className="hover:text-slate-400">
                About Us
              </Link>
              <Link href={"/pricing"} className="hover:text-slate-400">
                Pricing
              </Link>
              <Link href={"/contact"} className="hover:text-slate-400">
                Contact
              </Link>
              <Link href={"/wait-list"} className="hover:text-slate-400">
                Wait List
              </Link>
            </nav>
          </div>
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border-2">
                    <AvatarImage src={user.profileImageUrl} alt="Profile Pic" />
                    <AvatarFallback className="bg-yellow-50">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${dashboard}`}
                      className="cursor-pointer flex w-full"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={`/${dashboard}`} className="flex w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="flex w-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    {/* <SignOutButton> */}
                    <Button
                      variant={"destructive"}
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <div className="flex">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </Button>
                    {/* </SignOutButton> */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant={"link"}>
                <Link href={"/auth/sign-up"}>Sign Up</Link>
              </Button>
              <Button asChild variant={"default"}>
                <Link href={"/auth/sign-in"}>Login</Link>
              </Button>
            </div>
          )}
        </header>
      </div>
    </div>
  );
};

export default Header;
