// @ts-nocheck
// @ts-ignore

import React from "react"; // Import React if you're using JSX
import {
  BetweenHorizonalEndIcon,
  BookDashedIcon,
  CloudLightning,
  Layout,
  ListChecksIcon,
  Share2,
  Users2,
  Magnet,
  Mailbox,
  BookCopyIcon,
  Home,
  BookOpen,
  PieChart,
  BarChart3,
  Folders,
  Settings,
  MessageCircleMore,
  LayoutGrid,
  BarChartBig,
  Laptop,
  Presentation,
  Frame,
  Layers3,
  LibrarySquare,
  Store,
  Megaphone,
  PanelsTopLeft,
  Mails,
  TicketPercent,
  Palette,
  UsersRound,
} from "lucide-react";
import { SidebarItem } from "./types";

export const AdminSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    url: "/",
    icon: Layout,
  },
  {
    name: "User Management",
    url: "/users",
    icon: Users2,
  },
  {
    name: "Plans & Pricing",
    url: "/plans-pricing",
    icon: BetweenHorizonalEndIcon,
  },
  {
    name: "Support",
    url: "/support",
    icon: CloudLightning,
  },
  {
    name: "Features Request",
    url: "/features-request",
    icon: ListChecksIcon,
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: Share2,
  },
  {
    name: "Landing Page Builder",
    url: "/landing-page",
    icon: BookDashedIcon,
  },
  {
    name: "Lead Magnet Builder",
    url: "/lead-magnet",
    icon: Magnet,
  },
  {
    name: "Sales Page Builder",
    url: "/sales-page",
    icon: Magnet,
  },
  {
    name: "Email Marketing",
    url: "/email-marketing",
    icon: Mailbox,
  },
  {
    name: "Blogs",
    url: "/blogs",
    icon: BookCopyIcon,
  },
];

export const StudentSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    name: "Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: PieChart,
  },
  {
    name: "Online Coaching",
    url: "/online-coaching",
    icon: BarChart3,
  },
  {
    name: "Digital Files",
    url: "/digital-files",
    icon: Folders,
  },
];
export const StudentSidebarItems2: SidebarItem[] = [
  {
    name: "Messages",
    url: "/messages",
    icon: MessageCircleMore,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const TeacherSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    url: "/",
    icon: LayoutGrid,
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: BarChartBig,
  },
  {
    name: "Courses",
    url: "/courses",
    icon: Laptop,
  },
  {
    name: "Online Coaching",
    url: "/online-coaching",
    icon: Presentation,
  },
  {
    name: "Digital Files",
    url: "/digital-files",
    icon: Folders,
  },
  {
    name: "Logo Maker",
    url: "/logo-maker",
    icon: Frame,
  },
  {
    name: "Landing Page",
    url: "/landing-page",
    icon: Layers3,
  },
  {
    name: "Creative Library",
    url: "/creative-library",
    icon: LibrarySquare,
  },
  {
    name: "Marketing Strategy",
    url: "/marketing-strategy",
    icon: Store,
  },
  {
    name: "Ad Copy Library",
    url: "/ad-copy-library",
    icon: Megaphone,
  },
  {
    name: "Lead Magnet",
    url: "/lead-magnet",
    icon: Magnet,
  },
  {
    name: "Sales Page Maker",
    url: "/sales-page",
    icon: PanelsTopLeft,
  },
  {
    name: "Email Marketing",
    url: "/email-marketing",
    icon: Mails,
  },
  {
    name: "Coupons/Discounts",
    url: "/coupons-discounts",
    icon: TicketPercent,
  },
  {
    name: "Themes",
    url: "/themes",
    icon: Palette,
  },
  {
    name: "Student Management",
    url: "/student",
    icon: UsersRound,
  },
];
