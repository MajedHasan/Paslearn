// create/components/SingleElementProperties.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlignLeft, AlignCenter, AlignRight, Italic, Underline, Copy, Trash2 } from "lucide-react";
import { CanvasElement, GradientType, fontOptions } from "./types";

interface SingleElementPropertiesProps {
  element: CanvasElement;
  update: (updates: Partial<CanvasElement>) => void;
}

export default function SingleElementProperties({ element, update }: SingleElementPropertiesProps) {
  return (
    <>
      {/* Position */}
      <div>
        <Label>Position</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div><Label className="text-xs">X</Label><Input type="number" value={element.x} onChange={(e) => update({ x: parseInt(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs">Y</Label><Input type="number" value={element.y} onChange={(e) => update({ y: parseInt(e.target.value) || 0 })} /></div>
        </div>
      </div>
      {/* Size */}
      <div>
        <Label>Size</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div><Label className="text-xs">W</Label><Input type="number" value={element.width} onChange={(e) => update({ width: parseInt(e.target.value) || 0 })} /></div>
          <div><Label className="text-xs">H</Label><Input type="number" value={element.height} onChange={(e) => update({ height: parseInt(e.target.value) || 0 })} /></div>
        </div>
      </div>
      {/* Rotation and Opacity */}
      <div>
        <Label>Rotation</Label>
        <Slider value={[element.rotation]} min={0} max={360} onValueChange={(val) => update({ rotation: val[0] })} />
      </div>
      <div>
        <Label>Opacity</Label>
        <Slider value={[element.opacity]} min={0} max={1} step={0.1} onValueChange={(val) => update({ opacity: val[0] })} />
      </div>
      {/* Fill */}
      <div>
        <Label>Fill Color</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={element.fill} onChange={(e) => update({ fill: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
          <Input value={element.fill} onChange={(e) => update({ fill: e.target.value })} />
        </div>
      </div>
      {/* Stroke */}
      <div>
        <Label>Stroke</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={element.stroke} onChange={(e) => update({ stroke: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
          <Input value={element.stroke} onChange={(e) => update({ stroke: e.target.value })} />
          <Input type="number" value={element.strokeWidth} onChange={(e) => update({ strokeWidth: parseInt(e.target.value) || 0 })} className="w-20" />
        </div>
      </div>
      {/* Text-specific */}
      {element.type === "text" && (
        <>
          <div>
            <Label>Text</Label>
            <Input value={element.text || ""} onChange={(e) => update({ text: e.target.value })} />
          </div>
          <div>
            <Label>Font Family</Label>
            <Select value={element.fontFamily} onValueChange={(val) => update({ fontFamily: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{fontOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Font Size</Label>
            <Input type="number" value={element.fontSize} onChange={(e) => update({ fontSize: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Font Weight</Label>
            <Select value={element.fontWeight} onValueChange={(val) => update({ fontWeight: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant={element.italic ? "secondary" : "outline"} size="sm" onClick={() => update({ italic: !element.italic })}><Italic className="h-4 w-4" /></Button>
            <Button variant={element.underline ? "secondary" : "outline"} size="sm" onClick={() => update({ underline: !element.underline })}><Underline className="h-4 w-4" /></Button>
          </div>
          <div>
            <Label>Text Align</Label>
            <div className="flex gap-1">
              <Button variant={element.textAlign === "left" ? "secondary" : "outline"} size="sm" onClick={() => update({ textAlign: "left" })}><AlignLeft className="h-4 w-4" /></Button>
              <Button variant={element.textAlign === "center" ? "secondary" : "outline"} size="sm" onClick={() => update({ textAlign: "center" })}><AlignCenter className="h-4 w-4" /></Button>
              <Button variant={element.textAlign === "right" ? "secondary" : "outline"} size="sm" onClick={() => update({ textAlign: "right" })}><AlignRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div>
            <Label>Letter Spacing</Label>
            <Slider value={[element.letterSpacing || 0]} min={-5} max={20} onValueChange={(val) => update({ letterSpacing: val[0] })} />
          </div>
          <div>
            <Label>Line Height</Label>
            <Slider value={[element.lineHeight || 1.2]} min={0.5} max={3} step={0.1} onValueChange={(val) => update({ lineHeight: val[0] })} />
          </div>
        </>
      )}
      {/* Shadow */}
      <div>
        <Label>Shadow</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Color</Label>
            <input type="color" value={element.shadowColor || "transparent"} onChange={(e) => update({ shadowColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Blur</Label>
            <Input type="number" value={element.shadowBlur || 0} onChange={(e) => update({ shadowBlur: parseInt(e.target.value) || 0 })} className="w-20" />
            <Label className="text-xs">Offset X</Label>
            <Input type="number" value={element.shadowOffsetX || 0} onChange={(e) => update({ shadowOffsetX: parseInt(e.target.value) || 0 })} className="w-20" />
            <Label className="text-xs">Offset Y</Label>
            <Input type="number" value={element.shadowOffsetY || 0} onChange={(e) => update({ shadowOffsetY: parseInt(e.target.value) || 0 })} className="w-20" />
          </div>
        </div>
      </div>
      {/* Gradient */}
      <div>
        <Label>Gradient</Label>
        <Select value={element.gradientType || "none"} onValueChange={(val) => update({ gradientType: val as GradientType })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
        {element.gradientType !== "none" && (
          <div className="flex items-center gap-2 mt-2">
            <input type="color" value={element.gradientStart || "#000000"} onChange={(e) => update({ gradientStart: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
            <input type="color" value={element.gradientEnd || "#ffffff"} onChange={(e) => update({ gradientEnd: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
          </div>
        )}
      </div>
      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => update({})}><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
        <Button variant="destructive" size="sm" onClick={() => update({})}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>
    </>
  );
}