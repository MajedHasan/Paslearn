"use client";

import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Experience } from "../utils/experience.types";
import ExperienceDialog from "./ExperienceDialog";
import { useState } from "react";

type Props = {
  experiences: Experience[];
  reload: () => void;
};

export default function ExperienceTable({ experiences, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleExperience = async (id: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/experiences/admin/${id}/toggle`);
      toast.success("Experience status updated");
      reload();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/experiences/admin/${id}`);
      toast.success("Experience deleted");
      reload();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete experience",
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border-[#E6E8EC] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Experiences</CardTitle>
        <ExperienceDialog onSaved={reload} triggerLabel="Add Experience" />
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No experiences found.
                  </TableCell>
                </TableRow>
              ) : (
                experiences.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type}</Badge>
                    </TableCell>
                    <TableCell>{item.componentKey}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={item.enabled}
                          disabled={loadingId === item._id}
                          onCheckedChange={() => toggleExperience(item._id)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <ExperienceDialog
                          experience={item}
                          onSaved={reload}
                          triggerLabel="Edit"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteExperience(item._id)}
                          disabled={loadingId === item._id}
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
      </CardContent>
    </Card>
  );
}
