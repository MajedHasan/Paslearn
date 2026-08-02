export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface IBooking {
  _id: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}