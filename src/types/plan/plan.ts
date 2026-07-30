export interface PlanFeature {
  key: string;
  label: string;
  type: "boolean" | "number" | "text";
  value: boolean | number | string;
  tooltip?: string;
  icon?: string;
}

export interface PlanPrice {
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "lifetime";
}

export interface PlanLimits {
  maxCourses: number;
  maxStudents: number;
  maxTemplates: number;
  maxLandingPages: number;
  maxForms: number;
  maxAutomations: number;
  maxSalesPages: number;
  maxFunnels: number;
  maxEmailCampaigns: number;
  maxDigitalProducts: number;
  maxCoachingClients: number;
  maxCourseEnrollments: number;
  certificateEnabled: boolean;
  jobBoardAccess: boolean;
  aiCredits?: number;
}

export type PlanAudience = "teacher" | "student" | "affiliate" | "all";

export interface Plan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  badge?: string;
  ctaText?: string;
  ctaUrl?: string;
  price: PlanPrice;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: PlanFeature[];
  limits: PlanLimits;
  applicableTo: PlanAudience[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormValues {
  name: string;
  slug: string;
  description: string;
  icon: string;
  badge: string;
  ctaText: string;
  ctaUrl: string;
  price: PlanPrice;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: PlanFeature[];
  limits: PlanLimits;
  applicableTo: PlanAudience[];
}