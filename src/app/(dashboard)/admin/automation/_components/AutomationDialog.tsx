"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Zap, GitBranch, Clock, Play,
  Settings, BrainCircuit, Mail, Phone, Tag, User, Link, FileText, GripVertical,
} from "lucide-react";
import {
  IAutomation, AutomationResource, AutomationEvent, AutomationActionType,
  AutomationStep, AutomationAction, AutomationConditionGroup,
} from "@/types/forms/automation/automation";
import { toast } from "sonner";

// ---------- Helpers ----------
function createStepId() {
  return `step_${Math.random().toString(36).slice(2, 10)}`;
}

const RESOURCES: { value: AutomationResource; label: string }[] = [
  { value: "form", label: "Form" },
  { value: "course", label: "Course" },
  { value: "booking", label: "Booking" },
  { value: "user", label: "User" },
  { value: "subscription", label: "Subscription" },
  { value: "payment", label: "Payment" },
  { value: "certificate", label: "Certificate" },
];

const EVENTS: { value: AutomationEvent; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "registered", label: "Registered" },
  { value: "paid", label: "Paid" },
];

const ACTION_TYPES: {
  value: AutomationActionType;
  label: string;
  icon: React.ReactNode;
  defaultConfig: Record<string, any>;
}[] = [
  { value: "send_email", label: "Send Email", icon: <Mail className="h-4 w-4" />, defaultConfig: { to: "", subject: "", body: "" } },
  { value: "send_sms", label: "Send SMS", icon: <Phone className="h-4 w-4" />, defaultConfig: { to: "", message: "" } },
  { value: "add_tag", label: "Add Tag", icon: <Tag className="h-4 w-4" />, defaultConfig: { tag: "" } },
  { value: "assign_role", label: "Assign Role", icon: <User className="h-4 w-4" />, defaultConfig: { role: "" } },
  { value: "send_webhook", label: "Webhook", icon: <Link className="h-4 w-4" />, defaultConfig: { url: "", method: "POST", bodyTemplate: {} } },
  { value: "update_submission_status", label: "Update Submission", icon: <FileText className="h-4 w-4" />, defaultConfig: { status: "new" } },
  { value: "ai_generate", label: "AI Generate", icon: <BrainCircuit className="h-4 w-4" />, defaultConfig: { model: "gpt-4o-mini", prompt: "", outputField: "" } },
  { value: "wait", label: "Wait", icon: <Clock className="h-4 w-4" />, defaultConfig: {} },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: IAutomation | null;
  onSave: (payload: any) => Promise<void>;
  saving: boolean;
}

export default function AutomationDialog({ open, onOpenChange, automation, onSave, saving }: Props) {
  const [form, setForm] = useState<{
    name: string;
    description: string;
    enabled: boolean;
    trigger: { resource: AutomationResource; event: AutomationEvent; filters: Record<string, any> };
    steps: AutomationStep[];
  }>({
    name: "",
    description: "",
    enabled: true,
    trigger: { resource: "form", event: "submitted", filters: {} },
    steps: [],
  });
  const isEdit = !!automation;

  useEffect(() => {
    if (open) {
      if (automation) {
        setForm({
          name: automation.name,
          description: automation.description || "",
          enabled: automation.enabled,
          // trigger: automation.trigger,
          trigger: {
            resource: automation.trigger.resource,
            event: automation.trigger.event,
            filters: automation.trigger.filters ?? {},   // ✅ ensure non‑undefined
          },
          steps: automation.steps || [],
        });
      } else {
        setForm({
          name: "",
          description: "",
          enabled: true,
          trigger: { resource: "form", event: "submitted", filters: {} },
          steps: [],
        });
      }
    }
  }, [open, automation]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.trigger.resource || !form.trigger.event) { toast.error("Trigger is required"); return; }
    // Ensure each step has a unique id
    for (const step of form.steps) {
      if (!step.id) {
        toast.error("Each step must have an id");
        return;
      }
    }
    await onSave(form);
  };

  // ── Step handlers ──
  const addStep = () => {
    const newStep: AutomationStep = {
      id: createStepId(),
      label: `Step ${form.steps.length + 1}`,
      delayMs: 0,
      conditionGroups: [],
      actions: [],
      retryOnFailure: false,
    };
    setForm({ ...form, steps: [...form.steps, newStep] });
  };

  const updateStep = (stepId: string, patch: Partial<AutomationStep>) => {
    setForm({
      ...form,
      steps: form.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    });
  };

  const removeStep = (stepId: string) => {
    setForm({ ...form, steps: form.steps.filter((s) => s.id !== stepId) });
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const idx = form.steps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= form.steps.length) return;
    const steps = [...form.steps];
    [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
    setForm({ ...form, steps });
  };

  // ── Action helpers ──
  const addAction = (stepId: string) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? { ...s, actions: [...s.actions, { type: "send_email" as AutomationActionType, config: { to: "", subject: "", body: "" } }] }
          : s
      ),
    });
  };

  const updateAction = (stepId: string, actionIdx: number, patch: Partial<AutomationAction>) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              actions: s.actions.map((a, i) => (i === actionIdx ? { ...a, ...patch } : a)),
            }
          : s
      ),
    });
  };

  const removeAction = (stepId: string, actionIdx: number) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? { ...s, actions: s.actions.filter((_, i) => i !== actionIdx) }
          : s
      ),
    });
  };

  const changeActionType = (stepId: string, actionIdx: number, newType: AutomationActionType) => {
    const defaultConfig = ACTION_TYPES.find((a) => a.value === newType)?.defaultConfig || {};
    updateAction(stepId, actionIdx, { type: newType, config: defaultConfig });
  };

  // ── Condition helpers ──
  const addConditionGroup = (stepId: string) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              conditionGroups: [
                ...(s.conditionGroups || []),
                { logicalOperator: "AND" as const, conditions: [{ field: "", operator: "equals" as const, value: "" }] },
              ],
            }
          : s
      ),
    });
  };

  const updateConditionGroup = (stepId: string, groupIdx: number, patch: Partial<AutomationConditionGroup>) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              conditionGroups: s.conditionGroups?.map((g, i) => (i === groupIdx ? { ...g, ...patch } : g)),
            }
          : s
      ),
    });
  };

  const removeConditionGroup = (stepId: string, groupIdx: number) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? { ...s, conditionGroups: s.conditionGroups?.filter((_, i) => i !== groupIdx) }
          : s
      ),
    });
  };

  const addCondition = (stepId: string, groupIdx: number) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              conditionGroups: s.conditionGroups?.map((g, i) =>
                i === groupIdx
                  ? { ...g, conditions: [...g.conditions, { field: "", operator: "equals" as const, value: "" }] }
                  : g
              ),
            }
          : s
      ),
    });
  };

  const updateCondition = (stepId: string, groupIdx: number, condIdx: number, patch: Partial<AutomationConditionGroup["conditions"][0]>) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              conditionGroups: s.conditionGroups?.map((g, i) =>
                i === groupIdx
                  ? { ...g, conditions: g.conditions.map((c, j) => (j === condIdx ? { ...c, ...patch } : c)) }
                  : g
              ),
            }
          : s
      ),
    });
  };

  const removeCondition = (stepId: string, groupIdx: number, condIdx: number) => {
    setForm({
      ...form,
      steps: form.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              conditionGroups: s.conditionGroups?.map((g, i) =>
                i === groupIdx
                  ? { ...g, conditions: g.conditions.filter((_, j) => j !== condIdx) }
                  : g
              ),
            }
          : s
      ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            {isEdit ? "Edit Automation" : "Create Automation"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="trigger" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="trigger">Trigger</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Trigger Tab */}
          <TabsContent value="trigger" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Resource</Label>
                <Select
                  value={form.trigger.resource}
                  onValueChange={(v) =>
                    setForm({ ...form, trigger: { ...form.trigger, resource: v as AutomationResource } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Event</Label>
                <Select
                  value={form.trigger.event}
                  onValueChange={(v) =>
                    setForm({ ...form, trigger: { ...form.trigger, event: v as AutomationEvent } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENTS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filters (JSON) – optional</Label>
              <Textarea
                value={JSON.stringify(form.trigger.filters || {}, null, 2)}
                onChange={(e) => {
                  try {
                    setForm({
                      ...form,
                      trigger: { ...form.trigger, filters: JSON.parse(e.target.value) },
                    });
                  } catch {}
                }}
                className="font-mono text-xs min-h-20"
                placeholder='{"formKey": "teacher_onboarding"}'
              />
            </div>
          </TabsContent>

          {/* Workflow Tab – The Board */}
          <TabsContent value="workflow" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                Workflow Steps
              </h3>
              <Button onClick={addStep} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Step
              </Button>
            </div>

            {form.steps.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No steps yet</p>
                <p className="text-sm">Add steps to define the workflow sequence.</p>
              </div>
            )}

            <div className="relative pl-6 border-l-2 border-purple-200 space-y-6">
              {form.steps.map((step, idx) => (
                <div key={step.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-[19px] top-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow-sm" />

                  <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    {/* Step header */}
                    <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-t-2xl border-b">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <Badge variant="outline" className="text-xs font-mono">
                          Step {idx + 1}
                        </Badge>
                        <Input
                          value={step.label || ""}
                          onChange={(e) => updateStep(step.id, { label: e.target.value })}
                          className="h-8 text-sm font-semibold border-transparent bg-transparent focus:bg-white w-40"
                          placeholder="Step label"
                        />
                        <Badge variant="secondary" className="text-xs">
                          {step.actions.length} action{step.actions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveStep(step.id, "up")}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveStep(step.id, "down")}
                          disabled={idx === form.steps.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Step body */}
                    <div className="p-4 space-y-4">
                      {/* Delay */}
                      <div className="flex items-center gap-4">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Delay
                        </Label>
                        <Input
                          type="number"
                          value={step.delayMs}
                          onChange={(e) => updateStep(step.id, { delayMs: Number(e.target.value) || 0 })}
                          className="w-32 h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">ms (0 = immediate)</span>
                      </div>

                      {/* Retry */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={step.retryOnFailure || false}
                          onCheckedChange={(c) => updateStep(step.id, { retryOnFailure: c })}
                        />
                        <Label>Retry on failure (continue to next step)</Label>
                      </div>

                      {/* Condition groups */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Conditions</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addConditionGroup(step.id)}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Group
                          </Button>
                        </div>
                        {(step.conditionGroups || []).map((group, gIdx) => (
                          <div key={gIdx} className="border rounded-xl p-3 bg-slate-50 space-y-2">
                            <div className="flex items-center justify-between">
                              <Select
                                value={group.logicalOperator || "AND"}
                                onValueChange={(v) =>
                                  updateConditionGroup(step.id, gIdx, {
                                    logicalOperator: v as "AND" | "OR",
                                  })
                                }
                              >
                                <SelectTrigger className="w-20 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeConditionGroup(step.id, gIdx)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            {group.conditions.map((cond, cIdx) => (
                              <div key={cIdx} className="flex gap-2 items-center">
                                <Input
                                  value={cond.field}
                                  onChange={(e) =>
                                    updateCondition(step.id, gIdx, cIdx, { field: e.target.value })
                                  }
                                  placeholder="Field path"
                                  className="h-8 text-sm flex-1"
                                />
                                <Select
                                  value={cond.operator}
                                  onValueChange={(v) =>
                                    updateCondition(step.id, gIdx, cIdx, { operator: v as any })
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">equals</SelectItem>
                                    <SelectItem value="not_equals">not equals</SelectItem>
                                    <SelectItem value="contains">contains</SelectItem>
                                    <SelectItem value="greater_than">&gt;</SelectItem>
                                    <SelectItem value="less_than">&lt;</SelectItem>
                                    <SelectItem value="is_empty">is empty</SelectItem>
                                    <SelectItem value="is_not_empty">is not empty</SelectItem>
                                    <SelectItem value="regex">regex</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={cond.value ?? ""}
                                  onChange={(e) =>
                                    updateCondition(step.id, gIdx, cIdx, { value: e.target.value })
                                  }
                                  placeholder="Value"
                                  className="h-8 text-sm w-32"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCondition(step.id, gIdx, cIdx)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => addCondition(step.id, gIdx)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add condition
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Actions (run in parallel)</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAction(step.id)}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Action
                          </Button>
                        </div>
                        {step.actions.map((action, aIdx) => {
                          const actionMeta = ACTION_TYPES.find((a) => a.value === action.type);
                          return (
                            <div key={aIdx} className="border rounded-xl p-3 bg-slate-50 space-y-2">
                              <div className="flex items-center justify-between">
                                <Select
                                  value={action.type}
                                  onValueChange={(v) =>
                                    changeActionType(step.id, aIdx, v as AutomationActionType)
                                  }
                                >
                                  <SelectTrigger className="w-48 h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ACTION_TYPES.map((at) => (
                                      <SelectItem key={at.value} value={at.value}>
                                        <span className="flex items-center gap-2">
                                          {at.icon} {at.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAction(step.id, aIdx)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              {/* Dynamic config per action type */}
                              <div className="grid gap-2">
                                {action.type === "send_email" && (
                                  <>
                                    <Input
                                      value={action.config?.to || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, to: e.target.value },
                                        })
                                      }
                                      placeholder="To"
                                      className="h-8 text-sm"
                                    />
                                    <Input
                                      value={action.config?.subject || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, subject: e.target.value },
                                        })
                                      }
                                      placeholder="Subject"
                                      className="h-8 text-sm"
                                    />
                                    <Textarea
                                      value={action.config?.body || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, body: e.target.value },
                                        })
                                      }
                                      placeholder="Body (HTML)"
                                      className="text-sm min-h-20"
                                    />
                                  </>
                                )}
                                {action.type === "send_sms" && (
                                  <>
                                    <Input
                                      value={action.config?.to || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, to: e.target.value },
                                        })
                                      }
                                      placeholder="Phone number"
                                      className="h-8 text-sm"
                                    />
                                    <Textarea
                                      value={action.config?.message || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, message: e.target.value },
                                        })
                                      }
                                      placeholder="Message"
                                      className="text-sm min-h-20"
                                    />
                                  </>
                                )}
                                {action.type === "add_tag" && (
                                  <Input
                                    value={action.config?.tag || ""}
                                    onChange={(e) =>
                                      updateAction(step.id, aIdx, {
                                        config: { ...action.config, tag: e.target.value },
                                      })
                                    }
                                    placeholder="Tag name"
                                    className="h-8 text-sm"
                                  />
                                )}
                                {action.type === "assign_role" && (
                                  <Input
                                    value={action.config?.role || ""}
                                    onChange={(e) =>
                                      updateAction(step.id, aIdx, {
                                        config: { ...action.config, role: e.target.value },
                                      })
                                    }
                                    placeholder="Role (student/teacher/admin)"
                                    className="h-8 text-sm"
                                  />
                                )}
                                {action.type === "send_webhook" && (
                                  <>
                                    <Input
                                      value={action.config?.url || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, url: e.target.value },
                                        })
                                      }
                                      placeholder="Webhook URL"
                                      className="h-8 text-sm"
                                    />
                                    <Select
                                      value={action.config?.method || "POST"}
                                      onValueChange={(v) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, method: v },
                                        })
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="PATCH">PATCH</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Textarea
                                      value={JSON.stringify(action.config?.bodyTemplate || {}, null, 2)}
                                      onChange={(e) => {
                                        try {
                                          updateAction(step.id, aIdx, {
                                            config: { ...action.config, bodyTemplate: JSON.parse(e.target.value) },
                                          });
                                        } catch {}
                                      }}
                                      className="font-mono text-xs min-h-20"
                                      placeholder='{"email": "{{values.email}}"}'
                                    />
                                  </>
                                )}
                                {action.type === "update_submission_status" && (
                                  <Select
                                    value={action.config?.status || "new"}
                                    onValueChange={(v) =>
                                      updateAction(step.id, aIdx, {
                                        config: { ...action.config, status: v },
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="reviewed">Reviewed</SelectItem>
                                      <SelectItem value="processed">Processed</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                {action.type === "ai_generate" && (
                                  <>
                                    <Input
                                      value={action.config?.model || "gpt-4o-mini"}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, model: e.target.value },
                                        })
                                      }
                                      placeholder="Model"
                                      className="h-8 text-sm"
                                    />
                                    <Textarea
                                      value={action.config?.prompt || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, prompt: e.target.value },
                                        })
                                      }
                                      placeholder="Prompt (use {{path.to.field}} for variables)"
                                      className="text-sm min-h-20"
                                    />
                                    <Input
                                      value={action.config?.outputField || ""}
                                      onChange={(e) =>
                                        updateAction(step.id, aIdx, {
                                          config: { ...action.config, outputField: e.target.value },
                                        })
                                      }
                                      placeholder="Store result in field (optional)"
                                      className="h-8 text-sm"
                                    />
                                  </>
                                )}
                                {action.type === "wait" && (
                                  <div className="flex items-center gap-2">
                                    <Label className="text-xs">Wait is handled by the step delay.</Label>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Automation name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this automation do?"
              />
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={form.enabled}
                onCheckedChange={(c) => setForm({ ...form, enabled: c })}
              />
              <Label>Enabled</Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}