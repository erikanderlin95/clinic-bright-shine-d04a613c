export type QueueStatus = "waiting" | "arrived" | "late" | "cancelled" | "no-show" | "completed" | "booked";

export type VisitCategory = "Consultation" | "Follow-up" | "General Treatment" | "Standard Visit";

export type PatientType = "walk-in" | "booking";

export interface QueueEntry {
  id: string;
  queueNumber: string;
  status: QueueStatus;
  previousStatus?: QueueStatus;
  joinedAt: string;
  name?: string;
  mobile: string;
  email?: string;
  queueSource: "Walk-in" | "Phone Booking" | "Other";
  notes?: string;
  duration?: number;
  visitCategory?: VisitCategory;
  checkInCode?: string;
  patientType?: PatientType;
  appointmentTime?: string;
}

export interface DailySummary {
  liveQueue: number;
  bookingsToday: number;
  arrived: number;
  cancelled: number;
  noShows: number;
  avgWaitTime: string;
}

export type LeadStatus = "new" | "contacted" | "booked" | "closed";

export interface BookingLead {
  id: string;
  caseId: string;
  patientName: string;
  mobile: string;
  preferredDateTime?: string;
  source: "QR" | "Marketplace";
  timestamp: string;
  status: LeadStatus;
  notes?: string;
}
