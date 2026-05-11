"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PopupConfig = {
  title?: string;
  message?: string;
  eyebrow?: string;
  buttonText?: string;
  secondaryText?: string;
  position?: "center" | "top" | "bottom";
  showClose?: boolean;
  autoCloseAfter?: number;
  accent?: "gold" | "slate" | "indigo";
  onClick?: () => void;
  onSecondaryClick?: () => void;
};

const accentMap = {
  gold: {
    glow: "bg-[#D4A017]/15",
    badge: "border-[#D4A017]/20 bg-[#D4A017]/10 text-[#8a6500]",
    button: "bg-[#D4A017] hover:bg-[#bf910f] text-white",
  },
  slate: {
    glow: "bg-slate-500/15",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    button: "bg-slate-900 hover:bg-slate-800 text-white",
  },
  indigo: {
    glow: "bg-indigo-500/15",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    button: "bg-indigo-600 hover:bg-indigo-500 text-white",
  },
};

export default function PopupExperience({
  config = {},
}: {
  config?: PopupConfig;
}) {
  const {
    title = "A better experience is ready",
    message = "We have something important to show you.",
    eyebrow = "Experience",
    buttonText = "Continue",
    secondaryText,
    position = "center",
    showClose = true,
    autoCloseAfter,
    accent = "gold",
    onClick,
    onSecondaryClick,
  } = config;

  const [open, setOpen] = useState(true);
  const a = accentMap[accent];

  useEffect(() => {
    if (!autoCloseAfter) return;
    const timer = window.setTimeout(() => setOpen(false), autoCloseAfter);
    return () => window.clearTimeout(timer);
  }, [autoCloseAfter]);

  const wrapper = useMemo(() => {
    if (position === "top") return "items-start justify-center pt-6 sm:pt-10";
    if (position === "bottom") return "items-end justify-center pb-6 sm:pb-10";
    return "items-center justify-center";
  }, [position]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex px-4 ${wrapper}`}>
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-[0_30px_120px_rgba(15,23,42,0.30)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/35 to-transparent" />
        <div
          className={`pointer-events-none absolute -left-20 top-0 h-44 w-44 rounded-full blur-3xl ${a.glow}`}
        />
        <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-start justify-between gap-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${a.badge}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </div>

              {showClose && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
                  aria-label="Close popup"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="max-w-xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                {message}
              </p>
            </div>

            {(buttonText || secondaryText) && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={() => {
                    onClick?.();
                    setOpen(false);
                  }}
                  className={`group h-12 rounded-2xl px-5 font-semibold shadow-[0_18px_40px_rgba(212,160,23,0.20)] ${a.button}`}
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>

                {secondaryText ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSecondaryClick?.();
                      setOpen(false);
                    }}
                    className="h-12 rounded-2xl border border-slate-200 bg-white/80 px-5 font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
                  >
                    {secondaryText}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center border-t border-slate-200/70 bg-slate-50/60 px-6 py-8 lg:border-l lg:border-t-0">
            <div className="w-full max-w-sm rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#f2c84b] text-white shadow-[0_16px_30px_rgba(212,160,23,0.28)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Live update
                  </p>
                  <p className="text-lg font-black tracking-tight text-slate-900">
                    Ready when you are
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Smooth, premium, and on-brand
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Designed to feel like part of the product, not an
                    interruption.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D4A017]/20 bg-[#D4A017]/8 px-4 py-3">
                  <p className="text-sm font-semibold text-[#8a6500]">
                    Easy to reuse
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Change the copy, CTA, or accent without touching the layout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
