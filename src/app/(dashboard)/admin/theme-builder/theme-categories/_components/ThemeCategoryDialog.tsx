"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { ThemeCategory, ThemeCategoryFormValues } from "@/types/theme/themeCategory";

type Props = {
  category?: ThemeCategory | null;
  onSaved: () => void;
  triggerLabel?: string;
};

const emptyForm: ThemeCategoryFormValues = { name: "", slug: "" };

export default function ThemeCategoryDialog({ category, onSaved, triggerLabel = "Add Category" }: Props) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ThemeCategoryFormValues>(emptyForm);

  useEffect(() => {
    if (open) {
      setValues(category ? { name: category.name, slug: category.slug } : emptyForm);
    }
  }, [open, category]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (isEdit && category) {
        await api.patch(`/theme-categories/${category._id}`, values);
        toast.success("Category updated");
      } else {
        await api.post("/theme-categories", values);
        toast.success("Category created");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={values.slug} onChange={(e) => setValues({ ...values, slug: e.target.value })} />
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