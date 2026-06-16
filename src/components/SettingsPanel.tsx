import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Gauge,
  Info,
  Settings as SettingsIcon,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StaffManagementPanel } from "./StaffManagementPanel";
import { BillingSubscriptionPanel } from "./BillingSubscriptionPanel";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export type QueueVisibilityMode = "live" | "smart";

const STORAGE_KEY = "clynicq_queue_visibility_mode";

export const getQueueVisibilityMode = (): QueueVisibilityMode => {
  if (typeof window === "undefined") return "live";
  return (localStorage.getItem(STORAGE_KEY) as QueueVisibilityMode) || "live";
};

type SettingsSection = "general" | "team" | "billing" | "security";

const sections: { id: SettingsSection; label: string; icon: typeof SettingsIcon }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export const SettingsPanel = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState<QueueVisibilityMode>("live");
  const [active, setActive] = useState<SettingsSection>("general");

  useEffect(() => {
    setMode(getQueueVisibilityMode());
  }, []);

  const handleChange = (value: string) => {
    const next = value as QueueVisibilityMode;
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

  const visibleSections = sections.filter((s) => (s.id === "billing" ? isAdmin : true));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your clinic, team, billing, and security preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Secondary nav */}
        <nav className="md:sticky md:top-4 md:self-start">
          <div className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
            {visibleSections.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-6">
          {active === "general" && (
            <GeneralSection mode={mode} onChange={handleChange} />
          )}
          {active === "team" && <StaffManagementPanel view="team" />}
          {active === "security" && <StaffManagementPanel view="security" activityLimit={5} />}
          {active === "billing" && isAdmin && <BillingSubscriptionPanel />}
        </div>
      </div>
    </div>
  );
};

const GeneralSection = ({
  mode,
  onChange,
}: {
  mode: QueueVisibilityMode;
  onChange: (v: string) => void;
}) => {
  const summaryItems = [
    { label: "Clinic Name", value: "ClynicQ Demo Clinic", icon: Building2 },
    { label: "Current Plan", value: "Professional" },
    { label: "CMS Status", value: "Connected", tone: "ok" as const },
    { label: "Stripe Status", value: "Active", tone: "ok" as const },
    { label: "Last Sync", value: "2 min ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {summaryItems.map((it) => (
              <div key={it.label} className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {it.label}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
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

      {/* Queue Visibility */}
      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Queue Visibility</h3>
          <p className="text-sm text-muted-foreground">
            Choose how queue information is shown to patients. Clinic queue logic stays the same.
          </p>
        </div>

        <RadioGroup
          value={mode}
          onValueChange={onChange}
          className="grid gap-3 sm:grid-cols-2"
        >
          <VisibilityCard
            value="live"
            selected={mode === "live"}
            icon={Eye}
            title="Live Queue View"
            description="Patients can see their exact queue position."
            preview="7 people ahead"
          />
          <VisibilityCard
            value="smart"
            selected={mode === "smart"}
            icon={Gauge}
            title="Smart Wait Indicator"
            description="Patients see simplified wait status instead of queue numbers."
            preview="Moderate Wait"
            recommended
          />
        </RadioGroup>

        {/* Smart Wait info card */}
        <div className="rounded-xl bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Smart Wait Groups
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Low Wait", range: "0–3 active", dot: "bg-emerald-500" },
              { label: "Moderate Wait", range: "4–9 active", dot: "bg-amber-500" },
              { label: "Busy Now", range: "10+ active", dot: "bg-rose-500" },
            ].map((g) => (
              <div key={g.label} className="flex items-start gap-2">
                <span className={cn("mt-1.5 h-2 w-2 rounded-full flex-shrink-0", g.dot)} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{g.label}</div>
                  <div className="text-xs text-muted-foreground">{g.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
          "flex h-10 w-10 items-center justify-center rounded-lg",
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
      <div className="space-y-1">
        <div className="text-base font-semibold text-foreground">{title}</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="inline-flex w-fit items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
        Patient sees:&nbsp;<span className="font-medium text-foreground">{preview}</span>
      </div>
    </Label>
  );
};
