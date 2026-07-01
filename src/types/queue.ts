export type QueueStatus = "waiting" | "arrived" | "late" | "cancelled" | "no-show" | "completed" | "booked" | "notified";

export type VisitCategory = "Consultation" | "Follow-up" | "Others";

export type RemarksInfo = {
  category: VisitCategory;
  othersDetail?: string;
};

export type PatientType = "walk-in" | "non-digital";

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
  remarksDetail?: string;
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
