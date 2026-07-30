"use client";

import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import { getValidationRules } from "@/types/forms/shared/validation.utils";
import { Star } from "lucide-react";

interface Props {
  field: FieldDefinition;
  register: UseFormRegister<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
  onFileChange?: (fieldName: string, files: FileList | null) => void;
}

export default function FieldRenderer({
  field,
  register,
  errors,
  onFileChange,
}: Props) {
  const error = errors?.[field.name]?.message as string | undefined;
  const rules = getValidationRules(field);
  const required = field.validation?.required;

  if (field.hidden) {
    return <input type="hidden" {...register(field.name, rules)} />;
  }

  const baseInputClass =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-500";

  // ---------- File field ----------
  if (field.type === "file") {
    const maxFiles = field.validation?.maxFiles;
    const accept = field.validation?.allowedTypes?.join(",");
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          {field.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.helpText && (
          <p className="text-xs leading-5 text-slate-500">{field.helpText}</p>
        )}
        <input
          type="file"
          accept={accept}
          multiple={maxFiles && maxFiles > 1 as any}
          onChange={(e) => onFileChange?.(field.name, e.target.files)}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Date range field ----------
  if (field.type === "date_range") {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          {field.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.helpText && (
          <p className="text-xs leading-5 text-slate-500">{field.helpText}</p>
        )}
        <div className="flex gap-3">
          <input
            type="date"
            {...register(`${field.name}_start`, rules)}
            placeholder="Start"
            className={`${baseInputClass} flex-1`}
          />
          <input
            type="date"
            {...register(`${field.name}_end`, rules)}
            placeholder="End"
            className={`${baseInputClass} flex-1`}
          />
        </div>
        {(errors[`${field.name}_start`] || errors[`${field.name}_end`]) && (
          <p className="text-sm text-red-600">
            {(errors[`${field.name}_start`]?.message as string) ||
              (errors[`${field.name}_end`]?.message as string) ||
              "Invalid date range"}
          </p>
        )}
      </div>
    );
  }

  // ---------- Rating field ----------
  if (field.type === "rating") {
    const maxStars = field.validation?.max || 5;
    const starValues = Array.from({ length: maxStars }, (_, i) => i + 1);
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          {field.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.helpText && (
          <p className="text-xs leading-5 text-slate-500">{field.helpText}</p>
        )}
        <div className="flex gap-1">
          {starValues.map((value) => (
            <label
              key={value}
              className="cursor-pointer"
            >
              <input
                type="radio"
                value={value}
                {...register(field.name, rules)}
                className="sr-only peer"
              />
              <Star
                className="w-8 h-8 transition-colors text-slate-300 peer-checked:text-amber-400 hover:text-amber-400"
                fill="currentColor"
              />
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // ---------- Standard fields ----------
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {field.label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.helpText && (
        <p className="text-xs leading-5 text-slate-500">{field.helpText}</p>
      )}

      {field.type === "textarea" ? (
        <textarea
          {...register(field.name, rules)}
          placeholder={field.placeholder}
          className={`${baseInputClass} min-h-28 py-3`}
        />
      ) : field.type === "select" ? (
        <select {...register(field.name, rules)} className={baseInputClass}>
          <option value="">Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="space-y-3">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <input
                type="radio"
                value={opt.value}
                {...register(field.name, rules)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register(field.name, rules)} />
          <span>{field.placeholder || field.label}</span>
        </label>
      ) : field.type === "multiselect" ? (
        <select
          multiple
          {...register(field.name, rules)}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register(field.name, rules)}
          type={field.type === "number" ? "number" : field.type}
          placeholder={field.placeholder}
          className={baseInputClass}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}