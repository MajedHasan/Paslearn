"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FileText, Layers, BarChart3 } from "lucide-react";
import { IForm } from "@/types/forms/shared/form.interface";

export default function FormsPage() {
  const [forms, setForms] = useState<IForm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/forms/admin");
      setForms(res?.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const toggleForm = async (id: string) => {
    try {
      await api.patch(`/forms/admin/${id}/toggle`);
      toast.success("Form status updated");
      loadForms();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle");
    }
  };

  const deleteForm = async (id: string) => {
    try {
      await api.delete(`/forms/admin/${id}`);
      toast.success("Form deleted");
      loadForms();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Manage and publish your forms effortlessly.
          </p>
        </div>
        <Link href="/admin/forms/new">
          <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg gap-2">
            <Plus className="h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Forms Table */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-1/6" />
                  <Skeleton className="h-5 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-4 opacity-30" />
              <p className="text-lg font-medium">No forms yet</p>
              <p className="text-sm">
                Click <strong>Create Form</strong> to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form?._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-amber-600" />
                          </div>
                          {form.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {form.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {form.fields?.length || 0} fields
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {form.steps?.length ? (
                          <Badge variant="outline">
                            <Layers className="h-3 w-3 mr-1" />
                            {form.steps.length} steps
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={form.enabled}
                            onCheckedChange={() => toggleForm(form?._id)}
                          />
                          <span
                            className={`text-xs font-medium ${
                              form.enabled ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {form.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/forms/${form?._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/forms/${form?._id}/analytics`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteForm(form?._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}