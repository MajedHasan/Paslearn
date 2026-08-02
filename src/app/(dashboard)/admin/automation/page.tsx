"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Zap, Activity, CheckCircle2, Clock } from "lucide-react";
import { IAutomation } from "@/types/forms/automation/automation";
import AutomationDialog from "./_components/AutomationDialog";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<IAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<IAutomation | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/automations");
      setAutomations(res?.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load automations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAutomations(); }, []);

  const toggleAutomation = async (id: string) => {
    try {
      await api.patch(`/automations/${id}/toggle`);
      toast.success("Status updated");
      loadAutomations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle");
    }
  };

  const confirmDelete = (id: string) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const deleteAutomation = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/automations/${deleteId}`);
      toast.success("Automation deleted");
      setDeleteId(null);
      loadAutomations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const handleSave = async (payload: any) => {
    setSaving(true);
    try {
      if (editingAutomation) {
        await api.patch(`/automations/${editingAutomation._id}`, payload);
        toast.success("Automation updated");
      } else {
        await api.post("/automations", payload);
        toast.success("Automation created");
      }
      setDialogOpen(false);
      setEditingAutomation(null);
      loadAutomations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingAutomation(null);
    setDialogOpen(true);
  };

  const openEdit = (automation: IAutomation) => {
    setEditingAutomation(automation);
    setDialogOpen(true);
  };

  const total = automations.length;
  const active = automations.filter((a) => a.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Automations</h1>
          <p className="text-sm text-muted-foreground">
            Create intelligent workflows that react to events across your SaaS.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> Create Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total Automations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-sm text-muted-foreground">Executions Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Automations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No automations yet</p>
              <p className="text-sm">Click Create Automation to build your first workflow.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((auto) => (
                  <TableRow key={auto._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{auto.name}</p>
                          {auto.description && (
                            <p className="text-xs text-muted-foreground">{auto.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {auto.trigger.resource} · {auto.trigger.event}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {auto.steps.length} step{auto.steps.length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={auto.enabled}
                          onCheckedChange={() => toggleAutomation(auto._id)}
                        />
                        <span className={`text-xs ${auto.enabled ? "text-green-600" : "text-gray-400"}`}>
                          {auto.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(auto)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(auto._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All execution logs will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAutomation} className="bg-destructive text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Dialog */}
      <AutomationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        automation={editingAutomation}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}