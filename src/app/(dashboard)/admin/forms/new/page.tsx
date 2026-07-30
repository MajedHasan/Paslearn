"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { FormBuilderDraft } from "@/types/forms/shared/builder.types";

export default function NewFormPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload: FormBuilderDraft) => {
    setSaving(true);
    try {
      const res = await api.post("/forms/admin", payload);
      const id = res.data?.data?._id;
      toast.success("Form created successfully!");
      if (id) {
        router.push(`/admin/forms`);   // or to the edit page if you prefer
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create form");
      throw err;   // rethrow so FormBuilder can show error state if needed
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/forms")}
            className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="rounded-full gap-1 border-amber-200 text-amber-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Form Builder
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Create Mode
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Create New Form
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Design every aspect of your form – fields, logic, styling, and more.
            </p>
          </div>
        </div>

        {/* Builder */}
        <div className="bg-white rounded-[2.5rem] border shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 sm:p-10">
          <FormBuilder onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}