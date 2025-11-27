import { useState } from "react";
import { QueueHeader } from "@/components/QueueHeader";
import { QueueControls } from "@/components/QueueControls";
import { DailySummary } from "@/components/DailySummary";
import { QueueTable } from "@/components/QueueTable";
import { PatientDetailPanel } from "@/components/PatientDetailPanel";
import { MessagingPanel } from "@/components/MessagingPanel";
import { Phase1Notice } from "@/components/Phase1Notice";
import { VisitLogSection } from "@/components/VisitLogSection";
import { AddToQueueDialog } from "@/components/AddToQueueDialog";
import { AutomationPanel } from "@/components/AutomationPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import type { QueueEntry, DailySummary as DailySummaryType } from "@/types/queue";

interface AutomationLog {
  id: string;
  time: string;
  action: string;
}

const Index = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Business type and automation state
  const [businessType, setBusinessType] = useState<"healthcare" | "wellness">("healthcare");
  const [autoArrivalCheckEnabled, setAutoArrivalCheckEnabled] = useState(false);
  const [yourTurnSoonEnabled, setYourTurnSoonEnabled] = useState(false);
  const [delayAlertsEnabled, setDelayAlertsEnabled] = useState(false);
  const [visitCompletionEnabled, setVisitCompletionEnabled] = useState(false);
  
  // Automation log
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
    },
    {
      id: "2",
      queueNumber: "A104",
      status: "arrived",
      joinedAt: "10:12",
      name: "John Doe",
      mobile: "+65 9234 5678",
      queueSource: "Phone Booking",
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
    },
    {
      id: "7",
      queueNumber: "B201",
      status: "booked",
      joinedAt: "14:00",
      name: "Sarah Chen",
      mobile: "+65 9111 2233",
      email: "sarah.chen@example.com",
      queueSource: "Other",
      notes: "Book Appointment - ClynicQ",
      visitCategory: "Consultation",
    },
    {
      id: "8",
      queueNumber: "B202",
      status: "booked",
      joinedAt: "15:30",
      name: "Michael Tan",
      mobile: "+65 9333 4455",
      email: "michael.tan@example.com",
      queueSource: "Other",
      notes: "Book Appointment - ClynicQ",
      visitCategory: "General Treatment",
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
    queueSource: "Walk-in" | "Phone Booking" | "Other";
    notes?: string;
  }) => {
    const nextNumber = queueEntries.length + 101;
    const newEntry: QueueEntry = {
      id: Date.now().toString(),
      queueNumber: `A${nextNumber}`,
      status: "waiting",
      joinedAt: new Date().toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false 
      }),
      ...data,
    };
    setQueueEntries((prev) => [...prev, newEntry]);
  };

  const addAutomationLog = (action: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    const newLog: AutomationLog = {
      id: Date.now().toString(),
      time: timeString,
      action,
    };
    
    setAutomationLog((prev) => [newLog, ...prev]);
  };

  const handleToggleAutoArrivalCheck = (checked: boolean) => {
    setAutoArrivalCheckEnabled(checked);
    addAutomationLog(`Auto Arrival Check turned ${checked ? "ON" : "OFF"}`);
  };

  const handleToggleYourTurnSoon = (checked: boolean) => {
    setYourTurnSoonEnabled(checked);
    addAutomationLog(`"Your Turn Soon" Message turned ${checked ? "ON" : "OFF"}`);
  };

  const handleToggleDelayAlerts = (checked: boolean) => {
    setDelayAlertsEnabled(checked);
    addAutomationLog(`Delay Alerts Broadcast turned ${checked ? "ON" : "OFF"}`);
  };

  const handleToggleVisitCompletion = (checked: boolean) => {
    setVisitCompletionEnabled(checked);
    addAutomationLog(`Visit Completion Message turned ${checked ? "ON" : "OFF"}`);
  };

  const handleSendBroadcast = (message: string, isMarketing: boolean = false) => {
    if (isMarketing) {
      addAutomationLog(`Marketing broadcast sent (consented users only): "${message}"`);
    } else {
      addAutomationLog(`Operational broadcast sent to active patients: "${message}"`);
    }
  };

  const handleSendRecentCustomersBroadcast = (message: string, isMarketing: boolean = false) => {
    if (isMarketing) {
      addAutomationLog(`Marketing broadcast sent to recent customers (consented users only): "${message}"`);
    } else {
      addAutomationLog(`Operational broadcast sent to recent customers (last 60 days): "${message}"`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <QueueHeader />
      
      <div className="flex">
        <main className={`flex-1 p-6 ${selectedEntry ? "mr-80" : ""} transition-all duration-300`}>
          <div className="space-y-6">
            <Phase1Notice />
            
            <Tabs defaultValue="queue" className="w-full">
              <TabsList>
                <TabsTrigger value="queue">Queue Management</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="queue" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Queue Management</h2>
                  <QueueControls
                    isPaused={isPaused}
                    onTogglePause={() => setIsPaused(!isPaused)}
                    onClose={() => console.log("Close queue")}
                    onReopen={() => console.log("Reopen queue")}
                  />
                </div>

                <DailySummary summary={dailySummary} />

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Live Queue View</h3>
                    <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add to Queue
                    </Button>
                  </div>
                  <QueueTable
                    entries={queueEntries.filter(
                      (entry) => entry.status !== "completed" && 
                                 entry.status !== "cancelled" && 
                                 entry.status !== "no-show" &&
                                 entry.status !== "booked"
                    )}
                    onSelectEntry={setSelectedEntry}
                    selectedEntry={selectedEntry}
                    onUpdateStatus={handleUpdateStatus}
                    onRevertStatus={handleRevertStatus}
                  />
                </div>

                <MessagingPanel />
                
                <VisitLogSection entries={queueEntries} />
              </TabsContent>
              
              <TabsContent value="automation" className="mt-6">
                <AutomationPanel
                  businessType={businessType}
                  onBusinessTypeChange={setBusinessType}
                  autoArrivalCheckEnabled={autoArrivalCheckEnabled}
                  yourTurnSoonEnabled={yourTurnSoonEnabled}
                  delayAlertsEnabled={delayAlertsEnabled}
                  visitCompletionEnabled={visitCompletionEnabled}
                  automationLog={automationLog}
                  onToggleAutoArrivalCheck={handleToggleAutoArrivalCheck}
                  onToggleYourTurnSoon={handleToggleYourTurnSoon}
                  onToggleDelayAlerts={handleToggleDelayAlerts}
                  onToggleVisitCompletion={handleToggleVisitCompletion}
                  onSendBroadcast={handleSendBroadcast}
                  onSendRecentCustomersBroadcast={handleSendRecentCustomersBroadcast}
                />
              </TabsContent>
            </Tabs>
          </div>
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
    </div>
  );
};

export default Index;
