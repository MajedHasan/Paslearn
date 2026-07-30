"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { ConditionalRule } from "@/types/forms/shared/form.interface";
import { FieldDefinition } from "@/types/forms/shared/field.types";

interface Props {
  conditions: ConditionalRule[];
  fields: FieldDefinition[];
  onChange: (conditions: ConditionalRule[]) => void;
}

export default function ConditionsBuilder({ conditions, fields, onChange }: Props) {
  const addRule = () => {
    onChange([
      ...conditions,
      {
        fieldKey: fields[0]?.key || "",
        conditions: [{ fieldKey: fields[0]?.key || "", operator: "equals", value: "" }],
        action: "show",
        logicalOperator: "AND",
      },
    ]);
  };

  const updateRule = (index: number, rule: ConditionalRule) => {
    const updated = [...conditions];
    updated[index] = rule;
    onChange(updated);
  };

  const removeRule = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Conditional Logic</h2>
        <Button onClick={addRule} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {conditions.map((rule, idx) => (
          <div key={idx} className="rounded-xl border p-4 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <Badge>Rule {idx + 1}</Badge>
              <Select
                value={rule.fieldKey}
                onValueChange={(value) => updateRule(idx, { ...rule, fieldKey: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={rule.action}
                onValueChange={(value) => updateRule(idx, { ...rule, action: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">Show</SelectItem>
                  <SelectItem value="hide">Hide</SelectItem>
                  <SelectItem value="enable">Enable</SelectItem>
                  <SelectItem value="disable">Disable</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => removeRule(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {rule.conditions.map((cond, cIdx) => (
              <div key={cIdx} className="flex gap-2 items-center mt-2">
                <Select
                  value={cond.fieldKey}
                  onValueChange={(value) => {
                    const newConds = [...rule.conditions];
                    newConds[cIdx] = { ...newConds[cIdx], fieldKey: value };
                    updateRule(idx, { ...rule, conditions: newConds });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={cond.operator}
                  onValueChange={(value) => {
                    const newConds = [...rule.conditions];
                    newConds[cIdx] = { ...newConds[cIdx], operator: value as any };
                    updateRule(idx, { ...rule, conditions: newConds });
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">{">"}</SelectItem>
                    <SelectItem value="less_than">{"<"}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={cond.value as string}
                  onChange={(e) => {
                    const newConds = [...rule.conditions];
                    newConds[cIdx] = { ...newConds[cIdx], value: e.target.value };
                    updateRule(idx, { ...rule, conditions: newConds });
                  }}
                  className="flex-1"
                  placeholder="Value"
                />
                {rule.conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newConds = rule.conditions.filter((_, i) => i !== cIdx);
                      updateRule(idx, { ...rule, conditions: newConds });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                updateRule(idx, {
                  ...rule,
                  conditions: [
                    ...rule.conditions,
                    { fieldKey: fields[0]?.key || "", operator: "equals", value: "" },
                  ],
                });
              }}
            >
              + Add condition
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}