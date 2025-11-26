import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    duration?: number;
    visitCategory?: VisitCategory;
  }) => void;
}

export const AddToQueueDialog = ({ open, onOpenChange, onAddToQueue }: AddToQueueDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [queueSource, setQueueSource] = useState<"Walk-in" | "Phone Booking" | "Other">("Walk-in");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [visitCategory, setVisitCategory] = useState<VisitCategory | "">("Consultation");

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

    const durationValue = duration.trim() ? parseInt(duration.trim()) : undefined;
    
    onAddToQueue({
      name: name.trim() || undefined,
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      queueSource,
      notes: notes.trim() || undefined,
      duration: durationValue,
      visitCategory: visitCategory || undefined,
    });

    // Reset form
    setName("");
    setMobile("");
    setEmail("");
    setQueueSource("Walk-in");
    setNotes("");
    setDuration("");
    setVisitCategory("Consultation");
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
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email for contact"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <Label htmlFor="visit-category">Visit Category (Optional)</Label>
            <Select value={visitCategory} onValueChange={(value: VisitCategory | "") => setVisitCategory(value)}>
              <SelectTrigger id="visit-category">
                <SelectValue placeholder="Select visit category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="General Treatment">General Treatment</SelectItem>
                <SelectItem value="Standard Visit">Standard Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Optional)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter duration in minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
            />
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
