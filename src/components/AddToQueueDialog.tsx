import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import { ScanLine, QrCode } from "lucide-react";
import type { VisitCategory } from "@/types/queue";

interface AddToQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToQueue: (data: {
    name?: string;
    mobile: string;
    email?: string;
    queueSource: "Walk-in" | "Phone Booking" | "Other";
    notes?: string;
    visitCategory?: VisitCategory;
  }) => void;
}

export const AddToQueueDialog = ({ open, onOpenChange, onAddToQueue }: AddToQueueDialogProps) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [queueSource, setQueueSource] = useState<"Walk-in" | "Phone Booking" | "Other">("Walk-in");
  const [notes, setNotes] = useState("");
  const [visitCategory, setVisitCategory] = useState<VisitCategory | "">("Consultation");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobile.trim()) {
      toast({ title: t("mobileRequired"), description: t("pleaseEnterMobile"), variant: "destructive" });
      return;
    }

    onAddToQueue({
      name: name.trim() || undefined,
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      queueSource,
      notes: notes.trim() || undefined,
      visitCategory: visitCategory || undefined,
    });

    setName(""); setMobile(""); setEmail(""); setQueueSource("Walk-in"); setNotes(""); setVisitCategory("Consultation");
    onOpenChange(false);

    toast({ title: t("addedToQueue"), description: t("patientAddedToQueue") });
  };

  const handleScanNRIC = () => {
    toast({ title: t("scanNRIC"), description: t("scanNRICDesc") });
  };

  const handleScanSingpass = () => {
    toast({ title: t("scanSingpass"), description: t("scanSingpassDesc") });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addToQueueTitle")}</DialogTitle>
          <DialogDescription>{t("addToQueueDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1 gap-2" onClick={handleScanNRIC}>
            <ScanLine className="h-4 w-4" />
            {t("scanNRIC")}
          </Button>
          <Button type="button" variant="outline" className="flex-1 gap-2" onClick={handleScanSingpass}>
            <QrCode className="h-4 w-4" />
            {t("scanSingpass")}
          </Button>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 border-t border-border" />
          <span>{t("orManualEntry")}</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("nameOptional")}</Label>
            <Input id="name" placeholder={t("enterPatientName")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">{t("mobileNumber")} <span className="text-destructive">*</span></Label>
            <Input id="mobile" type="tel" placeholder={t("enterMobile")} value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("emailOptional")}</Label>
            <Input id="email" type="email" placeholder={t("enterEmail")} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{t("queueSource")} <span className="text-destructive">*</span></Label>
            <Select value={queueSource} onValueChange={(value: "Walk-in" | "Phone Booking" | "Other") => setQueueSource(value)}>
              <SelectTrigger id="source"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Walk-in">{t("walkIn")}</SelectItem>
                <SelectItem value="Phone Booking">{t("phoneBooking")}</SelectItem>
                <SelectItem value="Other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visit-category">{t("visitCategory")}</Label>
            <Select value={visitCategory} onValueChange={(value: VisitCategory | "") => setVisitCategory(value)}>
              <SelectTrigger id="visit-category"><SelectValue placeholder={t("visitCategory")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Consultation">{t("consultation")}</SelectItem>
                <SelectItem value="Follow-up">{t("followUp")}</SelectItem>
                <SelectItem value="General Treatment">{t("generalTreatment")}</SelectItem>
                <SelectItem value="Standard Visit">{t("standardVisit")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("notesOptional")}</Label>
            <Textarea id="notes" placeholder={t("internalNotes")} value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit">{t("addToQueue")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
