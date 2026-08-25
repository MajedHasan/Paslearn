// create/components/LogoEditor.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Undo, Redo, Save, Download, ZoomIn, ZoomOut, Eye, EyeOff, Layers, Type,
  Image as ImageIcon, Square, Circle, Triangle, Star, Heart, Hexagon,
  Trash2, Copy, Wand2, ChevronLeft, Plus, PenTool, LayoutTemplate, Search,
  ChevronRight, X, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Diamond, Octagon, Cloud, Sun, Moon, Smile, Zap, Globe, Camera, Music, Video,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  BringToFront, SendToBack, FlipHorizontal, FlipVertical, Lock, Unlock,
  EyeOff as HideIcon, Clipboard as ClipboardIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CanvasElement, GradientType, ShapeType, ExportFormat, ExportQuality,
  iconMap, fontOptions, downloadBlob
} from "./types";
import ToolButton from "./ToolButton";
import SingleElementProperties from "./SingleElementProperties";
import MultiElementProperties from "./MultiElementProperties";

interface LogoEditorProps {
  initialElements: CanvasElement[];
  onBack: () => void;
}

export default function LogoEditor({ initialElements, onBack }: LogoEditorProps) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundGradient, setBackgroundGradient] = useState<GradientType>("none");
  const [bgGradientStart, setBgGradientStart] = useState("#6366f1");
  const [bgGradientEnd, setBgGradientEnd] = useState("#8b5cf6");
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<"select" | "text" | "shape" | "icon" | "image">("select");
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [exportQuality, setExportQuality] = useState<ExportQuality>("high");
  const [exportTransparent, setExportTransparent] = useState(false);
  const [clipboard, setClipboard] = useState<CanvasElement[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag/resize/rotate states
  const dragState = useRef<{ ids: string[]; startX: number; startY: number; origPositions: {id: string; x: number; y: number}[] } | null>(null);
  const resizeState = useRef<{ ids: string[]; startX: number; startY: number; origSizes: {id: string; width: number; height: number}[]; handle: string } | null>(null);
  const rotateState = useRef<{ ids: string[]; startAngle: number; origRotations: {id: string; rotation: number}[] } | null>(null);

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  // History
  const pushHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory(prev => {
      const newHist = prev.slice(0, historyIndex + 1);
      newHist.push(newElements);
      return newHist;
    });
    setHistoryIndex(i => i + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setElements(history[historyIndex - 1]);
      setSelectedIds([]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setElements(history[historyIndex + 1]);
      setSelectedIds([]);
    }
  };

  // Add elements
  const addText = () => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`, type: "text", x: 150, y: 150, width: 200, height: 60,
      rotation: 0, opacity: 1, fill: "#000000", stroke: "transparent", strokeWidth: 0,
      text: "Your Text", fontSize: 32, fontFamily: fontOptions[0].value, fontWeight: "normal",
      textAlign: "center", italic: false, underline: false, letterSpacing: 0, lineHeight: 1.2,
      shadowColor: "transparent", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
      gradientType: "none", gradientStart: "", gradientEnd: "", zIndex: elements.length + 1,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedIds([newEl.id]);
    setEditingTextId(newEl.id);
    pushHistory(newElements);
    setActiveTool("select");
  };

  const addShape = (shape: ShapeType) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`, type: "shape", x: 200, y: 200, width: 100, height: 100,
      rotation: 0, opacity: 1, fill: "#6366f1", stroke: "transparent", strokeWidth: 0,
      shapeType: shape, shadowColor: "transparent", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
      gradientType: "none", gradientStart: "", gradientEnd: "", zIndex: elements.length + 1,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedIds([newEl.id]);
    pushHistory(newElements);
    setActiveTool("select");
  };

  const addIcon = (iconName: string) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`, type: "icon", x: 250, y: 250, width: 60, height: 60,
      rotation: 0, opacity: 1, fill: "#6366f1", stroke: "transparent", strokeWidth: 0,
      src: iconName, shadowColor: "transparent", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
      gradientType: "none", gradientStart: "", gradientEnd: "", zIndex: elements.length + 1,
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    setSelectedIds([newEl.id]);
    pushHistory(newElements);
    setActiveTool("select");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newEl: CanvasElement = {
          id: `el-${Date.now()}`, type: "image", x: 150, y: 150, width: 200, height: 200,
          rotation: 0, opacity: 1, fill: "transparent", stroke: "transparent", strokeWidth: 0,
          src: ev.target?.result as string, shadowColor: "transparent", shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
          gradientType: "none", gradientStart: "", gradientEnd: "", zIndex: elements.length + 1,
        };
        const newElements = [...elements, newEl];
        setElements(newElements);
        setSelectedIds([newEl.id]);
        pushHistory(newElements);
        setActiveTool("select");
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Update selected elements
  const updateSelected = (updates: Partial<CanvasElement>) => {
    if (selectedIds.length === 0) return;
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, ...updates } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    const newElements = elements.filter(el => !selectedIds.includes(el.id));
    setElements(newElements);
    setSelectedIds([]);
    pushHistory(newElements);
  };

  const duplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newEls = selectedIds.map(id => {
      const el = elements.find(e => e.id === id);
      if (!el) return null;
      return { ...el, id: `el-${Date.now()}-${Math.random()}`, x: el.x + 20, y: el.y + 20, zIndex: elements.length + 1 };
    }).filter(Boolean) as CanvasElement[];
    const newElements = [...elements, ...newEls];
    setElements(newElements);
    setSelectedIds(newEls.map(el => el.id));
    pushHistory(newElements);
  };

  const copySelected = () => setClipboard(selectedElements);
  const paste = () => {
    if (clipboard.length === 0) return;
    const newEls = clipboard.map(el => ({ ...el, id: `el-${Date.now()}-${Math.random()}`, x: el.x + 20, y: el.y + 20 }));
    const newElements = [...elements, ...newEls];
    setElements(newElements);
    setSelectedIds(newEls.map(el => el.id));
    pushHistory(newElements);
  };

  // Align / distribute
  const align = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const bounds = getSelectionBounds(selected);
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      switch (type) {
        case "left": return { ...el, x: bounds.minX };
        case "center": return { ...el, x: bounds.minX + (bounds.width - el.width) / 2 };
        case "right": return { ...el, x: bounds.minX + bounds.width - el.width };
        case "top": return { ...el, y: bounds.minY };
        case "middle": return { ...el, y: bounds.minY + (bounds.height - el.height) / 2 };
        case "bottom": return { ...el, y: bounds.minY + bounds.height - el.height };
        default: return el;
      }
    });
    setElements(newElements);
    pushHistory(newElements);
  };

  const distribute = (type: "horizontal" | "vertical") => {
    if (selectedIds.length < 3) return;
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const sorted = [...selected].sort((a, b) => type === "horizontal" ? a.x - b.x : a.y - b.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpace = type === "horizontal" ? (last.x - first.x) : (last.y - first.y);
    const step = totalSpace / (sorted.length - 1);
    const newElements = elements.map(el => {
      if (!selectedIds.includes(el.id)) return el;
      const index = sorted.findIndex(s => s.id === el.id);
      if (type === "horizontal") return { ...el, x: first.x + step * index };
      return { ...el, y: first.y + step * index };
    });
    setElements(newElements);
    pushHistory(newElements);
  };

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    const maxZ = Math.max(...elements.map(el => el.zIndex || 0));
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, zIndex: maxZ + 1 } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    const minZ = Math.min(...elements.map(el => el.zIndex || 0));
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, zIndex: minZ - 1 } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const flipHorizontal = () => {
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, width: -el.width } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const flipVertical = () => {
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, height: -el.height } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const toggleLock = () => {
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, locked: !el.locked } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  const toggleHide = () => {
    const newElements = elements.map(el => selectedIds.includes(el.id) ? { ...el, hidden: !el.hidden } : el);
    setElements(newElements);
    pushHistory(newElements);
  };

  function getSelectionBounds(els: CanvasElement[]) {
    const minX = Math.min(...els.map(el => el.x));
    const minY = Math.min(...els.map(el => el.y));
    const maxX = Math.max(...els.map(el => el.x + el.width));
    const maxY = Math.max(...els.map(el => el.y + el.height));
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  // Pointer event handlers (using window listeners for reliability)
  const startDrag = (e: React.MouseEvent, id: string) => {
    if (activeTool !== "select" || elements.find(el => el.id === id)?.locked) return;
    e.stopPropagation();
    setEditingTextId(null);
    if (!e.shiftKey && !selectedIds.includes(id)) {
      setSelectedIds([id]);
    } else if (e.shiftKey && !selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id]);
    }
    const idsToDrag = e.shiftKey ? (selectedIds.includes(id) ? selectedIds : [...selectedIds, id]) : selectedIds.includes(id) ? selectedIds : [id];
    const origPositions = idsToDrag.map(selId => {
      const el = elements.find(el => el.id === selId)!;
      return { id: selId, x: el.x, y: el.y };
    });
    dragState.current = { ids: idsToDrag, startX: e.clientX, startY: e.clientY, origPositions };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.startX) / zoom;
    const dy = (e.clientY - dragState.current.startY) / zoom;
    setElements(prev => prev.map(el => {
      const orig = dragState.current!.origPositions.find(p => p.id === el.id);
      if (orig) return { ...el, x: orig.x + dx, y: orig.y + dy };
      return el;
    }));
  };

  const handleDragEnd = () => {
    dragState.current = null;
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    pushHistory(elements);
  };

  const startResize = (e: React.MouseEvent, id: string, handle: string) => {
    if (activeTool !== "select" || elements.find(el => el.id === id)?.locked) return;
    e.stopPropagation();
    const idsToResize = selectedIds.includes(id) ? selectedIds : [id];
    const origSizes = idsToResize.map(selId => {
      const el = elements.find(el => el.id === selId)!;
      return { id: selId, width: el.width, height: el.height };
    });
    resizeState.current = { ids: idsToResize, startX: e.clientX, startY: e.clientY, origSizes, handle };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeState.current) return;
    const dx = (e.clientX - resizeState.current.startX) / zoom;
    const dy = (e.clientY - resizeState.current.startY) / zoom;
    setElements(prev => prev.map(el => {
      const orig = resizeState.current!.origSizes.find(s => s.id === el.id);
      if (!orig) return el;
      let newW = orig.width, newH = orig.height;
      if (resizeState.current!.handle.includes("e")) newW = orig.width + dx;
      if (resizeState.current!.handle.includes("s")) newH = orig.height + dy;
      if (resizeState.current!.handle.includes("w")) newW = orig.width - dx;
      if (resizeState.current!.handle.includes("n")) newH = orig.height - dy;
      return { ...el, width: Math.max(10, newW), height: Math.max(10, newH) };
    }));
  };

  const handleResizeEnd = () => {
    resizeState.current = null;
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    pushHistory(elements);
  };

  const startRotate = (e: React.MouseEvent, id: string) => {
    if (activeTool !== "select" || elements.find(el => el.id === id)?.locked) return;
    e.stopPropagation();
    const idsToRotate = selectedIds.includes(id) ? selectedIds : [id];
    const origRotations = idsToRotate.map(selId => {
      const el = elements.find(el => el.id === selId)!;
      return { id: selId, rotation: el.rotation };
    });
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const firstEl = elements.find(el => el.id === id)!;
    const centerX = rect.left + (firstEl.x + firstEl.width / 2) * zoom;
    const centerY = rect.top + (firstEl.y + firstEl.height / 2) * zoom;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    rotateState.current = { ids: idsToRotate, startAngle, origRotations };
    window.addEventListener('mousemove', handleRotateMove);
    window.addEventListener('mouseup', handleRotateEnd);
  };

  const handleRotateMove = (e: MouseEvent) => {
    if (!rotateState.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const firstEl = elements.find(el => el.id === rotateState.current!.ids[0]);
    if (!firstEl) return;
    const centerX = rect.left + (firstEl.x + firstEl.width / 2) * zoom;
    const centerY = rect.top + (firstEl.y + firstEl.height / 2) * zoom;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const delta = angle - rotateState.current.startAngle;
    setElements(prev => prev.map(el => {
      const orig = rotateState.current!.origRotations.find(r => r.id === el.id);
      if (orig) return { ...el, rotation: Math.round(orig.rotation + delta) };
      return el;
    }));
  };

  const handleRotateEnd = () => {
    rotateState.current = null;
    window.removeEventListener('mousemove', handleRotateMove);
    window.removeEventListener('mouseup', handleRotateEnd);
    pushHistory(elements);
  };

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('mousemove', handleRotateMove);
      window.removeEventListener('mouseup', handleRotateEnd);
    };
  }, []);

  // Inline text editing
  const handleTextDoubleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds([id]);
    setEditingTextId(id);
  };

  const handleTextChange = (id: string, text: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, text } : el));
  };

  const handleTextBlur = () => {
    setEditingTextId(null);
    pushHistory(elements);
  };

  // Export
  const handleExport = () => {
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">`;
    if (!exportTransparent) {
      if (backgroundGradient === "none") {
        svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
      } else if (backgroundGradient === "linear") {
        svgContent += `<defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bgGradientStart}"/><stop offset="100%" stop-color="${bgGradientEnd}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bgGrad)"/>`;
      } else {
        svgContent += `<defs><radialGradient id="bgGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${bgGradientStart}"/><stop offset="100%" stop-color="${bgGradientEnd}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#bgGrad)"/>`;
      }
    }
    elements.filter(el => !el.hidden).sort((a,b) => (a.zIndex||0)-(b.zIndex||0)).forEach(el => {
      let elementSvg = '';
      const common = `transform="rotate(${el.rotation} ${el.x + el.width/2} ${el.y + el.height/2})" opacity="${el.opacity}"`;
      switch (el.type) {
        case "text":
          elementSvg = `<text x="${el.x}" y="${el.y + (el.fontSize || 24)}" font-size="${el.fontSize}" font-family="${el.fontFamily}" font-weight="${el.fontWeight || 'normal'}" fill="${el.fill}" ${common} text-anchor="${el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'}">${el.text}</text>`;
          break;
        case "shape":
          if (el.shapeType === "circle") elementSvg = `<circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${Math.min(el.width, el.height)/2}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" ${common}/>`;
          else if (el.shapeType === "square") elementSvg = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" ${common}/>`;
          break;
        case "icon":
          elementSvg = `<text x="${el.x}" y="${el.y + el.height}" font-size="${el.height}" fill="${el.fill}" ${common}>★</text>`;
          break;
        case "image":
          elementSvg = `<image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" ${common}/>`;
          break;
      }
      svgContent += elementSvg;
    });
    svgContent += `</svg>`;

    if (exportFormat === "svg") {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      downloadBlob(blob, "logo.svg");
    } else {
      alert(`Export as ${exportFormat.toUpperCase()} (${exportQuality} quality) is simulated.`);
    }
    setShowExport(false);
  };

  // Render element content
  const renderElementContent = (el: CanvasElement) => {
    if (el.hidden) return null;
    const style: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: el.opacity,
      textShadow: el.shadowColor !== 'transparent' ? `${el.shadowOffsetX}px ${el.shadowOffsetY}px ${el.shadowBlur}px ${el.shadowColor}` : 'none',
    };
    if (el.type === "text") {
      if (editingTextId === el.id) {
        return (
          <textarea
            autoFocus
            value={el.text}
            onChange={(e) => handleTextChange(el.id, e.target.value)}
            onBlur={handleTextBlur}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              fontSize: (el.fontSize || 24) * zoom,
              fontFamily: el.fontFamily,
              fontWeight: el.fontWeight,
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underline ? 'underline' : 'none',
              letterSpacing: `${el.letterSpacing || 0}px`,
              lineHeight: el.lineHeight || 1.2,
              textAlign: el.textAlign || 'center',
              color: el.fill,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: 0,
              margin: 0,
            }}
          />
        );
      }
      return (
        <div style={{
          ...style,
          fontSize: (el.fontSize || 24) * zoom,
          fontFamily: el.fontFamily,
          fontWeight: el.fontWeight,
          fontStyle: el.italic ? 'italic' : 'normal',
          textDecoration: el.underline ? 'underline' : 'none',
          letterSpacing: `${el.letterSpacing || 0}px`,
          lineHeight: el.lineHeight || 1.2,
          textAlign: el.textAlign || 'center',
          color: el.fill,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {el.text}
        </div>
      );
    }
    if (el.type === "shape") {
      const shapeStyle: React.CSSProperties = { width: '100%', height: '100%', ...style };
      switch (el.shapeType) {
        case "square": return <div style={{ ...shapeStyle, background: el.fill }} />;
        case "circle": return <div style={{ ...shapeStyle, borderRadius: '50%', background: el.fill }} />;
        case "triangle": return <div style={{ width: 0, height: 0, borderLeft: `${(el.width * zoom) / 2}px solid transparent`, borderRight: `${(el.width * zoom) / 2}px solid transparent`, borderBottom: `${el.height * zoom}px solid ${el.fill}` }} />;
        case "star": return <Star style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "heart": return <Heart style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "hexagon": return <Hexagon style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "diamond": return <Diamond style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "octagon": return <Octagon style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "cloud": return <Cloud style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "sun": return <Sun style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "moon": return <Moon style={{ width: '100%', height: '100%', color: el.fill }} />;
        case "smile": return <Smile style={{ width: '100%', height: '100%', color: el.fill }} />;
        default: return null;
      }
    }
    if (el.type === "icon") {
      const IconComponent = iconMap[el.src || "star"];
      return <div style={{ ...style }}>{IconComponent && <IconComponent style={{ width: '100%', height: '100%', color: el.fill }} />}</div>;
    }
    if (el.type === "image") {
      return <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="border-b bg-white dark:bg-slate-900 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="h-5 w-5" /></Button>
          <h1 className="text-lg font-semibold">Logo Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}><Undo className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}><Redo className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button size="sm"><Save className="mr-2 h-4 w-4" /> Save</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-16 border-r bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-2 overflow-y-auto">
          <ToolButton icon={Layers} active={activeTool === "select"} onClick={() => setActiveTool("select")} label="Select" />
          <ToolButton icon={Type} onClick={addText} label="Text" />
          <ToolButton icon={Square} onClick={() => setActiveTool("shape")} label="Shape" />
          <ToolButton icon={ImageIcon} onClick={() => setActiveTool("icon")} label="Icon" />
          <ToolButton icon={Plus} onClick={() => fileInputRef.current?.click()} label="Image" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <ToolButton icon={Copy} onClick={copySelected} label="Copy" />
          <ToolButton icon={ClipboardIcon} onClick={paste} label="Paste" />
          <ToolButton icon={Trash2} onClick={deleteSelected} label="Delete" />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto p-8" onClick={() => { setSelectedIds([]); setEditingTextId(null); }}>
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setShowGrid(!showGrid)}>{showGrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
          </div>

          <div
            ref={canvasRef}
            className="relative mx-auto shadow-lg border rounded-lg overflow-hidden"
            style={{
              width: canvasSize.width * zoom,
              height: canvasSize.height * zoom,
              background: backgroundGradient === "none" ? backgroundColor :
                backgroundGradient === "linear" ? `linear-gradient(135deg, ${bgGradientStart}, ${bgGradientEnd})` :
                `radial-gradient(circle, ${bgGradientStart}, ${bgGradientEnd})`,
              backgroundImage: showGrid ? "radial-gradient(circle, #ccc 1px, transparent 1px)" : "none",
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            }}
          >
            {elements
              .filter(el => !el.hidden)
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((el) => (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    left: el.x * zoom,
                    top: el.y * zoom,
                    width: Math.abs(el.width) * zoom,
                    height: Math.abs(el.height) * zoom,
                    transform: `rotate(${el.rotation}deg) scale(${el.width < 0 ? -1 : 1}, ${el.height < 0 ? -1 : 1})`,
                    opacity: el.opacity,
                    border: selectedIds.includes(el.id) ? "2px solid #6366f1" : "none",
                    cursor: activeTool === "select" ? (el.locked ? "not-allowed" : "move") : "default",
                  }}
                  onMouseDown={(e) => startDrag(e, el.id)}
                  onDoubleClick={(e) => el.type === "text" && handleTextDoubleClick(e, el.id)}
                >
                  {renderElementContent(el)}
                  {selectedIds.includes(el.id) && activeTool === "select" && !el.locked && (
                    <>
                      <div className="absolute -left-1 -top-1 w-3 h-3 bg-blue-500 cursor-nwse-resize" onMouseDown={(e) => startResize(e, el.id, "nw")} />
                      <div className="absolute -right-1 -top-1 w-3 h-3 bg-blue-500 cursor-nesw-resize" onMouseDown={(e) => startResize(e, el.id, "ne")} />
                      <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-blue-500 cursor-nesw-resize" onMouseDown={(e) => startResize(e, el.id, "sw")} />
                      <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 cursor-nwse-resize" onMouseDown={(e) => startResize(e, el.id, "se")} />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-grab" onMouseDown={(e) => startRotate(e, el.id)} />
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 border-l bg-white dark:bg-slate-900 overflow-y-auto">
          <Tabs defaultValue="properties">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="p-4 space-y-4">
              {selectedIds.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Select an element to edit.</div>
              ) : selectedIds.length === 1 ? (
                <SingleElementProperties element={selectedElements[0]} update={updateSelected} />
              ) : (
                <MultiElementProperties
                  elements={selectedElements}
                  align={align}
                  distribute={distribute}
                  bringToFront={bringToFront}
                  sendToBack={sendToBack}
                  flipHorizontal={flipHorizontal}
                  flipVertical={flipVertical}
                  toggleLock={toggleLock}
                  toggleHide={toggleHide}
                />
              )}
            </TabsContent>

            <TabsContent value="layers" className="p-4 space-y-2">
              {elements.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No elements.</div>
              ) : (
                elements.slice().sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((el) => (
                  <div key={el.id} className={cn("flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted", selectedIds.includes(el.id) && "bg-muted")} onClick={() => setSelectedIds([el.id])}>
                    <Layers className="h-4 w-4" />
                    <span className="text-sm flex-1 truncate">{el.type === "text" ? el.text : el.type}</span>
                    {el.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                    {el.hidden && <HideIcon className="h-3 w-3 text-muted-foreground" />}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setSelectedIds([el.id]); deleteSelected(); }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="background" className="p-4 space-y-4">
              <div>
                <Label>Canvas Size</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input type="number" value={canvasSize.width} onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))} />
                  <Input type="number" value={canvasSize.height} onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Background Gradient</Label>
                <Select value={backgroundGradient} onValueChange={(val) => setBackgroundGradient(val as GradientType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                  </SelectContent>
                </Select>
                {backgroundGradient !== "none" && (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={bgGradientStart} onChange={(e) => setBgGradientStart(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="color" value={bgGradientEnd} onChange={(e) => setBgGradientEnd(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => { setBackgroundColor("#ffffff"); setBackgroundGradient("none"); }}>Reset</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Shape/Icon pickers */}
      {activeTool === "shape" && (
        <div className="absolute left-20 top-20 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-2 z-20 max-h-80 overflow-y-auto">
          {(["square", "circle", "triangle", "star", "heart", "hexagon", "diamond", "octagon", "cloud", "sun", "moon", "smile"] as ShapeType[]).map(shape => (
            <Button key={shape} variant="ghost" size="icon" onClick={() => addShape(shape)}>
              {shape === "square" && <Square className="h-5 w-5" />}
              {shape === "circle" && <Circle className="h-5 w-5" />}
              {shape === "triangle" && <Triangle className="h-5 w-5" />}
              {shape === "star" && <Star className="h-5 w-5" />}
              {shape === "heart" && <Heart className="h-5 w-5" />}
              {shape === "hexagon" && <Hexagon className="h-5 w-5" />}
              {shape === "diamond" && <Diamond className="h-5 w-5" />}
              {shape === "octagon" && <Octagon className="h-5 w-5" />}
              {shape === "cloud" && <Cloud className="h-5 w-5" />}
              {shape === "sun" && <Sun className="h-5 w-5" />}
              {shape === "moon" && <Moon className="h-5 w-5" />}
              {shape === "smile" && <Smile className="h-5 w-5" />}
            </Button>
          ))}
        </div>
      )}
      {activeTool === "icon" && (
        <div className="absolute left-20 top-20 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-2 z-20 max-h-80 overflow-y-auto">
          {Object.keys(iconMap).map(name => (
            <Button key={name} variant="ghost" size="icon" onClick={() => addIcon(name)}>
              {(() => { const IconComp = iconMap[name]; return <IconComp className="h-5 w-5" />; })()}
            </Button>
          ))}
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Logo</DialogTitle>
            <DialogDescription>Choose format and quality.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="svg">SVG (Vector)</SelectItem>
                  <SelectItem value="png">PNG (Transparent)</SelectItem>
                  <SelectItem value="jpg">JPG (Compressed)</SelectItem>
                  <SelectItem value="pdf">PDF (Document)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quality</Label>
              <Select value={exportQuality} onValueChange={(v) => setExportQuality(v as ExportQuality)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (1x)</SelectItem>
                  <SelectItem value="medium">Medium (2x)</SelectItem>
                  <SelectItem value="high">High (4x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="transparent" checked={exportTransparent} onChange={(e) => setExportTransparent(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="transparent">Transparent background</Label>
            </div>
            <Button className="w-full" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}