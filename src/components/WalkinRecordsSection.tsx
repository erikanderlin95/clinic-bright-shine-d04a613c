import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Download, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getWalkinRecords } from "@/lib/walkin-records";
import type { QueueEntry } from "@/types/queue";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

const ROWS_PER_PAGE = 30;

interface WalkinRecordsSectionProps {
  entries: QueueEntry[];
}

export const WalkinRecordsSection = ({ entries }: WalkinRecordsSectionProps) => {
  const { t } = useI18n();
  const [page, setPage] = useState(0);

  const walkinRecords = getWalkinRecords(entries);
  const pageCount = Math.max(1, Math.ceil(walkinRecords.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRecords = walkinRecords.slice(safePage * ROWS_PER_PAGE, (safePage + 1) * ROWS_PER_PAGE);

  const visitDate = (entry: QueueEntry) => entry.visitDate
    ? format(parseISO(entry.visitDate), "dd/MM/yyyy")
    : format(new Date(), "dd/MM/yyyy");

  const handleDownloadCSV = () => {
    const headers = ["Patient Name", "Visit Date", "Queue Number", "Arrival Time", "Status", "Reason / Notes"];
    const rows = walkinRecords.map((entry) => [
      entry.name || "-",
      visitDate(entry),
      entry.queueNumber,
      entry.joinedAt,
      entry.status,
      entry.notes || "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "walkin-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="border-b border-border/50 bg-muted/30 p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base sm:text-2xl text-foreground">
            <Users className="h-5 w-5" />
            {t("walkinRecordsTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-1.5">
                <Download className="h-4 w-4" />
                {t("downloadCSV")}
              </Button>
          </div>
        </div>
      </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2 border-primary/20">
                  <TableHead>{t("patientName")}</TableHead>
                  <TableHead>{t("visitDate")}</TableHead>
                  <TableHead>{t("queueNo")}</TableHead>
                  <TableHead>{t("arrivalTime")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {t("noWalkinRecords")}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRecords.map((entry, index) => (
                    <TableRow
                      key={entry.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        (safePage * ROWS_PER_PAGE + index) % 2 === 0 ? "bg-accent/5" : ""
                      )}
                    >
                      <TableCell className="font-medium text-foreground">{entry.name || "-"}</TableCell>
                      <TableCell className="text-foreground">{visitDate(entry)}</TableCell>
                      <TableCell className="font-bold text-foreground">{entry.queueNumber}</TableCell>
                      <TableCell className="text-foreground">{entry.joinedAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            entry.status === "completed" && "bg-green-500/10 text-green-600 border-green-500/20",
                            entry.status === "no-show" && "bg-red-500/10 text-red-600 border-red-500/20",
                            entry.status === "cancelled" && "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          )}
                        >
                          {entry.status === "completed" ? "Completed" : entry.status === "no-show" ? "No Show" : "Left Queue"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground text-sm">{entry.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 sm:mt-3">
            <span className="text-xs text-muted-foreground sm:text-sm">
              {walkinRecords.length === 0
                ? "0 records"
                : `Showing ${safePage * ROWS_PER_PAGE + 1}–${Math.min((safePage + 1) * ROWS_PER_PAGE, walkinRecords.length)} of ${walkinRecords.length} records`}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2"
                disabled={safePage === 0}
                onClick={() => setPage(Math.max(0, safePage - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
              <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground sm:text-sm">
                Page {safePage + 1} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
    </Card>
  );
};
