"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ThemeTable from "./_components/ThemeTable";
import ThemeDialog from "./_components/ThemeDialog";
import { Theme } from "@/types/theme/theme";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/themes/admin");
      setThemes(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Theme Builder</h1>
          <p className="text-sm text-muted-foreground">
            Craft beautiful themes with pages and module presets.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Themes</CardTitle>
          <div className="flex items-center gap-2">
            <ThemeDialog onSaved={loadThemes} />
            <Button asChild>
              <Link href="/admin/theme-builder/theme-categories" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Theme Category</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/theme-builder/module-presets" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Module Presets</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <ThemeTable themes={themes} reload={loadThemes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}