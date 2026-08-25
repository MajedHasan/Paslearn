// create/components/TemplatePreview.tsx
import { Hexagon } from "lucide-react";
import { CanvasElement } from "./types";

interface TemplatePreviewProps {
  elements: CanvasElement[];
}

export default function TemplatePreview({ elements }: TemplatePreviewProps) {
  return (
    <div className="relative w-32 h-32">
      {elements.map((el) => (
        <div key={el.id} style={{ position: "absolute", left: el.x / 3, top: el.y / 3, width: el.width / 3, height: el.height / 3 }}>
          {el.type === "shape" && el.shapeType === "circle" && (
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: el.fill }} />
          )}
          {el.type === "shape" && el.shapeType === "hexagon" && (
            <Hexagon style={{ width: "100%", height: "100%", color: el.fill }} />
          )}
          {el.type === "text" && (
            <div style={{ fontSize: 10, fontFamily: el.fontFamily, color: el.fill, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              {el.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}