"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/api";
import { Subscription } from "@/types/plan/subscription";
import { useState } from "react";

type Props = {
  subscriptions: Subscription[];
  reload: () => void;
};

export default function SubscriptionTable({ subscriptions, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const cancelSub = async (id: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/subscriptions/${id}/cancel`);
      toast.success("Subscription cancelled");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setLoadingId(null);
    }
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    trial: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Billing Cycle</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No subscriptions found.
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.user?.name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                    <Badge variant="outline" className="text-xs mt-1 capitalize">
                      {sub.user?.role}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{sub.plan?.name || sub.plan?._id}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColor[sub.status] || "bg-gray-100"
                    }`}
                  >
                    {sub.status}
                  </span>
                </TableCell>
                <TableCell>{sub.billingCycle}</TableCell>
                <TableCell>{new Date(sub.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelSub(sub._id)}
                    disabled={loadingId === sub._id || sub.status !== "active"}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}