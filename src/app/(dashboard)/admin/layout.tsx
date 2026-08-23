"use client";

import { useState } from "react";
import AdminSidebar from "@/components/global/sidebar/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <main className="w-full min-h-screen h-full bg-[#F0F2F5] flex">
        {/* Sidebar for desktop */}
        <div className="sticky top-0 h-screen shrink-0 bg-white border-r border-r-[#E4E7EC] overflow-hidden hidden xl:block">
          <AdminSidebar collapsed={collapsed} />
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
                <SheetContent side={"left"} className="overflow-y-auto">
                  <AdminSidebar collapsed={false} />
                </SheetContent>
              </Sheet>
            </div>
            <Input placeholder="Search here..." className="flex-[2]" />
            <div className="flex-1"></div>
          </div>
          <div className="flex-1 max-h-full overflow-y-scroll px-5 py-2">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;