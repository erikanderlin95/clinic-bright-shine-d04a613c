import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Gauge,
  Info,
  Settings as SettingsIcon,
  Users,
  CreditCard,
  CheckCircle2,
  Building2,
  Activity,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StaffManagementPanel } from "./StaffManagementPanel";
import { BillingSubscriptionPanel } from "./BillingSubscriptionPanel";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type QueueVisibilityMode = "live" | "smart" | "notification";

const STORAGE_KEY = "clynicq_queue_visibility_mode";

export const getQueueVisibilityMode = (): QueueVisibilityMode => {
  if (typeof window === "undefined") return "notification";
  return (localStorage.getItem(STORAGE_KEY) as QueueVisibilityMode) || "notification";
};

type SettingsSection = "general" | "team" | "billing" | "security";

const sections: { id: SettingsSection; label: string; icon: typeof SettingsIcon }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Activity Log", icon: Activity },
];

export const SettingsPanel = () => {
  const { isAdmin } = useAuth();
  const [active, setActive] = useState<SettingsSection>("general");

  const visibleSections = sections.filter((s) => (s.id === "billing" ? isAdmin : true));

  return (
    <div className="space-y-8 px-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your clinic, team, billing, and activity log preferences.
        </p>
      </div>

      {/* Horizontal nav */}
      <nav className="flex gap-2 overflow-x-auto">
        {visibleSections.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-5 h-10 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="space-y-6">
        {active === "general" && <GeneralSection />}
        {active === "team" && <StaffManagementPanel view="team" />}
        {active === "security" && <StaffManagementPanel view="security" activityLimit={5} />}
        {active === "billing" && isAdmin && <BillingSubscriptionPanel />}
      </div>
    </div>
  );
};

const GeneralSection = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<QueueVisibilityMode>(getQueueVisibilityMode());

  const isNotificationMode = mode === "notification";
  const visibilityMode = isNotificationMode ? "live" : mode;

  const handleModeSwitch = (checked: boolean) => {
    const next = checked ? "notification" : "live";
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    toast({
      title: checked ? "Notification Mode enabled" : "Live Queue Mode enabled",
      description: checked
        ? "Staff will notify patients via WhatsApp. Clinic manages queue in existing CMS."
        : "Patients will track their queue position in real time.",
    });
  };

  const handleVisibilityChange = (value: string) => {
    const next = value as "live" | "smart";
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
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
    { label: "Current Plan", value: "Professional" },
    { label: "Stripe Status", value: "Active", tone: "ok" as const },
    { label: "Last Sync", value: "2 min ago" },
  ];

  return (
    <div className="space-y-10">
      {/* Summary */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="px-8 py-7">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {summaryItems.map((it) => (
              <div key={it.label} className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {it.label}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                  {it.tone === "ok" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  )}
                  {it.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Mode */}
      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Queue Mode</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Choose how patients are called from the queue. This controls the staff workflow on the dashboard.
          </p>
        </div>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="px-8 py-7">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg flex-shrink-0",
                  isNotificationMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    {isNotificationMode ? "Notification Mode" : "Live Queue Mode"}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {isNotificationMode
                      ? "Staff send a WhatsApp message when it is the patient's turn. The clinic continues managing the queue in their existing CMS."
                      : "Patients follow their queue position and status in real time on their own device."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={cn("text-sm font-medium", !isNotificationMode && "text-foreground")}>
                  Live Queue
                </span>
                <Switch checked={isNotificationMode} onCheckedChange={handleModeSwitch} />
                <span className={cn("text-sm font-medium", isNotificationMode && "text-foreground")}>
                  Notification
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Queue Visibility — only when Live Queue */}
      {!isNotificationMode && (
        <>
          <Separator className="bg-border/60" />
          <section className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Queue Visibility</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Choose how queue information is shown to patients when Live Queue Mode is active.
              </p>
            </div>

            <RadioGroup
              value={visibilityMode}
              onValueChange={handleVisibilityChange}
              className="grid gap-4 sm:grid-cols-2"
            >
              <VisibilityCard
                value="live"
                selected={visibilityMode === "live"}
                icon={Eye}
                title="Live Queue View"
                description="Patients can see their exact queue position."
                preview="7 people ahead"
              />
              <VisibilityCard
                value="smart"
                selected={visibilityMode === "smart"}
                icon={Gauge}
                title="Smart Wait Indicator"
                description="Patients see simplified wait status instead of queue numbers."
                preview="Moderate Wait"
                recommended
              />
            </RadioGroup>

            {/* Smart Wait info card */}
            {visibilityMode === "smart" && (
              <div className="rounded-xl bg-muted/40 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Smart Wait Groups
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Low Wait", range: "0–3 active", dot: "bg-emerald-500" },
                    { label: "Moderate Wait", range: "4–9 active", dot: "bg-amber-500" },
                    { label: "Busy Now", range: "10+ active", dot: "bg-rose-500" },
                  ].map((g) => (
                    <div key={g.label} className="flex items-start gap-3">
                      <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0", g.dot)} />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{g.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{g.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
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
        "relative flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-8 transition-all",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border/60 hover:border-border hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          {recommended && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Recommended
            </Badge>
          )}
          <RadioGroupItem value={value} id={`qv-${value}`} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-base font-semibold text-foreground">{title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="inline-flex w-fit items-center rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
        Patient sees:&nbsp;<span className="font-medium text-foreground">{preview}</span>
      </div>
    </Label>
  );
};
