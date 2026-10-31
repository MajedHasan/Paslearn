"use client";

const STORAGE_KEY = "paslearn_ref";
const COOKIE_DAYS = 30;

/**
 * Called on every page load. Captures ?ref=CODE from URL
 * and persists it for 30 days.
 */
export function captureReferralFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref") || params.get("affiliate");
    if (!code) return;

    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 6 || cleaned.length > 20) return;

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, cleaned);

    // Also set cookie for server-side reads (30 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_DAYS);
    document.cookie = `${STORAGE_KEY}=${cleaned}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Optionally remove ?ref from URL for a cleaner experience
    params.delete("ref");
    params.delete("affiliate");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname + (newSearch ? `?${newSearch}` : "");
    window.history.replaceState({}, "", newUrl);
  } catch {
    /* silent */
  }
}

/**
 * Read the stored referral code (for checkout).
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Clear it after successful checkout (one order per attribution).
 */
export function clearReferralCode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  } catch {}
}