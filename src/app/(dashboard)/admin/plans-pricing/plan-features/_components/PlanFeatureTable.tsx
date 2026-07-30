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
import { PlanFeature } from "@/types/plan/planFeature";
import PlanFeatureDialog from "./PlanFeatureDialog";
import { useState } from "react";

type Props = {
  features: PlanFeature[];
  reload: () => void;
};

export default function PlanFeatureTable({ features, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteFeature = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/plan-features/${id}`);
      toast.success("Feature deleted");
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
            <TableHead>Label</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No feature templates found.
              </TableCell>
            </TableRow>
          ) : (
            features.map((f) => (
              <TableRow key={f._id}>
                <TableCell className="font-medium">{f.label}</TableCell>
                <TableCell>{f.key}</TableCell>
                <TableCell>
                  <Badge variant="outline">{f.type}</Badge>
                </TableCell>
                <TableCell>
                  {f.type === "boolean"
                    ? f.defaultValue
                      ? "True"
                      : "False"
                    : String(f.defaultValue)}
                </TableCell>
                <TableCell>{f.unit || "—"}</TableCell>
                <TableCell>
                  <Badge variant={f.isActive ? "default" : "secondary"}>
                    {f.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PlanFeatureDialog
                      feature={f}
                      onSaved={reload}
                      triggerLabel="Edit"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFeature(f._id)}
                      disabled={loadingId === f._id}
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