"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle,
  Edit, Trash2, Eye,
} from "lucide-react";
import { IBooking } from "@/types/forms/booking/booking";
import BookingDialog from "./_components/BookingDialog";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<IBooking | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/admin");
      setBookings(res?.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleUpdateStatus = async (id: string, status: string, meetingLink?: string) => {
    setSaving(true);
    try {
      await api.patch(`/bookings/admin/${id}/status`, { status, meetingLink });
      toast.success("Booking updated");
      setDialogOpen(false);
      loadBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);
  const deleteBooking = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/bookings/admin/${deleteId}`);
      toast.success("Booking deleted");
      setDeleteId(null);
      loadBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const openEdit = (booking: IBooking) => {
    setEditingBooking(booking);
    setDialogOpen(true);
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <AlertCircle className="h-4 w-4" />,
    confirmed: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
    completed: <PlayCircle className="h-4 w-4" />,
  };

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Manage student‑teacher sessions and appointments.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No bookings yet</p>
              <p className="text-sm">Bookings will appear here once students schedule sessions.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p>{booking.teacher?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{booking.teacher?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.student ? (
                        <div>
                          <p>{booking.student.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.student.email}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                        <Clock className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                        <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColor[booking.status]} gap-1`}>
                        {statusIcon[booking.status]}
                        <span className="capitalize">{booking.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(booking)}>
                          <Edit className="h-4 w-4 mr-1" /> Manage
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDelete(booking._id)}>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The time slot will be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBooking} className="bg-destructive text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={editingBooking}
        onSave={handleUpdateStatus}
        saving={saving}
      />
    </div>
  );
}