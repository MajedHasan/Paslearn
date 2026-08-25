// create/components/types.ts
import {
  Star, Heart, Hexagon, Circle, Square, Triangle, Diamond, Octagon,
  Cloud, Sun, Moon, Smile, Zap, Globe, Camera, Music, Video
} from "lucide-react";

export type ElementType = "text" | "shape" | "icon" | "image";
export type ShapeType = "square" | "circle" | "triangle" | "star" | "heart" | "hexagon" | "diamond" | "octagon" | "cloud" | "sun" | "moon" | "smile";
export type GradientType = "none" | "linear" | "radial";
export type ExportFormat = "svg" | "png" | "jpg" | "pdf";
export type ExportQuality = "low" | "medium" | "high";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  gradientType?: GradientType;
  gradientStart?: string;
  gradientEnd?: string;
  shapeType?: ShapeType;
  src?: string;
  locked?: boolean;
  hidden?: boolean;
  zIndex?: number;
}

export const fontOptions = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Lora", value: "Lora, serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
];

export const iconMap: Record<string, React.ElementType> = {
  star: Star, heart: Heart, hexagon: Hexagon, circle: Circle, square: Square,
  triangle: Triangle, diamond: Diamond, octagon: Octagon, cloud: Cloud,
  sun: Sun, moon: Moon, smile: Smile, zap: Zap, globe: Globe, camera: Camera,
  music: Music, video: Video,
};

export const industries = ["Technology", "Education", "Health", "Food", "Fashion", "Travel", "Finance", "Other"];

export const templates = [
  {
    id: "t1", name: "Tech Minimal", category: "Tech",
    elements: [
      { id: "t1-shape", type: "shape", x: 180, y: 180, width: 140, height: 140, rotation: 0, opacity: 1, fill: "#3b82f6", stroke: "transparent", strokeWidth: 0, shapeType: "circle", zIndex: 1 },
      { id: "t1-text", type: "text", x: 150, y: 220, width: 200, height: 60, rotation: 0, opacity: 1, fill: "#ffffff", stroke: "transparent", strokeWidth: 0, text: "Tech", fontSize: 36, fontFamily: "Inter, sans-serif", fontWeight: "bold", zIndex: 2 },
    ] as CanvasElement[],
  },
  {
    id: "t2", name: "Nature Organic", category: "Nature",
    elements: [
      { id: "t2-shape", type: "shape", x: 180, y: 180, width: 140, height: 140, rotation: 0, opacity: 1, fill: "#84cc16", stroke: "transparent", strokeWidth: 0, shapeType: "hexagon", zIndex: 1 },
      { id: "t2-text", type: "text", x: 150, y: 220, width: 200, height: 60, rotation: 0, opacity: 1, fill: "#ffffff", stroke: "transparent", strokeWidth: 0, text: "Nature", fontSize: 36, fontFamily: "Poppins, sans-serif", fontWeight: "bold", zIndex: 2 },
    ] as CanvasElement[],
  },
];

export const aiGeneratedLogos = [
  {
    id: "ai1", name: "AI Logo 1",
    elements: [
      { id: "ai1-shape", type: "shape", x: 180, y: 180, width: 140, height: 140, rotation: 0, opacity: 1, fill: "#8b5cf6", stroke: "transparent", strokeWidth: 0, shapeType: "hexagon", zIndex: 1 },
      { id: "ai1-text", type: "text", x: 150, y: 220, width: 200, height: 60, rotation: 0, opacity: 1, fill: "#ffffff", stroke: "transparent", strokeWidth: 0, text: "AI Logo", fontSize: 36, fontFamily: "Poppins, sans-serif", fontWeight: "bold", zIndex: 2 },
    ] as CanvasElement[],
  },
  {
    id: "ai2", name: "AI Logo 2",
    elements: [
      { id: "ai2-shape", type: "shape", x: 180, y: 180, width: 140, height: 140, rotation: 0, opacity: 1, fill: "#0ea5e9", stroke: "transparent", strokeWidth: 0, shapeType: "circle", zIndex: 1 },
      { id: "ai2-text", type: "text", x: 150, y: 220, width: 200, height: 60, rotation: 0, opacity: 1, fill: "#ffffff", stroke: "transparent", strokeWidth: 0, text: "TechAI", fontSize: 36, fontFamily: "Inter, sans-serif", fontWeight: "bold", zIndex: 2 },
    ] as CanvasElement[],
  },
];

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}