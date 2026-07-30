"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpamProtection } from "@/types/forms/shared/form.interface";

interface Props {
  config: SpamProtection;
  onChange: (config: SpamProtection) => void;
}

export default function SpamProtectionPanel({ config, onChange }: Props) {
  const update = (patch: Partial<SpamProtection>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Spam Protection</h2>

      <div className="flex items-center gap-4 mb-6">
        <Switch
          id="spam-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => update({ enabled: checked })}
        />
        <Label htmlFor="spam-enabled">Enable spam protection</Label>
      </div>

      {config.enabled && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={config.type}
              onValueChange={(value) =>
                update({ type: value as SpamProtection["type"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="honeypot">Honeypot</SelectItem>
                <SelectItem value="recaptcha_v2">reCAPTCHA v2</SelectItem>
                <SelectItem value="recaptcha_v3">reCAPTCHA v3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.type.startsWith("recaptcha") && (
            <>
              <div className="space-y-2">
                <Label>Site Key</Label>
                <Input
                  value={config.siteKey || ""}
                  onChange={(e) => update({ siteKey: e.target.value })}
                  placeholder="6Lc..."
                />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={config.secretKey || ""}
                  onChange={(e) => update({ secretKey: e.target.value })}
                  placeholder="6Lc..."
                />
              </div>
              {config.type === "recaptcha_v3" && (
                <div className="space-y-2">
                  <Label>Threshold (0.0 – 1.0)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.threshold ?? 0.5}
                    onChange={(e) =>
                      update({ threshold: Number(e.target.value) })
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}