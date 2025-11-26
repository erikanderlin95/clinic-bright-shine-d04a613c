export type QueueStatus = "waiting" | "arrived" | "late" | "cancelled" | "no-show" | "completed";

export type VisitCategory = "Consultation" | "Follow-up" | "General Treatment" | "Standard Visit";

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
}

export interface DailySummary {
  totalQueue: number;
  arrived: number;
  cancelled: number;
  noShows: number;
  avgWaitTime: string;
}
