import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Phone, MessageSquare } from "lucide-react";
import type { BookingLead, LeadStatus } from "@/types/queue";

interface BookingLeadsPanelProps {
  leads: BookingLead[];
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  contacted: { label: "Contacted", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  booked: { label: "Booked", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
};

export const BookingLeadsPanel = ({ leads, onUpdateStatus }: BookingLeadsPanelProps) => {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [filterDate, setFilterDate] = useState("");

  const filtered = leads.filter((lead) => {
    if (filterStatus !== "all" && lead.status !== filterStatus) return false;
    if (filterDate && !lead.timestamp.startsWith(filterDate)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Booking Leads</h2>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-[160px] h-9"
          />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LeadStatus | "all")}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Case ID</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead className="w-[140px]">Mobile</TableHead>
              <TableHead>Preferred Date/Time</TableHead>
              <TableHead className="w-[100px]">Source</TableHead>
              <TableHead className="w-[140px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No booking leads found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-mono text-xs">{lead.caseId}</TableCell>
                  <TableCell className="font-medium">{lead.patientName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {lead.mobile}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {lead.preferredDateTime || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[lead.status].className}>
                      {statusConfig[lead.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {lead.status === "new" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdateStatus(lead.id, "contacted")}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contacted
                        </Button>
                      )}
                      {(lead.status === "new" || lead.status === "contacted") && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdateStatus(lead.id, "booked")}>
                          Booked
                        </Button>
                      )}
                      {lead.status !== "closed" && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => onUpdateStatus(lead.id, "closed")}>
                          Close
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
