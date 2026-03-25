import { Button } from "@/components/ui/button";
import { Pause, Play, XCircle, RotateCw } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface QueueControlsProps {
  isPaused: boolean;
  isClosed: boolean;
  onTogglePause: () => void;
  onToggleClose: () => void;
}

export const QueueControls = ({ isPaused, isClosed, onTogglePause, onToggleClose }: QueueControlsProps) => {
  const { t } = useI18n();

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
            {t("resumeQueue")}
          </>
        ) : (
          <>
            <Pause className="h-4 w-4" />
            {t("pauseQueue")}
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
            {t("reopenQueue")}
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4" />
            {t("closeQueue")}
          </>
        )}
      </Button>
    </div>
  );
};
