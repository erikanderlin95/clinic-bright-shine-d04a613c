import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, AlertCircle, CalendarCheck } from "lucide-react";
import type { DailySummary as DailySummaryType } from "@/types/queue";
import { useI18n } from "@/hooks/useI18n";

interface DailySummaryProps {
  summary: DailySummaryType;
}

export const DailySummary = ({ summary }: DailySummaryProps) => {
  const { t } = useI18n();

  const stats = [
    { title: t("totalQueueToday"), value: summary.liveQueue, icon: Users, color: "text-primary" },
    { title: t("bookingsToday"), value: summary.bookingsToday, icon: CalendarCheck, color: "text-blue-600" },
    { title: t("arrived"), value: summary.arrived, icon: CheckCircle, color: "text-status-arrived" },
    { title: t("cancelled"), value: summary.cancelled, icon: XCircle, color: "text-status-cancelled" },
    { title: t("noShows"), value: summary.noShows, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
