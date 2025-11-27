import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText, Calendar, Clock } from "lucide-react";
import type { QueueEntry } from "@/types/queue";
import { cn } from "@/lib/utils";

interface VisitLogSectionProps {
  entries: QueueEntry[];
}

export const VisitLogSection = ({ entries }: VisitLogSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedEntries = entries.filter(
    (entry) => entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show" || entry.status === "booked"
  );

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
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
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2 border-primary/20">
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
                  completedEntries.map((entry, index) => {
                    const isBookingEntry = !entry.queueNumber && entry.notes?.includes("Book Appointment - ClynicQ");
                    return (
                      <TableRow 
                        key={entry.id}
                        className={cn(
                          "transition-colors hover:bg-muted/30",
                          isBookingEntry 
                            ? "bg-primary/5 border-l-4 border-l-primary" 
                            : "bg-accent/5 border-l-4 border-l-accent",
                          index % 2 === 0 ? "bg-opacity-50" : ""
                        )}
                      >
                        <TableCell className="font-medium">
                          {isBookingEntry ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                              <Calendar className="h-3 w-3 mr-1" />
                              Appt
                            </Badge>
                          ) : (
                            <span className="text-accent font-bold">{entry.queueNumber}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {isBookingEntry ? (
                            <span className="text-muted-foreground/60">-</span>
                          ) : (
                            <div className="flex items-center gap-1 text-accent">
                              <Clock className="h-3 w-3" />
                              {entry.joinedAt}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {entry.status === "completed" && entry.joinedAt ? (
                            <span className="text-status-arrived">{entry.joinedAt}</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium">
                          {entry.duration ? `${entry.duration} mins` : "-"}
                        </TableCell>
                        <TableCell>
                          {entry.visitCategory ? (
                            <Badge variant="secondary" className="bg-secondary/20">
                              {entry.visitCategory}
                            </Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {isBookingEntry ? (
                            <span className="text-primary">{entry.email || "-"}</span>
                          ) : (
                            <span className="text-accent">{entry.mobile || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isBookingEntry ? (
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <Calendar className="h-3 w-3" />
                              {entry.joinedAt}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground italic">
                          {entry.notes || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10"></div>
              <span className="text-muted-foreground">Appointment Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-accent bg-accent/10"></div>
              <span className="text-muted-foreground">Queue Visits</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-3 italic">
            Note: No medical records, billing, or diagnosis stored. Queue and booking tracking only.
          </p>
        </CardContent>
      )}
    </Card>
  );
};
