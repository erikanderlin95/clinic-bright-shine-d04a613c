import { Button } from "@/components/ui/button";
import { Pause, Play, XCircle, RotateCw } from "lucide-react";

interface QueueControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onClose: () => void;
  onReopen: () => void;
}

export const QueueControls = ({ isPaused, onTogglePause, onClose, onReopen }: QueueControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={isPaused ? "default" : "secondary"}
        size="sm"
        onClick={onTogglePause}
        className="gap-2"
      >
        {isPaused ? (
          <>
            <Play className="h-4 w-4" />
            Resume Queue
          </>
        ) : (
          <>
            <Pause className="h-4 w-4" />
            Pause Queue
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
        <XCircle className="h-4 w-4" />
        Close Queue
      </Button>
      <Button variant="outline" size="sm" onClick={onReopen} className="gap-2">
        <RotateCw className="h-4 w-4" />
        Reopen Queue
      </Button>
    </div>
  );
};
