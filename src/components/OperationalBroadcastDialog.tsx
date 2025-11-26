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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, AlertTriangle } from "lucide-react";
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
  {
    id: "custom",
    message: "",
  },
];

const RESTRICTED_WORDS = [
  "promo",
  "discount",
  "package",
  "deal",
  "offer",
  "treatment advice",
  "supplement",
  "medicine",
  "medication",
  "prescription",
  "diagnosis",
  "cure",
  "sale",
  "promotion",
  "special",
  "buy",
  "price",
  "cheap",
  "free gift",
];

const validateMessage = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const word of RESTRICTED_WORDS) {
    if (lowerMessage.includes(word)) {
      return "Marketing or medical content is not allowed. Only operational notices are permitted.";
    }
  }
  
  return null;
};

export const OperationalBroadcastDialog = ({
  open,
  onOpenChange,
  onSendBroadcast,
}: OperationalBroadcastDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(OPERATIONAL_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSend = () => {
    const template = OPERATIONAL_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const messageToSend = selectedTemplate === "custom" ? customMessage.trim() : template.message;
    
    if (selectedTemplate === "custom") {
      if (!messageToSend) {
        setValidationError("Please enter a message.");
        return;
      }
      
      const error = validateMessage(messageToSend);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    onSendBroadcast(messageToSend);
    setCustomMessage("");
    setValidationError(null);
    onOpenChange(false);
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setValidationError(null);
  };

  const handleCustomMessageChange = (value: string) => {
    if (value.length <= 200) {
      setCustomMessage(value);
      setValidationError(null);
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

        {validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Select Announcement Template</Label>
          <RadioGroup value={selectedTemplate} onValueChange={handleTemplateChange}>
            {OPERATIONAL_TEMPLATES.map((template) => (
              <div key={template.id} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                <Label
                  htmlFor={template.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {template.id === "custom" ? "Custom Operational Message" : template.message}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedTemplate === "custom" && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="custom-message" className="text-sm font-medium">
                  Your Message
                </Label>
                <span className="text-xs text-muted-foreground">
                  {customMessage.length}/200
                </span>
              </div>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => handleCustomMessageChange(e.target.value)}
                placeholder="Enter operational notice (e.g., clinic hours, closure notices, schedule changes)"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Only operational notices are allowed. Marketing, promotions, and medical advice are prohibited.
              </p>
            </div>
          )}
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
