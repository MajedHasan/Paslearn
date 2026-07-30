"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { PageTemplate, PageTemplateFormValues } from "@/types/theme/pageTemplate";

type Props = {
  template?: PageTemplate | null;
  onSaved: () => void;
  triggerLabel?: string;
};

const emptyForm: PageTemplateFormValues = {
  name: "",
  type: "home",
  content: "{}",
  isDefault: false,
};

export default function PageTemplateDialog({ template, onSaved, triggerLabel = "Add Template" }: Props) {
  const isEdit = !!template;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<PageTemplateFormValues>(emptyForm);
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (open) {
      if (template) {
        setValues({
          name: template.name,
          type: template.type,
          content: JSON.stringify(template.content, null, 2),
          isDefault: template.isDefault,
        });
      } else {
        setValues(emptyForm);
      }
    }
  }, [open, template]);

  const handleContentChange = (text: string) => {
    setValues({ ...values, content: text });
    try {
      JSON.parse(text);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const handleSubmit = async () => {
    if (jsonError) {
      toast.error("Please fix JSON errors before saving");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...values,
        content: JSON.parse(values.content),
      };
      if (isEdit && template) {
        await api.patch(`/page-templates/${template._id}`, payload);
        toast.success("Template updated");
      } else {
        await api.post("/page-templates", payload);
        toast.success("Template created");
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
          <DialogTitle>{isEdit ? "Edit Page Template" : "Create Page Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={values.type} onValueChange={(v) => setValues({ ...values, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="lead_magnet">Lead Magnet</SelectItem>
                  <SelectItem value="thank_you">Thank You</SelectItem>
                  <SelectItem value="funnel_step">Funnel Step</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Content (JSON)</Label>
            <Textarea
              value={values.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="font-mono text-xs min-h-60"
              placeholder='{"sections":[]}'
            />
            {jsonError && <p className="text-red-500 text-xs">{jsonError}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Label>Default</Label>
            <Switch
              checked={values.isDefault}
              onCheckedChange={(checked) => setValues({ ...values, isDefault: checked })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}