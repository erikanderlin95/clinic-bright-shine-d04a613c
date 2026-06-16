import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Calendar, Clock, User, Eye, CalendarDays, List, ChevronDown } from "lucide-react";
import { useDoctorShifts, DoctorShift } from "@/hooks/useDoctorShifts";
import { useDoctorProfiles } from "@/hooks/useDoctorProfiles";
import { WeeklyCalendarView } from "./WeeklyCalendarView";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SERVICE_TYPES = [
  "General Consultation",
  "Specialist Consultation",
  "Follow-up",
  "Vaccination",
  "Health Screening",
];

// Transform DB shift to calendar format
const transformShiftForCalendar = (shift: DoctorShift) => ({
  id: shift.id,
  doctorNames: shift.doctors.map((d) => d.name),
  dayOfWeek: shift.day_of_week,
  startTime: shift.start_time.slice(0, 5), // "HH:MM:SS" -> "HH:MM"
  endTime: shift.end_time.slice(0, 5),
  serviceType: shift.service_type || undefined,
});

export const DoctorSchedulePanel = () => {
  const { shifts, isLoading: shiftsLoading, createShift, updateShift, deleteShift, moveShift } = useDoctorShifts();
  const { profiles, isLoading: profilesLoading } = useDoctorProfiles();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    serviceType: "",
  });

  const isLoading = shiftsLoading || profilesLoading;

  const resetForm = () => {
    setFormData({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      serviceType: "",
    });
    setSelectedDoctorIds([]);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDoctorIds.length === 0 || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      return;
    }

    if (formData.startTime >= formData.endTime) {
      return;
    }

    const payload = {
      day_of_week: formData.dayOfWeek,
      start_time: formData.startTime,
      end_time: formData.endTime,
      service_type: formData.serviceType || null,
      doctor_ids: selectedDoctorIds,
    };

    if (editingId) {
      await updateShift.mutateAsync({ id: editingId, data: payload });
    } else {
      await createShift.mutateAsync(payload);
    }

    resetForm();
  };

  const handleEdit = (shift: DoctorShift) => {
    setFormData({
      dayOfWeek: shift.day_of_week,
      startTime: shift.start_time.slice(0, 5),
      endTime: shift.end_time.slice(0, 5),
      serviceType: shift.service_type || "",
    });
    setSelectedDoctorIds(shift.doctors.map((d) => d.id));
    setEditingId(shift.id);
  };

  const handleDelete = async (id: string) => {
    await deleteShift.mutateAsync(id);
  };

  const handleShiftMove = async (shiftId: string, newDay: string) => {
    await moveShift.mutateAsync({ id: shiftId, day_of_week: newDay });
  };

  const handleCalendarShiftClick = (calShift: any) => {
    const dbShift = shifts.find((s) => s.id === calShift.id);
    if (dbShift) handleEdit(dbShift);
  };

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  // Get today's shifts for marketplace preview
  const getTodayShifts = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return shifts.filter((shift) => shift.day_of_week === today);
  };

  const getNextAvailability = () => {
    const today = new Date();
    const todayIndex = today.getDay();
    const dayIndexMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    };

    let nextShift: DoctorShift | null = null;
    let minDaysAway = 8;

    shifts.forEach((shift) => {
      const shiftDayIndex = dayIndexMap[shift.day_of_week];
      let daysAway = shiftDayIndex - todayIndex;
      if (daysAway <= 0) daysAway += 7;

      if (daysAway < minDaysAway) {
        minDaysAway = daysAway;
        nextShift = shift;
      }
    });

    return nextShift;
  };

  const todayShifts = getTodayShifts();
  const nextShift = todayShifts.length === 0 ? getNextAvailability() : null;

  const getTodayDoctorsDisplay = () => {
    if (todayShifts.length === 0) return [];
    
    const doctorTimeMap: Record<string, string[]> = {};
    
    todayShifts.forEach((shift) => {
      const timeSlot = `${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`;
      shift.doctors.forEach((doc) => {
        if (!doctorTimeMap[doc.name]) {
          doctorTimeMap[doc.name] = [];
        }
        if (!doctorTimeMap[doc.name].includes(timeSlot)) {
          doctorTimeMap[doc.name].push(timeSlot);
        }
      });
    });

    return Object.entries(doctorTimeMap).map(([name, times]) => ({
      name,
      times: times.join(", "),
    }));
  };

  const todayDoctors = getTodayDoctorsDisplay();

  // Transform shifts for calendar view
  const calendarShifts = shifts.map(transformShiftForCalendar);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-foreground">Doctor Schedule</h2>
      </div>

      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              {editingId ? "Edit Shift" : "Add Doctor Shift"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Doctor Multi-Select */}
                <div className="space-y-2 lg:col-span-2">
                  <Label>Doctors *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {selectedDoctorIds.length === 0 ? (
                          <span className="text-muted-foreground">Select doctors...</span>
                        ) : (
                          <span className="truncate">
                            {selectedDoctorIds.length} doctor(s) selected
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2" align="start">
                      {profiles.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">
                          No doctors found. Add profiles in the Doctor Profiles section first.
                        </p>
                      ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {profiles.map((doc) => (
                            <label
                              key={doc.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedDoctorIds.includes(doc.id)}
                                onCheckedChange={() => toggleDoctor(doc.id)}
                              />
                              <div>
                                <span className="text-sm font-medium">{doc.name}</span>
                                {doc.specialization && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({doc.specialization})
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  {selectedDoctorIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedDoctorIds.map((id) => {
                        const doc = profiles.find((p) => p.id === id);
                        return doc ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {doc.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of Week *</Label>
                  <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData((prev) => ({ ...prev, dayOfWeek: v }))}>
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(v) => setFormData((prev) => ({ ...prev, serviceType: v }))}>
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="gap-2" disabled={createShift.isPending || updateShift.isPending}>
                  <Plus className="h-4 w-4" />
                  {editingId ? "Update Shift" : "Add Shift"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Schedule List Table */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Doctor Shifts ({shifts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shifts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No shifts scheduled. Add a shift above to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctors</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shifts.map((shift) => (
                      <TableRow key={shift.id}>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {shift.doctors.map((doc) => (
                              <Badge key={doc.id} variant="outline" className="font-medium">{doc.name}</Badge>
                            ))}
                            {shift.doctors.length === 0 && (
                              <span className="text-muted-foreground text-sm">No doctors assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{shift.day_of_week}</TableCell>
                        <TableCell>{shift.start_time.slice(0, 5)}</TableCell>
                        <TableCell>{shift.end_time.slice(0, 5)}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{shift.service_type || "—"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(shift)} className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(shift.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Marketplace Display Preview */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Marketplace Display Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              How it appears on your public clinic card
            </p>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  {todayDoctors.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">On Shift Today</p>
                      <div className="mt-1 space-y-0.5">
                        {todayDoctors.map((doc) => (
                          <p key={doc.name} className="text-sm text-muted-foreground">
                            {doc.name} ({doc.times})
                          </p>
                        ))}
                      </div>
                    </>
                  ) : nextShift ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">Next Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {nextShift.day_of_week.slice(0, 3)} {nextShift.start_time.slice(0, 5)}–{nextShift.end_time.slice(0, 5)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nextShift.doctors.map((d) => d.name).join(", ") || "No doctors assigned"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">Doctor Schedule</p>
                      <p className="text-sm text-muted-foreground">No shifts scheduled</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
