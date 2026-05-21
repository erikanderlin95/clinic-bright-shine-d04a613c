import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type QueueVisibilityMode = "live" | "smart";

const STORAGE_KEY = "clynicq_queue_visibility_mode";

export const getQueueVisibilityMode = (): QueueVisibilityMode => {
  if (typeof window === "undefined") return "live";
  return (localStorage.getItem(STORAGE_KEY) as QueueVisibilityMode) || "live";
};

export const SettingsPanel = () => {
  const { toast } = useToast();
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
        </CardContent>
      </Card>
    </div>
  );
};
