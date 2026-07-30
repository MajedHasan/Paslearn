export type PlanFeatureType = "boolean" | "number" | "text";

export interface PlanFeature {
  _id: string;
  key: string;
  label: string;
  description?: string;
  type: PlanFeatureType;
  defaultValue: boolean | number | string;
  unit?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatureFormValues {
  key: string;
  label: string;
  description: string;
  type: PlanFeatureType;
  defaultValue: boolean | number | string;
  unit: string;
  icon: string;
  isActive: boolean;
}