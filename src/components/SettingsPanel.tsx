import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon,
  CreditCard,
  CheckCircle2,
  Building2,
  Activity,
} from "lucide-react";
import { StaffManagementPanel } from "./StaffManagementPanel";
import { BillingSubscriptionPanel } from "./BillingSubscriptionPanel";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export { getQueueVisibilityMode, setQueueVisibilityModeValue, QUEUE_MODE_EVENT, type QueueVisibilityMode } from "@/lib/queue-visibility";

type SettingsSection = "general" | "billing" | "security";

const sections: { id: SettingsSection; label: string; icon: typeof SettingsIcon }[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "security", label: "Activity Log", icon: Activity },
];

export const SettingsPanel = () => {
  const { isAdmin } = useAuth();
  const [active, setActive] = useState<SettingsSection>("general");

  const visibleSections = sections.filter((s) => (s.id === "billing" ? isAdmin : true));

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6 lg:space-y-8 lg:px-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-2">
          Manage your clinic, billing and subscription, and activity log preferences.
        </p>
      </div>

      {/* Horizontal nav */}
      <nav aria-label="Settings sections" className="flex flex-wrap gap-1 sm:gap-2">
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
                "flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-5 min-h-10 sm:min-h-11 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors",
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
      <div className="space-y-4 sm:space-y-6">
        {active === "general" && <GeneralSection />}
        {active === "security" && <StaffManagementPanel view="security" activityLimit={5} />}
        {active === "billing" && isAdmin && <BillingSubscriptionPanel />}
      </div>
    </div>
  );
};

const GeneralSection = () => {
  const summaryItems = [
    { label: "Clinic Name", value: "ClynicQ Demo Clinic", icon: Building2 },
    { label: "Current Plan", value: "Basic" },
    { label: "Stripe Status", value: "Active", tone: "ok" as const },
    { label: "Last Sync", value: "2 min ago" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="px-3 py-3 sm:px-6 sm:py-5">
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

    </div>
  );
};
