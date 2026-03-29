import { useState } from "react";
import type { QueueEntry } from "@/types/queue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Megaphone, Users, Plus, Trash2, Edit2, Check, X, Database, AlertTriangle } from "lucide-react";
import { OperationalBroadcastDialog } from "@/components/OperationalBroadcastDialog";
import { RecentCustomersBroadcastDialog } from "@/components/RecentCustomersBroadcastDialog";

interface AutomationLog {
  id: string;
  time: string;
  action: string;
}

export interface MessageTemplate {
  id: string;
  message: string;
}

interface AutomationPanelProps {
  businessType: "healthcare" | "wellness";
  onBusinessTypeChange: (type: "healthcare" | "wellness") => void;
  autoArrivalCheckEnabled: boolean;
  yourTurnSoonEnabled: boolean;
  delayAlertsEnabled: boolean;
  visitCompletionEnabled: boolean;
  automationLog: AutomationLog[];
  onToggleAutoArrivalCheck: (checked: boolean) => void;
  onToggleYourTurnSoon: (checked: boolean) => void;
  onToggleDelayAlerts: (checked: boolean) => void;
  onToggleVisitCompletion: (checked: boolean) => void;
  onSendBroadcast: (message: string, isMarketing?: boolean) => void;
  onSendRecentCustomersBroadcast: (message: string, isMarketing?: boolean) => void;
  templates?: MessageTemplate[];
  onTemplatesChange?: (templates: MessageTemplate[]) => void;
  queueEntries?: QueueEntry[];
  clinicIntegrationActive?: boolean;
}

const MAX_TEMPLATES = 4;

export const AutomationPanel = ({
  businessType,
  onBusinessTypeChange,
  autoArrivalCheckEnabled,
  yourTurnSoonEnabled,
  delayAlertsEnabled,
  visitCompletionEnabled,
  automationLog,
  onToggleAutoArrivalCheck,
  onToggleYourTurnSoon,
  onToggleDelayAlerts,
  onToggleVisitCompletion,
  onSendBroadcast,
  onSendRecentCustomersBroadcast,
  templates = [],
  onTemplatesChange,
  queueEntries = [],
  clinicIntegrationActive = false,
}: AutomationPanelProps) => {
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [recentCustomersDialogOpen, setRecentCustomersDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  const handleAddTemplate = () => {
    if (!newTemplate.trim() || templates.length >= MAX_TEMPLATES) return;
    
    const newTemplateObj: MessageTemplate = {
      id: Date.now().toString(),
      message: newTemplate.trim(),
    };
    
    onTemplatesChange?.([...templates, newTemplateObj]);
    setNewTemplate("");
  };

  const handleDeleteTemplate = (id: string) => {
    onTemplatesChange?.(templates.filter((t) => t.id !== id));
  };

  const handleStartEdit = (template: MessageTemplate) => {
    setEditingId(template.id);
    setEditingValue(template.message);
  };

  const handleSaveEdit = () => {
    if (!editingValue.trim() || !editingId) return;
    
    onTemplatesChange?.(
      templates.map((t) =>
        t.id === editingId ? { ...t, message: editingValue.trim() } : t
      )
    );
    setEditingId(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Operational Broadcast</CardTitle>
              <CardDescription>Send generic announcements to patients</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-[10px] font-normal px-2 py-1">
              <Database className="h-3 w-3" />
              {clinicIntegrationActive ? "Clinic Assist" : "ClynicQ"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!clinicIntegrationActive ? (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/60 border border-dashed mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm font-bold leading-relaxed" style={{ color: "hsl(220, 80%, 40%)" }}>
                Clinic system not connected. Active queue uses ClynicQ session data. Connect Clinic Assist for live queue sync.
              </p>
            </div>
          ) : null}
          <Button 
            onClick={() => setBroadcastDialogOpen(true)}
            className="w-full gap-2"
            variant="default"
            disabled={!clinicIntegrationActive && queueEntries.filter(e => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show").length === 0}
          >
            <Megaphone className="h-4 w-4" />
            Active Queue Patients
          </Button>
          {!clinicIntegrationActive && queueEntries.filter(e => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show").length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center">
              No active queue patients available
            </p>
          )}
          <Button 
            onClick={() => setRecentCustomersDialogOpen(true)}
            className="w-full gap-2"
            variant="secondary"
          >
            <Users className="h-4 w-4" />
            Recent Customers (60 Days)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Create up to {MAX_TEMPLATES} custom message templates for broadcasts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50"
                >
                  {editingId === template.id ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1"
                        maxLength={200}
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm">{template.message}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(template)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {templates.length < MAX_TEMPLATES && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter a new message template..."
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTemplate();
                  }
                }}
              />
              <Button onClick={handleAddTemplate} disabled={!newTemplate.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          )}

          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates created yet. Add your first template above.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            {templates.length}/{MAX_TEMPLATES} templates used
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Log</CardTitle>
          <CardDescription>Recent automated actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead>Bot Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automationLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OperationalBroadcastDialog
        open={broadcastDialogOpen}
        onOpenChange={setBroadcastDialogOpen}
        onSendBroadcast={onSendBroadcast}
        businessType={businessType}
        templates={templates}
        queueEntries={queueEntries}
      />

      <RecentCustomersBroadcastDialog
        open={recentCustomersDialogOpen}
        onOpenChange={setRecentCustomersDialogOpen}
        onSendBroadcast={onSendRecentCustomersBroadcast}
        businessType={businessType}
        templates={templates}
        queueEntries={queueEntries}
      />
    </div>
  );
};
