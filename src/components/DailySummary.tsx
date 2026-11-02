import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { DailySummary as DailySummaryType } from "@/types/queue";
import { useI18n } from "@/hooks/useI18n";

interface DailySummaryProps {
  summary: DailySummaryType;
}

export const DailySummary = ({ summary }: DailySummaryProps) => {
  const { t } = useI18n();

  const stats = [
    { title: t("totalQueueToday"), value: summary.liveQueue, icon: Users, color: "text-primary" },
    { title: t("arrived"), value: summary.arrived, icon: CheckCircle, color: "text-status-arrived" },
    { title: t("cancelled"), value: summary.cancelled, icon: XCircle, color: "text-status-cancelled" },
    { title: t("noShows"), value: summary.noShows, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-3 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
