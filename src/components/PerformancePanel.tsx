import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MessageCircle,
  CalendarCheck,
  Users,
  Network,
  Download,
  Phone,
} from "lucide-react";

type Range = "7" | "30" | "90";

type SourceCategory =
  | "ClynicQ Search & Browse"
  | "QR Codes"
  | "ClynicQ Ecosystem"
  | "Partner & Campaign Links"
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
  sourceName: string; // e.g. "ClynicQ Search" or "Harmony TCM Centre"
  destination: string; // clinic/provider name
  channel: Channel;
}

interface EcosystemProvider {
  name: string;
  actions: number;
  whatsapp: number;
  booking: number;
  call: number;
  queue: number;
}

interface Metrics {
  profileVisits: number;
  whatsappClicks: number;
  bookingClicks: number;
  queueJoins: number;
  ecosystemLeads: number;
  sources: { label: SourceCategory; count: number }[];
  ecosystemProviders: EcosystemProvider[];
  activity: ActivityEvent[];
}

const EMPTY: Metrics = {
  profileVisits: 0,
  whatsappClicks: 0,
  bookingClicks: 0,
  queueJoins: 0,
  ecosystemLeads: 0,
  sources: [],
  ecosystemProviders: [],
  activity: [],
};

// Frontend hook — swap to real tracking events later.
// Returns empty by default so no fake data is shown in production.
const useMetrics = (_range: Range): Metrics => EMPTY;

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

const ACTIVITY_FILTERS: { key: string; label: string; match: (t: ActivityType) => boolean }[] = [
  { key: "all", label: "All Activity", match: () => true },
  { key: "profile", label: "Profile Visits", match: (t) => t === "Profile Visit" },
  { key: "whatsapp", label: "WhatsApp", match: (t) => t === "WhatsApp Click" },
  { key: "booking", label: "Booking", match: (t) => t === "Booking Click" },
  { key: "call", label: "Calls", match: (t) => t === "Call Click" },
  { key: "queue", label: "Queue Joins", match: (t) => t === "Queue Join" },
  { key: "ecosystem", label: "Ecosystem Leads", match: (t) => t === "Ecosystem Lead" },
];

const PAGE_SIZE = 10;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

export const PerformancePanel = () => {
  const [range, setRange] = useState<Range>("30");
  const m = useMetrics(range);

  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const hasSources = m.sources.length > 0;
  const sourceMax = Math.max(1, ...m.sources.map((s) => s.count));
  const hasEcosystem = m.ecosystemProviders.length > 0;

  const filteredActivity = useMemo(() => {
    const af = ACTIVITY_FILTERS.find((f) => f.key === activityFilter) ?? ACTIVITY_FILTERS[0];
    return m.activity.filter(
      (e) => af.match(e.activityType) && (sourceFilter === "all" || e.sourceCategory === sourceFilter),
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

      {/* Top performance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          icon={Eye}
          label="Profile Visits"
          value={m.profileVisits}
          hint="Visits to your full ClynicQ profile"
        />
        <MetricCard
          icon={MessageCircle}
          label="WhatsApp Clicks"
          value={m.whatsappClicks}
          hint="Taps on WhatsApp"
        />
        <MetricCard
          icon={CalendarCheck}
          label="Booking Clicks"
          value={m.bookingClicks}
          hint="Taps on Book"
        />
        <MetricCard
          icon={Users}
          label="Queue Joins"
          value={m.queueJoins}
          hint="Successful joins via ClynicQ"
        />
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

      {/* Ecosystem Activity */}
      <Card className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground">Ecosystem Activity</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Automatic — meaningful patient actions from other ClynicQ providers. Not confirmed referrals.
        </p>
        {hasEcosystem ? (
          <>
            <p className="mb-3 text-sm text-foreground">
              {m.ecosystemLeads} patient action{m.ecosystemLeads === 1 ? "" : "s"} came from other ClynicQ providers
            </p>
            <ul className="divide-y divide-border">
              {m.ecosystemProviders.map((p) => {
                const parts: string[] = [];
                if (p.whatsapp) parts.push(`${p.whatsapp} WhatsApp`);
                if (p.booking) parts.push(`${p.booking} Booking`);
                if (p.call) parts.push(`${p.call} Call`);
                if (p.queue) parts.push(`${p.queue} Queue Join`);
                return (
                  <li key={p.name} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.actions} patient action{p.actions === 1 ? "" : "s"}
                      </span>
                    </div>
                    {parts.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">{parts.join(" | ")}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No ecosystem activity recorded yet.</p>
        )}
      </Card>

      {/* Activity Log */}
      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Source filter"
            >
              <option value="all">All Sources</option>
              <option value="ClynicQ Search & Browse">ClynicQ Search & Browse</option>
              <option value="QR Codes">QR Codes</option>
              <option value="ClynicQ Ecosystem">ClynicQ Ecosystem</option>
              <option value="Partner & Campaign Links">Partner & Campaign Links</option>
              <option value="Direct / Other">Direct / Other</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={activityFilter === f.key ? "default" : "outline"}
              onClick={() => {
                setActivityFilter(f.key);
                setPage(1);
              }}
            >
              {f.label}
            </Button>
          ))}
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

      {/* Silence unused-import warning for Phone icon reserved for future Call CTA */}
      <span className="hidden">
        <Phone />
      </span>
    </div>
  );
};
