import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "./StatusBadge";
import type { QueueEntry } from "@/types/queue";
import { CheckCircle, UserX, RotateCcw, ShieldCheck, Bell } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { getQueueVisibilityMode, type QueueVisibilityMode } from "./SettingsPanel";

interface QueueTableProps {
  entries: QueueEntry[];
  onSelectEntry: (entry: QueueEntry) => void;
  selectedEntry: QueueEntry | null;
  onUpdateStatus: (id: string, status: QueueEntry["status"]) => void;
  onRevertStatus: (id: string) => void;
  onVerifyArrival?: (entry: QueueEntry) => void;
  onNotifyPatient?: (entry: QueueEntry) => void;
}

export const QueueTable = ({ entries, onSelectEntry, selectedEntry, onUpdateStatus, onRevertStatus, onVerifyArrival, onNotifyPatient }: QueueTableProps) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<QueueVisibilityMode>("notification");

  useEffect(() => {
    setMode(getQueueVisibilityMode());
    const onStorage = () => setMode(getQueueVisibilityMode());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [completeEntryId, setCompleteEntryId] = useState<string | null>(null);

  const getActions = (entry: QueueEntry) => {
    if (entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show" || entry.status === "booked") {
      return null;
    }

    if (entry.status === "arrived") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); setCompleteEntryId(entry.id); setCompleteConfirmOpen(true); }}
          className="gap-1.5 h-8 text-xs"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {t("completed")}
        </Button>
      );
    }

    return (
      <div className="flex gap-1.5">
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onVerifyArrival?.(entry); }}
          className="gap-1.5 h-8 text-xs"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("verifyAndArrive")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); onUpdateStatus(entry.id, "no-show"); }}
          className="gap-1.5 h-8 text-xs"
        >
          <UserX className="h-3.5 w-3.5" />
          {t("noShow")}
        </Button>
      </div>
    );
  };

  return (
    <>
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t("queueNo")}</TableHead>
            <TableHead className="w-[120px]">{t("status")}</TableHead>
            <TableHead className="w-[90px]">{t("patientTypeCol")}</TableHead>
            <TableHead className="w-[120px]">Reason</TableHead>
            <TableHead className="w-[110px]">{t("timeJoined")}</TableHead>
            <TableHead className="w-[110px]">{t("checkInCode")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                {t("noPatients")}
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow
                key={entry.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectEntry(entry)}
                data-selected={selectedEntry?.id === entry.id}
              >
                <TableCell className="font-semibold">{entry.queueNumber || "—"}</TableCell>
                <TableCell><StatusBadge status={entry.status} /></TableCell>
                <TableCell className="text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    entry.patientType === "non-digital"
                      ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {entry.patientType === "non-digital"
                      ? t("typeNonDigital")
                      : t("typeWalkIn")}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.visitCategory
                    ? entry.visitCategory === "Others" && entry.remarksDetail
                      ? `Others: ${entry.remarksDetail}`
                      : entry.visitCategory
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{entry.joinedAt}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{entry.checkInCode || "—"}</TableCell>
                <TableCell>{getActions(entry)}</TableCell>
                <TableCell>
                  {entry.previousStatus && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => { e.stopPropagation(); onRevertStatus(entry.id); }}
                      className="gap-1.5 h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {t("undo")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    <AlertDialog open={completeConfirmOpen} onOpenChange={setCompleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("completed")}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the current patient as completed, call the next patient in queue, and move the queue up.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setCompleteEntryId(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            if (completeEntryId) {
              onUpdateStatus(completeEntryId, "completed");
            }
            setCompleteEntryId(null);
            setCompleteConfirmOpen(false);
          }}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};
