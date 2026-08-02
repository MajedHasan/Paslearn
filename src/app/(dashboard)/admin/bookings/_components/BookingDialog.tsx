"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Clock, User, Mail, BookOpen, Video, FileText,
} from "lucide-react";
import { IBooking, BookingStatus } from "@/types/forms/booking/booking";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: IBooking | null;
  onSave: (id: string, status: string, meetingLink?: string) => Promise<void>;
  saving: boolean;
}

export default function BookingDialog({ open, onOpenChange, booking, onSave, saving }: Props) {
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && booking) {
      setStatus(booking.status);
      setMeetingLink(booking.meetingLink || "");
      setNotes(booking.notes || "");
    }
  }, [open, booking]);

  const handleSave = async () => {
    if (!booking) return;
    await onSave(booking._id, status, meetingLink);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Teacher info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Teacher:</span>
            <span>{booking.teacher?.name || "N/A"}</span>
            <span className="text-xs text-muted-foreground">({booking.teacher?.email})</span>
          </div>

          {/* Student info */}
          {booking.student && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Student:</span>
              <span>{booking.student.name}</span>
              <span className="text-xs text-muted-foreground">({booking.student.email})</span>
            </div>
          )}

          {/* Course info */}
          {booking.course && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Course:</span>
              <span>{booking.course.title}</span>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Date:</span>
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Time:</span>
            <span>{booking.startTime} – {booking.endTime}</span>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              Meeting Link
            </Label>
            <Input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            {saving ? "Saving..." : "Update Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}