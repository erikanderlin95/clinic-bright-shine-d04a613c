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

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Megaphone, Users, Plus, Trash2, Edit2, Check, X, Database,
  AlertTriangle, AlertCircle, Send, Clock, Inbox, Info, Sparkles,
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
  onSelectPatient?: (id: string) => void;
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
  onSelectPatient,
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
    // If a saved template is selected, populate the custom message box with it
    if (value !== "custom" && value !== "custom-marketing") {
      const tpl = templates.find((t) => t.id === value);
      if (tpl) setCustomMessage(tpl.message);
    } else {
      setCustomMessage("");
    }
  };

  const showCustomInput = selectedTemplateId === "custom" || selectedTemplateId === "custom-marketing";
  const isTemplateSelected = selectedTemplateId !== "custom" && selectedTemplateId !== "custom-marketing";
  const activeQueueDisabled = !clinicIntegrationActive && activeQueuePatients.length === 0;

  // Helpers for redesigned UI
  const getInitials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const statusPillClass = (status?: string) => {
    if (status === "arrived") return "bg-emerald-100 text-emerald-700";
    if (status === "called") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-600";
  };

  const selectedCount = selectedPatientIds.size;

  return (
    <div className="max-w-[1455px] space-y-6">
      {/* HERO HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-gradient-to-br from-teal-50 via-white to-white p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[13px] font-medium text-teal-700">
            <Sparkles className="h-3.5 w-3.5" />
            Automation Workspace
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Automation</h1>
          <p className="text-[15px] text-muted-foreground">
            Send operational updates and automate patient communication.
          </p>
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
            clinicIntegrationActive ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              clinicIntegrationActive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
              Clinic System
            </span>
            <span className="text-[14px] font-semibold text-foreground">
              {clinicIntegrationActive ? "Connected" : "Not Connected"}
            </span>
          </div>
          {!clinicIntegrationActive && (
            <Button
              size="sm"
              variant="outline"
              className="ml-2 h-9 rounded-lg border-amber-300 bg-white text-[13px] font-semibold text-amber-800 hover:bg-amber-100 pointer-events-none"
            >
              Connect CMS
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
        {/* LEFT — Broadcast Message */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-[20px] font-semibold tracking-tight">Broadcast Message</CardTitle>
            <CardDescription className="text-[14px]">
              Select patients and send an operational update.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4 space-y-6">
            {/* Segment switcher */}
            <div className="flex flex-col sm:flex-row gap-2 rounded-xl bg-muted/50 p-1.5">
              <button
                type="button"
                onClick={() => setAudienceMode("active-queue")}
                disabled={activeQueueDisabled}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-all ${
                  audienceMode === "active-queue"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Users className="h-4 w-4" />
                Active Queue
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                    audienceMode === "active-queue" ? "bg-teal-100 text-teal-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activeQueuePatients.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceMode("recent-customers")}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-all ${
                  audienceMode === "recent-customers"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4" />
                Recent Patients
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3">
              {audienceMode === "active-queue" && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] h-10 rounded-lg text-[14px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">Ahead ≤</span>
                    <Input
                      type="number"
                      min={0}
                      value={maxAhead}
                      onChange={(e) => setMaxAhead(e.target.value)}
                      className="w-[72px] h-10 rounded-lg text-[14px]"
                      placeholder="—"
                    />
                  </div>
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                {filteredAudience.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSelectAll(!allFilteredSelected)}
                    className="text-[13px] font-medium text-teal-700 hover:underline"
                  >
                    {allFilteredSelected ? "Clear all" : "Select all"}
                  </button>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${
                    selectedCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {selectedCount} {selectedCount === 1 ? "Patient" : "Patients"} Selected
                </span>
              </div>
            </div>

            {/* Patient list */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredAudience.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/30 py-10 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-[15px] font-medium text-muted-foreground">No patients available</p>
                </div>
              ) : (
                filteredAudience.map((patient) => {
                  const selected = selectedPatientIds.has(patient.id);
                  return (
                    <label
                      key={patient.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                        selected
                          ? "border-teal-300 bg-teal-50/60 shadow-sm"
                          : "border-transparent bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => handleTogglePatient(patient.id, !!checked)}
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[13px] font-semibold text-teal-700">
                        {getInitials(patient.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-foreground truncate">
                          {patient.name || "—"}
                        </div>
                        <div className="text-[13px] text-muted-foreground">
                          {audienceMode === "active-queue" ? (
                            <>
                              Queue {patient.queueNumber || "—"} · {patient.patientsAhead ?? 0}{" "}
                              {patient.patientsAhead === 1 ? "patient" : "patients"} ahead
                            </>
                          ) : (
                            <>Last visit: {patient.lastVisitDate || "—"}</>
                          )}
                        </div>
                      </div>
                      {audienceMode === "active-queue" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${statusPillClass(
                            patient.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {patient.status === "arrived" ? "Arrived" : "Waiting"}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Message section */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-foreground">Choose Template</Label>
                <Select value={selectedTemplateId} onValueChange={handleTemplateSelection}>
                  <SelectTrigger className="w-full h-11 rounded-lg text-[15px]">
                    <SelectValue placeholder="Select a saved template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id} className="text-[15px]">
                        {template.message}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-[15px]">Custom Operational Message</SelectItem>
                    {businessType === "wellness" && (
                      <SelectItem value="custom-marketing" className="text-[15px]">Custom Marketing Message</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isTemplateSelected && (
                <div className="rounded-xl bg-muted/40 p-4 text-[15px] leading-relaxed">
                  {templates.find((t) => t.id === selectedTemplateId)?.message}
                </div>
              )}

              {showCustomInput && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[14px] font-semibold text-foreground">Message</Label>
                    <span className="text-[12px] text-muted-foreground">{customMessage.length}/200</span>
                  </div>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setCustomMessage(e.target.value);
                        setValidationError(null);
                      }
                    }}
                    placeholder="Type an operational update..."
                    className="min-h-[130px] rounded-xl text-[15px] p-4 resize-none"
                  />
                  {selectedTemplateId === "custom-marketing" && (
                    <div className="space-y-2 mt-1">
                      <Alert className="py-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <AlertDescription className="text-[14px]">
                          Marketing messages can only be sent to users who have provided consent.
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketing-consent-inline"
                          checked={marketingConsent}
                          onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                        />
                        <Label htmlFor="marketing-consent-inline" className="text-[14px] font-normal leading-relaxed cursor-pointer">
                          I confirm this is only sent to users who provided marketing consent.
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info card */}
              <div className="rounded-xl bg-sky-50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 shrink-0 text-sky-600 mt-0.5" />
                  <div className="space-y-2 text-[14px]">
                    <p className="font-semibold text-sky-900">Operational messages only</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                      <div>
                        <p className="font-medium text-emerald-700 mb-1">Allowed</p>
                        <ul className="space-y-0.5 text-foreground/80">
                          <li>• Queue updates</li>
                          <li>• Delays</li>
                          <li>• Clinic announcements</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-rose-700 mb-1">Not allowed</p>
                        <ul className="space-y-0.5 text-foreground/80">
                          <li>• Marketing</li>
                          <li>• Promotions</li>
                          <li>• Medical advice</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive" className="rounded-xl py-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-[14px]">{validationError}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Primary CTA */}
            <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur">
              <Button
                onClick={handleSendBroadcast}
                disabled={selectedCount === 0}
                className="w-full gap-2 h-14 rounded-2xl text-[16px] font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="h-5 w-5" />
                Send Message to {selectedCount} {selectedCount === 1 ? "Patient" : "Patients"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Automation Log + Templates */}
        <div className="space-y-6">
          {/* Automation Log */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="px-6 pt-6 pb-2 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-[18px] font-semibold tracking-tight">Automation Log</CardTitle>
                <CardDescription className="text-[14px]">Recent automated actions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[13px] text-teal-700 hover:bg-teal-50 hover:text-teal-800">
                View All
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              {automationLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/30 py-10 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/60" />
                  <p className="text-[14px] font-medium text-muted-foreground">No automation activity yet.</p>
                </div>
              ) : (
                <ol className="relative space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {automationLog.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-start gap-3 rounded-xl bg-muted/30 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium text-muted-foreground">{log.time}</div>
                        <div className="text-[14px] text-foreground leading-snug">{log.action}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="px-6 pt-6 pb-2 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-[18px] font-semibold tracking-tight">Message Templates</CardTitle>
                <CardDescription className="text-[14px]">Save reusable operational messages</CardDescription>
              </div>
              <span className="text-[12px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                {templates.length} / {MAX_TEMPLATES} Used
              </span>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 space-y-5">
              {/* Saved templates */}
              <div className="rounded-xl bg-muted/30 p-4 space-y-3">
                <Label className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Saved Templates
                </Label>
                {templates.length > 0 ? (
                  <>
                    <Select
                      value={editingId || ""}
                      onValueChange={(id) => {
                        const t = templates.find((t) => t.id === id);
                        if (t) handleStartEdit(t);
                      }}
                    >
                      <SelectTrigger className="w-full h-11 rounded-lg text-[15px] bg-white">
                        <SelectValue placeholder="Preview / edit a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id} className="text-[15px]">
                            {template.message}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {editingId && (
                      <div className="flex items-center gap-2 p-3 rounded-xl border bg-white">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 h-10 rounded-lg text-[15px]"
                          maxLength={200}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => { handleDeleteTemplate(editingId); setEditingId(null); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[14px] text-muted-foreground text-center py-4">
                    No templates yet. Create one below.
                  </p>
                )}
              </div>

              {/* Create new */}
              {templates.length < MAX_TEMPLATES && (
                <div className="rounded-xl bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Create Template
                    </Label>
                    <span className="text-[12px] text-muted-foreground">{newTemplate.length}/200</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a new message..."
                      value={newTemplate}
                      onChange={(e) => setNewTemplate(e.target.value)}
                      maxLength={200}
                      className="text-[15px] h-11 rounded-lg bg-white"
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddTemplate(); }}
                    />
                    <Button
                      onClick={handleAddTemplate}
                      disabled={!newTemplate.trim()}
                      className="h-11 rounded-lg text-[15px] px-4 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add
                    </Button>
                  </div>
                  {/* progress bar */}
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all"
                      style={{ width: `${(templates.length / MAX_TEMPLATES) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
