import { useState, useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { QueueHeader } from "@/components/QueueHeader";
import { QueueControls } from "@/components/QueueControls";
import { PatientDetailPanel } from "@/components/PatientDetailPanel";
import { WalkinRecordsSection } from "@/components/WalkinRecordsSection";

import { AddToQueueDialog } from "@/components/AddToQueueDialog";
import { CheckInVerifyDialog } from "@/components/CheckInVerifyDialog";
import { NotificationsTable } from "@/components/NotificationsTable";
import { NewJoinAlertBanner } from "@/components/NewJoinAlertBanner";
import { ClinicOperationStatus } from "@/components/ClinicOperationStatus";
import { getQueueVisibilityMode, QUEUE_MODE_EVENT, type QueueVisibilityMode } from "@/components/SettingsPanel";
import { useEffect } from "react";

import { AutomationPanel, type MessageTemplate } from "@/components/AutomationPanel";

import { AppointmentBookingPanel } from "@/components/AppointmentBookingPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
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
  const [queueMode, setQueueMode] = useState<QueueVisibilityMode>(getQueueVisibilityMode);
  const [activeTab, setActiveTab] = useState<string>("queue");
  const [pendingAlerts, setPendingAlerts] = useState<QueueEntry[]>([]);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const originalTitleRef = useRef<string>(typeof document !== "undefined" ? document.title : "");
  const titleFlashRef = useRef<number | null>(null);

  const playAlertBeep = () => {
    try {
      const AudioCtx =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      };
      playTone(880, 0, 0.18);
      playTone(1175, 0.2, 0.22);
      setTimeout(() => ctx.close().catch(() => {}), 800);
    } catch {
      /* ignore */
    }
  };

  const flashTitle = (message: string) => {
    if (typeof document === "undefined") return;
    if (titleFlashRef.current) window.clearInterval(titleFlashRef.current);
    const original = originalTitleRef.current || document.title;
    let toggle = false;
    document.title = `🔔 ${message}`;
    titleFlashRef.current = window.setInterval(() => {
      document.title = toggle ? original : `🔔 ${message}`;
      toggle = !toggle;
    }, 1200);
    const stop = () => {
      if (titleFlashRef.current) {
        window.clearInterval(titleFlashRef.current);
        titleFlashRef.current = null;
      }
      document.title = original;
      window.removeEventListener("focus", stop);
      document.removeEventListener("visibilitychange", onVis);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") stop();
    };
    window.addEventListener("focus", stop);
    document.addEventListener("visibilitychange", onVis);
  };

  useEffect(() => {
    setQueueMode(getQueueVisibilityMode());
    const sync = () => {
      setQueueMode(getQueueVisibilityMode());
      setSelectedEntry(null);
    };
    window.addEventListener("storage", sync);
    window.addEventListener(QUEUE_MODE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(QUEUE_MODE_EVENT, sync);
    };
  }, []);

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

  useEffect(() => {
    const currentIds = new Set(queueEntries.map((e) => e.id));
    if (knownIdsRef.current === null) {
      knownIdsRef.current = currentIds;
      return;
    }
    const newEntries = queueEntries.filter((e) => !knownIdsRef.current?.has(e.id));
    knownIdsRef.current = currentIds;
    if (newEntries.length === 0) return;

    const first = newEntries[0];
    const label =
      newEntries.length > 1
        ? `${newEntries.length} new patients joined the queue`
        : `New patient ${first.queueNumber} joined the queue`;

    playAlertBeep();
    flashTitle(label);
    setPendingAlerts((prev) => [...prev, ...newEntries]);
    sonnerToast(label, {
      description: first.name ? `${first.name} • ${first.mobile}` : first.mobile,
      duration: 10000,
      action: {
        label: "Open queue",
        onClick: () => {
          setActiveTab("queue");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    });
  }, [queueEntries]);



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
      visitDate: new Date().toLocaleDateString("en-CA"),
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

  const handleNotifyPatient = (entry: QueueEntry) => {
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const message = encodeURIComponent(
      `Hi${entry.name ? " " + entry.name : ""}, it's your turn at the clinic. Please head to the consultation room. — ClynicQ`
    );
    const phone = entry.mobile.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    setQueueEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id
          ? { ...e, previousStatus: e.status, status: "notified" as const, notifiedAt: time }
          : e
      )
    );
    toast({ title: "Notification sent", description: `WhatsApp opened for ${entry.name || entry.mobile}.` });
  };

  // Active queue = walk-ins not completed/cancelled/no-show
  const getActiveQueue = () =>
    queueEntries.filter(
      (e) => e.status !== "completed" && e.status !== "cancelled" && e.status !== "no-show"
    );

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
        <main className={`min-w-0 max-w-[1455px] flex-1 p-3 sm:p-6 lg:p-8 ${selectedEntry ? "lg:mr-80" : ""} transition-all duration-300`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex h-auto w-full flex-wrap justify-start sm:w-fit [&>button]:min-h-10 [&>button]:shrink-0 [&>button]:px-2 [&>button]:text-xs sm:[&>button]:min-h-11 sm:[&>button]:px-3 sm:[&>button]:text-sm">
              <TabsTrigger value="queue">{t("queueManagement")}</TabsTrigger>
              <TabsTrigger value="automation">{t("automation")}</TabsTrigger>
              
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="mt-3 space-y-3 sm:mt-5 sm:space-y-5">
              <NewJoinAlertBanner
                newEntries={pendingAlerts}
                onDismiss={() => setPendingAlerts([])}
                onOpenQueue={() => {
                  setActiveTab("queue");
                  setPendingAlerts([]);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <QueueControls
                    isPaused={isPaused}
                    isClosed={isClosed}
                    onTogglePause={() => setIsPaused(!isPaused)}
                    onToggleClose={() => setIsClosed(!isClosed)}
                  />
                </div>
              </div>

              <WalkinRecordsSection entries={queueEntries} />
            </TabsContent>






            <TabsContent value="automation" className="mt-3 sm:mt-5">
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




            <TabsContent value="settings" className="mt-3 sm:mt-5">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        </main>

        {selectedEntry && (
          <aside aria-label="Patient details" className="fixed inset-0 z-40 h-dvh w-full overflow-y-auto bg-card lg:left-auto lg:w-80">
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
