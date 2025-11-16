export type QueueStatus = "waiting" | "arrived" | "late" | "cancelled" | "no-show" | "completed";

export interface QueueEntry {
  id: string;
  queueNumber: string;
  status: QueueStatus;
  joinedAt: string;
  notes?: string;
}

export interface DailySummary {
  totalQueue: number;
  arrived: number;
  cancelled: number;
  noShows: number;
  avgWaitTime: string;
}
