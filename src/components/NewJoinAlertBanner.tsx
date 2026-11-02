import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueEntry } from "@/types/queue";

interface NewJoinAlertBannerProps {
  newEntries: QueueEntry[];
  onDismiss: () => void;
  onOpenQueue: () => void;
}

export const NewJoinAlertBanner = ({ newEntries, onDismiss, onOpenQueue }: NewJoinAlertBannerProps) => {
  if (newEntries.length === 0) return null;
  const count = newEntries.length;
  const latest = newEntries[newEntries.length - 1];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="sticky top-2 z-30 flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border-2 border-primary bg-primary/10 p-3 sm:p-4 shadow-lg motion-safe:animate-pulse"
    >
      <div className="flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <BellRing className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0 flex-1 break-words">
        <div className="text-base font-semibold text-foreground">
          {count === 1
            ? `New patient joined the queue — ${latest.queueNumber}`
            : `${count} new patients joined the queue`}
        </div>
        <div className="text-sm text-muted-foreground">
          {latest.name ? `${latest.name} • ` : ""}
          {latest.mobile} • Joined {latest.joinedAt}
        </div>
      </div>
      <Button size="sm" onClick={onOpenQueue}>Open queue</Button>
      <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Dismiss alert">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
