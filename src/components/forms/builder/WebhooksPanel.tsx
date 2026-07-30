"use client";

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
import { Plus, Trash2 } from "lucide-react";
import { WebhookConfig } from "@/types/forms/shared/form.interface";

interface Props {
  webhooks: WebhookConfig[];
  onChange: (webhooks: WebhookConfig[]) => void;
}

export default function WebhooksPanel({ webhooks, onChange }: Props) {
  const addWebhook = () => {
    onChange([
      ...webhooks,
      {
        url: "",
        method: "POST",
        headers: {},
        bodyTemplate: {},
        retryOnFailure: false,
        secret: "",
      },
    ]);
  };

  const updateWebhook = (index: number, patch: Partial<WebhookConfig>) => {
    const updated = [...webhooks];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeWebhook = (index: number) => {
    onChange(webhooks.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Webhooks</h2>
        <Button onClick={addWebhook} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {webhooks.map((webhook, idx) => (
          <div key={idx} className="rounded-xl border p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">#{idx + 1}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWebhook(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>URL</Label>
                <Input
                  value={webhook.url}
                  onChange={(e) =>
                    updateWebhook(idx, { url: e.target.value })
                  }
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label>Method</Label>
                <Select
                  value={webhook.method}
                  onValueChange={(value) =>
                    updateWebhook(idx, {
                      method: value as WebhookConfig["method"],
                    })
                  }
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

              <div className="flex items-center gap-4 pt-2">
                <Switch
                  id={`retry-${idx}`}
                  checked={webhook.retryOnFailure || false}
                  onCheckedChange={(checked) =>
                    updateWebhook(idx, { retryOnFailure: checked })
                  }
                />
                <Label htmlFor={`retry-${idx}`}>Retry on failure</Label>
              </div>

              <div className="space-y-2">
                <Label>Secret (HMAC)</Label>
                <Input
                  value={webhook.secret || ""}
                  onChange={(e) =>
                    updateWebhook(idx, { secret: e.target.value })
                  }
                  placeholder="whsec_..."
                />
              </div>

              <div className="space-y-2">
                <Label>Headers (JSON)</Label>
                <Textarea
                  value={JSON.stringify(webhook.headers || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateWebhook(idx, { headers: parsed });
                    } catch {}
                  }}
                  className="min-h-20 font-mono text-xs"
                  placeholder='{"Authorization": "Bearer ..."}'
                />
              </div>

              <div className="space-y-2">
                <Label>Body Template (JSON)</Label>
                <Textarea
                  value={JSON.stringify(webhook.bodyTemplate || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateWebhook(idx, { bodyTemplate: parsed });
                    } catch {}
                  }}
                  className="min-h-24 font-mono text-xs"
                  placeholder='{"email": "{{email}}", "name": "{{name}}"}'
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}