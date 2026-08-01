"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Sparkles,
  X,
  Plus,
  Zap,
  BrainCircuit,
  MessageSquare,
  Lightbulb,
  Wand2,
} from "lucide-react";
import { AIAssistant } from "@/types/forms/shared/form.interface";

interface Props {
  config: AIAssistant;
  onChange: (config: AIAssistant) => void;
}

const MODELS = [
  {
    value: "gpt-4o-mini",
    label: "GPT‑4o mini",
    description: "Fast & affordable, great for simple questions.",
  },
  {
    value: "gpt-4o",
    label: "GPT‑4o",
    description: "Most capable model, best accuracy.",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT‑3.5 Turbo",
    description: "Legacy, lower cost.",
  },
];

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
      <div className="mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-amber-500" />
          AI Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let your users ask questions about the form and get instant answers.
        </p>
      </div>

      {/* Enable / Disable */}
      <div className="flex items-center justify-between p-5 rounded-xl border bg-gradient-to-r from-purple-50 to-blue-50 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              config.enabled
                ? "bg-purple-100 text-purple-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <Label htmlFor="ai-enabled" className="font-semibold text-base">
              AI Assistant
            </Label>
            <p className="text-sm text-muted-foreground">
              {config.enabled
                ? "Users can interact with the assistant."
                : "Turn on to help users complete the form."}
            </p>
          </div>
        </div>
        <Switch
          id="ai-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => onChange({ ...config, enabled: checked })}
        />
      </div>

      {config.enabled && (
        <div className="space-y-6 animate-in slide-in-from-top-2">
          {/* Model Selection */}
          <div className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-amber-500" />
              Choose AI Model
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {MODELS.map((model) => (
                <div
                  key={model.value}
                  onClick={() => onChange({ ...config, model: model.value })}
                  className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                    config.model === model.value
                      ? "border-purple-500 bg-purple-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{model.label}</span>
                    {config.model === model.value && (
                      <Badge className="bg-purple-500 text-white text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Custom model name</Label>
              <Input
                value={config.model || ""}
                onChange={(e) => onChange({ ...config, model: e.target.value })}
                placeholder="gpt-4o-mini"
                className="text-sm"
              />
            </div>
          </div>

          {/* Suggestion prompts */}
          <div className="rounded-xl border bg-slate-50/50 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Suggested Questions
            </div>
            <p className="text-xs text-muted-foreground">
              These prompts will appear as suggestions for users to quickly ask the assistant.
            </p>

            <div className="flex gap-2">
              <Input
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSuggestion();
                  }
                }}
                placeholder="e.g. How do I fill this field?"
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={addSuggestion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {config.suggestions && config.suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {config.suggestions.map((s, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="gap-1.5 pr-1 py-1.5 pl-3 text-sm"
                  >
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                    {s}
                    <button
                      onClick={() => removeSuggestion(idx)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 border-2 border-dashed rounded-xl text-muted-foreground">
                <Wand2 className="h-5 w-5 mr-2 opacity-30" />
                No suggestions yet. Add some to guide users.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}