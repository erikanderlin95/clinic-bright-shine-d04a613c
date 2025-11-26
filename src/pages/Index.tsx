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

const Index = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([
    {
      id: "1",
      queueNumber: "A103",
      status: "late",
      joinedAt: "10:05",
      mobile: "+65 9123 4567",
      queueSource: "Walk-in",
      notes: "Walk-in patient",
    },
    {
      id: "2",
      queueNumber: "A104",
      status: "arrived",
      joinedAt: "10:12",
      name: "John Doe",
      mobile: "+65 9234 5678",
      queueSource: "Phone Booking",
      notes: "Follow-up appointment",
    },
    {
      id: "3",
      queueNumber: "A105",
      status: "waiting",
      joinedAt: "10:20",
      mobile: "+65 9345 6789",
      queueSource: "Walk-in",
    },
    {
      id: "4",
      queueNumber: "A106",
      status: "cancelled",
      joinedAt: "10:20",
      mobile: "+65 9456 7890",
      queueSource: "Other",
    },
    {
      id: "5",
      queueNumber: "A107",
      status: "waiting",
      joinedAt: "10:30",
      mobile: "+65 9567 8901",
      queueSource: "Walk-in",
    },
    {
      id: "6",
      queueNumber: "A108",
      status: "waiting",
      joinedAt: "10:35",
      mobile: "+65 9678 9012",
      queueSource: "Phone Booking",
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
                    entries={queueEntries}
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
                <AutomationPanel />
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
