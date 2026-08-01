"use client";

import React, { useState } from "react";
import {
  Save,
  Sparkles,
  LayoutGrid,
  Layers,
  GitBranch,
  SlidersHorizontal,
  Send,
  Bell,
  Webhook,
  ShieldCheck,
  Bot,
  Eye,
  X,
  Plus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const TABS = [
  { value: "basics", label: "Basics", icon: Sparkles },
  { value: "fields", label: "Fields", icon: LayoutGrid },
  { value: "steps", label: "Steps", icon: Layers },
  { value: "conditions", label: "Conditions", icon: GitBranch },
  { value: "layout", label: "Layout", icon: SlidersHorizontal },
  { value: "submit", label: "Submit", icon: Send },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "webhooks", label: "Webhooks", icon: Webhook },
  { value: "spam", label: "Spam", icon: ShieldCheck },
  { value: "ai", label: "AI", icon: Bot },
  { value: "preview", label: "Preview", icon: Eye },
];

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

  const [tagInput, setTagInput] = useState("");
  const [showAdvancedKey, setShowAdvancedKey] = useState(false);

  const save = async () => {
    if (!draft.key || !draft.name) {
      toast.error("Key and Name are required.");
      return;
    }
    try {
      await onSave(draft);
      toast.success("Form saved!");
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !draft.tags.includes(trimmed)) {
      setDraft({ ...draft, tags: [...draft.tags, trimmed] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setDraft({ ...draft, tags: draft.tags.filter((t) => t !== tag) });
  };

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleNameChange = (newName: string) => {
    const newDraft: FormBuilderDraft = { ...draft, name: newName };
    if (!showAdvancedKey) {
      newDraft.key = generateKey(newName);
    }
    setDraft(newDraft);
  };

  return (
    <div className="space-y-0">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Form Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Design and configure every aspect of your form.
          </p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg rounded-xl gap-2"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Form
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="mb-6 flex items-center gap-1 bg-transparent p-0 border-b pb-2 overflow-x-auto flex-nowrap">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-full px-4 py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------- BASICS TAB (UPGRADED) ---------- */}
        <TabsContent value="basics">
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-8">
            {/* Form identification */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Identification
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Teacher Onboarding"
                  />
                </div>

                {/* Key – Advanced toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label>Key</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Unique identifier for this form. Auto‑generated from name.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setShowAdvancedKey(!showAdvancedKey)}
                    >
                      {showAdvancedKey ? "Auto" : "Advanced"}
                    </Button>
                  </div>
                  {showAdvancedKey ? (
                    <Input
                      value={draft.key}
                      onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                      placeholder="teacher_onboarding"
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl border bg-slate-50 text-sm text-slate-500 font-mono">
                      {draft.key || "auto‑generated"}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Short description of the form"
                  rows={3}
                />
              </div>
            </div>

            {/* Form settings */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <LayoutGrid className="h-4 w-4 text-amber-500" />
                Settings
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                  <div>
                    <Label htmlFor="enabled" className="font-medium text-sm">Enabled</Label>
                    <p className="text-xs text-muted-foreground">Form is visible to users</p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={draft.enabled}
                    onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                  <div>
                    <Label htmlFor="isTemplate" className="font-medium text-sm">Is Template</Label>
                    <p className="text-xs text-muted-foreground">Can be cloned by others</p>
                  </div>
                  <Switch
                    id="isTemplate"
                    checked={draft.isTemplate}
                    onCheckedChange={(checked) => setDraft({ ...draft, isTemplate: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                  <div>
                    <Label htmlFor="version" className="font-medium text-sm">Version</Label>
                    <p className="text-xs text-muted-foreground">Semantic version</p>
                  </div>
                  <Input
                    id="version"
                    value={draft.version}
                    onChange={(e) => setDraft({ ...draft, version: e.target.value })}
                    className="w-24 h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-4">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Tags
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                    className="text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.tags.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">
                      No tags yet.
                    </span>
                  )}
                  {draft.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs unchanged */}
        <TabsContent value="fields">
          <FieldsManager
            fields={draft.fields}
            onChange={(fields) => setDraft({ ...draft, fields })}
            onUpdateLayout={(layout) => setDraft({ ...draft, layout })}
          />
        </TabsContent>
        <TabsContent value="steps">
          <MultiStepBuilder
            steps={draft.steps}
            fields={draft.fields}
            showProgressBar={draft.showProgressBar}
            onChange={(steps) => setDraft({ ...draft, steps })}
            onToggleProgressBar={(checked) => setDraft({ ...draft, showProgressBar: checked })}
          />
        </TabsContent>
        <TabsContent value="conditions">
          <ConditionsBuilder
            conditions={draft.conditions}
            fields={draft.fields}
            onChange={(conditions) => setDraft({ ...draft, conditions })}
          />
        </TabsContent>
        <TabsContent value="layout">
          <LayoutPanel
            layout={draft.layout}
            fields={draft.fields}
            onChange={(layout) => setDraft({ ...draft, layout })}
          />
        </TabsContent>
        <TabsContent value="submit">
          <SubmitBehaviorPanel
            submitAction={draft.submitAction}
            meta={draft.meta}
            onChange={(action, meta) =>
              setDraft({ ...draft, submitAction: action, meta: { ...draft.meta, ...meta } })
            }
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsPanel
            notifications={draft.notifications}
            fields={draft.fields}
            onChange={(notifications) => setDraft({ ...draft, notifications })}
          />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksPanel
            webhooks={draft.webhooks}
            onChange={(webhooks) => setDraft({ ...draft, webhooks })}
          />
        </TabsContent>
        <TabsContent value="spam">
          <SpamProtectionPanel
            config={draft.spamProtection}
            onChange={(config) => setDraft({ ...draft, spamProtection: config })}
          />
        </TabsContent>
        <TabsContent value="ai">
          <AIAssistantPanel
            config={draft.aiAssistant}
            onChange={(config) => setDraft({ ...draft, aiAssistant: config })}
          />
        </TabsContent>
        <TabsContent value="preview">
          <FormPreview draft={draft} />
        </TabsContent>
      </Tabs>
    </div>
  );
}