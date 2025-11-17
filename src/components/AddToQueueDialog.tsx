import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToQueue: (data: {
    name?: string;
    mobile: string;
    queueSource: "Walk-in" | "Phone Booking" | "Other";
    notes?: string;
  }) => void;
}

export const AddToQueueDialog = ({ open, onOpenChange, onAddToQueue }: AddToQueueDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [queueSource, setQueueSource] = useState<"Walk-in" | "Phone Booking" | "Other">("Walk-in");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile.trim()) {
      toast({
        title: "Mobile number required",
        description: "Please enter a mobile number",
        variant: "destructive",
      });
      return;
    }

    onAddToQueue({
      name: name.trim() || undefined,
      mobile: mobile.trim(),
      queueSource,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName("");
    setMobile("");
    setQueueSource("Walk-in");
    setNotes("");
    onOpenChange(false);

    toast({
      title: "Added to queue",
      description: "Patient has been added to the queue",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Queue</DialogTitle>
          <DialogDescription>
            Add a new patient to the queue. Only mobile number is required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Enter patient name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">
              Queue Source <span className="text-destructive">*</span>
            </Label>
            <Select value={queueSource} onValueChange={(value: "Walk-in" | "Phone Booking" | "Other") => setQueueSource(value)}>
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Phone Booking">Phone Booking</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes only"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
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
