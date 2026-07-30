"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/api";
import { ThemeCategory } from "@/types/theme/themeCategory";
import ThemeCategoryDialog from "./ThemeCategoryDialog";
import { useState } from "react";

type Props = {
  categories: ThemeCategory[];
  reload: () => void;
};

export default function ThemeCategoryTable({ categories, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteCategory = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/theme-categories/${id}`);
      toast.success("Category deleted");
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
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                No categories found.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ThemeCategoryDialog category={cat} onSaved={reload} triggerLabel="Edit" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCategory(cat._id)}
                      disabled={loadingId === cat._id}
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