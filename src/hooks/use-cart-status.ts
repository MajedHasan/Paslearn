"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

export function useCartStatus(productId: string | null | undefined) {
  const pathname = usePathname();
  const [inCart, setInCart] = useState(false);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    if (!productId) {
      setInCart(false);
      return;
    }
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      setInCart(false);
      return;
    }

    setChecking(true);
    try {
      const r = await api.get("/cart", {
        // ⭐ Cache-buster — forces a fresh fetch every time
        params: { _t: Date.now() },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });
      const items = r.data.data?.items || [];
      const found = items.some(
        (i: any) =>
          String(i.product?._id || i.product) === String(productId)
      );
      setInCart(found);
    } catch {
      // Don't reset on failure — keep last known state
    } finally {
      setChecking(false);
    }
  }, [productId]);

  // ⭐ Runs on every pathname change AND on mount
  useEffect(() => {
    check();
  }, [check, pathname]);

  // Extra listeners
  useEffect(() => {
    const onUpdate = () => check();
    const onFocus = () => check();
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    window.addEventListener("cart:updated", onUpdate);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("cart:updated", onUpdate);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [check]);

  return { inCart, setInCart, checking, refetch: check };
}