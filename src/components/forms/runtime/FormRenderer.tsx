"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, Bot, X, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { buildDefaultValues } from "@/types/forms/shared/submission.utils";
import { IForm } from "@/types/forms/shared/form.interface";
import LayoutRenderer from "./LayoutRenderer";
import SuccessState from "./SuccessState";
import ErrorState from "./ErrorState";

// Declare global grecaptcha to avoid TypeScript errors
declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export type FieldState = {
  visible: boolean;
  enabled: boolean;
};

interface Props {
  form: IForm;
  embedded?: boolean;
  previewMode?: boolean;
  forceMobile?: boolean;
  onSubmitted?: (submission: any) => void;
  customSubmit?: (values: Record<string, any>) => Promise<void>;
}

export default function FormRenderer({
  form,
  embedded,
  previewMode = false,
  forceMobile = false,
  onSubmitted,
  customSubmit,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // ---------- multi‑step ----------
  const [stepIndex, setStepIndex] = useState(0);
  const isMultiStep = Boolean(form.steps?.length);
  const currentStep = isMultiStep ? form.steps![stepIndex] : undefined;

  // ---------- layout logic ----------
  const stepLayout = currentStep?.layout;
  const globalLayout = form.layout;
  const effectiveLayout =
    isMultiStep
      ? stepLayout && stepLayout.length > 0
        ? stepLayout
        : globalLayout && globalLayout.length > 0
        ? globalLayout
        : null
      : globalLayout && globalLayout.length > 0
      ? globalLayout
      : null;

  // ---------- form state ----------
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fileData, setFileData] = useState<Record<string, File[]>>({});

  // ---------- reCAPTCHA state ----------
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  // ---------- AI Assistant state ----------
  const [showAiChat, setShowAiChat] = useState(false);

  // ---------- default values ----------
  const defaultValues = useMemo(
    () => buildDefaultValues(form.fields ?? []),
    [form.fields]
  );

  // ---------- key → name map for conditions ----------
  const fieldKeyToNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    (form.fields ?? []).forEach((f) => {
      map[f.key] = f.name;
    });
    return map;
  }, [form.fields]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<Record<string, any>>({
    defaultValues,
    mode: "onTouched",
  });

  const watchedValues = watch();

  // ---------- conditional field states ----------
  const fieldStates = useMemo(() => {
    const states: Record<string, FieldState> = {};
    (form.fields ?? []).forEach((f) => {
      states[f.key] = { visible: true, enabled: true };
    });

    if (!form.conditions?.length) return states;

    for (const rule of form.conditions) {
      const evaluate = (cond: any): boolean => {
        const fieldName = fieldKeyToNameMap[cond.fieldKey];
        if (!fieldName) return false;
        const value = watchedValues[fieldName];
        if (value === undefined) return false;

        switch (cond.operator) {
          case "equals":
            return value == cond.value;
          case "not_equals":
            return value != cond.value;
          case "contains":
            return Array.isArray(value)
              ? value.includes(cond.value)
              : String(value).includes(String(cond.value));
          case "greater_than":
            return Number(value) > Number(cond.value);
          case "less_than":
            return Number(value) < Number(cond.value);
          case "is_empty":
            return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
          case "is_not_empty":
            return !(value === "" || value === null || value === undefined) && (!Array.isArray(value) || value.length > 0);
          default:
            return true;
        }
      };

      const conditionMet =
        rule.logicalOperator === "OR"
          ? rule.conditions.some(evaluate)
          : rule.conditions.every(evaluate);

      if (rule.action === "show" || rule.action === "hide") {
        states[rule.fieldKey].visible = rule.action === "show" ? conditionMet : !conditionMet;
      } else if (rule.action === "enable" || rule.action === "disable") {
        states[rule.fieldKey].enabled = rule.action === "enable" ? conditionMet : !conditionMet;
      }
    }

    return states;
  }, [form.conditions, form.fields, watchedValues, fieldKeyToNameMap]);

  // ---------- file handling ----------
  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (!files) return;
    setFileData((prev) => ({
      ...prev,
      [fieldName]: Array.from(files),
    }));
  };

  // ---------- reCAPTCHA setup effect ----------
  useEffect(() => {
    // Do nothing if spam protection is disabled, not recaptcha, or in preview mode
    if (!form.spamProtection?.enabled || !form.spamProtection.type.startsWith("recaptcha") || previewMode) return;

    const siteKey = form.spamProtection.siteKey;
    if (!siteKey) return;

    // Load the Google reCAPTCHA script if not already loaded
    const scriptId = "recaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Global callback called by the reCAPTCHA script when it loads
    window.onRecaptchaLoad = () => {
      if (recaptchaRef.current && window.grecaptcha) {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            setRecaptchaToken(token);
          },
          "expired-callback": () => {
            setRecaptchaToken(null);
          },
        });
      }
    };

    // If the script is already loaded (e.g. hot reload), render immediately
    if (window.grecaptcha && recaptchaRef.current && recaptchaWidgetId.current === null) {
      recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setRecaptchaToken(token);
        },
        "expired-callback": () => {
          setRecaptchaToken(null);
        },
      });
    }

    return () => {
      // Cleanup: reset the widget
      if (recaptchaWidgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      }
    };
  }, [form.spamProtection, previewMode]);

  // ---------- form submission ----------
  const onSubmit = async (values: Record<string, any>) => {
    setState("submitting");

    // Preview mode – simulate success without API call
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

    // Custom submit handler (e.g., payment integration)
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

    // reCAPTCHA verification – if enabled and no token, block submission
    if (form.spamProtection?.enabled && form.spamProtection.type.startsWith("recaptcha") && !recaptchaToken) {
      setState("error");
      setMessage("Please complete the reCAPTCHA verification.");
      return;
    }

    // Live submission via API
    try {
      const fd = new FormData();

      // Append regular form values
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "_honeypot") {
          fd.append(key, value as string);
        }
      });

      // Append uploaded files
      Object.entries(fileData).forEach(([fieldName, files]) => {
        files.forEach((file) => fd.append(fieldName, file));
      });

      // Append metadata
      const meta = {
        pathname,
        url: window.location.href,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent,
        language: navigator.language,
      };
      fd.append("meta", JSON.stringify(meta));

      // Append reCAPTCHA token if present
      if (recaptchaToken) {
        fd.append("g-recaptcha-response", recaptchaToken);
      }

      const res = await api.post(`/submissions/public/${form.key}`, fd, {
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
        setTimeout(() => {
          if (action.redirectTo) router.push(action.redirectTo);
        }, action.delayMs ?? 1200);
      }

      // Reset form
      reset(defaultValues);
      setFileData({});
      setRecaptchaToken(null);
      // Reset reCAPTCHA widget if present
      if (recaptchaWidgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      }
      setStepIndex(0);
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Submission failed."
        : "Submission failed.";
      setMessage(msg);
      setState("error");
    }
  };

  // ---------- step navigation ----------
  const nextStep = () => setStepIndex((prev) => Math.min(prev + 1, (form.steps?.length || 1) - 1));
  const prevStep = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  // ---------- main form render ----------
  return (
    <div
      className={
        embedded || forceMobile
          ? "w-full"
          : "min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      }
    >
      <div className={embedded || forceMobile ? "" : "mx-auto max-w-4xl"}>
        <div className="rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border bg-white p-5 sm:p-8 lg:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:shadow-[0_20px_70px_rgba(15,23,42,0.08)] relative">
          {/* ---------- header ---------- */}
          <div className="mb-6 sm:mb-8 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
            {form.name || "Form"}
          </div>
          {form.description && (
            <p className="mb-5 sm:mb-6 text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
              {form.description}
            </p>
          )}

          {/* ---------- progress bar ---------- */}
          {isMultiStep && form.showProgressBar !== false && (
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between text-xs sm:text-sm font-medium mb-2 overflow-x-auto whitespace-nowrap gap-1 sm:gap-0">
                {form.steps!.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStepIndex(i)}
                    className={`transition-colors px-1 sm:px-0 ${
                      i <= stepIndex ? "text-amber-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              <div className="w-full bg-slate-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${((stepIndex + 1) / (form.steps?.length || 1)) * 100}%`,
                  }}
                />
              </div>
              {currentStep?.description && (
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              )}
            </div>
          )}

          {/* ---------- form content (dimmed when popup active) ---------- */}
          <div className={state === "success" || state === "error" ? "opacity-30 pointer-events-none" : ""}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              {/* Layout rendering with intelligent fallback */}
              {effectiveLayout ? (
                <LayoutRenderer
                  blocks={effectiveLayout}
                  fields={form.fields}
                  fieldStates={fieldStates}
                  register={register}
                  errors={errors}
                  control={control}
                  forceMobile={forceMobile}
                  onFileChange={handleFileChange}
                />
              ) : isMultiStep ? (
                <div className="text-center py-10 sm:py-12 text-muted-foreground border border-dashed rounded-2xl text-sm">
                  <p className="font-medium">No layout defined.</p>
                  <p className="text-xs sm:text-sm">
                    Assign fields to this step or create a global layout.
                  </p>
                </div>
              ) : (
                // Fallback: render all fields without layout (non‑multi‑step only)
                form.fields.map((field) => (
                  <LayoutRenderer
                    key={field.key}
                    blocks={[{ id: `fb-${field.key}`, type: "field", fieldKey: field.key }]}
                    fields={[field]}
                    fieldStates={fieldStates}
                    register={register}
                    errors={errors}
                    control={control}
                    forceMobile={forceMobile}
                    onFileChange={handleFileChange}
                  />
                ))
              )}

              {/* ---------- honeypot ---------- */}
              {form.spamProtection?.enabled && form.spamProtection.type === "honeypot" && (
                <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                  <input type="text" tabIndex={-1} autoComplete="off" {...register("_honeypot")} />
                </div>
              )}

              {/* ---------- reCAPTCHA widget ---------- */}
              {form.spamProtection?.enabled && form.spamProtection.type.startsWith("recaptcha") && !previewMode && (
                <div className="flex justify-center my-4">
                  <div ref={recaptchaRef}></div>
                </div>
              )}

              {/* ---------- submit buttons ---------- */}
              <div className="pt-4">
                {isMultiStep && (
                  <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={stepIndex === 0}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    {stepIndex < (form.steps?.length || 0) - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 w-full sm:w-auto"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 w-full sm:w-auto"
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
                    className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 py-3 sm:py-2.5"
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

          {/* ---------- success / error popup overlay ---------- */}
          {(state === "success" || state === "error") && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem]">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-2 duration-300">
                {state === "success" ? (
                  <SuccessState
                    title={form.meta?.successTitle || "Success!"}
                    message={message}
                  />
                ) : (
                  <ErrorState
                    title="Submission failed"
                    message={message}
                    onRetry={() => {
                      setState("idle");
                      setMessage("");
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- AI Assistant floating button & chat panel ---------- */}
      {form.aiAssistant?.enabled && !previewMode && (
        <>
          {/* Floating action button */}
          <button
            type="button"
            onClick={() => setShowAiChat(!showAiChat)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="AI Assistant"
          >
            {showAiChat ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </button>

          {/* Chat panel */}
          {showAiChat && (
            <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border p-4">
              {/* Chat header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">AI Assistant</h4>
                    <p className="text-xs text-muted-foreground">Powered by {form.aiAssistant.model || "AI"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiChat(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Chat description */}
              <p className="text-xs text-muted-foreground mb-3">
                Ask any question about this form or get help filling it out.
              </p>

              {/* Suggested prompts (if any) */}
              {(form.aiAssistant.suggestions || []).length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.aiAssistant.suggestions!.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left text-xs p-2 rounded-lg border hover:bg-amber-50 hover:border-amber-200 transition"
                      onClick={() => {
                        // Future: send suggestion to AI backend
                        console.log("Suggestion clicked:", suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <div className="flex gap-2">
                <input
                  className="flex-1 h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ask anything..."
                />
                <Button size="sm" className="h-9">
                  Ask
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}