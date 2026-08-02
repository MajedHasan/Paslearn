export const EXPERIENCE_TYPE_OPTIONS = [
  { label: "Full Page", value: "full_page", icon: "📄" },
  { label: "Popup", value: "popup", icon: "🪟" },
  { label: "Banner", value: "banner", icon: "📢" },
  { label: "Redirect", value: "redirect", icon: "🔀" },
] as const;

export const TRIGGER_TYPE_OPTIONS = [
  { label: "Always", value: "always", icon: "⚡" },
  { label: "Timer", value: "timer", icon: "⏱️" },
  { label: "Exit Intent", value: "exit_intent", icon: "🚪" },
  { label: "Scroll", value: "scroll", icon: "📜" },
  { label: "Custom Event", value: "custom_event", icon: "🎯" },
] as const;

export const CONTENT_RESOURCE_TYPES = [
  { label: "Form", value: "form", icon: "📝" },
  { label: "Page", value: "page", icon: "📃" },
] as const;