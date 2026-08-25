// create/components/TemplateGallery.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { templates, CanvasElement } from "./types";
import TemplatePreview from "./TemplatePreview";

interface TemplateGalleryProps {
  onBack: () => void;
  onSelect: (elements: CanvasElement[]) => void;
}

export default function TemplateGallery({ onBack, onSelect }: TemplateGalleryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = templates.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) && (category === "All" || t.category === category)
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="container mx-auto p-6 h-full overflow-y-auto">
      <Button variant="ghost" onClick={onBack}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
      <h1 className="text-2xl font-bold mt-4 mb-6">Choose a Template</h1>
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Tech", "Nature"].map((cat) => (
          <Button key={cat} variant={category === cat ? "secondary" : "outline"} size="sm" onClick={() => setCategory(cat)}>{cat}</Button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((template) => (
          <Card key={template.id} className="group overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onClick={() => onSelect(template.elements)}>
            <div className="h-40 bg-slate-100 flex items-center justify-center"><TemplatePreview elements={template.elements} /></div>
            <CardContent className="p-4">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /> Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next <ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}