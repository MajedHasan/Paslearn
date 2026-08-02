"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface BannerOptions {
  placement?: "top" | "bottom";
  sticky?: boolean;
  dismissible?: boolean;
  height?: string;
  animation?: "slide-down" | "fade";
}

interface Props {
  config?: {
    options?: BannerOptions;
    titleOverride?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function BannerExperience({ config, children, onClose }: Props) {
  const [visible, setVisible] = useState(true);
  const opts = config?.options || {};
  const placement = opts.placement || "top";
  const dismissible = opts.dismissible !== false;
  const animation = opts.animation || "slide-down";

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const positionClass = placement === "top" ? "top-0" : "bottom-0";

  const animationClass =
    animation === "slide-down"
      ? "animate-in slide-in-from-top duration-300"
      : "animate-in fade-in duration-300";

  return (
    <div
      className={`fixed left-0 right-0 z-50 ${positionClass} ${animationClass}`}
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_8px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {/* Subtle gradient decoration */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-50/30 via-white/10 to-transparent" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4">
            {/* Dynamic Content */}
            <div className="flex-1 w-full">
              {children}
            </div>

            {/* Close Button */}
            {dismissible && (
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
                aria-label="Close banner"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}