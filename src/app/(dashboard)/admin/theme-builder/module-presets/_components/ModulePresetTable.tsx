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
import { ModulePreset } from "@/types/theme/modulePreset";
import ModulePresetDialog from "./ModulePresetDialog";
import { useState } from "react";

type Props = {
  presets: ModulePreset[];
  reload: () => void;
};

export default function ModulePresetTable({ presets, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deletePreset = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/module-presets/${id}`);
      toast.success("Preset deleted");
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {presets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                No module presets found.
              </TableCell>
            </TableRow>
          ) : (
            presets.map((preset) => (
              <TableRow key={preset._id}>
                <TableCell className="font-medium">{preset.label}</TableCell>
                <TableCell>{preset.key}</TableCell>
                <TableCell>
                  <Badge variant="outline">{preset.type}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ModulePresetDialog
                      preset={preset}
                      onSaved={reload}
                      triggerLabel="Edit"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePreset(preset._id)}
                      disabled={loadingId === preset._id}
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