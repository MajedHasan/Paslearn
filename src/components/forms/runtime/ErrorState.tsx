"use client";

import { AlertTriangle, Info } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  tone?: "error" | "warning";
}

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  tone = "error",
}: Props) {
  const isWarning = tone === "warning";

  return (
    <div
      className={`rounded-[2rem] p-8 text-center shadow-sm ${
        isWarning
          ? "border border-amber-200 bg-amber-50"
          : "border border-red-200 bg-red-50"
      }`}
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ${
          isWarning ? "text-amber-600" : "text-red-600"
        }`}
      >
        {isWarning ? (
          <Info className="h-9 w-9" />
        ) : (
          <AlertTriangle className="h-9 w-9" />
        )}
      </div>

      <h3
        className={`mt-5 text-2xl font-black tracking-tight ${
          isWarning ? "text-amber-950" : "text-red-950"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mx-auto mt-3 max-w-xl text-sm leading-7 ${
          isWarning ? "text-amber-800" : "text-red-800"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
