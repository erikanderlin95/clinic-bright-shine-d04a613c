import { Badge } from "@/components/ui/badge";
import type { QueueStatus } from "@/types/queue";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

interface StatusBadgeProps {
  status: QueueStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useI18n();

  const getStatusConfig = (status: QueueStatus) => {
    switch (status) {
      case "arrived":
        return { label: t("statusArrived"), className: "bg-status-arrived/10 text-status-arrived border-status-arrived/20" };
      case "waiting":
        return { label: t("statusWaiting"), className: "bg-status-waiting/10 text-status-waiting border-status-waiting/20" };
      case "late":
        return { label: t("statusLate"), className: "bg-status-late/10 text-status-late border-status-late/20" };
      case "cancelled":
        return { label: t("statusCancelled"), className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20" };
      case "no-show":
        return { label: t("statusNoShow"), className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20" };
      case "completed":
        return { label: t("statusCompleted"), className: "bg-primary/10 text-primary border-primary/20" };
      case "booked":
        return { label: t("statusBooked"), className: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "notified":
        return { label: "Notification Sent", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
    }
  };

  if (!config) return null;

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};
