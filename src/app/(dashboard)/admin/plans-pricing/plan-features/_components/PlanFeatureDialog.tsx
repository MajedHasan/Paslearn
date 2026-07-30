"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import { PlanFeature, PlanFeatureFormValues } from "@/types/plan/planFeature";

type Props = {
  feature?: PlanFeature | null;
  onSaved: () => void;
  triggerLabel?: string;
};

const emptyValues: PlanFeatureFormValues = {
  key: "",
  label: "",
  description: "",
  type: "boolean",
  defaultValue: false,
  unit: "",
  icon: "",
  isActive: true,
};

export default function PlanFeatureDialog({
  feature,
  onSaved,
  triggerLabel = "Add Feature",
}: Props) {
  const isEdit = !!feature;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<PlanFeatureFormValues>(emptyValues);

  useEffect(() => {
    if (open) {
      if (feature) {
        setValues({
          key: feature.key,
          label: feature.label,
          description: feature.description || "",
          type: feature.type,
          defaultValue: feature.defaultValue,
          unit: feature.unit || "",
          icon: feature.icon || "",
          isActive: feature.isActive,
        });
      } else {
        setValues(emptyValues);
      }
    }
  }, [open, feature]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (isEdit && feature?._id) {
        await api.patch(`/plan-features/${feature._id}`, values);
        toast.success("Feature updated");
      } else {
        await api.post("/plan-features", values);
        toast.success("Feature created");
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Feature" : "Create Feature"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={values.key}
                onChange={(e) => setValues({ ...values, key: e.target.value })}
                placeholder="ai_credits"
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={values.label}
                onChange={(e) => setValues({ ...values, label: e.target.value })}
                placeholder="AI Credits"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={values.description}
              onChange={(e) => setValues({ ...values, description: e.target.value })}
              placeholder="Monthly AI credit allowance"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={values.type}
                onValueChange={(val) =>
                  setValues({
                    ...values,
                    type: val as PlanFeatureFormValues["type"],
                    // reset default value on type change
                    defaultValue: val === "boolean" ? false : val === "number" ? 0 : "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Value</Label>
              {values.type === "boolean" ? (
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={values.defaultValue as boolean}
                    onCheckedChange={(checked) =>
                      setValues({ ...values, defaultValue: checked })
                    }
                  />
                  <span className="text-sm">{(values.defaultValue as boolean) ? "True" : "False"}</span>
                </div>
              ) : values.type === "number" ? (
                <Input
                  type="number"
                  value={values.defaultValue as number}
                  onChange={(e) =>
                    setValues({ ...values, defaultValue: Number(e.target.value) })
                  }
                />
              ) : (
                <Input
                  value={values.defaultValue as string}
                  onChange={(e) =>
                    setValues({ ...values, defaultValue: e.target.value })
                  }
                  placeholder="e.g. Unlimited"
                />
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Unit (optional)</Label>
              <Input
                value={values.unit}
                onChange={(e) => setValues({ ...values, unit: e.target.value })}
                placeholder="credits/month"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (optional)</Label>
              <Input
                value={values.icon}
                onChange={(e) => setValues({ ...values, icon: e.target.value })}
                placeholder="Sparkles"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Active</Label>
            <Switch
              checked={values.isActive}
              onCheckedChange={(checked) => setValues({ ...values, isActive: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90"
            onClick={handleSubmit}
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