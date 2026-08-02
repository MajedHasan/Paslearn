"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Experience } from "../utils/experience.types";
import ExperienceDialog from "./ExperienceDialog";
import { BarChart3, Edit, Trash2, Eye, Layers, Monitor, PanelTop, ArrowRightLeft } from "lucide-react";

type Props = { experiences: Experience[]; reload: () => void };

const typeBadge = (type: string) => {
  const map: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    full_page: { label: "Full Page", icon: <Monitor className="h-3 w-3" />, color: "bg-purple-100 text-purple-700" },
    popup: { label: "Popup", icon: <PanelTop className="h-3 w-3" />, color: "bg-amber-100 text-amber-700" },
    banner: { label: "Banner", icon: <Layers className="h-3 w-3" />, color: "bg-blue-100 text-blue-700" },
    redirect: { label: "Redirect", icon: <ArrowRightLeft className="h-3 w-3" />, color: "bg-green-100 text-green-700" },
  };
  return map[type] || { label: type, icon: null, color: "bg-gray-100 text-gray-700" };
};

export default function ExperienceTable({ experiences, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleExperience = async (id: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/experiences/admin/${id}/toggle`);
      toast.success("Status updated");
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle");
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Eye className="h-10 w-10 mb-4 opacity-30" />
        <p className="text-lg font-medium">No experiences found</p>
        <p className="text-sm">Create your first experience to start engaging users.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Experience</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiences.map(item => {
            const tb = typeBadge(item.type);
            return (
              <TableRow key={item._id} className="group hover:bg-amber-50/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Eye className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <code className="text-xs text-muted-foreground">{item.key}</code>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`gap-1 ${tb.color}`}>
                    {tb.icon} {tb.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.content ? (
                    <span className="text-sm text-muted-foreground">
                      {item.content.resourceType}: {item.content.resourceKey || item.content.resourceId || "—"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">{item.priority}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={item.enabled} disabled={loadingId === item._id} onCheckedChange={() => toggleExperience(item._id)} />
                    <span className={`text-xs font-medium ${item.enabled ? "text-green-600" : "text-gray-400"}`}>
                      {item.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <ExperienceDialog experience={item} onSaved={reload} triggerLabel="Edit" />
                    <Link href={`/admin/experiences/${item._id}/analytics`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><BarChart3 className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteExperience(item._id)} disabled={loadingId === item._id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}