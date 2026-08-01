"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Eye,
  EyeOff,
  Info,
  Sparkles,
} from "lucide-react";
import { SpamProtection } from "@/types/forms/shared/form.interface";

interface Props {
  config: SpamProtection;
  onChange: (config: SpamProtection) => void;
}

export default function SpamProtectionPanel({ config, onChange }: Props) {
  const update = (patch: Partial<SpamProtection>) => {
    onChange({ ...config, ...patch });
  };

  const typeMeta = {
    honeypot: {
      label: "Honeypot",
      description:
        "Invisible field that only bots fill. Zero friction for humans.",
      icon: EyeOff,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    recaptcha_v2: {
      label: "reCAPTCHA v2",
      description:
        "Classic 'I'm not a robot' checkbox. Requires user interaction.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    recaptcha_v3: {
      label: "reCAPTCHA v3",
      description:
        "Invisible score-based detection. No user interruption.",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  };

  const currentTypeMeta = typeMeta[config.type] || typeMeta.honeypot;
  const TypeIcon = currentTypeMeta.icon;

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          Spam Protection
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Keep your forms clean from bots and spam submissions.
        </p>
      </div>

      {/* Enable / Disable */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              config.enabled ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {config.enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <Label htmlFor="spam-enabled" className="font-semibold text-sm">
              Spam Protection
            </Label>
            <p className="text-xs text-muted-foreground">
              {config.enabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
        <Switch
          id="spam-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => update({ enabled: checked })}
        />
      </div>

      {config.enabled && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
          {/* Type Selection */}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(typeMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              const isActive = config.type === key;
              return (
                <div
                  key={key}
                  onClick={() => update({ type: key as SpamProtection["type"] })}
                  className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                    isActive
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <span className="text-sm font-semibold">{meta.label}</span>
                    {isActive && (
                      <Badge className="ml-auto bg-amber-500 text-white text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Configuration for reCAPTCHA */}
          {config.type.startsWith("recaptcha") && (
            <div className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-blue-500" />
                reCAPTCHA API Keys
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Key</Label>
                  <Input
                    value={config.siteKey || ""}
                    onChange={(e) => update({ siteKey: e.target.value })}
                    placeholder="6Lc... (public key)"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    value={config.secretKey || ""}
                    onChange={(e) => update({ secretKey: e.target.value })}
                    placeholder="6Lc... (private key)"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Threshold for v3 */}
          {config.type === "recaptcha_v3" && (
            <div className="rounded-xl border bg-slate-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Score Threshold</Label>
                <Badge variant="outline" className="font-mono text-xs">
                  {config.threshold ?? 0.5}
                </Badge>
              </div>
              <Slider
                value={[config.threshold ?? 0.5]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={([val]) => update({ threshold: val })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More lenient (0.0)</span>
                <span>Stricter (1.0)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Submissions with a score below this threshold will be blocked.
              </p>
            </div>
          )}

          {/* Honeypot info */}
          {config.type === "honeypot" && (
            <div className="rounded-xl border bg-green-50/50 p-5 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-green-800">
                  Honeypot is active
                </p>
                <p className="text-xs text-green-700">
                  {`A hidden field will be added to your form. Bots will fill it,
                  humans won't. No extra setup needed.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}