"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, FileText, AlertCircle } from "lucide-react";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { FormBuilderDraft } from "@/types/forms/shared/builder.types";
import { IForm } from "@/types/forms/shared/form.interface";

export default function EditFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<IForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/forms/admin/${params.id}`);
        setForm(res.data?.data ?? null);
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to load form";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadForm();
  }, [params.id]);

  const handleSave = async (payload: FormBuilderDraft) => {
    setSaving(true);
    try {
      await api.patch(`/forms/admin/${params.id}`, payload);
      toast.success("Form updated successfully");
      router.push("/admin/forms");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
      throw err; // let FormBuilder handle error state if needed
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/forms")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="bg-white rounded-[2.5rem] border shadow-sm p-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Form not found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "The form you are looking for does not exist."}
            </p>
            <Button
              onClick={() => router.push("/admin/forms")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
            >
              Back to Forms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Edit form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                Edit Mode
              </Badge>
              <Badge variant="outline" className="rounded-full">
                <FileText className="h-3.5 w-3.5 mr-1" />
                {form.key}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Edit: {form.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(form.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Builder */}
        <div className="bg-white rounded-[2.5rem] border shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 sm:p-10">
          <FormBuilder
            initialValue={form as any}
            onSave={handleSave}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}