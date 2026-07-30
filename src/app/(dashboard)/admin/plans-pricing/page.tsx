"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PlanTable from "./_components/PlanTable";
import PlanDialog from "./_components/PlanDialog";
import { Plan } from "@/types/plan/plan";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/plans/admin");
      setPlans(res?.data?.data || res?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Plans & Pricing</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage subscription plans.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Plans</CardTitle>
          <div className="flex flex-row items-center gap-2">
            <PlanDialog onSaved={loadPlans} />
            <Button asChild>
              <Link href="/admin/plans-pricing/plan-features">Features</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/plans-pricing/subscriptions">Subscriptions</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <PlanTable plans={plans} reload={loadPlans} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}