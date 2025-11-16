import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import type { DailySummary as DailySummaryType } from "@/types/queue";

interface DailySummaryProps {
  summary: DailySummaryType;
}

export const DailySummary = ({ summary }: DailySummaryProps) => {
  const stats = [
    {
      title: "Total Queue Today",
      value: summary.totalQueue,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Arrived",
      value: summary.arrived,
      icon: CheckCircle,
      color: "text-status-arrived",
    },
    {
      title: "Cancelled",
      value: summary.cancelled,
      icon: XCircle,
      color: "text-status-cancelled",
    },
    {
      title: "No Shows",
      value: summary.noShows,
      icon: AlertCircle,
      color: "text-destructive",
    },
    {
      title: "Avg Wait Time",
      value: summary.avgWaitTime,
      icon: Clock,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
