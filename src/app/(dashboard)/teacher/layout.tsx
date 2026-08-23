"use client";

import { useEffect, useState } from "react";
import TeacherSidebar from "@/components/global/sidebar/teacher-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bell,
  CalendarDays,
  Settings,
  Loader2,
  Sparkles,
  UserRound,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { fetchTeacherProfile } from "@/store/slices/teacherSlice";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const { profile: teacherProfile, loading } = useAppSelector(
    (state) => state.teacher
  );

  const [collapsed, setCollapsed] = useState(false);
  const [greetings, setGreetings] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreetings("Good Morning");
    } else if (hour < 18) {
      setGreetings("Good Afternoon");
    } else {
      setGreetings("Good Evening");
    }
    dispatch(fetchTeacherProfile());
  }, [dispatch]);

  if (loading) {
    // ... same loading UI ...
  }

  if (!teacherProfile) {
    // ... same no-profile UI ...
  }

  return (
    <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
      {/* Sidebar for desktop */}
      <div className="sticky top-0 h-screen shrink-0 bg-white border-r border-r-[#E4E7EC] overflow-hidden hidden xl:block">
        <TeacherSidebar collapsed={collapsed} />
      </div>

      <div className="flex-1 flex flex-col max-h-screen h-full">
        {/* Top bar */}
        <div className="border-b border-b-[#E4E7EC] py-3 flex items-center justify-between gap-5 px-3 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
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
              <SheetContent side={"left"} className="overflow-y-auto">
                <TeacherSidebar collapsed={false} />
              </SheetContent>
            </Sheet>

            <div>
              <h2 className="font-bold text-xl">{greetings}</h2>
              <p className="text-xs">
                {teacherProfile?.fullName || user?.name || "Teacher"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/teacher/notification">
              <Bell className="text-[#8B8C8C]" />
            </Link>
            <Link href="/teacher/settings">
              <Settings className="text-[#8B8C8C]" />
            </Link>
            <div className="pl-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm">Today,</span>
                <CalendarDays size={20} />
              </div>
              <div className="text-xs font-bold">
                {new Date().toDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 max-h-full overflow-y-auto px-5 py-2">
          {children}
        </div>
      </div>
    </main>
  );
};

export default TeacherLayout;