export type PageType = "home" | "landing" | "sales" | "lead_magnet" | "thank_you" | "funnel_step" | "course" | "custom";

export interface PageTemplate {
  _id: string;
  name: string;
  type: PageType;
  content: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageTemplateFormValues {
  name: string;
  type: PageType;
  content: string; // we'll store the JSON as a string in the form, then parse on submit
  isDefault: boolean;
}