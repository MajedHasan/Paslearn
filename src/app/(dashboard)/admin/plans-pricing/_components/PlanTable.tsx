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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";
import { Plan } from "@/types/plan/plan";
import PlanDialog from "./PlanDialog";
import { useState } from "react";

type Props = {
  plans: Plan[];
  reload: () => void;
};

export default function PlanTable({ plans, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActive = async (id: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/plans/admin/${id}/toggle`);
      toast.success("Plan status updated");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle");
    } finally {
      setLoadingId(null);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/plans/admin/${id}`);
      toast.success("Plan deleted");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No plans found.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-medium">
                  {plan.badge && (
                    <Badge variant="secondary" className="mr-2">
                      {plan.badge}
                    </Badge>
                  )}
                  {plan.name}
                </TableCell>
                <TableCell>{plan.slug}</TableCell>
                <TableCell>
                  {plan.price.amount === 0
                    ? "Free"
                    : `${plan.price.currency} ${plan.price.amount}`}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{plan.price.billingCycle}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {f.label}
                      </Badge>
                    ))}
                    {plan.features.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{plan.features.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {plan.applicableTo.map((role) => (
                      <Badge key={role} variant="outline" className="capitalize">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isActive}
                      disabled={loadingId === plan._id}
                      onCheckedChange={() => toggleActive(plan._id)}
                    />
                    <span className="text-sm">{plan.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PlanDialog plan={plan} onSaved={reload} triggerLabel="Edit" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePlan(plan._id)}
                      disabled={loadingId === plan._id}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}