import { useState, useMemo, useEffect } from "react";
import type { QueueEntry } from "@/types/queue";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Megaphone, Users, Plus, Trash2, Edit2, Check, X, Database,
  AlertTriangle, AlertCircle, Send,
} from "lucide-react";
import type { AudiencePatient } from "./BroadcastAudienceTable";

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

type AudienceMode = "active-queue" | "recent-customers";

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
  // Template management
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newTemplate, setNewTemplate] = useState("");

  // Audience & broadcast state
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("active-queue");
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [maxAhead, setMaxAhead] = useState<string>("");

  // Message composition state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
  const [customMessage, setCustomMessage] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isMarketingMessage, setIsMarketingMessage] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Build active queue audience
  const activeQueuePatients: AudiencePatient[] = useMemo(() => {
    const active = queueEntries.filter(
      (e) => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show"
    );
    return active.map((entry, index) => ({
      id: entry.id,
      name: entry.name || "Walk-in",
      mobile: entry.mobile,
      queueNumber: entry.queueNumber,
      patientsAhead: index,
      status: entry.status === "arrived" ? "arrived" : "waiting",
    }));
  }, [queueEntries]);

  // Build recent customers audience
  const recentCustomersPatients: AudiencePatient[] = useMemo(() => {
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
    if (result.length === 0) {
      result.push(
        { id: "rc-1", name: "Alice Wong", mobile: "+65 9777 5678", lastVisitDate: "28/03/2026" },
        { id: "rc-2", name: "David Lim", mobile: "+65 9888 1234", lastVisitDate: "25/03/2026" },
        { id: "rc-3", name: "Rachel Tan", mobile: "+65 9666 4321", lastVisitDate: "20/03/2026" },
      );
    }
    return result;
  }, [queueEntries]);

  const currentAudience = audienceMode === "active-queue" ? activeQueuePatients : recentCustomersPatients;

  // Filter active queue patients
  const filteredAudience = useMemo(() => {
    if (audienceMode !== "active-queue") return currentAudience;
    let result = currentAudience;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status?.toLowerCase() === statusFilter);
    }
    if (maxAhead && !isNaN(Number(maxAhead))) {
      result = result.filter((p) => (p.patientsAhead ?? 0) <= Number(maxAhead));
    }
    return result;
  }, [currentAudience, statusFilter, maxAhead, audienceMode]);

  // When audience mode changes, reset selection
  useEffect(() => {
    if (audienceMode === "active-queue") {
      setSelectedPatientIds(new Set(filteredAudience.map((p) => p.id)));
    } else {
      setSelectedPatientIds(new Set());
    }
    setStatusFilter("all");
    setMaxAhead("");
  }, [audienceMode]);

  // When filters change for active queue, auto-select all filtered
  useEffect(() => {
    if (audienceMode === "active-queue") {
      setSelectedPatientIds(new Set(filteredAudience.map((p) => p.id)));
    }
  }, [filteredAudience, audienceMode]);

  const allFilteredSelected = filteredAudience.length > 0 && filteredAudience.every((p) => selectedPatientIds.has(p.id));

  const handleSelectAll = (checked: boolean) => {
    const newSet = new Set(selectedPatientIds);
    filteredAudience.forEach((p) => {
      if (checked) newSet.add(p.id); else newSet.delete(p.id);
    });
    setSelectedPatientIds(newSet);
  };

  const handleTogglePatient = (id: string, checked: boolean) => {
    const newSet = new Set(selectedPatientIds);
    if (checked) newSet.add(id); else newSet.delete(id);
    setSelectedPatientIds(newSet);
  };

  // Template management handlers
  const handleAddTemplate = () => {
    if (!newTemplate.trim() || templates.length >= MAX_TEMPLATES) return;
    onTemplatesChange?.([...templates, { id: Date.now().toString(), message: newTemplate.trim() }]);
    setNewTemplate("");
  };

  const handleDeleteTemplate = (id: string) => {
    onTemplatesChange?.(templates.filter((t) => t.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId("custom");
  };

  const handleStartEdit = (template: MessageTemplate) => {
    setEditingId(template.id);
    setEditingValue(template.message);
  };

  const handleSaveEdit = () => {
    if (!editingValue.trim() || !editingId) return;
    onTemplatesChange?.(templates.map((t) => t.id === editingId ? { ...t, message: editingValue.trim() } : t));
    setEditingId(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  // Send broadcast
  const handleSendBroadcast = () => {
    if (selectedPatientIds.size === 0) {
      setValidationError("No recipients selected. Please select at least one patient.");
      return;
    }

    let messageToSend = "";
    if (selectedTemplateId === "custom" || selectedTemplateId === "custom-marketing") {
      messageToSend = customMessage.trim();
      if (!messageToSend) {
        setValidationError("Please enter a message.");
        return;
      }
      if (businessType === "healthcare" || selectedTemplateId === "custom") {
        const error = validateMessage(messageToSend);
        if (error) { setValidationError(error); return; }
      }
    } else {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (!template) {
        setValidationError("Please select a message template or write a custom message.");
        return;
      }
      messageToSend = template.message;
    }

    if (isMarketingMessage && !marketingConsent) {
      setValidationError("You must confirm marketing consent to send this message.");
      return;
    }

    if (audienceMode === "active-queue") {
      onSendBroadcast(messageToSend, isMarketingMessage);
    } else {
      onSendRecentCustomersBroadcast(messageToSend, isMarketingMessage);
    }

    setCustomMessage("");
    setValidationError(null);
    setMarketingConsent(false);
    setIsMarketingMessage(false);
    setSelectedTemplateId("custom");
  };

  const handleTemplateSelection = (value: string) => {
    setSelectedTemplateId(value);
    setValidationError(null);
    setMarketingConsent(false);
    setIsMarketingMessage(value === "custom-marketing");
  };

  const showCustomInput = selectedTemplateId === "custom" || selectedTemplateId === "custom-marketing";
  const activeQueueDisabled = !clinicIntegrationActive && activeQueuePatients.length === 0;

  return (
    <div className="space-y-4">
      {/* Row 1 — Full Width System Alert Banner */}
      {!clinicIntegrationActive && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-muted/60 border border-dashed">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(220, 80%, 40%)" }} />
            <p className="text-sm font-bold leading-relaxed" style={{ color: "hsl(220, 80%, 40%)" }}>
              Clinic system not connected. Active queue uses ClynicQ session data.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-xs pointer-events-none opacity-80" style={{ color: "black", borderWidth: "2px", borderColor: "hsl(215, 25%, 40%)" }}>
            Connect CMS
          </Button>
        </div>
      )}

      {/* Row 2 — Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT COLUMN — Audience Selection + Send */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Operational Broadcast</CardTitle>
                <CardDescription>Select audience and send announcements</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-[10px] font-normal px-2 py-1">
                <Database className="h-3 w-3" />
                {clinicIntegrationActive ? "Clinic Assist" : "ClynicQ"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {/* Audience Selection Buttons */}
            <div className="flex gap-2">
              <Button
                variant={audienceMode === "active-queue" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => setAudienceMode("active-queue")}
                disabled={activeQueueDisabled}
              >
                <Megaphone className="h-3.5 w-3.5" />
                Active Queue Patients
              </Button>
              <Button
                variant={audienceMode === "recent-customers" ? "default" : "outline"}
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => setAudienceMode("recent-customers")}
              >
                <Users className="h-3.5 w-3.5" />
                Recent Customers (60 Days)
              </Button>
            </div>

            {/* Audience Source Indicator */}
            <p className="text-[11px] text-muted-foreground">
              Audience source:{" "}
              <span className="font-medium">
                {clinicIntegrationActive ? "Clinic system" : "ClynicQ session data"}
              </span>
            </p>

            {/* Active Queue Filters */}
            {audienceMode === "active-queue" && (
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-7 text-xs">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">Ahead ≤</span>
                  <Input
                    type="number"
                    min={0}
                    value={maxAhead}
                    onChange={(e) => setMaxAhead(e.target.value)}
                    className="w-[55px] h-7 text-xs"
                    placeholder="—"
                  />
                </div>
              </div>
            )}

            {/* Audience Table */}
            <div className="border rounded-md max-h-[220px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[36px] px-2">
                      <Checkbox
                        checked={allFilteredSelected}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="text-xs px-2">Name</TableHead>
                    {audienceMode === "active-queue" && (
                      <>
                        <TableHead className="text-xs px-2">Queue #</TableHead>
                        <TableHead className="text-xs px-2">Ahead</TableHead>
                        <TableHead className="text-xs px-2">Status</TableHead>
                      </>
                    )}
                    {audienceMode === "recent-customers" && (
                      <TableHead className="text-xs px-2">Last Visit</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudience.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={audienceMode === "active-queue" ? 5 : 3}
                        className="text-center text-xs text-muted-foreground py-6"
                      >
                        {audienceMode === "active-queue"
                          ? "No active queue patients"
                          : "No recent customers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAudience.map((patient) => (
                      <TableRow key={patient.id} className="h-8">
                        <TableCell className="px-2 py-1">
                          <Checkbox
                            checked={selectedPatientIds.has(patient.id)}
                            onCheckedChange={(checked) => handleTogglePatient(patient.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-medium px-2 py-1">{patient.name || "—"}</TableCell>
                        {audienceMode === "active-queue" && (
                          <>
                            <TableCell className="text-xs px-2 py-1">{patient.queueNumber || "—"}</TableCell>
                            <TableCell className="text-xs px-2 py-1">{patient.patientsAhead ?? "—"}</TableCell>
                            <TableCell className="px-2 py-1">
                              <Badge
                                variant={patient.status === "arrived" ? "default" : "secondary"}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {patient.status === "arrived" ? "Arrived" : "Waiting"}
                              </Badge>
                            </TableCell>
                          </>
                        )}
                        {audienceMode === "recent-customers" && (
                          <TableCell className="text-xs text-muted-foreground px-2 py-1">
                            {patient.lastVisitDate || "—"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {selectedPatientIds.size} of {filteredAudience.length} selected
            </p>

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Send Button */}
            <Button onClick={handleSendBroadcast} className="w-full gap-2" disabled={selectedPatientIds.size === 0}>
              <Send className="h-4 w-4" />
              Send Broadcast to {selectedPatientIds.size} {selectedPatientIds.size === 1 ? "Patient" : "Patients"}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN — Message Templates */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>Select or manage message templates for broadcast</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {/* Template Selection for Broadcast */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Message</Label>
              <RadioGroup value={selectedTemplateId} onValueChange={handleTemplateSelection}>
                {templates.map((template) => (
                  <div key={template.id} className="flex items-start space-x-2.5 py-0.5">
                    <RadioGroupItem value={template.id} id={`tpl-${template.id}`} className="mt-0.5" />
                    <Label htmlFor={`tpl-${template.id}`} className="font-normal cursor-pointer text-sm leading-snug">
                      {template.message}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2.5 py-0.5">
                  <RadioGroupItem value="custom" id="tpl-custom" className="mt-0.5" />
                  <Label htmlFor="tpl-custom" className="font-normal cursor-pointer text-sm leading-snug">
                    Custom Operational Message
                  </Label>
                </div>
                {businessType === "wellness" && (
                  <div className="flex items-start space-x-2.5 py-0.5">
                    <RadioGroupItem value="custom-marketing" id="tpl-custom-marketing" className="mt-0.5" />
                    <Label htmlFor="tpl-custom-marketing" className="font-normal cursor-pointer text-sm leading-snug">
                      Custom Marketing Message
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Custom Message Input */}
            {showCustomInput && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Your Message</Label>
                  <span className="text-[11px] text-muted-foreground">{customMessage.length}/200</span>
                </div>
                <Textarea
                  value={customMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 200) {
                      setCustomMessage(e.target.value);
                      setValidationError(null);
                    }
                  }}
                  placeholder={
                    selectedTemplateId === "custom-marketing"
                      ? "Enter your marketing message..."
                      : "Enter operational notice..."
                  }
                  className="min-h-[70px] text-sm"
                />
                {selectedTemplateId === "custom" && (
                  <p className="text-[11px] text-muted-foreground">
                    Only operational notices are allowed. Marketing, promotions, and medical advice are prohibited.
                  </p>
                )}
                {selectedTemplateId === "custom-marketing" && (
                  <div className="space-y-2 mt-2">
                    <Alert className="py-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <AlertDescription className="text-xs">
                        Marketing messages can only be sent to users who have provided consent.
                      </AlertDescription>
                    </Alert>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="marketing-consent-inline"
                        checked={marketingConsent}
                        onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                      />
                      <Label htmlFor="marketing-consent-inline" className="text-xs font-normal leading-relaxed cursor-pointer">
                        I confirm this is only sent to users who provided marketing consent.
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t pt-3">
              <Label className="text-sm font-medium">Manage Templates</Label>
            </div>

            {/* Template Management */}
            {templates.length > 0 && (
              <div className="space-y-1.5">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center gap-1.5 p-1.5 rounded border bg-muted/30 text-xs">
                    {editingId === template.id ? (
                      <>
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 h-7 text-xs"
                          maxLength={200}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit}>
                          <Check className="h-3 w-3 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 truncate">{template.message}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleStartEdit(template)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {templates.length < MAX_TEMPLATES && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Create New Template</Label>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Enter a new message template..."
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    maxLength={200}
                    className="text-xs h-8"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTemplate(); }}
                  />
                  <Button size="sm" onClick={handleAddTemplate} disabled={!newTemplate.trim()} className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              {templates.length}/{MAX_TEMPLATES} templates used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Log — Full Width */}
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
    </div>
  );
};
