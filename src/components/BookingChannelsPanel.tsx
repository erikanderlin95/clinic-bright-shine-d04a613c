import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Globe, CalendarDays, Link2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  description: string;
  icon: typeof MessageCircle;
  connected: boolean;
  accent: string;
}

const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Accept bookings via WhatsApp chat link",
    icon: MessageCircle,
    connected: true,
    accent: "text-green-600 bg-green-500/10 border-green-500/20",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Sync bookings from your Calendly event types",
    icon: CalendarDays,
    connected: true,
    accent: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "google",
    name: "Google Calendar",
    description: "Two-way sync with clinic Google Calendar",
    icon: Calendar,
    connected: false,
    accent: "text-orange-600 bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "website",
    name: "Website Widget",
    description: "Embedded booking widget on your clinic website",
    icon: Globe,
    connected: true,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
];

interface RedirectActivity {
  id: string;
  patient: string;
  channel: string;
  time: string;
  status: "redirected" | "completed" | "pending";
}

const redirectActivity: RedirectActivity[] = [
  { id: "1", patient: "Sarah Chen", channel: "WhatsApp", time: "Today 10:32", status: "redirected" },
  { id: "2", patient: "Michael Tan", channel: "Calendly", time: "Today 09:48", status: "redirected" },
  { id: "3", patient: "Priya Kumar", channel: "Website Widget", time: "Today 09:15", status: "redirected" },
  { id: "4", patient: "John Lim", channel: "WhatsApp", time: "Yesterday 16:20", status: "redirected" },
  { id: "5", patient: "Alice Wong", channel: "Google Calendar", time: "Yesterday 14:05", status: "redirected" },
];

export const BookingChannelsPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Link2 className="h-5 w-5" />
            Connected Booking Methods
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the channels patients use to book appointments with your clinic.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg border", c.accent)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {c.connected ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not connected
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{c.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  </div>
                  <Button
                    variant={c.connected ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {c.connected ? "Manage" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CalendarDays className="h-5 w-5" />
            Booking Redirect Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Patients redirected to external booking channels.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2 border-primary/20">
                  <TableHead>Patient</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirectActivity.map((r, i) => (
                  <TableRow key={r.id} className={cn("hover:bg-muted/30", i % 2 === 0 ? "bg-accent/5" : "")}>
                    <TableCell className="font-medium text-foreground">{r.patient}</TableCell>
                    <TableCell className="text-foreground">{r.channel}</TableCell>
                    <TableCell className="text-muted-foreground">{r.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Redirected
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
