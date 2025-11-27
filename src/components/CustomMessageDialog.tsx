import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface CustomMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const messageSchema = z.object({
  message: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(500, { message: "Message must be less than 500 characters" })
    .regex(/^[a-zA-Z0-9\s.,!?;:()\-'"]+$/, { 
      message: "Message contains invalid characters. Only letters, numbers, and basic punctuation allowed" 
    }),
});

export const CustomMessageDialog = ({ open, onOpenChange }: CustomMessageDialogProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateMessage = (value: string): boolean => {
    try {
      messageSchema.parse({ message: value });
      setError(null);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (value.trim()) {
      validateMessage(value);
    } else {
      setError(null);
    }
  };

  const handleCopy = () => {
    if (!validateMessage(message)) {
      toast({
        title: "Invalid Message",
        description: error || "Please fix the errors before copying",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(message.trim());
    toast({
      title: "Copied",
      description: "Custom message copied to clipboard",
    });
  };

  const handleOpenWhatsApp = () => {
    if (!validateMessage(message)) {
      toast({
        title: "Invalid Message",
        description: error || "Please fix the errors before sending",
        variant: "destructive",
      });
      return;
    }

    const encodedMessage = encodeURIComponent(message.trim());
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    onOpenChange(false);
    setMessage("");
    setError(null);
    toast({
      title: "WhatsApp Opened",
      description: "Send this message manually via WhatsApp",
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setMessage("");
      setError(null);
    }
    onOpenChange(open);
  };

  const charCount = message.length;
  const isValid = !error && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compose Custom Message</DialogTitle>
          <DialogDescription>
            Phase 1: Manual messaging only. Compose and send via WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-message">Message</Label>
            <Textarea
              id="custom-message"
              placeholder="Type your custom message here..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className={error ? "border-destructive" : ""}
              rows={5}
            />
            <div className="flex justify-between text-xs">
              <span className={error ? "text-destructive" : "text-muted-foreground"}>
                {error || "Only letters, numbers, and basic punctuation allowed"}
              </span>
              <span className={charCount > 500 ? "text-destructive" : "text-muted-foreground"}>
                {charCount}/500
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={handleCopy}
              disabled={!isValid}
            >
              <Copy className="h-4 w-4" />
              Copy Message
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleOpenWhatsApp}
              disabled={!isValid}
            >
              <ExternalLink className="h-4 w-4" />
              Open WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
