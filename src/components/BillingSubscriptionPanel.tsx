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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Download, ShieldCheck, ArrowUpCircle, ArrowDownCircle, Check, AlertTriangle, Mail, CalendarX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CANCEL_REASONS = [
  "Too expensive",
  "Missing features I need",
  "Switching to another product",
  "Not using it enough",
  "Temporary pause / clinic closing",
  "Other",
];

const formatEndOfMonth = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

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

interface Plan {
  id: "starter" | "professional" | "enterprise";
  name: string;
  price: string;
  description: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "SGD 39 / month",
    description: "For small clinics getting started.",
    features: ["Up to 2 staff", "Basic queue management", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    price: "SGD 89 / month",
    description: "For growing clinics with daily walk-ins.",
    features: ["Up to 10 staff", "Smart Wait & broadcast", "Doctor scheduling", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For multi-location clinics & groups.",
    features: ["Unlimited staff", "Multi-location", "API access", "Dedicated success manager"],
  },
];

const currentPlanId: Plan["id"] = "professional";

export const BillingSubscriptionPanel = () => {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [manageOpen, setManageOpen] = useState(false);

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
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg">Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your ClynicQ plan, payment method, and billing history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          {/* Current Plan */}
          <div className="rounded-lg border border-border p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Active
                  </Badge>
                </div>
                <div className="text-xl font-semibold text-foreground">Professional Plan</div>
                <div className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm pt-2">
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
              <Button onClick={() => setManageOpen(true)}>
                Manage Subscription
              </Button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border border-border p-6 space-y-4">
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
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-muted/60 p-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>Payments are securely processed by Stripe. ClynicQ does not store your card information.</span>
            </div>
          </div>

          {/* Billing History */}
          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between p-6 pb-3">
              <div className="text-sm font-medium text-foreground">Billing History</div>
              <Button variant="link" size="sm" className="h-auto p-0">
                View All Invoices
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-5 py-4">Invoice</TableHead>
                  <TableHead className="px-5 py-4">Date</TableHead>
                  <TableHead className="px-5 py-4">Amount</TableHead>
                  <TableHead className="px-5 py-4">Status</TableHead>
                  <TableHead className="text-right px-5 py-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium px-5 py-4">{inv.id}</TableCell>
                    <TableCell className="px-5 py-4">{inv.date}</TableCell>
                    <TableCell className="px-5 py-4">{inv.amount}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-5 py-4">
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
        </CardContent>
      </Card>

      {/* Manage Subscription Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Review your current plan, compare options, or cancel your subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Current plan summary */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Current Plan</div>
                  <div className="text-base font-semibold text-foreground">Professional Plan · SGD 89 / month</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Next billing date: 1 July 2026 · Visa •••• 1234
                  </div>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Active
                </Badge>
              </div>
            </div>

            {/* Plan comparison */}
            <div>
              <div className="text-sm font-medium text-foreground mb-3">Compare Plans</div>
              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrent = plan.id === currentPlanId;
                  const currentIndex = plans.findIndex((p) => p.id === currentPlanId);
                  const planIndex = plans.findIndex((p) => p.id === plan.id);
                  const isUpgrade = planIndex > currentIndex;
                  const isDowngrade = planIndex < currentIndex;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-lg border p-5 flex flex-col ${
                        isCurrent ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-base font-semibold text-foreground">{plan.name}</div>
                        {isCurrent && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium text-foreground">{plan.price}</div>
                      <div className="text-xs text-muted-foreground mt-1 mb-4">{plan.description}</div>
                      <ul className="space-y-2 text-sm text-foreground flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5">
                        {isCurrent ? (
                          <Button variant="outline" size="sm" className="w-full" disabled>
                            Current Plan
                          </Button>
                        ) : isUpgrade ? (
                          <Button
                            size="sm"
                            className="w-full gap-1.5"
                            onClick={() => requireConfirm(`Upgrade to ${plan.name}`)}
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                            Upgrade
                          </Button>
                        ) : isDowngrade ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5"
                            onClick={() => requireConfirm(`Downgrade to ${plan.name}`)}
                          >
                            <ArrowDownCircle className="h-4 w-4" />
                            Downgrade
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing details */}
            <div className="rounded-lg border border-border p-4 text-sm">
              <div className="text-sm font-medium text-foreground mb-2">Billing Details</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="text-muted-foreground">Billing cycle</div>
                <div className="text-foreground">Monthly</div>
                <div className="text-muted-foreground">Next charge</div>
                <div className="text-foreground">SGD 89.00 on 1 July 2026</div>
                <div className="text-muted-foreground">Payment method</div>
                <div className="text-foreground">Visa •••• 1234</div>
              </div>
            </div>

            {/* Cancel subscription */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-medium text-foreground">Cancel Subscription</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-md">
                    Your plan will remain active until the end of the current billing period. You can resubscribe at any time.
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => requireConfirm("Cancel Subscription")}
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
