"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface PopupOptions {
  position?:
    | "center"
    | "top"
    | "bottom"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  size?: "small" | "medium" | "large";
  overlayOpacity?: number;
  closeButton?: boolean;
  animation?: "fade" | "slide-up" | "scale";
}

interface Props {
  config?: {
    options?: PopupOptions;
    titleOverride?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function PopupExperience({ config, children, onClose }: Props) {
  const [open, setOpen] = useState(true);
  const opts = config?.options || {};
  const position = opts.position || "center";
  const size = opts.size || "medium";
  const showClose = opts.closeButton !== false;
  const overlayOpacity = opts.overlayOpacity ?? 0.6;
  const animation = opts.animation || "fade";

  const sizeClasses: Record<string, string> = {
    small: "max-w-sm",
    medium: "max-w-2xl",
    large: "max-w-4xl",
  };

  const positionClasses: Record<string, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-6 sm:pt-10",
    bottom: "items-end justify-center pb-6 sm:pb-10",
    "top-left": "items-start justify-start p-6",
    "top-right": "items-start justify-end p-6",
    "bottom-left": "items-end justify-start p-6",
    "bottom-right": "items-end justify-end p-6",
  };

  const animationClasses: Record<string, string> = {
    fade: "animate-in fade-in duration-300",
    "slide-up": "animate-in slide-in-from-bottom-4 duration-300",
    scale: "animate-in zoom-in-95 duration-300",
  };

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex px-4 ${positionClasses[position] || positionClasses.center}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        onClick={handleClose}
      />

      {/* Popup Content */}
      <div
        className={`relative w-full ${sizeClasses[size] || sizeClasses.medium} ${animationClasses[animation] || animationClasses.fade} rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.30)] overflow-hidden`}
      >
        {/* Close Button */}
        {showClose && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dynamic Content – forms, pages, anything */}
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}