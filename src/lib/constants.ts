// @ts-nocheck
// @ts-ignore

import React from "react";
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
  CalendarDays,
  Headphones,
  Inbox,
  Award,
  BookMarked,
  UserRound,
  Wallet,
} from "lucide-react";
import { SidebarItem } from "./types";

// ─── Admin Sidebar (grouped & unique icons) ─────────────────
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
    subItems: [
      {
        name: "All Users",
        url: "/users",
        icon: Users2,
      },
      {
        name: "Bookings",
        url: "/bookings",
        icon: CalendarDays,
      },
    ],
  },
  {
    name: "Plans & Pricing",
    url: "/plans-pricing",
    icon: BetweenHorizonalEndIcon,
  },
  {
    name: "Website",
    url: "/website",
    icon: Globe,
    subItems: [
      {
        name: "Theme Builder",
        url: "/theme-builder",
        icon: LayoutGrid,
      },
      {
        name: "Landing Page Builder",
        url: "/landing-page",
        icon: BookDashedIcon,
      },
      {
        name: "Sales Page Builder",
        url: "/sales-page",
        icon: PanelsTopLeft,
      },
      {
        name: "Form Builder",
        url: "/forms",
        icon: Blocks,
      },
      {
        name: "Form Submission",
        url: "/submissions",
        icon: Inbox,
      },
      {
        name: "Lead Magnet Builder",
        url: "/lead-magnet",
        icon: Magnet,
      },
    ],
  },
  {
    name: "Marketing",
    url: "/marketing",
    icon: Megaphone,
    subItems: [
      {
        name: "Email Marketing",
        url: "/email-marketing",
        icon: Mailbox,
      },
      {
        name: "Automation",
        url: "/automation",
        icon: CloudLightning,
      },
    ],
  },
  {
    name: "Support",
    url: "/support",
    icon: Headphones,
    subItems: [
      {
        name: "Support",
        url: "/support",
        icon: Headphones,
      },
      {
        name: "Features Request",
        url: "/features-request",
        icon: ListChecksIcon,
      },
    ],
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: Share2,
  },
  {
    name: "Blogs",
    url: "/blogs",
    icon: BookCopyIcon,
  },
];

// ─── Student Sidebar (unchanged) ──────────────────────────
export const StudentSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    name: "Learning",
    url: "/learning",
    icon: BookOpen,
    subItems: [
      {
        name: "Courses",
        url: "/courses",
        icon: BookOpen,
        status: "beta",
      },
      {
        name: "Certificates",
        url: "/certificates",
        icon: Award,
        status: "coming_soon",
        minPlan: "pro",
      },
      {
        name: "Bookmarks",
        url: "/bookmarks",
        icon: BookMarked,
        status: "coming_soon",
      },
    ],
  },
  {
    name: "Services",
    url: "/services",
    icon: Presentation,
    subItems: [
      {
        name: "Online Coaching",
        url: "/online-coaching",
        icon: Presentation,
        status: "coming_soon",
      },
      {
        name: "Digital Files",
        url: "/digital-files",
        icon: Folders,
      },
      {
        name: "Bookings",
        url: "/bookings",
        icon: CalendarDays,
        status: "coming_soon",
      },
    ],
  },
  {
    name: "Affiliate",
    url: "/affiliate",
    icon: PieChart,
  },
  {
    name: "Messages",
    url: "/messages",
    icon: MessageCircleMore,
  },
  {
    name: "Profile",
    url: "/profile",
    icon: UserRound,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    name: "Help Center",
    url: "/help-center",
    icon: Headphones,
    status: "coming_soon",
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

// ─── Teacher Sidebar (unchanged) ──────────────────────────
export const TeacherSidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    url: "/",
    icon: Home,
    minPlan: "free_trial",
  },

  {
    name: "Affiliate",
    url: "/affiliate",
    icon: Share2,
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
    name: "Online Coaching",
    url: "/online-coaching",
    icon: Presentation,
    minPlan: "free_trial",
    status: "beta",
  },
  {
    name: "Digital Files",
    url: "/digital-files",
    icon: Folders,
    minPlan: "free_trial",
    status: "beta",
  },
  {
    name: "Online Chat",
    url: "/online-chat",
    icon: MessageCircleMore,
    minPlan: "free_trial",
    status: "beta",
  },
  {
    name: "Design Studio",
    url: "/design-studio",
    icon: Palette,
    minPlan: "free_trial",
    subItems: [
      {
        name: "Logo Maker",
        url: "/design-studio/logo-maker",
        icon: Frame,
        minPlan: "free_trial",
        status: "beta",
      },
      {
        name: "Creative Library",
        url: "/design-studio/creative-library",
        icon: LibrarySquare,
        minPlan: "free_trial",
        status: "beta",
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
        minPlan: "pro",
      },
      {
        name: "Landing Pages",
        url: "/website/landing-pages",
        icon: Layout,
        minPlan: "pro",
      },
      {
        name: "Form Builder",
        url: "/website/form-builder",
        icon: Blocks,
        minPlan: "pro",
      },
      {
        name: "Experience Builder",
        url: "/website/experience-builder",
        icon: Wand2,
        minPlan: "pro",
        status: "beta",
      },
      {
        name: "Sales Page Builder",
        url: "/website/sales-page-builder",
        icon: PanelsTopLeft,
        minPlan: "pro",
        status: "coming_soon",
      },
    ],
  },
  {
    name: "Mobile App",
    url: "/mobile-app",
    icon: Laptop,
    minPlan: "business",
    status: "coming_soon",
    subItems: [
      {
        name: "App Builder",
        url: "/mobile-app/app-builder",
        icon: LayoutGrid,
        minPlan: "business",
        status: "coming_soon",
      },
      {
        name: "Push Notifications",
        url: "/mobile-app/push-notifications",
        icon: Mails,
        minPlan: "business",
        status: "coming_soon",
      },
      {
        name: "App Analytics",
        url: "/mobile-app/app-analytics",
        icon: BarChartBig,
        minPlan: "business",
        status: "coming_soon",
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
        minPlan: "business",
      },
      {
        name: "AI & Automation",
        url: "/marketing/ai-automation",
        icon: Cpu,
        minPlan: "business",
        status: "beta",
      },
      {
        name: "Coupons/Discounts",
        url: "/marketing/coupons-discounts",
        icon: TicketPercent,
        minPlan: "free_trial",
        status: "beta",
      },
      {
        name: "Marketing Strategy",
        url: "/marketing/marketing-strategy",
        icon: Store,
        minPlan: "business",
      },
      {
        name: "Ad Copy Library",
        url: "/marketing/ad-copy-library",
        icon: FileText,
        minPlan: "business",
        status: "coming_soon",
      },
      {
        name: "Lead Magnet",
        url: "/marketing/lead-magnet",
        icon: Magnet,
        minPlan: "business",
      },
      {
        name: "Ads",
        url: "/marketing/ads",
        icon: Rocket,
        minPlan: "business",
        status: "coming_soon",
      }
    ],
  },
  {
    name: "Student Management",
    url: "/student",
    icon: UsersRound,
    minPlan: "free_trial",
  },
  {
    name: "Billing & Payments",
    url: "/billing-payments",
    icon: Wallet,
    minPlan: "free_trial",
    status: "beta",
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
    minPlan: "free_trial",
  },
];