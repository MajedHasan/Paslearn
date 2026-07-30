"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";
import { Theme } from "@/types/theme/theme";
import ThemeDialog from "./ThemeDialog";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

type Props = {
  themes: Theme[];
  reload: () => void;
};

export default function ThemeTable({ themes, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActive = async (id: string) => {
    try {
      setLoadingId(id);
      await api.patch(`/themes/admin/${id}/toggle`);
      toast.success("Status updated");
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteTheme = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/themes/admin/${id}`);
      toast.success("Theme deleted");
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  console.log("themes", themes);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Theme</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Pages / Modules</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {themes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No themes found.
              </TableCell>
            </TableRow>
          ) : (
            themes.map((theme) => (
              <TableRow key={theme._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {theme.thumbnail ? (
                      <img
                        src={theme.thumbnail}
                        alt={theme.name}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {theme.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{theme.name}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {theme.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {theme.tags?.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{theme.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {theme.category ? (
                    <Badge variant="outline">{theme.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant="outline">{theme.pages.length} pages</Badge>
                    <Badge variant="outline">{theme.modules.length} modules</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={theme.isActive}
                      disabled={loadingId === theme._id}
                      onCheckedChange={() => toggleActive(theme._id)}
                    />
                    <span className="text-sm">{theme.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ThemeDialog theme={theme} onSaved={reload} triggerLabel="Edit" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTheme(theme._id)}
                      disabled={loadingId === theme._id}
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