"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { AIAssistant } from "@/types/forms/shared/form.interface";

interface Props {
  config: AIAssistant;
  onChange: (config: AIAssistant) => void;
}

export default function AIAssistantPanel({ config, onChange }: Props) {
  const [newSuggestion, setNewSuggestion] = useState("");

  const addSuggestion = () => {
    const trimmed = newSuggestion.trim();
    if (trimmed) {
      onChange({
        ...config,
        suggestions: [...(config.suggestions || []), trimmed],
      });
      setNewSuggestion("");
    }
  };

  const removeSuggestion = (index: number) => {
    const updated = [...(config.suggestions || [])];
    updated.splice(index, 1);
    onChange({ ...config, suggestions: updated });
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">AI Assistant</h2>

      <div className="flex items-center gap-4 mb-6">
        <Switch
          id="ai-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => onChange({ ...config, enabled: checked })}
        />
        <Label htmlFor="ai-enabled">Enable AI assistant</Label>
      </div>

      {config.enabled && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Model</Label>
            <Input
              value={config.model || ""}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              placeholder="gpt-4o-mini"
            />
          </div>

          <div className="space-y-2">
            <Label>Pre‑defined suggestions</Label>
            <div className="flex gap-2">
              <Input
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSuggestion()}
                placeholder="e.g. Help with this field..."
              />
              <Button variant="outline" size="icon" onClick={addSuggestion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(config.suggestions || []).map((suggestion, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                  {suggestion}
                  <button
                    onClick={() => removeSuggestion(idx)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}