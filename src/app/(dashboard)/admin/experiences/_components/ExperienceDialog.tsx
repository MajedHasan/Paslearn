"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  ArrowRight, Sparkles, Route, TimerReset, LayoutGrid, Eye,
  Monitor, PanelTop, ArrowRightLeft, Layers3,
  Palette, Zap, CalendarClock, HelpCircle,
} from "lucide-react";
import {
  Experience, ExperienceFormValues, ExperienceContent,
  ExperienceType, TriggerType, TargetScope, ExperienceContentType,
} from "../utils/experience.types";
import {
  EXPERIENCE_TYPE_OPTIONS, TRIGGER_TYPE_OPTIONS, CONTENT_RESOURCE_TYPES,
} from "../utils/experience.constants";

interface Props {
  experience?: Experience | null;
  onSaved: () => void;
  triggerLabel?: string;
}

const emptyForm: ExperienceFormValues = {
  key: "",
  name: "",
  type: "full_page",
  enabled: false,
  priority: 0,
  target: { scope: "global", routes: [], excludeRoutes: [] },
  trigger: { type: "always", value: "" },
  schedule: { startAt: "", endAt: "" },
  content: null,
  options: {},
  payload: { title: "", message: "", buttonText: "" },
};

function generateKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const typeIcons: Record<ExperienceType, React.ReactNode> = {
  full_page: <Monitor className="h-4 w-4" />,
  popup: <PanelTop className="h-4 w-4" />,
  banner: <Layers3 className="h-4 w-4" />,
  redirect: <ArrowRightLeft className="h-4 w-4" />,
};

export default function ExperienceDialog({ experience, onSaved, triggerLabel = "Create Experience" }: Props) {
  const isEdit = !!experience;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ExperienceFormValues>(emptyForm);
  const [showAdvancedKey, setShowAdvancedKey] = useState(false);
  const [availableForms, setAvailableForms] = useState<{ _id: string; name: string; key: string }[]>([]);

  useEffect(() => {
    if (open) {
      api.get("/forms/admin").then(res => setAvailableForms(res.data?.data || [])).catch(() => {});
    }
  }, [open]);

  const initialValues = useMemo<ExperienceFormValues>(() => {
    if (!experience) return emptyForm;
    return {
      key: experience.key ?? "",
      name: experience.name ?? "",
      type: experience.type ?? "full_page",
      enabled: experience.enabled ?? false,
      priority: experience.priority ?? 0,
      target: {
        scope: experience.target?.scope ?? "global",
        routes: experience.target?.routes ?? [],
        excludeRoutes: experience.target?.excludeRoutes ?? [],
      },
      trigger: {
        type: experience.trigger?.type ?? "always",
        value: experience.trigger?.value ? String(experience.trigger.value) : "",
      },
      schedule: {
        startAt: experience.schedule?.startAt ?? "",
        endAt: experience.schedule?.endAt ?? "",
      },
      content: experience.content ?? null,
      options: experience.options ?? {},
      payload: {
        title: experience.payload?.title ?? "",
        message: experience.payload?.message ?? "",
        buttonText: experience.payload?.buttonText ?? "",
      },
    };
  }, [experience]);

  useEffect(() => { if (open) setValues(initialValues); }, [open, initialValues]);

  const updateField = <K extends keyof ExperienceFormValues>(key: K, val: ExperienceFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const updateOptions = (patch: Record<string, any>) => {
    setValues(prev => ({ ...prev, options: { ...prev.options, ...patch } }));
  };

  const updateContent = (patch: Partial<ExperienceContent>) => {
    setValues(prev => ({
      ...prev,
      content: prev.content ? { ...prev.content, ...patch } : { resourceType: "form", ...patch },
    }));
  };

  const submit = async () => {
    try {
      setLoading(true);
      const payload = { ...values };
      if (isEdit && experience?._id) {
        await api.patch(`/experiences/admin/${experience._id}`, payload);
        toast.success("Experience updated");
      } else {
        await api.post("/experiences/admin", payload);
        toast.success("Experience created");
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90">
          {isEdit ? "Edit" : triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full"><Sparkles className="mr-1 h-3.5 w-3.5" /> Experience Builder</Badge>
            <Badge variant="outline" className="rounded-full">{isEdit ? "Edit Mode" : "Create Mode"}</Badge>
            {values.type && (
              <Badge variant="secondary" className="rounded-full gap-1">
                {typeIcons[values.type as ExperienceType]} {values.type}
              </Badge>
            )}
          </div>
          <DialogTitle className="mt-3 text-2xl font-bold">
            {isEdit ? "Edit Experience" : "Create Experience"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Design how your campaign looks, when it appears, and what it shows.
          </p>
        </DialogHeader>

        <Tabs defaultValue="basics" className="w-full mt-4">
          <TabsList className="mb-4 flex flex-wrap gap-1 bg-transparent p-0 border-b pb-2">
            {[
              { value: "basics", label: "Basics", icon: Sparkles },
              { value: "content", label: "Content", icon: LayoutGrid },
              { value: "options", label: "Display", icon: Palette },
              { value: "targeting", label: "Targeting", icon: Route },
              { value: "trigger", label: "Trigger", icon: TimerReset },
            ].map(tab => (
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

          {/* Basics Tab */}
          <TabsContent value="basics">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={values.name} onChange={e => {
                    const n = e.target.value;
                    updateField("name", n);
                    if (!showAdvancedKey) updateField("key", generateKey(n));
                  }} placeholder="Summer Sale Popup" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key</Label>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAdvancedKey(!showAdvancedKey)}>
                      {showAdvancedKey ? "Auto" : "Advanced"}
                    </Button>
                  </div>
                  {showAdvancedKey ? (
                    <Input value={values.key} onChange={e => updateField("key", e.target.value)} className="font-mono text-sm" />
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl border bg-slate-50 text-sm text-slate-500 font-mono">{values.key || "auto‑generated"}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={values.type} onValueChange={v => updateField("type", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">{typeIcons[opt.value as ExperienceType]} {opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input type="number" value={values.priority} onChange={e => updateField("priority", +e.target.value)} />
                </div>
                <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                  <div><Label>Enabled</Label><p className="text-xs text-muted-foreground">Turn on/off</p></div>
                  <Switch checked={values.enabled} onCheckedChange={v => updateField("enabled", v)} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={values.content?.resourceType || ""} onValueChange={v => updateContent({ resourceType: v as ExperienceContentType })}>
                    <SelectTrigger><SelectValue placeholder="Select content type…" /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_RESOURCE_TYPES.map(ct => (
                        <SelectItem key={ct.value} value={ct.value}>{ct.icon} {ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {values.content?.resourceType === "form" && (
                  <div className="space-y-2">
                    <Label>Select Form</Label>
                    <Select value={values.content?.resourceKey || values.content?.resourceId || ""}
                      onValueChange={val => {
                        const form = availableForms.find(f => f.key === val || f._id === val);
                        updateContent({
                          resourceKey: form?.key || val,
                          resourceId: form?._id || val,
                        });
                      }}>
                      <SelectTrigger><SelectValue placeholder="Choose a form…" /></SelectTrigger>
                      <SelectContent>
                        {availableForms.map(f => (
                          <SelectItem key={f._id} value={f.key}>{f.name} <span className="text-xs text-muted-foreground">({f.key})</span></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {values.content?.resourceType === "page" && (
                  <div className="space-y-2">
                    <Label>Page Key or Path</Label>
                    <Input value={values.content?.resourceKey || ""} onChange={e => updateContent({ resourceKey: e.target.value })} placeholder="/landing or page-slug" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Title Override (optional)</Label>
                  <Input value={values.content?.titleOverride || ""} onChange={e => updateContent({ titleOverride: e.target.value })} placeholder="Custom title" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title (payload)</Label>
                  <Input value={values.payload.title} onChange={e => updateField("payload", { ...values.payload, title: e.target.value })} placeholder="Welcome!" />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={values.payload.buttonText} onChange={e => updateField("payload", { ...values.payload, buttonText: e.target.value })} placeholder="Get Started" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Message</Label>
                  <Textarea value={values.payload.message} onChange={e => updateField("payload", { ...values.payload, message: e.target.value })} placeholder="Describe the offer…" className="min-h-24" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Display Options Tab */}
          <TabsContent value="options">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
              {values.type === "popup" && (
                <>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Popup Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={values.options?.position || "center"} onValueChange={v => updateOptions({ position: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select value={values.options?.size || "medium"} onValueChange={v => updateOptions({ size: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Animation</Label>
                      <Select value={values.options?.animation || "fade"} onValueChange={v => updateOptions({ animation: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="slide-up">Slide Up</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={values.options?.closeButton !== false} onCheckedChange={v => updateOptions({ closeButton: v })} />
                      <Label>Close Button</Label>
                    </div>
                  </div>
                </>
              )}
              {values.type === "banner" && (
                <>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Banner Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Placement</Label>
                      <Select value={values.options?.placement || "top"} onValueChange={v => updateOptions({ placement: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={values.options?.sticky || false} onCheckedChange={v => updateOptions({ sticky: v })} />
                      <Label>Sticky</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={values.options?.dismissible !== false} onCheckedChange={v => updateOptions({ dismissible: v })} />
                      <Label>Dismissible</Label>
                    </div>
                  </div>
                </>
              )}
              {values.type === "redirect" && (
                <>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Redirect Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Delay (ms)</Label>
                      <Input type="number" value={values.options?.delayMs || 0} onChange={e => updateOptions({ delayMs: +e.target.value })} />
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={values.options?.newTab || false} onCheckedChange={v => updateOptions({ newTab: v })} />
                      <Label>Open in new tab</Label>
                    </div>
                  </div>
                </>
              )}
              {values.type === "full_page" && (
                <>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Full Page Settings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <Select value={values.options?.layout || "centered"} onValueChange={v => updateOptions({ layout: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="centered">Centered</SelectItem>
                          <SelectItem value="wide">Wide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <Input value={values.options?.background || ""} onChange={e => updateOptions({ background: e.target.value })} placeholder="#ffffff" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Targeting Tab */}
          <TabsContent value="targeting">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select value={values.target.scope} onValueChange={v => updateField("target", { ...values.target, scope: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="routes">Specific Routes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 pt-6">
                  <HelpCircle className="h-4 w-4" /> Add routes one per line
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Routes</Label>
                  <Textarea value={values.target.routes.join("\n")} onChange={e => updateField("target", { ...values.target, routes: e.target.value.split("\n") })} placeholder="/pricing\n/dashboard" className="min-h-24" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Excluded Routes</Label>
                  <Textarea value={values.target.excludeRoutes.join("\n")} onChange={e => updateField("target", { ...values.target, excludeRoutes: e.target.value.split("\n") })} placeholder="/admin" className="min-h-24" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trigger & Schedule Tab */}
          <TabsContent value="trigger">
            <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select value={values.trigger.type} onValueChange={v => updateField("trigger", { ...values.trigger, type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input value={values.trigger.value} onChange={e => updateField("trigger", { ...values.trigger, value: e.target.value })} placeholder="5000 (ms)" />
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 pt-6">
                  <CalendarClock className="h-4 w-4" /> Leave empty for always active
                </div>
                <div className="space-y-2">
                  <Label>Start</Label>
                  <Input type="datetime-local" value={values.schedule.startAt} onChange={e => updateField("schedule", { ...values.schedule, startAt: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End</Label>
                  <Input type="datetime-local" value={values.schedule.endAt} onChange={e => updateField("schedule", { ...values.schedule, endAt: e.target.value })} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}