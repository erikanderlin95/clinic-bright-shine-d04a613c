import { Button } from "@/components/ui/button";
import { XCircle, RotateCw } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface QueueControlsProps {
  isClosed: boolean;
  onToggleClose: () => void;
}

export const QueueControls = ({ isClosed, onToggleClose }: QueueControlsProps) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <Button
        variant={isClosed ? "default" : "destructive"}
        onClick={onToggleClose}
        className={`min-h-11 gap-2 px-3 sm:px-5 py-2.5 font-semibold text-sm shadow-sm ${
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
