"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";

interface SidebarProps {
  category: string;
  setCategory: (value: string) => void;
  level: CourseLevel;
  setLevel: (value: CourseLevel) => void;
  minPrice?: number;
  setMinPrice: (value?: number) => void;
  maxPrice?: number;
  setMaxPrice: (value?: number) => void;
  minRating?: number;
  setMinRating: (value?: number) => void;
  clearFilters: () => void;
}

const categories = ["development", "design", "marketing", "business", "data-science"];

export default function Sidebar({
  category,
  setCategory,
  level,
  setLevel,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  clearFilters,
}: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
          Category
        </h3>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
          Level
        </h3>
        <div className="space-y-2">
          {[
            { value: "all", label: "All Levels" },
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ].map((item) => (
            <label key={item.value} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={level === item.value}
                onCheckedChange={() => setLevel(item.value as CourseLevel)}
              />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-20"
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
            className="w-20"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700">
          Minimum Rating
        </h3>
        <Select
          value={minRating ? minRating.toString() : "0"}
          onValueChange={(v) => setMinRating(v ? Number(v) : undefined)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
}