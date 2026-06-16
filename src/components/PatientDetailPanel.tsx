import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./StatusBadge";
import type { QueueEntry } from "@/types/queue";
import { X, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "sonner";

interface PatientDetailPanelProps {
  entry: QueueEntry;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const PatientDetailPanel = ({ entry, onClose, onUpdateNotes }: PatientDetailPanelProps) => {
  const [notes, setNotes] = useState(entry.notes || "");
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useI18n();

  const handleSaveNotes = () => {
    onUpdateNotes(entry.id, notes);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success(`Message sent to ${entry.name || "patient"}`);
    setMessage("");
    setMessageOpen(false);
  };


  return (
    <Card className="h-full border-l">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{t("patientDetails")}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">{t("queueNumber")}</Label>
            <p className="text-2xl font-bold text-foreground">{entry.queueNumber}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{t("patientName")}</Label>
            <p className="text-sm font-medium text-foreground">{entry.name || "—"}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{t("mobileNumber")}</Label>
            <p className="text-sm font-medium text-foreground">{entry.mobile}</p>
          </div>

          {entry.email && (
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium text-foreground">{entry.email}</p>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">{t("queueSource")}</Label>
            <p className="text-sm font-medium text-foreground">{entry.queueSource}</p>
          </div>

          {entry.visitCategory && (
            <div>
              <Label className="text-xs text-muted-foreground">{t("visitCategoryCol")}</Label>
              <p className="text-sm font-medium text-foreground">{entry.visitCategory}</p>
            </div>
          )}

          {entry.duration && (
            <div>
              <Label className="text-xs text-muted-foreground">{t("durationCol")}</Label>
              <p className="text-sm font-medium text-foreground">{entry.duration} minutes</p>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground">{t("timeJoined")}</Label>
            <p className="text-sm font-medium text-foreground">{entry.joinedAt}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{t("status")}</Label>
            <div className="mt-1">
              <StatusBadge status={entry.status} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">{t("notesOptional")}</Label>
            <Textarea
              placeholder={t("internalNotes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs font-semibold text-muted-foreground">{t("quickActions")}</Label>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setMessageOpen((v) => !v)}
            >
              <MessageSquare className="h-4 w-4" />
              {t("sendMessage")}
            </Button>
            {messageOpen && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <Textarea
                  placeholder="Type a message to the patient..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  className="min-h-[100px] bg-background"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{message.length}/200</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setMessage(""); setMessageOpen(false); }}>
                      Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
