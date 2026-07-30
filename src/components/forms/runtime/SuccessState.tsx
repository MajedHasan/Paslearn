"use client";

import { CheckCircle2, Sparkles } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
}

export default function SuccessState({
  title = "Success",
  message = "Your submission was received.",
}: Props) {
  return (
    <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <CheckCircle2 className="h-9 w-9 animate-bounce text-emerald-600" />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        <Sparkles className="h-4 w-4" />
        Completed
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-tight text-emerald-950">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-emerald-800">
        {message}
      </p>
    </div>
  );
}
