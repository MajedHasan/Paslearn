"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Layers,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { FormStep } from "@/types/forms/shared/form.interface";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import { LayoutBlock } from "@/types/forms/shared/layout.types";

interface Props {
  steps: FormStep[];
  fields: FieldDefinition[];
  showProgressBar: boolean;
  onChange: (steps: FormStep[]) => void;
  onToggleProgressBar: (checked: boolean) => void;
}

export default function MultiStepBuilder({
  steps,
  fields,
  showProgressBar,
  onChange,
  onToggleProgressBar,
}: Props) {
  const addStep = () => {
    onChange([
      ...steps,
      {
        title: `Step ${steps.length + 1}`,
        description: "",
        layout: [],
      },
    ]);
  };

  const updateStep = (index: number, patch: Partial<FormStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  // Add a field to a step's layout
  const addFieldToStep = (stepIndex: number, fieldKey: string) => {
    const step = steps[stepIndex];
    const alreadyAssigned = step.layout.some(
      (block) => block.type === "field" && block.fieldKey === fieldKey
    );
    if (alreadyAssigned) return;

    const newBlock: LayoutBlock = { id: `s${stepIndex}-${fieldKey}`, type: "field", fieldKey };
    const updatedLayout = [...step.layout, newBlock];
    updateStep(stepIndex, { layout: updatedLayout });
  };

  // Remove a field from a step's layout
  const removeFieldFromStep = (stepIndex: number, blockId: string) => {
    const step = steps[stepIndex];
    const updatedLayout = step.layout.filter((block) => block.id !== blockId);
    updateStep(stepIndex, { layout: updatedLayout });
  };

  // Fields already assigned to any step
  const assignedFieldKeys = new Set(
    steps.flatMap((step) =>
      step.layout
        .filter((block) => block.type === "field")
        .map((block) => block.fieldKey)
    )
  );

  const unassignedFields = fields.filter((f) => !assignedFieldKeys.has(f.key));

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-500" />
          Multi‑Step Wizard
        </h2>
        <Button onClick={addStep} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* Progress bar toggle */}
      <div className="flex items-center gap-4">
        <Switch
          id="show-progress"
          checked={showProgressBar}
          onCheckedChange={onToggleProgressBar}
        />
        <Label htmlFor="show-progress">Show progress bar</Label>
      </div>

      {/* Unassigned fields warning */}
      {unassignedFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">
              Unassigned Fields
            </p>
            <p className="text-xs text-amber-700">
              {`The following fields aren't added to any step yet:`}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {unassignedFields.map((f) => (
                <Badge key={f.key} variant="outline" className="text-xs">
                  {f.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Steps list */}
      {steps.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
          <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No steps added yet. Click “Add Step” to start building a wizard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-2xl border bg-slate-50/50 p-5 shadow-sm relative"
            >
              {/* Step header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(idx, { title: e.target.value })}
                    className="h-9 text-sm font-semibold border-transparent bg-transparent focus:border-input focus:bg-white w-48"
                    placeholder="Step title"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(idx, "up")}
                    disabled={idx === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep(idx, "down")}
                    disabled={idx === steps.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={step.description || ""}
                  onChange={(e) => updateStep(idx, { description: e.target.value })}
                  placeholder="Brief instruction for this step"
                  className="h-16 text-xs"
                />
              </div>

              {/* Assigned fields */}
              <div className="space-y-2">
                <Label className="text-xs">Fields in this step</Label>
                {step.layout.filter((b) => b.type === "field").length === 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    No fields assigned yet.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {step.layout
                    .filter((block) => block.type === "field")
                    .map((block) => {
                      const field = fields.find((f) => f.key === block.fieldKey);
                      return (
                        <Badge
                          key={block.id}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {field?.label || block.fieldKey}
                          <button
                            onClick={() => removeFieldFromStep(idx, block.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                </div>
              </div>

              {/* Add field dropdown */}
              <div className="mt-3 flex gap-2">
                <Select
                  onValueChange={(value) => {
                    if (value === "__none__") return;
                    addFieldToStep(idx, value);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-48">
                    <SelectValue placeholder="+ Add field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" disabled>
                      Select a field
                    </SelectItem>
                    {fields.map((field) => (
                      <SelectItem
                        key={field.key}
                        value={field.key}
                        disabled={
                          step.layout.some(
                            (b) =>
                              b.type === "field" && b.fieldKey === field.key
                          )
                        }
                      >
                        {field.label}
                        {step.layout.some(
                          (b) =>
                            b.type === "field" && b.fieldKey === field.key
                        ) && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {unassignedFields.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      // assign all unassigned fields to this step
                      const updatedLayout = [...step.layout];
                      for (const f of unassignedFields) {
                        if (
                          !updatedLayout.some(
                            (b) => b.type === "field" && b.fieldKey === f.key
                          )
                        ) {
                          updatedLayout.push({
                            id: `s${idx}-${f.key}`,
                            type: "field",
                            fieldKey: f.key,
                          });
                        }
                      }
                      updateStep(idx, { layout: updatedLayout });
                    }}
                    className="text-xs"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Add all unassigned
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}