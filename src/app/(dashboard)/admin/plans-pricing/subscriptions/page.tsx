"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import SubscriptionTable from "./_components/SubscriptionTable";
import { Subscription } from "@/types/plan/subscription";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subscriptions/admin");
      setSubscriptions(res?.data?.data || res?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Monitor all user subscriptions.
        </p>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>
          ) : (
            <SubscriptionTable subscriptions={subscriptions} reload={loadSubscriptions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}