import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  CreditCard,
  MessageCircle,
  CalendarCheck,
  Users,
  Network,
  Download,
} from "lucide-react";

type Range = "7" | "30" | "90";

type SourceCategory =
  | "ClynicQ Search & Browse"
  | "QR Codes"
  | "ClynicQ Ecosystem"
  | "Partner / Campaign"
  | "Direct / Other";

type ActivityType =
  | "Profile Visit"
  | "WhatsApp Click"
  | "Booking Click"
  | "Call Click"
  | "Queue Join"
  | "Ecosystem Lead";

type Channel = "Profile" | "WhatsApp" | "Booking" | "Call" | "Queue";

interface ActivityEvent {
  eventId: string;
  timestamp: string; // ISO
  activityType: ActivityType;
  sourceCategory: SourceCategory;
  sourceName: string;
  destination: string;
  channel: Channel;
}

interface ProviderCapabilities {
  whatsapp: boolean;
  booking: boolean;
  queue: boolean;
}

interface Metrics {
  clinicCardImpressions: number;
  profileVisits: number;
  whatsappClicks: number;
  bookingClicks: number;
  queueJoins: number;
  ecosystemLeads: number;
  sources: { label: SourceCategory; count: number }[];
  activity: ActivityEvent[];
}

const EMPTY: Metrics = {
  clinicCardImpressions: 0,
  profileVisits: 0,
  whatsappClicks: 0,
  bookingClicks: 0,
  queueJoins: 0,
  ecosystemLeads: 0,
  sources: [],
  activity: [],
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

const ACTIVITY_TYPE_OPTIONS: { value: string; label: string; match: (t: ActivityType) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "profile", label: "Profile Visits", match: (t) => t === "Profile Visit" },
  { value: "whatsapp", label: "WhatsApp", match: (t) => t === "WhatsApp Click" },
  { value: "booking", label: "Booking", match: (t) => t === "Booking Click" },
  { value: "call", label: "Calls", match: (t) => t === "Call Click" },
  { value: "queue", label: "Queue Joins", match: (t) => t === "Queue Join" },
  { value: "ecosystem", label: "Ecosystem Leads", match: (t) => t === "Ecosystem Lead" },
];

const SOURCE_OPTIONS: SourceCategory[] = [
  "ClynicQ Search & Browse",
  "QR Codes",
  "ClynicQ Ecosystem",
  "Partner / Campaign",
  "Direct / Other",
];

const PAGE_SIZE = 10;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const toCsv = (rows: ActivityEvent[]) => {
  const header = [
    "Date",
    "Time",
    "Activity Type",
    "Source Category",
    "Source Name",
    "Destination Provider",
    "Channel",
    "Anonymous Reference ID",
  ];
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [
      fmtDate(r.timestamp),
      fmtTime(r.timestamp),
      r.activityType,
      r.sourceCategory,
      r.sourceName,
      r.destination,
      r.channel,
      r.eventId,
    ]
      .map(esc)
      .join(","),
  );
  return [header.map(esc).join(","), ...body].join("\n");
};

const selectClass =
  "rounded-md border border-input bg-background px-2 py-1 text-sm";

export const PerformancePanel = () => {
  const [range, setRange] = useState<Range>("30");
  const m = useMetrics(range);
  const caps = useCapabilities();

  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const hasSources = m.sources.length > 0;
  const sourceMax = Math.max(1, ...m.sources.map((s) => s.count));

  const filteredActivity = useMemo(() => {
    const af =
      ACTIVITY_TYPE_OPTIONS.find((f) => f.value === activityFilter) ?? ACTIVITY_TYPE_OPTIONS[0];
    return m.activity.filter(
      (e) =>
        af.match(e.activityType) &&
        (sourceFilter === "all" || e.sourceCategory === sourceFilter),
    );
  }, [m.activity, activityFilter, sourceFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredActivity.length / PAGE_SIZE));
  const pagedActivity = filteredActivity.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDownload = () => {
    const csv = toCsv(filteredActivity);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `clynicq-performance-records-${today}.csv`;
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
            Download Records
          </Button>
        </div>
      </div>

      {/* Top performance cards — reflow auto, hidden when capability disabled */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          icon={CreditCard}
          label="Clinic Card Impressions"
          value={m.clinicCardImpressions}
          hint="Times your clinic card was displayed"
        />
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

      {/* Activity Log */}
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              Activity Type
              <select
                className={selectClass}
                value={activityFilter}
                onChange={(e) => {
                  setActivityFilter(e.target.value);
                  setPage(1);
                }}
              >
                {ACTIVITY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              Source
              <select
                className={selectClass}
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All</option>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded for this period.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2">Date & Time</th>
                    <th className="px-2 py-2">Activity Type</th>
                    <th className="px-2 py-2">Source</th>
                    <th className="px-2 py-2">Destination</th>
                    <th className="px-2 py-2">Channel</th>
                    <th className="px-2 py-2">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pagedActivity.map((e) => (
                    <tr key={e.eventId}>
                      <td className="px-2 py-2 text-foreground">
                        {fmtDate(e.timestamp)}, {fmtTime(e.timestamp)}
                      </td>
                      <td className="px-2 py-2 text-foreground">{e.activityType}</td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {e.sourceCategory}
                        {e.sourceName && e.sourceName !== e.sourceCategory ? ` · ${e.sourceName}` : ""}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">{e.destination}</td>
                      <td className="px-2 py-2 text-muted-foreground">{e.channel}</td>
                      <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{e.eventId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
