import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { QueueEntry } from "@/types/queue";

interface VisitLogSectionProps {
  entries: QueueEntry[];
}

export const VisitLogSection = ({ entries }: VisitLogSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedEntries = entries.filter(
    (entry) => entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show" || entry.status === "booked"
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visit Log (Optional)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Queue No</TableHead>
                  <TableHead className="w-[100px]">Joined Q</TableHead>
                  <TableHead className="w-[100px]">Completed</TableHead>
                  <TableHead className="w-[100px]">Duration</TableHead>
                  <TableHead className="w-[140px]">Visit Category</TableHead>
                  <TableHead className="w-[180px]">Email / Mobile</TableHead>
                  <TableHead className="w-[200px]">Appointment Time (External Calendar)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No completed visits yet
                    </TableCell>
                  </TableRow>
                ) : (
                  completedEntries.map((entry) => {
                    const isBookingEntry = !entry.queueNumber && entry.notes?.includes("Book Appointment – ClynicQ");
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {isBookingEntry ? "-" : entry.queueNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {isBookingEntry ? "-" : `Joined Q – ${entry.joinedAt}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.status === "completed" && entry.joinedAt ? entry.joinedAt : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.duration ? `${entry.duration} mins` : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.visitCategory || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {isBookingEntry ? (entry.email || "-") : (entry.mobile || "-")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {isBookingEntry ? entry.joinedAt : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: No medical records, billing, or diagnosis stored. Queue and booking tracking only.
          </p>
        </CardContent>
      )}
    </Card>
  );
};
