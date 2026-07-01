import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export type ClinicOpStatus = "low" | "moderate" | "busy";

const STORAGE_KEY = "clinicq-operation-status";

export const getClinicOperationStatus = (): ClinicOpStatus => {
  if (typeof window === "undefined") return "low";
  return (localStorage.getItem(STORAGE_KEY) as ClinicOpStatus) || "low";
};

const OPTIONS: { id: ClinicOpStatus; label: string; dot: string; ring: string; bg: string; text: string }[] = [
  { id: "low", label: "Low Wait", dot: "bg-emerald-500", ring: "ring-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700" },
  { id: "moderate", label: "Moderate Wait", dot: "bg-amber-500", ring: "ring-amber-500", bg: "bg-amber-500/10", text: "text-amber-700" },
  { id: "busy", label: "Busy", dot: "bg-red-500", ring: "ring-red-500", bg: "bg-red-500/10", text: "text-red-700" },
];

export const ClinicOperationStatus = () => {
  const [status, setStatus] = useState<ClinicOpStatus>("low");
  const { toast } = useToast();

  useEffect(() => {
    setStatus(getClinicOperationStatus());
  }, []);

  const update = (next: ClinicOpStatus) => {
    setStatus(next);
    localStorage.setItem(STORAGE_KEY, next);
    const label = OPTIONS.find((o) => o.id === next)?.label;
    toast({ title: "Clinic status updated", description: `Patients will now see: ${label}` });
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Clinic Operation Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shown to patients on the ClynicQ clinic page. Update anytime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((opt) => {
            const active = status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update(opt.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                  active
                    ? `${opt.bg} ${opt.text} border-transparent ring-2 ${opt.ring}`
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
