import { Button } from "@/components/ui/button";
import { Pause, Play, XCircle, RotateCw } from "lucide-react";

interface QueueControlsProps {
  isPaused: boolean;
  isClosed: boolean;
  onTogglePause: () => void;
  onToggleClose: () => void;
}

export const QueueControls = ({ isPaused, isClosed, onTogglePause, onToggleClose }: QueueControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={isPaused ? "default" : "secondary"}
        size="sm"
        onClick={onTogglePause}
        className="gap-2"
        disabled={isClosed}
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
      <Button 
        variant={isClosed ? "default" : "outline"} 
        size="sm" 
        onClick={onToggleClose} 
        className="gap-2"
      >
        {isClosed ? (
          <>
            <RotateCw className="h-4 w-4" />
            Reopen Queue
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            Close Queue
          </>
        )}
      </Button>
    </div>
  );
};
