import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, ShieldOff } from "lucide-react";
import type { QueueEntry } from "@/types/queue";

interface CheckInVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: QueueEntry | null;
  onVerified: (id: string) => void;
  onBypass: (id: string) => void;
}

export const CheckInVerifyDialog = ({ open, onOpenChange, entry, onVerified, onBypass }: CheckInVerifyDialogProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (!entry) return;
    if (code.trim() === entry.checkInCode) {
      setCode("");
      setError("");
      onVerified(entry.id);
      onOpenChange(false);
    } else {
      setError("Invalid code. Please try again.");
    }
  };

  const handleBypass = () => {
    if (!entry) return;
    setCode("");
    setError("");
    onBypass(entry.id);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCode("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Verify Check-In
          </DialogTitle>
          <DialogDescription>
            Enter the patient's check-in code to verify arrival.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Queue Number</p>
            <p className="text-lg font-bold text-foreground">{entry.queueNumber}</p>
            {entry.name && (
              <>
                <p className="text-xs text-muted-foreground mt-2">Patient Name</p>
                <p className="text-sm font-medium text-foreground">{entry.name}</p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkin-code">Check-in Code</Label>
            <Input
              id="checkin-code"
              placeholder="Enter code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
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
              Verify & Mark Arrived
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBypass} className="text-muted-foreground">
              <ShieldOff className="h-3.5 w-3.5 mr-1.5" />
              Bypass & Mark Arrived
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
