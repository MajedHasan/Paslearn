"use client";

import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { buildDefaultValues } from "@/types/forms/shared/submission.utils";
import { IForm } from "@/types/forms/shared/form.interface";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import { LayoutBlock } from "@/types/forms/shared/layout.types";
import LayoutRenderer from "./LayoutRenderer";
import SuccessState from "./SuccessState";
import ErrorState from "./ErrorState";

interface Props {
  form: IForm;
  embedded?: boolean;
  previewMode?: boolean;
  onSubmitted?: (submission: any) => void;
  customSubmit?: (values: Record<string, any>) => Promise<void>;
}

export default function FormRenderer({
  form,
  embedded,
  previewMode = false,
  onSubmitted,
  customSubmit,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Multi‑step state
  const [stepIndex, setStepIndex] = useState(0);
  const isMultiStep = Boolean(form.steps?.length);
  const currentStep = isMultiStep ? form.steps![stepIndex] : undefined;
  const currentLayout = currentStep ? currentStep.layout : form.layout;

  // Form status
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // File state (for file upload fields)
  const [fileData, setFileData] = useState<Record<string, File[]>>({});

  // Default values
  const defaultValues = useMemo(
    () => buildDefaultValues(form.fields ?? []),
    [form.fields]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<Record<string, any>>({
    defaultValues,
    mode: "onTouched",
  });

  const watchedValues = watch();

  // ---------- Conditional logic ----------
  const getVisibleFields = useCallback((): FieldDefinition[] => {
    if (!form.conditions?.length) return form.fields ?? [];

    return form.fields.filter((field) => {
      const rule = form.conditions?.find((r) => r.fieldKey === field.key);
      if (!rule) return true;

      const meetsCondition = (cond: any): boolean => {
        const value = watchedValues[cond.fieldKey];
        if (value === undefined) return false;

        switch (cond.operator) {
          case "equals":          return value == cond.value;
          case "not_equals":      return value != cond.value;
          case "contains":        return String(value).includes(String(cond.value));
          case "greater_than":    return Number(value) > Number(cond.value);
          case "less_than":       return Number(value) < Number(cond.value);
          case "is_empty":        return value === "" || value === null || value === undefined;
          case "is_not_empty":    return value !== "" && value !== null && value !== undefined;
          default:                return true;
        }
      };

      const result =
        rule.logicalOperator === "OR"
          ? rule.conditions.some(meetsCondition)
          : rule.conditions.every(meetsCondition);

      return rule.action === "show" ? result : !result;
    });
  }, [form.conditions, form.fields, watchedValues]);

  const visibleFields = getVisibleFields();

  // File handling
  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (!files) return;
    setFileData((prev) => ({
      ...prev,
      [fieldName]: Array.from(files),
    }));
  };

  // ---------- Submit ----------
  const onSubmit = async (values: Record<string, any>) => {
    setState("submitting");

    if (previewMode) {
      setTimeout(() => {
        setState("success");
        setMessage(
          form.submitAction?.message ||
            form.meta?.successMessage ||
            "Preview submitted successfully."
        );
        reset(defaultValues);
      }, 800);
      return;
    }

    if (customSubmit) {
      try {
        await customSubmit(values);
        setState("success");
        setMessage(form.submitAction?.message || form.meta?.successMessage || "Submitted successfully.");
        reset(defaultValues);
      } catch (err: any) {
        setState("error");
        setMessage(err?.message || "Submission failed.");
      }
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "_honeypot") {
          formData.append(key, value as string);
        }
      });
      Object.entries(fileData).forEach(([fieldName, files]) => {
        files.forEach((file) => formData.append(fieldName, file));
      });

      const meta = {
        pathname,
        url: window.location.href,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent,
        language: navigator.language,
      };
      formData.append("meta", JSON.stringify(meta));

      const res = await api.post(`/submissions/public/${form.key}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSubmitted?.(res.data?.data);

      const action = form.submitAction ?? {
        type: "message",
        message: "Submitted successfully.",
        delayMs: 0,
      };
      setMessage(action.message || form.meta?.successMessage || "Submitted successfully.");
      setState("success");

      if (action.type === "redirect" || action.type === "message_then_redirect") {
        const delay = action.delayMs ?? 1200;
        setTimeout(() => {
          if (action.redirectTo) router.push(action.redirectTo);
        }, delay);
      }

      reset(defaultValues);
      setFileData({});
      setStepIndex(0);
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Submission failed."
        : "Submission failed.";
      setMessage(msg);
      setState("error");
    }
  };

  // Step navigation
  const nextStep = () =>
    setStepIndex((prev) => Math.min(prev + 1, (form.steps?.length || 1) - 1));
  const prevStep = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  // Render states
  if (state === "success") {
    return (
      <SuccessState
        title={form.meta?.successTitle || "Success!"}
        message={message}
      />
    );
  }

  if (state === "error") {
    return (
      <ErrorState
        title="Submission failed"
        message={message}
        onRetry={() => {
          setState("idle");
          setMessage("");
        }}
      />
    );
  }

  // Determine layout to use
  const layoutToRender = currentLayout && currentLayout.length > 0 ? currentLayout : null;

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 p-4 sm:p-8"
      }
    >
      <div className={embedded ? "" : "mx-auto max-w-4xl"}>
        <div className="rounded-[2.5rem] border bg-white p-6 sm:p-10 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          {/* Header */}
          <div className="mb-8 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {form.name || "Form"}
          </div>
          {form.description && (
            <p className="mb-6 text-sm leading-7 text-slate-600">{form.description}</p>
          )}

          {/* Progress bar */}
          {isMultiStep && form.showProgressBar !== false && (
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium mb-2">
                {form.steps!.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStepIndex(i)}
                    className={`transition-colors ${
                      i <= stepIndex ? "text-amber-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${((stepIndex + 1) / (form.steps?.length || 1)) * 100}%`,
                  }}
                />
              </div>
              {currentStep?.description && (
                <p className="mt-2 text-sm text-muted-foreground">{currentStep.description}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Layout rendering – always pass all visible fields */}
            {layoutToRender ? (
              <LayoutRenderer
                blocks={layoutToRender}
                fields={visibleFields}
                register={register}
                errors={errors}
                onFileChange={handleFileChange}
              />
            ) : (
              // Fallback: render all visible fields individually
              visibleFields.map((field) => (
                <LayoutRenderer
                  key={field.key}
                  blocks={[{ id: `fb-${field.key}`, type: "field", fieldKey: field.key }]}
                  fields={[field]}
                  register={register}
                  errors={errors}
                  onFileChange={handleFileChange}
                />
              ))
            )}

            {/* Honeypot */}
            {form.spamProtection?.enabled && form.spamProtection.type === "honeypot" && (
              <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                <input type="text" tabIndex={-1} autoComplete="off" {...register("_honeypot")} />
              </div>
            )}

            {/* reCAPTCHA placeholder */}
            {form.spamProtection?.enabled && form.spamProtection.type.startsWith("recaptcha") && (
              <div className="text-sm text-muted-foreground">
                reCAPTCHA widget would render here (site key: {form.spamProtection.siteKey})
              </div>
            )}

            {/* Navigation / Submit */}
            <div className="pt-4">
              {isMultiStep && (
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={stepIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {stepIndex < (form.steps?.length || 0) - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        form.meta?.submitButtonText || "Submit"
                      )}
                    </Button>
                  )}
                </div>
              )}
              {!isMultiStep && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    form.meta?.submitButtonText || "Submit"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}