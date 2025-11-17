import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateType: "delay" | "return" | "announcement" | null;
}

export const MessageTemplateDialog = ({ open, onOpenChange, templateType }: MessageTemplateDialogProps) => {
  const { toast } = useToast();

  const getTemplate = () => {
    switch (templateType) {
      case "delay":
        return "Doctor running late. Thank you for your patience.";
      case "return":
        return "Queue moving. Please return to the clinic.";
      case "announcement":
        return "Your turn soon. Please be ready.";
      default:
        return "";
    }
  };

  const getTitle = () => {
    switch (templateType) {
      case "delay":
        return "Delay Notice";
      case "return":
        return "Return to Clinic";
      case "announcement":
        return "Announcement";
      default:
        return "Message Template";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getTemplate());
    toast({
      title: "Copied",
      description: "Message template copied to clipboard",
    });
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(getTemplate());
    window.open(`https://wa.me/?text=${message}`, "_blank");
    onOpenChange(false);
    toast({
      title: "WhatsApp Opened",
      description: "Send this message manually via WhatsApp",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Phase 1: Manual messaging only. Copy or send via WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted p-4">
            <p className="text-sm">{getTemplate()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copy Message
            </Button>
            <Button className="flex-1 gap-2" onClick={handleOpenWhatsApp}>
              <ExternalLink className="h-4 w-4" />
              Open WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
