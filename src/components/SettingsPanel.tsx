import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye, Gauge, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StaffManagementPanel } from "./StaffManagementPanel";
import { BillingSubscriptionPanel } from "./BillingSubscriptionPanel";
import { useAuth } from "@/hooks/useAuth";

export type QueueVisibilityMode = "live" | "smart";

const STORAGE_KEY = "clynicq_queue_visibility_mode";

export const getQueueVisibilityMode = (): QueueVisibilityMode => {
  if (typeof window === "undefined") return "live";
  return (localStorage.getItem(STORAGE_KEY) as QueueVisibilityMode) || "live";
};

export const SettingsPanel = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState<QueueVisibilityMode>("live");

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

  const options: {
    value: QueueVisibilityMode;
    title: string;
    description: string;
    icon: typeof Eye;
    preview: string;
  }[] = [
    {
      value: "live",
      title: "Live Queue View",
      description: "Patients can see exact queue position before joining.",
      icon: Eye,
      preview: "7 people ahead",
    },
    {
      value: "smart",
      title: "Smart Wait Indicator",
      description: "Patients see simplified wait status instead of exact queue numbers.",
      icon: Gauge,
      preview: "Moderate Wait",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Clinic Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure how queue information is shown to patients.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Queue Visibility</CardTitle>
          <CardDescription>
            Choose how queue information is displayed to patients inside ClynicQ. This only affects
            the patient-facing display — clinic queue logic stays the same.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={handleChange} className="gap-3">
            {options.map((opt) => {
              const Icon = opt.icon;
              const selected = mode === opt.value;
              return (
                <Label
                  key={opt.value}
                  htmlFor={`qv-${opt.value}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`qv-${opt.value}`} className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{opt.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                    <div className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Patient sees: <span className="ml-1 font-medium text-foreground">{opt.preview}</span>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Smart Wait Indicator — Default Queue Grouping
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-background/80 px-2 py-2">
                <div className="text-xs font-semibold text-foreground">Low Wait</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">0–3 active</div>
              </div>
              <div className="rounded-md bg-background/80 px-2 py-2">
                <div className="text-xs font-semibold text-foreground">Moderate Wait</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">4–9 active</div>
              </div>
              <div className="rounded-md bg-background/80 px-2 py-2">
                <div className="text-xs font-semibold text-foreground">Busy Now</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">10+ active</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              These are default operational ranges used by ClynicQ to simplify patient-facing wait visibility.
            </p>
          </div>

        </CardContent>
      </Card>

      <StaffManagementPanel />

      {isAdmin && <BillingSubscriptionPanel />}
    </div>
  );
};
