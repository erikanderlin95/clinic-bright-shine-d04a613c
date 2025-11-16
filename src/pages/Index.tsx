import { useState } from "react";
import { QueueHeader } from "@/components/QueueHeader";
import { QueueControls } from "@/components/QueueControls";
import { DailySummary } from "@/components/DailySummary";
import { QueueTable } from "@/components/QueueTable";
import { PatientDetailPanel } from "@/components/PatientDetailPanel";
import { MessagingPanel } from "@/components/MessagingPanel";
import type { QueueEntry, DailySummary as DailySummaryType } from "@/types/queue";

const Index = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([
    {
      id: "1",
      queueNumber: "A103",
      status: "late",
      joinedAt: "10:05",
      notes: "Walk-in patient",
    },
    {
      id: "2",
      queueNumber: "A104",
      status: "arrived",
      joinedAt: "10:12",
      notes: "Follow-up appointment",
    },
    {
      id: "3",
      queueNumber: "A105",
      status: "waiting",
      joinedAt: "10:20",
    },
    {
      id: "4",
      queueNumber: "A106",
      status: "cancelled",
      joinedAt: "10:20",
    },
    {
      id: "5",
      queueNumber: "A107",
      status: "waiting",
      joinedAt: "10:30",
    },
    {
      id: "6",
      queueNumber: "A108",
      status: "waiting",
      joinedAt: "10:35",
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
      prev.map((entry) => (entry.id === id ? { ...entry, status } : entry))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setQueueEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, notes } : entry))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <QueueHeader />
      
      <div className="flex">
        <main className={`flex-1 p-6 ${selectedEntry ? "mr-80" : ""} transition-all duration-300`}>
          <div className="space-y-6">
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
              <h3 className="mb-4 text-lg font-semibold text-foreground">Live Queue View</h3>
              <QueueTable
                entries={queueEntries}
                onSelectEntry={setSelectedEntry}
                selectedEntry={selectedEntry}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>

            <MessagingPanel />
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
    </div>
  );
};

export default Index;
