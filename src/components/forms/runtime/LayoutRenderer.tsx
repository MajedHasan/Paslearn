"use client";

import React from "react";
import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";
import { LayoutBlock } from "@/types/forms/shared/layout.types";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import FieldRenderer from "./FieldRenderer";
import { FieldState } from "./FormRenderer";

interface Props {
  blocks: LayoutBlock[];
  fields: FieldDefinition[];
  fieldStates: Record<string, FieldState>;
  register: UseFormRegister<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
  control: Control<Record<string, any>>;
  forceMobile?: boolean;   // <-- NEW
  onFileChange?: (fieldName: string, files: FileList | null) => void;
}

function renderBlock(
  block: LayoutBlock,
  fields: FieldDefinition[],
  fieldStates: Record<string, FieldState>,
  register: UseFormRegister<Record<string, any>>,
  errors: FieldErrors<Record<string, any>>,
  control: Control<Record<string, any>>,
  forceMobile: boolean,   // <-- NEW parameter
  onFileChange?: (fieldName: string, files: FileList | null) => void
): React.ReactNode {
  if (block.type === "section") {
    return (
      <section key={block.id} className="space-y-4 sm:space-y-6">
        {block.props?.title && (
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {block.props.title}
            </h2>
            {block.props?.description && (
              <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                {block.props.description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4 sm:space-y-6">
          {block.children?.map((child) =>
            renderBlock(child, fields, fieldStates, register, errors, control, forceMobile, onFileChange)
          )}
        </div>
      </section>
    );
  }

  if (block.type === "row") {
    const cols = block.props?.columns || 2;
    // If forceMobile is true, always single column; otherwise use responsive grid.
    const gridClass = forceMobile
      ? "grid-cols-1"
      : cols === 1
      ? "grid-cols-1"
      : cols === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : cols === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2";   // default 2 columns

    return (
      <div key={block.id} className={`grid gap-3 sm:gap-4 ${gridClass}`}>
        {block.children?.map((child) =>
          renderBlock(child, fields, fieldStates, register, errors, control, forceMobile, onFileChange)
        )}
      </div>
    );
  }

  if (block.type === "column") {
    return (
      <div key={block.id} className="space-y-3 sm:space-y-4">
        {block.children?.map((child) =>
          renderBlock(child, fields, fieldStates, register, errors, control, forceMobile, onFileChange)
        )}
      </div>
    );
  }

  if (block.type === "heading") {
    return (
      <h3 key={block.id} className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
        {block.content}
      </h3>
    );
  }

  if (block.type === "text") {
    return (
      <p key={block.id} className="text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600">
        {block.content}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <div key={block.id} className="flex justify-center">
        <img
          src={block.props?.src || ""}
          alt={block.props?.alt || ""}
          className="rounded-xl max-w-full h-auto"
        />
      </div>
    );
  }

  if (block.type === "divider") {
    return <hr key={block.id} className="border-slate-200 my-4 sm:my-6" />;
  }

  if (block.type === "spacer") {
    const height = block.props?.height || 24;
    // In mobile mode (or forced), spacer is visible; otherwise hidden on small screens.
    return (
      <div
        key={block.id}
        style={{ height: Math.min(height, 48) }}
        className={forceMobile ? "" : "hidden sm:block"}
      />
    );
  }

  if (block.type === "field") {
    const field = fields.find((f) => f.key === block.fieldKey);
    if (!field) return null;
    const fieldState = fieldStates[block.fieldKey as any] ?? { visible: true, enabled: true };
    return (
      <FieldRenderer
        key={block.id}
        field={field}
        register={register}
        errors={errors}
        control={control}
        fieldState={fieldState}
        forceMobile={forceMobile}   // <-- pass to FieldRenderer
        onFileChange={onFileChange}
      />
    );
  }

  if (block.type === "button") {
    const variant = block.props?.variant || "primary";
    const isSecondary = variant === "secondary";
    return (
      <button
        key={block.id}
        type={block.props?.action === "button" ? "button" : "submit"}
        disabled={block.props?.disabled}
        className={`h-10 sm:h-12 ${
          forceMobile ? "w-full" : "w-full sm:w-auto"
        } rounded-2xl px-5 text-sm font-semibold transition ${
          isSecondary
            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "bg-[#D4A017] text-white hover:bg-[#bf910f]"
        }`}
      >
        {block.props?.text || "Continue"}
      </button>
    );
  }

  return null;
}

export default function LayoutRenderer({
  blocks,
  fields,
  fieldStates,
  register,
  errors,
  control,
  forceMobile = false,
  onFileChange,
}: Props) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {blocks.map((block) =>
        renderBlock(block, fields, fieldStates, register, errors, control, forceMobile, onFileChange)
      )}
    </div>
  );
}