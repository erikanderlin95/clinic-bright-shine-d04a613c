import { useState } from "react";
import { QueueHeader } from "@/components/QueueHeader";
import { QueueControls } from "@/components/QueueControls";
import { DailySummary } from "@/components/DailySummary";
import { QueueTable } from "@/components/QueueTable";
import { PatientDetailPanel } from "@/components/PatientDetailPanel";
import { WalkinRecordsSection } from "@/components/WalkinRecordsSection";
import { BookingChannelsPanel } from "@/components/BookingChannelsPanel";
import { AddToQueueDialog } from "@/components/AddToQueueDialog";
import { CheckInVerifyDialog } from "@/components/CheckInVerifyDialog";

import { AutomationPanel, type MessageTemplate } from "@/components/AutomationPanel";

import { DoctorProfilesPanel } from "@/components/DoctorProfilesPanel";
import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/useAuth";
import type { QueueEntry, DailySummary as DailySummaryType, BookingLead, VisitCategory } from "@/types/queue";

const generateCheckInCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const Index = () => {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isPaused, setIsPaused] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyEntry, setVerifyEntry] = useState<QueueEntry | null>(null);

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
      patientType: "walk-in",
      visitCategory: "Consultation",
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
      patientType: "walk-in",
      visitCategory: "Follow-up",
    },
    {
      id: "3",
      queueNumber: "A105",
      status: "waiting",
      joinedAt: "10:30",
      name: "Sarah Lim",
      mobile: "+65 9444 5566",
      queueSource: "Other",
      patientType: "walk-in",
      visitCategory: "Others",
      remarksDetail: "Post-op review",
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
      patientType: "walk-in",
    },
    {
      id: "11",
      queueNumber: "A101",
      status: "cancelled",
      joinedAt: "09:20",
      name: "Daniel Koh",
      mobile: "+65 9888 1122",
      email: "daniel.koh@example.com",
      queueSource: "Walk-in",
      visitCategory: "Consultation",
      notes: "Left queue at 10:35 — Reason: Wait time too long",
      checkInCode: "L9F4J2",
      patientType: "walk-in",
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
    liveQueue: 32,
    bookingsToday: 5,
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
    patientType?: "walk-in" | "non-digital";
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
      checkInCode: data.patientType === "non-digital" ? undefined : generateCheckInCode(),
      patientType: data.patientType || "walk-in",
      ...data,
    };
    setQueueEntries((prev) => [...prev, newEntry]);
  };

  const handleVerifyArrival = (entry: QueueEntry) => {
    setVerifyEntry(entry);
    setVerifyDialogOpen(true);
  };

  const moveEntryDownOne = (prev: QueueEntry[], id: string): QueueEntry[] => {
    const updated = prev.map((entry) =>
      entry.id === id
        ? { ...entry, previousStatus: entry.status, status: "arrived" as const }
        : entry
    );
    const activeQueue = updated.filter(
      (e) => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show"
    );
    const currentIndex = activeQueue.findIndex((e) => e.id === id);
    if (currentIndex === -1 || currentIndex >= activeQueue.length - 1) {
      return updated;
    }
    const entry = activeQueue[currentIndex];
    const reordered = [...activeQueue];
    reordered.splice(currentIndex, 1);
    reordered.splice(currentIndex + 1, 0, entry);
    const nonActive = updated.filter(
      (e) => e.status === "completed" || e.status === "cancelled" || e.status === "no-show" || e.status === "booked"
    );
    return [...reordered, ...nonActive];
  };

  const handleVerified = (id: string) => {
    setQueueEntries((prev) => moveEntryDownOne(prev, id));
  };

  const handleBypass = (id: string) => {
    setQueueEntries((prev) => moveEntryDownOne(prev, id));
  };

  // Active queue = walk-ins not completed/cancelled/no-show
  const getActiveQueue = () =>
    queueEntries.filter(
      (e) => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show"
    );

  // Today's patient flow: all active queue entries
  const getTodaysPatientFlow = () => {
    return getActiveQueue();
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
        <main className={`flex-1 p-8 ${selectedEntry ? "mr-80" : ""} transition-all duration-300`}>
          <Tabs defaultValue="queue" className="w-full">
            <TabsList>
              <TabsTrigger value="queue">{t("queueManagement")}</TabsTrigger>
              
              <TabsTrigger value="appointments">Booking Channels</TabsTrigger>
              <TabsTrigger value="automation">{t("automation")}</TabsTrigger>
              
              <TabsTrigger value="profiles">{t("doctorProfiles")}</TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-5 mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">{t("liveQueueView")}</h2>
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
                    Add Patient (non digital)
                  </Button>
                </div>
                <QueueTable
                  entries={getTodaysPatientFlow()}
                  onSelectEntry={setSelectedEntry}
                  selectedEntry={selectedEntry}
                  onUpdateStatus={handleUpdateStatus}
                  onRevertStatus={handleRevertStatus}
                  onVerifyArrival={handleVerifyArrival}
                  
                />
              </div>

              <WalkinRecordsSection entries={queueEntries} />
            </TabsContent>




            <TabsContent value="appointments" className="mt-5">
              <BookingChannelsPanel />
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
                queueEntries={queueEntries}
                onSelectPatient={(id) => {
                  const entry = queueEntries.find((e) => e.id === id);
                  if (entry) setSelectedEntry(entry);
                }}
              />
            </TabsContent>


            <TabsContent value="profiles" className="mt-5">
              <DoctorProfilesPanel />
            </TabsContent>


            <TabsContent value="settings" className="mt-5">
              <SettingsPanel />
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

    </div>
  );
};

export default Index;
