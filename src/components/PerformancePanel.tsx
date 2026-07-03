import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MessageCircle,
  CalendarCheck,
  Users,
  Network,
  CreditCard,
  Download,
} from "lucide-react";

type Range = "7" | "30" | "90";

type SourceCategory =
  | "ClynicQ Search & Browse"
  | "QR Codes"
  | "ClynicQ Ecosystem"
  | "Partner / Campaign"
  | "Direct / Other";

interface ProviderCapabilities {
  whatsapp: boolean;
  booking: boolean;
  queue: boolean;
}

interface Metrics {
  profileVisits: number;
  whatsappClicks: number;
  bookingClicks: number;
  queueJoins: number;
  callClicks: number;
  ecosystemLeads: number;
  sources: { label: SourceCategory; count: number }[];
}

const EMPTY: Metrics = {
  profileVisits: 0,
  whatsappClicks: 0,
  bookingClicks: 0,
  queueJoins: 0,
  callClicks: 0,
  ecosystemLeads: 0,
  sources: [],
};

// Frontend hook — swap to real tracking events later.
// Returns empty by default so no fake data is shown in production.
const useMetrics = (_range: Range): Metrics => EMPTY;

// Provider capability flags — swap to real provider config later.
const useCapabilities = (): ProviderCapabilities => ({
  whatsapp: true,
  booking: true,
  queue: true,
});

const RangeButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Button size="sm" variant={active ? "default" : "outline"} onClick={onClick}>
    {children}
  </Button>
);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
}) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
    <div className="mt-2 text-3xl font-semibold text-foreground">{value}</div>
    <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
  </Card>
);

const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SOURCE_ORDER: SourceCategory[] = [
  "ClynicQ Search & Browse",
  "QR Codes",
  "ClynicQ Ecosystem",
  "Partner / Campaign",
  "Direct / Other",
];

const rangeLabel = (r: Range) =>
  r === "7" ? "Last 7 Days" : r === "30" ? "Last 30 Days" : "Last 90 Days";

const toReportCsv = (m: Metrics, caps: ProviderCapabilities, range: Range) => {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: string[] = [];
  lines.push([esc("ClynicQ Performance Report"), esc(rangeLabel(range))].join(","));
  lines.push("");
  lines.push(esc("Performance Summary"));
  lines.push([esc("Metric"), esc("Value")].join(","));
  lines.push([esc("Profile Visits"), esc(m.profileVisits)].join(","));
  if (caps.whatsapp) lines.push([esc("WhatsApp Clicks"), esc(m.whatsappClicks)].join(","));
  if (caps.booking) lines.push([esc("Booking Clicks"), esc(m.bookingClicks)].join(","));
  if (caps.queue) lines.push([esc("Queue Joins"), esc(m.queueJoins)].join(","));
  if (caps.call) lines.push([esc("Call Clicks"), esc(m.callClicks)].join(","));
  lines.push([esc("Ecosystem Leads"), esc(m.ecosystemLeads)].join(","));
  lines.push("");
  lines.push(esc("How Patients Found You"));
  lines.push([esc("Source"), esc("Count")].join(","));
  const sourceMap = new Map(m.sources.map((s) => [s.label, s.count]));
  for (const label of SOURCE_ORDER) {
    lines.push([esc(label), esc(sourceMap.get(label) ?? 0)].join(","));
  }
  return lines.join("\n");
};

export const PerformancePanel = () => {
  const [range, setRange] = useState<Range>("30");
  const m = useMetrics(range);
  const caps = useCapabilities();

  const hasSources = m.sources.length > 0;
  const sourceMax = Math.max(1, ...m.sources.map((s) => s.count));

  const handleDownload = () => {
    const csv = toReportCsv(m, caps, range);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `clynicq-performance-report-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Performance</h2>
          <p className="text-sm text-muted-foreground">
            See how patients discover and connect with your clinic through ClynicQ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RangeButton active={range === "7"} onClick={() => setRange("7")}>Last 7 Days</RangeButton>
          <RangeButton active={range === "30"} onClick={() => setRange("30")}>Last 30 Days</RangeButton>
          <RangeButton active={range === "90"} onClick={() => setRange("90")}>Last 90 Days</RangeButton>
          <Button size="sm" variant="secondary" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Top performance cards — reflow auto, hidden when capability disabled */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={Eye}
          label="Profile Visits"
          value={m.profileVisits}
          hint="Visits to your full ClynicQ profile"
        />
        {caps.whatsapp && (
          <MetricCard
            icon={MessageCircle}
            label="WhatsApp Clicks"
            value={m.whatsappClicks}
            hint="Taps on WhatsApp"
          />
        )}
        {caps.booking && (
          <MetricCard
            icon={CalendarCheck}
            label="Booking Clicks"
            value={m.bookingClicks}
            hint="Taps on Book"
          />
        )}
        {caps.queue && (
          <MetricCard
            icon={Users}
            label="Queue Joins"
            value={m.queueJoins}
            hint="Successful joins via ClynicQ"
          />
        )}
        {caps.call && (
          <MetricCard
            icon={Phone}
            label="Call Clicks"
            value={m.callClicks}
            hint="Taps on Call"
          />
        )}
        <MetricCard
          icon={Network}
          label="Ecosystem Leads"
          value={m.ecosystemLeads}
          hint="Patient actions from other ClynicQ providers"
        />
      </div>

      {/* How Patients Found You */}
      <Card className="p-5">
        <h3 className="mb-4 text-lg font-semibold text-foreground">How Patients Found You</h3>
        {hasSources ? (
          <div className="space-y-3">
            {m.sources.map((s) => (
              <Bar key={s.label} label={s.label} value={s.count} max={sourceMax} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No source data recorded yet.</p>
        )}
      </Card>
    </div>
  );
};
