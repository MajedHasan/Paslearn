// create/components/ModeSelection.tsx
import { Button } from "@/components/ui/button";
import { PenTool, LayoutTemplate, Wand2 } from "lucide-react";

interface ModeSelectionProps {
  onManual: () => void;
  onTemplates: () => void;
  onAI: () => void;
}

export default function ModeSelection({ onManual, onTemplates, onAI }: ModeSelectionProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-3xl font-bold mb-8">Choose Creation Method</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Button variant="outline" className="h-40 flex flex-col items-center justify-center gap-3 text-lg" onClick={onManual}>
          <PenTool className="h-10 w-10" /> <span>Manual</span> <span className="text-sm text-muted-foreground">Start from scratch</span>
        </Button>
        <Button variant="outline" className="h-40 flex flex-col items-center justify-center gap-3 text-lg" onClick={onTemplates}>
          <LayoutTemplate className="h-10 w-10" /> <span>Templates</span> <span className="text-sm text-muted-foreground">Choose a template</span>
        </Button>
        <Button variant="outline" className="h-40 flex flex-col items-center justify-center gap-3 text-lg" onClick={onAI}>
          <Wand2 className="h-10 w-10" /> <span>AI Generator</span> <span className="text-sm text-muted-foreground">Describe your idea</span>
        </Button>
      </div>
    </div>
  );
}