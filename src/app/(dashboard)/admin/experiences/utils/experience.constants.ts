export const EXPERIENCE_TYPE_OPTIONS = [
  { label: "Full Page", value: "full_page" },
  { label: "Popup", value: "popup" },
  { label: "Banner", value: "banner" },
  { label: "Redirect", value: "redirect" },
] as const;

export const TRIGGER_TYPE_OPTIONS = [
  { label: "Always", value: "always" },
  { label: "Timer", value: "timer" },
  { label: "Exit Intent", value: "exit_intent" },
  { label: "Scroll", value: "scroll" },
  { label: "Custom Event", value: "custom_event" },
] as const;

export const COMPONENT_OPTIONS = [
  { label: "Maintenance V1", value: "maintenance_v1" },
  { label: "Waitlist V1", value: "waitlist_v1" },
  { label: "Coming Soon V1", value: "coming_soon_v1" },
  { label: "Popup Offer V1", value: "popup_offer_v1" },
] as const;
