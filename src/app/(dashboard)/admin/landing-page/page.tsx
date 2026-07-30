"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageTemplate } from "@/types/theme/pageTemplate";
import PageTemplateTable from "./_components/PageTemplateTable";
import PageTemplateDialog from "./_components/PageTemplateDialog";

export default function PageTemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/page-templates");
      setTemplates(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Page Templates</h1>
          <p className="text-sm text-muted-foreground">Reusable page designs for themes.</p>
        </div>
      </div>
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Templates</CardTitle>
          <PageTemplateDialog onSaved={load} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <PageTemplateTable templates={templates} reload={load} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}