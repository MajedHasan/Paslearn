// create/components/AIGenerator.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Wand2, Download, Edit } from "lucide-react";
import { aiGeneratedLogos, CanvasElement } from "./types";
import TemplatePreview from "./TemplatePreview";

interface AIGeneratorProps {
  onBack: () => void;
  onEdit: (elements: CanvasElement[]) => void;
}

export default function AIGenerator({ onBack, onEdit }: AIGeneratorProps) {
  const [brandName, setBrandName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<typeof aiGeneratedLogos>([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const userLogos = aiGeneratedLogos.map((logo) => ({
        ...logo,
        name: brandName ? `${brandName} Logo ${logo.id.slice(-1)}` : logo.name,
        elements: logo.elements.map((el) => (el.type === "text" ? { ...el, text: brandName || "Brand" } : el)),
      }));
      setGeneratedLogos(userLogos);
      setIsGenerating(false);
      setShowResults(true);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 h-full overflow-y-auto">
      <Button variant="ghost" onClick={onBack}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
      <h1 className="text-2xl font-bold mt-4 mb-6">AI Logo Generator</h1>
      {!showResults ? (
        <div className="space-y-4 max-w-2xl">
            <div>
                <Label>Brand Name</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
            {
                isGenerating ? <Wand2 className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />
            } Generate Logos
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedLogos.map((logo) => (
            <Card key={logo.id} className="group overflow-hidden">
              <div className="h-48 bg-slate-100 flex items-center justify-center"><TemplatePreview elements={logo.elements} /></div>
              <CardContent className="p-4 flex justify-between items-center">
                <h3 className="font-medium">{logo.name}</h3>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => onEdit(logo.elements)}><Edit className="h-4 w-4" /> Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}