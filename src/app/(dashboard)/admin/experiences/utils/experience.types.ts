export type ExperienceType = "full_page" | "popup" | "banner" | "redirect";

export type TriggerType =
  | "always"
  | "timer"
  | "exit_intent"
  | "scroll"
  | "custom_event";

export type TargetScope = "global" | "routes";

export interface Experience {
  _id: string;
  key: string;
  name: string;
  type: ExperienceType;
  componentKey: string;
  enabled: boolean;
  priority: number;
  target: {
    scope: TargetScope;
    routes?: string[];
    excludeRoutes?: string[];
  };
  trigger?: {
    type: TriggerType;
    value?: number | string;
  };
  schedule?: {
    startAt?: string;
    endAt?: string;
  };
  payload?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceFormValues {
  key: string;
  name: string;
  type: ExperienceType;
  componentKey: string;
  enabled: boolean;
  priority: number;
  target: {
    scope: TargetScope;
    routes: string[];
    excludeRoutes: string[];
  };
  trigger: {
    type: TriggerType;
    value: string;
  };
  schedule: {
    startAt: string;
    endAt: string;
  };
  payload: {
    title: string;
    message: string;
    buttonText: string;
  };
}
