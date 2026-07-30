"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";
import {
  ArrowRight, Sparkles, Palette, FileText, Puzzle, ImageIcon, X, Upload,
} from "lucide-react";
import { Theme, ThemeFormValues, ThemeGlobalStyles } from "@/types/theme/theme";

const defaultColors: ThemeGlobalStyles["colors"] = {
  primary: "#0177fb",
  secondary: "#0156c7",
  accent: "#f59e0b",
  background: "#ffffff",
  text: "#101828",
  heading: "#101828",
};

const defaultFonts: ThemeGlobalStyles["fonts"] = {
  heading: "Inter",
  body: "Inter",
};

const defaultGlobalStyles: ThemeGlobalStyles = {
  colors: { ...defaultColors },
  fonts: { ...defaultFonts },
  borderRadius: "0.5rem",
  spacing: "1rem",
  customCSS: "",
};

const emptyForm: ThemeFormValues = {
  name: "",
  slug: "",
  description: "",
  thumbnail: "",
  category: "",
  tags: [],
  isActive: true,
  sortOrder: 0,
  globalStyles: { ...defaultGlobalStyles, colors: { ...defaultColors }, fonts: { ...defaultFonts } },
  pages: [],
  modules: [],
  version: "1.0.0",
  author: "",
};

// Predefined palettes
const COLOR_PALETTE = [
  "#0177fb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#d946ef",
];

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Playfair Display", "Montserrat",
  "Open Sans", "Lato", "Raleway", "Nunito", "Merriweather",
];

const BORDER_RADIUS_OPTIONS = [
  { label: "None", value: "0" },
  { label: "Small (0.25rem)", value: "0.25rem" },
  { label: "Medium (0.5rem)", value: "0.5rem" },
  { label: "Large (1rem)", value: "1rem" },
  { label: "Pill (9999px)", value: "9999px" },
];

const SPACING_OPTIONS = [
  { label: "Compact (0.5rem)", value: "0.5rem" },
  { label: "Normal (1rem)", value: "1rem" },
  { label: "Relaxed (1.5rem)", value: "1.5rem" },
  { label: "Spacious (2rem)", value: "2rem" },
];

type Props = {
  theme?: Theme | null;
  onSaved: () => void;
  triggerLabel?: string;
};

export default function ThemeDialog({ theme, onSaved, triggerLabel = "Add Theme" }: Props) {
  const isEdit = !!theme;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<ThemeFormValues>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [pageTemplates, setPageTemplates] = useState<any[]>([]);
  const [modulePresets, setModulePresets] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  // Load catalogs when dialog opens
  useEffect(() => {
    if (open) {
      const loadCatalogs = async () => {
        try {
          const [catRes, pageRes, modRes] = await Promise.all([
            api.get("/theme-categories"),
            api.get("/page-templates"),
            api.get("/module-presets"),
          ]);
          setCategories(catRes.data.data || []);
          setPageTemplates(pageRes.data.data || []);
          setModulePresets(modRes.data.data || []);
        } catch (err) {
          toast.error("Failed to load catalogs");
        }
      };
      loadCatalogs();

      if (theme) {
        setValues({
          name: theme.name,
          slug: theme.slug,
          description: theme.description || "",
          thumbnail: theme.thumbnail || "",
          category: theme.category?._id || "",
          tags: theme.tags || [],
          isActive: theme.isActive,
          sortOrder: theme.sortOrder,
          globalStyles: theme.globalStyles || defaultGlobalStyles,
          pages: theme.pages?.map((p) => p._id) || [],
          modules: theme.modules?.map((m) => m._id) || [],
          version: theme.version || "1.0.0",
          author: theme.author || "",
        });
      } else {
        setValues(emptyForm);
      }
      setTagInput("");
    }
  }, [open, theme]);

  // Auto slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValues({
      ...values,
      name,
      slug: isEdit ? values.slug : slug,
    });
  };

  // File upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data.url;
      setValues({ ...values, thumbnail: url });
      toast.success("Thumbnail uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
    //   const res = await api.post("/uploads", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });
    //   const url = res.data.url;
    //   setValues({ ...values, thumbnail: url });
    //   toast.success("Thumbnail uploaded");
    // } catch (err: any) {
    //   toast.error(err.response?.data?.message || "Upload failed");
    // } finally {
    //   setUploading(false);
    // }
  };

  // Tags
  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !values.tags.includes(newTag)) {
      setValues({ ...values, tags: [...values.tags, newTag] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValues({ ...values, tags: values.tags.filter((t) => t !== tag) });
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        // Pages and modules are already arrays of IDs
      };
      if (isEdit && theme) {
        await api.patch(`/themes/admin/${theme._id}`, payload);
        toast.success("Theme updated");
      } else {
        await api.post("/themes/admin", payload);
        toast.success("Theme created");
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90">
          {isEdit ? "Edit" : triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Theme Builder
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {isEdit ? "Edit Mode" : "Create Mode"}
            </Badge>
          </div>
          <DialogTitle className="mt-3 text-2xl font-bold">
            {isEdit ? "Edit Theme" : "Create New Theme"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Design every aspect of the theme: styles, pages, and module presets.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <section className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={values.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Modern Pro"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={values.slug}
                  onChange={(e) => setValues({ ...values, slug: e.target.value })}
                  placeholder="modern-pro"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={values.description}
                  onChange={(e) => setValues({ ...values, description: e.target.value })}
                  placeholder="A clean, modern theme for course creators..."
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={values.category}
                  onValueChange={(v) => setValues({ ...values, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {values.thumbnail ? (
                      <img src={values.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploading}
                    />
                    {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                    <p className="text-xs text-muted-foreground mt-1">Or paste a URL in the field below</p>
                    <Input
                      value={values.thumbnail}
                      onChange={(e) => setValues({ ...values, thumbnail: e.target.value })}
                      placeholder="https://example.com/thumb.jpg"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {values.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  value={values.version}
                  onChange={(e) => setValues({ ...values, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  value={values.author}
                  onChange={(e) => setValues({ ...values, author: e.target.value })}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={values.sortOrder}
                  onChange={(e) => setValues({ ...values, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-4 self-end">
                <Label>Active</Label>
                <Switch
                  checked={values.isActive}
                  onCheckedChange={(checked) => setValues({ ...values, isActive: checked })}
                />
              </div>
            </div>
          </section>

          {/* Global Styles */}
          <section className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Global Styles</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(values.globalStyles.colors).map(([key, color]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          globalStyles: {
                            ...values.globalStyles,
                            colors: { ...values.globalStyles.colors, [key]: e.target.value },
                          },
                        })
                      }
                      className="w-12 h-10 p-1"
                    />
                    <Select
                      value={color}
                      onValueChange={(val) =>
                        setValues({
                          ...values,
                          globalStyles: {
                            ...values.globalStyles,
                            colors: { ...values.globalStyles.colors, [key]: val },
                          },
                        })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_PALETTE.map((c) => (
                          <SelectItem key={c} value={c}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />
                              {c}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {/* Fonts */}
              {Object.entries(values.globalStyles.fonts).map(([key, font]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">Font: {key}</Label>
                  <Select
                    value={font}
                    onValueChange={(val) =>
                      setValues({
                        ...values,
                        globalStyles: {
                          ...values.globalStyles,
                          fonts: { ...values.globalStyles.fonts, [key]: val },
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {/* Border Radius */}
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={values.globalStyles.borderRadius}
                  onValueChange={(val) =>
                    setValues({
                      ...values,
                      globalStyles: { ...values.globalStyles, borderRadius: val },
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BORDER_RADIUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Spacing */}
              <div className="space-y-2">
                <Label>Spacing</Label>
                <Select
                  value={values.globalStyles.spacing}
                  onValueChange={(val) =>
                    setValues({
                      ...values,
                      globalStyles: { ...values.globalStyles, spacing: val },
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPACING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Custom CSS</Label>
              <Textarea
                value={values.globalStyles.customCSS}
                onChange={(e) =>
                  setValues({
                    ...values,
                    globalStyles: { ...values.globalStyles, customCSS: e.target.value },
                  })
                }
                className="font-mono text-xs min-h-24"
                placeholder=".hero { background: linear-gradient(...); }"
              />
            </div>
          </section>

          {/* Pages Selection */}
          <section className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Page Templates</h3>
            </div>
            <MultiSelect
              options={pageTemplates.map((p: any) => ({
                label: `${p.name} (${p.type})`,
                value: p._id,
              }))}
              selected={values.pages}
              onChange={(selected) => setValues({ ...values, pages: selected })}
              placeholder="Select page templates..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Choose the pages included in this theme.
            </p>
          </section>

          {/* Modules Selection */}
          <section className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Puzzle className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Module Presets</h3>
            </div>
            <MultiSelect
              options={modulePresets.map((m: any) => ({
                label: `${m.label} (${m.type})`,
                value: m._id,
              }))}
              selected={values.modules}
              onChange={(selected) => setValues({ ...values, modules: selected })}
              placeholder="Select module presets..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select pre-configured modules for this theme.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}