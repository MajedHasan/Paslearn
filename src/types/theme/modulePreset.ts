export type ModuleType = "form" | "automation" | "tracking" | "other";

export interface ModulePreset {
  _id: string;
  type: ModuleType;
  key: string;
  label: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ModulePresetFormValues {
  type: ModuleType;
  key: string;
  label: string;
  config: string; // JSON string for the form
}