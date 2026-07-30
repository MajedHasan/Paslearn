"use client";

import React, { useState, useMemo } from "react";
import { Plus, Trash2, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FormBuilderDraft } from "@/types/forms/shared/builder.types";
import FieldsManager from "./FieldsManager";
import MultiStepBuilder from "./MultiStepBuilder";
import ConditionsBuilder from "./ConditionsBuilder";
import NotificationsPanel from "./NotificationsPanel";
import WebhooksPanel from "./WebhooksPanel";
import SpamProtectionPanel from "./SpamProtectionPanel";
import AIAssistantPanel from "./AIAssistantPanel";
import SubmitBehaviorPanel from "./SubmitBehaviorPanel";
import LayoutPanel from "./LayoutPanel";
import FormPreview from "./FormPreview";

const emptyDraft: FormBuilderDraft = {
  key: "",
  name: "",
  description: "",
  enabled: false,
  fields: [],
  layout: [],
  steps: [],
  showProgressBar: true,
  conditions: [],
  submitAction: {
    type: "message",
    message: "Submitted successfully.",
    redirectTo: "",
    delayMs: 0,
  },
  meta: {
    submitButtonText: "Submit",
    successTitle: "Success",
    successMessage: "Your submission was received.",
  },
  spamProtection: { enabled: false, type: "honeypot" },
  notifications: [],
  webhooks: [],
  aiAssistant: { enabled: false },
  tags: [],
  version: "1.0.0",
  isTemplate: false,
};

interface Props {
  initialValue?: Partial<FormBuilderDraft>;
  onSave: (payload: FormBuilderDraft) => Promise<void>;
  saving?: boolean;
}

export default function FormBuilder({ initialValue, onSave, saving }: Props) {
  const [draft, setDraft] = useState<FormBuilderDraft>(() => ({
    ...emptyDraft,
    ...initialValue,
    fields: initialValue?.fields ?? [],
    layout: initialValue?.layout ?? [],
    steps: initialValue?.steps ?? [],
    conditions: initialValue?.conditions ?? [],
    notifications: initialValue?.notifications ?? [],
    webhooks: initialValue?.webhooks ?? [],
    submitAction: { ...emptyDraft.submitAction, ...(initialValue?.submitAction ?? {}) },
    meta: { ...emptyDraft.meta, ...(initialValue?.meta ?? {}) },
    spamProtection: { ...emptyDraft.spamProtection, ...(initialValue?.spamProtection ?? {}) },
    aiAssistant: { ...emptyDraft.aiAssistant, ...(initialValue?.aiAssistant ?? {}) },
    tags: initialValue?.tags ?? [],
    version: initialValue?.version ?? "1.0.0",
    isTemplate: initialValue?.isTemplate ?? false,
    showProgressBar: initialValue?.showProgressBar ?? true,
  }));

  const save = async () => {
    if (!draft.key || !draft.name) {
      toast.error("Key and Name are required.");
      return;
    }
    await onSave(draft);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
          <p className="text-sm text-muted-foreground">Design enterprise forms with full power.</p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg"
        >
          {saving ? "Saving..." : "Save Form"}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2 bg-transparent p-0">
          {[
            { value: "basics", label: "Basics", icon: Sparkles },
            { value: "fields", label: "Fields" },
            { value: "steps", label: "Steps" },
            { value: "conditions", label: "Conditions" },
            { value: "submit", label: "Submit" },
            { value: "notifications", label: "Notifications" },
            { value: "webhooks", label: "Webhooks" },
            { value: "spam", label: "Spam" },
            { value: "ai", label: "AI" },
            { value: "layout", label: "Layout" },
            { value: "preview", label: "Preview" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Basic Information
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Key *</Label>
                <Input
                  value={draft.key}
                  onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                  placeholder="teacher_onboarding"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Teacher Onboarding"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Short description of the form"
                />
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  id="enabled"
                  checked={draft.enabled}
                  onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked })}
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  id="isTemplate"
                  checked={draft.isTemplate}
                  onCheckedChange={(checked) => setDraft({ ...draft, isTemplate: checked })}
                />
                <Label htmlFor="isTemplate">Is Template</Label>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={draft.version}
                  onChange={(e) => setDraft({ ...draft, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={draft.tags.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="onboarding, teacher"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Fields Tab */}
        <TabsContent value="fields">
          <FieldsManager
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
            onUpdateLayout={(layout) => setDraft({ ...draft, layout })}
          />
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <MultiStepBuilder
            steps={draft.steps}
            fields={draft.fields}
            showProgressBar={draft.showProgressBar}
            onChange={(steps) => setDraft({ ...draft, steps })}
            onToggleProgressBar={(checked) => setDraft({ ...draft, showProgressBar: checked })}
          />
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions">
          <ConditionsBuilder
            conditions={draft.conditions}
            fields={draft.fields}
            onChange={(conditions) => setDraft({ ...draft, conditions })}
          />
        </TabsContent>

        {/* Submit Behavior */}
        <TabsContent value="submit">
          <SubmitBehaviorPanel
            submitAction={draft.submitAction}
            meta={draft.meta}
            onChange={(action, meta) =>
              setDraft({ ...draft, submitAction: action, meta: { ...draft.meta, ...meta } })
            }
          />
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <NotificationsPanel
            notifications={draft.notifications}
            onChange={(notifications) => setDraft({ ...draft, notifications })}
          />
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks">
          <WebhooksPanel
            webhooks={draft.webhooks}
            onChange={(webhooks) => setDraft({ ...draft, webhooks })}
          />
        </TabsContent>

        {/* Spam Protection */}
        <TabsContent value="spam">
          <SpamProtectionPanel
            config={draft.spamProtection}
            onChange={(config) => setDraft({ ...draft, spamProtection: config })}
          />
        </TabsContent>

        {/* AI Assistant */}
        <TabsContent value="ai">
          <AIAssistantPanel
            config={draft.aiAssistant}
            onChange={(config) => setDraft({ ...draft, aiAssistant: config })}
          />
        </TabsContent>

        {/* Layout */}
        <TabsContent value="layout">
          <LayoutPanel
            layout={draft.layout}
            fields={draft.fields}
            onChange={(layout) => setDraft({ ...draft, layout })}
          />
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <FormPreview draft={draft} />
        </TabsContent>
      </Tabs>
    </div>
  );
}