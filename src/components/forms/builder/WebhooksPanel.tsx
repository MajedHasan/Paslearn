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
import { Switch } from "@/components/ui/switch";
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
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Webhook,
  Globe,
  Shield,
  RefreshCw,
  Code2,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { WebhookConfig } from "@/types/forms/shared/form.interface";

interface Props {
  webhooks: WebhookConfig[];
  onChange: (webhooks: WebhookConfig[]) => void;
}

const METHOD_META: Record<string, { color: string; bg: string }> = {
  POST: { color: "text-blue-600", bg: "bg-blue-50" },
  PUT: { color: "text-amber-600", bg: "bg-amber-50" },
  PATCH: { color: "text-purple-600", bg: "bg-purple-50" },
};

export default function WebhooksPanel({ webhooks, onChange }: Props) {
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

  const toggleCard = (idx: number) => {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const addWebhook = () => {
    const newWebhook: WebhookConfig = {
      url: "",
      method: "POST",
      headers: {},
      bodyTemplate: {},
      retryOnFailure: false,
      secret: "",
    };
    onChange([...webhooks, newWebhook]);
    setOpenCards((prev) => new Set(prev).add(webhooks.length));
  };

  const duplicateWebhook = (index: number) => {
    const original = webhooks[index];
    const copy: WebhookConfig = {
      ...original,
      headers: { ...original.headers },
      bodyTemplate: { ...original.bodyTemplate },
    };
    const updated = [...webhooks];
    updated.splice(index + 1, 0, copy);
    onChange(updated);
  };

  const updateWebhook = (index: number, patch: Partial<WebhookConfig>) => {
    const updated = [...webhooks];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeWebhook = (index: number) => {
    onChange(webhooks.filter((_, i) => i !== index));
  };

  const handleJsonChange = (
    index: number,
    field: "headers" | "bodyTemplate",
    value: string
  ) => {
    const errorKey = `${index}-${field}`;
    try {
      const parsed = JSON.parse(value);
      updateWebhook(index, { [field]: parsed });
      setJsonErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    } catch {
      setJsonErrors((prev) => ({ ...prev, [errorKey]: "Invalid JSON" }));
    }
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Webhook className="h-5 w-5 text-amber-500" />
            Webhooks
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send real‑time HTTP notifications to external services when forms are submitted.
          </p>
        </div>
        <Button onClick={addWebhook} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30">
          <Webhook className="h-10 w-10 mx-auto mb-3 text-amber-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No webhooks yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your forms to Slack, Discord, Zapier, or any custom API endpoint.
          </p>
          <Button onClick={addWebhook} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add your first webhook
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.map((webhook, idx) => {
          const isOpen = openCards.has(idx);
          const methodMeta = METHOD_META[webhook.method] || METHOD_META.POST;
          const headerErrorKey = `${idx}-headers`;
          const bodyErrorKey = `${idx}-bodyTemplate`;
          const hasHeaderError = !!jsonErrors[headerErrorKey];
          const hasBodyError = !!jsonErrors[bodyErrorKey];
          const isValid = webhook.url.trim().length > 0 && !hasHeaderError && !hasBodyError;

          return (
            <div
              key={idx}
              className="rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleCard(idx)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between px-5 py-4 cursor-pointer select-none">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs font-mono">
                        #{idx + 1}
                      </Badge>
                      <Badge className={`${methodMeta.bg} ${methodMeta.color} font-bold text-xs`}>
                        {webhook.method}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-slate-700 truncate">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{webhook.url || "No URL set"}</span>
                      </div>
                      {!isValid && (
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); duplicateWebhook(idx); }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeWebhook(idx); }}
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

                <CollapsibleContent className="px-5 pb-5 space-y-5">
                  {/* URL & Method */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Endpoint URL</Label>
                      <Input
                        value={webhook.url}
                        onChange={(e) => updateWebhook(idx, { url: e.target.value })}
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>HTTP Method</Label>
                      <Select
                        value={webhook.method}
                        onValueChange={(v) => updateWebhook(idx, { method: v as WebhookConfig["method"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Retry & Secret */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-4 p-3 rounded-xl border">
                      <Switch
                        id={`retry-${idx}`}
                        checked={webhook.retryOnFailure || false}
                        onCheckedChange={(checked) => updateWebhook(idx, { retryOnFailure: checked })}
                      />
                      <Label htmlFor={`retry-${idx}`} className="flex items-center gap-2 cursor-pointer">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        Retry on failure
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        Secret (HMAC verification)
                      </Label>
                      <Input
                        type="password"
                        value={webhook.secret || ""}
                        onChange={(e) => updateWebhook(idx, { secret: e.target.value })}
                        placeholder="whsec_..."
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Headers */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                      Custom Headers (JSON)
                    </Label>
                    <Textarea
                      value={JSON.stringify(webhook.headers || {}, null, 2)}
                      onChange={(e) => handleJsonChange(idx, "headers", e.target.value)}
                      className={`min-h-24 font-mono text-xs ${hasHeaderError ? "border-red-400 focus:ring-red-400" : ""}`}
                      placeholder='{"Authorization": "Bearer ...", "X-Custom": "value"}'
                    />
                    {jsonErrors[headerErrorKey] && (
                      <p className="text-xs text-red-600">{jsonErrors[headerErrorKey]}</p>
                    )}
                  </div>

                  {/* Body Template */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      Body Template (JSON)
                    </Label>
                    <Textarea
                      value={JSON.stringify(webhook.bodyTemplate || {}, null, 2)}
                      onChange={(e) => handleJsonChange(idx, "bodyTemplate", e.target.value)}
                      className={`min-h-28 font-mono text-xs ${hasBodyError ? "border-red-400 focus:ring-red-400" : ""}`}
                      placeholder='{"email": "{{email}}", "name": "{{name}}", "form": "{{form_key}}"}'
                    />
                    {jsonErrors[bodyErrorKey] && (
                      <p className="text-xs text-red-600">{jsonErrors[bodyErrorKey]}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use <code>{`{{field_name}}`}</code> to include form data dynamically.
                    </p>
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