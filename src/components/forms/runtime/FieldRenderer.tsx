"use client";

import React from "react";
import { useWatch, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import { getValidationRules } from "@/types/forms/shared/validation.utils";
import { Star } from "lucide-react";
import { FieldState } from "./FormRenderer"; // adjust import if you place the type elsewhere

interface Props {
  field: FieldDefinition;
  register: UseFormRegister<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
  control: Control<Record<string, any>>;
  fieldState?: FieldState;
  forceMobile?: boolean;   // NEW
  onFileChange?: (fieldName: string, files: FileList | null) => void;
}

export default function FieldRenderer({
  field,
  register,
  errors,
  control,
  fieldState,
  forceMobile = false,   // NEW
  onFileChange,
}: Props) {
  const error = errors?.[field.name]?.message as string | undefined;
  const rules = getValidationRules(field);
  const required = field.validation?.required;

  const watchedValue = useWatch({ name: field.name, control });

  const visible = fieldState?.visible ?? true;
  const enabled = fieldState?.enabled ?? true;

  if (field.hidden) {
    return <input type="hidden" {...register(field.name, rules)} />;
  }

  // Responsive base classes – when forceMobile is true, only mobile classes are used.
  const baseInputClass = forceMobile
    ? "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-500"
    : "h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 text-sm sm:text-base text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-500";

  const disabledClass = !enabled ? "opacity-50 pointer-events-none" : "";
  const visibilityClass = !visible ? "invisible" : "";

  // Other option detection
  const otherOption = field.options?.find(
    (opt) => opt.label.toLowerCase() === "other"
  );
  const showOtherInput =
    otherOption &&
    (Array.isArray(watchedValue)
      ? watchedValue.includes(otherOption.value)
      : watchedValue === otherOption.value);

  // ---------- File ----------
  if (field.type === "file") {
    const accept = field.validation?.allowedTypes?.join(",");
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <input
          type="file"
          accept={accept}
          multiple={field.validation?.maxFiles ? field.validation.maxFiles > 1 : false}
          disabled={!enabled}
          onChange={(e) => onFileChange?.(field.name, e.target.files)}
          className="block w-full text-xs sm:text-sm text-slate-500 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
        />
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Date Range ----------
  if (field.type === "date_range") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="date"
            disabled={!enabled}
            {...register(`${field.name}_start`, rules)}
            className={`${baseInputClass} flex-1`}
          />
          <input
            type="date"
            disabled={!enabled}
            {...register(`${field.name}_end`, rules)}
            className={`${baseInputClass} flex-1`}
          />
        </div>
        {(errors[`${field.name}_start`] || errors[`${field.name}_end`]) && (
          <p className="text-xs sm:text-sm text-red-600">
            {(errors[`${field.name}_start`]?.message as string) ||
              (errors[`${field.name}_end`]?.message as string) ||
              "Invalid date range"}
          </p>
        )}
      </div>
    );
  }

  // ---------- Rating ----------
  if (field.type === "rating") {
    const maxStars = field.validation?.max || 5;
    const selectedValue = watchedValue ? Number(watchedValue) : 0;
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <div className="flex gap-1.5 sm:gap-2">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                value={value}
                disabled={!enabled}
                {...register(field.name, rules)}
                className="sr-only peer"
              />
              <Star
                className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
                  value <= selectedValue
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300 fill-transparent hover:text-amber-300"
                }`}
              />
            </label>
          ))}
        </div>
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Multiselect ----------
  if (field.type === "multiselect") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <div className="space-y-1.5 sm:space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                value={opt.value}
                disabled={!enabled}
                {...register(field.name, rules)}
                className="h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {showOtherInput && (
          <input
            type="text"
            placeholder="Please specify"
            disabled={!enabled}
            className={baseInputClass}
            {...register(`${field.name}_other`)}
          />
        )}
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Textarea ----------
  if (field.type === "textarea") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <textarea
          {...register(field.name, rules)}
          placeholder={field.placeholder}
          disabled={!enabled}
          className={`${baseInputClass} min-h-24 sm:min-h-28 py-2 sm:py-3`}
        />
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Select ----------
  if (field.type === "select") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <select {...register(field.name, rules)} disabled={!enabled} className={baseInputClass}>
          <option value="">Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {showOtherInput && (
          <input
            type="text"
            placeholder="Please specify"
            disabled={!enabled}
            className={baseInputClass}
            {...register(`${field.name}_other`)}
          />
        )}
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Radio ----------
  if (field.type === "radio") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="block text-xs sm:text-sm font-semibold text-slate-700">
          {field.label} {required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
        <div className="space-y-2 sm:space-y-3">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <input
                type="radio"
                value={opt.value}
                disabled={!enabled}
                {...register(field.name, rules)}
                className="h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {showOtherInput && (
          <input
            type="text"
            placeholder="Please specify"
            disabled={!enabled}
            className={baseInputClass}
            {...register(`${field.name}_other`)}
          />
        )}
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Checkbox ----------
  if (field.type === "checkbox") {
    return (
      <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
        <label className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
          <input type="checkbox" disabled={!enabled} {...register(field.name, rules)} className="h-4 w-4" />
          <span>{field.placeholder || field.label}</span>
        </label>
        {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- All other inputs ----------
  return (
    <div className={`space-y-1.5 sm:space-y-2 ${visibilityClass} ${disabledClass}`}>
      <label className="block text-xs sm:text-sm font-semibold text-slate-700">
        {field.label} {required && <span className="text-red-500">*</span>}
      </label>
      {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
      <input
        {...register(field.name, rules)}
        type={field.type === "number" ? "number" : field.type}
        placeholder={field.placeholder}
        disabled={!enabled}
        className={baseInputClass}
      />
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}