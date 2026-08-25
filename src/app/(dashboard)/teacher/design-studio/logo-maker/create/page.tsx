// create/page.tsx
"use client";

import { useState } from "react";
import { CanvasElement } from "./_components/types";
import ModeSelection from "./_components/ModeSelection";
import TemplateGallery from "./_components/TemplateGallery";
import AIGenerator from "./_components/AIGenerator";
import LogoEditor from "./_components/LogoEditor";

export default function LogoCreationPage() {
  const [mode, setMode] = useState<"choose" | "manual" | "templates" | "ai" | "editor">("choose");
  const [editorElements, setEditorElements] = useState<CanvasElement[]>([]);

  const startManual = () => { setEditorElements([]); setMode("editor"); };
  const startTemplate = (elements: CanvasElement[]) => { setEditorElements(elements); setMode("editor"); };
  const handleAIGenerated = (elements: CanvasElement[]) => { setEditorElements(elements); setMode("editor"); };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      {mode === "choose" && <ModeSelection onManual={startManual} onTemplates={() => setMode("templates")} onAI={() => setMode("ai")} />}
      {mode === "templates" && <TemplateGallery onBack={() => setMode("choose")} onSelect={startTemplate} />}
      {mode === "ai" && <AIGenerator onBack={() => setMode("choose")} onEdit={handleAIGenerated} />}
      {mode === "editor" && <LogoEditor initialElements={editorElements} onBack={() => setMode("choose")} />}
    </div>
  );
}