"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageTemplate } from "@/types/theme/pageTemplate";
import PageTemplateDialog from "./PageTemplateDialog";
import { useState } from "react";

type Props = {
  templates: PageTemplate[];
  reload: () => void;
};

export default function PageTemplateTable({ templates, reload }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteTemplate = async (id: string) => {
    try {
      setLoadingId(id);
      await api.delete(`/page-templates/${id}`);
      toast.success("Template deleted");
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
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                No page templates found.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((tpl) => (
              <TableRow key={tpl._id}>
                <TableCell className="font-medium">{tpl.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tpl.type}</Badge>
                </TableCell>
                <TableCell>{tpl.isDefault ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PageTemplateDialog template={tpl} onSaved={reload} triggerLabel="Edit" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTemplate(tpl._id)}
                      disabled={loadingId === tpl._id}
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