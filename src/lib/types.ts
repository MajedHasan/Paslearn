// For Database
export type USER_ROLE = "STUDENT" | "TEACHER" | "ADMIN";

export type USER = {
  name: String;
  email: String;
  phone: String;
  role: USER_ROLE;
};

export type PERMISSIONS = "" | "";

export type PERMISSION = {
  name: String;
  type: PERMISSIONS;
};

// For Site
export interface SidebarItem {
  name: string;
  url: string;
  icon: React.ComponentType<any>; // Specify the type of icon as JSX.Element
  minPlan?: "free_trial" | "starter" | "pro" | "business";   // minimum plan required
  status?: "coming_soon" | "beta";                       // visual badge
  subItems?: SidebarItem[]; // Optional property for sub-items
}
