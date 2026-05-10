// src/components/AppLoader.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn helper
import React from "react";

export function AppLoader1({
  title = "Loading",
  subtitle = "Please wait while we prepare your dashboard...",
  logo,
}: {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-lg border border-border bg-card/80 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-8">
          {/* Logo or default loader */}
          <div className="flex flex-col items-center gap-3">
            {logo ? (
              <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-primary/10">
                {logo}
              </div>
            ) : (
              <Loader2 className="h-14 w-14 animate-spin text-primary" />
            )}
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              {subtitle}
            </p>
          </div>

          {/* skeleton placeholders */}
          <div className="flex flex-col gap-2 w-full">
            <div className="h-3 w-3/4 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-2/3 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded-md bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AppLoader2({
  title = "Checking access",
  subtitle = "Hang tight — we're preparing your experience.",
  logo,
}: {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode; // optional logo React node (SVG / <img />)
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/60 via-slate-50/40 to-slate-100/40 backdrop-blur"
    >
      {/* subtle animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-16 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl animate-blobSlow"></div>
        <div className="absolute -bottom-16 -right-20 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl animate-blob"></div>
      </div>

      {/* glass card */}
      <div className="relative z-10 w-full max-w-sm px-6 py-8 mx-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700/40 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
              {logo ?? (
                // simple brand SVG (can be replaced)
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="white"
                    opacity="0.06"
                  />
                  <path
                    d="M6 12h12M12 6v12"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {subtitle}
              </p>
            </div>
          </div>

          {/* spinner + dots */}
          <div className="flex flex-col items-center gap-3 mt-1">
            {/* SVG ring spinner */}
            <svg
              className="w-16 h-16 animate-spin"
              viewBox="0 0 50 50"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                style={{ color: "rgba(99,102,241,0.15)" }}
              />
              <path
                className="opacity-100"
                fill="currentColor"
                d="M25 5a20 20 0 0 1 0 40 20 20 0 0 0 0-40z"
                style={{ color: "rgb(99,102,241)" }}
              />
            </svg>

            {/* bouncing dots */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounceDelay" />
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounceDelay200" />
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 animate-bounceDelay400" />
            </div>
          </div>

          {/* subtle helper text */}
          <p className="mt-2 text-xs text-center text-slate-500 dark:text-slate-300">
            This should take a moment — we verify your session and load your
            dashboard.
          </p>
        </div>
      </div>

      {/* Tailwind-only animations (using inline <style> so no extra CSS file) */}
      <style jsx>{`
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animate-blobSlow {
          animation: blob 12s infinite;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-bounceDelay {
          animation: bounce 1s infinite;
        }
        .animate-bounceDelay200 {
          animation: bounce 1s 0.15s infinite;
        }
        .animate-bounceDelay400 {
          animation: bounce 1s 0.3s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
