import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Download, ShieldCheck, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

const invoices: Invoice[] = [
  { id: "INV-2026-006", date: "1 Jun 2026", amount: "SGD 89.00", status: "Paid" },
  { id: "INV-2026-005", date: "1 May 2026", amount: "SGD 89.00", status: "Paid" },
  { id: "INV-2026-004", date: "1 Apr 2026", amount: "SGD 89.00", status: "Paid" },
];

export const BillingSubscriptionPanel = () => {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const requireConfirm = (action: string) => {
    setPendingAction(action);
    setPassword("");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!password.trim()) {
      toast({ title: "Password required", description: "Please enter your password to continue.", variant: "destructive" });
      return;
    }
    toast({
      title: "Identity confirmed",
      description: `Proceeding with: ${pendingAction}`,
    });
    setConfirmOpen(false);
    setPassword("");
    setPendingAction(null);
  };

  const handleDownload = (inv: Invoice) => {
    toast({ title: "Downloading invoice", description: `${inv.id} — ${inv.amount}` });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your ClynicQ plan, payment method, and billing history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Active
                  </Badge>
                </div>
                <div className="text-xl font-semibold text-foreground">Professional Plan</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pt-1">
                  <div>
                    <div className="text-muted-foreground">Next billing date</div>
                    <div className="font-medium text-foreground">1 July 2026</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monthly fee</div>
                    <div className="font-medium text-foreground">SGD 89 / month</div>
                  </div>
                </div>
              </div>
              <Button onClick={() => requireConfirm("Manage Subscription")}>
                Manage Subscription
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-muted">
                  <CreditCard className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Visa ending in •••• 1234</div>
                  <div className="text-xs text-muted-foreground">Expires 08 / 2028</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => requireConfirm("Update Payment Method")}>
                  Update Payment Method
                </Button>
                <Button variant="ghost" size="sm" onClick={() => requireConfirm("Remove Card")}>
                  Remove Card
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>Payments are securely processed by Stripe. ClynicQ does not store your card information.</span>
            </div>
          </div>

          {/* Billing History */}
          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="text-sm font-medium text-foreground">Billing History</div>
              <Button variant="link" size="sm" className="h-auto p-0">
                View All Invoices
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.id}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(inv)} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Subscription Actions */}
          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium text-foreground mb-3">Subscription Actions</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => requireConfirm("Upgrade Plan")}>
                <ArrowUpCircle className="h-4 w-4" />
                Upgrade Plan
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => requireConfirm("Downgrade Plan")}>
                <ArrowDownCircle className="h-4 w-4" />
                Downgrade Plan
              </Button>
              <Button variant="destructive" size="sm" onClick={() => requireConfirm("Cancel Subscription")}>
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your identity</DialogTitle>
            <DialogDescription>
              For your security, please re-enter your password to continue with:{" "}
              <span className="font-medium text-foreground">{pendingAction}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-password">Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
