"use client";

import { useState } from "react";
import StudentSidebar from "@/components/global/sidebar/student-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logoutUser } from "@/store/slices/userSlice";
import {
  BarChart,
  Bell,
  LogOut,
  Mail,
  MailOpen,
  MessageSquareTextIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

const StudentLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user.currentUser);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
        {/* Sidebar for desktop */}
        <div className="sticky top-0 h-screen shrink-0 bg-white border-r border-r-[#E4E7EC] overflow-hidden hidden xl:block">
          <StudentSidebar collapsed={collapsed} />
        </div>
        <div className="flex-1 flex flex-col max-h-screen h-full">
          <div className="border-b border-b-[#E4E7EC] bg-white py-3 flex items-center justify-between gap-5 px-3">
            <div className="flex-1 flex items-center gap-3">
              {/* Sidebar toggle (desktop only) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden xl:inline-flex"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>

              {/* Mobile sheet */}
              <Sheet>
                <SheetTrigger>
                  <BarChart className="xl:hidden block" />
                </SheetTrigger>
                <SheetContent side={"left"} className="overflow-y-scroll">
                  <StudentSidebar collapsed={false} />
                </SheetContent>
              </Sheet>
            </div>
            <Input placeholder="Search here..." className="flex-[2]" />
            <div className="flex-1 flex items-center gap-3 justify-end">
              <Link href={"/student/messages"} className="relative">
                <MessageSquareTextIcon />
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-red-400 border-2 border-slate-100" />
              </Link>
              <Drawer>
                <DrawerTrigger>
                  <Bell />
                </DrawerTrigger>
                <DrawerContent className="p-4 bg-slate-200">
                  <DrawerHeader>
                    <DrawerTitle className="text-center">
                      Notifications
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="bg-white p-4 rounded flex flex-col gap-2 flex-1 max-h-[70vh] overflow-y-scroll">
                    {/* ... notification items unchanged ... */}
                    {/* Keep your existing notification list here */}
                  </div>
                </DrawerContent>
              </Drawer>
              <Popover>
                <PopoverTrigger>
                  <Avatar>
                    <AvatarImage src={user?.profileImageUrl} alt="Profile Pic" />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-[200px]">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_DOMAIN}/student`}
                      className="cursor-pointer flex w-full items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={`${process.env.NEXT_PUBLIC_DOMAIN}/student/settings`}
                      className="flex items-center w-full"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex-1 max-h-full overflow-y-scroll px-5 py-2">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentLayout;