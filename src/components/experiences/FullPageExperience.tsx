"use client";

import React from "react";

interface Props {
  config?: {
    options?: {
      layout?: "centered" | "wide";
      background?: string;
    };
    titleOverride?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
}

export default function FullPageExperience({ config, children }: Props) {
  const layout = config?.options?.layout || "centered";
  const background = config?.options?.background || "transparent";

  return (
    <div
      className="min-h-screen"
      style={{ background }}
    >
      <div
        className={
          layout === "centered"
            ? "mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"
            : "w-full px-4 py-10 sm:px-6 lg:px-8"
        }
      >
        {children}
      </div>
    </div>
  );
}