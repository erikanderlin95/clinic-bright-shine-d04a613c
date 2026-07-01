import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle } from "lucide-react";
import type { QueueEntry } from "@/types/queue";

interface NotificationsTableProps {
  entries: QueueEntry[];
  onSelectEntry: (entry: QueueEntry) => void;
  selectedEntry: QueueEntry | null;
  onNotifyPatient: (entry: QueueEntry) => void;
}

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

export const NotificationsTable = ({
  entries,
  onSelectEntry,
  selectedEntry,
  onNotifyPatient,
}: NotificationsTableProps) => {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Name</TableHead>
            <TableHead className="min-w-[140px]">Mobile</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time Joined</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Check-in Code</TableHead>
            <TableHead className="min-w-[200px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No patients in queue.
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
                <TableCell className="font-medium">{entry.name || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.mobile}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{today}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.joinedAt}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{entry.checkInCode || "—"}</TableCell>
                <TableCell>
                  {entry.status === "notified" ? (
                    <div className="inline-flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        WhatsApp Sent
                      </span>
                      {entry.notifiedAt && (
                        <span className="text-[11px] text-muted-foreground pl-1">Today, {entry.notifiedAt}</span>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onNotifyPatient(entry); }}
                      className="gap-1.5 h-8 text-xs bg-[#25D366] hover:bg-[#20BA5A] text-white"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
