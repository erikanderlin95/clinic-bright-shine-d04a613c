import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { QueueEntry } from "@/types/queue";

interface AdjustQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  currentPosition: number;
  totalPositions: number;
  onSave: (entryId: string, newPosition: number, reason: string, note: string) => void;
}

const REASON_KEYS = [
  "adjustReasonSteppedAway",
  "adjustReasonPriority",
  "adjustReasonMistake",
  "adjustReasonReturned",
  "adjustReasonMovedService",
  "adjustReasonOther",
] as const;

export const AdjustQueueDialog = ({
  open,
  onOpenChange,
  entry,
  currentPosition,
  totalPositions,
  onSave,
}: AdjustQueueDialogProps) => {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [newPosition, setNewPosition] = useState(currentPosition);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ position?: string; reason?: string }>({});

  useEffect(() => {
    setNewPosition(currentPosition);
    setReason("");
    setNote("");
    setErrors({});
  }, [currentPosition, open]);

  if (!entry) return null;

  const isAtTop = newPosition <= 1;
  const isAtBottom = newPosition >= totalPositions;
  const onlyOne = totalPositions <= 1;

  const handleMoveUp = () => setNewPosition((p) => Math.max(1, p - 1));
  const handleMoveDown = () => setNewPosition((p) => Math.min(totalPositions, p + 1));
  const handleMoveToTop = () => setNewPosition(1);
  const handleMoveToBottom = () => setNewPosition(totalPositions);

  const handleSave = () => {
    const newErrors: { position?: string; reason?: string } = {};
    if (newPosition < 1 || newPosition > totalPositions) {
      newErrors.position = t("adjustErrorPosition");
    }
    if (!reason) {
      newErrors.reason = t("adjustErrorReason");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(entry.id, newPosition, reason, note);
  };

  const content = (
    <div className="space-y-5">
      {/* Patient Info */}
      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">{t("queueNo")}</p>
        <p className="text-lg font-bold text-foreground">{entry.queueNumber}</p>
        {entry.name && <p className="text-sm text-muted-foreground">{entry.name}</p>}
      </div>

      {/* Current Position */}
      <div>
        <Label className="text-sm text-muted-foreground">{t("adjustCurrentPosition")}</Label>
        <p className="text-lg font-semibold text-foreground">#{currentPosition}</p>
      </div>

      {/* New Position Controls */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("adjustNewPosition")}</Label>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoveToTop}
            disabled={onlyOne || isAtTop}
            className="gap-1.5"
          >
            <ChevronsUp className="h-4 w-4" />
            {t("adjustMoveToTop")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoveUp}
            disabled={onlyOne || isAtTop}
            className="gap-1.5"
          >
            <ArrowUp className="h-4 w-4" />
            {t("adjustMoveUp")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoveDown}
            disabled={onlyOne || isAtBottom}
            className="gap-1.5"
          >
            <ArrowDown className="h-4 w-4" />
            {t("adjustMoveDown")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMoveToBottom}
            disabled={onlyOne || isAtBottom}
            className="gap-1.5"
          >
            <ChevronsDown className="h-4 w-4" />
            {t("adjustMoveToBottom")}
          </Button>
        </div>
        <p className="text-sm font-medium text-foreground mt-1">
          {t("adjustNewPosition")}: <span className="font-bold">#{newPosition}</span>
        </p>
        {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t("adjustReason")} *</Label>
        <Select value={reason} onValueChange={(v) => { setReason(v); setErrors((e) => ({ ...e, reason: undefined })); }}>
          <SelectTrigger>
            <SelectValue placeholder={t("adjustSelectReason")} />
          </SelectTrigger>
          <SelectContent>
            {REASON_KEYS.map((key) => (
              <SelectItem key={key} value={key}>{t(key)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t("adjustNote")}</Label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 100))}
          placeholder={t("adjustNotePlaceholder")}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">{note.length}/100</p>
      </div>
    </div>
  );

  const actionButtons = (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t("adjustCancel")}
      </Button>
      <Button onClick={handleSave}>
        {t("adjustSave")}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("adjustQueueTitle")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2">{content}</div>
          <DrawerFooter className="sticky bottom-0 bg-background border-t border-border pt-3">
            {actionButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("adjustQueueTitle")}</DialogTitle>
        </DialogHeader>
        {content}
        <div className="mt-2">{actionButtons}</div>
      </DialogContent>
    </Dialog>
  );
};
