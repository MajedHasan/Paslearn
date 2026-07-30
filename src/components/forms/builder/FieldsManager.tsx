"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Type,
  Mail,
  Phone,
  AlignLeft,
  List,
  Circle,
  CheckSquare,
  Hash,
  Calendar,
  Clock,
  Link,
  Lock,
  EyeOff,
  ListChecks,
  File,
  Star,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldDefinition, FieldType } from "@/types/forms/shared/field.types";

interface Props {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
  onUpdateLayout: (layout: any[]) => void;
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; icon: React.ReactNode }
> = {
  text: { label: "Text", icon: <Type className="h-4 w-4" /> },
  email: { label: "Email", icon: <Mail className="h-4 w-4" /> },
  tel: { label: "Telephone", icon: <Phone className="h-4 w-4" /> },
  textarea: { label: "Textarea", icon: <AlignLeft className="h-4 w-4" /> },
  select: { label: "Select", icon: <List className="h-4 w-4" /> },
  radio: { label: "Radio", icon: <Circle className="h-4 w-4" /> },
  checkbox: { label: "Checkbox", icon: <CheckSquare className="h-4 w-4" /> },
  number: { label: "Number", icon: <Hash className="h-4 w-4" /> },
  date: { label: "Date", icon: <Calendar className="h-4 w-4" /> },
  time: { label: "Time", icon: <Clock className="h-4 w-4" /> },
  url: { label: "URL", icon: <Link className="h-4 w-4" /> },
  password: { label: "Password", icon: <Lock className="h-4 w-4" /> },
  hidden: { label: "Hidden", icon: <EyeOff className="h-4 w-4" /> },
  multiselect: { label: "Multiselect", icon: <ListChecks className="h-4 w-4" /> },
  file: { label: "File", icon: <File className="h-4 w-4" /> },
  rating: { label: "Rating", icon: <Star className="h-4 w-4" /> },
  date_range: { label: "Date Range", icon: <CalendarRange className="h-4 w-4" /> },
};

export default function FieldsManager({ fields, onChange, onUpdateLayout }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<Record<number, boolean>>({});

  const addField = () => {
    const newField: FieldDefinition = {
      key: `field_${createId()}`,
      name: `field_${createId()}`,
      label: "New Field",
      type: "text",
      width: "full",
    };
    onChange([...fields, newField]);
    setExpandedIndex(fields.length); // expand the new field
  };

  const updateField = (index: number, patch: Partial<FieldDefinition>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    if (expandedIndex === index) setExpandedIndex(newIndex);
    else if (expandedIndex === newIndex) setExpandedIndex(index);
  };

  const toggleAdvanced = (index: number) => {
    setShowAdvanced((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Fields</h2>
        <Button onClick={addField} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-2xl bg-slate-50/50">
            <Type className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
                {`No fields yet. Click "Add Field" to start building your form.`}
            </p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const isExpanded = expandedIndex === index;
          const typeMeta = FIELD_TYPE_META[field.type] || FIELD_TYPE_META.text;

          return (
            <div
              key={field.key}
              className={`rounded-2xl border transition-all duration-200 ${
                isExpanded ? "bg-white shadow-md border-amber-200" : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Header (always visible) */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{typeMeta.icon}</span>
                    <span className="font-semibold text-sm truncate">
                      {field.label || "Untitled"}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {typeMeta.label}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {field.validation?.required && (
                    <Badge variant="outline" className="text-xs text-red-500 border-red-200">
                      Required
                    </Badge>
                  )}
                  {field.hidden && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                      Hidden
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, "up");
                    }}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, "down");
                    }}
                    disabled={index === fields.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2">
                  {/* Label & Type */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Field label"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(v) => updateField(index, { type: v as FieldType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FIELD_TYPE_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                {meta.icon} {meta.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Placeholder & Help Text */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Help Text</Label>
                      <Input
                        value={field.helpText || ""}
                        onChange={(e) => updateField(index, { helpText: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Width & Switches */}
                  <div className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Select
                        value={field.width || "full"}
                        onValueChange={(v) => updateField(index, { width: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full</SelectItem>
                          <SelectItem value="half">Half</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                          <SelectItem value="quarter">Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={field.hidden || false}
                        onCheckedChange={(checked) => updateField(index, { hidden: checked })}
                      />
                      <Label>Hidden</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={field.validation?.required || false}
                        onCheckedChange={(checked) =>
                          updateField(index, {
                            validation: { ...field.validation, required: checked },
                          })
                        }
                      />
                      <Label>Required</Label>
                    </div>
                  </div>

                  {/* Options for select/radio/multiselect */}
                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "multiselect") && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <Textarea
                        value={
                          field.options
                            ?.map((o) => `${o.label}|${o.value}`)
                            .join("\n") || ""
                        }
                        onChange={(e) => {
                          const lines = e.target.value.split("\n");
                          const opts = lines
                            .map((line) => {
                              const [label, value] = line.split("|").map((s) => s.trim());
                              return { label: label || value, value: value || label };
                            })
                            .filter((o) => o.label);
                          updateField(index, { options: opts });
                        }}
                        placeholder="Label|value"
                        className="min-h-24"
                      />
                      <p className="text-xs text-muted-foreground">
                        One per line. Format: <code>Label|value</code>
                      </p>
                    </div>
                  )}

                  {/* Advanced section (key & name) */}
                  <div className="border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => toggleAdvanced(index)}
                    >
                      {showAdvanced[index] ? "Hide Advanced" : "Advanced"}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                    {showAdvanced[index] && (
                      <div className="mt-2 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Key (unique identifier)
                          </Label>
                          <Input
                            value={field.key}
                            onChange={(e) => updateField(index, { key: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Name (field name attribute)
                          </Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}