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

interface RecentCustomersBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendBroadcast: (message: string) => void;
}

const RECENT_CUSTOMER_TEMPLATES = [
  {
    id: "clinic-closed",
    message: "Clinic will be closed next week.",
  },
  {
    id: "doctor-leave",
    message: "Doctor will be away on leave.",
  },
  {
    id: "check-hours",
    message: "Please check operating hours before walking in.",
  },
  {
    id: "holiday-closure",
    message: "Clinic will be closed for public holidays. Please plan accordingly.",
  },
  {
    id: "schedule-change",
    message: "Clinic operating hours have changed. Please check updated schedule.",
  },
];

export const RecentCustomersBroadcastDialog = ({
  open,
  onOpenChange,
  onSendBroadcast,
}: RecentCustomersBroadcastDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(RECENT_CUSTOMER_TEMPLATES[0].id);

  const handleSend = () => {
    const template = RECENT_CUSTOMER_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (template) {
      onSendBroadcast(template.message);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Operational Announcement (Recent Customers)</DialogTitle>
          <DialogDescription>
            Send a generic operational message to customers who visited in the last 60 days.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This broadcast will be sent to customers who interacted with the clinic in the last 60 days only.
            Messages are generic and PDPA-compliant.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Select Announcement Template</Label>
          <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
            {RECENT_CUSTOMER_TEMPLATES.map((template) => (
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
