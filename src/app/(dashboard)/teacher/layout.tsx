"use client";

import TeacherSidebar from "@/components/global/sidebar/teacher-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import api from "@/lib/api";
import { BarChart, Bell, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TeacherLayout = ({ children }: { children: React.ReactNode }) => {

  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/teacher-profile");
      console.log("Fetched teacher profile:", response.data.data);
      setTeacherProfile(response.data.data);
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  return (
    <>
      <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
        <div className="max-w-[270px] w-full bg-white border-r border-r-[#E4E7EC] h-screen overflow-y-scroll hidden xl:block">
          <TeacherSidebar />
        </div>
        <div className="flex-1 flex flex-col max-h-screen h-full">
          <div className="border-b border-b-[#E4E7EC] py-3 flex items-center justify-between gap-5 px-3">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger>
                  <BarChart className="xl:hidden block" />
                </SheetTrigger>
                <SheetContent side={"left"} className="overflow-y-scroll">
                  <TeacherSidebar />
                </SheetContent>
              </Sheet>
              <div>
                <h2 className="font-bold text-xl">{greetings}</h2>
                <p className="text-xs">{teacherProfile?.name || "Guest"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={"/teacher/notification"}>
                <Bell className="text-[#8B8C8C]" />
              </Link>
              <Link href={"/teacher/settings"}>
                <Settings className="text-[#8B8C8C]" />
              </Link>
              <div className="pl-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm">Today,</span>
                  <CalendarDays size={20}/>
                </div>
                <div className="text-xs font-bold">
                  {/* 8 feb, 2024 */}
                  {new Date().toDateString()}
                </div>
              </div>
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

export default TeacherLayout;
