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
} from "lucide-react";
import Link from "next/link";
import { fetchTeacherProfile } from "@/store/slices/teacherSlice";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const { profile: teacherProfile, loading } = useAppSelector(
    (state) => state.teacher
  );

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
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-black text-slate-900">
          Loading your dashboard<span className="animate-pulse">...</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your teaching workspace
        </p>
        <div className="mt-6 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-amber-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  if (!teacherProfile) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-inner">
            <UserRound className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-900">
            No Teacher Profile Found
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {`We couldn't find your teacher profile. Complete your onboarding to
            unlock your teaching dashboard.`}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/teacher/settings">
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                Complete Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
      {/* Sidebar for desktop */}
      <div className="max-w-[270px] w-full bg-white border-r border-r-[#E4E7EC] h-screen overflow-y-auto hidden xl:block">
        <TeacherSidebar />
      </div>

      <div className="flex-1 flex flex-col max-h-screen h-full">
        {/* Top bar */}
        <div className="border-b border-b-[#E4E7EC] py-3 flex items-center justify-between gap-5 px-3 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger>
                <BarChart className="xl:hidden block" />
              </SheetTrigger>
              <SheetContent side={"left"} className="overflow-y-auto">
                <TeacherSidebar />
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