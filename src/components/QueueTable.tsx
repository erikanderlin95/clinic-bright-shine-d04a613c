import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { QueueEntry } from "@/types/queue";
import { CheckCircle, XCircle, UserX } from "lucide-react";

interface QueueTableProps {
  entries: QueueEntry[];
  onSelectEntry: (entry: QueueEntry) => void;
  selectedEntry: QueueEntry | null;
  onUpdateStatus: (id: string, status: QueueEntry["status"]) => void;
}

export const QueueTable = ({ entries, onSelectEntry, selectedEntry, onUpdateStatus }: QueueTableProps) => {
  const getActions = (entry: QueueEntry) => {
    if (entry.status === "completed" || entry.status === "cancelled" || entry.status === "no-show") {
      return null;
    }

    if (entry.status === "arrived") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(entry.id, "completed");
          }}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Completed
        </Button>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(entry.id, "arrived");
          }}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Arrived
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(entry.id, "cancelled");
          }}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(entry.id, "no-show");
          }}
          className="gap-2"
        >
          <UserX className="h-4 w-4" />
          No Show
        </Button>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Queue No</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[120px]">Queue Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectEntry(entry)}
              data-selected={selectedEntry?.id === entry.id}
            >
              <TableCell className="font-medium">{entry.queueNumber}</TableCell>
              <TableCell>
                <StatusBadge status={entry.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{entry.joinedAt}</TableCell>
              <TableCell>{getActions(entry)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
