export type AutomationResource =
  | "form" | "course" | "booking" | "user" | "subscription" | "payment" | "certificate";

export type AutomationEvent =
  | "submitted" | "created" | "updated" | "approved" | "rejected"
  | "completed" | "cancelled" | "registered" | "paid";

export type AutomationActionType =
  | "send_email" | "send_sms" | "add_tag" | "assign_role"
  | "send_webhook" | "update_submission_status" | "ai_generate" | "wait";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty" | "regex";
  value?: any;
}

export interface AutomationConditionGroup {
  logicalOperator?: "AND" | "OR";
  conditions: AutomationCondition[];
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, any>;
}

export interface AutomationStep {
  id: string;
  label?: string;
  delayMs: number;
  conditionGroups?: AutomationConditionGroup[];
  actions: AutomationAction[];
  retryOnFailure?: boolean;
}

export interface AutomationTrigger {
  resource: AutomationResource;
  event: AutomationEvent;
  filters?: Record<string, any>;
}

export interface IAutomation {
  _id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  steps: AutomationStep[];
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}