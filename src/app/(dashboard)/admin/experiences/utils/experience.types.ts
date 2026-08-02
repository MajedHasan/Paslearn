export type ExperienceType = "full_page" | "popup" | "banner" | "redirect";
export type TriggerType = "always" | "timer" | "exit_intent" | "scroll" | "custom_event";
export type TargetScope = "global" | "routes";
export type ExperienceContentType = "form" | "page";

export interface ExperienceContent {
  resourceType: ExperienceContentType;
  resourceId?: string;
  resourceKey?: string;
  titleOverride?: string;
}

export interface IPopupOptions {
  position?: "center" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: "small" | "medium" | "large";
  overlayOpacity?: number;
  closeButton?: boolean;
  animation?: "fade" | "slide-up" | "scale";
}

export interface IBannerOptions {
  placement?: "top" | "bottom";
  sticky?: boolean;
  dismissible?: boolean;
  height?: string;
  animation?: "slide-down" | "fade";
}

export interface IRedirectOptions {
  delayMs?: number;
  newTab?: boolean;
}

export interface IFullPageOptions {
  layout?: "centered" | "wide";
  background?: string;
}

export type ExperienceOptions = IPopupOptions | IBannerOptions | IRedirectOptions | IFullPageOptions | Record<string, any>;

export interface Experience {
  _id: string;
  key: string;
  name: string;
  type: ExperienceType;
  enabled: boolean;
  priority: number;
  target: { scope: TargetScope; routes?: string[]; excludeRoutes?: string[] };
  trigger?: { type: TriggerType; value?: number | string };
  schedule?: { startAt?: string; endAt?: string };
  content?: ExperienceContent;
  options?: ExperienceOptions;
  payload?: { title?: string; message?: string; buttonText?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceFormValues {
  key: string;
  name: string;
  type: ExperienceType;
  enabled: boolean;
  priority: number;
  target: { scope: TargetScope; routes: string[]; excludeRoutes: string[] };
  trigger: { type: TriggerType; value: string };
  schedule: { startAt: string; endAt: string };
  content: ExperienceContent | null;
  options: Record<string, any>;
  payload: { title: string; message: string; buttonText: string };
}