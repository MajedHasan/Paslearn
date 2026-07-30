"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Columns,
  Type,
  Image as ImageIcon,
  Minus,
  Space,
  Wand2,
  Eye,
  EyeOff,
  GripVertical,
  Heading,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { FieldDefinition } from "@/types/forms/shared/field.types";
import { LayoutBlock } from "@/types/forms/shared/layout.types";

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

interface Props {
  layout: LayoutBlock[];
  fields: FieldDefinition[];
  onChange: (layout: LayoutBlock[]) => void;
}

export default function LayoutPanel({ layout, fields, onChange }: Props) {
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [previewGrid, setPreviewGrid] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Sync from parent
  useEffect(() => {
    setBlocks(layout ?? []);
  }, [layout]);

  const updateLayout = useCallback(
    (newBlocks: LayoutBlock[]) => {
      setBlocks(newBlocks);
      onChange(newBlocks);
    },
    [onChange]
  );

  // Auto-generate layout from fields
  const autoGenerate = () => {
    if (fields.length === 0) return;
    const rows: LayoutBlock[] = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push({
        id: createId(),
        type: "row",
        props: { columns: 2 },
        children: fields.slice(i, i + 2).map((f) => ({
          id: createId(),
          type: "field",
          fieldKey: f.key,
        })),
      });
    }
    const section: LayoutBlock = {
      id: createId(),
      type: "section",
      props: { title: "Form", description: "" },
      children: rows,
    };
    updateLayout([section]);
  };

  const addSection = () => {
    const newSec: LayoutBlock = {
      id: createId(),
      type: "section",
      props: { title: "New Section", description: "" },
      children: [],
    };
    updateLayout([...blocks, newSec]);
  };

  const removeBlock = useCallback(
    (blockId: string) => {
      const filterFn = (list: LayoutBlock[]): LayoutBlock[] =>
        list
          .filter((b) => b.id !== blockId)
          .map((b) => (b.children ? { ...b, children: filterFn(b.children) } : b));
      updateLayout(filterFn(blocks));
      if (selectedBlockId === blockId) setSelectedBlockId(null);
    },
    [blocks, selectedBlockId, updateLayout]
  );

  const moveBlock = (blockId: string, dir: "up" | "down") => {
    const moveFn = (list: LayoutBlock[]): LayoutBlock[] => {
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        const newIdx = dir === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= list.length) return list;
        const updated = [...list];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        return updated;
      }
      return list.map((b) =>
        b.children ? { ...b, children: moveFn(b.children) } : b
      );
    };
    updateLayout(moveFn(blocks));
  };

  const updateBlock = (blockId: string, patch: Partial<LayoutBlock>) => {
    const updateFn = (list: LayoutBlock[]): LayoutBlock[] =>
      list.map((b) =>
        b.id === blockId
          ? { ...b, ...patch }
          : b.children
          ? { ...b, children: updateFn(b.children) }
          : b
      );
    updateLayout(updateFn(blocks));
  };

  const addBlock = (parentId: string, type: LayoutBlock["type"]) => {
    const newBlock: LayoutBlock = {
      id: createId(),
      type,
      props: {},
      children: undefined,
    };
    if (type === "row") newBlock.props = { columns: 2 };
    if (type === "text") newBlock.content = "Your text here";
    if (type === "image") newBlock.props = { src: "", alt: "Image" };
    if (type === "heading") newBlock.content = "New Heading";
    if (type === "spacer") newBlock.props = { height: 24 };
    if (type === "divider") newBlock.props = {}; // divider has no extra props
    const addFn = (list: LayoutBlock[]): LayoutBlock[] =>
      list.map((b) => {
        if (b.id === parentId) {
          return { ...b, children: [...(b.children || []), newBlock] };
        }
        return b.children ? { ...b, children: addFn(b.children) } : b;
      });
    updateLayout(addFn(blocks));
    // Select newly created block for editing
    setSelectedBlockId(newBlock.id);
  };

  const addFieldToRow = (rowId: string, fieldKey: string) => {
    const newField: LayoutBlock = { id: createId(), type: "field", fieldKey };
    const addFn = (list: LayoutBlock[]): LayoutBlock[] =>
      list.map((b) => {
        if (b.id === rowId) {
          return { ...b, children: [...(b.children || []), newField] };
        }
        return b.children ? { ...b, children: addFn(b.children) } : b;
      });
    updateLayout(addFn(blocks));
  };

  const clearAll = () => updateLayout([]);

  // ---------- Render a block editor (inline) for non‑container types ----------
  const renderBlockEditor = (block: LayoutBlock) => {
    const isSelected = selectedBlockId === block.id;
    const toggleSelect = () => setSelectedBlockId(isSelected ? null : block.id);

    return (
      <div className="relative">
        <div
          className={`group rounded-lg border transition-all cursor-pointer ${
            isSelected
              ? "ring-2 ring-amber-500 border-amber-400 shadow-lg"
              : "border-transparent hover:border-gray-200 hover:shadow-sm"
          }`}
          onClick={toggleSelect}
        >
          {block.type === "text" && (
            <div className="p-2 text-sm text-gray-700 bg-white rounded-lg">
              {block.content || "Text block (click to edit)"}
            </div>
          )}
          {block.type === "heading" && (
            <h2 className="text-xl font-bold text-gray-800 p-2">
              {block.content || "Heading (click to edit)"}
            </h2>
          )}
          {block.type === "image" && (
            <div className="p-2 flex items-center justify-center bg-gray-100 rounded-lg h-24">
              <ImageIcon className="h-6 w-6 text-gray-400" />
              <span className="text-xs ml-2 text-gray-500">
                {block.props?.alt || "Image"}
              </span>
            </div>
          )}
          {block.type === "divider" && <hr className="my-1 border-gray-300" />}
          {block.type === "spacer" && (
            <div
              className="bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-400"
              style={{ height: (block.props?.height || 24) + "px" }}
            >
              {block.props?.height || 24} px
            </div>
          )}
          {block.type === "field" && (
            <Badge variant="secondary" className="text-sm py-1.5 px-3">
              {fields.find((f) => f.key === block.fieldKey)?.label || block.fieldKey}
            </Badge>
          )}
          {/* Toolbar on hover */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, "up");
              }}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                moveBlock(block.id, "down");
              }}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(block.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Inline editor panel */}
        {isSelected && (
          <div className="mt-2 p-3 bg-white border rounded-lg shadow-md space-y-2 animate-in slide-in-from-top-2">
            {block.type === "text" && (
              <Textarea
                value={block.content || ""}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                rows={2}
                placeholder="Enter text"
              />
            )}
            {block.type === "heading" && (
              <Input
                value={block.content || ""}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="Heading text"
              />
            )}
            {block.type === "image" && (
              <div className="space-y-2">
                <Input
                  placeholder="Image URL"
                  value={block.props?.src || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      props: { ...block.props, src: e.target.value },
                    })
                  }
                />
                <Input
                  placeholder="Alt text"
                  value={block.props?.alt || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      props: { ...block.props, alt: e.target.value },
                    })
                  }
                />
              </div>
            )}
            {block.type === "spacer" && (
              <div className="flex items-center gap-2">
                <Label className="text-xs">Height (px)</Label>
                <Input
                  type="number"
                  value={block.props?.height || 24}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      props: { ...block.props, height: Number(e.target.value) },
                    })
                  }
                  className="w-20 h-7 text-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---------- Render a row (visual grid) ----------
  const renderRow = (row: LayoutBlock, sectionId: string) => {
    const cols = row.props?.columns || 2;
    return (
      <div className="bg-white rounded-xl border shadow-sm mb-3">
        {/* Row header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-blue-500" />
            <Label className="text-xs font-medium">Row</Label>
            <Select
              value={String(cols)}
              onValueChange={(v) =>
                updateBlock(row.id, { props: { ...row.props, columns: Number(v) } })
              }
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 col</SelectItem>
                <SelectItem value="2">2 cols</SelectItem>
                <SelectItem value="3">3 cols</SelectItem>
                <SelectItem value="4">4 cols</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(row.id, "up")}><ArrowUp className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(row.id, "down")}><ArrowDown className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBlock(row.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
          </div>
        </div>

        {/* Grid preview */}
        {previewGrid && (
          <div className="flex gap-1 px-3 py-1 bg-white">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="flex-1 h-4 bg-blue-50 rounded border border-blue-200" />
            ))}
          </div>
        )}

        {/* Row children */}
        <div
          className={`grid gap-3 p-3 ${
            cols === 2
              ? "grid-cols-2"
              : cols === 3
              ? "grid-cols-3"
              : cols === 4
              ? "grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {(row.children || []).map((child) => (
            <div key={child.id} className="min-h-[60px]">
              {renderBlockEditor(child)}
            </div>
          ))}
        </div>

        {/* Add block toolbar */}
        <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
          <Select onValueChange={(v) => addFieldToRow(row.id, v)}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue placeholder="+ Field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((f) => (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => addBlock(row.id, "text")}>
            <Type className="h-3 w-3 mr-1" /> Text
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addBlock(row.id, "image")}>
            <ImageIcon className="h-3 w-3 mr-1" /> Image
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addBlock(row.id, "heading")}>
            <Heading className="h-3 w-3 mr-1" /> Heading
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addBlock(row.id, "divider")}>
            <Minus className="h-3 w-3 mr-1" /> Divider
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addBlock(row.id, "spacer")}>
            <Space className="h-3 w-3 mr-1" /> Spacer
          </Button>
        </div>
      </div>
    );
  };

  // ---------- Render a section ----------
  const renderSection = (section: LayoutBlock) => (
    <div key={section.id} className="border-2 border-dashed border-amber-200 rounded-2xl p-4 mb-4 bg-amber-50/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <LayoutGrid className="h-5 w-5 text-amber-500" />
          <Input
            value={section.props?.title || ""}
            onChange={(e) =>
              updateBlock(section.id, { props: { ...section.props, title: e.target.value } })
            }
            className="h-8 text-sm font-semibold border-transparent bg-transparent focus:bg-white w-40"
            placeholder="Section title"
          />
          <Input
            value={section.props?.description || ""}
            onChange={(e) =>
              updateBlock(section.id, { props: { ...section.props, description: e.target.value } })
            }
            className="h-8 text-sm border-transparent bg-transparent focus:bg-white flex-1"
            placeholder="Description"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => moveBlock(section.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => moveBlock(section.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => removeBlock(section.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </div>

      {/* Section children (rows and direct blocks) */}
      <div className="space-y-3">
        {(section.children || []).map((child) => {
          if (child.type === "row") return renderRow(child, section.id);
          // Direct non‑row blocks are rare but possible
          return (
            <div key={child.id} className="flex items-center gap-2">
              {renderBlockEditor(child)}
            </div>
          );
        })}

        {/* Add row / block to section */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="ghost"
            className="flex-1 border-2 border-dashed border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-600"
            onClick={() => addBlock(section.id, "row")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Row
          </Button>
          {/* Rarely would you add non‑row directly to section, but we can keep a small menu */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Visual Layout Builder</h2>
          <div className="flex items-center gap-2">
            <Switch id="preview-grid" checked={previewGrid} onCheckedChange={setPreviewGrid} />
            <Label htmlFor="preview-grid" className="text-xs flex items-center gap-1">
              {previewGrid ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Grid Preview
            </Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={autoGenerate} variant="outline" size="sm">
            <Wand2 className="h-4 w-4 mr-1" /> Auto Layout
          </Button>
          <Button onClick={addSection} size="sm" className="gap-1">
            <LayoutGrid className="h-4 w-4" /> Add Section
          </Button>
          {blocks.length > 0 && (
            <Button onClick={clearAll} variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gradient-to-br from-white to-amber-50/30">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-amber-300" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Design Your Form Layout</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add sections, rows, and fill them with fields and blocks. Toggle Grid Preview to see column structure.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={autoGenerate} className="gap-2">
              <Wand2 className="h-4 w-4" /> Auto-generate from Fields
            </Button>
            <Button onClick={addSection} variant="outline" className="gap-2">
              <LayoutGrid className="h-4 w-4" /> Add Section
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">{blocks.map((block) => renderSection(block))}</div>
      )}
    </div>
  );
}