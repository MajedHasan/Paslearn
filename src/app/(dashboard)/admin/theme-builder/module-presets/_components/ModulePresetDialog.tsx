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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { ModulePreset, ModulePresetFormValues } from "@/types/theme/modulePreset";

type Props = {
  preset?: ModulePreset | null;
  onSaved: () => void;
  triggerLabel?: string;
};

const emptyForm: ModulePresetFormValues = {
  type: "form",
  key: "",
  label: "",
  config: "{}",
};

export default function ModulePresetDialog({
  preset,
  onSaved,
  triggerLabel = "Add Preset",
}: Props) {
  const isEdit = !!preset;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ModulePresetFormValues>(emptyForm);
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (open) {
      if (preset) {
        setValues({
          type: preset.type,
          key: preset.key,
          label: preset.label,
          config: JSON.stringify(preset.config, null, 2),
        });
      } else {
        setValues(emptyForm);
      }
      setJsonError("");
    }
  }, [open, preset]);

  const handleConfigChange = (text: string) => {
    setValues({ ...values, config: text });
    try {
      if (text.trim()) JSON.parse(text);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const handleSubmit = async () => {
    if (jsonError) {
      toast.error("Please fix JSON errors");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        type: values.type,
        key: values.key,
        label: values.label,
        config: JSON.parse(values.config || "{}"),
      };
      if (isEdit && preset) {
        await api.patch(`/module-presets/${preset._id}`, payload);
        toast.success("Preset updated");
      } else {
        await api.post("/module-presets", payload);
        toast.success("Preset created");
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Module Preset" : "Create Module Preset"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Define a reusable module that can be attached to themes.
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={values.type}
                onValueChange={(v) =>
                  setValues({ ...values, type: v as ModulePresetFormValues["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                  <SelectItem value="tracking">Tracking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={values.key}
                onChange={(e) => setValues({ ...values, key: e.target.value })}
                placeholder="contact_form"
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={values.label}
                onChange={(e) => setValues({ ...values, label: e.target.value })}
                placeholder="Contact Form"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Config (JSON)</Label>
            <Textarea
              value={values.config}
              onChange={(e) => handleConfigChange(e.target.value)}
              className="font-mono text-xs min-h-48"
              placeholder='{"fields":[]}'
            />
            {jsonError && (
              <p className="text-red-500 text-xs">{jsonError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90"
            onClick={handleSubmit}
            disabled={loading || !!jsonError}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}