"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Play,
  Pause,
  Copy,
  Filter,
  Sparkles,
  Equal,
  EqualNot,
  Slash,
  ArrowRight,
  ArrowLeft,
  Minus,
  ChevronDown,
  ChevronUp,
  Wand2,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConditionalRule, ConditionalCondition } from "@/types/forms/shared/form.interface";
import { FieldDefinition } from "@/types/forms/shared/field.types";

interface Props {
  conditions: ConditionalRule[];
  fields: FieldDefinition[];
  onChange: (conditions: ConditionalRule[]) => void;
}

/* ---------- meta maps ---------- */
const ACTION_META = {
  show:   { label: "Show",   icon: Eye,     color: "text-emerald-600", bg: "bg-emerald-50",   border: "border-emerald-500" },
  hide:   { label: "Hide",   icon: EyeOff,  color: "text-rose-600",    bg: "bg-rose-50",      border: "border-rose-500" },
  enable: { label: "Enable", icon: Play,    color: "text-blue-600",    bg: "bg-blue-50",      border: "border-blue-500" },
  disable:{ label: "Disable",icon: Pause,   color: "text-slate-600",   bg: "bg-slate-50",     border: "border-slate-400" },
};

const OPERATOR_META: Record<string, { label: string; icon: React.ReactNode; needsValue: boolean; example: string }> = {
  equals:         { label: "equals",           icon: <Equal className="h-3.5 w-3.5" />,       needsValue: true,  example: "'yes'" },
  not_equals:     { label: "not equals",       icon: <EqualNot className="h-3.5 w-3.5" />,    needsValue: true,  example: "'no'" },
  contains:       { label: "contains",         icon: <Slash className="h-3.5 w-3.5" />,       needsValue: true,  example: "'text'" },
  greater_than:   { label: "greater than",     icon: <ArrowRight className="h-3.5 w-3.5" />,  needsValue: true,  example: "5" },
  less_than:      { label: "less than",        icon: <ArrowLeft className="h-3.5 w-3.5" />,   needsValue: true,  example: "10" },
  is_empty:       { label: "is empty",         icon: <Minus className="h-3.5 w-3.5" />,       needsValue: false, example: "" },
  is_not_empty:   { label: "is not empty",     icon: <Slash className="h-3.5 w-3.5" />,       needsValue: false, example: "" },
};

export default function ConditionsBuilder({ conditions, fields, onChange }: Props) {
  const [openRules, setOpenRules] = useState<Set<number>>(new Set());

  const toggleOpen = (idx: number) => {
    setOpenRules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const addRule = () => {
    const newRule: ConditionalRule = {
      fieldKey: fields[0]?.key || "",
      conditions: [{ fieldKey: fields[0]?.key || "", operator: "equals", value: "" }],
      action: "show",
      logicalOperator: "AND",
    };
    onChange([...conditions, newRule]);
    setOpenRules((prev) => new Set(prev).add(conditions.length));
  };

  const duplicateRule = (index: number) => {
    const original = conditions[index];
    const copy: ConditionalRule = {
      ...original,
      conditions: original.conditions.map((c) => ({ ...c })),
    };
    const updated = [...conditions];
    updated.splice(index + 1, 0, copy);
    onChange(updated);
  };

  const updateRule = (index: number, patch: Partial<ConditionalRule>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeRule = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const addCondition = (ruleIndex: number) => {
    const rule = conditions[ruleIndex];
    const newConds = [...rule.conditions, { fieldKey: fields[0]?.key || "", operator: "equals", value: "" } as ConditionalCondition];
    updateRule(ruleIndex, { conditions: newConds });
  };

  const updateCondition = (ruleIndex: number, condIndex: number, patch: Partial<ConditionalCondition>) => {
    const updated = [...conditions];
    updated[ruleIndex].conditions[condIndex] = { ...updated[ruleIndex].conditions[condIndex], ...patch };
    onChange(updated);
  };

  const removeCondition = (ruleIndex: number, condIndex: number) => {
    const updated = [...conditions];
    updated[ruleIndex].conditions = updated[ruleIndex].conditions.filter((_, i) => i !== condIndex);
    onChange(updated);
  };

  // Generate natural‑language summary for a rule
  const ruleSummary = (rule: ConditionalRule): string => {
    const targetField = fields.find((f) => f.key === rule.fieldKey)?.label || rule.fieldKey;
    const condTexts = rule.conditions.map((cond) => {
      const field = fields.find((f) => f.key === cond.fieldKey)?.label || cond.fieldKey;
      const op = OPERATOR_META[cond.operator]?.label || cond.operator;
      if (!OPERATOR_META[cond.operator]?.needsValue) {
        return `${field} ${op}`;
      }
      return `${field} ${op} "${cond.value}"`;
    });
    const logic = rule.logicalOperator === "AND" ? " and " : " or ";
    const actionText = ACTION_META[rule.action]?.label || rule.action;
    return `If ${condTexts.join(logic)} → ${actionText} ${targetField}`;
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Filter className="h-5 w-5 text-amber-500" />
            Conditional Logic
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define dynamic behaviour – show/hide/enable/disable fields based on user input.
          </p>
        </div>
        <Button onClick={addRule} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {conditions.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30">
          <Wand2 className="h-10 w-10 mx-auto mb-3 text-amber-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No rules yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Create smart rules like <em>{`"If newsletter checkbox is checked, show the email field"`}</em>.
          </p>
          <Button onClick={addRule} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Create your first rule
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {conditions.map((rule, idx) => {
          const actionMeta = ACTION_META[rule.action] || ACTION_META.show;
          const ActionIcon = actionMeta.icon;
          const isOpen = openRules.has(idx);

          return (
            <div
              key={idx}
              className={`rounded-2xl border-2 ${actionMeta.border} bg-white shadow-sm transition-all duration-200 hover:shadow-lg`}
            >
              {/* Collapsible trigger */}
              <Collapsible
                open={isOpen}
                onOpenChange={() => toggleOpen(idx)}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <div className={`flex items-center justify-between px-5 py-4 cursor-pointer ${actionMeta.bg} rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs font-mono bg-white">
                        Rule {idx + 1}
                      </Badge>
                      <span className="text-sm font-medium text-slate-700 truncate max-w-md">
                        {ruleSummary(rule)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); duplicateRule(idx); }}
                        title="Duplicate rule"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeRule(idx); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="px-5 pb-5 space-y-4">
                  {/* Logical operator & condition list */}
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">If</span>
                      <div className="flex items-center rounded-lg border bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => updateRule(idx, { logicalOperator: "AND" })}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            rule.logicalOperator === "AND"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          ALL
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRule(idx, { logicalOperator: "OR" })}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            rule.logicalOperator === "OR"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          ANY
                        </button>
                      </div>
                      <span className="text-sm">conditions are true</span>
                    </div>

                    {/* Condition rows */}
                    <div className="ml-4 space-y-2">
                      {rule.conditions.map((cond, cIdx) => {
                        const opMeta = OPERATOR_META[cond.operator] || OPERATOR_META.equals;
                        return (
                          <div key={cIdx} className="flex items-center gap-2 flex-wrap">
                            <Select
                              value={cond.fieldKey}
                              onValueChange={(v) => updateCondition(idx, cIdx, { fieldKey: v })}
                            >
                              <SelectTrigger className="h-9 w-44 text-xs">
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {fields.map((f) => (
                                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={cond.operator}
                              onValueChange={(v) =>
                                updateCondition(idx, cIdx, {
                                  operator: v as ConditionalCondition["operator"],
                                  value: opMeta.needsValue ? cond.value : "",
                                })
                              }
                            >
                              <SelectTrigger className="h-9 w-40 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(OPERATOR_META).map(([key, meta]) => (
                                  <SelectItem key={key} value={key}>
                                    <span className="flex items-center gap-2">
                                      {meta.icon} {meta.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {opMeta.needsValue ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      value={cond.value as string}
                                      onChange={(e) => updateCondition(idx, cIdx, { value: e.target.value })}
                                      className="h-9 flex-1 min-w-[140px] text-xs"
                                      placeholder={opMeta.example}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Example: {opMeta.example}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="h-9 flex-1" />
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeCondition(idx, cIdx)}
                              disabled={rule.conditions.length <= 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}

                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs"
                        onClick={() => addCondition(idx)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add condition
                      </Button>
                    </div>

                    {/* Action line */}
                    <div className="ml-4 flex items-center gap-2 text-sm">
                      <span className="font-medium">Then</span>
                      <Select
                        value={rule.action}
                        onValueChange={(v) =>
                          updateRule(idx, { action: v as ConditionalRule["action"] })
                        }
                      >
                        <SelectTrigger className="h-9 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ACTION_META).map(([key, meta]) => {
                            const Icon = meta.icon;
                            return (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <Icon className="h-3 w-3" /> {meta.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <span>field</span>
                      <Select
                        value={rule.fieldKey}
                        onValueChange={(v) => updateRule(idx, { fieldKey: v })}
                      >
                        <SelectTrigger className="h-9 w-44 text-xs">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((f) => (
                            <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}