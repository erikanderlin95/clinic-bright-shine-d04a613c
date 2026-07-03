import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, CalendarCheck, Users, Network } from "lucide-react";

type Range = "7" | "30" | "90";

interface Metrics {
  profileViews: number;
  whatsappClicks: number;
  bookingClicks: number;
  queueJoins: number;
  ecosystemDiscovery: number;
  sources: { label: string; count: number }[];
  ecosystemProviders: { label: string; count: number }[];
  ecosystemActions: { whatsapp: number; booking: number };
}

const EMPTY: Metrics = {
  profileViews: 0,
  whatsappClicks: 0,
  bookingClicks: 0,
  queueJoins: 0,
  ecosystemDiscovery: 0,
  sources: [],
  ecosystemProviders: [],
  ecosystemActions: { whatsapp: 0, booking: 0 },
};

// Frontend hook — swap to real tracking events later.
// Returns empty by default so no fake data is shown.
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

export const PerformancePanel = () => {
  const [range, setRange] = useState<Range>("30");
  const m = useMetrics(range);

  const actionsMax = Math.max(m.whatsappClicks, m.bookingClicks, m.queueJoins, 1);
  const hasActions = m.whatsappClicks + m.bookingClicks + m.queueJoins > 0;
  const hasSources = m.sources.length > 0;
  

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Performance</h2>
          <p className="text-sm text-muted-foreground">
            Trackable ClynicQ activity for your clinic profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RangeButton active={range === "7"} onClick={() => setRange("7")}>Last 7 Days</RangeButton>
          <RangeButton active={range === "30"} onClick={() => setRange("30")}>Last 30 Days</RangeButton>
          <RangeButton active={range === "90"} onClick={() => setRange("90")}>Last 90 Days</RangeButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={Eye} label="Profile Views" value={m.profileViews} hint="Views of your ClynicQ profile" />
        <MetricCard icon={MessageCircle} label="WhatsApp Clicks" value={m.whatsappClicks} hint="Taps on WhatsApp CTA" />
        <MetricCard icon={CalendarCheck} label="Booking Clicks" value={m.bookingClicks} hint="Taps on Book CTA" />
        <MetricCard icon={Users} label="Queue Joins" value={m.queueJoins} hint="Successful joins via ClynicQ" />
        <MetricCard icon={Network} label="Ecosystem Discovery" value={m.ecosystemDiscovery} hint="From other ClynicQ providers" />
      </div>


      <Card className="p-5">
        <h3 className="mb-4 text-lg font-semibold text-foreground">How Patients Found You</h3>
        {hasSources ? (
          <ul className="divide-y divide-border">
            {m.sources.map((s) => (
              <li key={s.label} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{s.label}</span>
                <span className="text-muted-foreground">{s.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No source data recorded yet.</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Tracked sources: ClynicQ Search, Direct Profile Visit, QR Code, Another ClynicQ Provider, Partner / Campaign Link, Other.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground">Ecosystem Discovery</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Automatic — no confirmation required. Not a confirmed referral or completed visit.
        </p>
        {hasEcosystem && (
          <div className="space-y-4">
            <div className="text-sm text-foreground">
              <span className="text-2xl font-semibold">{m.ecosystemDiscovery}</span>{" "}
              users discovered your profile from another ClynicQ provider
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">Source breakdown</div>
              <ul className="divide-y divide-border">
                {m.ecosystemProviders.map((p) => (
                  <li key={p.label} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-foreground">{p.label}</span>
                    <span className="text-muted-foreground">{p.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">Resulting actions</div>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <span>{m.ecosystemActions.whatsapp} WhatsApp Clicks</span>
                <span>•</span>
                <span>{m.ecosystemActions.booking} Booking Clicks</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
