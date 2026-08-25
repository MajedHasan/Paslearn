// create/components/MultiElementProperties.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyCenter,
  BringToFront, SendToBack, FlipHorizontal, FlipVertical, Lock, EyeOff as HideIcon
} from "lucide-react";
import { CanvasElement } from "./types";

interface MultiElementPropertiesProps {
  elements: CanvasElement[];
  align: (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distribute: (type: "horizontal" | "vertical") => void;
  bringToFront: () => void;
  sendToBack: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  toggleLock: () => void;
  toggleHide: () => void;
}

export default function MultiElementProperties({
  elements, align, distribute, bringToFront, sendToBack,
  flipHorizontal, flipVertical, toggleLock, toggleHide
}: MultiElementPropertiesProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">{elements.length} elements selected</p>
      <div>
        <Label>Align</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          <Button variant="outline" size="sm" onClick={() => align("left")}><AlignLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => align("center")}><AlignCenter className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => align("right")}><AlignRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => align("top")}><AlignVerticalJustifyStart className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => align("middle")}><AlignVerticalJustifyCenter className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => align("bottom")}><AlignVerticalJustifyEnd className="h-4 w-4" /></Button>
        </div>
      </div>
      <div>
        <Label>Distribute</Label>
        <div className="flex gap-1 mt-1">
          <Button variant="outline" size="sm" onClick={() => distribute("horizontal")}><AlignHorizontalJustifyCenter className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => distribute("vertical")}><AlignVerticalJustifyCenter className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={bringToFront}><BringToFront className="mr-2 h-4 w-4" /> Front</Button>
        <Button variant="outline" size="sm" onClick={sendToBack}><SendToBack className="mr-2 h-4 w-4" /> Back</Button>
        <Button variant="outline" size="sm" onClick={flipHorizontal}><FlipHorizontal className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={flipVertical}><FlipVertical className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={toggleLock}><Lock className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={toggleHide}><HideIcon className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}