import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Gauge,
  Info,
  Settings as SettingsIcon,
  CreditCard,
  CheckCircle2,
  Building2,
  Activity,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StaffManagementPanel } from "./StaffManagementPanel";
import { BillingSubscriptionPanel } from "./BillingSubscriptionPanel";
import { PaymentSubscriptionPanel } from "./PaymentSubscriptionPanel";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import { getQueueVisibilityMode, setQueueVisibilityModeValue, type QueueVisibilityMode } from "@/lib/queue-visibility";
export { getQueueVisibilityMode, setQueueVisibilityModeValue, QUEUE_MODE_EVENT, type QueueVisibilityMode } from "@/lib/queue-visibility";

type SettingsSection = "general" | "billing" | "payment" | "security";

const sections: { id: SettingsSection; label: string; icon: typeof SettingsIcon }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "payment", label: "Payment & Subscription", icon: CreditCard },
  { id: "security", label: "Activity Log", icon: Activity },
];

export const SettingsPanel = () => {
  const { isAdmin } = useAuth();
  const [active, setActive] = useState<SettingsSection>("general");

  const visibleSections = sections.filter((s) => (s.id === "billing" ? isAdmin : true));

  return (
    <div className="min-w-0 space-y-6 lg:space-y-8 lg:px-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your clinic, billing, payment, and activity log preferences.
        </p>
      </div>

      {/* Horizontal nav */}
      <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto pb-2">
        {visibleSections.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <Button
              key={s.id}
              variant={isActive ? "default" : "ghost"}
              aria-pressed={isActive}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 sm:px-5 min-h-11 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </Button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="space-y-6">
        {active === "general" && <GeneralSection />}
        {active === "security" && <StaffManagementPanel view="security" activityLimit={5} />}
        {active === "billing" && isAdmin && <BillingSubscriptionPanel />}
        {active === "payment" && <PaymentSubscriptionPanel />}
      </div>
    </div>
  );
};

const GeneralSection = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<QueueVisibilityMode>(getQueueVisibilityMode());

  const visibilityMode = mode;

  const handleVisibilityChange = (value: string) => {
    const next = value as QueueVisibilityMode;
    setMode(next);
    setQueueVisibilityModeValue(next);
    toast({
      title: "Queue visibility updated",
      description:
        next === "live"
          ? "Patients will see exact queue position."
          : "Patients will see simplified wait status.",
    });
  };

  const summaryItems = [
    { label: "Clinic Name", value: "ClynicQ Demo Clinic", icon: Building2 },
    { label: "Current Plan", value: "Basic" },
    { label: "Stripe Status", value: "Active", tone: "ok" as const },
    { label: "Last Sync", value: "2 min ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {summaryItems.map((it) => (
              <div key={it.label} className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {it.label}
                </div>
                <div className="mt-1 flex items-start gap-1.5 break-words text-sm font-semibold text-foreground">
                  {it.tone === "ok" && (
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                  )}
                  {it.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Visibility */}
      <>
        <Separator className="bg-border/60" />
        <section className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Queue Visibility</h3>
              <p className="text-xs text-muted-foreground mt-1">
                What patients see when Live Queue is active.
              </p>
            </div>

            <RadioGroup
              value={visibilityMode}
              onValueChange={handleVisibilityChange}
              className="grid gap-3 sm:grid-cols-2"
            >
              <VisibilityCard
                value="live"
                selected={visibilityMode === "live"}
                icon={Eye}
                title="Live Queue View"
                description="Patients see exact queue position."
                preview="7 people ahead"
                recommended
              />
              <VisibilityCard
                value="smart"
                selected={visibilityMode === "smart"}
                icon={Gauge}
                title="Smart Wait Indicator"
                description="Simplified wait status without queue numbers."
                preview="Moderate Wait"
              />
            </RadioGroup>

            {/* Smart Wait info card */}
            {visibilityMode === "smart" && (
              <div className="rounded-xl bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Smart Wait Groups
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Low", range: "0–3", dot: "bg-emerald-500" },
                    { label: "Moderate", range: "4–9", dot: "bg-amber-500" },
                    { label: "Busy", range: "10+", dot: "bg-rose-500" },
                  ].map((g) => (
                    <div key={g.label} className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", g.dot)} />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{g.label}</span>
                        <span className="text-[11px] text-muted-foreground">{g.range}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
      </>

    </div>
  );
};

const VisibilityCard = ({
  value,
  selected,
  icon: Icon,
  title,
  description,
  preview,
  recommended,
}: {
  value: QueueVisibilityMode;
  selected: boolean;
  icon: typeof Eye;
  title: string;
  description: string;
  preview: string;
  recommended?: boolean;
}) => {
  return (
    <Label
      htmlFor={`qv-${value}`}
      className={cn(
        "relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-5 transition-all",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border/60 hover:border-border hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          {recommended && (
            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">
              Recommended
            </Badge>
          )}
          <RadioGroupItem value={value} id={`qv-${value}`} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="inline-flex w-fit flex-wrap items-center rounded-md bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
        Patient sees:&nbsp;<span className="font-medium text-foreground">{preview}</span>
      </div>
    </Label>
  );
};
