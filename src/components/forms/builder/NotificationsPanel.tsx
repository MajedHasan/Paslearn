"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Mail,
  Bell,
  Send,
  Sparkles,
  X,
  Eye,
  Code,
  CheckCircle,
  AlertCircle,
  FileText,
  Wand2,
  LayoutTemplate,
  Paintbrush,
  Clock,
} from "lucide-react";
import { NotificationEmail } from "@/types/forms/shared/form.interface";
import { FieldDefinition } from "@/types/forms/shared/field.types";

interface Props {
  notifications: NotificationEmail[];
  fields: FieldDefinition[]; // <-- actual form fields
  onChange: (notifications: NotificationEmail[]) => void;
}

const TRIGGER_META = {
  on_submit: { label: "On Submit", icon: Send, color: "text-green-600", bg: "bg-green-50" },
  on_approve: { label: "On Approve", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
  on_reject: { label: "On Reject", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
};

// Elegant email templates – these use generic placeholders but we'll replace with actual field variables in preview
const EMAIL_TEMPLATES = [
  {
    id: "thank_you",
    name: "Thank You",
    icon: FileText,
    subject: "Thank you for your submission, {{name}}!",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
  <div style="background: linear-gradient(135deg, #0177fb, #0156c7); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Thank You! 🎉</h1>
  </div>
  <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="color: #374151; font-size: 16px;">Dear {{name}},</p>
    <p style="color: #374151; font-size: 16px;">We have received your submission and will review it shortly.</p>
    <p style="color: #374151; font-size: 16px;">If you have any questions, feel free to reply to this email.</p>
    <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
      <p style="font-size: 14px; color: #6b7280;">Submission ID: {{submission_id}}<br/>Date: {{date}}</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "approval",
    name: "Approval Notice",
    icon: CheckCircle,
    subject: "Your application has been approved!",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Approved! ✅</h1>
  </div>
  <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="color: #374151; font-size: 16px;">Hi {{name}},</p>
    <p style="color: #374151; font-size: 16px;">Congratulations! Your submission has been approved.</p>
    <p style="color: #374151; font-size: 16px;">You can now access your account and start using our services.</p>
  </div>
</div>`,
  },
  {
    id: "rejection",
    name: "Rejection Notice",
    icon: AlertCircle,
    subject: "Update on your submission",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Submission Update</h1>
  </div>
  <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="color: #374151; font-size: 16px;">Dear {{name}},</p>
    <p style="color: #374151; font-size: 16px;">We regret to inform you that your submission could not be approved at this time.</p>
    <p style="color: #374151; font-size: 16px;">Please reach out to our support team if you need further assistance.</p>
  </div>
</div>`,
  },
];

export default function NotificationsPanel({ notifications, fields, onChange }: Props) {
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());
  const [previewMode, setPreviewMode] = useState<Record<number, boolean>>({});
  const [recipientInputs, setRecipientInputs] = useState<Record<number, string>>({});

  // Build variable list from actual form fields (key = field.name, label = field.label)
  const fieldVariables = fields.map((f) => ({
    key: `{{${f.name}}}`,
    label: f.label,
  }));

  // Also include a few universal ones that are always available
  const systemVariables = [
    { key: "{{submission_id}}", label: "Submission ID" },
    { key: "{{date}}", label: "Date" },
    { key: "{{time}}", label: "Time" },
  ];
  const allVariables = [...fieldVariables, ...systemVariables];

  const toggleCard = (idx: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const addNotification = () => {
    const newNotif: NotificationEmail = {
      to: [],
      subject: "",
      body: "",
      trigger: "on_submit",
      from: "",
      replyTo: "",
    };
    onChange([...notifications, newNotif]);
    setOpenCards((prev) => new Set(prev).add(notifications.length));
  };

  const duplicateNotification = (index: number) => {
    const original = notifications[index];
    const copy: NotificationEmail = { ...original, to: [...original.to] };
    const updated = [...notifications];
    updated.splice(index + 1, 0, copy);
    onChange(updated);
  };

  const updateNotification = (index: number, patch: Partial<NotificationEmail>) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeNotification = (index: number) => {
    onChange(notifications.filter((_, i) => i !== index));
  };

  const applyTemplate = (index: number, templateId: string) => {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    updateNotification(index, {
      subject: template.subject,
      body: template.body,
    });
  };

  const insertVariable = (index: number, field: "subject" | "body", variable: string) => {
    const current = notifications[index][field];
    updateNotification(index, { [field]: current + variable });
  };

  const addRecipient = (index: number) => {
    const value = recipientInputs[index]?.trim();
    if (!value) return;
    const current = notifications[index].to;
    if (current.includes(value)) return;
    updateNotification(index, { to: [...current, value] });
    setRecipientInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const removeRecipient = (index: number, recipient: string) => {
    updateNotification(index, {
      to: notifications[index].to.filter((r) => r !== recipient),
    });
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-500" />
            Email Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create beautiful, personalised emails triggered by form submissions.
          </p>
        </div>
        <Button onClick={addNotification} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Notification
        </Button>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30">
          <Mail className="h-10 w-10 mx-auto mb-3 text-amber-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No notifications yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Set up automatic emails that keep your users informed and engaged.
          </p>
          <Button onClick={addNotification} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Create your first notification
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((notif, idx) => {
          const isOpen = openCards.has(idx);
          const trigger = TRIGGER_META[notif.trigger] || TRIGGER_META.on_submit;
          const TriggerIcon = trigger.icon;

          return (
            <div
              key={idx}
              className={`rounded-2xl border-2 ${trigger.bg} border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleCard(idx)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between px-5 py-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs font-mono bg-white">
                        #{idx + 1}
                      </Badge>
                      <div className={`flex items-center gap-2 ${trigger.color}`}>
                        <TriggerIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{trigger.label}</span>
                      </div>
                      <span className="text-sm text-slate-700 truncate">
                        {notif.subject || "Untitled notification"}
                      </span>
                      {notif.to.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {notif.to.length} recipient{notif.to.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); duplicateNotification(idx); }}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeNotification(idx); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="px-5 pb-5 space-y-6">
                  {/* Trigger & From */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Trigger</Label>
                      <Select
                        value={notif.trigger}
                        onValueChange={(v) => updateNotification(idx, { trigger: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIGGER_META).map(([key, meta]) => {
                            const Icon = meta.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <Icon className="h-3 w-3" /> {meta.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>From (name &lt;email&gt;)</Label>
                      <Input
                        value={notif.from || ""}
                        onChange={(e) => updateNotification(idx, { from: e.target.value })}
                        placeholder="Paslearn <noreply@paslearn.com>"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reply‑to</Label>
                      <Input
                        value={notif.replyTo || ""}
                        onChange={(e) => updateNotification(idx, { replyTo: e.target.value })}
                        placeholder="support@paslearn.com"
                      />
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {notif.to.map((r) => (
                        <Badge key={r} variant="secondary" className="gap-1 pr-1">
                          {r}
                          <button onClick={() => removeRecipient(idx, r)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={recipientInputs[idx] || ""}
                        onChange={(e) => setRecipientInputs((prev) => ({ ...prev, [idx]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRecipient(idx);
                          }
                        }}
                        placeholder="email@example.com or {{email}}"
                        className="h-9 text-sm"
                      />
                      <Button variant="outline" size="sm" className="h-9" onClick={() => addRecipient(idx)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Templates */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Quick Template</Label>
                      <Badge variant="outline" className="text-xs">
                        <Wand2 className="h-3 w-3 mr-1" /> Start from a design
                      </Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {EMAIL_TEMPLATES.map((tpl) => {
                        const Icon = tpl.icon;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => applyTemplate(idx, tpl.id)}
                            className="cursor-pointer border rounded-xl overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all group"
                          >
                            {/* Mini preview */}
                            <div className="h-24 bg-white scale-[0.3] origin-top-left w-[333%] overflow-hidden pointer-events-none">
                              <div dangerouslySetInnerHTML={{ __html: tpl.body }} />
                            </div>
                            <div className="p-3 border-t">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-semibold group-hover:text-amber-600">{tpl.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{tpl.subject}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={notif.subject}
                      onChange={(e) => updateNotification(idx, { subject: e.target.value })}
                      placeholder="Thank you for your submission, {{full_name}}!"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {allVariables.map((v) => (
                        <TooltipProvider key={v.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-amber-50 text-xs"
                                onClick={() => insertVariable(idx, "subject", v.key)}
                              >
                                {v.key}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{v.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {/* Body with visual builder placeholder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Body</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${!previewMode[idx] ? "bg-amber-50 text-amber-700" : ""}`}
                          onClick={() => setPreviewMode((prev) => ({ ...prev, [idx]: false }))}
                        >
                          <Code className="h-3 w-3 mr-1" /> HTML
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${previewMode[idx] ? "bg-amber-50 text-amber-700" : ""}`}
                          onClick={() => setPreviewMode((prev) => ({ ...prev, [idx]: true }))}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          disabled
                        >
                          <Paintbrush className="h-3 w-3 mr-1" /> Visual Builder
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="html" className="w-full">
                      <TabsList className="mb-2">
                        <TabsTrigger value="html" className="text-xs">HTML Code</TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                        <TabsTrigger value="visual" disabled className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Visual Builder
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="html">
                        <Textarea
                          value={notif.body}
                          onChange={(e) => updateNotification(idx, { body: e.target.value })}
                          className="min-h-48 font-mono text-sm"
                          placeholder="<p>Dear {{name}},</p><p>Thank you for your submission!</p>"
                        />
                      </TabsContent>
                      <TabsContent value="preview">
                        <div
                          className="border rounded-xl p-4 bg-white min-h-48 overflow-auto"
                          dangerouslySetInnerHTML={{ __html: notif.body }}
                        />
                      </TabsContent>
                      <TabsContent value="visual">
                        <div className="border rounded-xl p-8 text-center text-muted-foreground bg-slate-50">
                          <Paintbrush className="h-8 w-8 mx-auto mb-3 opacity-30" />
                          <p className="font-medium">Visual email builder coming soon</p>
                          <p className="text-xs">Use the HTML editor or templates for now.</p>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex flex-wrap gap-1.5">
                      {allVariables.map((v) => (
                        <TooltipProvider key={v.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-amber-50 text-xs"
                                onClick={() => insertVariable(idx, "body", v.key)}
                              >
                                {v.key}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{v.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}