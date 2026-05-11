"use client";

import { useState } from "react";
import {
  X,
  Info,
  AlertTriangle,
  BadgeCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type BannerConfig = {
  title?: string;
  message?: string;
  buttonText?: string;
  position?: "top" | "bottom";
  variant?: "info" | "success" | "warning";
  eyebrow?: string;
  onClick?: () => void;
};

export default function BannerExperience({
  config = {},
}: {
  config?: BannerConfig;
}) {
  const {
    title = "Important update",
    message = "We have something you should know.",
    buttonText,
    position = "top",
    variant = "info",
    eyebrow = "Announcement",
    onClick,
  } = config;

  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const icon =
    variant === "success" ? (
      <BadgeCheck className="h-5 w-5" />
    ) : variant === "warning" ? (
      <AlertTriangle className="h-5 w-5" />
    ) : (
      <Info className="h-5 w-5" />
    );

  const theme =
    variant === "success"
      ? {
          border: "border-emerald-200/70",
          bg: "bg-emerald-50/90",
          accent: "bg-emerald-500/10 text-emerald-700",
          title: "text-emerald-950",
        }
      : variant === "warning"
        ? {
            border: "border-amber-200/70",
            bg: "bg-amber-50/90",
            accent: "bg-amber-500/10 text-amber-700",
            title: "text-amber-950",
          }
        : {
            border: "border-[#D4A017]/20",
            bg: "bg-white/90",
            accent: "bg-[#D4A017]/10 text-[#8a6500]",
            title: "text-slate-900",
          };

  const pos = position === "top" ? "top-4" : "bottom-4";

  return (
    <div className={`fixed left-0 right-0 ${pos} z-50 px-4`}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`relative overflow-hidden rounded-[1.6rem] border shadow-[0_22px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl ${theme.border} ${theme.bg}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/55 via-white/20 to-transparent" />
          <div className="pointer-events-none absolute -left-14 top-0 h-32 w-32 rounded-full bg-[#D4A017]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm ${theme.accent}`}
              >
                {icon}
              </div>

              <div className="pt-0.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4A017]" />
                  {eyebrow}
                </div>

                <p
                  className={`mt-2 text-base font-black tracking-tight sm:text-lg ${theme.title}`}
                >
                  {title}
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:pl-4">
              {buttonText ? (
                <Button
                  type="button"
                  onClick={onClick}
                  className="group h-11 rounded-2xl bg-slate-900 px-4 font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : null}

              <button
                type="button"
                onClick={() => setVisible(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
                aria-label="Close banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
