import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";
import type { BookingLead } from "@/types/queue";
import { useI18n } from "@/hooks/useI18n";

interface BookingRequestsPanelProps {
  requests: BookingLead[];
}

export const BookingRequestsPanel = ({ requests }: BookingRequestsPanelProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("bookingRequestsTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("bookingRequestsDesc")}</p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("caseId")}</TableHead>
              <TableHead>{t("patientName")}</TableHead>
              <TableHead className="w-[140px]">{t("mobile")}</TableHead>
              <TableHead>{t("preferredDateTime")}</TableHead>
              <TableHead className="w-[100px]">{t("source")}</TableHead>
              <TableHead className="w-[150px]">{t("timestamp")}</TableHead>
              <TableHead className="w-[80px]">{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {t("noBookingRequests")}
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs">{req.caseId}</TableCell>
                  <TableCell className="font-medium">{req.patientName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {req.mobile}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{req.preferredDateTime || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{req.source}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{req.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      {t("new")}
                    </Badge>
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
