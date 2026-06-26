import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Download, Users } from "lucide-react";
import type { QueueEntry } from "@/types/queue";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

interface WalkinRecordsSectionProps {
  entries: QueueEntry[];
}

export const WalkinRecordsSection = ({ entries }: WalkinRecordsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const walkinRecords = entries.filter(
    (entry) =>
      entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show"
  );

  const handleDownloadCSV = () => {
    const headers = ["Patient Name", "Visit Date", "Queue Number", "Arrival Time", "Status", "Reason / Notes"];
    const rows = walkinRecords.map((entry) => [
      entry.name || "-",
      new Date().toLocaleDateString(),
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
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            {t("walkinRecordsTitle")}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isExpanded && (
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-1.5">
                <Download className="h-4 w-4" />
                {t("downloadCSV")}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-2">
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
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
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
                {walkinRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {t("noWalkinRecords")}
                    </TableCell>
                  </TableRow>
                ) : (
                  walkinRecords.map((entry, index) => (
                    <TableRow
                      key={entry.id}
                      className={cn(
                        "transition-colors hover:bg-muted/30",
                        index % 2 === 0 ? "bg-accent/5" : ""
                      )}
                    >
                      <TableCell className="font-medium text-foreground">{entry.name || "-"}</TableCell>
                      <TableCell className="text-foreground">{new Date().toLocaleDateString()}</TableCell>
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
        </CardContent>
      )}
    </Card>
  );
};
