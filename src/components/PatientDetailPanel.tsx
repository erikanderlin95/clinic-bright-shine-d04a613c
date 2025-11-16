import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./StatusBadge";
import type { QueueEntry } from "@/types/queue";
import { X, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";

interface PatientDetailPanelProps {
  entry: QueueEntry;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const PatientDetailPanel = ({ entry, onClose, onUpdateNotes }: PatientDetailPanelProps) => {
  const [notes, setNotes] = useState(entry.notes || "");

  const handleSaveNotes = () => {
    onUpdateNotes(entry.id, notes);
  };

  return (
    <Card className="h-full border-l">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Patient Details</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Queue Number</Label>
            <p className="text-2xl font-bold text-foreground">{entry.queueNumber}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Joined At</Label>
            <p className="text-sm font-medium text-foreground">{entry.joinedAt}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <div className="mt-1">
              <StatusBadge status={entry.status} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Notes (Optional)</Label>
            <Textarea
              placeholder="e.g., walk-in, follow-up"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs font-semibold text-muted-foreground">Quick Actions</Label>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Log Visit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
