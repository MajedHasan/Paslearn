"use client";

import React, { useMemo } from "react";
import { Smartphone, Monitor, Eye, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilderDraft } from "@/types/forms/shared/builder.types";
import FormRenderer from "@/components/forms/runtime/FormRenderer"; // adjust import path

// Helper to create a default layout from fields (same as the builder's auto‑generate)
function generateDefaultLayout(
  fields: FormBuilderDraft["fields"]
): FormBuilderDraft["layout"] {
  if (!fields.length) return [];
  return [
    {
      id: `preview-root`,
      type: "section",
      props: { title: "Form", description: "" },
      children: fields.map((field) => ({
        id: `preview-field-${field.key}`,
        type: "field",
        fieldKey: field.key,
      })),
    },
  ];
}

interface Props {
  draft: FormBuilderDraft;
}

export default function FormPreview({ draft }: Props) {
  // Use existing layout if present, otherwise generate a simple one so fields are visible
  const effectiveLayout = useMemo(() => {
    if (draft.layout && draft.layout.length > 0) return draft.layout;
    return generateDefaultLayout(draft.fields);
  }, [draft.layout, draft.fields]);

  // Build the resource that FormRenderer expects, with the effective layout
  const formResource = useMemo(() => ({
    key: draft.key,
    name: draft.name,
    description: draft.description,
    fields: draft.fields,
    layout: effectiveLayout,
    steps: draft.steps,
    showProgressBar: draft.showProgressBar,
    conditions: draft.conditions,
    submitAction: draft.submitAction,
    meta: draft.meta,
    spamProtection: draft.spamProtection,
    notifications: draft.notifications,
    webhooks: draft.webhooks,
    aiAssistant: draft.aiAssistant,
    tags: draft.tags,
    version: draft.version,
    isTemplate: draft.isTemplate,
  }), [draft, effectiveLayout]);

  // If there are no fields at all, show a helpful placeholder
  if (!draft.fields.length) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Live Preview</h2>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <LayoutGrid className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-lg font-medium">No fields added yet</p>
          <p className="text-sm">
            Switch to the <strong>Fields</strong> tab to add fields and see a live preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-amber-500" />
        Live Preview
      </h2>

      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop">
          <div className="border rounded-2xl overflow-hidden shadow-xl bg-gray-50">
            <div className="bg-white border-b px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {draft.name || "Form Preview"}
              </span>
            </div>
            <div className="p-4 h-[600px] overflow-y-auto bg-white">
              <FormRenderer
                form={formResource as any}
                embedded
                previewMode  // ← disables real submission
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mobile">
          <div className="flex justify-center">
            <div className="w-[375px] max-w-full border-[8px] border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl bg-white">
              <div className="h-6 bg-gray-800 flex items-center justify-center">
                <div className="w-16 h-1.5 rounded-full bg-gray-600" />
              </div>
              <div className="h-[650px] overflow-y-auto p-3">
                <FormRenderer
                  form={formResource as any}
                  embedded
                  previewMode
                />
              </div>
              <div className="h-8 bg-gray-800 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-gray-600" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}