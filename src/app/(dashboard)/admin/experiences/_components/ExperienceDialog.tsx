"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
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

export default function ExperienceDialog({
  experience,
  onSaved,
  triggerLabel = "Create Experience",
}: Props) {
  const isEdit = !!experience;

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
        startAt: experience.schedule?.startAt
          ? String(experience.schedule.startAt).slice(0, 16)
          : "",
        endAt: experience.schedule?.endAt
          ? String(experience.schedule.endAt).slice(0, 16)
          : "",
      },
      payload: {
        title: experience.payload?.title ?? "",
        message: experience.payload?.message ?? "",
        buttonText: experience.payload?.buttonText ?? "",
      },
    };
  }, [experience]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ExperienceFormValues>(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  const update = <K extends keyof ExperienceFormValues>(
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
          ...values.target,
          routes: values.target.routes.filter(Boolean),
          excludeRoutes: values.target.excludeRoutes.filter(Boolean),
        },
        trigger: {
          type: values.trigger.type,
          value: values.trigger.value === "" ? undefined : values.trigger.value,
        },
        schedule: {
          startAt: values.schedule.startAt || undefined,
          endAt: values.schedule.endAt || undefined,
        },
        payload: values.payload,
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
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Experience" : "Create Experience"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Key</Label>
            <Input
              value={values.key}
              onChange={(e) => update("key", e.target.value as any)}
              placeholder="global_waitlist"
            />
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={values.name}
              onChange={(e) => update("name", e.target.value as any)}
              placeholder="Global Waitlist"
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={values.type}
              onValueChange={(value) => update("type", value as any)}
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
              onValueChange={(value) => update("componentKey", value as any)}
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
                update("priority", Number(e.target.value) as any)
              }
            />
          </div>

          <div className="space-y-2 flex items-center justify-between rounded-md border p-3 mt-6">
            <div>
              <Label>Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Turn this experience on or off.
              </p>
            </div>
            <Switch
              checked={values.enabled}
              onCheckedChange={(checked) => update("enabled", checked as any)}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Scope</Label>
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
                <SelectItem value="routes">Routes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trigger Type</Label>
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
            <Label>Trigger Value</Label>
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

          <div className="space-y-2">
            <Label>Start At</Label>
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
            <Label>End At</Label>
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

          <div className="space-y-2 md:col-span-2">
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
              placeholder="/pricing&#10;/dashboard"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
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
              placeholder="/admin&#10;/api"
            />
          </div>

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
            <Label>Button Text</Label>
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
            />
          </div>
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
