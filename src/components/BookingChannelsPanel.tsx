import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MessageCircle, Calendar, Globe, CalendarDays, Link2, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ChannelId = "whatsapp" | "calendly" | "external" | "website";

interface ChannelConfig {
  enabled: boolean;
  // WhatsApp
  whatsappNumber?: string;
  prefillMessage?: string;
  // URL-based
  url?: string;
  // Website
  openInNewTab?: boolean;
}

interface Channel {
  id: ChannelId;
  name: string;
  description: string;
  icon: typeof MessageCircle;
  accent: string;
}

const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Route patients to your clinic's WhatsApp for booking",
    icon: MessageCircle,
    accent: "text-green-600 bg-green-500/10 border-green-500/20",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Send patients to your public Calendly booking link",
    icon: CalendarDays,
    accent: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "external",
    name: "External Booking Link",
    description: "Redirect patients to an external booking page",
    icon: Calendar,
    accent: "text-orange-600 bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "website",
    name: "Clinic Website",
    description: "Redirect patients to your clinic website booking page",
    icon: Globe,
    accent: "text-primary bg-primary/10 border-primary/20",
  },
];

interface RedirectActivity {
  id: string;
  patient: string;
  channel: string;
  time: string;
}

const redirectActivity: RedirectActivity[] = [
  { id: "1", patient: "Sarah Chen", channel: "WhatsApp", time: "Today 10:32" },
  { id: "2", patient: "Michael Tan", channel: "Calendly", time: "Today 09:48" },
  { id: "3", patient: "Priya Kumar", channel: "Clinic Website", time: "Today 09:15" },
  { id: "4", patient: "John Lim", channel: "WhatsApp", time: "Yesterday 16:20" },
  { id: "5", patient: "Alice Wong", channel: "External Booking Link", time: "Yesterday 14:05" },
];

const defaultConfigs: Record<ChannelId, ChannelConfig> = {
  whatsapp: {
    enabled: true,
    whatsappNumber: "+65 9123 4567",
    prefillMessage: "Hi, I'd like to book an appointment with your clinic.",
  },
  calendly: {
    enabled: true,
    url: "https://calendly.com/your-clinic",
  },
  external: {
    enabled: false,
    url: "",
  },
  website: {
    enabled: true,
    url: "https://yourclinic.com/book",
    openInNewTab: true,
  },
};

export const BookingChannelsPanel = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<Record<ChannelId, ChannelConfig>>(defaultConfigs);
  const [openChannel, setOpenChannel] = useState<ChannelId | null>(null);
  const [draft, setDraft] = useState<ChannelConfig | null>(null);

  const openManage = (id: ChannelId) => {
    setOpenChannel(id);
    setDraft({ ...configs[id] });
  };

  const closeManage = () => {
    setOpenChannel(null);
    setDraft(null);
  };

  const saveDraft = () => {
    if (!openChannel || !draft) return;
    setConfigs((prev) => ({ ...prev, [openChannel]: draft }));
    toast({ title: "Saved", description: "Booking channel settings updated." });
    closeManage();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Link2 className="h-5 w-5" />
            Connected Booking Methods
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Configure where patients are routed to book. ClynicQ does not manage appointments — your existing booking tools remain the source of truth.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c) => {
              const Icon = c.icon;
              const cfg = configs[c.id];
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg border", c.accent)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {cfg.enabled ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{c.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openManage(c.id)}>
                    Manage
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
            <ExternalLink className="h-5 w-5" />
            Booking Redirect Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Patients redirected to your booking channels. Tracks routing intent only — not appointment status.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2 border-primary/20">
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Booking Channel</TableHead>
                  <TableHead>Redirect Time</TableHead>
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

      <Dialog open={!!openChannel} onOpenChange={(o) => !o && closeManage()}>
        <DialogContent className="sm:max-w-md">
          {openChannel && draft && (
            <>
              <DialogHeader>
                <DialogTitle>Manage {channels.find((c) => c.id === openChannel)?.name}</DialogTitle>
                <DialogDescription>
                  Configure how patients are routed. ClynicQ does not sync or manage appointments.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {openChannel === "whatsapp" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="wa-number">Clinic WhatsApp Number</Label>
                      <Input
                        id="wa-number"
                        placeholder="+65 9123 4567"
                        value={draft.whatsappNumber ?? ""}
                        onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wa-msg">Prefilled Booking Message</Label>
                      <Textarea
                        id="wa-msg"
                        rows={3}
                        placeholder="Hi, I'd like to book an appointment..."
                        value={draft.prefillMessage ?? ""}
                        onChange={(e) => setDraft({ ...draft, prefillMessage: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {openChannel === "calendly" && (
                  <div className="space-y-2">
                    <Label htmlFor="cal-url">Calendly Booking URL</Label>
                    <Input
                      id="cal-url"
                      placeholder="https://calendly.com/your-clinic"
                      value={draft.url ?? ""}
                      onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                    />
                  </div>
                )}

                {openChannel === "external" && (
                  <div className="space-y-2">
                    <Label htmlFor="ext-url">External Booking URL</Label>
                    <Input
                      id="ext-url"
                      placeholder="https://booking.example.com/clinic"
                      value={draft.url ?? ""}
                      onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Redirect patients to an external booking page.
                    </p>
                  </div>
                )}

                {openChannel === "website" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="web-url">Website Booking URL</Label>
                      <Input
                        id="web-url"
                        placeholder="https://yourclinic.com/book"
                        value={draft.url ?? ""}
                        onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Open in new tab</p>
                        <p className="text-xs text-muted-foreground">Launch booking page in a separate browser tab.</p>
                      </div>
                      <Switch
                        checked={!!draft.openInNewTab}
                        onCheckedChange={(v) => setDraft({ ...draft, openInNewTab: v })}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable this channel</p>
                    <p className="text-xs text-muted-foreground">Show this booking option to patients.</p>
                  </div>
                  <Switch
                    checked={draft.enabled}
                    onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeManage}>Cancel</Button>
                <Button onClick={saveDraft}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
