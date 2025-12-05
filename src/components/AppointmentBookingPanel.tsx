import { useState } from "react";
import { format, addDays, startOfToday, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Plus, Pencil, Trash2, Clock, User, Phone, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments, Appointment, AppointmentInsert } from "@/hooks/useAppointments";
import { useDoctorProfiles } from "@/hooks/useDoctorProfiles";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "arrived", label: "Arrived", color: "bg-emerald-100 text-emerald-800" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "no-show", label: "No Show", color: "bg-orange-100 text-orange-800" },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

export const AppointmentBookingPanel = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const dateFilter = format(selectedDate, "yyyy-MM-dd");
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment } = useAppointments(dateFilter);
  const { profiles, isLoading: profilesLoading } = useDoctorProfiles();

  const [formData, setFormData] = useState<AppointmentInsert>({
    doctor_id: null,
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    appointment_date: dateFilter,
    appointment_time: "09:00",
    duration_minutes: 30,
    status: "scheduled",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      doctor_id: null,
      patient_name: "",
      patient_phone: "",
      patient_email: "",
      appointment_date: dateFilter,
      appointment_time: "09:00",
      duration_minutes: 30,
      status: "scheduled",
      notes: "",
    });
    setEditingAppointment(null);
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        doctor_id: appointment.doctor_id,
        patient_name: appointment.patient_name,
        patient_phone: appointment.patient_phone,
        patient_email: appointment.patient_email || "",
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time.slice(0, 5),
        duration_minutes: appointment.duration_minutes,
        status: appointment.status,
        notes: appointment.notes || "",
      });
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, appointment_date: dateFilter }));
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_name || !formData.patient_phone || !formData.appointment_date || !formData.appointment_time) {
      return;
    }

    const payload = {
      ...formData,
      doctor_id: formData.doctor_id || null,
      patient_email: formData.patient_email || null,
      notes: formData.notes || null,
    };

    if (editingAppointment) {
      await updateAppointment.mutateAsync({ id: editingAppointment.id, updates: payload });
    } else {
      await createAppointment.mutateAsync(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleStatusChange = async (id: string, status: Appointment["status"]) => {
    await updateAppointment.mutateAsync({ id, updates: { status } });
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option ? (
      <Badge className={cn("font-medium", option.color)}>{option.label}</Badge>
    ) : null;
  };

  // Get appointments count for calendar highlighting
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter((a) => a.appointment_date === dateStr).length;
  };

  if (isLoading || profilesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Skeleton className="h-80" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Appointment Booking</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, patient_name: e.target.value }))}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient_phone">Phone *</Label>
                  <Input
                    id="patient_phone"
                    value={formData.patient_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, patient_phone: e.target.value }))}
                    placeholder="+65 9xxx xxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_email">Email (optional)</Label>
                <Input
                  id="patient_email"
                  type="email"
                  value={formData.patient_email || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, patient_email: e.target.value }))}
                  placeholder="patient@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_id">Doctor</Label>
                <Select
                  value={formData.doctor_id || "none"}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, doctor_id: v === "none" ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any available doctor</SelectItem>
                    {profiles.filter((p) => p.is_active).map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} {doc.specialization ? `(${doc.specialization})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.appointment_date
                          ? format(parseISO(formData.appointment_date), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.appointment_date ? parseISO(formData.appointment_date) : undefined}
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            appointment_date: date ? format(date, "yyyy-MM-dd") : "",
                          }))
                        }
                        disabled={(date) => date < startOfToday()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Time *</Label>
                  <Input
                    id="appointment_time"
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={String(formData.duration_minutes)}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, duration_minutes: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingAppointment && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as Appointment["status"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppointment.isPending || updateAppointment.isPending}>
                  {editingAppointment ? "Update" : "Book"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Calendar Sidebar */}
        <Card className="shadow-md h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Appointments for {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments for this date.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book First Appointment
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{appt.appointment_time.slice(0, 5)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({appt.duration_minutes}m)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appt.patient_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appt.patient_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appt.doctor ? (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {appt.doctor.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Any doctor</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appt.status}
                          onValueChange={(v) => handleStatusChange(appt.id, v as Appointment["status"])}
                        >
                          <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue>{getStatusBadge(appt.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <Badge className={cn("font-medium", opt.color)}>{opt.label}</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(appt)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(appt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
