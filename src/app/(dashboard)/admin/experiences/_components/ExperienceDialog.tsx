"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowRight,
  Sparkles,
  Route,
  Shield,
  TimerReset,
  Layers3,
} from "lucide-react";

import { Experience, ExperienceFormValues } from "../utils/experience.types";
import {
  COMPONENT_OPTIONS,
  EXPERIENCE_TYPE_OPTIONS,
  TRIGGER_TYPE_OPTIONS,
} from "../utils/experience.constants";

type Props = {
  experience?: Experience | null;
  onSaved: () => void;
  triggerLabel?: string;
};

const emptyValues: ExperienceFormValues = {
  key: "",
  name: "",
  type: "full_page",
  componentKey: "maintenance_v1",
  enabled: false,
  priority: 0,
  target: {
    scope: "global",
    routes: [],
    excludeRoutes: [],
  },
  trigger: {
    type: "always",
    value: "",
  },
  schedule: {
    startAt: "",
    endAt: "",
  },
  payload: {
    title: "",
    message: "",
    buttonText: "",
  },
};

const routeExamples = {
  routes: "/pricing\n/dashboard",
  excludeRoutes: "/admin\n/auth/sign-in",
};

function toArray(value: string) {
  return value
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("/") ? item : `/${item}`))
    .filter(Boolean);
}

function formatDateTime(value?: string) {
  return value ? String(value).slice(0, 16) : "";
}

export default function ExperienceDialog({
  experience,
  onSaved,
  triggerLabel = "Create Experience",
}: Props) {
  const isEdit = !!experience;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ExperienceFormValues>(emptyValues);

  const initialValues = useMemo<ExperienceFormValues>(() => {
    if (!experience) return emptyValues;

    return {
      key: experience.key ?? "",
      name: experience.name ?? "",
      type: experience.type ?? "full_page",
      componentKey: experience.componentKey ?? "maintenance_v1",
      enabled: experience.enabled ?? false,
      priority: experience.priority ?? 0,
      target: {
        scope: experience.target?.scope ?? "global",
        routes: experience.target?.routes ?? [],
        excludeRoutes: experience.target?.excludeRoutes ?? [],
      },
      trigger: {
        type: experience.trigger?.type ?? "always",
        value: experience.trigger?.value
          ? String(experience.trigger.value)
          : "",
      },
      schedule: {
        startAt: formatDateTime(experience.schedule?.startAt),
        endAt: formatDateTime(experience.schedule?.endAt),
      },
      payload: {
        title: experience.payload?.title ?? "",
        message: experience.payload?.message ?? "",
        buttonText: experience.payload?.buttonText ?? "",
      },
    };
  }, [experience]);

  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  const setField = <K extends keyof ExperienceFormValues>(
    key: K,
    value: ExperienceFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        target: {
          scope: values.target.scope,
          routes: toArray(values.target.routes.join("\n")),
          excludeRoutes: toArray(values.target.excludeRoutes.join("\n")),
        },
        trigger: {
          type: values.trigger.type,
          value:
            values.trigger.value.trim() === ""
              ? undefined
              : values.trigger.value.trim(),
        },
        schedule: {
          startAt: values.schedule.startAt || undefined,
          endAt: values.schedule.endAt || undefined,
        },
      };

      if (isEdit && experience?._id) {
        await api.patch(`/experiences/admin/${experience._id}`, payload);
        toast.success("Experience updated successfully");
      } else {
        await api.post("/experiences/admin", payload);
        toast.success("Experience created successfully");
      }

      setOpen(false);
      onSaved();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
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
            <Badge variant="outline" className="rounded-full">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Experience Builder
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {isEdit ? "Edit Mode" : "Create Mode"}
            </Badge>
          </div>

          <DialogTitle className="mt-3 text-2xl font-bold">
            {isEdit ? "Edit Experience" : "Create Experience"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure the experience, choose where it appears, and save without
            redeploying.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Basics</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={values.key}
                  onChange={(e) => setField("key", e.target.value as any)}
                  placeholder="global_waitlist"
                />
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value as any)}
                  placeholder="Global Waitlist"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={values.type}
                  onValueChange={(value) => setField("type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_TYPE_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Component</Label>
                <Select
                  value={values.componentKey}
                  onValueChange={(value) =>
                    setField("componentKey", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPONENT_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={values.priority}
                  onChange={(e) =>
                    setField("priority", Number(e.target.value) as any)
                  }
                />
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 flex items-center justify-between">
                <div>
                  <Label>Enabled</Label>
                  <p className="text-xs text-muted-foreground">
                    Turn this experience on or off.
                  </p>
                </div>
                <Switch
                  checked={values.enabled}
                  onCheckedChange={(checked) =>
                    setField("enabled", checked as any)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Route className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Targeting</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target scope</Label>
                <Select
                  value={values.target.scope}
                  onValueChange={(value) =>
                    setValues((prev) => ({
                      ...prev,
                      target: {
                        ...prev.target,
                        scope: value as "global" | "routes",
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="routes">Specific Routes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#D4A017]" />
                  <p className="font-medium">Route rules</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add one route per line. You can also paste comma-separated
                  routes.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>Routes</Label>
                <Textarea
                  value={values.target.routes.join("\n")}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      target: {
                        ...prev.target,
                        routes: e.target.value.split("\n"),
                      },
                    }))
                  }
                  placeholder={routeExamples.routes}
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>Excluded Routes</Label>
                <Textarea
                  value={values.target.excludeRoutes.join("\n")}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      target: {
                        ...prev.target,
                        excludeRoutes: e.target.value.split("\n"),
                      },
                    }))
                  }
                  placeholder={routeExamples.excludeRoutes}
                  className="min-h-32"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <TimerReset className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Trigger & schedule</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Trigger type</Label>
                <Select
                  value={values.trigger.type}
                  onValueChange={(value) =>
                    setValues((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, type: value as any },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPE_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trigger value</Label>
                <Input
                  value={values.trigger.value}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      trigger: { ...prev.trigger, value: e.target.value },
                    }))
                  }
                  placeholder="5000 for timer, 50 for scroll"
                />
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-[#D4A017]" />
                  <p className="font-medium">Schedule</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Leave both fields empty to keep it always active when enabled.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start at</Label>
                <Input
                  type="datetime-local"
                  value={values.schedule.startAt}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, startAt: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>End at</Label>
                <Input
                  type="datetime-local"
                  value={values.schedule.endAt}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, endAt: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Content</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={values.payload.title}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      payload: { ...prev.payload, title: e.target.value },
                    }))
                  }
                  placeholder="We are launching soon"
                />
              </div>

              <div className="space-y-2">
                <Label>Button text</Label>
                <Input
                  value={values.payload.buttonText}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      payload: { ...prev.payload, buttonText: e.target.value },
                    }))
                  }
                  placeholder="Join the waitlist"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Message</Label>
                <Textarea
                  value={values.payload.message}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      payload: { ...prev.payload, message: e.target.value },
                    }))
                  }
                  placeholder="We are currently under maintenance..."
                  className="min-h-28"
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
