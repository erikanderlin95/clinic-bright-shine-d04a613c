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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecentCustomersBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendBroadcast: (message: string, isMarketing?: boolean) => void;
  businessType: "healthcare" | "wellness";
}

const RECENT_CUSTOMER_TEMPLATES = [
  {
    id: "clinic-closed",
    message: "Clinic will be closed next week.",
    isMarketing: false,
  },
  {
    id: "doctor-leave",
    message: "Doctor will be away on leave.",
    isMarketing: false,
  },
  {
    id: "check-hours",
    message: "Please check operating hours before walking in.",
    isMarketing: false,
  },
  {
    id: "holiday-closure",
    message: "Clinic will be closed for public holidays. Please plan accordingly.",
    isMarketing: false,
  },
  {
    id: "schedule-change",
    message: "Clinic operating hours have changed. Please check updated schedule.",
    isMarketing: false,
  },
  {
    id: "custom",
    message: "",
    isMarketing: false,
  },
  {
    id: "custom-marketing",
    message: "",
    isMarketing: true,
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

export const RecentCustomersBroadcastDialog = ({
  open,
  onOpenChange,
  onSendBroadcast,
  businessType,
}: RecentCustomersBroadcastDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(RECENT_CUSTOMER_TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleSend = () => {
    const template = RECENT_CUSTOMER_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    const isCustom = selectedTemplate === "custom" || selectedTemplate === "custom-marketing";
    const messageToSend = isCustom ? customMessage.trim() : template.message;
    
    if (isCustom) {
      if (!messageToSend) {
        setValidationError("Please enter a message.");
        return;
      }
      
      // For healthcare mode, always validate
      // For wellness mode with marketing template, skip validation
      if (businessType === "healthcare" || selectedTemplate === "custom") {
        const error = validateMessage(messageToSend);
        if (error) {
          setValidationError(error);
          return;
        }
      }
    }

    // Check marketing consent for marketing messages
    if (template.isMarketing && !marketingConsent) {
      setValidationError("You must confirm marketing consent to send this message.");
      return;
    }

    onSendBroadcast(messageToSend, template.isMarketing);
    setCustomMessage("");
    setValidationError(null);
    setMarketingConsent(false);
    onOpenChange(false);
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setValidationError(null);
    setMarketingConsent(false);
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

        {validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <Label className="text-sm font-medium">Select Announcement Template</Label>
          <RadioGroup value={selectedTemplate} onValueChange={handleTemplateChange}>
            {RECENT_CUSTOMER_TEMPLATES.filter((template) => {
              // Filter templates based on business type
              if (businessType === "healthcare") {
                return !template.isMarketing;
              }
              return true;
            }).map((template) => (
              <div key={template.id} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                <Label
                  htmlFor={template.id}
                  className="font-normal cursor-pointer leading-relaxed"
                >
                  {template.id === "custom" 
                    ? "Custom Operational Message" 
                    : template.id === "custom-marketing"
                    ? "Custom Marketing Message"
                    : template.message}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {(selectedTemplate === "custom" || selectedTemplate === "custom-marketing") && (
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
                placeholder={
                  selectedTemplate === "custom-marketing"
                    ? "Enter your marketing message (e.g., special offers, promotions, packages)"
                    : "Enter operational notice (e.g., clinic hours, closure notices, schedule changes)"
                }
                className="min-h-[100px]"
              />
              {selectedTemplate === "custom" && (
                <p className="text-xs text-muted-foreground">
                  Only operational notices are allowed. Marketing, promotions, and medical advice are prohibited.
                </p>
              )}
              {selectedTemplate === "custom-marketing" && (
                <div className="space-y-3 mt-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Marketing messages can only be sent to users who have provided consent.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing-consent"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                    />
                    <Label
                      htmlFor="marketing-consent"
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      I confirm this announcement is only sent to users who provided marketing consent.
                    </Label>
                  </div>
                </div>
              )}
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
