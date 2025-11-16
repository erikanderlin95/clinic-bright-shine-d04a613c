import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MessagingPanel = () => {
  const { toast } = useToast();

  const messageTemplates = [
    {
      title: "Delay Notice",
      description: "Doctor running late",
      icon: AlertCircle,
    },
    {
      title: "Return to Clinic",
      description: "Please return to the clinic",
      icon: MessageSquare,
    },
    {
      title: "Announcement",
      description: "Queue moving slower than expected",
      icon: Info,
    },
  ];

  const handleSendMessage = (template: string) => {
    toast({
      title: "Message Sent",
      description: `"${template}" message sent to patients`,
    });
  };

  return (
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
              onClick={() => handleSendMessage(template.title)}
            >
              <template.icon className="h-5 w-5 text-primary" />
              <div className="text-center">
                <div className="font-semibold">{template.title}</div>
                <div className="text-xs text-muted-foreground">{template.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
