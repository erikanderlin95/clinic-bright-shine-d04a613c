import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
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
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (!entry) return;
    if (code.trim() === entry.checkInCode) {
      setCode(""); setError("");
      onVerified(entry.id);
      onOpenChange(false);
    } else {
      setError(t("invalidCode"));
    }
  };

  const handleBypass = () => {
    if (!entry) return;
    setCode(""); setError("");
    onBypass(entry.id);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) { setCode(""); setError(""); }
    onOpenChange(isOpen);
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t("verifyCheckIn")}
          </DialogTitle>
          <DialogDescription>{t("enterCheckInCode")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{t("queueNumber")}</p>
            <p className="text-lg font-bold text-foreground">{entry.queueNumber}</p>
            {entry.name && (
              <>
                <p className="text-xs text-muted-foreground mt-2">{t("patientName")}</p>
                <p className="text-sm font-medium text-foreground">{entry.name}</p>
              </>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkin-code">{t("checkInCodeLabel")}</Label>
            <Input
              id="checkin-code"
              placeholder={t("enterCode")}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleVerify} disabled={!code.trim()}>
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
