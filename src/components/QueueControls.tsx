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
    <div className="flex gap-3">
      <Button
        variant={isPaused ? "default" : "secondary"}
        onClick={onTogglePause}
        className={`gap-2 px-5 py-2.5 font-semibold text-sm shadow-sm ${
          isPaused
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900/50"
        }`}
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
        variant={isClosed ? "default" : "destructive"}
        onClick={onToggleClose}
        className={`gap-2 px-5 py-2.5 font-semibold text-sm shadow-sm ${
          isClosed
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        }`}
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
