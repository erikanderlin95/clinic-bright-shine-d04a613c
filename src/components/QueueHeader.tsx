import { Activity } from "lucide-react";

export const QueueHeader = () => {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">ClinicQ Dashboard</h1>
          <p className="text-sm text-muted-foreground">Queue & communication interface for daily clinic operations</p>
        </div>
      </div>
    </header>
  );
};
