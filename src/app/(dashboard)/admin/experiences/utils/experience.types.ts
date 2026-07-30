export type ExperienceType = "full_page" | "popup" | "banner" | "redirect";

export type TriggerType =
  | "always"
  | "timer"
  | "exit_intent"
  | "scroll"
  | "custom_event";

export type TargetScope = "global" | "routes";

export type ExperienceModuleType =
  | "form"
  | "action"
  | "automation"
  | "tracking";

export interface ExperienceModule {
  type: ExperienceModuleType;
  key: string;
  config: Record<string, any>;
}

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
  modules?: ExperienceModule[];
  payload?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceModuleFormValue {
  type: ExperienceModuleType;
  key: string;
  configText: string;
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
  modules: ExperienceModuleFormValue[];
  payload: {
    title: string;
    message: string;
    buttonText: string;
  };
}
