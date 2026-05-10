"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/useRedux";
import { AdminSidebarItems } from "@/lib/constants";
import {
  BetweenHorizonalEndIcon,
  BookDashedIcon,
  CloudLightning,
  Headphones,
  Layout,
  ListChecksIcon,
  LogOut,
  Settings,
  Share2,
  Users2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

const AdminSidebar = (props: Props) => {
  const user = useAppSelector((state) => state.user.currentUser);

  return (
    <aside className="flex flex-col gap-5 justify-between h-full p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 pl-4">
          <div className="w-7 h-7 rounded-full bg-themeAdminPrimary"></div>
          <span className="text-lg font-bold text-themeAdminPrimary">
            Paslearn
          </span>
        </div>
        <div className="flex flex-1 overflow-hiden max-h-full">
          <div className="flex flex-col overflow-scroll flex-1">
            {AdminSidebarItems.map((item) => (
              <Link
                key={item.name}
                href={`/admin${item.url}`}
                className="w-full py-3 hover:bg-[#FFECE5] transition-all rounded-lg pl-4 group flex items-center gap-3 "
              >
                {
                  <item.icon
                    size={20}
                    className="text-[#667185] group-hover:text-themeAdminPrimary"
                  />
                }
                <span className="group-hover:font-medium text-sm">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Link
          href={`/admin/settings`}
          className="w-full py-3 hover:bg-[#FFECE5] transition-all rounded-lg pl-4 group flex items-center gap-3"
        >
          {
            <Settings
              size={20}
              className="text-[#667185] group-hover:text-themeAdminPrimary"
            />
          }
          <span className="group-hover:font-medium text-sm">Settings</span>
        </Link>
        <Link
          href={`/admin/help-center`}
          className="w-full py-3 hover:bg-[#FFECE5] transition-all rounded-lg pl-4 group flex items-center gap-3"
        >
          {
            <Headphones
              size={20}
              className="text-[#667185] group-hover:text-themeAdminPrimary"
            />
          }
          <span className="group-hover:font-medium text-sm">Help Center</span>
        </Link>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} alt="Profile Pic" />
              <AvatarFallback>{user?.name}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-sm">{user?.role as string}</span>
              <span className="text-xs max-w-[140px] block break-words">
                {user?.email}
              </span>
            </div>
          </div>
          <Button variant={"ghost"}>
            <LogOut />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
