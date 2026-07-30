"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PlanFeatureTable from "./_components/PlanFeatureTable";
import PlanFeatureDialog from "./_components/PlanFeatureDialog";
import { PlanFeature } from "@/types/plan/planFeature";

export default function PlanFeaturesPage() {
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const res = await api.get("/plan-features");
      setFeatures(res?.data?.data || res?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load features");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Plan Features</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable feature templates for your plans.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Feature Catalog</CardTitle>
          <PlanFeatureDialog onSaved={loadFeatures} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <PlanFeatureTable features={features} reload={loadFeatures} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}