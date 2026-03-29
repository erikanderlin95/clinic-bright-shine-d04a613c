import { useState, useEffect, useMemo } from "react";
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
import { BroadcastAudienceTable, type AudiencePatient } from "./BroadcastAudienceTable";
import type { MessageTemplate } from "./AutomationPanel";
import type { QueueEntry } from "@/types/queue";

interface RecentCustomersBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendBroadcast: (message: string, isMarketing?: boolean) => void;
  businessType: "healthcare" | "wellness";
  templates?: MessageTemplate[];
  queueEntries?: QueueEntry[];
}

const RESTRICTED_WORDS = [
  "promo", "discount", "package", "deal", "offer", "treatment advice",
  "supplement", "medicine", "medication", "prescription", "diagnosis",
  "cure", "sale", "promotion", "special", "buy", "price", "cheap", "free gift",
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
  templates = [],
  queueEntries = [],
}: RecentCustomersBroadcastDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [customMessage, setCustomMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isMarketingMessage, setIsMarketingMessage] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());

  // Build recent customers from completed entries (simulating 60-day history)
  const audiencePatients: AudiencePatient[] = useMemo(() => {
    // Deduplicate by mobile number to prevent duplicate sends
    const seen = new Set<string>();
    const result: AudiencePatient[] = [];

    const completed = queueEntries.filter((e) => e.status === "completed");
    for (const entry of completed) {
      if (seen.has(entry.mobile)) continue;
      seen.add(entry.mobile);
      result.push({
        id: entry.id,
        name: entry.name || "Walk-in",
        mobile: entry.mobile,
        lastVisitDate: new Date().toLocaleDateString("en-SG"),
      });
    }

    // Also include some mock recent data for demonstration
    if (result.length === 0) {
      result.push(
        { id: "rc-1", name: "Alice Wong", mobile: "+65 9777 5678", lastVisitDate: "28/03/2026" },
        { id: "rc-2", name: "David Lim", mobile: "+65 9888 1234", lastVisitDate: "25/03/2026" },
        { id: "rc-3", name: "Rachel Tan", mobile: "+65 9666 4321", lastVisitDate: "20/03/2026" },
      );
    }

    return result;
  }, [queueEntries]);

  // Default: none selected for recent customers
  useEffect(() => {
    if (open) {
      setSelectedPatientIds(new Set());
    }
  }, [open]);

  const handleSend = () => {
    if (selectedPatientIds.size === 0) {
      setValidationError("No recipients selected. Please select at least one patient.");
      return;
    }

    let messageToSend = "";
    if (selectedTemplate === "custom" || selectedTemplate === "custom-marketing") {
      messageToSend = customMessage.trim();
      if (!messageToSend) {
        setValidationError("Please enter a message.");
        return;
      }
      if (businessType === "healthcare" || selectedTemplate === "custom") {
        const error = validateMessage(messageToSend);
        if (error) { setValidationError(error); return; }
      }
    } else {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (!template) {
        setValidationError("Please select a template or enter a custom message.");
        return;
      }
      messageToSend = template.message;
    }

    if (isMarketingMessage && !marketingConsent) {
      setValidationError("You must confirm marketing consent to send this message.");
      return;
    }

    onSendBroadcast(messageToSend, isMarketingMessage);
    setCustomMessage("");
    setValidationError(null);
    setMarketingConsent(false);
    setIsMarketingMessage(false);
    setSelectedTemplate("custom");
    onOpenChange(false);
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setValidationError(null);
    setMarketingConsent(false);
    setIsMarketingMessage(value === "custom-marketing");
  };

  const handleCustomMessageChange = (value: string) => {
    if (value.length <= 200) {
      setCustomMessage(value);
      setValidationError(null);
    }
  };

  const showCustomInput = selectedTemplate === "custom" || selectedTemplate === "custom-marketing";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Operational Announcement (Recent Customers)</DialogTitle>
          <DialogDescription>
            Select recipients from customers who visited in the last 60 days.
          </DialogDescription>
        </DialogHeader>

        <BroadcastAudienceTable
          patients={audiencePatients}
          selectedIds={selectedPatientIds}
          onSelectionChange={setSelectedPatientIds}
          variant="recent-customers"
        />

        {validationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-2">
          <Label className="text-sm font-medium">Select Message</Label>
          <RadioGroup value={selectedTemplate} onValueChange={handleTemplateChange}>
            {templates.map((template) => (
              <div key={template.id} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={template.id} id={`rc-${template.id}`} className="mt-1" />
                <Label htmlFor={`rc-${template.id}`} className="font-normal cursor-pointer leading-relaxed">
                  {template.message}
                </Label>
              </div>
            ))}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="custom" id="rc-custom" className="mt-1" />
              <Label htmlFor="rc-custom" className="font-normal cursor-pointer leading-relaxed">
                Custom Operational Message
              </Label>
            </div>
            {businessType === "wellness" && (
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="custom-marketing" id="rc-custom-marketing" className="mt-1" />
                <Label htmlFor="rc-custom-marketing" className="font-normal cursor-pointer leading-relaxed">
                  Custom Marketing Message
                </Label>
              </div>
            )}
          </RadioGroup>

          {showCustomInput && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="custom-message-rc" className="text-sm font-medium">Your Message</Label>
                <span className="text-xs text-muted-foreground">{customMessage.length}/200</span>
              </div>
              <Textarea
                id="custom-message-rc"
                value={customMessage}
                onChange={(e) => handleCustomMessageChange(e.target.value)}
                placeholder={
                  selectedTemplate === "custom-marketing"
                    ? "Enter your marketing message (e.g., special offers, promotions, packages)"
                    : "Enter operational notice (e.g., clinic hours, closure notices, schedule changes)"
                }
                className="min-h-[80px]"
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
                      id="marketing-consent-rc"
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                    />
                    <Label htmlFor="marketing-consent-rc" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I confirm this announcement is only sent to users who provided marketing consent.
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {templates.length === 0 && !showCustomInput && (
            <p className="text-sm text-muted-foreground py-2">
              No templates available. Create templates in Automation Settings or use a custom message.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend}>
            Send to {selectedPatientIds.size} Customer{selectedPatientIds.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
