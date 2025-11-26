import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone } from "lucide-react";
import { OperationalBroadcastDialog } from "@/components/OperationalBroadcastDialog";
import { useState } from "react";

interface AutomationLog {
  id: string;
  time: string;
  action: string;
}

interface AutomationPanelProps {
  autoArrivalCheckEnabled: boolean;
  yourTurnSoonEnabled: boolean;
  delayAlertsEnabled: boolean;
  visitCompletionEnabled: boolean;
  automationLog: AutomationLog[];
  onToggleAutoArrivalCheck: (checked: boolean) => void;
  onToggleYourTurnSoon: (checked: boolean) => void;
  onToggleDelayAlerts: (checked: boolean) => void;
  onToggleVisitCompletion: (checked: boolean) => void;
  onSendBroadcast: (message: string) => void;
}

export const AutomationPanel = ({
  autoArrivalCheckEnabled,
  yourTurnSoonEnabled,
  delayAlertsEnabled,
  visitCompletionEnabled,
  automationLog,
  onToggleAutoArrivalCheck,
  onToggleYourTurnSoon,
  onToggleDelayAlerts,
  onToggleVisitCompletion,
  onSendBroadcast,
}: AutomationPanelProps) => {
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
          <CardDescription>Configure automated queue notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-arrival">Auto Arrival Check</Label>
              <p className="text-sm text-muted-foreground">
                Automatically check if patients have arrived
              </p>
            </div>
            <Switch
              id="auto-arrival"
              checked={autoArrivalCheckEnabled}
              onCheckedChange={onToggleAutoArrivalCheck}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="turn-soon">"Your Turn Soon" Message</Label>
              <p className="text-sm text-muted-foreground">
                Send notification when patient is next in queue
              </p>
            </div>
            <Switch
              id="turn-soon"
              checked={yourTurnSoonEnabled}
              onCheckedChange={onToggleYourTurnSoon}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="delay-alerts">Delay Alerts Broadcast</Label>
              <p className="text-sm text-muted-foreground">
                Notify patients when queue is running behind schedule
              </p>
            </div>
            <Switch
              id="delay-alerts"
              checked={delayAlertsEnabled}
              onCheckedChange={onToggleDelayAlerts}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="visit-completion">Visit Completion Message</Label>
              <p className="text-sm text-muted-foreground">
                Send notification when visit is completed
              </p>
            </div>
            <Switch
              id="visit-completion"
              checked={visitCompletionEnabled}
              onCheckedChange={onToggleVisitCompletion}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Broadcast</CardTitle>
          <CardDescription>Send generic announcements to active queue patients</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setBroadcastDialogOpen(true)}
            className="w-full gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Send Operational Announcement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automation Log</CardTitle>
          <CardDescription>Recent automated actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Time</TableHead>
                <TableHead>Bot Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automationLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OperationalBroadcastDialog
        open={broadcastDialogOpen}
        onOpenChange={setBroadcastDialogOpen}
        onSendBroadcast={onSendBroadcast}
      />
    </div>
  );
};
