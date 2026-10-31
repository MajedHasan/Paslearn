// If you don't already have a client component wrapper, create one:
// src/components/affiliate-tracker.tsx
"use client";

import { useEffect } from "react";
import { captureReferralFromUrl } from "@/lib/affiliate-tracking";

export function AffiliateTracker() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return null;
}