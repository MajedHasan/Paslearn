"use client";

import React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { LayoutBlock } from "@/types/forms/shared/layout.types";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import FieldRenderer from "./FieldRenderer";

interface Props {
  blocks: LayoutBlock[];
  fields: FieldDefinition[];
  register: UseFormRegister<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
  onFileChange?: (fieldName: string, files: FileList | null) => void;
}

function renderBlock(
  block: LayoutBlock,
  fields: FieldDefinition[],
  register: UseFormRegister<Record<string, any>>,
  errors: FieldErrors<Record<string, any>>,
  onFileChange?: (fieldName: string, files: FileList | null) => void
): React.ReactNode {
  if (block.type === "section") {
    return (
      <section key={block.id} className="space-y-6">
        {block.props?.title && (
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {block.props.title}
            </h2>
            {block.props?.description && (
              <p className="text-sm leading-6 text-slate-600">
                {block.props.description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-6">
          {block.children?.map((child) =>
            renderBlock(child, fields, register, errors, onFileChange)
          )}
        </div>
      </section>
    );
  }

  if (block.type === "row") {
    const cols = block.props?.columns || 2;
    return (
      <div
        key={block.id}
        className={`grid gap-4 ${
          cols === 1
            ? "grid-cols-1"
            : cols === 3
            ? "grid-cols-1 md:grid-cols-3"
            : cols === 4
            ? "grid-cols-1 md:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {block.children?.map((child) =>
          renderBlock(child, fields, register, errors, onFileChange)
        )}
      </div>
    );
  }

  if (block.type === "column") {
    return (
      <div key={block.id} className="space-y-4">
        {block.children?.map((child) =>
          renderBlock(child, fields, register, errors, onFileChange)
        )}
      </div>
    );
  }

  if (block.type === "heading") {
    return (
      <h3 key={block.id} className="text-xl font-bold tracking-tight text-slate-900">
        {block.content}
      </h3>
    );
  }

  if (block.type === "text") {
    return (
      <p key={block.id} className="text-sm leading-7 text-slate-600">
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
    return <hr key={block.id} className="border-slate-200" />;
  }

  if (block.type === "spacer") {
    return <div key={block.id} style={{ height: block.props?.height || 24 }} />;
  }

  if (block.type === "field") {
    const field = fields.find((f) => f.key === block.fieldKey);
    if (!field) return null;

    return (
      <FieldRenderer
        key={block.id}
        field={field}
        register={register}
        errors={errors}
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
        className={`h-12 rounded-2xl px-5 text-sm font-semibold transition ${
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
  register,
  errors,
  onFileChange,
}: Props) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block) => renderBlock(block, fields, register, errors, onFileChange))}
    </div>
  );
}