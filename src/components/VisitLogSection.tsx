import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FileText, Calendar, Clock } from "lucide-react";
import type { QueueEntry } from "@/types/queue";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

interface VisitLogSectionProps {
  entries: QueueEntry[];
}

export const VisitLogSection = ({ entries }: VisitLogSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const completedEntries = entries.filter(
    (entry) => entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show" || entry.status === "booked"
  );

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5" />
            {t("visitLog")}
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
                {t("collapse")}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {t("expand")}
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
                  <TableHead className="w-[100px]">{t("queueNo")}</TableHead>
                  <TableHead className="w-[100px]">{t("joinedQ")}</TableHead>
                  <TableHead className="w-[100px]">{t("completedCol")}</TableHead>
                  <TableHead className="w-[100px]">{t("durationCol")}</TableHead>
                  <TableHead className="w-[140px]">{t("visitCategoryCol")}</TableHead>
                  <TableHead className="w-[180px]">{t("emailMobile")}</TableHead>
                  <TableHead className="w-[200px]">{t("appointmentTime")}</TableHead>
                  <TableHead>{t("notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {t("noCompletedVisits")}
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
                            <Badge variant="outline" className="bg-primary/10 text-foreground border-primary/30">
                              <Calendar className="h-3 w-3 mr-1" />
                              Appt
                            </Badge>
                          ) : (
                            <span className="text-foreground font-bold">{entry.queueNumber}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {isBookingEntry ? (
                            <span className="text-foreground/60">-</span>
                          ) : (
                            <div className="flex items-center gap-1 text-foreground">
                              <Clock className="h-3 w-3" />
                              {entry.joinedAt}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {entry.status === "completed" && entry.joinedAt ? (
                            <span className="text-foreground">{entry.joinedAt}</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {entry.duration ? `${entry.duration} mins` : "-"}
                        </TableCell>
                        <TableCell>
                          {entry.visitCategory ? (
                            <Badge variant="secondary" className="bg-secondary/20 text-foreground">
                              {entry.visitCategory}
                            </Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {isBookingEntry ? (
                            <span className="text-foreground">{entry.email || "-"}</span>
                          ) : (
                            <span className="text-foreground">{entry.mobile || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {isBookingEntry ? (
                            <div className="flex items-center gap-1 text-foreground font-medium">
                              <Calendar className="h-3 w-3" />
                              {entry.joinedAt}
                            </div>
                          ) : (
                            <span className="text-foreground/60">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-foreground italic">
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
              <span className="text-foreground">{t("appointmentBookings")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-accent bg-accent/10"></div>
              <span className="text-foreground">{t("queueVisits")}</span>
            </div>
          </div>
          <p className="text-xs text-foreground/70 mt-3 italic">{t("visitLogNote")}</p>
        </CardContent>
      )}
    </Card>
  );
};
