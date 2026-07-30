export interface Subscription {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  plan: {
    _id: string;
    name: string;
    slug: string;
  };
  status: "active" | "canceled" | "expired" | "trial" | "pending";
  billingCycle: "monthly" | "yearly" | "lifetime";
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}