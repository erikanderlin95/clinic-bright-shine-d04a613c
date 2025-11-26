import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OperationalBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendBroadcast: (message: string) => void;
}

const OPERATIONAL_TEMPLATES = [
  {
    id: "closing-early",
    message: "Clinic will be closing early today.",
  },
  {
    id: "doctor-unavailable",
    message: "Doctor is unavailable temporarily.",
  },
  {
    id: "queue-disruption",
    message: "There is a disruption to queue operations.",
  },
  {
    id: "delay-notice",
    message: "Queue is experiencing delays. Thank you for your patience.",
  },
  {
    id: "emergency-closure",
    message: "Clinic is temporarily closed due to emergency. Please check back later.",
  },
];

export const OperationalBroadcastDialog = ({
  open,
  onOpenChange,
  onSendBroadcast,
}: OperationalBroadcastDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(OPERATIONAL_TEMPLATES[0].id);

  const handleSend = () => {
    const template = OPERATIONAL_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (template) {
      onSendBroadcast(template.message);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Operational Announcement</DialogTitle>
          <DialogDescription>
            Send a generic operational message to all active patients in today's queue.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This broadcast will be sent to all active patients in today's queue only.
            Messages are generic and PDPA-compliant.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Select Announcement Template</Label>
          <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
            {OPERATIONAL_TEMPLATES.map((template) => (
              <div key={template.id} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                <Label
                  htmlFor={template.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {template.message}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            Send Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
