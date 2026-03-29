import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export interface AudiencePatient {
  id: string;
  name: string;
  mobile: string;
  queueNumber?: string;
  patientsAhead?: number;
  status?: string;
  lastVisitDate?: string;
}

interface BroadcastAudienceTableProps {
  patients: AudiencePatient[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  variant: "active-queue" | "recent-customers";
}

const maskMobile = (mobile: string): string => {
  if (mobile.length < 8) return mobile;
  const last4 = mobile.slice(-4);
  const prefix = mobile.slice(0, mobile.length - 8);
  return `${prefix}****${last4}`;
};

export const BroadcastAudienceTable = ({
  patients,
  selectedIds,
  onSelectionChange,
  variant,
}: BroadcastAudienceTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [maxAhead, setMaxAhead] = useState<string>("");

  const filteredPatients = useMemo(() => {
    let result = patients;

    if (variant === "active-queue") {
      if (statusFilter !== "all") {
        result = result.filter((p) => p.status?.toLowerCase() === statusFilter);
      }
      if (maxAhead && !isNaN(Number(maxAhead))) {
        result = result.filter((p) => (p.patientsAhead ?? 0) <= Number(maxAhead));
      }
    }

    return result;
  }, [patients, statusFilter, maxAhead, variant]);

  const allFilteredSelected = filteredPatients.length > 0 && filteredPatients.every((p) => selectedIds.has(p.id));

  const handleSelectAll = (checked: boolean) => {
    const newSet = new Set(selectedIds);
    filteredPatients.forEach((p) => {
      if (checked) {
        newSet.add(p.id);
      } else {
        newSet.delete(p.id);
      }
    });
    onSelectionChange(newSet);
  };

  const handleToggle = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    onSelectionChange(newSet);
  };

  return (
    <div className="space-y-3">
      {variant === "active-queue" && (
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="waiting">Waiting Only</SelectItem>
              <SelectItem value="arrived">Arrived Only</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Patients ahead ≤</span>
            <Input
              type="number"
              min={0}
              value={maxAhead}
              onChange={(e) => setMaxAhead(e.target.value)}
              className="w-[70px] h-8 text-xs"
              placeholder="—"
            />
          </div>
        </div>
      )}

      <div className="border rounded-md max-h-[240px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Mobile</TableHead>
              {variant === "active-queue" && (
                <>
                  <TableHead className="text-xs">Queue #</TableHead>
                  <TableHead className="text-xs">Ahead</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </>
              )}
              {variant === "recent-customers" && (
                <TableHead className="text-xs">Last Visit</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={variant === "active-queue" ? 6 : 4} className="text-center text-sm text-muted-foreground py-6">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(patient.id)}
                      onCheckedChange={(checked) => handleToggle(patient.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="text-xs font-medium">{patient.name || "—"}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{maskMobile(patient.mobile)}</TableCell>
                  {variant === "active-queue" && (
                    <>
                      <TableCell className="text-xs">{patient.queueNumber || "—"}</TableCell>
                      <TableCell className="text-xs">{patient.patientsAhead ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={patient.status === "arrived" ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {patient.status === "arrived" ? "Arrived" : "Waiting"}
                        </Badge>
                      </TableCell>
                    </>
                  )}
                  {variant === "recent-customers" && (
                    <TableCell className="text-xs text-muted-foreground">{patient.lastVisitDate || "—"}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedIds.size} of {filteredPatients.length} selected
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>Patient list is based on live clinic queue and recent visit records. No medical data is accessed.</span>
        </div>
      </div>
    </div>
  );
};
