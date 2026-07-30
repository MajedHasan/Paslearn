"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { NotificationEmail } from "@/types/forms/shared/form.interface";

interface Props {
  notifications: NotificationEmail[];
  onChange: (notifications: NotificationEmail[]) => void;
}

export default function NotificationsPanel({ notifications, onChange }: Props) {
  const addNotification = () => {
    onChange([
      ...notifications,
      { to: [], subject: "", body: "", trigger: "on_submit" },
    ]);
  };

  const updateNotification = (index: number, patch: Partial<NotificationEmail>) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeNotification = (index: number) => {
    onChange(notifications.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Email Notifications</h2>
        <Button onClick={addNotification} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Notification
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        {notifications.map((notif, idx) => (
          <div key={idx} className="rounded-xl border p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">#{idx + 1}</Badge>
              <Button variant="ghost" size="icon" onClick={() => removeNotification(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>To (comma separated)</Label>
                <Input
                  value={notif.to.join(", ")}
                  onChange={(e) =>
                    updateNotification(idx, { to: e.target.value.split(",").map((s) => s.trim()) })
                  }
                  placeholder="admin@example.com, {{email}}"
                />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={notif.trigger}
                  onValueChange={(value) => updateNotification(idx, { trigger: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_submit">On Submit</SelectItem>
                    <SelectItem value="on_approve">On Approve</SelectItem>
                    <SelectItem value="on_reject">On Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={notif.subject}
                  onChange={(e) => updateNotification(idx, { subject: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Body (HTML)</Label>
                <Textarea
                  value={notif.body}
                  onChange={(e) => updateNotification(idx, { body: e.target.value })}
                  className="min-h-24 font-mono text-sm"
                  placeholder="<p>Thank you for submitting, {{name}}!</p>"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}