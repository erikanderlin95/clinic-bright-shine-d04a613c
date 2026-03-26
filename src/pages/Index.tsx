import { useState } from "react";
import { QueueHeader } from "@/components/QueueHeader";
import { QueueControls } from "@/components/QueueControls";
import { DailySummary } from "@/components/DailySummary";
import { QueueTable } from "@/components/QueueTable";
import { PatientDetailPanel } from "@/components/PatientDetailPanel";
import { VisitLogSection } from "@/components/VisitLogSection";
import { AddToQueueDialog } from "@/components/AddToQueueDialog";
import { BookingRequestsPanel } from "@/components/BookingRequestsPanel";
import { CheckInVerifyDialog } from "@/components/CheckInVerifyDialog";
import { AdjustQueueDialog } from "@/components/AdjustQueueDialog";
import { AutomationPanel, type MessageTemplate } from "@/components/AutomationPanel";
import { DoctorSchedulePanel } from "@/components/DoctorSchedulePanel";
import { DoctorProfilesPanel } from "@/components/DoctorProfilesPanel";
import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import type { QueueEntry, DailySummary as DailySummaryType, BookingLead, VisitCategory } from "@/types/queue";

const generateCheckInCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Index = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isPaused, setIsPaused] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyEntry, setVerifyEntry] = useState<QueueEntry | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustEntry, setAdjustEntry] = useState<QueueEntry | null>(null);

  // Automation state
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([
    { id: "1", message: "Doctor running late. Thank you for your patience." },
    { id: "2", message: "Queue moving. Please return to the clinic." },
    { id: "3", message: "Your turn is coming up soon. Please be ready." },
  ]);

  interface AutomationLog {
    id: string;
    time: string;
    action: string;
  }

  const [automationLog, setAutomationLog] = useState<AutomationLog[]>([
    { id: "1", time: "10:32", action: 'Sent "Your turn soon"' },
    { id: "2", time: "10:40", action: "Patient marked Arrived" },
    { id: "3", time: "11:10", action: "Delay alert sent" },
  ]);

  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([
    {
      id: "1",
      queueNumber: "A103",
      status: "waiting",
      joinedAt: "10:05",
      mobile: "+65 9123 4567",
      queueSource: "Walk-in",
      checkInCode: "X7K2M9",
    },
    {
      id: "2",
      queueNumber: "A104",
      status: "arrived",
      joinedAt: "10:12",
      name: "John Doe",
      mobile: "+65 9234 5678",
      queueSource: "Phone Booking",
      checkInCode: "P3N8Q1",
    },
    {
      id: "10",
      queueNumber: "A102",
      status: "completed",
      joinedAt: "09:45",
      name: "Alice Wong",
      mobile: "+65 9777 5678",
      email: "alice.wong@example.com",
      queueSource: "Walk-in",
      duration: 22,
      visitCategory: "Follow-up",
      notes: "Regular walk-in visit",
      checkInCode: "R5T1W4",
    },
  ]);

  const [bookingLeads, setBookingLeads] = useState<BookingLead[]>([
    {
      id: "L1",
      caseId: "BK-001",
      patientName: "Sarah Chen",
      mobile: "+65 9111 2233",
      preferredDateTime: "2026-03-26 14:00",
      source: "QR",
      timestamp: "2026-03-25 09:15",
      status: "new",
    },
    {
      id: "L2",
      caseId: "BK-002",
      patientName: "Michael Tan",
      mobile: "+65 9333 4455",
      preferredDateTime: "2026-03-27 10:00",
      source: "Marketplace",
      timestamp: "2026-03-25 10:30",
      status: "contacted",
    },
    {
      id: "L3",
      caseId: "BK-003",
      patientName: "Priya Kumar",
      mobile: "+65 9555 6677",
      source: "QR",
      timestamp: "2026-03-25 11:00",
      status: "new",
    },
  ]);

  const dailySummary: DailySummaryType = {
    totalQueue: 32,
    arrived: 26,
    cancelled: 4,
    noShows: 2,
    avgWaitTime: "23mins",
  };

  const handleUpdateStatus = (id: string, status: QueueEntry["status"]) => {
    setQueueEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, previousStatus: entry.status, status }
          : entry
      )
    );
  };

  const handleRevertStatus = (id: string) => {
    setQueueEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id && entry.previousStatus) {
          return { ...entry, status: entry.previousStatus, previousStatus: undefined };
        }
        return entry;
      })
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setQueueEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, notes } : entry))
    );
  };

  const handleAddToQueue = (data: {
    name?: string;
    mobile: string;
    email?: string;
    queueSource: "Walk-in" | "Phone Booking" | "Other";
    notes?: string;
    visitCategory?: VisitCategory;
  }) => {
    const nextNumber = queueEntries.length + 101;
    const newEntry: QueueEntry = {
      id: Date.now().toString(),
      queueNumber: `A${nextNumber}`,
      status: "waiting",
      joinedAt: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      checkInCode: generateCheckInCode(),
      ...data,
    };
    setQueueEntries((prev) => [...prev, newEntry]);
  };

  const handleVerifyArrival = (entry: QueueEntry) => {
    setVerifyEntry(entry);
    setVerifyDialogOpen(true);
  };

  const handleVerified = (id: string) => {
    handleUpdateStatus(id, "arrived");
  };

  const handleBypass = (id: string) => {
    handleUpdateStatus(id, "arrived");
  };

  // Adjust queue flow
  const getActiveQueue = () =>
    queueEntries.filter(
      (e) => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show" && e.status !== "booked"
    );

  const handleOpenAdjust = (entry: QueueEntry) => {
    setAdjustEntry(entry);
    setAdjustDialogOpen(true);
  };

  const handleAdjustSave = (entryId: string, newPosition: number, reason: string, note: string) => {
    const activeQueue = getActiveQueue();
    const currentIndex = activeQueue.findIndex((e) => e.id === entryId);
    if (currentIndex === -1) return;

    const fromPos = currentIndex + 1;
    const entry = activeQueue[currentIndex];

    // Reorder: remove from current, insert at new position
    const reordered = [...activeQueue];
    reordered.splice(currentIndex, 1);
    reordered.splice(newPosition - 1, 0, entry);

    // Rebuild full list: keep non-active entries in place, replace active ordering
    const nonActive = queueEntries.filter(
      (e) => e.status === "completed" || e.status === "cancelled" || e.status === "no-show" || e.status === "booked"
    );
    setQueueEntries([...reordered, ...nonActive]);

    // Audit log
    const reasonLabel = t(reason as any) || reason;
    const logMsg = t("adjustLogMessage")
      .replace("{queue}", entry.queueNumber)
      .replace("{from}", String(fromPos))
      .replace("{to}", String(newPosition))
      .replace("{reason}", reasonLabel);
    const fullLog = note ? `${logMsg} ${note}` : logMsg;
    addAutomationLog(fullLog);

    setAdjustDialogOpen(false);
    toast({ title: t("adjustToast") });
  };

  const addAutomationLog = (action: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setAutomationLog((prev) => [{ id: Date.now().toString(), time: timeString, action }, ...prev]);
  };

  const handleSendBroadcast = (message: string, isMarketing: boolean = false) => {
    addAutomationLog(`${isMarketing ? "Marketing" : "Operational"} broadcast sent: "${message}"`);
  };

  const handleSendRecentCustomersBroadcast = (message: string, isMarketing: boolean = false) => {
    addAutomationLog(`${isMarketing ? "Marketing" : "Operational"} broadcast to recent customers: "${message}"`);
  };

  return (
    <div className="min-h-screen bg-background">
      <QueueHeader />

      <div className="flex">
        <main className={`flex-1 p-6 ${selectedEntry ? "mr-80" : ""} transition-all duration-300`}>
          <Tabs defaultValue="queue" className="w-full">
            <TabsList>
              <TabsTrigger value="queue">{t("queueManagement")}</TabsTrigger>
              <TabsTrigger value="requests">{t("bookingRequests")}</TabsTrigger>
              <TabsTrigger value="appointments">{t("appointments")}</TabsTrigger>
              <TabsTrigger value="automation">{t("automation")}</TabsTrigger>
              <TabsTrigger value="schedule">{t("doctorSchedule")}</TabsTrigger>
              <TabsTrigger value="profiles">{t("doctorProfiles")}</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-5 mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">{t("queueManagement")}</h2>
                <QueueControls
                  isPaused={isPaused}
                  isClosed={isClosed}
                  onTogglePause={() => setIsPaused(!isPaused)}
                  onToggleClose={() => setIsClosed(!isClosed)}
                />
              </div>

              <DailySummary summary={dailySummary} />

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{t("liveQueueView")}</h3>
                  <Button onClick={() => setAddDialogOpen(true)} size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    {t("addToQueue")}
                  </Button>
                </div>
                <QueueTable
                  entries={getActiveQueue()}
                  onSelectEntry={setSelectedEntry}
                  selectedEntry={selectedEntry}
                  onUpdateStatus={handleUpdateStatus}
                  onRevertStatus={handleRevertStatus}
                  onVerifyArrival={handleVerifyArrival}
                  onAdjust={handleOpenAdjust}
                />
              </div>

              <VisitLogSection entries={queueEntries} />
            </TabsContent>

            <TabsContent value="requests" className="mt-5">
              <BookingRequestsPanel requests={bookingLeads} />
            </TabsContent>

            <TabsContent value="appointments" className="mt-5">
              <AppointmentBookingPanel />
            </TabsContent>

            <TabsContent value="automation" className="mt-5">
              <AutomationPanel
                businessType="healthcare"
                onBusinessTypeChange={() => {}}
                autoArrivalCheckEnabled={false}
                yourTurnSoonEnabled={false}
                delayAlertsEnabled={false}
                visitCompletionEnabled={false}
                automationLog={automationLog}
                onToggleAutoArrivalCheck={() => {}}
                onToggleYourTurnSoon={() => {}}
                onToggleDelayAlerts={() => {}}
                onToggleVisitCompletion={() => {}}
                onSendBroadcast={handleSendBroadcast}
                onSendRecentCustomersBroadcast={handleSendRecentCustomersBroadcast}
                templates={messageTemplates}
                onTemplatesChange={setMessageTemplates}
              />
            </TabsContent>

            <TabsContent value="schedule" className="mt-5">
              <DoctorSchedulePanel />
            </TabsContent>

            <TabsContent value="profiles" className="mt-5">
              <DoctorProfilesPanel />
            </TabsContent>
          </Tabs>
        </main>

        {selectedEntry && (
          <aside className="fixed right-0 top-0 h-screen w-80 overflow-y-auto bg-card">
            <PatientDetailPanel
              entry={selectedEntry}
              onClose={() => setSelectedEntry(null)}
              onUpdateNotes={handleUpdateNotes}
            />
          </aside>
        )}
      </div>

      <AddToQueueDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddToQueue={handleAddToQueue}
      />

      <CheckInVerifyDialog
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        entry={verifyEntry}
        onVerified={handleVerified}
        onBypass={handleBypass}
      />

      <AdjustQueueDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        entry={adjustEntry}
        currentPosition={adjustEntry ? getActiveQueue().findIndex((e) => e.id === adjustEntry.id) + 1 : 1}
        totalPositions={getActiveQueue().length}
        onSave={handleAdjustSave}
      />
    </div>
  );
};

export default Index;
