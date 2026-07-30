"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ThemeCategory } from "@/types/theme/themeCategory";
import ThemeCategoryTable from "./_components/ThemeCategoryTable";
import ThemeCategoryDialog from "./_components/ThemeCategoryDialog";

export default function ThemeCategoriesPage() {
  const [categories, setCategories] = useState<ThemeCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/theme-categories");
      setCategories(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Theme Categories</h1>
          <p className="text-sm text-muted-foreground">
            Group your themes for easier browsing.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Categories</CardTitle>
          <ThemeCategoryDialog onSaved={load} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <ThemeCategoryTable categories={categories} reload={load} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}