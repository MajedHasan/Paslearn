import { FieldDefinition, FieldType, FieldValidation, FieldOption } from "./field.types";
import { LayoutBlock } from "./layout.types";
import { ConditionalRule, FormStep, NotificationEmail, WebhookConfig, SpamProtection, AIAssistant } from "./form.interface";   // adjust path if needed

export interface FormBuilderDraft {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  fields: FieldDefinition[];
  layout: LayoutBlock[];
  steps: FormStep[];
  showProgressBar: boolean;
  conditions: ConditionalRule[];
  submitAction: {
    type: "message" | "redirect" | "message_then_redirect";
    message: string;
    redirectTo: string;
    delayMs: number;
  };
  meta: {
    submitButtonText: string;
    successTitle: string;
    successMessage: string;
    theme?: { accent?: string; radius?: string };
    customCSS?: string;
  };
  spamProtection: SpamProtection;
  notifications: NotificationEmail[];
  webhooks: WebhookConfig[];
  aiAssistant: AIAssistant;
  tags: string[];
  version: string;
  isTemplate: boolean;
}