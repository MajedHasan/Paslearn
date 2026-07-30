"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ModulePreset } from "@/types/theme/modulePreset";
import ModulePresetTable from "./_components/ModulePresetTable";
import ModulePresetDialog from "./_components/ModulePresetDialog";

export default function ModulePresetsPage() {
  const [presets, setPresets] = useState<ModulePreset[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/module-presets");
      setPresets(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load module presets");
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
          <h1 className="text-2xl font-bold text-[#101828]">Module Presets</h1>
          <p className="text-sm text-muted-foreground">
            Manage reusable module configurations for themes.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Presets</CardTitle>
          <ModulePresetDialog onSaved={load} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <ModulePresetTable presets={presets} reload={load} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}