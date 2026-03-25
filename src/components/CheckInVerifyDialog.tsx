import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { QueueEntry } from "@/types/queue";
import { useI18n } from "@/hooks/useI18n";

interface CheckInVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  onVerified: (id: string) => void;
  onBypass: (id: string) => void;
}

export const CheckInVerifyDialog = ({ open, onOpenChange, entry, onVerified, onBypass }: CheckInVerifyDialogProps) => {
  const { t } = useI18n();

  const handleVerify = () => {
    if (!entry) return;
    onVerified(entry.id);
    onOpenChange(false);
  };

  const handleBypass = () => {
    if (!entry) return;
    onBypass(entry.id);
    onOpenChange(false);
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t("verifyCheckIn")}
          </DialogTitle>
          <DialogDescription>{t("enterCheckInCode")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">{t("queueNumber")}</p>
              <p className="text-lg font-bold text-foreground">{entry.queueNumber}</p>
            </div>
            {entry.name && (
              <div>
                <p className="text-xs text-muted-foreground">{t("patientName")}</p>
                <p className="text-sm font-medium text-foreground">{entry.name}</p>
              </div>
            )}
            {entry.checkInCode && (
              <div>
                <p className="text-xs text-muted-foreground">{t("checkInCodeLabel")}</p>
                <p className="text-xl font-bold font-mono tracking-widest text-primary">{entry.checkInCode}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleVerify} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("verifyAndMarkArrived")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBypass} className="text-muted-foreground">
              {t("markArrivedNoCode")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
