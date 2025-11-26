import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface AutomationLog {
  id: string;
  time: string;
  action: string;
}

export const AutomationPanel = () => {
  const [autoArrivalCheck, setAutoArrivalCheck] = useState(false);
  const [yourTurnSoon, setYourTurnSoon] = useState(false);
  const [delayAlerts, setDelayAlerts] = useState(false);
  const [visitCompletion, setVisitCompletion] = useState(false);

  // Sample automation log entries (UI-only)
  const [automationLog] = useState<AutomationLog[]>([
    { id: "1", time: "10:32", action: 'Sent "Your turn soon"' },
    { id: "2", time: "10:40", action: "Patient marked Arrived" },
    { id: "3", time: "11:10", action: "Delay alert sent" },
  ]);

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
              checked={autoArrivalCheck}
              onCheckedChange={setAutoArrivalCheck}
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
              checked={yourTurnSoon}
              onCheckedChange={setYourTurnSoon}
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
              checked={delayAlerts}
              onCheckedChange={setDelayAlerts}
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
              checked={visitCompletion}
              onCheckedChange={setVisitCompletion}
            />
          </div>
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
    </div>
  );
};
