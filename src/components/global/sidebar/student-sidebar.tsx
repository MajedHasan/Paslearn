"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/hooks/useRedux";
import { StudentSidebarItems, StudentSidebarItems2 } from "@/lib/constants";
// import { currentUser } from "@clerk/nextjs/server";
import { ChevronDown, Headphones, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Props = {};

const StudentSidebar = (props: Props) => {
  const user = useAppSelector((state) => state.user.currentUser);

  const [path, setPath] = useState("/");

  const updatePath = () => {
    const currentPath = window.location.href.split("/student")[1];
    if (currentPath === "") {
      setPath("/"); // Default to root if no path after /student
    } else {
      setPath(currentPath); // Set the path extracted after /student
    }
  };

  useEffect(() => {
    // Update the path on initial load
    updatePath();

    // Listen to popstate event (for browser navigation like back/forward)
    const handlePopState = () => {
      updatePath(); // Update path when user navigates back/forward
    };

    // Listen to hashchange for changes in hash (#) URL
    const handleHashChange = () => {
      updatePath(); // Update path when the URL hash changes
    };

    // Override pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = (
      state: any,
      title: string = "",
      url: string | URL | null = ""
    ) => {
      originalPushState.call(window.history, state, title || "", url || "");
      updatePath(); // Trigger path update when using pushState
    };

    // Override replaceState
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = (
      state: any,
      title: string = "",
      url: string | URL | null = ""
    ) => {
      originalReplaceState.call(window.history, state, title || "", url || "");
      updatePath(); // Trigger path update when using replaceState
    };

    // Attach listeners to popstate and hashchange events
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <aside className="flex flex-col gap-5 justify-between h-full p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-7 h-7 rounded-full bg-themeStudentPrimary"></div>
          <span className="text-lg font-bold text-themeStudentPrimary">
            Paslearn
          </span>
        </div>
        <div className="flex flex-1 overflow-hiden max-h-full xl:mt-16 mt-8">
          <div className="flex flex-col overflow-scroll flex-1">
            <h2 className="text-md px-4 mb-3 border-b bg-[#0177FB70] rounded py-2 flex items-center justify-between font-bold">
              Menu
              <ChevronDown size={12} />
            </h2>
            {StudentSidebarItems.map((item) => (
              <Link
                key={item.name}
                href={`/student${item.url}`}
                className={`w-full py-3 hover:bg-themeStudentPrimary transition-all rounded-lg pl-4 group flex items-center gap-3 ${
                  item.url === path && "bg-themeStudentPrimary"
                }`}
              >
                {
                  <item.icon
                    size={20}
                    className={`text-[#667185] group-hover:text-white ${
                      item.url === path && "text-white"
                    }`}
                  />
                }
                <span
                  className={`group-hover:font-medium text-sm group-hover:text-white ${
                    item.url === path && "text-white"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex flex-1 overflow-hiden max-h-full xl:mt-16 mt-8">
          <div className="flex flex-col overflow-scroll flex-1">
            <h2 className="text-md px-4 mb-3 border-b bg-[#0177FB70] rounded py-2 flex items-center justify-between font-bold">
              Account
              <ChevronDown size={12} />
            </h2>
            {StudentSidebarItems2.map((item) => (
              <Link
                key={item.name}
                href={`/student${item.url}`}
                className={`w-full py-3 hover:bg-themeStudentPrimary transition-all rounded-lg pl-4 group flex items-center gap-3 ${
                  item.url === path && "bg-themeStudentPrimary"
                }`}
              >
                {
                  <item.icon
                    size={20}
                    className={`text-[#667185] group-hover:text-white ${
                      item.url === path && "text-white"
                    }`}
                  />
                }
                <span
                  className={`group-hover:font-medium text-sm group-hover:text-white ${
                    item.url === path && "text-white"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-20">
        <Card className="bg-[#F0F7FF]">
          <CardContent className="pb-0">
            <Image
              src={"/img/Student-Invite.png"}
              alt="Student Invite"
              width={100}
              height={180}
              className="w-full -mt-20"
            />
          </CardContent>
          <CardHeader className="pb-0">
            <CardTitle className="text-center">Invite Friend</CardTitle>
          </CardHeader>
          <CardFooter className="p-4">
            <Button className="text-xs bg-themeStudentPrimary mx-auto">
              Send The Link And Get <strong>&nbsp; 5% OFF</strong>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </aside>
  );
};

export default StudentSidebar;
