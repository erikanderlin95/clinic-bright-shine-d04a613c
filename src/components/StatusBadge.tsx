import { Badge } from "@/components/ui/badge";
import type { QueueStatus } from "@/types/queue";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: QueueStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: QueueStatus) => {
    switch (status) {
      case "arrived":
        return {
          label: "Arrived",
          className: "bg-status-arrived/10 text-status-arrived border-status-arrived/20",
        };
      case "waiting":
        return {
          label: "Waiting",
          className: "bg-status-waiting/10 text-status-waiting border-status-waiting/20",
        };
      case "late":
        return {
          label: "Late",
          className: "bg-status-late/10 text-status-late border-status-late/20",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20",
        };
      case "no-show":
        return {
          label: "No Show",
          className: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-primary/10 text-primary border-primary/20",
        };
      case "booked":
        return {
          label: "Booked",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};
