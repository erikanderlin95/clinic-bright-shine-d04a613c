import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertCircle, Info } from "lucide-react";
import { MessageTemplateDialog } from "./MessageTemplateDialog";

export const MessagingPanel = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"delay" | "return" | "announcement" | null>(null);

  const messageTemplates = [
    {
      title: "Delay Notice",
      description: "Doctor running late",
      icon: AlertCircle,
      type: "delay" as const,
    },
    {
      title: "Return to Clinic",
      description: "Please return to the clinic",
      icon: MessageSquare,
      type: "return" as const,
    },
    {
      title: "General Operation Announcement",
      description: "General clinic announcements",
      icon: Info,
      type: "announcement" as const,
    },
  ];

  const handleOpenTemplate = (type: "delay" | "return" | "announcement") => {
    setSelectedTemplate(type);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Manual Messaging Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {messageTemplates.map((template) => (
              <Button
                key={template.title}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => handleOpenTemplate(template.type)}
              >
                <template.icon className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">{template.title}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Phase 1: Messages sent manually via WhatsApp/SMS (no patient names)
          </p>
        </CardContent>
      </Card>
      
      <MessageTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templateType={selectedTemplate}
      />
    </>
  );
};
