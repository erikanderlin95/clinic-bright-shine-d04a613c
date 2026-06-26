import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { VisitCategory } from "@/types/queue";

interface AddToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToQueue: (data: {
    name?: string;
    mobile: string;
    email?: string;
    queueSource: "Walk-in" | "Phone Booking" | "Other";
    notes?: string;
    visitCategory?: VisitCategory;
  }) => void;
}

export const AddToQueueDialog = ({ open, onOpenChange, onAddToQueue }: AddToQueueDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // No registration required — name and mobile both optional.
    // Goal: minimize front-desk workload and reflect actual walk-in count quickly.
    onAddToQueue({
      name: name.trim() || undefined,
      mobile: mobile.trim(), // may be empty for fully anonymous walk-ins
      email: undefined,
      queueSource: "Walk-in",
      notes: undefined,
      visitCategory: undefined,
    });

    setName("");
    setMobile("");
    onOpenChange(false);

    toast({ title: "Patient added", description: "Walk-in added to the live queue." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient (non digital)</DialogTitle>
          <DialogDescription>
            Quick add for walk-ins. No registration needed — name and mobile are both optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="Enter patient name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile (optional)</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add to Queue</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
