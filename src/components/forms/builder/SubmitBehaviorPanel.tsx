"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Clock,
  Palette,
  MousePointerClick,
  CornerDownRight,
  LayoutTemplate,
  Code2,
  Eye,
} from "lucide-react";

interface SubmitAction {
  type: "message" | "redirect" | "message_then_redirect";
  message?: string;
  redirectTo?: string;
  delayMs?: number;
}

interface FormMeta {
  submitButtonText?: string;
  successTitle?: string;
  successMessage?: string;
  theme?: {
    accent?: string;
    radius?: string;
  };
  customCSS?: string;
}

interface Props {
  submitAction: SubmitAction;
  meta: FormMeta;
  onChange: (action: SubmitAction, meta: FormMeta) => void;
}

const ACCENT_COLORS = [
  "#D4A017", // gold
  "#0177fb", // blue
  "#10b981", // green
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
];

const RADIUS_OPTIONS = [
  { label: "None", value: "0" },
  { label: "Small (0.25rem)", value: "0.25rem" },
  { label: "Medium (0.5rem)", value: "0.5rem" },
  { label: "Large (1rem)", value: "1rem" },
  { label: "Pill (9999px)", value: "9999px" },
];

export default function SubmitBehaviorPanel({
  submitAction,
  meta,
  onChange,
}: Props) {
  const updateAction = (patch: Partial<SubmitAction>) => {
    onChange({ ...submitAction, ...patch }, meta);
  };

  const updateMeta = (patch: Partial<FormMeta>) => {
    onChange(submitAction, { ...meta, ...patch });
  };

  // Choose a preview accent (fallback to gold)
  const accentColor = meta.theme?.accent || "#D4A017";
  const radiusStyle = meta.theme?.radius || "0.5rem";

  return (
    <div className="rounded-3xl border bg-white shadow-sm divide-y divide-slate-100">
      {/* Submit Action Section */}
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
          <Send className="h-4 w-4 text-amber-500" />
          Submit Action
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select
              value={submitAction.type}
              onValueChange={(value) =>
                updateAction({ type: value as SubmitAction["type"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="message">Show Message</SelectItem>
                <SelectItem value="redirect">Redirect Only</SelectItem>
                <SelectItem value="message_then_redirect">
                  Message then Redirect
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(submitAction.type === "message" ||
            submitAction.type === "message_then_redirect") && (
            <div className="space-y-2">
              <Label>Success Message</Label>
              <Input
                value={submitAction.message || ""}
                onChange={(e) => updateAction({ message: e.target.value })}
                placeholder="Thank you! Your submission has been received."
              />
            </div>
          )}

          {(submitAction.type === "redirect" ||
            submitAction.type === "message_then_redirect") && (
            <>
              <div className="space-y-2">
                <Label>Redirect URL</Label>
                <Input
                  value={submitAction.redirectTo || ""}
                  onChange={(e) => updateAction({ redirectTo: e.target.value })}
                  placeholder="/thank-you"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Delay (ms)
                  </Label>
                  <Badge variant="outline" className="text-xs font-mono">
                    {submitAction.delayMs ?? 0} ms
                  </Badge>
                </div>
                <Slider
                  value={[submitAction.delayMs ?? 0]}
                  min={0}
                  max={10000}
                  step={500}
                  onValueChange={([val]) => updateAction({ delayMs: val })}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form Meta Section */}
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
          <LayoutTemplate className="h-4 w-4 text-amber-500" />
          Form Meta
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Submit Button Text</Label>
            <Input
              value={meta.submitButtonText || ""}
              onChange={(e) => updateMeta({ submitButtonText: e.target.value })}
              placeholder="Submit"
            />
          </div>
          <div className="space-y-2">
            <Label>Success Title</Label>
            <Input
              value={meta.successTitle || ""}
              onChange={(e) => updateMeta({ successTitle: e.target.value })}
              placeholder="Success!"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Success Message</Label>
            <Textarea
              value={meta.successMessage || ""}
              onChange={(e) => updateMeta({ successMessage: e.target.value })}
              placeholder="Your submission was received."
            />
          </div>
        </div>

        {/* Live Submit Button Preview */}
        <div className="flex flex-col items-center p-4 border rounded-2xl bg-slate-50/50">
          <span className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Eye className="h-3 w-3" /> Button Preview
          </span>
          <button
            type="button"
            className="px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl cursor-default"
            style={{
              backgroundColor: accentColor,
              borderRadius: radiusStyle,
            }}
          >
            {meta.submitButtonText || "Submit"}
          </button>
        </div>
      </div>

      {/* Theme Section */}
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
          <Palette className="h-4 w-4 text-amber-500" />
          Theme
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    meta.theme?.accent === color
                      ? "border-slate-900 scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    updateMeta({
                      theme: { ...meta.theme, accent: color },
                    })
                  }
                />
              ))}
              <div className="flex items-center">
                <Input
                  type="color"
                  value={accentColor}
                  onChange={(e) =>
                    updateMeta({
                      theme: { ...meta.theme, accent: e.target.value },
                    })
                  }
                  className="w-10 h-10 p-1 rounded-full border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Select
              value={radiusStyle}
              onValueChange={(value) =>
                updateMeta({
                  theme: { ...meta.theme, radius: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Custom CSS Section */}
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
          <Code2 className="h-4 w-4 text-amber-500" />
          Custom CSS
        </div>
        <div className="space-y-2">
          <Label>Additional CSS</Label>
          <Textarea
            value={meta.customCSS || ""}
            onChange={(e) => updateMeta({ customCSS: e.target.value })}
            className="min-h-32 font-mono text-sm"
            placeholder=".form-wrapper { background: #f9f9f9; }"
          />
        </div>
      </div>
    </div>
  );
}