"use client";

import {
  Loader2,
  WifiOff,
  ShieldAlert,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Variant = "loading" | "offline" | "backend" | "blocked";

interface Props {
  variant: Variant;
  onRetry?: () => void;
}

const content = {
  loading: {
    icon: Loader2,
    badge: "Connecting",
    title: "Preparing your experience",
    description:
      "We’re securely syncing your workspace and loading the latest platform state.",
  },

  offline: {
    icon: WifiOff,
    badge: "Connection issue",
    title: "Your network seems unstable",
    description:
      "We couldn’t establish a secure connection. Please check your internet and try again.",
  },

  backend: {
    icon: ShieldAlert,
    badge: "System unavailable",
    title: "Platform temporarily unavailable",
    description:
      "Our systems are responding unexpectedly. Access remains protected until verification completes.",
  },

  blocked: {
    icon: ShieldAlert,
    badge: "Protected mode",
    title: "Access verification required",
    description:
      "We are validating your access environment before entering the platform.",
  },
};

export default function SystemExperience({ variant, onRetry }: Props) {
  const state = content[variant];
  const Icon = state.icon;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-[#D4A017]/10 blur-3xl" />
      <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4A017]/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 sm:p-14 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              {state.badge}
            </div>

            {/* Icon */}
            <div className="mt-8 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Icon
                  className={`h-10 w-10 text-[#D4A017] ${
                    variant === "loading" ? "animate-spin" : "animate-pulse"
                  }`}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mt-8 text-center">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
                {state.title}
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg leading-8 text-slate-600">
                {state.description}
              </p>
            </div>

            {/* Action */}
            {variant !== "loading" && onRetry && (
              <div className="mt-10 flex justify-center">
                <Button
                  onClick={onRetry}
                  className="group h-14 rounded-2xl bg-[#D4A017] px-8 font-bold text-white shadow-[0_18px_40px_rgba(212,160,23,0.28)] hover:bg-[#bf910f]"
                >
                  <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
                  Retry Connection
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
