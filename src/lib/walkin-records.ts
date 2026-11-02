import { format, startOfDay, subDays, parseISO } from "date-fns";
import type { QueueEntry } from "@/types/queue";

export const getWalkinRecords = (entries: QueueEntry[], now = new Date()) => {
  const today = startOfDay(now);
  const oldest = subDays(today, 29);
  return entries.filter((entry) => {
    if (!["completed", "cancelled", "no-show"].includes(entry.status)) return false;
    const date = parseISO(entry.visitDate || format(today, "yyyy-MM-dd"));
    return date >= oldest && date <= today;
  }).sort((a, b) =>
    (b.visitDate || format(today, "yyyy-MM-dd")).localeCompare(a.visitDate || format(today, "yyyy-MM-dd")) ||
    b.joinedAt.localeCompare(a.joinedAt)
  );
};