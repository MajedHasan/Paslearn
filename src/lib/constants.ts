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
  Blocks,
  Cpu,
  GraduationCap,
  Rocket,
  Palette as PaletteIcon,
  Globe,
  Mail,
  Wand2,
  FileText,
  PenTool,
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
    name: "Theme Builder",
    url: "/theme-builder",
    icon: LayoutGrid,
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
    name: "Form Builder",
    url: "/forms",
    icon: Blocks,
  },
  {
    name: "Form Submission",
    url: "/submissions",
    icon: Blocks,
  },
  {
    name: "Automation",
    url: "/automation",
    icon: CloudLightning,
  },
  {
    name: "Booking Management",
    url: "/bookings",
    icon: Users2,
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
    icon: Home,
    minPlan: "free_trial",
  },
  {
    name: "Courses",
    url: "/courses",
    icon: BookOpen,
    minPlan: "free_trial",
    status: "beta",
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: Share2,
    minPlan: "free_trial",
  },
  {
    name: "Online Coaching",
    url: "/online-coaching",
    icon: Presentation,
    minPlan: "free_trial",
    status: "coming_soon",
  },
  {
    name: "Digital Files",
    url: "/digital-files",
    icon: Folders,
    minPlan: "starter",
  },
  {
    name: "Design Studio",
    url: "/design-studio",
    icon: Palette,
    minPlan: "pro",
    subItems: [
      {
        name: "Logo Maker",
        url: "/design-studio/logo-maker",
        icon: Frame,
        minPlan: "pro",
        status: "beta",
      },
      {
        name: "Creative Library",
        url: "/design-studio/creative-library",
        icon: LibrarySquare,
        minPlan: "pro",
      },
    ],
  },
  {
    name: "Website",
    url: "/website",
    icon: Globe,
    minPlan: "pro",
    subItems: [
      {
        name: "Themes", 
        url: "/website/themes", 
        icon: PaletteIcon, 
        minPlan: "pro"
      },
      {
        name: "Landing Pages", 
        url: "/website/landing-pages", 
        icon: Layout, 
        minPlan: "pro"
      },
      {
        name: "Form Builder", 
        url: "/website/form-builder", 
        icon: Blocks, 
        minPlan: "pro"
      },
      {
        name: "Experience Builder", 
        url: "/website/experience-builder", 
        icon: Wand2, 
        minPlan: "pro",
        status: "beta"
      },
      {
        name: "Sales Page Builder", 
        url: "/website/sales-page-builder", 
        icon: PanelsTopLeft, 
        minPlan: "pro",
        status: "coming_soon"
      },
    ],
  },
  {
    name: "Marketing",
    url: "/marketing",
    icon: Megaphone,
    minPlan: "business",
    subItems: [
      {
        name: "Email Marketing",
        url: "/marketing/email-marketing",
        icon: Mail,
        minPlan: "business"
      },
      {
        name: "AI & Automation", 
        url: "/marketing/ai-automation", 
        icon: Cpu, 
        minPlan: "business",
        status: "beta"
      },
      {
        name: "Coupons/Discounts", 
        url: "/marketing/coupons-discounts", 
        icon: TicketPercent, 
        minPlan: "business"
      },
      {
        name: "Marketing Strategy", 
        url: "/marketing/marketing-strategy", 
        icon: Store, 
        minPlan: "business"
      },
      {
        name: "Ad Copy Library", 
        url: "/marketing/ad-copy-library", 
        icon: FileText, 
        minPlan: "business",
        status: "coming_soon"
      },
      {
        name: "Lead Magnet", 
        url: "/marketing/lead-magnet", 
        icon: Magnet, 
        minPlan: "business"
      },
    ],
  },
  {
    name: "Student Management",
    url: "/student",
    icon: UsersRound,
    minPlan: "free",
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
    minPlan: "free",
  },
];