// app/(dashboard)/marketing/coupons-discounts/_components/utils.ts

export type EffectiveStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "disabled"
  | "exhausted";

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed" | "free_shipping" | "free" | "bogo";
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  currency: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  status: string;
  appliesTo: {
    items: string[];
    mode: "all" | "selected" | "category";
    selectedIds: string[];
    categories: string[];
  };
  targetUsers: { mode: string; userIds: string[]; groupIds: string[], userEmails: string[] };
  countries: string[];
  campaign?: string;
  stackable: boolean;
  firstPurchaseOnly: boolean;
  excludeDiscountedItems: boolean;
  ownerType: "admin" | "teacher";
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Effective status is date-aware — a coupon stored as "active" but with an
 * endDate in the past is effectively "expired". Same for "exhausted" when
 * usedCount hits usageLimit.
 */
export function computeEffectiveStatus(c: Coupon): EffectiveStatus {
  if (c.status === "disabled") return "disabled";
  if (c.usedCount > 0 && c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
    return "exhausted";
  }
  const now = new Date();
  if (now < new Date(c.startDate)) return "scheduled";
  if (now > new Date(c.endDate)) return "expired";
  if (c.status === "expired") return "expired";
  return "active";
}